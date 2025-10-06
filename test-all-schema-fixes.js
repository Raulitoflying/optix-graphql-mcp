#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testAllSchemaFixes() {
  console.log('🧪 COMPREHENSIVE SCHEMA FIXES TEST');
  console.log('═'.repeat(50));
  console.log('Testing all major schema fixes applied:\n');
  
  const tests = [
    {
      name: 'Account Schema (primary_location fix)',
      description: 'primary_location_id → primary_location object',
      query: `
        query TestAccountSchema {
          accounts(limit: 2) {
            data {
              account_id
              name
              primary_location {
                location_id
                name
              }
            }
            total
          }
        }
      `
    },
    {
      name: 'User Schema (name fields fix)', 
      description: 'first_name/last_name → fullname/surname, removed status',
      query: `
        query TestUserSchema {
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
      `
    },
    {
      name: 'Booking Schema (pagination fix)',
      description: 'Added total field to bookings pagination',
      query: `
        query TestBookingPagination {
          bookings(limit: 3) {
            data {
              booking_id
              title
              is_new
              is_approved
              is_canceled
            }
            total
          }
        }
      `
    },
    {
      name: 'Resources Schema (pagination fix)',
      description: 'Simplified pagination to only total field',
      query: `
        query TestResourcesPagination {
          resources(limit: 2) {
            data {
              resource_id
              name
              is_bookable
            }
            total
          }
        }
      `
    },
    {
      name: 'Locations Schema (pagination fix)',
      description: 'Simplified pagination structure',
      query: `
        query TestLocationsPagination {
          locations(limit: 2) {
            data {
              location_id
              name
              address
            }
            total
          }
        }
      `
    }
  ];
  
  let passCount = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      console.log(`   Description: ${test.description}`);
      
      const startTime = Date.now();
      const result = await client.request(test.query);
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ SUCCESS (${duration}ms)`);
      
      // Show specific success details
      if (result.accounts) {
        console.log(`      → Found ${result.accounts.total} accounts, ${result.accounts.data.length} retrieved`);
        if (result.accounts.data[0]?.primary_location) {
          console.log(`      → primary_location object structure confirmed ✅`);
        }
      } else if (result.me?.user) {
        console.log(`      → User: ${result.me.user.fullname} ${result.me.user.surname} ✅`);
      } else if (result.bookings) {
        console.log(`      → Found ${result.bookings.total} bookings, pagination working ✅`);
      } else if (result.resources) {
        console.log(`      → Found ${result.resources.total} resources, pagination working ✅`);
      } else if (result.locations) {
        console.log(`      → Found ${result.locations.total} locations, pagination working ✅`);
      }
      
      passCount++;
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      if (error.response?.errors) {
        error.response.errors.forEach(err => {
          console.log(`      → ${err.message}`);
        });
      }
    }
    
    console.log('');
  }
  
  console.log('═'.repeat(50));
  console.log(`🎯 FINAL RESULTS: ${passCount}/${totalTests} tests passed`);
  console.log(`📊 Success Rate: ${Math.round((passCount/totalTests) * 100)}%`);
  
  if (passCount === totalTests) {
    console.log('🎉 ALL SCHEMA FIXES WORKING PERFECTLY!');
    console.log('🚀 Ready for production use with your personal token.');
  } else {
    console.log('⚠️  Some schema issues remain - check failed tests above.');
  }
  
  return passCount === totalTests;
}

testAllSchemaFixes().then((allPassed) => {
  console.log('\n✨ Comprehensive schema test completed!');
  process.exit(allPassed ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});