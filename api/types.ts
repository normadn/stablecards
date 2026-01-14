export type Role = "orchestration" | "program_manager" | "processor" | "bin_sponsor";
export type Network = "visa" | "mastercard";
export type CardType = "debit" | "prepaid" | "credit";
export type CustomerType = "b2b" | "b2c" | "both";
export type CustodyModel = "custodial" | "non_custodial" | "hybrid";
export type FundingSource = "stablecoin" | "fiat_ach" | "wire" | "crypto";
export type Stablecoin = "USDC" | "USDT" | "DAI" | "USDP";
export type Chain = "Ethereum" | "Base" | "Solana" | "Polygon" | "Cronos" | "agnostic";
export type KYCKYB = "required" | "optional" | "not_supported";
export type Confidence = "high" | "medium" | "low";

export interface Region {
  code: string; // ISO country code
  notes?: string;
}

export interface Issuer {
  id: string;
  name: string;
  website: string;
  roles: Role[];
  networks: Network[];
  card_types: CardType[];
  regions_supported: Region[];
  customer_type: CustomerType[];
  custody_model: CustodyModel;
  funding_sources: FundingSource[];
  stablecoins: Stablecoin[];
  chains: Chain[];
  kyc_kyb: KYCKYB;
  pricing_model: string[];
  api_maturity: number; // 1-5
  docs_quality: number; // 1-5
  confidence: Confidence;
  notes: string;
  sources: string[];
}

export interface CompareQuery {
  country: string; // ISO country code, required
  network?: Network;
  customer_type?: "b2b" | "b2c";
  custody_model?: CustodyModel;
  stablecoin?: Stablecoin;
  chain?: Chain;
  kyc?: "required" | "optional";
  card_type?: CardType;
}

export interface MatchReason {
  type: string;
  message: string;
  score: number;
}

export interface ComparisonResult {
  issuer: Issuer;
  score: number;
  reasons: MatchReason[];
  missing: string[];
}

export interface CompareResponse {
  matches: ComparisonResult[];
  query: CompareQuery;
}

export interface MetadataResponse {
  roles: Role[];
  networks: Network[];
  card_types: CardType[];
  customer_types: CustomerType[];
  custody_models: CustodyModel[];
  funding_sources: FundingSource[];
  stablecoins: Stablecoin[];
  chains: Chain[];
  kyc_kyb_options: KYCKYB[];
  confidence_levels: Confidence[];
  supported_countries: string[];
}
