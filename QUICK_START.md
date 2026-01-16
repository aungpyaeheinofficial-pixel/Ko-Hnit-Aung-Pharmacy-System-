# 🚀 Quick Start Guide

## Start Everything with One Command

```bash
npm start
```

This will:
- ✅ Check prerequisites
- ✅ Install dependencies if needed
- ✅ Set up database if needed
- ✅ Start backend (port 4000)
- ✅ Start frontend (port 5173)
- ✅ Verify everything is working

## Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## Login Credentials

- **Email**: `admin@kohnitaung.com`
- **Password**: `password`

## Stop Servers

```bash
npm run stop
```

Or press `Ctrl+C` if running `npm start`.

## Manual Start (If Needed)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Troubleshooting

### Port Already in Use
```bash
npm run stop
```

### Dependencies Missing
```bash
npm run install:all
```

### Database Issues
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### Check Logs
```bash
tail -f backend.log   # Backend logs
tail -f frontend.log  # Frontend logs
```

## All Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start both servers |
| `npm run dev` | Start frontend only |
| `npm run backend:dev` | Start backend only |
| `npm run stop` | Stop all servers |
| `npm run verify` | Verify setup |
| `npm run health` | Check backend health |
| `npm run test:api` | Test API login |
| `npm run install:all` | Install all dependencies |
