/**
 * Test Vendor Service Creation - After Subcategory Fix
 * This script verifies the service creation works without subcategory error
 */

const API_URL = "http://localhost:5000/api";

// Test data
const testService = {
  title: "AC Repair Service",
  category: "AC Repair",
  price: 499,
  description: "Professional AC repair and maintenance"
};

async function testServiceCreation() {
  console.log("\n" + "=".repeat(60));
  console.log("TESTING SERVICE CREATION - SUBCATEGORY FIX VERIFICATION");
  console.log("=".repeat(60) + "\n");

  // Note: You'll need to get a valid vendor token first
  const token = process.env.VENDOR_TOKEN;
  
  if (!token) {
    console.log("⚠️  VENDOR_TOKEN not set");
    console.log("\nTo test, follow these steps:");
    console.log("1. Log in as vendor at http://localhost:5173/vendor/login");
    console.log("2. Open browser console (F12) and run:");
    console.log("   console.log(localStorage.getItem('vendorToken'))");
    console.log("3. Copy the token and set it:");
    console.log("   $env:VENDOR_TOKEN = 'your_token_here'");
    console.log("4. Run this script again\n");
    return;
  }

  try {
    console.log("✓ Testing with token: " + token.substring(0, 20) + "...\n");
    
    console.log("Sending service creation request...");
    console.log("Data:", JSON.stringify(testService, null, 2));
    console.log("\nWaiting for response...\n");

    const response = await fetch(`${API_URL}/vendor/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testService)
    });

    const result = await response.json();

    if (response.status === 201) {
      console.log("✅ SUCCESS! Service created without errors!\n");
      console.log("Response:", JSON.stringify(result, null, 2));
      console.log("\nKey fields:");
      console.log(`  ID: ${result._id}`);
      console.log(`  Title: ${result.title}`);
      console.log(`  Category: ${result.category}`);
      console.log(`  Subcategory: ${result.subcategory}`);
      console.log(`  Price: ₹${result.price}`);
      console.log(`  Active: ${result.active}`);
      console.log(`  Created at: ${result.createdAt}\n`);
    } else if (response.status === 400) {
      console.log("❌ Validation Error:", result.message);
    } else if (response.status === 401) {
      console.log("❌ Unauthorized:", result.message);
      console.log("Token may be expired. Please log in again.\n");
    } else {
      console.log(`❌ Error (${response.status}):`, result.message);
    }

  } catch (error) {
    console.log("❌ Request failed:", error.message);
    console.log("\nMake sure:");
    console.log("  1. Backend is running: npm run backend:dev");
    console.log("  2. MongoDB is connected");
    console.log("  3. You have a valid vendor token\n");
  }

  console.log("=".repeat(60) + "\n");
}

// Run the test
testServiceCreation();
