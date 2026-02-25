#!/bin/bash
# Vendor Login Integration Test Script
# This script automates testing of vendor login, dashboard, and admin integration

echo "🎯 HomeService99 Vendor Login Integration Test"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Configuration
API_URL="http://localhost:5000/api"
VENDOR_EMAIL="test.vendor@example.com"
VENDOR_PASSWORD="password123"
VENDOR_NAME="Test Services Pvt Ltd"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to test API endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5

    echo -e "${YELLOW}Testing: $name${NC}"

    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ $http_code -eq 200 ] || [ $http_code -eq 201 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        echo "Response: $body" | head -c 100
        echo "..."
        echo ""
        ((TESTS_PASSED++))
        # Extract token if present
        if echo "$body" | grep -q "token"; then
            TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        elif echo "$body" | grep -q "accessToken"; then
            TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        fi
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        echo ""
        ((TESTS_FAILED++))
        return 1
    fi
}

# Check if backend is running
print_section "1️⃣  Checking Backend Connection"

if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on $API_URL${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo "Please start backend: cd backend && npm start"
    exit 1
fi

# Test Vendor Signup
print_section "2️⃣  Testing Vendor Registration"

signup_data="{
  \"businessName\": \"$VENDOR_NAME\",
  \"email\": \"$VENDOR_EMAIL\",
  \"phone\": \"9876543210\",
  \"city\": \"Delhi\",
  \"category\": \"AC Repair\",
  \"password\": \"$VENDOR_PASSWORD\"
}"

if test_endpoint "Vendor Signup" "POST" "/auth/vendor/signup" "$signup_data"; then
    VENDOR_TOKEN=$TOKEN
fi

# Test Vendor Login
print_section "3️⃣  Testing Vendor Login"

login_data="{
  \"email\": \"$VENDOR_EMAIL\",
  \"password\": \"$VENDOR_PASSWORD\"
}"

if test_endpoint "Vendor Login" "POST" "/auth/vendor/login" "$login_data"; then
    VENDOR_TOKEN=$TOKEN
    echo -e "${GREEN}Token obtained: ${TOKEN:0:20}...${NC}"
fi

# Test Get Vendor Profile
print_section "4️⃣  Testing Profile Retrieval"

if [ -z "$VENDOR_TOKEN" ]; then
    echo -e "${RED}✗ Cannot test profile - no token${NC}"
else
    test_endpoint "Get Vendor Profile" "GET" "/vendor/me" "" "$VENDOR_TOKEN"
fi

# Test Update Vendor Profile
print_section "5️⃣  Testing Profile Update"

if [ -z "$VENDOR_TOKEN" ]; then
    echo -e "${RED}✗ Cannot test profile update - no token${NC}"
else
    update_data="{
      \"businessName\": \"$VENDOR_NAME - Updated\",
      \"phone\": \"9876543211\"
    }"
    test_endpoint "Update Profile" "PATCH" "/auth/vendor/profile" "$update_data" "$VENDOR_TOKEN"
fi

# Test Get Vendor Services
print_section "6️⃣  Testing Services Retrieval"

if [ -z "$VENDOR_TOKEN" ]; then
    echo -e "${RED}✗ Cannot test services - no token${NC}"
else
    test_endpoint "Get Vendor Services" "GET" "/vendor/services" "" "$VENDOR_TOKEN"
fi

# Test Create Service
print_section "7️⃣  Testing Service Creation"

if [ -z "$VENDOR_TOKEN" ]; then
    echo -e "${RED}✗ Cannot test service creation - no token${NC}"
else
    service_data="{
      \"title\": \"AC Installation\",
      \"category\": \"AC Repair\",
      \"price\": 500
    }"
    test_endpoint "Create Service" "POST" "/vendor/services" "$service_data" "$VENDOR_TOKEN"
fi

# Print Summary
print_section "📊 Test Summary"

echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}Failed: $TESTS_FAILED${NC}"
fi

echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the issues above.${NC}"
    exit 1
fi
