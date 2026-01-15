# Quick Vercel Deployment

## Prerequisites

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Deploy API (Step 1)

```bash
cd api
vercel
# Follow prompts, name it: stablecards-api
# Note the URL (e.g., https://stablecards-api.vercel.app)

# Make production
vercel --prod
```

## Deploy UI (Step 2)

```bash
# Navigate to UI
cd ../ui

# Deploy
vercel
# Follow prompts, name it: stablecards-ui

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter your API URL: https://stablecards-api.vercel.app
# Select: Production, Preview, Development

# Redeploy with env var
vercel --prod
```

## Test

- API: `https://stablecards-api.vercel.app/health`
- UI: `https://stablecards-ui.vercel.app`

Done! 🚀
