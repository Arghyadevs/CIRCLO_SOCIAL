#!/bin/bash

# 🌐 Production Deployment Test
# Tests the connection between Vercel frontend and Render backend

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Testing Production Deployment${NC}\n"

check_mark="${GREEN}✓${NC}"
cross_mark="${RED}✗${NC}"
warning_mark="${YELLOW}⚠${NC}"

FRONTEND_URL="https://circlo-devs7.vercel.app"
BACKEND_URL="https://circlo-social.onrender.com"
HEALTH_ENDPOINT="${BACKEND_URL}/api/health"

errors=0

# Test Backend
echo -e "${BLUE}Testing Backend (Render)...${NC}\n"

echo -n "Checking backend health endpoint... "
backend_response=$(curl -s -w "\n%{http_code}" --max-time 60 "$HEALTH_ENDPOINT" 2>&1)
http_code=$(echo "$backend_response" | tail -n1)
response_body=$(echo "$backend_response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${check_mark}"
    echo "Response: $response_body"
    
    # Verify JSON response
    if echo "$response_body" | grep -q '"ok":true'; then
        echo -e "${check_mark} Backend is healthy"
    else
        echo -e "${warning_mark} Backend responded but format unexpected"
    fi
else
    echo -e "${cross_mark}"
    echo -e "${RED}HTTP Status: $http_code${NC}"
    if [ "$http_code" = "000" ]; then
        echo -e "${YELLOW}Backend may be spinning up (Render free tier)${NC}"
        echo -e "${YELLOW}Wait 30-60 seconds and try again${NC}"
    fi
    ((errors++))
fi

# Test CORS
echo -e "\n${BLUE}Testing CORS Configuration...${NC}\n"

echo -n "Checking CORS headers... "
cors_headers=$(curl -s -I \
    -H "Origin: ${FRONTEND_URL}" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    --max-time 30 \
    "$HEALTH_ENDPOINT" 2>&1)

if echo "$cors_headers" | grep -qi "access-control-allow-origin"; then
    echo -e "${check_mark}"
    allowed_origin=$(echo "$cors_headers" | grep -i "access-control-allow-origin" | cut -d' ' -f2- | tr -d '\r')
    echo "Allowed Origin: $allowed_origin"
    
    if echo "$allowed_origin" | grep -q "$FRONTEND_URL\|*"; then
        echo -e "${check_mark} CORS is configured correctly"
    else
        echo -e "${warning_mark} CORS may not allow frontend origin"
        echo -e "  Expected: ${FRONTEND_URL}"
        echo -e "  Got: ${allowed_origin}"
    fi
else
    echo -e "${warning_mark}"
    echo "Could not verify CORS headers"
fi

# Test Frontend
echo -e "\n${BLUE}Testing Frontend (Vercel)...${NC}\n"

echo -n "Checking frontend accessibility... "
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$FRONTEND_URL" 2>&1)

if [ "$frontend_response" = "200" ]; then
    echo -e "${check_mark}"
    echo -e "${check_mark} Frontend is accessible at ${FRONTEND_URL}"
else
    echo -e "${cross_mark}"
    echo -e "${RED}HTTP Status: $frontend_response${NC}"
    ((errors++))
fi

# Test API connectivity from frontend origin
echo -e "\n${BLUE}Testing API Connection...${NC}\n"

echo -n "Testing API call with frontend origin... "
api_response=$(curl -s \
    -H "Origin: ${FRONTEND_URL}" \
    -H "Accept: application/json" \
    --max-time 30 \
    "$HEALTH_ENDPOINT" 2>&1)

if echo "$api_response" | grep -q '"ok":true'; then
    echo -e "${check_mark}"
    echo -e "${check_mark} API is responding correctly to frontend origin"
else
    echo -e "${cross_mark}"
    echo "Response: $api_response"
    ((errors++))
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}\n"
    echo -e "${GREEN}Your deployment is working correctly!${NC}"
    
    echo -e "\n${BLUE}URLs:${NC}"
    echo -e "  Frontend: ${GREEN}${FRONTEND_URL}${NC}"
    echo -e "  Backend:  ${GREEN}${BACKEND_URL}${NC}"
    echo -e "  Health:   ${GREEN}${HEALTH_ENDPOINT}${NC}"
    
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "  1. Open ${BLUE}${FRONTEND_URL}${NC} in your browser"
    echo -e "  2. Sign in with Clerk"
    echo -e "  3. Test creating a post"
    echo -e "  4. Verify all features work"
    
else
    echo -e "${RED}✗ ${errors} test(s) failed${NC}\n"
    
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "  1. Check Render service status"
    echo -e "  2. Verify environment variables in Vercel"
    echo -e "  3. Check Render logs for errors"
    echo -e "  4. Verify CLIENT_ORIGIN includes: ${FRONTEND_URL}"
    echo -e "  5. See ${BLUE}VERCEL_RENDER_SETUP.md${NC} for detailed help"
    
    if [ "$http_code" = "000" ] || [ "$http_code" = "" ]; then
        echo -e "\n${YELLOW}⏱️  Render free tier may be spinning up...${NC}"
        echo -e "  Wait 30-60 seconds and run this script again"
    fi
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit $errors
