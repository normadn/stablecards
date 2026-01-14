import { readFileSync } from "fs";
import { join } from "path";
import { Issuer } from "../api/types";

const dataPath = join(__dirname, "../data/issuers.json");

function validateIssuer(issuer: any, index: number): string[] {
  const errors: string[] = [];
  const id = issuer.id || `[${index}]`;

  // Required fields
  const required = [
    "id",
    "name",
    "website",
    "roles",
    "networks",
    "card_types",
    "regions_supported",
    "customer_type",
    "custody_model",
    "funding_sources",
    "stablecoins",
    "chains",
    "kyc_kyb",
    "pricing_model",
    "api_maturity",
    "docs_quality",
    "confidence",
    "notes",
    "sources",
  ];

  for (const field of required) {
    if (!(field in issuer)) {
      errors.push(`${id}: Missing required field: ${field}`);
    }
  }

  // Validate arrays
  if (issuer.roles && !Array.isArray(issuer.roles)) {
    errors.push(`${id}: roles must be an array`);
  }
  if (issuer.networks && !Array.isArray(issuer.networks)) {
    errors.push(`${id}: networks must be an array`);
  }
  if (issuer.card_types && !Array.isArray(issuer.card_types)) {
    errors.push(`${id}: card_types must be an array`);
  }
  if (issuer.regions_supported && !Array.isArray(issuer.regions_supported)) {
    errors.push(`${id}: regions_supported must be an array`);
  }

  // Validate regions format
  if (Array.isArray(issuer.regions_supported)) {
    issuer.regions_supported.forEach((region: any, idx: number) => {
      if (!region.code) {
        errors.push(`${id}: regions_supported[${idx}] missing code`);
      }
      if (typeof region.code !== "string" || region.code.length !== 2) {
        errors.push(`${id}: regions_supported[${idx}].code must be a 2-letter ISO code`);
      }
    });
  }

  // Validate numeric ranges
  if (issuer.api_maturity !== undefined) {
    if (typeof issuer.api_maturity !== "number" || issuer.api_maturity < 1 || issuer.api_maturity > 5) {
      errors.push(`${id}: api_maturity must be between 1 and 5`);
    }
  }
  if (issuer.docs_quality !== undefined) {
    if (typeof issuer.docs_quality !== "number" || issuer.docs_quality < 1 || issuer.docs_quality > 5) {
      errors.push(`${id}: docs_quality must be between 1 and 5`);
    }
  }

  // Validate enums
  const validRoles = ["orchestration", "program_manager", "processor", "bin_sponsor"];
  if (Array.isArray(issuer.roles)) {
    issuer.roles.forEach((role: string) => {
      if (!validRoles.includes(role)) {
        errors.push(`${id}: Invalid role: ${role}`);
      }
    });
  }

  const validNetworks = ["visa", "mastercard"];
  if (Array.isArray(issuer.networks)) {
    issuer.networks.forEach((network: string) => {
      if (!validNetworks.includes(network)) {
        errors.push(`${id}: Invalid network: ${network}`);
      }
    });
  }

  const validCustody = ["custodial", "non_custodial", "hybrid"];
  if (issuer.custody_model && !validCustody.includes(issuer.custody_model)) {
    errors.push(`${id}: Invalid custody_model: ${issuer.custody_model}`);
  }

  const validKYC = ["required", "optional", "not_supported"];
  if (issuer.kyc_kyb && !validKYC.includes(issuer.kyc_kyb)) {
    errors.push(`${id}: Invalid kyc_kyb: ${issuer.kyc_kyb}`);
  }

  const validConfidence = ["high", "medium", "low"];
  if (issuer.confidence && !validConfidence.includes(issuer.confidence)) {
    errors.push(`${id}: Invalid confidence: ${issuer.confidence}`);
  }

  // Check for duplicate IDs
  // This will be checked at the file level

  return errors;
}

function validateIssuersFile(): void {
  try {
    const data = readFileSync(dataPath, "utf-8");
    const issuers: any[] = JSON.parse(data);

    if (!Array.isArray(issuers)) {
      console.error("❌ issuers.json must contain an array");
      process.exit(1);
    }

    const errors: string[] = [];
    const ids = new Set<string>();

    issuers.forEach((issuer, index) => {
      // Check for duplicate IDs
      if (ids.has(issuer.id)) {
        errors.push(`Duplicate ID: ${issuer.id}`);
      }
      ids.add(issuer.id);

      // Validate issuer
      const issuerErrors = validateIssuer(issuer, index);
      errors.push(...issuerErrors);
    });

    if (errors.length > 0) {
      console.error("❌ Validation failed:\n");
      errors.forEach((error) => console.error(`  - ${error}`));
      process.exit(1);
    }

    console.log(`✅ Validation passed: ${issuers.length} issuers validated`);
  } catch (error: any) {
    console.error("❌ Error reading or parsing issuers.json:", error.message);
    process.exit(1);
  }
}

validateIssuersFile();
