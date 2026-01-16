# Server Status & Startup Guide

## 🚀 Servers Running

### Backend API Server
- **Port**: 4000
- **URL**: http://localhost:4000
- **API Base**: http://localhost:4000/api
- **Status**: ✅ Running (in background)
- **Command**: `cd backend && npm run dev`

### Frontend Development Server
- **Port**: 5173 (Vite default)
- **URL**: http://localhost:5173
- **Status**: ✅ Running (in background)
- **Command**: `npm run dev`

## 📝 Access URLs

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:4000/api

## 🔧 Configuration

### Vite Proxy Setup
The frontend is configured to proxy `/api` requests to `http://localhost:4000`
This is configured in `vite.config.ts`:

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    }
  }
}
```

### Backend Environment
Make sure `backend/.env` file exists with:
```env
DATABASE_URL="mysql://..."
PORT=4000
JWT_SECRET="your-secret-key"
```

## ⚠️ Important Notes

1. **Database Connection**: Make sure MySQL database is accessible
2. **Prisma Migration**: If schema changed, run:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Stop Servers**: Press `Ctrl+C` in terminal or kill processes:
   ```bash
   lsof -ti:5173 | xargs kill
   lsof -ti:4000 | xargs kill
   ```

## 🎯 Next Steps

1. Open http://localhost:5173 in browser
2. Login with test credentials (if available)
3. Test the new POS module features:
   - Smart search (type 2-3 characters)
   - Quick buttons
   - Price override in cart
   - Unit conversion
   - Traffic light stock status

## 🐛 Troubleshooting

### Backend not starting:
- Check `backend/.env` file exists
- Check DATABASE_URL is correct
- Check JWT_SECRET is set
- Run `npx prisma generate` in backend folder

### Frontend not connecting to backend:
- Check backend is running on port 4000
- Check proxy configuration in vite.config.ts
- Check browser console for CORS errors

### Port already in use:
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill

# Kill process on port 5173
lsof -ti:5173 | xargs kill
```
