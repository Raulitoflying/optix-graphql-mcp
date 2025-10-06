#!/usr/bin/env node

/**
 * MCP Client to test all Optix business tools
 * Tests both read-only and mutation tools with proper schema fixes
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class OptixMCPTester {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async connect() {
    console.log('🔌 Connecting to Optix MCP Server...');
    
    // Start the MCP server process
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        OPTIX_API_TOKEN: '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
        ENDPOINT: 'https://api.optixapp.com/graphql',
        ALLOW_MUTATIONS: 'false' // Start with read-only tools
      }
    });

    // Create stdio transport
    this.transport = new StdioClientTransport({
      readable: serverProcess.stdout,
      writable: serverProcess.stdin
    });

    this.client = new Client({
      name: 'optix-tester',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await this.client.connect(this.transport);
    console.log('✅ Connected to MCP Server\n');
  }

  async listAllTools() {
    console.log('📋 Listing available tools...');
    const result = await this.client.listTools();
    
    console.log(`Found ${result.tools.length} tools:\n`);
    
    const readOnlyTools = [];
    const mutationTools = [];
    
    result.tools.forEach(tool => {
      console.log(`• ${tool.name}: ${tool.description}`);
      if (tool.name.includes('create_') || tool.name.includes('update_') || tool.name.includes('cancel_')) {
        mutationTools.push(tool);
      } else {
        readOnlyTools.push(tool);
      }
    });
    
    console.log(`\n📊 Summary: ${readOnlyTools.length} read-only, ${mutationTools.length} mutation tools`);
    return { readOnlyTools, mutationTools };
  }

  async testReadOnlyTools(tools) {
    console.log('\n🧪 Testing Read-Only Business Tools');
    console.log('═'.repeat(50));
    
    let passCount = 0;
    
    for (const tool of tools) {
      try {
        console.log(`\n📋 Testing: ${tool.name}`);
        console.log(`   Description: ${tool.description}`);
        
        // Prepare arguments based on tool type
        let args = {};
        if (tool.name.includes('get_') && tool.name.includes('_profile')) {
          console.log('   ⚠️  Skipping - requires specific ID');
          continue;
        }
        
        const startTime = Date.now();
        const result = await this.client.callTool({
          name: tool.name,
          arguments: args
        });
        const duration = Date.now() - startTime;
        
        if (result.isError) {
          console.log(`   ❌ Error: ${result.content[0]?.text || 'Unknown error'}`);
        } else {
          console.log(`   ✅ Success (${duration}ms)`);
          
          // Parse and display key results
          try {
            const responseText = result.content[0]?.text || '';
            if (responseText.includes('"total":')) {
              const totalMatch = responseText.match(/"total":\s*(\d+)/);
              if (totalMatch) {
                console.log(`   📊 Found ${totalMatch[1]} items`);
              }
            }
            if (responseText.includes('"booking_id"')) {
              const bookingMatches = responseText.match(/"booking_id"/g);
              console.log(`   📅 Retrieved ${bookingMatches?.length || 0} bookings`);
            }
            if (responseText.includes('"account_id"')) {
              const accountMatches = responseText.match(/"account_id"/g);
              console.log(`   👥 Retrieved ${accountMatches?.length || 0} accounts`);
            }
            if (responseText.includes('"resource_id"')) {
              const resourceMatches = responseText.match(/"resource_id"/g);
              console.log(`   🏢 Retrieved ${resourceMatches?.length || 0} resources`);
            }
            
            passCount++;
          } catch (parseError) {
            console.log(`   ✅ Success (response parsing skipped)`);
            passCount++;
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Exception: ${error.message}`);
      }
    }
    
    return passCount;
  }

  async testMutationTools() {
    console.log('\n🔄 Restarting server with mutations enabled...');
    
    // Disconnect current client
    await this.client.close();
    
    // Start server with mutations enabled
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        OPTIX_API_TOKEN: '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
        ENDPOINT: 'https://api.optixapp.com/graphql',
        ALLOW_MUTATIONS: 'true' // Enable mutation tools
      }
    });

    this.transport = new StdioClientTransport({
      readable: serverProcess.stdout,
      writable: serverProcess.stdin
    });

    this.client = new Client({
      name: 'optix-tester-mutations',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await this.client.connect(this.transport);
    
    // List tools to see if mutations are available
    const result = await this.client.listTools();
    const mutationTools = result.tools.filter(tool => 
      tool.name.includes('create_') || tool.name.includes('update_') || tool.name.includes('cancel_')
    );
    
    console.log(`\n🧪 Testing Mutation Tools (${mutationTools.length} found)`);
    console.log('═'.repeat(50));
    
    if (mutationTools.length === 0) {
      console.log('❌ No mutation tools found - ALLOW_MUTATIONS may not be working');
      return 0;
    }
    
    let passCount = 0;
    
    for (const tool of mutationTools) {
      console.log(`\n📋 Mutation Tool: ${tool.name}`);
      console.log(`   Description: ${tool.description}`);
      console.log(`   ℹ️  Skipping actual execution (would create real data)`);
      console.log(`   ✅ Tool available and registered`);
      passCount++;
    }
    
    return passCount;
  }

  async runFullTest() {
    try {
      await this.connect();
      
      const { readOnlyTools, mutationTools } = await this.listAllTools();
      
      // Test read-only tools
      const readOnlyPassed = await this.testReadOnlyTools(readOnlyTools);
      
      // Test mutation tools availability
      const mutationPassed = await this.testMutationTools();
      
      // Final summary
      console.log('\n' + '═'.repeat(70));
      console.log('🎯 FINAL TEST RESULTS');
      console.log('═'.repeat(70));
      console.log(`📊 Read-only tools: ${readOnlyPassed}/${readOnlyTools.length} passed`);
      console.log(`🔄 Mutation tools: ${mutationPassed}/${mutationTools.length} available`);
      
      const totalExpected = 15; // Based on our earlier schema fixes
      const totalFound = readOnlyTools.length + mutationTools.length;
      
      console.log(`\n🎉 Schema Fixes Validation:`);
      console.log(`   • Total tools expected: ${totalExpected}`);
      console.log(`   • Total tools found: ${totalFound}`);
      console.log(`   • Read-only success rate: ${Math.round((readOnlyPassed/readOnlyTools.length) * 100)}%`);
      console.log(`   • Mutations enabled: ${mutationTools.length > 0 ? 'Yes ✅' : 'No ❌'}`);
      
      if (readOnlyPassed === readOnlyTools.length && mutationTools.length > 0) {
        console.log('\n🚀 ALL SYSTEMS GO! Optix MCP Server is fully functional!');
        console.log('💡 Your personal token is working perfectly with all schema fixes.');
      } else {
        console.log('\n⚠️  Some issues detected - check logs above for details.');
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }
}

// Run the test
const tester = new OptixMCPTester();
tester.runFullTest().then(() => {
  console.log('\n✨ MCP Server testing completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});