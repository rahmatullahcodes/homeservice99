// Debug script to test vendor login exactly like frontend would
async function testFrontendLogin() {
  const baseUrl = 'http://localhost:5000/api';
  const email = 'mdrahmatullahquraishi@gmail.com';
  const password = 'admin123';

  try {
    console.log('🧪 Testing Vendor Login (Frontend Style)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🌐 Endpoint:', `${baseUrl}/auth/vendor/login`);
    console.log('');

    const response = await fetch(`${baseUrl}/auth/vendor/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', {
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length')
    });

    const data = await response.json();
    
    console.log('');
    console.log('📥 Response Body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('');
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('🎫 Token Preview:', data.token.substring(0, 50) + '...');
      console.log('👤 Vendor:', {
        _id: data.vendor._id,
        email: data.vendor.email,
        businessName: data.vendor.businessName,
        verified: data.vendor.verified
      });
      return true;
    } else {
      console.log('');
      console.log('❌ LOGIN FAILED!');
      console.log('Error Message:', data.message);
      return false;
    }
  } catch (err) {
    console.log('');
    console.log('💥 Network Error:', err.message);
    console.log('Stack:', err.stack);
    return false;
  }
}

testFrontendLogin().then(success => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(success ? 0 : 1);
});
