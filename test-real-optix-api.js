#!/usr/bin/env node

/**
 * Optix 真实 API 测试脚本
 * 
 * 基于 Optix 官方 API 文档 (https://developer.optixapp.com/using-the-api/)
 * 使用真实的 Optix GraphQL API 进行端到端测试
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

console.log('🏢 Optix GraphQL MCP Server - 真实 API 测试');
console.log('===============================================\n');

// 配置
const CONFIG = {
  serverPath: path.join(__dirname, 'dist', 'index.js'),
  endpoint: 'https://api.optixapp.com/graphql',
  timeout: 60000, // 增加到60秒
  // 从环境变量读取认证信息
  accessToken: process.env.OPTIX_ACCESS_TOKEN,
};

/**
 * 验证 API 配置
 */
function validateConfig() {
  console.log('🔍 验证 Optix API 配置...');
  
  if (!CONFIG.accessToken) {
    console.log('❌ 缺少 Optix Access Token！');
    console.log('\n请通过以下方式之一提供 Access Token:');
    console.log('1. 环境变量:');
    console.log('   export OPTIX_ACCESS_TOKEN="your-optix-token"');
    console.log('\n2. 或者创建 .env 文件:');
    console.log('   echo "OPTIX_ACCESS_TOKEN=your-token" > .env');
    console.log('\n3. 获取 Token 的步骤:');
    console.log('   a. 登录 Optix 管理后台');
    console.log('   b. 转到 "Develop → your app" 页面');
    console.log('   c. 复制 Organization Token (以 "o" 结尾) 或 Personal Token (以 "p" 结尾)');
    console.log('\n4. 或者使用样例 token 进行只读测试:');
    console.log('   export OPTIX_ACCESS_TOKEN="sample-personal"');
    process.exit(1);
  }
  
  const tokenType = CONFIG.accessToken.endsWith('o') ? 'Organization' : 
                   CONFIG.accessToken.endsWith('p') ? 'Personal' : 
                   CONFIG.accessToken === 'sample-personal' ? 'Sample Personal' : 'Unknown';
  
  console.log(`✅ API 端点: ${CONFIG.endpoint}`);
  console.log(`✅ Token 类型: ${tokenType}`);
  console.log(`✅ Token: ${CONFIG.accessToken.slice(0, 8)}...${CONFIG.accessToken.slice(-3)}`);
  console.log('');
}

/**
 * 直接测试 Optix API 连接
 */
function testDirectApiConnection() {
  return new Promise((resolve, reject) => {
    console.log('🌐 测试直接 API 连接...');
    
  const query = `
    query TestConnection {
      me {
        user {
          user_id
          name
          email
          first_name
          last_name
          status
          created_timestamp
        }
        member {
          member_id
          user_id
          status
          is_admin
          primary_location_id
        }
        organization {
          organization_id
          name
          subdomain
          timezone
          currency
          primary_location {
            location_id
            name
            address
          }
        }
      }
    }
  `;    const postData = JSON.stringify({
      query: query.trim()
    });
    
    const options = {
      hostname: 'api.optixapp.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.errors) {
            console.log('❌ API 连接失败');
            console.log('错误详情:', JSON.stringify(response.errors, null, 2));
            reject(new Error('API 认证或权限错误'));
          } else if (response.data) {
            console.log('✅ API 连接成功');
            
            if (response.data.me && response.data.me.user) {
              const user = response.data.me.user;
              console.log(`👤 当前用户: ${user.name} (${user.email})`);
              console.log(`🆔 用户 ID: ${user.user_id}`);
            } else {
              console.log('📊 API 响应正常，但可能是组织 token');
            }
            
            resolve(response.data);
          } else {
            console.log('⚠️ 意外的 API 响应格式');
            console.log('响应:', data);
            resolve(null);
          }
        } catch (e) {
          console.log('❌ API 响应解析失败');
          console.log('原始响应:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ 网络连接失败');
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * 获取并保存真实的 Optix Schema
 */
function introspectOptixSchema() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 获取 Optix GraphQL Schema...');
    
    const server = spawn('node', [CONFIG.serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ENDPOINT: CONFIG.endpoint,
        HEADERS: JSON.stringify({
          "Authorization": `Bearer ${CONFIG.accessToken}`
        })
      }
    });

    let schemaResult = null;
    
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.id === 1 && parsed.result) {
            schemaResult = parsed.result;
            console.log('✅ Schema 内省成功');
          }
          
        } catch (e) {
          // 忽略非JSON输出
        }
      });
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Optix business tools enabled')) {
        console.log('🎯 Optix 业务工具已自动启用');
      }
    });

    server.on('close', () => {
      if (schemaResult && schemaResult.content) {
        const schemaContent = schemaResult.content[0].text;
        
        // 保存完整的 schema
        fs.writeFileSync('optix-real-schema.graphql', schemaContent);
        console.log('💾 真实 Schema 已保存到: optix-real-schema.graphql');
        
        analyzeOptixSchema(schemaContent);
        resolve(schemaContent);
      } else {
        console.log('❌ Schema 内省失败');
        reject(new Error('未能获取 Schema'));
      }
    });

    setTimeout(() => {
      server.kill();
      if (!schemaResult) {
        reject(new Error('Schema 内省超时'));
      }
    }, CONFIG.timeout);

    // 发送内省请求
    setTimeout(() => {
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'introspect-schema',
          arguments: {}
        }
      }) + '\n';
      
      server.stdin.write(initMessage);
    }, 5000); // 增加启动等待时间
  });
}

/**
 * 分析 Optix Schema
 */
function analyzeOptixSchema(schemaContent) {
  console.log('\n📊 Optix Schema 分析:');
  
  // 统计类型
  const types = schemaContent.match(/^type\s+(\w+)/gm) || [];
  const queries = schemaContent.match(/type Query \{([\s\S]*?)\n\}/);
  const mutations = schemaContent.match(/type Mutation \{([\s\S]*?)\n\}/);
  
  console.log(`📝 GraphQL 类型: ${types.length} 个`);
  
  // 分析查询
  if (queries) {
    const queryFields = queries[1].split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#') && line.includes(':'))
      .map(line => line.trim().split(':')[0].trim());
    
    console.log(`🔍 可用查询: ${queryFields.length} 个`);
    
    // 检查关键的业务查询
    const businessQueries = [
      'bookings', 'booking', 'members', 'member', 'resources', 'resource',
      'plans', 'plan', 'organization', 'me', 'teams', 'team'
    ];
    
    console.log('\n🏢 业务相关查询:');
    businessQueries.forEach(query => {
      const found = queryFields.find(field => field.toLowerCase().includes(query));
      if (found) {
        console.log(`  ✅ ${found}`);
      }
    });
  }
  
  // 分析变更
  if (mutations) {
    const mutationFields = mutations[1].split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#') && line.includes(':'))
      .length;
    console.log(`✏️ 可用变更: ${mutationFields} 个`);
  }
}

/**
 * 测试 Optix 业务工具
 */
function testOptixBusinessTools() {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 测试 Optix 业务工具...');
    
    const server = spawn('node', [CONFIG.serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ENDPOINT: CONFIG.endpoint,
        HEADERS: JSON.stringify({
          "Authorization": `Bearer ${CONFIG.accessToken}`
        })
      }
    });

    let testResults = [];
    let currentTestId = 2;
    
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          
          if (parsed.id >= 2 && (parsed.result || parsed.error)) {
            testResults.push({
              id: parsed.id,
              result: parsed.result,
              error: parsed.error
            });
          }
          
        } catch (e) {
          // 忽略非JSON输出
        }
      });
    });

    server.on('close', () => {
      analyzeToolResults(testResults);
      resolve(testResults);
    });

    setTimeout(() => {
      server.kill();
    }, CONFIG.timeout);

    // 测试序列
    const toolTests = [
      {
        id: 2,
        tool: 'optix_get_organization_info',
        args: {},
        description: '获取组织信息'
      },
      {
        id: 3,
        tool: 'optix_list_accounts',
        args: { limit: 5, search: "", include_teams: true },
        description: '获取账户列表（包含用户和团队）'
      },
      {
        id: 4,
        tool: 'optix_list_resources',
        args: { limit: 5, location_id: null },
        description: '获取资源列表'
      },
      {
        id: 5,
        tool: 'optix_list_bookings',
        args: { limit: 5, include_new: true, include_approved: true },
        description: '获取预订列表'
      },
      {
        id: 6,
        tool: 'optix_list_locations',
        args: { limit: 5 },
        description: '获取位置列表'
      },
      {
        id: 7,
        tool: 'optix_list_plan_templates',
        args: { limit: 3 },
        description: '获取计划模板列表'
      }
    ];

    // 发送测试请求
    toolTests.forEach((test, index) => {
      setTimeout(() => {
        console.log(`🔄 执行: ${test.description}...`);
        
        const message = JSON.stringify({
          jsonrpc: '2.0',
          id: test.id,
          method: 'tools/call',
          params: {
            name: test.tool,
            arguments: test.args
          }
        }) + '\n';
        
        server.stdin.write(message);
      }, 2000 + (index * 1500));
    });
  });
}

/**
 * 分析工具测试结果
 */
function analyzeToolResults(results) {
  console.log('\n📋 业务工具测试结果:');
  
  const testNames = [
    '获取组织信息',
    '获取账户列表',
    '获取资源列表',
    '获取预订列表',
    '获取位置列表',
    '获取计划模板列表'
  ];
  
  let successCount = 0;
  
  results.forEach((result, index) => {
    const testName = testNames[index] || `测试 ${result.id}`;
    
    if (result.error) {
      console.log(`  ❌ ${testName}: ${result.error.message || '查询失败'}`);
      if (result.error.code) {
        console.log(`     错误代码: ${result.error.code}`);
      }
    } else if (result.result && result.result.content) {
      successCount++;
      console.log(`  ✅ ${testName}: 查询成功`);
      
      try {
        const content = result.result.content[0].text;
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          console.log(`     📊 返回 ${data.length} 条记录`);
          if (data.length > 0 && typeof data[0] === 'object') {
            const sampleKeys = Object.keys(data[0]).slice(0, 3);
            console.log(`     📝 示例字段: ${sampleKeys.join(', ')}`);
          }
        } else if (typeof data === 'object' && data !== null) {
          const keys = Object.keys(data);
          console.log(`     📊 包含字段: ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? '...' : ''}`);
        }
      } catch (e) {
        console.log(`     📊 返回数据长度: ${result.result.content[0].text.length} 字符`);
      }
    } else {
      console.log(`  ⚠️ ${testName}: 响应格式异常`);
    }
  });
  
  console.log(`\n📊 总体结果: ${successCount}/${results.length} 个工具测试成功`);
}

/**
 * 生成测试报告
 */
function generateTestReport(apiData, schemaContent, toolResults) {
  const report = `# Optix MCP Server 真实 API 测试报告

生成时间: ${new Date().toISOString()}
API 端点: ${CONFIG.endpoint}
Token 类型: ${CONFIG.accessToken.endsWith('o') ? 'Organization' : CONFIG.accessToken.endsWith('p') ? 'Personal' : 'Unknown'}

## 🔗 API 连接测试
${apiData ? '✅ 连接成功' : '❌ 连接失败'}

## 📊 Schema 分析
- Schema 文件: optix-real-schema.graphql
- 总类型数: ${(schemaContent.match(/^type\\s+\\w+/gm) || []).length}
- 查询数量: ${schemaContent.includes('type Query') ? '已获取' : '未知'}
- 变更数量: ${schemaContent.includes('type Mutation') ? '已获取' : '未知'}

## 🧪 业务工具测试
${toolResults.map((result, index) => {
  const testNames = ['组织信息', '成员列表', '资源列表', '预订列表'];
  const name = testNames[index] || `测试${index + 1}`;
  const status = result.error ? '❌ 失败' : result.result ? '✅ 成功' : '⚠️ 异常';
  return `- ${name}: ${status}`;
}).join('\n')}

## 📝 下一步建议
1. 根据真实 schema 优化 GraphQL 查询
2. 在 Claude Desktop 中配置并测试实际对话
3. 根据测试结果调整工具参数和描述
4. 添加错误处理和重试机制

## 🔧 配置示例
\`\`\`json
{
  "mcpServers": {
    "optix-production": {
      "command": "npx",
      "args": ["optix-graphql-mcp"],
      "env": {
        "ENDPOINT": "${CONFIG.endpoint}",
        "HEADERS": "{\\"Authorization\\":\\"Bearer YOUR_TOKEN\\"}",
        "ALLOW_MUTATIONS": "true"
      }
    }
  }
}
\`\`\`
`;
  
  fs.writeFileSync('optix-test-report.md', report);
  console.log('\n📄 测试报告已保存到: optix-test-report.md');
}

/**
 * 主测试函数
 */
async function runRealOptixTest() {
  try {
    validateConfig();
    
    console.log('🚀 开始 Optix 真实 API 测试...\n');
    
    // 1. 直接 API 连接测试
    const apiData = await testDirectApiConnection();
    
    // 2. Schema 内省
    const schemaContent = await introspectOptixSchema();
    
    // 3. 业务工具测试
    const toolResults = await testOptixBusinessTools();
    
    // 4. 生成测试报告
    generateTestReport(apiData, schemaContent, toolResults);
    
    console.log('\n🎯 真实 API 测试完成！');
    console.log('============================================');
    
    const successfulTools = toolResults.filter(r => !r.error && r.result).length;
    console.log(`✅ API 连接: ${apiData ? '成功' : '失败'}`);
    console.log(`📊 Schema 内省: 成功`);
    console.log(`🧪 工具测试: ${successfulTools}/${toolResults.length} 成功`);
    
    if (apiData && successfulTools > 0) {
      console.log('\n🎉 Optix MCP Server 可以正常工作！');
      console.log('\n📝 下一步建议:');
      console.log('1. 运行: ./setup-claude.sh 配置 Claude Desktop');
      console.log('2. 在 Claude Desktop 中测试对话');
      console.log('3. 根据 optix-real-schema.graphql 优化查询');
    } else {
      console.log('\n⚠️ 存在一些问题需要解决');
      console.log('💡 检查 Token 权限和网络连接');
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('\n🔧 常见问题排查:');
    console.log('1. 检查 OPTIX_ACCESS_TOKEN 是否正确设置');
    console.log('2. 确认 Token 是否有效且未过期');
    console.log('3. 验证网络连接和防火墙设置');
    console.log('4. 检查 Token 权限是否足够');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('5. 确认可以访问 api.optixapp.com');
    }
    
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runRealOptixTest();
}

module.exports = { runRealOptixTest, CONFIG };