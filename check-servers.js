import fetch from 'node-fetch';

async function checkServers() {
  try {
    // Check backend
    const backendRes = await fetch('http://localhost:5000/api/health');
    const backendData = await backendRes.json();
    console.log('✅ Backend:', backendData);
  } catch (e) {
    console.log('❌ Backend not responding');
  }
}

checkServers();
