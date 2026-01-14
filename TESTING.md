# Testing Guide

## Quick Test Steps

### 1. Install Dependencies (if not already done)

```bash
# From the project root
npm run install:all
```

### 2. Start the API Server

In one terminal:

```bash
npm run dev:api
# Or: cd api && npm run dev
```

The API should start on `http://localhost:3002`

### 3. Test API Endpoints

In another terminal, test the API:

```bash
# Health check (should return {"status":"ok","issuers_count":9})
curl http://localhost:3002/health

# Get all issuers
curl http://localhost:3002/issuers

# Get metadata (filters and options)
curl http://localhost:3002/metadata

# Test comparison endpoint
curl "http://localhost:3002/compare?country=US&customer_type=b2b&stablecoin=USDC"

# Get specific issuer
curl http://localhost:3002/issuers/rain
```

### 4. Start the UI

In a third terminal:

```bash
npm run dev:ui
# Or: cd ui && npm run dev
```

The UI should start on `http://localhost:3000`

### 5. Test the UI

1. Open `http://localhost:3000` in your browser
2. You should see the comparison form
3. Select a country (required) - e.g., "US"
4. Optionally select other filters
5. Click "Compare Issuers"
6. You should see ranked results with scores and match reasons

## Expected Results

### API Health Check
```json
{
  "status": "ok",
  "issuers_count": 9
}
```

### Comparison Query Example
```bash
curl "http://localhost:3002/compare?country=DE&customer_type=b2b&network=visa&stablecoin=USDC"
```

Should return JSON with:
- `matches`: Array of issuers with scores (0-100)
- `query`: The query parameters used
- Each match includes `issuer`, `score`, `reasons`, and `missing` fields

## Troubleshooting

### API not starting?
- Check if port 3002 is already in use
- Verify dependencies are installed: `cd api && npm install`
- Check for TypeScript errors: `cd api && npm run type-check`

### UI not connecting to API?
- Make sure API is running on port 3002
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` environment variable if set

### No results in comparison?
- Make sure you've selected a country (required)
- Try a different country code (e.g., US, DE, GB)
- Check that issuers.json has data for that country

## Validate Data

Before testing, validate your data:

```bash
npm run validate
```

This checks that `data/issuers.json` is valid and follows the schema.
