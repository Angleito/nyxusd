/**
 * Test script for email subscription endpoints
 * Run with: node test-subscriptions.mjs
 */

const API_BASE = 'http://localhost:3000/api';

// Test data
const testEmail = `test-${Date.now()}@example.com`;

console.log('Testing Email Subscription Endpoints...\n');

// Test 1: POST - Create subscription
console.log('1. Testing POST /api/subscriptions');
try {
  const createResponse = await fetch(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testEmail,
      source: 'test-script'
    })
  });
  
  const createData = await createResponse.json();
  console.log(`   Status: ${createResponse.status}`);
  console.log(`   Response:`, createData);
  console.log(`   ✓ Success: ${createData.success}\n`);
} catch (error) {
  console.error('   ✗ Error:', error.message, '\n');
}

// Test 2: GET - Check subscription status
console.log('2. Testing GET /api/subscriptions');
try {
  const checkResponse = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(testEmail)}`);
  const checkData = await checkResponse.json();
  console.log(`   Status: ${checkResponse.status}`);
  console.log(`   Response:`, checkData);
  console.log(`   ✓ Found: ${checkData.subscription ? 'Yes' : 'No'}\n`);
} catch (error) {
  console.error('   ✗ Error:', error.message, '\n');
}

// Test 3: GET - Count subscriptions
console.log('3. Testing GET /api/subscriptions/count');
try {
  const countResponse = await fetch(`${API_BASE}/subscriptions/count`);
  const countData = await countResponse.json();
  console.log(`   Status: ${countResponse.status}`);
  console.log(`   Response:`, countData);
  console.log(`   ✓ Count: ${countData.count}\n`);
} catch (error) {
  console.error('   ✗ Error:', error.message, '\n');
}

// Test 4: DELETE - Unsubscribe
console.log('4. Testing DELETE /api/subscriptions');
try {
  const deleteResponse = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(testEmail)}`, {
    method: 'DELETE'
  });
  const deleteData = await deleteResponse.json();
  console.log(`   Status: ${deleteResponse.status}`);
  console.log(`   Response:`, deleteData);
  console.log(`   ✓ Success: ${deleteData.success}\n`);
} catch (error) {
  console.error('   ✗ Error:', error.message, '\n');
}

// Test 5: Rate limiting
console.log('5. Testing Rate Limiting (6 requests)');
try {
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(
      fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.100' // Simulate same IP
        },
        body: JSON.stringify({
          email: `ratelimit-${i}@example.com`,
          source: 'rate-limit-test'
        })
      })
    );
  }
  
  const results = await Promise.all(promises);
  const statuses = results.map(r => r.status);
  console.log(`   Statuses: ${statuses.join(', ')}`);
  console.log(`   ✓ Rate limited: ${statuses.includes(429) ? 'Yes' : 'No'}\n`);
} catch (error) {
  console.error('   ✗ Error:', error.message, '\n');
}

console.log('✅ All tests completed!');
console.log('\nNote: For production testing, ensure Vercel KV environment variables are set.');