# Vercel Deployment Guide - Ko Hnit Aung Pharmacy

## 🚀 Deployment Strategy

This project has two parts:
1. **Frontend** (React + Vite) - Deploy to Vercel
2. **Backend** (Express + Prisma) - Deploy separately (Recommended: Railway, Render, or Fly.io)

### Why Separate Backend?
- Backend requires persistent database connections
- Prisma with SQLite/MySQL needs proper file system or database hosting
- Serverless functions have execution time limits
- Better for production scalability

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up PostgreSQL/MySQL database (Railway, Render, PlanetScale, or Supabase)

## 🔧 Option 1: Frontend Only on Vercel (Recommended)

### Step 1: Deploy Frontend to Vercel

1. **Connect Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `/` (root of repository)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Add in Vercel Dashboard > Settings > Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```
   - For production: Your backend API URL
   - Leave empty for local development (uses proxy)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your frontend will be live at `https://your-project.vercel.app`

### Step 2: Deploy Backend Separately

#### Option A: Deploy to Railway (Recommended)
```bash
# 1. Sign up at railway.app
# 2. Create new project
# 3. Add PostgreSQL database service
# 4. Add Node.js service from GitHub repo
# 5. Set root directory to: backend
# 6. Set start command: npm start
# 7. Add environment variables:
#    - DATABASE_URL (from PostgreSQL service)
#    - JWT_SECRET (generate a random string)
#    - PORT=4000
# 8. Deploy
```

#### Option B: Deploy to Render
```bash
# 1. Sign up at render.com
# 2. Create new Web Service from GitHub repo
# 3. Configure:
#    - Root Directory: backend
#    - Build Command: npm install && npm run build
#    - Start Command: npm start
#    - Environment: Node
# 4. Add PostgreSQL database
# 5. Set environment variables:
#    - DATABASE_URL (from database connection string)
#    - JWT_SECRET
#    - PORT=4000
# 6. Deploy
```

#### Option C: Deploy to Fly.io
```bash
# 1. Install Fly CLI: curl -L https://fly.io/install.sh | sh
# 2. Login: fly auth login
# 3. Navigate to backend: cd backend
# 4. Launch: fly launch
# 5. Set environment variables:
#    fly secrets set DATABASE_URL="postgresql://..."
#    fly secrets set JWT_SECRET="your-secret"
# 6. Deploy: fly deploy
```

### Step 3: Update Frontend API URL

After backend is deployed:
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update `VITE_API_BASE_URL` to your backend URL
3. Redeploy frontend

## 🔧 Option 2: Full Stack on Vercel (Serverless)

⚠️ **Note**: This is less recommended due to database limitations and execution time limits.

### Deploy Backend as Serverless Functions

1. **Create `api/` directory in backend**
   ```bash
   cd backend
   mkdir -p api
   ```

2. **Create `api/index.ts`** (already created in this repo)
   ```typescript
   import { app } from '../src/app';
   export default app;
   ```

3. **Deploy Backend to Vercel**
   - Create separate Vercel project for backend
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Output Directory: Leave empty
   - Framework Preset: Other

4. **Environment Variables** (Backend Vercel project):
   ```
   DATABASE_URL=postgresql://... (use Vercel Postgres or external)
   JWT_SECRET=your-long-secret-key
   PORT=4000
   ```

5. **Database Setup**
   - Use Vercel Postgres (recommended)
   - Or external PostgreSQL (Supabase, Neon, etc.)

6. **Update Prisma for PostgreSQL**
   ```prisma
   // backend/prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

7. **Run Migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

## 📝 Environment Variables Summary

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api.example.com/api` |

### Backend (Railway/Render/Fly.io)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-32-character-secret-key` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `production` |

## 🔄 Database Migration

After deploying backend:

```bash
# SSH into your server or use Railway/Render shell
cd backend
npx prisma migrate deploy
npx prisma generate
npm run seed  # Optional: seed initial data
```

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render/Fly.io
- [ ] Database created and connected
- [ ] Prisma migrations run
- [ ] Environment variables set
- [ ] Frontend API URL updated
- [ ] CORS configured (backend allows frontend domain)
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Check health endpoint: `https://your-backend.com/health`

## 🔗 CORS Configuration

Make sure backend CORS allows your Vercel domain:

```typescript
// backend/src/app.ts
app.use(
  cors({
    origin: [
      'https://your-project.vercel.app',
      'http://localhost:5173', // For local dev
    ],
    credentials: true,
  }),
);
```

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_BASE_URL` is set correctly
- Verify backend is running
- Check CORS settings
- Check browser console for errors

### Backend database connection failed
- Verify `DATABASE_URL` format
- Check database is accessible from deployment platform
- Run `npx prisma migrate deploy`
- Check Prisma client is generated: `npx prisma generate`

### Build fails
- Check Node.js version (use 18.x or 20.x)
- Verify all dependencies installed
- Check build logs for specific errors

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
