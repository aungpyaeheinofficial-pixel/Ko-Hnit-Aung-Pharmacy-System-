# 🚀 Local Run Guide - Ko Hnit Aung Pharmacy

Complete guide to running the application locally.

## ✅ Quick Verification

Before starting, verify your setup:

```bash
npm run verify
```

This checks:
- ✅ Node.js and NPM installed
- ✅ Dependencies installed
- ✅ Database exists
- ✅ Environment configured
- ✅ Servers can start

## 🚀 Starting the Application

### Method 1: Automated Script (Recommended)

```bash
npm start
```

or

```bash
./start-local.sh
```

This will:
1. Check prerequisites
2. Create database if needed
3. Start backend server (port 4000)
4. Start frontend server (port 5173)
5. Verify everything is working

### Method 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Method 3: Using Cursor IDE

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: `Tasks: Run Task`
3. Select: `🚀 Start All Servers`

## 🔍 Verification

### Check Backend Health
```bash
npm run health
```

Expected output:
```json
{
  "status": "ok"
}
```

### Test API Login
```bash
npm run test:api
```

Expected output:
```
admin@kohnitaung.com
```

### Check Servers
```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:5173
```

## 🛑 Stopping Servers

```bash
npm run stop
```

Or manually:
```bash
# Kill backend
lsof -ti:4000 | xargs kill

# Kill frontend
lsof -ti:5173 | xargs kill
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start both servers |
| `npm run verify` | Verify setup |
| `npm run dev` | Start frontend only |
| `npm run backend:dev` | Start backend only |
| `npm run stop` | Stop all servers |
| `npm run health` | Check backend health |
| `npm run test:api` | Test API login |
| `npm run backend:seed` | Seed database |
| `npm run build` | Build for production |

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check what's using the ports
lsof -i:4000
lsof -i:5173

# Kill processes
npm run stop
```

### Database Issues

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### Dependencies Missing

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### Backend Won't Start

1. Check `.env` file exists:
   ```bash
   ls backend/.env
   ```

2. Verify database:
   ```bash
   ls backend/prisma/dev.db
   ```

3. Check logs:
   ```bash
   cat backend.log
   ```

### Frontend Won't Start

1. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

### API Connection Issues

1. Verify backend is running:
   ```bash
   curl http://localhost:4000/health
   ```

2. Check CORS settings in `backend/src/app.ts`

3. Verify proxy in `vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:4000',
       changeOrigin: true,
     }
   }
   ```

## 🎯 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## 🔑 Test Credentials

**Admin:**
- Email: `admin@kohnitaung.com`
- Password: `password`

**Cashier:**
- Email: `pos@kohnitaung.com`
- Password: `password`

## 📊 System Requirements

- **Node.js**: v20+ (you have v25.2.1 ✅)
- **NPM**: v10+ (you have v11.6.2 ✅)
- **Database**: SQLite (included, no setup needed)

## 🎉 Success Indicators

When everything is working:

1. ✅ Backend responds at http://localhost:4000/health
2. ✅ Frontend loads at http://localhost:5173
3. ✅ Login works with test credentials
4. ✅ No errors in browser console
5. ✅ No errors in terminal

## 📝 Next Steps

1. Open http://localhost:5173 in your browser
2. Login with test credentials
3. Start using the application!

## 🆘 Still Having Issues?

1. Run verification: `npm run verify`
2. Check logs: `backend.log` and `frontend.log`
3. Review error messages in terminal
4. Check browser console (F12)

---

**Happy Coding! 🚀**
