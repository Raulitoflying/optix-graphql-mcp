#!/usr/bin/env node

// 直接测试 GraphQL 查询，不通过 MCP 
const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testAccountQueries() {
  console.log('🧪 Testing Account schema fixes with real Optix API...\n');
  
  // 测试修复后的组织信息查询
  const orgQuery = `
    query GetOrganizationInfo {
      organization {
        organization_id
        name
        subscription_status
        settings {
          timezone
          currency
        }
        members {
          account_id
          name
          type
          email
          status
          primary_location {
            location_id
            name
          }
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing GET_ORGANIZATION_INFO with fixed schema...');
    const result = await client.request(orgQuery);
    console.log('   ✅ Success: Organization query works with primary_location object');
    
    // 检查是否有 members 数据
    if (result.organization && result.organization.members) {
      console.log(`   📊 Found ${result.organization.members.length} members`);
      
      // 检查第一个成员的 primary_location 结构
      if (result.organization.members.length > 0) {
        const member = result.organization.members[0];
        if (member.primary_location && member.primary_location.location_id) {
          console.log('   🔧 Schema fix confirmed: primary_location has location_id and name');
        }
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
  
  console.log('');
  
  // 测试简单的 members 列表查询
  const membersQuery = `
    query ListMembers {
      accounts(type: ["member"], limit: 5) {
        data {
          account_id
          name
          email
          status
          primary_location {
            location_id
            name
          }
        }
        pagination {
          total
        }
      }
    }
  `;
  
  try {
    console.log('📋 Testing LIST_MEMBERS with fixed schema...');
    const result = await client.request(membersQuery);
    console.log('   ✅ Success: Members query works with primary_location object');
    
    if (result.accounts && result.accounts.data) {
      console.log(`   📊 Found ${result.accounts.data.length} members in results`);
      console.log(`   📊 Total members: ${result.accounts.pagination.total}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
}

testAccountQueries().then(() => {
  console.log('\n✨ Account schema fixes test completed!');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});