#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testFixedUserFields() {
  console.log('🧪 Testing fixed User schema fields...\n');
  
  const fixedUserQuery = `
    query TestFixedUserFields {
      me {
        user {
          user_id
          name
          email
          fullname
          surname
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing fixed user fields (fullname/surname)...');
    const result = await client.request(fixedUserQuery);
    console.log('   ✅ Fixed user fields work perfectly!');
    console.log(`   👤 Name: ${result.me.user.name}`);
    console.log(`   👤 Fullname: ${result.me.user.fullname}`);
    console.log(`   👤 Surname: ${result.me.user.surname}`);
    console.log(`   📧 Email: ${result.me.user.email}`);
    console.log(`   📊 Status: ${result.me.user.status}`);
    
    console.log('\n🎉 USER SCHEMA FIX: first_name/last_name → fullname/surname WORKS!');
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
}

testFixedUserFields().then(() => {
  console.log('\n✨ User schema fix test completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});