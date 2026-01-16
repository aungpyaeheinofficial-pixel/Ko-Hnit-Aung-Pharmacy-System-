# 🚀 Localhost Development Guide

## Quick Start

### Option 1: Use the Startup Script (Recommended)
```bash
./start-local.sh
```

This script will:
- ✅ Check all prerequisites
- ✅ Create database if needed
- ✅ Start both backend and frontend servers
- ✅ Verify everything is working

### Option 2: Manual Start

#### 1. Start Backend
```bash
cd backend
npm run dev
```
Backend will run on: **http://localhost:4000**

#### 2. Start Frontend (in a new terminal)
```bash
npm run dev
```
Frontend will run on: **http://localhost:5173**

## ✅ Verification Checklist

### Backend Health Check
```bash
curl http://localhost:4000/health
```
Expected response: `{"status":"ok"}`

### Test Login API
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kohnitaung.com","password":"password"}'
```
Expected: JSON with `token` and `user` fields

### Frontend Access
Open in browser: **http://localhost:5173**

## 🔧 Configuration

### Backend Environment (.env)
Located at: `backend/.env`
```env
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET="ko-hnit-aung-pharmacy-secret-key-2024"
```

### Frontend Configuration
- API Proxy: Configured in `vite.config.ts`
- Logo: Located at `public/assets/logo.jpg`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (Backend)
lsof -ti:4000 | xargs kill

# Kill process on port 5173 (Frontend)
lsof -ti:5173 | xargs kill
```

### Database Issues
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### Backend Not Starting
1. Check `backend/.env` exists
2. Verify `DATABASE_URL` is correct
3. Run `npm install` in backend folder
4. Check logs: `cat backend.log`

### Frontend Not Starting
1. Run `npm install` in root folder
2. Check logs: `cat frontend.log`
3. Clear cache: `rm -rf node_modules/.vite`

### API Connection Issues
1. Verify backend is running: `curl http://localhost:4000/health`
2. Check browser console for CORS errors
3. Verify proxy in `vite.config.ts` points to `http://localhost:4000`

### Logo Not Showing
1. Verify file exists: `ls -lh public/assets/logo.jpg`
2. Check browser network tab for 404 errors
3. Ensure file is in `public/assets/` folder (not `src/assets/`)

## 📝 Test Credentials

- **Email**: `admin@kohnitaung.com`
- **Password**: `password`

- **Email**: `pos@kohnitaung.com`
- **Password**: `password`

## 🎯 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## 📦 Project Structure

```
Ko copy/
├── backend/           # Backend API (Express + Prisma)
│   ├── src/          # Source code
│   ├── prisma/       # Database schema & migrations
│   └── .env          # Backend environment variables
├── public/           # Static assets (served at root)
│   └── assets/       # Images, logos, etc.
│       └── logo.jpg  # Application logo
├── components/       # React components
├── pages/            # Page components
├── store.ts          # Zustand state management
└── vite.config.ts    # Vite configuration

```

## 🔄 Development Workflow

1. **Start servers**: `./start-local.sh` or manually
2. **Make changes**: Edit files in `src/` or `pages/`
3. **Hot reload**: Changes auto-reload (no restart needed)
4. **Database changes**: Run `npm run prisma:migrate` in backend
5. **Stop servers**: Press `Ctrl+C` or kill processes

## ✨ Features Available

- ✅ Smart Product Search
- ✅ POS System
- ✅ Inventory Management
- ✅ Stock Entry
- ✅ Purchase Orders
- ✅ Finance Management
- ✅ Customer Management
- ✅ Expiry Tracking
- ✅ Settings Management

## 📞 Support

If you encounter issues:
1. Check the logs: `backend.log` and `frontend.log`
2. Verify all prerequisites are installed
3. Ensure ports 4000 and 5173 are available
4. Check database file exists: `backend/prisma/dev.db`
