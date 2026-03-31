// Test script to verify service API endpoints
const API_BASE_URL = "http://localhost:5000/api";

async function testServiceAPI() {
  console.log("🧪 Testing Service API Endpoints...\n");

  try {
    // First, get admin token
    console.log("1️⃣  Attempting login to get admin token...");
    const loginRes = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@demo.com",
        password: "admin123"
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("✅ Login successful, token:", token.substring(0, 20) + "...\n");

    // Test GET services
    console.log("2️⃣  Testing GET /api/admin/services...");
    const getRes = await fetch(`${API_BASE_URL}/admin/services`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!getRes.ok) {
      throw new Error(`GET failed: ${getRes.status}`);
    }

    const services = await getRes.json();
    console.log("✅ GET successful, services count:", services.length, "\n");

    // Test POST create service
    console.log("3️⃣  Testing POST /api/admin/services (create)...");
    const createRes = await fetch(`${API_BASE_URL}/admin/services`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Test Service",
        category: "Electrical",
        price: 500
      })
    });

    const responseText = await createRes.text();
    console.log("Status:", createRes.status);
    console.log("Response:", responseText);

    if (!createRes.ok) {
      console.error("❌ POST failed!");
      return;
    }

    const newService = JSON.parse(responseText);
    console.log("✅ Service created:", newService._id, "\n");

    // Test PATCH toggle status
    console.log("4️⃣  Testing PATCH /api/admin/services/:id/toggle...");
    const toggleRes = await fetch(
      `${API_BASE_URL}/admin/services/${newService._id}/toggle`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!toggleRes.ok) {
      throw new Error(`PATCH failed: ${toggleRes.status}`);
    }

    const toggledService = await toggleRes.json();
    console.log("✅ Status toggled, active:", toggledService.active, "\n");

    // Test DELETE
    console.log("5️⃣  Testing DELETE /api/admin/services/:id...");
    const deleteRes = await fetch(
      `${API_BASE_URL}/admin/services/${newService._id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!deleteRes.ok) {
      throw new Error(`DELETE failed: ${deleteRes.status}`);
    }

    console.log("✅ Service deleted\n");
    console.log("🎉 All API tests passed!");

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testServiceAPI();
