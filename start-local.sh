#!/bin/bash

# Ko Hnit Aung Pharmacy - Local Development Startup Script

echo "🚀 Starting Ko Hnit Aung Pharmacy Local Development..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version:$(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM is not installed. Please install NPM first.${NC}"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not found. Installing...${NC}"
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    cd backend
    cp env.example .env
    # Update for SQLite local development (path relative to prisma/schema.prisma)
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env 2>/dev/null || \
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env
    # Ensure JWT_SECRET is long enough
    if ! grep -q 'JWT_SECRET.*[^"]\{16,\}' .env; then
        sed -i '' 's|JWT_SECRET=.*|JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024-local-development"|' .env 2>/dev/null || \
        sed -i 's|JWT_SECRET=.*|JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024-local-development"|' .env
    fi
    # Add NODE_ENV if not present
    if ! grep -q 'NODE_ENV' .env; then
        echo 'NODE_ENV=development' >> .env
    fi
    cd ..
    echo -e "${GREEN}✅ .env file created and configured for local development${NC}"
else
    # Ensure .env has correct values
    cd backend
    # Update DATABASE_URL if it's not SQLite
    if ! grep -q 'DATABASE_URL="file:./dev.db"' .env; then
        sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env 2>/dev/null || \
        sed -i 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env
    fi
    # Ensure JWT_SECRET is long enough
    if ! grep -q 'JWT_SECRET.*[^"]\{16,\}' .env; then
        sed -i '' 's|JWT_SECRET=.*|JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024-local-development"|' .env 2>/dev/null || \
        sed -i 's|JWT_SECRET=.*|JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024-local-development"|' .env
    fi
    # Add NODE_ENV if not present
    if ! grep -q 'NODE_ENV' .env; then
        echo 'NODE_ENV=development' >> .env
    fi
    cd ..
fi

# Ensure Prisma client is generated before starting
echo -e "${YELLOW}Ensuring Prisma client is generated...${NC}"
cd backend
npm run prisma:generate 2>/dev/null || npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi
cd ..

# Check if database exists
if [ ! -f "backend/prisma/dev.db" ]; then
    echo -e "${YELLOW}⚠️  Database not found. Creating database...${NC}"
    cd backend
    npm run prisma:migrate 2>/dev/null || npx prisma migrate dev --name init
    if [ $? -eq 0 ]; then
        npm run seed 2>/dev/null || npm run seed || echo "Seed may have failed, but continuing..."
        echo -e "${GREEN}✅ Database created and seeded${NC}"
    else
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    fi
    cd ..
else
    echo -e "${GREEN}✅ Database exists${NC}"
fi

# Check if logo exists
if [ ! -f "public/assets/logo.jpg" ]; then
    echo -e "${YELLOW}⚠️  Logo file not found at public/assets/logo.jpg${NC}"
fi

# Kill existing processes on ports
echo ""
echo "Checking for existing processes..."
if lsof -ti:4000 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Port 4000 is in use. Killing existing process...${NC}"
    lsof -ti:4000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -ti:5173 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Port 5173 is in use. Killing existing process...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start backend
echo ""
echo -e "${GREEN}📦 Starting Backend Server...${NC}"
cd backend
# Set NODE_ENV for development
export NODE_ENV=development
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start with retries
echo -e "${YELLOW}Waiting for backend to start...${NC}"
BACKEND_READY=0
for i in {1..30}; do
    # Try curl first, fallback to checking if port is open
    if command -v curl &> /dev/null; then
        if curl -s http://localhost:4000/health > /dev/null 2>&1; then
            BACKEND_READY=1
            break
        fi
    elif lsof -ti:4000 &> /dev/null; then
        # Port is open, assume backend is ready
        BACKEND_READY=1
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

if [ $BACKEND_READY -eq 1 ]; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:4000${NC}"
else
    echo -e "${RED}❌ Backend failed to start within 30 seconds${NC}"
    echo -e "${YELLOW}Checking backend.log for errors...${NC}"
    tail -20 backend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo ""
echo -e "${GREEN}🎨 Starting Frontend Server...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start with retries
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
FRONTEND_READY=0
for i in {1..30}; do
    # Try curl first, fallback to checking if port is open
    if command -v curl &> /dev/null; then
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            FRONTEND_READY=1
            break
        fi
    elif lsof -ti:5173 &> /dev/null; then
        # Port is open, assume frontend is ready
        FRONTEND_READY=1
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

if [ $FRONTEND_READY -eq 1 ]; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend failed to start within 30 seconds${NC}"
    echo -e "${YELLOW}Checking frontend.log for errors...${NC}"
    tail -20 frontend.log
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All servers are running!${NC}"
echo ""
echo -e "${GREEN}📱 Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:4000/api"
echo -e "${GREEN}❤️  Health Check:${NC} http://localhost:4000/health"
echo ""
echo -e "${YELLOW}Test Credentials:${NC}"
echo -e "  Email: ${GREEN}admin@kohnitaung.com${NC}"
echo -e "  Password: ${GREEN}password${NC}"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo -e "  ${GREEN}lsof -ti:4000 | xargs kill${NC}  (Backend)"
echo -e "  ${GREEN}lsof -ti:5173 | xargs kill${NC}  (Frontend)"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Save PIDs to file for easy cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; exit" INT TERM

wait
