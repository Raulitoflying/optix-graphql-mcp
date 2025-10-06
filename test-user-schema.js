#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testUserFieldsSchema() {
  console.log('🧪 Testing User schema fields...\n');
  
  // 测试基本 user 字段
  const basicUserQuery = `
    query TestUserFields {
      me {
        user {
          user_id
          name
          email
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing basic user fields...');
    const result = await client.request(basicUserQuery);
    console.log('   ✅ Basic user fields work');
    console.log(`   👤 User: ${result.me.user.name} (${result.me.user.email})`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // 测试有争议的 first_name/last_name 字段
  const nameFieldsQuery = `
    query TestNameFields {
      me {
        user {
          user_id
          name
          email
          first_name
          last_name
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing first_name/last_name fields...');
    const result = await client.request(nameFieldsQuery);
    console.log('   ✅ first_name/last_name fields work');
    console.log(`   👤 Name: ${result.me.user.first_name} ${result.me.user.last_name}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
}

testUserFieldsSchema().then(() => {
  console.log('\n✨ User schema test completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});