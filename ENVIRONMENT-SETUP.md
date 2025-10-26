# Environment Variables Setup

## For Local Development

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_API_BASE_URL=https://belcit-backend.onrender.com
```

## For Production (Vercel)

Add the environment variable in your Vercel project settings:
- Variable: `NEXT_PUBLIC_API_BASE_URL`
- Value: `https://belcit-backend.onrender.com`
- Apply to: Production, Preview, and Development

## Fallback

If the environment variable is not set, the app will automatically use `https://belcit-backend.onrender.com` as the default API base URL.
