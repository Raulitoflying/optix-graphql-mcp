#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testPaginationSchema() {
  console.log('🧪 Testing pagination schema...\n');
  
  const paginationQuery = `
    query TestPagination {
      bookings(limit: 2) {
        data {
          booking_id
          title
        }
        pagination {
          total
          page
          limit
          has_next_page
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing pagination fields...');
    const result = await client.request(paginationQuery);
    console.log('   ✅ Pagination fields work correctly');
    console.log(`   📊 Total: ${result.bookings.pagination.total}`);
    console.log(`   📄 Page: ${result.bookings.pagination.page}`);
    console.log(`   📊 Limit: ${result.bookings.pagination.limit}`);
    console.log(`   ➡️  Has next: ${result.bookings.pagination.has_next_page}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
  
  console.log('');
  
  // 测试没有 pagination 的版本
  const noPaginationQuery = `
    query TestNoPagination {
      bookings(limit: 2) {
        data {
          booking_id
          title
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing without pagination...');
    const result = await client.request(noPaginationQuery);
    console.log('   ✅ Query works without pagination');
    console.log(`   📊 Found ${result.bookings.data.length} bookings`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

testPaginationSchema().then(() => {
  console.log('\n✨ Pagination schema test completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});