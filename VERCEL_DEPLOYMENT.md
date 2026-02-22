# Kodbank Vercel Deployment Guide

## Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub repository with your code (already done ✅)
- Environment variables ready

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Prepare Environment Variables

You'll need these environment variables on Vercel:
- `DB_HOST` - Your Aiven MySQL host
- `DB_PORT` - Your Aiven MySQL port (24115)
- `DB_USER` - Your Aiven MySQL user (avnadmin)
- `DB_PASSWORD` - Your Aiven MySQL password
- `DB_NAME` - Your database name (defaultdb)
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to `production`

## Step 3: Deploy via CLI
```bash
vercel
```

Follow the prompts:
1. Link to GitHub project
2. Select configuration defaults
3. Add environment variables when prompted

## Step 4: Add Environment Variables on Vercel Dashboard

If CLI method doesn't work, go to:
1. https://vercel.com/dashboard
2. Select your Kodbank project
3. Settings → Environment Variables
4. Add all required variables above

## Step 5: Configure Aiven Database for Remote Access

Your Aiven MySQL connection requires SSL. Make sure:
1. Aiven password and credentials are correct
2. Database allows connections from Vercel IPs (Usually enabled by default)

## Step 6: Deploy

Option A: Automatic (GitHub)
- Push to main branch, Vercel auto-deploys

Option B: Manual
```bash
vercel --prod
```

## API Endpoints (After Deployment)

After deployment at `https://your-project.vercel.app`:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/balance` - Get user balance (requires token)
- `GET /api/user/profile` - Get user profile (requires token)

## Troubleshooting

**Port Issues:** Vercel serverless functions don't use ports
**CORS Issues:** Already configured in API files
**Database Connection:** Ensure Aiven password is correct in environment

## Frontend Assets

Static files (HTML, CSS, JS) in `/frontend` directory are automatically served at root.

## More Info

- Vercel Docs: https://vercel.com/docs
- Serverless Functions: https://vercel.com/docs/functions/serverless-functions
