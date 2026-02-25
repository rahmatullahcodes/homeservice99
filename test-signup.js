#!/usr/bin/env node

async function testSignup() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Signup Response:', JSON.stringify(data, null, 2));
    
    if (data.token) {
      console.log('\n✅ API is working! Token:', data.token.substring(0, 30) + '...');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSignup();
