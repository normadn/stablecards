import { Issuer, CompareQuery, ComparisonResult, MatchReason } from "./types";

export function compareIssuers(issuers: Issuer[], query: CompareQuery): ComparisonResult[] {
  const results: ComparisonResult[] = [];

  for (const issuer of issuers) {
    const reasons: MatchReason[] = [];
    const missing: string[] = [];
    let score = 0;

    // Hard filter: country support (required)
    const countrySupported = issuer.regions_supported.some(
      (r) => r.code.toUpperCase() === query.country.toUpperCase()
    );

    if (!countrySupported) {
      missing.push(`Does not support country: ${query.country}`);
      continue; // Skip this issuer entirely if country not supported
    }
    score += 20;
    reasons.push({
      type: "country",
      message: `Supports country: ${query.country}`,
      score: 20,
    });

    // Network match
    if (query.network) {
      if (issuer.networks.includes(query.network)) {
        score += 10;
        reasons.push({
          type: "network",
          message: `Supports ${query.network} network`,
          score: 10,
        });
      } else {
        missing.push(`Does not support network: ${query.network}`);
      }
    }

    // Stablecoin match
    if (query.stablecoin) {
      if (issuer.stablecoins.includes(query.stablecoin)) {
        score += 10;
        reasons.push({
          type: "stablecoin",
          message: `Supports ${query.stablecoin}`,
          score: 10,
        });
      } else {
        missing.push(`Does not support stablecoin: ${query.stablecoin}`);
      }
    }

    // Chain match (or chain-agnostic)
    if (query.chain) {
      if (issuer.chains.includes(query.chain) || issuer.chains.includes("agnostic")) {
        score += 10;
        reasons.push({
          type: "chain",
          message: `Supports ${query.chain} or is chain-agnostic`,
          score: 10,
        });
      } else {
        missing.push(`Does not support chain: ${query.chain}`);
      }
    }

    // Custody model match
    if (query.custody_model) {
      if (issuer.custody_model === query.custody_model) {
        score += 10;
        reasons.push({
          type: "custody",
          message: `Matches custody model: ${query.custody_model}`,
          score: 10,
        });
      } else {
        missing.push(`Custody model mismatch: ${issuer.custody_model} vs ${query.custody_model}`);
      }
    }

    // Card type match
    if (query.card_type) {
      if (issuer.card_types.includes(query.card_type)) {
        score += 10;
        reasons.push({
          type: "card_type",
          message: `Supports ${query.card_type} cards`,
          score: 10,
        });
      } else {
        missing.push(`Does not support card type: ${query.card_type}`);
      }
    }

    // Customer type match
    if (query.customer_type) {
      if (
        issuer.customer_type.includes(query.customer_type) ||
        issuer.customer_type.includes("both")
      ) {
        score += 10;
        reasons.push({
          type: "customer_type",
          message: `Supports ${query.customer_type} customers`,
          score: 10,
        });
      } else {
        missing.push(`Does not support customer type: ${query.customer_type}`);
      }
    }

    // KYC requirement match
    if (query.kyc) {
      if (query.kyc === "required" && issuer.kyc_kyb === "required") {
        score += 10;
        reasons.push({
          type: "kyc",
          message: `KYC requirement matches: ${query.kyc}`,
          score: 10,
        });
      } else if (query.kyc === "optional" && issuer.kyc_kyb !== "not_supported") {
        score += 10;
        reasons.push({
          type: "kyc",
          message: `KYC requirement matches: ${query.kyc}`,
          score: 10,
        });
      } else {
        missing.push(`KYC requirement mismatch: ${issuer.kyc_kyb} vs ${query.kyc}`);
      }
    }

    // API maturity and docs quality (always included)
    score += issuer.api_maturity * 2;
    reasons.push({
      type: "api_maturity",
      message: `API maturity: ${issuer.api_maturity}/5`,
      score: issuer.api_maturity * 2,
    });

    score += issuer.docs_quality * 2;
    reasons.push({
      type: "docs_quality",
      message: `Documentation quality: ${issuer.docs_quality}/5`,
      score: issuer.docs_quality * 2,
    });

    results.push({
      issuer,
      score,
      reasons,
      missing,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
