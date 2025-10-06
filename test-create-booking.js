#!/usr/bin/env node

const mutation = `
mutation CreateBooking($input: BookingSetInput!) {
  bookingsCommit(input: $input) {
    booking_session_id
    account {
      account_id
      name
      email
    }
    bookings {
      booking_id
      title
      notes
      start_timestamp
      end_timestamp
      is_confirmed
      is_canceled
      resource_id
    }
  }
}
`;

const variables = {
  input: {
    account: {
      account_id: "387249"
    },
    title: "测试预订",
    notes: "通过 API 测试创建",
    bookings: [{
      resource_id: ["602411"],
      start_timestamp: Math.floor(new Date("2025-10-07T10:00:00Z").getTime() / 1000),
      end_timestamp: Math.floor(new Date("2025-10-07T12:00:00Z").getTime() / 1000),
    }]
  }
};

console.log('Variables:', JSON.stringify(variables, null, 2));

fetch('https://api.optixapp.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 71d449023f72cfca1887fa2809e99d6b61672337o'
  },
  body: JSON.stringify({ query: mutation, variables })
})
.then(res => res.json())
.then(data => {
  console.log('\nResponse:', JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error:', err));
