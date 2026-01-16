# 🚀 Localhost Setup Guide

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./start-local.sh
```

This script will:
- ✅ Check all prerequisites (Node.js, npm)
- ✅ Install dependencies if missing
- ✅ Create `.env` file if needed
- ✅ Generate Prisma client
- ✅ Create and seed database
- ✅ Start both backend and frontend servers
- ✅ Verify everything is working

### Option 2: Manual Setup

#### Step 1: Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

#### Step 2: Setup Environment
```bash
cd backend
cp env.example .env
# Edit .env and ensure:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024-local-development"
# NODE_ENV=development
cd ..
```

#### Step 3: Setup Database
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
cd ..
```

#### Step 4: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## ✅ Verification

### Check Backend
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok"}
```

### Check Frontend
Open browser: http://localhost:5173

### Test Login API
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kohnitaung.com","password":"password"}'
```

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024-local-development"
NODE_ENV=development
```

### Frontend (vite.config.ts)
- Proxy configured: `/api` → `http://localhost:4000`
- Port: 5173

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:4000 | xargs kill
lsof -ti:5173 | xargs kill

# Or use npm script
npm run stop
```

### Database Issues
```bash
cd backend
# Regenerate Prisma client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
rm prisma/dev.db
npm run prisma:migrate
npm run seed
```

### Backend Won't Start
1. Check `.env` file exists: `ls backend/.env`
2. Check database exists: `ls backend/prisma/dev.db`
3. Check logs: `cat backend.log`
4. Verify Prisma client: `cd backend && npm run prisma:generate`

### Frontend Won't Start
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Reinstall: `rm -rf node_modules && npm install`
3. Check logs: `cat frontend.log`

### API Connection Issues
1. Verify backend is running: `curl http://localhost:4000/health`
2. Check browser console for errors
3. Verify proxy in `vite.config.ts`
4. Check CORS settings in `backend/src/app.ts`

## 📍 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## 🔑 Test Credentials

- **Email**: `admin@kohnitaung.com`
- **Password**: `password`

## 🎯 Success Indicators

When everything is working:
1. ✅ Backend responds at http://localhost:4000/health
2. ✅ Frontend loads at http://localhost:5173
3. ✅ Login works with test credentials
4. ✅ No errors in browser console
5. ✅ No errors in terminal

## 📝 Useful Commands

```bash
# Start everything
./start-local.sh

# Verify setup
./verify-local.sh

# Stop all servers
npm run stop

# Stop backend only
npm run stop:backend

# Stop frontend only
npm run stop:frontend

# Check health
npm run health

# Test API
npm run test:api
```

## 🆘 Still Having Issues?

1. Run verification: `./verify-local.sh`
2. Check logs: `backend.log` and `frontend.log`
3. Review error messages in terminal
4. Check browser console (F12)
5. Ensure Node.js version is 20+ (`node --version`)
