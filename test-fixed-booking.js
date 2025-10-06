#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('https://api.optixapp.com/graphql', {
  headers: {
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p',
    'Content-Type': 'application/json'
  }
});

async function testFixedBookingQueries() {
  console.log('🧪 Testing fixed Booking queries with pagination...\n');
  
  // 测试修复后的 LIST_BOOKINGS
  const listQuery = `
    query ListBookings {
      bookings(limit: 3) {
        data {
          booking_id
          title
          start_timestamp
          end_timestamp
          is_new
          is_approved
          is_canceled
          account {
            account_id
            name
          }
          resource {
            resource_id
            name
          }
        }
        total
      }
    }
  `;
  
  try {
    console.log('📋 Testing LIST_BOOKINGS with total field...');
    const result = await client.request(listQuery);
    console.log('   ✅ LIST_BOOKINGS works with pagination!');
    console.log(`   📊 Total bookings: ${result.bookings.total}`);
    console.log(`   📊 Retrieved: ${result.bookings.data.length} bookings`);
    
    if (result.bookings.data.length > 0) {
      const booking = result.bookings.data[0];
      console.log(`   📋 Sample: ${booking.title || 'Untitled'} (${booking.is_approved ? 'Approved' : 'Pending'})`);
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
  
  // 测试修复后的 GET_UPCOMING_BOOKINGS
  const upcomingQuery = `
    query GetUpcomingBookings {
      bookings(
        limit: 5
        include_new: true
        include_approved: true
        order: START_TIMESTAMP_ASC
      ) {
        data {
          booking_id
          title
          start_timestamp
          is_new
          is_approved
        }
        total
      }
    }
  `;
  
  try {
    console.log('📋 Testing GET_UPCOMING_BOOKINGS with total field...');
    const result = await client.request(upcomingQuery);
    console.log('   ✅ GET_UPCOMING_BOOKINGS works with pagination!');
    console.log(`   📊 Total upcoming: ${result.bookings.total}`);
    console.log(`   📊 Retrieved: ${result.bookings.data.length} bookings`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response && error.response.errors) {
      error.response.errors.forEach(err => {
        console.log(`      - ${err.message}`);
      });
    }
  }
  
  console.log('');
  
  // 测试 GET_BOOKING (如果有 booking ID)
  if (process.argv[2]) {
    const detailQuery = `
      query GetBooking($booking_id: ID!) {
        booking(booking_id: $booking_id) {
          booking_id
          title
          notes
          start_timestamp
          end_timestamp
          is_new
          is_approved
          is_canceled
          payment {
            unit_amount
            total
            price_description
          }
          account {
            account_id
            name
          }
          resource {
            resource_id
            name
            location {
              location_id
              name
            }
          }
        }
      }
    `;
    
    try {
      console.log(`📋 Testing GET_BOOKING for ID: ${process.argv[2]}...`);
      const result = await client.request(detailQuery, { booking_id: process.argv[2] });
      console.log('   ✅ GET_BOOKING works with payment structure!');
      console.log(`   📋 Booking: ${result.booking.title}`);
      if (result.booking.payment) {
        console.log(`   💰 Payment: ${result.booking.payment.unit_amount} (${result.booking.payment.price_description})`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

testFixedBookingQueries().then(() => {
  console.log('\n🎉 Fixed Booking queries test completed!');
  console.log('💡 Usage: node test-fixed-booking.js [booking_id] to test specific booking');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});