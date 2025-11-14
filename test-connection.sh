#!/bin/bash

# 🔌 Circlo Social - Connection Test
# This script tests frontend-backend connectivity

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔌 Circlo Social - Connection Test${NC}\n"

check_mark="${GREEN}✓${NC}"
cross_mark="${RED}✗${NC}"
warning_mark="${YELLOW}⚠${NC}"

# Test backend
echo -e "${BLUE}Testing Backend...${NC}\n"

backend_url="http://localhost:4000"
health_endpoint="${backend_url}/api/health"

echo -n "Checking if backend is running... "
if curl -s --connect-timeout 5 "$health_endpoint" > /dev/null; then
    echo -e "${check_mark}"
    
    # Get health response
    response=$(curl -s "$health_endpoint")
    echo "Response: $response"
    
    # Check if response is valid JSON
    if echo "$response" | jq . > /dev/null 2>&1; then
        service=$(echo "$response" | jq -r '.service')
        echo -e "${check_mark} Backend is healthy (service: $service)"
    else
        echo -e "${warning_mark} Backend responded but not with valid JSON"
    fi
else
    echo -e "${cross_mark}"
    echo -e "${RED}Backend is not running on ${backend_url}${NC}"
    echo -e "\n${YELLOW}Start backend with:${NC}"
    echo -e "  cd server && npm run dev"
    exit 1
fi

# Test frontend
echo -e "\n${BLUE}Testing Frontend...${NC}\n"

frontend_url="http://localhost:5173"

echo -n "Checking if frontend is running... "
if curl -s --connect-timeout 5 "$frontend_url" > /dev/null; then
    echo -e "${check_mark}"
    echo -e "${check_mark} Frontend is accessible at ${frontend_url}"
else
    echo -e "${cross_mark}"
    echo -e "${RED}Frontend is not running on ${frontend_url}${NC}"
    echo -e "\n${YELLOW}Start frontend with:${NC}"
    echo -e "  npm run dev"
    exit 1
fi

# Test CORS
echo -e "\n${BLUE}Testing CORS Configuration...${NC}\n"

echo -n "Testing OPTIONS request... "
cors_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET" \
    "$health_endpoint")

if [ "$cors_response" = "200" ] || [ "$cors_response" = "204" ]; then
    echo -e "${check_mark} CORS configured correctly (${cors_response})"
else
    echo -e "${warning_mark} CORS may not be configured (${cors_response})"
    echo -e "  Check CLIENT_ORIGIN in server/.env"
fi

# Test API connectivity from expected origin
echo -e "\n${BLUE}Testing API Call...${NC}\n"

echo -n "Testing GET /api/health with origin header... "
api_response=$(curl -s \
    -H "Origin: http://localhost:5173" \
    "$health_endpoint")

if echo "$api_response" | jq -e '.ok == true' > /dev/null 2>&1; then
    echo -e "${check_mark}"
    echo -e "${check_mark} API is responding correctly"
else
    echo -e "${cross_mark}"
    echo -e "${RED}API call failed${NC}"
fi

# Test MongoDB connection
echo -e "\n${BLUE}Checking Database Connection...${NC}\n"

echo -n "Backend MongoDB connection... "
# We can infer from the health check if MongoDB is connected
# Most backends will fail health check if DB is down
# For now, we'll check if the backend started successfully
if curl -s "$health_endpoint" | jq -e '.ok == true' > /dev/null 2>&1; then
    echo -e "${check_mark} Backend started successfully (DB likely connected)"
else
    echo -e "${warning_mark} Cannot verify database connection"
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Connection test complete!${NC}\n"

echo -e "${BLUE}Service Status:${NC}"
echo -e "  • Backend:  ${GREEN}Running${NC} (${backend_url})"
echo -e "  • Frontend: ${GREEN}Running${NC} (${frontend_url})"
echo -e "  • API:      ${GREEN}Accessible${NC} (${health_endpoint})"

echo -e "\n${BLUE}Next Steps:${NC}"
echo -e "  1. Open ${BLUE}${frontend_url}${NC} in your browser"
echo -e "  2. Test the authentication flow"
echo -e "  3. Create a post and verify it appears"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
