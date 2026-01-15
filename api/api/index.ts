import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join } from "path";
import { Issuer, CompareQuery, MetadataResponse } from "../types";
import { compareIssuers } from "../compare";

const app = express();

app.use(cors());
app.use(express.json());

// Load issuers data
let issuers: Issuer[] = [];
try {
  // Try multiple possible paths
  const possiblePaths = [
    join(process.cwd(), "data", "issuers.json"), // Vercel deployment
    join(__dirname, "../data/issuers.json"), // Local build
    join(__dirname, "../../data/issuers.json"), // Alternative local path
    join(process.cwd(), "api", "data", "issuers.json"), // API subdirectory
  ];

  let loaded = false;
  for (const dataPath of possiblePaths) {
    try {
      const data = readFileSync(dataPath, "utf-8");
      issuers = JSON.parse(data);
      console.log(`✓ Loaded ${issuers.length} issuers from: ${dataPath}`);
      loaded = true;
      break;
    } catch (err) {
      // Try next path
    }
  }

  if (!loaded) {
    console.error("⚠ Could not load issuers.json from any known path");
    console.error("Tried paths:", possiblePaths);
    // Don't throw, just log - the API will work but return empty arrays
  }
} catch (error) {
  console.error("Error loading issuers data:", error);
}

// GET /issuers - List all issuers with optional filters
app.get("/issuers", (req, res) => {
  let filtered = [...issuers];

  // Filter by role
  if (req.query.role) {
    const roles = Array.isArray(req.query.role) ? req.query.role : [req.query.role];
    filtered = filtered.filter((issuer) =>
      roles.some((role) => issuer.roles.includes(role as any))
    );
  }

  // Filter by network
  if (req.query.network) {
    filtered = filtered.filter((issuer) =>
      issuer.networks.includes(req.query.network as any)
    );
  }

  // Filter by customer type
  if (req.query.customer_type) {
    filtered = filtered.filter((issuer) =>
      issuer.customer_type.includes(req.query.customer_type as any)
    );
  }

  // Filter by country
  if (req.query.country) {
    filtered = filtered.filter((issuer) =>
      issuer.regions_supported.some(
        (r) => r.code.toUpperCase() === (req.query.country as string).toUpperCase()
      )
    );
  }

  res.json(filtered);
});

// GET /issuers/:id - Get specific issuer details
app.get("/issuers/:id", (req, res) => {
  const issuer = issuers.find((i) => i.id === req.params.id);
  if (!issuer) {
    return res.status(404).json({ error: "Issuer not found" });
  }
  res.json(issuer);
});

// GET /compare - Compare issuers based on query parameters
app.get("/compare", (req, res) => {
  const query: CompareQuery = {
    country: req.query.country as string,
    network: req.query.network as any,
    customer_type: req.query.customer_type as any,
    custody_model: req.query.custody_model as any,
    stablecoin: req.query.stablecoin as any,
    chain: req.query.chain as any,
    kyc: req.query.kyc as any,
    card_type: req.query.card_type as any,
  };

  // If no country specified, return all issuers with default scores
  if (!query.country) {
    const allResults = issuers.map((issuer) => ({
      issuer,
      score: 50,
      reasons: [],
      missing: [],
    }));
    return res.json({
      matches: allResults,
      query,
    });
  }

  const results = compareIssuers(issuers, query);

  res.json({
    matches: results,
    query,
  });
});

// GET /metadata - Get supported filters and enum values
app.get("/metadata", (req, res) => {
  const allCountries = new Set<string>();
  issuers.forEach((issuer) => {
    issuer.regions_supported.forEach((r) => allCountries.add(r.code));
  });

  const metadata: MetadataResponse = {
    roles: ["orchestration", "program_manager", "processor", "bin_sponsor"],
    networks: ["visa", "mastercard"],
    card_types: ["debit", "prepaid", "credit"],
    customer_types: ["b2b", "b2c", "both"],
    custody_models: ["custodial", "non_custodial", "hybrid"],
    funding_sources: ["stablecoin", "fiat_ach", "wire", "crypto"],
    stablecoins: ["USDC", "USDT", "DAI", "USDP"],
    chains: ["Ethereum", "Base", "Solana", "Polygon", "Cronos", "agnostic"],
    kyc_kyb_options: ["required", "optional", "not_supported"],
    confidence_levels: ["high", "medium", "low"],
    supported_countries: Array.from(allCountries).sort(),
  };

  res.json(metadata);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", issuers_count: issuers.length });
});

// Export for Vercel serverless
export default app;
