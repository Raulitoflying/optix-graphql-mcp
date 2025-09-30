#!/usr/bin/env node

/**
 * 本地测试脚本 - 验证 Optix GraphQL MCP Server 功能
 * 
 * 这个脚本将测试：
 * 1. MCP Server 基本启动功能
 * 2. GraphQL introspection 查询
 * 3. Optix 业务工具的注册和响应
 */

const { spawn } = require('child_process');
const { writeFileSync, existsSync } = require('fs');
const path = require('path');

console.log('🚀 开始测试 Optix GraphQL MCP Server...\n');

// 测试配置
const TEST_CONFIG = {
  serverPath: path.join(__dirname, 'dist', 'index.js'),
  timeout: 10000, // 10秒超时
  testEndpoint: 'https://api.example.com/graphql', // 模拟 GraphQL 端点
};

// 检查构建文件是否存在
if (!existsSync(TEST_CONFIG.serverPath)) {
  console.error('❌ 错误: 找不到构建后的服务器文件');
  console.error('请先运行: npm run build');
  process.exit(1);
}

/**
 * 测试 1: 验证 MCP Server 启动
 */
function testServerStartup() {
  return new Promise((resolve, reject) => {
    console.log('📋 测试 1: MCP Server 启动测试');
    
    const server = spawn('node', [TEST_CONFIG.serverPath, TEST_CONFIG.testEndpoint], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';
    
    server.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // 设置超时
    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error('服务器启动超时'));
    }, TEST_CONFIG.timeout);

    server.on('close', (code) => {
      clearTimeout(timeout);
      
      // 检查服务器是否成功启动（通过输出或错误输出判断）
      if (errorOutput.includes('Started graphql mcp server') || 
          output.includes('MCP Server initialized') ||
          errorOutput.includes('mcp-graphql for endpoint')) {
        console.log('✅ 服务器启动成功');
        console.log('📄 启动信息:', errorOutput.trim() || output.slice(0, 200) + '...');
        resolve({ output, errorOutput });
      } else {
        console.log('❌ 服务器启动失败');
        console.log('📄 错误输出:', errorOutput);
        console.log('📄 标准输出:', output);
        reject(new Error(`服务器退出码: ${code}`));
      }
    });

    server.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // 发送基本的 MCP 初始化消息
    setTimeout(() => {
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      }) + '\n';
      
      server.stdin.write(initMessage);
    }, 1000);

    // 发送完成后关闭
    setTimeout(() => {
      server.kill();
    }, 3000);
  });
}

/**
 * 测试 2: 检查工具列表
 */
function testToolsList() {
  return new Promise((resolve, reject) => {
    console.log('\n📋 测试 2: 检查注册的工具列表');
    
    const server = spawn('node', [TEST_CONFIG.serverPath, TEST_CONFIG.testEndpoint], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responses = [];
    
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          responses.push(parsed);
        } catch (e) {
          // 忽略非JSON输出
        }
      });
    });

    server.on('close', () => {
      // 检查是否有工具相关的响应
      const hasTools = responses.some(r => 
        r.result && (r.result.tools || r.result.length > 0)
      );
      
      if (hasTools) {
        console.log('✅ 工具列表获取成功');
        const toolCount = responses.find(r => r.result && r.result.tools)?.result.tools.length || 0;
        console.log(`📊 注册的工具数量: ${toolCount}`);
      } else {
        console.log('⚠️ 无法获取工具列表（可能需要真实的 GraphQL 端点）');
      }
      
      resolve();
    });

    // 发送初始化和工具列表请求
    setTimeout(() => {
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      }) + '\n';
      
      server.stdin.write(initMessage);
    }, 1000);

    setTimeout(() => {
      const toolsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      }) + '\n';
      
      server.stdin.write(toolsMessage);
    }, 2000);

    setTimeout(() => {
      server.kill();
    }, 4000);
  });
}

/**
 * 测试 3: 环境变量检查
 */
function testEnvironmentCheck() {
  console.log('\n📋 测试 3: 环境变量和配置检查');
  
  // 检查必要的依赖
  const requiredModules = ['@modelcontextprotocol/sdk', 'graphql', 'zod'];
  const packageJson = require('./package.json');
  
  requiredModules.forEach(module => {
    if (packageJson.dependencies[module]) {
      console.log(`✅ 依赖检查通过: ${module}`);
    } else {
      console.log(`❌ 缺少依赖: ${module}`);
    }
  });

  // 检查 Optix 相关配置
  if (process.env.OPTIX_API_URL) {
    console.log('✅ 检测到 OPTIX_API_URL 环境变量');
  } else {
    console.log('⚠️ 未设置 OPTIX_API_URL 环境变量（测试时使用模拟端点）');
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  try {
    await testServerStartup();
    await testToolsList();
    testEnvironmentCheck();
    
    console.log('\n🎉 本地测试完成！');
    console.log('\n📝 下一步建议:');
    console.log('1. 配置真实的 Optix GraphQL 端点进行完整测试');
    console.log('2. 设置 Claude Desktop 集成');
    console.log('3. 运行具体的业务工具测试');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runTests();