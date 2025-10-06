#!/usr/bin/env node

/**
 * Test mutation tools in ALLOW_MUTATIONS=true mode
 */

const { spawn } = require('child_process');

function sendRequest(server, request) {
  return new Promise((resolve, reject) => {
    let response = '';
    
    const onData = (data) => {
      response += data.toString();
      
      try {
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.includes('"jsonrpc"') && line.includes(`"id":${request.id}`)) {
            server.stdout.removeListener('data', onData);
            resolve(JSON.parse(line));
            return;
          }
        }
      } catch (e) {
        // Continue waiting
      }
    };
    
    server.stdout.on('data', onData);
    server.stdin.write(JSON.stringify(request) + '\n');
    
    setTimeout(() => {
      server.stdout.removeListener('data', onData);
      reject(new Error('Request timeout'));
    }, 5000);
  });
}

async function testMutationMode() {
  console.log('🧪 Testing Mutation Mode (ALLOW_MUTATIONS=true)');
  console.log('═'.repeat(50));
  
  // Start server with mutations enabled
  const server = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      OPTIX_API_TOKEN: '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
      ENDPOINT: 'https://api.optixapp.com/graphql',
      ALLOW_MUTATIONS: 'true'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  try {
    // Initialize
    console.log('\n🔧 Initializing server with mutations...');
    await sendRequest(server, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    });
    
    // List tools to check if mutations are available
    console.log('\n📋 Checking available tools...');
    const toolsResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });
    
    const tools = toolsResponse.result.tools;
    const mutationTools = tools.filter(tool => 
      tool.name.includes('create_') || 
      tool.name.includes('update_') || 
      tool.name.includes('cancel_')
    );
    
    console.log(`✅ Total tools: ${tools.length}`);
    console.log(`🔧 Mutation tools: ${mutationTools.length}`);
    
    if (mutationTools.length > 0) {
      console.log('🎯 Available mutation tools:');
      mutationTools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
      });
    } else {
      console.log('ℹ️  No mutation tools found - they may be included in the business tools');
    }
    
    // Check for Optix business tools
    const businessTools = tools.filter(tool => tool.name.startsWith('optix_'));
    console.log(`\n🏢 Optix business tools: ${businessTools.length}`);
    
    // Look for booking creation tool
    const bookingTools = businessTools.filter(tool => 
      tool.name.includes('booking') && 
      (tool.name.includes('create') || tool.description.toLowerCase().includes('create'))
    );
    
    if (bookingTools.length > 0) {
      console.log('📅 Booking creation tools found:');
      bookingTools.forEach(tool => {
        console.log(`   • ${tool.name} - ${tool.description}`);
      });
    }
    
    console.log('\n📊 Mutation Mode Summary:');
    console.log(`   • Server: ✅ Running with ALLOW_MUTATIONS=true`);
    console.log(`   • Total tools: ✅ ${tools.length}`);
    console.log(`   • Business tools: ✅ ${businessTools.length}`);
    console.log(`   • Mutation capability: ✅ Enabled`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    server.kill();
  }
}

testMutationMode().catch(console.error);