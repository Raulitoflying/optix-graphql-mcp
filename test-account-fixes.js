#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// 设置环境变量
process.env.OPTIX_API_TOKEN = '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p';

const server = new Server(
  {
    name: 'optix-graphql-test',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 导入我们的处理程序
const { OptixGraphQLHandler } = require('./dist/index.js');
const handler = new OptixGraphQLHandler();

// 测试 Account 相关的工具
async function testAccountTools() {
  console.log('🧪 Testing Account-related tools after schema fixes...\n');
  
  const accountTools = [
    'optix_get_organization_info',
    'optix_list_members', 
    'optix_get_member_profile'
  ];
  
  for (const toolName of accountTools) {
    try {
      console.log(`📋 Testing ${toolName}...`);
      
      let args = {};
      if (toolName === 'optix_get_member_profile') {
        // 需要一个 account_id，我们先跳过这个
        console.log('   ⚠️  Skipping - requires account_id\n');
        continue;
      }
      
      const result = await handler.handleToolCall({
        name: toolName,
        arguments: args
      });
      
      if (result.isError) {
        console.log(`   ❌ Error: ${result.content[0].text}`);
      } else {
        console.log(`   ✅ Success: Got valid response`);
        // 检查是否包含新的 primary_location 结构
        const responseText = result.content[0].text;
        if (responseText.includes('"primary_location"') && responseText.includes('"location_id"')) {
          console.log(`   🔧 Schema fix confirmed: primary_location object structure found`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
    
    console.log('');
  }
}

testAccountTools().then(() => {
  console.log('Account schema fixes test completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});