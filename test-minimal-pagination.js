#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testMinimalPagination() {
  console.log('🔍 Testing minimal pagination...\n');
  
  const minimalQuery = `
    query MinimalPagination {
      bookings(limit: 2) {
        data {
          booking_id
          title
        }
        total
      }
    }
  `;
  
  try {
    console.log('📋 Testing only total field...');
    const result = await client.request(minimalQuery);
    console.log('   ✅ Total field works!');
    console.log(`   📊 Total: ${result.bookings.total}`);
    console.log(`   📊 Data count: ${result.bookings.data.length}`);
    
    console.log('\n🎉 PAGINATION FIX: Only total field is available, remove other pagination fields');
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
}

testMinimalPagination().then(() => {
  console.log('\n✨ Minimal pagination test completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});