# Deployment Guide - BELCIT Frontend to Vercel

This guide will help you deploy the BELCIT frontend to Vercel and connect it to your Render backend.

## Prerequisites

- GitHub repository for the frontend
- Backend deployed on Render at `https://belcit-backend.onrender.com`
- Vercel account (free tier is sufficient)

## Step 1: Prepare Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_API_BASE_URL=https://belcit-backend.onrender.com
```

**Important:** Do NOT commit this file to git (it's in `.gitignore`).

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository (`Belcit-frontend`)
4. Configure the project:
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. Add Environment Variable:
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_BASE_URL` = `https://belcit-backend.onrender.com`
   - Apply to: Production, Preview, and Development

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_BASE_URL
# Enter: https://belcit-backend.onrender.com
```

## Step 3: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Check that the app loads
3. Try logging in with your backend credentials
4. Verify API calls are working

## Step 4: Update Git Repository

Commit the `.env.example` file:

```bash
git add .env.example
git commit -m "Add environment variable template for Vercel deployment"
git push
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure your Render backend has CORS configured to allow requests from your Vercel domain.

Update your backend `app.js` or `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Environment Variables Not Working
- Ensure the variable name starts with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check the Vercel environment variables in your project settings

### API Connection Issues
- Verify the backend URL is correct
- Check if Render backend is running
- Look at browser console for specific error messages

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. You can:
- Set up automatic deployments
- Use Vercel's preview deployments for PRs
- Configure custom domains

## Support

For issues:
- Check Vercel logs in your project dashboard
- Check Render logs for backend issues
- Review browser console for frontend errors
