/**
 * Vendor Services Integration Test
 * This script tests all vendor service operations
 */

const API_URL = "http://localhost:5000/api";

// Test credentials (you'll need a vendor token)
let vendorToken = null;
let testServiceId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRequest(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  return {
    status: response.status,
    data: await response.json()
  };
}

async function runTests() {
  log('\n════════════════════════════════════════════════════════════════', 'cyan');
  log('    VENDOR SERVICES INTEGRATION TEST', 'cyan');
  log('════════════════════════════════════════════════════════════════\n', 'cyan');

  try {
    // 1. Test without authentication
    log('TEST 1: GET services without authentication', 'yellow');
    let result = await testRequest('GET', '/vendor/services');
    if (result.status === 401 || result.status === 403) {
      log('✓ Correctly rejected unauthenticated request\n', 'green');
    } else {
      log('✗ Should require authentication\n', 'red');
    }

    // 2. Check if vendor token exists
    log('TEST 2: Check for vendor token', 'yellow');
    vendorToken = process.env.VENDOR_TOKEN;
    if (!vendorToken) {
      log('⚠ VENDOR_TOKEN environment variable not set', 'yellow');
      log('To run full tests, set: export VENDOR_TOKEN="your_token"\n', 'yellow');
      log('Skipping authenticated tests...\n', 'yellow');
      return;
    }
    log('✓ Vendor token found\n', 'green');

    // 3. GET all services
    log('TEST 3: GET /vendor/services (fetch all)', 'yellow');
    result = await testRequest('GET', '/vendor/services', null, vendorToken);
    if (result.status === 200) {
      log(`✓ Successfully fetched ${Array.isArray(result.data) ? result.data.length : 0} services\n`, 'green');
    } else {
      log(`✗ Failed to fetch services: ${result.data.message}\n`, 'red');
    }

    // 4. POST create service
    log('TEST 4: POST /vendor/services (create new service)', 'yellow');
    const newService = {
      title: 'Test Service ' + Date.now(),
      category: 'AC Repair',
      price: 499,
      description: 'This is a test service for integration testing'
    };
    result = await testRequest('POST', '/vendor/services', newService, vendorToken);
    if (result.status === 201) {
      testServiceId = result.data._id;
      log(`✓ Service created successfully (ID: ${testServiceId})\n`, 'green');
    } else {
      log(`✗ Failed to create service: ${result.data.message}\n`, 'red');
    }

    // 5. PATCH update service
    if (testServiceId) {
      log('TEST 5: PATCH /vendor/services/:id (update service)', 'yellow');
      const updates = {
        price: 599,
        description: 'Updated test service description'
      };
      result = await testRequest('PATCH', `/vendor/services/${testServiceId}`, updates, vendorToken);
      if (result.status === 200) {
        log(`✓ Service updated successfully\n`, 'green');
      } else {
        log(`✗ Failed to update service: ${result.data.message}\n`, 'red');
      }

      // 6. PATCH toggle status
      log('TEST 6: PATCH /vendor/services/:id (toggle active status)', 'yellow');
      const currentActive = result.data.active;
      const toggleData = { active: !currentActive };
      result = await testRequest('PATCH', `/vendor/services/${testServiceId}`, toggleData, vendorToken);
      if (result.status === 200) {
        log(`✓ Service status toggled (active: ${result.data.active})\n`, 'green');
      } else {
        log(`✗ Failed to toggle status: ${result.data.message}\n`, 'red');
      }

      // 7. Test validation - missing fields
      log('TEST 7: Validation test - missing required fields', 'yellow');
      const invalidService = {
        title: 'Invalid Service'
        // Missing category and price
      };
      result = await testRequest('POST', '/vendor/services', invalidService, vendorToken);
      if (result.status === 400) {
        log(`✓ Correctly rejected invalid service: ${result.data.message}\n`, 'green');
      } else {
        log(`✗ Should validate required fields\n`, 'red');
      }

      // 8. Test validation - invalid price
      log('TEST 8: Validation test - invalid price (zero/negative)', 'yellow');
      const zeroPriceService = {
        title: 'Invalid Price Service',
        category: 'Cleaning',
        price: 0
      };
      result = await testRequest('POST', '/vendor/services', zeroPriceService, vendorToken);
      if (result.status === 400) {
        log(`✓ Correctly rejected zero price: ${result.data.message}\n`, 'green');
      } else {
        log(`✗ Should validate price > 0\n`, 'red');
      }

      // 9. DELETE service
      log('TEST 9: DELETE /vendor/services/:id (delete service)', 'yellow');
      result = await testRequest('DELETE', `/vendor/services/${testServiceId}`, null, vendorToken);
      if (result.status === 200) {
        log(`✓ Service deleted successfully\n`, 'green');
      } else {
        log(`✗ Failed to delete service: ${result.data.message}\n`, 'red');
      }

      // 10. Verify deletion
      log('TEST 10: Verify service was deleted', 'yellow');
      result = await testRequest('GET', `/vendor/services/${testServiceId}`, null, vendorToken);
      if (result.status === 404) {
        log(`✓ Service confirmed deleted\n`, 'green');
      } else if (result.status === 200) {
        log(`✗ Service still exists after deletion\n`, 'red');
      }
    }

    log('════════════════════════════════════════════════════════════════', 'cyan');
    log('    TESTS COMPLETED', 'cyan');
    log('════════════════════════════════════════════════════════════════\n', 'cyan');

  } catch (error) {
    log(`\n✗ Test Error: ${error.message}\n`, 'red');
    log('Make sure:');
    log('1. Backend server is running (npm run backend:dev)');
    log('2. MongoDB is connected');
    log('3. You are logged in as a vendor\n', 'yellow');
  }
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await fetch(`${API_URL}/../health`, { timeout: 5000 }).catch(() => ({ status: 500 }));
    return true;
  } catch {
    return false;
  }
}

// Run tests
(async () => {
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    log('✗ Backend server is not running at ' + API_URL, 'red');
    log('Start the backend with: npm run backend:dev\n', 'yellow');
    process.exit(1);
  }
  
  await runTests();
})();
