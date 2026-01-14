# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm installed

## Setup (5 minutes)

### 1. Install dependencies

```bash
# Install all dependencies (API, UI, and scripts)
npm run install:all

# Or install individually:
cd api && npm install
cd ../ui && npm install
cd ../scripts && npm install
```

### 2. Validate data

```bash
npm run validate
```

### 3. Start the API server

```bash
npm run dev:api
# Or: cd api && npm run dev
```

The API will be available at `http://localhost:3002`

### 4. Start the UI (in a new terminal)

```bash
npm run dev:ui
# Or: cd ui && npm run dev
```

The UI will be available at `http://localhost:3000`

## Test the API

```bash
# Health check
curl http://localhost:3002/health

# Get all issuers
curl http://localhost:3002/issuers

# Compare issuers
curl "http://localhost:3002/compare?country=US&customer_type=b2b&stablecoin=USDC"

# Get metadata
curl http://localhost:3002/metadata
```

## Example Comparison Query

Find B2B issuers in Germany that support USDC on Visa:

```
http://localhost:3002/compare?country=DE&customer_type=b2b&network=visa&stablecoin=USDC
```

## Production Build

```bash
# Build API
npm run build:api

# Build UI
npm run build:ui

# Start API (production)
cd api && npm start

# Start UI (production)
cd ui && npm start
```
