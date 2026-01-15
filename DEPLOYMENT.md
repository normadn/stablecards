# Vercel Deployment Guide

This project is split into two separate Vercel projects:
1. **API Server** (Express) - Deployed from the `api/` directory
2. **Next.js UI** - Deployed from the `ui/` directory

## Step 1: Deploy the API Server

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to the API directory**:
   ```bash
   cd api
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy the API**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No**
   - Project name: `stablecards-api` (or your preferred name)
   - Directory: `./`
   - Override settings? **No**

5. **Note the deployment URL** (e.g., `https://stablecards-api.vercel.app`)

6. **Make it production** (optional, but recommended):
   ```bash
   vercel --prod
   ```

## Step 2: Copy Data File to API Directory

The `issuers.json` data file is already located at `api/data/issuers.json` and will be included in the deployment automatically.

## Step 3: Deploy the Next.js UI

1. **Navigate to the UI directory**:
   ```bash
   cd ../ui
   ```

2. **Create a `.env.local` file** (for local development):
   ```bash
   echo "NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app" > .env.local
   ```
   Replace `your-api-url.vercel.app` with your actual API deployment URL from Step 1.

3. **Deploy the UI**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No**
   - Project name: `stablecards-ui` (or your preferred name)
   - Directory: `./`
   - Override settings? **No**

4. **Set the API URL environment variable** in Vercel dashboard:
   - Go to your project settings on Vercel
   - Navigate to **Environment Variables**
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-api-url.vercel.app`
   - Redeploy after adding the variable

   OR use the CLI:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter: https://your-api-url.vercel.app
   # Select: Production, Preview, and Development
   ```

5. **Make it production**:
   ```bash
   vercel --prod
   ```

## Step 4: Update CORS Settings (if needed)

If you encounter CORS errors, you may need to update the API's CORS settings in `api/api/index.ts` to include your UI domain.

## Alternative: Deploy via GitHub

1. **Push both directories to GitHub** (separate repos or monorepo)

2. **For the API**:
   - Import project on Vercel dashboard
   - Root directory: `api`
   - Build command: Leave empty or `npm run build`
   - Output directory: Leave empty
   - Install command: `npm install`

3. **For the UI**:
   - Import project on Vercel dashboard
   - Root directory: `ui`
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
   - Environment variables: Add `NEXT_PUBLIC_API_URL`

## Testing

- **API Health Check**: `https://your-api-url.vercel.app/health`
- **API Metadata**: `https://your-api-url.vercel.app/metadata`
- **UI**: `https://your-ui-url.vercel.app`

## Troubleshooting

### API not loading data
- Ensure `issuers.json` is in `api/data/` directory
- Check Vercel function logs in the dashboard

### CORS errors
- Update CORS settings in `api/api/index.ts` to allow your UI domain

### Environment variables not working
- Ensure `NEXT_PUBLIC_API_URL` is set in Vercel dashboard
- Redeploy after adding environment variables
- Clear browser cache

### Build errors
- Check Node.js version compatibility (Vercel defaults to Node 18)
- Ensure all dependencies are in `package.json`
