# Parami Pharmacy Backend

Node.js + Express + Prisma API that powers the Parami Pharmacy System UI.

## Requirements

- Node.js 20+
- npm 10+
- MySQL 8.x

## Getting Started

```bash
cp env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run prisma:migrate` | Create new Prisma migration |
| `npm run prisma:deploy` | Apply migrations in CI/prod |
| `npm run seed` | Seed the database with demo data |

## Database Schema

The Prisma schema (`prisma/schema.prisma`) models:

- Branches, Users, Products, Batches
- Customers, Suppliers, Purchase Orders & Items
- Distribution Orders & Items
- Inventory transactions, Sales & Sale Items
- Finance modules (Transactions, Expenses, Payables, Receivables)
- App-wide settings, Scanner history & Sync logs

## Deployment on Ubuntu (DigitalOcean VPS)

1. **Server Prep**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git build-essential nginx mysql-server
   sudo npm install -g pm2
   ```
2. **MySQL**
   ```bash
   sudo mysql_secure_installation
   mysql -u root -p
   CREATE DATABASE parami_pharmacy;
   CREATE USER 'parami'@'%' IDENTIFIED BY 'strongpassword';
   GRANT ALL PRIVILEGES ON parami_pharmacy.* TO 'parami'@'%';
   FLUSH PRIVILEGES;
   ```
3. **Code Deploy via Bare Repo**
   ```bash
   sudo mkdir -p /var/www/parami-backend
   sudo chown -R $USER:$USER /var/www/parami-backend
   git init --bare /opt/parami-backend.git
   cat <<'HOOK' | sudo tee /opt/parami-backend.git/hooks/post-receive
   #!/bin/bash
   TARGET=/var/www/parami-backend
   GIT_DIR=/opt/parami-backend.git
   BRANCH=main

   if [ ! -d "$TARGET" ]; then
     mkdir -p "$TARGET"
   fi

   GIT_WORK_TREE=$TARGET git --git-dir=$GIT_DIR checkout -f $BRANCH
   cd $TARGET/backend || exit 1

   npm ci
   npx prisma migrate deploy
   npm run build

   pm2 restart parami-api || pm2 start dist/server.js --name parami-api
   HOOK
   sudo chmod +x /opt/parami-backend.git/hooks/post-receive
   ```

   On your local machine:
   ```bash
   git remote add production ssh://user@server-ip/opt/parami-backend.git
   git push production main
   ```

4. **Environment**

   Create `/var/www/parami-backend/backend/.env` with the same keys as `env.example`.

5. **Nginx Reverse Proxy**
   ```nginx
   server {
     listen 80;
     server_name _;

     location / {
       proxy_pass http://127.0.0.1:4000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   ```

   Reload Nginx: `sudo systemctl reload nginx`.

6. **PM2 Startup**
   ```bash
   pm2 startup systemd
   pm2 save
   ```

7. **Backups**
   ```bash
   cat <<'CRON' | sudo tee /etc/cron.d/parami-backup
   0 2 * * * root mysqldump -u parami -p'strongpassword' parami_pharmacy | gzip > /var/backups/parami-$(date +\%F).sql.gz
   CRON
   ```

8. **Frontend CI/CD**

   - Add another bare repo (e.g., `/opt/parami-frontend.git`) that builds the Vite app and copies the `dist/` folder to `/var/www/parami-frontend`.
   - Serve the built assets via Nginx or deploy to Vercel/Netlify if preferred.

## API Base URL

All endpoints mount under `/api` (e.g., `GET /api/products?branchId=...`). Use the `Authorization: Bearer <token>` header for authenticated routes.

