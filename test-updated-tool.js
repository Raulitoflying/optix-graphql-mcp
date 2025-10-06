#!/usr/bin/env node

/**
 * Test updated optix_get_upcoming_bookings tool
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
    }, 10000);
  });
}

async function test() {
  console.log('🧪 Testing updated optix_get_upcoming_bookings');
  console.log('═'.repeat(50));

  const server = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      ENDPOINT: 'https://api.optixapp.com/graphql',
      HEADERS: '{"Authorization":"Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p"}',
      ALLOW_MUTATIONS: 'false'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  try {
    // Initialize
    console.log('\n🔧 Initializing...');
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
    console.log('✅ Initialized');

    // Test upcoming bookings with 365 days
    console.log('\n🧪 Testing optix_get_upcoming_bookings (365 days)...');
    const response = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'optix_get_upcoming_bookings',
        arguments: {
          days: 365
        }
      }
    });

    if (response.result) {
      console.log('Raw response:', JSON.stringify(response.result, null, 2));
      const result = JSON.parse(response.result.content[0].text);
      console.log('✅ Tool succeeded!');
      console.log('\n📊 Summary:', JSON.stringify(result.summary, null, 2));
      console.log(`\n📋 Total events: ${result.events.length}`);

      if (result.events.length > 0) {
        console.log('\n🎯 Sample events:');
        result.events.slice(0, 3).forEach((event, i) => {
          console.log(`\n${i + 1}. Type: ${event.type}`);
          console.log(`   ID: ${event.booking_id || event.assignment_id || event.availability_block_id || event.tour_id}`);
          console.log(`   Title: ${event.title || '(no title)'}`);
          console.log(`   Status: ${event.status}`);
          console.log(`   Resource: ${event.resource?.name || 'N/A'}`);
          console.log(`   Time: ${new Date(event.start_timestamp * 1000).toISOString()}`);
        });
      }
    } else if (response.error) {
      console.log('❌ Error:', response.error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    server.kill();
  }
}

test().catch(console.error);
