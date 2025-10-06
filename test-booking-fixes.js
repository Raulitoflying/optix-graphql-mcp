#!/usr/bin/env node

// Test script to verify our Booking query fixes work with real API
const { spawn } = require('child_process');

const TOKEN = '8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p';

async function testWithMCP(toolName, args = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', ['dist/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { 
                ...process.env, 
                ENDPOINT: 'https://api.optixapp.com/graphql',
                HEADERS: `{"Authorization":"Bearer ${TOKEN}"}`,
                NAME: 'optix-test'
            }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        // Send MCP request
        const request = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
                name: toolName,
                arguments: args
            }
        };

        child.stdin.write(JSON.stringify(request) + '\n');
        child.stdin.end();

        setTimeout(() => {
            child.kill();
            reject(new Error('Test timeout'));
        }, 15000);
    });
}

async function runBookingTests() {
    console.log('🧪 Testing Updated Booking Queries');
    console.log('===================================\n');

    const tests = [
        {
            name: 'List Bookings (Updated Query)',
            tool: 'list_bookings',
            args: { limit: 5 }
        },
        {
            name: 'Get Upcoming Bookings (Updated Query)', 
            tool: 'get_upcoming_bookings',
            args: { limit: 3 }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`📋 ${test.name}...`);
            const result = await testWithMCP(test.tool, test.args);
            
            if (result.stderr.includes('Error') || result.stderr.includes('error')) {
                console.log('❌ FAILED');
                console.log('Error:', result.stderr.split('\n').find(l => l.includes('Error') || l.includes('error')));
                failed++;
            } else if (result.stdout.includes('"content"') && !result.stdout.includes('GraphQL error')) {
                console.log('✅ PASSED');
                passed++;
            } else {
                console.log('⚠️  UNCLEAR - Manual verification needed');
                console.log('Output:', result.stdout.substring(0, 200) + '...');
                failed++;
            }
            
        } catch (error) {
            console.log('❌ FAILED');
            console.log('Error:', error.message);
            failed++;
        }
        
        console.log('');
    }

    console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
    
    if (passed > 0) {
        console.log('\n🎉 Schema fixes are working! Ready to continue with other entities.');
    } else {
        console.log('\n⚠️  Still have issues. May need more schema adjustments.');
    }
}

// Build first, then test
console.log('🔨 Building project...');
const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildProcess.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Build successful\n');
        runBookingTests().catch(console.error);
    } else {
        console.log('❌ Build failed');
        process.exit(1);
    }
});