# Stablecoin Card Issuer Comparison

An API + UI that compares stablecoin card issuers, helping businesses find the right provider based on:
- Supported regions
- KYC requirements
- Fees (pricing model)
- Custodial vs non-custodial models
- Stablecoin and blockchain support
- API maturity and documentation quality

**Focus**: B2B platforms (though some B2C providers are included for reference)

## What It Does

This tool helps you compare stablecoin credit card issuers by:
1. **Filtering** issuers based on your requirements (country, network, stablecoin, etc.)
2. **Scoring** each issuer based on how well they match your criteria
3. **Explaining** why each issuer scored the way it did
4. **Providing** sources so you can verify the information

## Architecture

The project distinguishes between different roles in the card ecosystem:
- **Issuer / BIN sponsor**: The entity that issues the card
- **Program manager**: Manages the card program
- **Processor**: Handles transaction processing
- **Stablecoin orchestration layer**: Integrates stablecoin funding

Many companies play multiple roles, and the schema supports this.

## Project Structure

```
stablecards/
├── data/
│   └── issuers.json          # JSON database of issuers
├── api/                      # TypeScript Express API
│   ├── server.ts             # Main API server
│   ├── types.ts              # TypeScript type definitions
│   ├── compare.ts            # Comparison scoring logic
│   ├── package.json
│   └── tsconfig.json
├── ui/                       # Next.js frontend
│   ├── app/
│   │   ├── page.tsx          # Main comparison UI
│   │   └── layout.tsx
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   ├── validate-issuers.ts   # Data validation script
│   └── package.json
└── README.md
```

## Data Model

Each issuer in `data/issuers.json` contains:

- **Basic Info**: `id`, `name`, `website`
- **Roles**: Array of `["orchestration", "program_manager", "processor", "bin_sponsor"]`
- **Networks**: `["visa", "mastercard"]`
- **Card Types**: `["debit", "prepaid", "credit"]`
- **Regions**: Array of `{code: "US", notes?: "Full support"}`
- **Customer Type**: `["b2b", "b2c", "both"]`
- **Custody Model**: `"custodial" | "non_custodial" | "hybrid"`
- **Funding Sources**: `["stablecoin", "fiat_ach", "wire", "crypto"]`
- **Stablecoins**: `["USDC", "USDT", ...]`
- **Chains**: `["Ethereum", "Base", "Solana", ...]` or `"agnostic"`
- **KYC/KYB**: `"required" | "optional" | "not_supported"`
- **Pricing Model**: Array of tags (e.g., `["transaction_fee", "monthly_fee"]`)
- **Quality Metrics**: `api_maturity` (1-5), `docs_quality` (1-5)
- **Confidence**: `"high" | "medium" | "low"` (data quality indicator)
- **Notes**: Free text with important details
- **Sources**: Array of URLs for verification

## API Endpoints

### `GET /issuers`

List all issuers with optional filters.

**Query Parameters:**
- `role` - Filter by role (orchestration, program_manager, processor, bin_sponsor)
- `network` - Filter by network (visa, mastercard)
- `customer_type` - Filter by customer type (b2b, b2c)
- `country` - Filter by ISO country code

**Example:**
```bash
curl "http://localhost:3002/issuers?country=US&customer_type=b2b"
```

### `GET /issuers/:id`

Get detailed information about a specific issuer.

**Example:**
```bash
curl "http://localhost:3002/issuers/rain"
```

### `GET /compare`

Compare issuers based on query parameters and return ranked results.

**Query Parameters:**
- `country` (required) - ISO country code
- `network` (optional) - visa or mastercard
- `customer_type` (optional) - b2b or b2c
- `custody_model` (optional) - custodial, non_custodial, or hybrid
- `stablecoin` (optional) - USDC, USDT, etc.
- `chain` (optional) - Ethereum, Base, Solana, etc.
- `kyc` (optional) - required or optional
- `card_type` (optional) - debit, prepaid, or credit

**Example:**
```bash
curl "http://localhost:3002/compare?country=DE&customer_type=b2b&network=visa&stablecoin=USDC&custody_model=custodial"
```

**Response:**
```json
{
  "matches": [
    {
      "issuer": { ... },
      "score": 85,
      "reasons": [
        {"type": "country", "message": "Supports country: DE", "score": 20},
        {"type": "network", "message": "Supports visa network", "score": 10},
        ...
      ],
      "missing": []
    }
  ],
  "query": { ... }
}
```

### `GET /metadata`

Get all supported filter values and enum options.

**Example:**
```bash
curl "http://localhost:3002/metadata"
```

### `GET /health`

Health check endpoint.

## Scoring Algorithm

The comparison uses a transparent, deterministic scoring system (0-100):

- **+20** if supports requested country (hard filter - required)
- **+10** if supports requested network
- **+10** if supports requested stablecoin
- **+10** if supports requested chain or is chain-agnostic
- **+10** if custody model matches preference
- **+10** if card type matches
- **+10** if customer type matches
- **+10** if KYC requirement matches
- **+api_maturity × 2** (max 10 points)
- **+docs_quality × 2** (max 10 points)

Issuers that don't support the required country are excluded entirely.

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- TypeScript

### API Setup

```bash
cd api
npm install
npm run build
npm start
# Or for development:
npm run dev
```

The API will run on `http://localhost:3002`

### UI Setup

```bash
cd ui
npm install
npm run dev
```

The UI will run on `http://localhost:3000`

Set the API URL via environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3002 npm run dev
```

### Validate Data

```bash
cd scripts
npm install
npm run validate
```

## How to Add a Provider

1. **Research the provider** - Gather information from their website, docs, and public sources
2. **Add entry to `data/issuers.json`** - Follow the existing schema
3. **Validate** - Run `npm run validate` in the scripts directory
4. **Test** - Query the API to ensure the new issuer appears correctly

**Example entry structure:**
```json
{
  "id": "provider-name",
  "name": "Provider Name",
  "website": "https://provider.com",
  "roles": ["orchestration", "program_manager"],
  "networks": ["visa"],
  "card_types": ["debit"],
  "regions_supported": [
    {"code": "US", "notes": "Full support"}
  ],
  "customer_type": ["b2b"],
  "custody_model": "custodial",
  "funding_sources": ["stablecoin", "fiat_ach"],
  "stablecoins": ["USDC"],
  "chains": ["Ethereum"],
  "kyc_kyb": "required",
  "pricing_model": ["transaction_fee"],
  "api_maturity": 4,
  "docs_quality": 4,
  "confidence": "high",
  "notes": "Brief description",
  "sources": [
    "https://provider.com/docs",
    "https://provider.com/pricing"
  ]
}
```

## Assumptions & Limitations

1. **Data Accuracy**: Information is based on public sources and may change. Always verify with the provider.
2. **Pricing**: We don't store specific fee amounts, only pricing model tags. Actual fees vary by volume and contract.
3. **Regional Availability**: Support may vary within countries. Check with providers for specific regions.
4. **B2B Focus**: While some B2C providers are included, the tool is optimized for B2B comparisons.
5. **Confidence Levels**: 
   - **High**: Multiple primary sources (docs, pricing pages, etc.)
   - **Medium**: One solid source or clear marketing material
   - **Low**: Unclear information or marketing-only sources

## Current Dataset

The initial dataset includes 9 issuers:
- Rain
- Bridge
- Stripe Issuing
- Baanx
- Marqeta
- Galileo
- i2c
- Circle Card
- Crypto.com

## Examples

### Find B2B issuers in Germany supporting USDC

```bash
curl "http://localhost:3002/compare?country=DE&customer_type=b2b&stablecoin=USDC"
```

### Find non-custodial Visa issuers in the US

```bash
curl "http://localhost:3002/compare?country=US&network=visa&custody_model=non_custodial"
```

### List all program managers

```bash
curl "http://localhost:3002/issuers?role=program_manager"
```

## License

MIT

## Contributing

Contributions welcome! Please:
1. Validate data before submitting
2. Include sources for new entries
3. Keep confidence levels accurate
4. Test API endpoints after changes
