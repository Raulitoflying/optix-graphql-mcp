#!/usr/bin/env node

const now = Math.floor(Date.now() / 1000);
const future = now + (365 * 24 * 60 * 60);

const query = `
query GetSchedule($start_from: Int, $start_to: Int, $limit: Int) {
  schedule(
    start_timestamp_from: $start_from
    start_timestamp_to: $start_to
    limit: $limit
  ) {
    data {
      type
      booking_id
      assignment_id
      tour_id
      availability_block_id
      title
      start_timestamp
      end_timestamp
      status
      is_recurring
      resource {
        resource_id
        name
        title
      }
      location {
        location_id
        name
      }
      owner_account {
        account_id
        name
        email
      }
      payer_account {
        account_id
        name
        email
      }
    }
    total
  }
}
`;

const variables = {
  start_from: now,
  start_to: future,
  limit: 100
};

fetch('https://api.optixapp.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 8864cb42b793c6f04fc2cf214fb1c9eff7db2c21p'
  },
  body: JSON.stringify({ query, variables })
})
.then(res => res.json())
.then(data => {
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error:', err));
