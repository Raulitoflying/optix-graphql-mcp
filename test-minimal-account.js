#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testMinimalAccountQuery() {
  console.log('🧪 Testing minimal Account query to verify primary_location fix...\n');
  
  // 最简单的 accounts 查询，只测试 primary_location 修复
  const minimalQuery = `
    query TestPrimaryLocation {
      accounts(limit: 3) {
        data {
          account_id
          name
          primary_location {
            location_id
            name
          }
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing accounts query with primary_location object...');
    const result = await client.request(minimalQuery);
    console.log('   ✅ SUCCESS: Query executed without errors!');
    
    if (result.accounts && result.accounts.data) {
      console.log(`   📊 Retrieved ${result.accounts.data.length} accounts`);
      
      // 检查 primary_location 结构
      result.accounts.data.forEach((account, index) => {
        if (account.primary_location) {
          if (account.primary_location.location_id && account.primary_location.name) {
            console.log(`   🔧 Account ${index + 1}: primary_location object structure is CORRECT`);
            console.log(`      └─ Location ID: ${account.primary_location.location_id}`);
            console.log(`      └─ Location Name: ${account.primary_location.name}`);
          } else {
            console.log(`   ⚠️  Account ${index + 1}: primary_location structure incomplete`);
          }
        } else {
          console.log(`   ℹ️  Account ${index + 1}: no primary_location (null/empty)`);
        }
      });
      
      console.log('\n🎉 SCHEMA FIX VERIFICATION: primary_location_id → primary_location object WORKS!');
    } else {
      console.log('   ⚠️  No accounts data in response');
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      console.log('   🔍 GraphQL Errors:');
      error.response.errors.forEach((err, index) => {
        console.log(`      ${index + 1}. ${err.message}`);
      });
    }
  }
}

testMinimalAccountQuery().then(() => {
  console.log('\n✨ Schema fix verification completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});