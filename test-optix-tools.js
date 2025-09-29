#!/usr/bin/env node

/**
 * Optix 业务工具功能测试脚本
 * 
 * 这个脚本测试 16 个 Optix 业务工具的注册和基本功能
 * 注意：这是模拟测试，不会连接真实的 Optix API
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Optix 业务工具功能测试');
console.log('==========================================\n');

// 测试配置
const CONFIG = {
  serverPath: path.join(__dirname, 'dist', 'index.js'),
  testEndpoint: 'https://demo.optixapp.com/graphql', // 模拟端点
  timeout: 15000,
};

// 预期的 Optix 工具列表 (实际注册的工具)
const EXPECTED_TOOLS = [
  'optix_list_bookings',
  'optix_get_booking_details', 
  'optix_check_availability',
  'optix_create_booking',
  'optix_cancel_booking',
  'optix_get_upcoming_bookings',
  'optix_list_members',
  'optix_get_member_profile',
  'optix_search_members',
  'optix_create_member',
  'optix_list_resources',
  'optix_get_resource_details',
  'optix_get_resource_schedule',
  'optix_list_plan_templates',
  'optix_get_plan_template',
  'optix_get_organization_info',
  'optix_get_booking_stats',
  'optix_get_member_stats'
];

/**
 * 测试工具注册
 */
function testToolRegistration() {
  return new Promise((resolve, reject) => {
    console.log('📋 测试 1: Optix 工具注册测试');
    console.log(`🔧 使用端点: ${CONFIG.testEndpoint}\n`);
    
    const server = spawn('node', [CONFIG.serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ENDPOINT: CONFIG.testEndpoint,
        NODE_ENV: 'test'
      }
    });

    let toolsResponse = null;
    let initializationComplete = false;
    
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          
          // 检查初始化响应
          if (parsed.id === 1 && parsed.result) {
            initializationComplete = true;
            console.log('✅ MCP 协议初始化成功');
            console.log(`📊 协议版本: ${parsed.result.protocolVersion}`);
            console.log(`🏷️ 服务器: ${parsed.result.serverInfo.name} v${parsed.result.serverInfo.version}\n`);
          }
          
          // 检查工具列表响应
          if (parsed.id === 2 && parsed.result && parsed.result.tools) {
            toolsResponse = parsed.result;
            console.log('📝 工具列表响应接收成功');
          }
          
        } catch (e) {
          // 忽略非JSON输出
        }
      });
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Started graphql mcp server')) {
        console.log('🚀 GraphQL MCP Server 启动成功');
      }
    });

    server.on('close', () => {
      if (toolsResponse) {
        analyzeTools(toolsResponse.tools);
        resolve(toolsResponse);
      } else {
        console.log('❌ 未能获取工具列表响应');
        reject(new Error('工具列表获取失败'));
      }
    });

    // 设置超时
    setTimeout(() => {
      server.kill();
      if (!toolsResponse) {
        reject(new Error('测试超时'));
      }
    }, CONFIG.timeout);

    // 发送 MCP 协议消息
    setTimeout(() => {
      // 1. 初始化
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'optix-test-client', version: '1.0.0' }
        }
      }) + '\n';
      
      server.stdin.write(initMessage);
    }, 1000);

    setTimeout(() => {
      // 2. 请求工具列表
      const toolsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      }) + '\n';
      
      server.stdin.write(toolsMessage);
    }, 2500);

    setTimeout(() => {
      server.kill();
    }, 5000);
  });
}

/**
 * 分析工具注册情况
 */
function analyzeTools(tools) {
  console.log('🔍 工具注册分析:');
  console.log(`📊 总工具数量: ${tools.length}`);
  
  // 检查 Optix 工具
  const optixTools = tools.filter(tool => tool.name.startsWith('optix_'));
  console.log(`🎯 Optix 工具数量: ${optixTools.length}`);
  
  if (optixTools.length === 0) {
    console.log('❌ 未检测到任何 Optix 工具！');
    return;
  }
  
  console.log('\n📋 已注册的 Optix 工具:');
  optixTools.forEach((tool, index) => {
    const isExpected = EXPECTED_TOOLS.includes(tool.name);
    const status = isExpected ? '✅' : '⚠️';
    console.log(`  ${status} ${index + 1}. ${tool.name}`);
    if (tool.description) {
      console.log(`     📝 ${tool.description.slice(0, 80)}...`);
    }
  });
  
  // 检查缺失的工具
  const registeredNames = optixTools.map(t => t.name);
  const missingTools = EXPECTED_TOOLS.filter(name => !registeredNames.includes(name));
  
  if (missingTools.length > 0) {
    console.log('\n⚠️ 缺失的工具:');
    missingTools.forEach(name => {
      console.log(`  ❌ ${name}`);
    });
  } else {
    console.log('\n🎉 所有预期的 Optix 工具都已注册！');
  }
  
  // 按类别分析工具
  console.log('\n📊 工具分类统计:');
  
  const categories = {
    'booking': optixTools.filter(t => t.name.includes('booking')).length,
    'member': optixTools.filter(t => t.name.includes('member')).length,
    'resource': optixTools.filter(t => t.name.includes('resource')).length,
    'analytics': optixTools.filter(t => t.name.includes('analytics')).length,
    'organization': optixTools.filter(t => t.name.includes('organization')).length,
    'plan': optixTools.filter(t => t.name.includes('plan')).length,
  };
  
  Object.entries(categories).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`  📦 ${category}: ${count} 个工具`);
    }
  });
}

/**
 * 测试工具参数模式
 */
function testToolSchemas(toolsResponse) {
  console.log('\n📋 测试 2: 工具参数模式验证');
  
  const optixTools = toolsResponse.tools.filter(tool => tool.name.startsWith('optix_'));
  
  console.log('🔍 检查工具参数模式:');
  
  let validSchemas = 0;
  
  optixTools.forEach(tool => {
    try {
      // 验证工具是否有有效的输入模式
      if (tool.inputSchema && typeof tool.inputSchema === 'object') {
        validSchemas++;
        console.log(`  ✅ ${tool.name}: 参数模式有效`);
        
        // 检查是否有必需参数
        const schema = tool.inputSchema;
        if (schema.properties) {
          const requiredCount = schema.required ? schema.required.length : 0;
          const totalCount = Object.keys(schema.properties).length;
          console.log(`     📊 参数: ${totalCount} 个 (${requiredCount} 个必需)`);
        }
      } else {
        console.log(`  ❌ ${tool.name}: 参数模式无效或缺失`);
      }
    } catch (error) {
      console.log(`  ❌ ${tool.name}: 参数模式验证失败 - ${error.message}`);
    }
  });
  
  console.log(`\n📊 参数模式验证结果: ${validSchemas}/${optixTools.length} 工具有效`);
  
  return validSchemas === optixTools.length;
}

/**
 * 主测试函数
 */
async function runOptixToolsTest() {
  try {
    console.log('🚀 开始 Optix 工具测试...\n');
    
    const toolsResponse = await testToolRegistration();
    const schemasValid = testToolSchemas(toolsResponse);
    
    console.log('\n🎯 测试总结:');
    console.log('==========================================');
    
    const optixTools = toolsResponse.tools.filter(tool => tool.name.startsWith('optix_'));
    const expectedCount = EXPECTED_TOOLS.length;
    const actualCount = optixTools.length;
    
    console.log(`📊 工具注册: ${actualCount}/${expectedCount} Optix 工具`);
    console.log(`📝 参数模式: ${schemasValid ? '全部有效' : '部分无效'}`);
    console.log(`🔧 服务器启动: ✅ 成功`);
    console.log(`📡 MCP 协议: ✅ 兼容`);
    
    if (actualCount === expectedCount && schemasValid) {
      console.log('\n🎉 所有测试通过！Optix 工具功能正常');
      console.log('\n📝 下一步建议:');
      console.log('1. 连接真实的 Optix GraphQL API 进行端到端测试');
      console.log('2. 在 Claude Desktop 中测试实际的工具调用');
      console.log('3. 验证业务逻辑和数据转换');
    } else {
      console.log('\n⚠️ 部分测试失败，请检查实现');
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runOptixToolsTest();