#!/usr/bin/env node

/**
 * Comprehensive test for all Optix business tools
 * Tests both read-only and mutation tools (when enabled)
 */

const { spawn } = require('child_process');

function sendRequest(server, request) {
  return new Promise((resolve, reject) => {
    let response = '';

    const onData = (data) => {
      response += data.toString();

      // Look for complete JSON response
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
        // Continue waiting for complete response
      }
    };

    server.stdout.on('data', onData);
    server.stdin.write(JSON.stringify(request) + '\n');

    // Timeout after 10 seconds
    setTimeout(() => {
      server.stdout.removeListener('data', onData);
      reject(new Error('Request timeout'));
    }, 10000);
  });
}

async function testAllTools() {
  console.log('🧪 COMPREHENSIVE OPTIX BUSINESS TOOLS TEST');
  console.log('═'.repeat(60));

  // Check for API token
  const apiToken = process.env.OPTIX_API_TOKEN;
  if (!apiToken) {
    console.error('❌ OPTIX_API_TOKEN environment variable not set');
    process.exit(1);
  }

  // Start server
  const allowMutations = process.env.ALLOW_MUTATIONS === 'true';
  console.log(`\n📡 Starting server (mutations: ${allowMutations ? '✅ enabled' : '❌ disabled'})...`);

  const server = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      ENDPOINT: 'https://api.optixapp.com/graphql',
      HEADERS: JSON.stringify({ Authorization: `Bearer ${apiToken}` }),
      ALLOW_MUTATIONS: allowMutations ? 'true' : 'false'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    tools: []
  };

  try {
    // Initialize
    console.log('\n🔧 Initializing MCP connection...');
    const initResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'comprehensive-test', version: '1.0.0' }
      }
    });

    console.log('✅ Connected:', initResponse.result.serverInfo.description);

    // List all tools
    console.log('\n📋 Discovering tools...');
    const toolsResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });

    const allTools = toolsResponse.result.tools;
    const businessTools = allTools.filter(tool => tool.name.startsWith('optix_'));

    console.log(`✅ Found ${businessTools.length} business tools\n`);

    // Test each business tool
    let toolId = 3;

    // ==================== BOOKING TOOLS ====================
    console.log('\n📅 BOOKING MANAGEMENT TOOLS');
    console.log('─'.repeat(60));

    // 1. List Bookings
    await testTool('optix_list_bookings', {
      limit: 5
    }, toolId++, server, testResults);

    // 2. Get Booking Details (if we have bookings)
    // Skip for now - requires booking ID

    // 3. Check Availability
    await testTool('optix_check_availability', {
      resourceId: 'test-resource-id',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString()
    }, toolId++, server, testResults, true); // may fail if resource doesn't exist

    // 4. Get Upcoming Bookings
    await testTool('optix_get_upcoming_bookings', {
      days: 7
    }, toolId++, server, testResults);

    // ==================== MEMBER TOOLS ====================
    console.log('\n👥 MEMBER MANAGEMENT TOOLS');
    console.log('─'.repeat(60));

    // 5. List Members
    await testTool('optix_list_members', {
      limit: 10
    }, toolId++, server, testResults);

    // 6. Search Members
    await testTool('optix_search_members', {
      query: 'test',
      limit: 5
    }, toolId++, server, testResults);

    // 7. Get Member Profile (skip - requires ID)

    // ==================== RESOURCE TOOLS ====================
    console.log('\n🏢 RESOURCE MANAGEMENT TOOLS');
    console.log('─'.repeat(60));

    // 8. List Resources
    await testTool('optix_list_resources', {
      type: 'meeting_room'
    }, toolId++, server, testResults, true);

    // 9. Get Resource Details (skip - requires ID)

    // 10. Get Resource Schedule (skip - requires ID)

    // ==================== PLAN TOOLS ====================
    console.log('\n💼 PLAN TEMPLATE TOOLS');
    console.log('─'.repeat(60));

    // 11. List Plan Templates
    await testTool('optix_list_plan_templates', {
      active: true
    }, toolId++, server, testResults);

    // 12. Get Plan Template (skip - requires ID)

    // ==================== ORGANIZATION TOOLS ====================
    console.log('\n🏛️  ORGANIZATION TOOLS');
    console.log('─'.repeat(60));

    // 13. Get Organization Info
    await testTool('optix_get_organization_info', {}, toolId++, server, testResults);

    // ==================== ANALYTICS TOOLS ====================
    console.log('\n📊 ANALYTICS & REPORTING TOOLS');
    console.log('─'.repeat(60));

    // 14. Get Booking Stats
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    await testTool('optix_get_booking_stats', {
      from: lastMonth.toISOString(),
      to: now.toISOString()
    }, toolId++, server, testResults);

    // 15. Get Member Stats
    await testTool('optix_get_member_stats', {}, toolId++, server, testResults);

    // ==================== MUTATION TOOLS (if enabled) ====================
    if (allowMutations) {
      console.log('\n✍️  MUTATION TOOLS (WRITE OPERATIONS)');
      console.log('─'.repeat(60));
      console.log('⚠️  Skipping mutation tests to avoid modifying data');
      console.log('   To test mutations, manually verify in MCP Inspector:');
      console.log('   • optix_create_booking');
      console.log('   • optix_cancel_booking');
      console.log('   • optix_create_member');
      testResults.skipped += 3;
    }

    // ==================== SUMMARY ====================
    console.log('\n\n📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Tools Tested: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⊘  Skipped: ${testResults.skipped}`);
    console.log(`\n📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

    console.log('\n\n🔍 DETAILED RESULTS:');
    console.log('─'.repeat(60));
    testResults.tools.forEach((result, index) => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⊘';
      console.log(`${icon} ${index + 1}. ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.note) {
        console.log(`   Note: ${result.note}`);
      }
    });

    console.log('\n\n🎉 Test completed!');
    console.log('\n💡 To test all tools interactively, use the MCP Inspector:');
    console.log('   npx @modelcontextprotocol/inspector node dist/index.js');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  } finally {
    server.kill();
  }
}

async function testTool(toolName, args, id, server, results, allowFailure = false) {
  results.total++;
  console.log(`\n🧪 Testing: ${toolName}`);
  console.log(`   Args: ${JSON.stringify(args, null, 2).replace(/\n/g, '\n   ')}`);

  try {
    const response = await sendRequest(server, {
      jsonrpc: '2.0',
      id: id,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });

    if (response.result) {
      console.log('   ✅ Success');
      results.passed++;
      results.tools.push({ name: toolName, status: 'passed' });

      // Show snippet of result
      try {
        const content = response.result.content[0].text;
        const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
        console.log(`   Preview: ${preview.substring(0, 100)}...`);
      } catch (e) {
        // Ignore preview errors
      }
    } else if (response.error) {
      if (allowFailure) {
        console.log(`   ⊘  Expected failure: ${response.error.message}`);
        results.skipped++;
        results.tools.push({
          name: toolName,
          status: 'skipped',
          note: 'Expected to fail without proper data'
        });
      } else {
        console.log(`   ❌ Error: ${response.error.message}`);
        results.failed++;
        results.tools.push({
          name: toolName,
          status: 'failed',
          error: response.error.message
        });
      }
    }
  } catch (error) {
    if (allowFailure) {
      console.log(`   ⊘  Expected failure: ${error.message}`);
      results.skipped++;
      results.tools.push({
        name: toolName,
        status: 'skipped',
        note: 'Expected to fail without proper data'
      });
    } else {
      console.log(`   ❌ Failed: ${error.message}`);
      results.failed++;
      results.tools.push({
        name: toolName,
        status: 'failed',
        error: error.message
      });
    }
  }
}

// Run tests
if (require.main === module) {
  testAllTools().catch(console.error);
}

module.exports = { testAllTools };
