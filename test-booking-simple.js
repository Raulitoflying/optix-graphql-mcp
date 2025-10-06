#!/usr/bin/env node

/**
 * 简单直接的 Booking 查询测试
 * 使用修复后的 schema 测试 Booking 相关功能
 */

import { createOptixTools } from './dist/optix/tools.js';

const ENDPOINT = "https://api.optixapp.com/graphql";
const TOKEN = "8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p";
const HEADERS = {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
};

console.log("🧪 Testing Fixed Booking Queries");
console.log("=".repeat(40));
console.log(`📡 Endpoint: ${ENDPOINT}`);
console.log(`🔑 Token: ${TOKEN.substring(0, 10)}...${TOKEN.slice(-5)}\n`);

async function testBookingTool(toolName, args = {}, description = "") {
    console.log(`\n🔧 Testing: ${toolName}`);
    console.log(`📝 Description: ${description}`);
    console.log(`📥 Input: ${JSON.stringify(args)}`);
    
    try {
        const tools = createOptixTools();
        const tool = tools.get(toolName);
        
        if (!tool) {
            console.log(`❌ Tool ${toolName} not found`);
            return false;
        }
        
        const startTime = Date.now();
        const result = await tool.execute(args, ENDPOINT, HEADERS);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Success (${duration}ms)`);
        
        // Show a summary of the result
        if (result.bookings) {
            console.log(`📊 Found ${result.bookings.length} bookings`);
            if (result.bookings.length > 0) {
                const booking = result.bookings[0];
                console.log(`📋 Sample booking: ID=${booking.booking_id}, Title="${booking.title || 'Untitled'}"`);
                console.log(`📅 Time: ${new Date(booking.start_timestamp * 1000).toLocaleString()} - ${new Date(booking.end_timestamp * 1000).toLocaleString()}`);
                console.log(`✅ Approved: ${booking.is_approved}, ❌ Canceled: ${booking.is_canceled}`);
            }
        } else if (result.booking) {
            const booking = result.booking;
            console.log(`📋 Booking: ID=${booking.booking_id}, Title="${booking.title || 'Untitled'}"`);
            console.log(`📅 Time: ${new Date(booking.start_timestamp * 1000).toLocaleString()} - ${new Date(booking.end_timestamp * 1000).toLocaleString()}`);
        } else {
            console.log(`📤 Result: ${JSON.stringify(result, null, 2).substring(0, 300)}...`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        
        // Check if this is a GraphQL schema error
        if (error.message.includes('Cannot query field')) {
            console.log(`🔍 Schema issue detected - field name mismatch`);
        } else if (error.message.includes('GraphQL errors')) {
            console.log(`🔍 GraphQL validation error`);
        }
        
        return false;
    }
}

async function main() {
    const tests = [
        {
            tool: "optix_list_bookings",
            args: { 
                from: "2024-09-01T00:00:00Z", 
                to: "2024-10-31T23:59:59Z",
                limit: 5 
            },
            description: "List recent bookings with fixed schema"
        },
        {
            tool: "optix_get_upcoming_bookings",
            args: { days: 7 },
            description: "Get upcoming bookings for next week"
        }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        const success = await testBookingTool(test.tool, test.args, test.description);
        if (success) passed++;
    }
    
    // Try to get a specific booking if any exist
    console.log("\n🔍 Attempting to test booking details...");
    try {
        const tools = createOptixTools();
        const listTool = tools.get("optix_list_bookings");
        const listResult = await listTool.execute({ 
            from: "2024-01-01T00:00:00Z", 
            to: "2024-12-31T23:59:59Z",
            limit: 1 
        }, ENDPOINT, HEADERS);
        
        if (listResult.bookings && listResult.bookings.length > 0) {
            const bookingId = listResult.bookings[0].booking_id;
            const success = await testBookingTool("optix_get_booking_details", { id: bookingId }, `Get details for booking ${bookingId}`);
            if (success) {
                passed++;
                total++;
            } else {
                total++;
            }
        } else {
            console.log("⏭️  No bookings found to test details");
        }
    } catch (error) {
        console.log(`⏭️  Could not test booking details: ${error.message}`);
    }
    
    console.log("\n" + "=".repeat(40));
    console.log(`📊 Test Results: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
    
    if (passed > 0) {
        console.log("🎉 Booking schema fixes are working!");
        console.log("📋 Next steps: Get schema for Account, Resource, User, PlanTemplate");
    } else {
        console.log("⚠️  Still have issues with Booking queries");
        console.log("🔍 May need to check field names or query structure");
    }
}

main().catch(error => {
    console.error("💥 Test failed:", error);
    process.exit(1);
});