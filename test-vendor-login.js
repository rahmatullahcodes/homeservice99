async function testVendorLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/vendor/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'mdrahmatullahquraishi@gmail.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Token:', data.token);
      console.log('Vendor:', {
        email: data.vendor.email,
        businessName: data.vendor.businessName,
        verified: data.vendor.verified
      });
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testVendorLogin();
