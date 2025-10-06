#!/usr/bin/env node

/**
 * Simple test to verify MCP server tools using stdio
 */

const { spawn } = require('child_process');

async function testMCPServer() {
  console.log('🧪 Testing Optix MCP Server Tools');
  console.log('═'.repeat(50));
  
  // Test 1: Default mode (15 read-only tools)
  console.log('\n📋 Test 1: Read-only mode (ALLOW_MUTATIONS=false)');
  
  const defaultServer = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      OPTIX_API_TOKEN: '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
      ENDPOINT: 'https://api.optixapp.com/graphql',
      ALLOW_MUTATIONS: 'false'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send initialize request
  const initRequest = {
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
  };

  defaultServer.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Wait for response
  await new Promise((resolve) => {
    defaultServer.stdout.on('data', (data) => {
      const response = data.toString();
      console.log('Server response:', response);
      resolve();
    });
    
    setTimeout(resolve, 3000); // Timeout after 3 seconds
  });
  
  defaultServer.kill();
  
  // Test 2: Mutation mode (18 tools total)
  console.log('\n📋 Test 2: Mutation mode (ALLOW_MUTATIONS=true)');
  
  const mutationServer = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      OPTIX_API_TOKEN: '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
      ENDPOINT: 'https://api.optixapp.com/graphql', 
      ALLOW_MUTATIONS: 'true'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mutationServer.stdin.write(JSON.stringify(initRequest) + '\n');
  
  await new Promise((resolve) => {
    mutationServer.stdout.on('data', (data) => {
      const response = data.toString();
      console.log('Server response (mutations):', response);
      resolve();
    });
    
    setTimeout(resolve, 3000);
  });
  
  mutationServer.kill();
  
  console.log('\n✅ MCP Server stdio test completed');
}

testMCPServer().catch(console.error);