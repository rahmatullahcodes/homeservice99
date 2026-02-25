// Quick API test
async function testSignup() {
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
  console.log('Signup Response:', response.status, data);
}

async function testLogin() {
  const response = await fetch('http://localhost:5000/api/auth/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  console.log('Login Response:', response.status, data);
}

testSignup().then(() => testLogin()).catch(err => console.error('Error:', err));
