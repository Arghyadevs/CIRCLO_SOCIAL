#!/bin/bash

# 🔍 Circlo Social - Configuration Checker
# This script verifies your environment setup

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Circlo Social - Configuration Checker${NC}\n"

# Check functions
check_mark="${GREEN}✓${NC}"
cross_mark="${RED}✗${NC}"
warning_mark="${YELLOW}⚠${NC}"

# Track errors
errors=0
warnings=0

echo -e "${BLUE}Checking Prerequisites...${NC}\n"

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${check_mark} Node.js installed: ${node_version}"
    
    # Check version (should be 18+)
    major_version=$(echo $node_version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$major_version" -lt 18 ]; then
        echo -e "  ${warning_mark} Node.js 18+ recommended, you have v${major_version}"
        ((warnings++))
    fi
else
    echo -e "${cross_mark} Node.js not found - Please install Node.js 18+"
    ((errors++))
fi

# Check npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo -e "${check_mark} npm installed: v${npm_version}"
else
    echo -e "${cross_mark} npm not found"
    ((errors++))
fi

# Check MongoDB
echo ""
if command -v mongod &> /dev/null; then
    echo -e "${check_mark} MongoDB installed locally"
elif command -v docker &> /dev/null && docker ps | grep -q mongo; then
    echo -e "${check_mark} MongoDB running in Docker"
else
    echo -e "${warning_mark} MongoDB not found locally (you can use MongoDB Atlas)"
    ((warnings++))
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "${check_mark} Docker installed: v${docker_version}"
else
    echo -e "${warning_mark} Docker not found (optional, but recommended)"
    ((warnings++))
fi

echo -e "\n${BLUE}Checking Environment Configuration...${NC}\n"

# Check frontend .env
if [ -f ".env" ]; then
    echo -e "${check_mark} Frontend .env file exists"
    
    # Check for required variables
    if grep -q "VITE_CLERK_PUBLISHABLE_KEY=" .env; then
        clerk_key=$(grep "VITE_CLERK_PUBLISHABLE_KEY=" .env | cut -d'=' -f2)
        if [ -z "$clerk_key" ] || [ "$clerk_key" == "pk_test_your_key_here" ]; then
            echo -e "  ${warning_mark} VITE_CLERK_PUBLISHABLE_KEY not configured"
            ((warnings++))
        else
            echo -e "  ${check_mark} VITE_CLERK_PUBLISHABLE_KEY configured"
        fi
    else
        echo -e "  ${cross_mark} VITE_CLERK_PUBLISHABLE_KEY missing"
        ((errors++))
    fi
    
    if grep -q "VITE_API_URL=" .env; then
        echo -e "  ${check_mark} VITE_API_URL configured"
    else
        echo -e "  ${warning_mark} VITE_API_URL missing (will use default)"
        ((warnings++))
    fi
else
    echo -e "${cross_mark} Frontend .env file not found"
    echo -e "  ${YELLOW}→ Run: cp .env.example .env${NC}"
    ((errors++))
fi

# Check backend .env
echo ""
if [ -f "server/.env" ]; then
    echo -e "${check_mark} Backend .env file exists"
    
    # Check for required variables
    if grep -q "MONGO_URI=" server/.env; then
        echo -e "  ${check_mark} MONGO_URI configured"
    else
        echo -e "  ${cross_mark} MONGO_URI missing"
        ((errors++))
    fi
    
    if grep -q "PORT=" server/.env; then
        port=$(grep "PORT=" server/.env | cut -d'=' -f2)
        echo -e "  ${check_mark} PORT configured: ${port}"
    fi
    
    if grep -q "CLIENT_ORIGIN=" server/.env; then
        echo -e "  ${check_mark} CLIENT_ORIGIN configured"
    else
        echo -e "  ${warning_mark} CLIENT_ORIGIN missing (CORS may fail)"
        ((warnings++))
    fi
    
    skip_auth=$(grep "SKIP_AUTH=" server/.env | cut -d'=' -f2 | tr -d '\r')
    if [ "$skip_auth" == "true" ]; then
        echo -e "  ${warning_mark} SKIP_AUTH=true (OK for development)"
    fi
else
    echo -e "${cross_mark} Backend .env file not found"
    echo -e "  ${YELLOW}→ Run: cp server/.env.example server/.env${NC}"
    ((errors++))
fi

echo -e "\n${BLUE}Checking Dependencies...${NC}\n"

# Check frontend dependencies
if [ -d "node_modules" ]; then
    echo -e "${check_mark} Frontend dependencies installed"
else
    echo -e "${cross_mark} Frontend dependencies not installed"
    echo -e "  ${YELLOW}→ Run: npm install${NC}"
    ((errors++))
fi

# Check backend dependencies
if [ -d "server/node_modules" ]; then
    echo -e "${check_mark} Backend dependencies installed"
else
    echo -e "${cross_mark} Backend dependencies not installed"
    echo -e "  ${YELLOW}→ Run: cd server && npm install${NC}"
    ((errors++))
fi

echo -e "\n${BLUE}Checking Build Status...${NC}\n"

# Check if frontend builds
if [ -d "dist" ]; then
    echo -e "${check_mark} Frontend build exists"
else
    echo -e "${warning_mark} Frontend not built yet"
    echo -e "  ${YELLOW}→ Run: npm run build${NC}"
fi

# Check if backend builds
if [ -d "server/dist" ]; then
    echo -e "${check_mark} Backend build exists"
else
    echo -e "${warning_mark} Backend not built yet"
    echo -e "  ${YELLOW}→ Run: cd server && npm run build${NC}"
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration looks good! Ready to run.${NC}\n"
    echo -e "Start the app with:"
    echo -e "  ${BLUE}Terminal 1:${NC} cd server && npm run dev"
    echo -e "  ${BLUE}Terminal 2:${NC} npm run dev"
    echo -e "\nOr use Docker:"
    echo -e "  ${BLUE}docker-compose --env-file .env.docker up -d${NC}"
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠ Configuration has ${warnings} warning(s)${NC}"
    echo -e "You can proceed, but some features may not work.\n"
else
    echo -e "${RED}✗ Configuration has ${errors} error(s) and ${warnings} warning(s)${NC}"
    echo -e "Please fix the errors above before running.\n"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
