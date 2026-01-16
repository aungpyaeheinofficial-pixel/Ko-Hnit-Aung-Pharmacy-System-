#!/bin/bash

# Local Development Verification Script

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Verifying Local Development Setup..."
echo ""

ERRORS=0

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
fi

# Check NPM
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM not installed${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ NPM: $(npm --version)${NC}"
fi

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies missing${NC}"
    echo "   Run: cd backend && npm install"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Check frontend dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies missing${NC}"
    echo "   Run: npm install"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Check database
if [ ! -f "backend/prisma/dev.db" ]; then
    echo -e "${YELLOW}⚠️  Database not found${NC}"
    echo "   Run: cd backend && npm run prisma:migrate && npm run seed"
    ERRORS=$((ERRORS + 1))
else
    DB_SIZE=$(ls -lh backend/prisma/dev.db | awk '{print $5}')
    echo -e "${GREEN}✅ Database exists ($DB_SIZE)${NC}"
fi

# Check .env file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file missing${NC}"
    echo "   Run: cp backend/env.example backend/.env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check logo
if [ ! -f "public/assets/logo.jpg" ]; then
    echo -e "${YELLOW}⚠️  Logo file missing${NC}"
else
    echo -e "${GREEN}✅ Logo file exists${NC}"
fi

# Check backend server
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server running on port 4000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server not running${NC}"
    echo "   Run: cd backend && npm run dev"
fi

# Check frontend server
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server running on port 5173${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server not running${NC}"
    echo "   Run: npm run dev"
fi

# Test API login
if curl -s -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@kohnitaung.com","password":"password"}' \
    | grep -q "token" 2>/dev/null; then
    echo -e "${GREEN}✅ API login test passed${NC}"
else
    echo -e "${YELLOW}⚠️  API login test failed (backend may not be running)${NC}"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All checks passed! Ready to run.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🚀 To start servers:"
    echo "   ./start-local.sh"
    echo "   or"
    echo "   npm start"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Found $ERRORS issue(s). Please fix them above.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
