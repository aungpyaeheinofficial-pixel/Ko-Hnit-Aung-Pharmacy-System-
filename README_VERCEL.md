# Quick Vercel Deployment Guide

## 🚀 Quick Start

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework Preset: **Vite**
   - Root Directory: `/` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variable**
   - Go to Project Settings > Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.com/api`
   - Redeploy

### Backend Deployment (Railway - Recommended)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create Project**
   - New Project > Deploy from GitHub
   - Select your repository
   - Add PostgreSQL service
   - Add Node.js service

3. **Configure Node.js Service**
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Build Command: `npm install && npm run build`

4. **Set Environment Variables**
   ```
   DATABASE_URL = (from PostgreSQL service)
   JWT_SECRET = (generate a random 32+ character string)
   PORT = 4000
   NODE_ENV = production
   ```

5. **Run Migrations**
   - Open Railway shell
   - Run: `npx prisma migrate deploy && npx prisma generate`

6. **Get Backend URL**
   - Copy the Railway service URL
   - Update frontend `VITE_API_BASE_URL` in Vercel

## 📋 Complete Documentation

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.
