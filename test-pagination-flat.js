#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function explorePaginationStructure() {
  console.log('🔍 Exploring pagination structure...\n');
  
  // 尝试查看 bookings 的完整结构
  const exploreQuery = `
    query ExplorePagination {
      bookings(limit: 1) {
        data {
          booking_id
        }
        total
        page
        limit
        has_next_page
      }
    }
  `;
  
  try {
    console.log('📋 Testing flat pagination structure...');
    const result = await client.request(exploreQuery);
    console.log('   ✅ Flat pagination structure works!');
    console.log(`   📊 Total: ${result.bookings.total}`);
    console.log(`   📄 Page: ${result.bookings.page}`);
    console.log(`   📊 Limit: ${result.bookings.limit}`);
    console.log(`   ➡️  Has next: ${result.bookings.has_next_page}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
}

explorePaginationStructure().then(() => {
  console.log('\n✨ Pagination exploration completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});