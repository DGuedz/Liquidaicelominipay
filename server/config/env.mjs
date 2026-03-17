import dotenv from "dotenv";

// Load local overrides first (used in this repo), then fallback to .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

function readInt(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readFloat(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readString(name, fallback) {
  const raw = process.env[name];
  return typeof raw === "string" && raw.trim() ? raw.trim() : fallback;
}

function readBool(name, fallback) {
  const raw = process.env[name];
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function readList(name, fallback = []) {
  const raw = process.env[name];
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeCeloChain(value) {
  const normalized = value.toLowerCase();
  if (normalized === "mainnet" || normalized === "celo") return "mainnet";
  if (normalized === "alfajores") return "sepolia";
  return "sepolia";
}

const chain = normalizeCeloChain(readString("CELO_CHAIN", "sepolia"));

const MAINNET_USDM = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const SEPOLIA_USDM = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";
const LEGACY_ALFAJORES_CUSD = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
const MAINNET_SORTED_ORACLES = "0xFe36E2B8D6dA60EAFB5B81A2a9CCC3F53e4D0015";
const SEPOLIA_SORTED_ORACLES = "0xAb077999e5fA13bCda1599926F8927dDEADe533C";
const MAINNET_ORACLE_REFERENCE_STABLE = MAINNET_USDM;
const SEPOLIA_ORACLE_REFERENCE_STABLE = "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80";
const DEFAULT_AAVE_RPC_URL = "https://forno.celo.org";
const DEFAULT_FRONTEND_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://app.liquidai.ai",
  "https://liquidai.ai",
  "https://*.vercel.app",
];

const defaultRpcUrl =
  chain === "mainnet"
    ? "https://forno.celo.org"
    : "https://forno.celo-sepolia.celo-testnet.org";

const rawRpcUrl = readString("CELO_RPC_URL", "");
const celoRpcUrl =
  chain !== "mainnet" && rawRpcUrl.toLowerCase().includes("alfajores")
    ? defaultRpcUrl
    : rawRpcUrl || defaultRpcUrl;

const rawFeeCurrencyAddress = readString(
  "FEE_CURRENCY_ADDRESS",
  readString("CUSD_ADDRESS", ""),
);
const defaultFeeCurrencyAddress = chain === "mainnet" ? MAINNET_USDM : SEPOLIA_USDM;
const feeCurrencyAddress =
  chain !== "mainnet" &&
  rawFeeCurrencyAddress.toLowerCase() === LEGACY_ALFAJORES_CUSD.toLowerCase()
    ? defaultFeeCurrencyAddress
    : rawFeeCurrencyAddress || defaultFeeCurrencyAddress;

const configuredFrontendOrigins = readList("FRONTEND_ORIGIN", []);
const mergedFrontendOrigins = Array.from(
  new Set([...configuredFrontendOrigins, ...DEFAULT_FRONTEND_ORIGINS]),
);

export const env = {
  nodeEnv: readString("NODE_ENV", "development"),
  port: readInt("PORT", readInt("API_PORT", 8787)),
  frontendOrigin: readString("FRONTEND_ORIGIN", DEFAULT_FRONTEND_ORIGINS.join(",")),
  frontendOrigins: mergedFrontendOrigins,
  authSecret: readString("AUTH_SECRET", "liquidai-dev-secret-change-me"),
  authNonceTtlMs: readInt("AUTH_NONCE_TTL_MS", 5 * 60 * 1000),
  authTokenTtlMs: readInt("AUTH_TOKEN_TTL_MS", 24 * 60 * 60 * 1000),
  settlementLockTtlMs: readInt("SETTLEMENT_LOCK_TTL_MS", 2 * 60 * 1000),
  celoChain: chain,
  celoChainId: chain === "mainnet" ? 42220 : 11142220,
  celoRpcUrl,
  feeCurrencyAddress,
  usdStableAddress: feeCurrencyAddress,
  sortedOraclesAddress: readString(
    "SORTED_ORACLES_ADDRESS",
    chain === "mainnet" ? MAINNET_SORTED_ORACLES : SEPOLIA_SORTED_ORACLES,
  ),
  oracleReferenceStableAddress: readString(
    "ORACLE_REFERENCE_STABLE_ADDRESS",
    chain === "mainnet" ? MAINNET_ORACLE_REFERENCE_STABLE : SEPOLIA_ORACLE_REFERENCE_STABLE,
  ),
  aaveRpcUrl: readString("AAVE_RPC_URL", DEFAULT_AAVE_RPC_URL),
  celoUsdFallbackPrice: readFloat("CELO_USD_FALLBACK_PRICE", 0.72),
  externalTimeoutMs: readInt("EXTERNAL_TIMEOUT_MS", 7000),
  cacheTtlMs: readInt("CACHE_TTL_MS", 30_000),
  defaultUserCapitalUsd: readFloat("DEFAULT_USER_CAPITAL_USD", 0),
  defaultLiquidityBufferUsd: readFloat("DEFAULT_LIQUIDITY_BUFFER_USD", 0),
  demoFaucetNativeAmount: readFloat("DEMO_FAUCET_NATIVE_AMOUNT", 0.05),
  demoFaucetStableAmount: readFloat("DEMO_FAUCET_STABLE_AMOUNT", 1),
  demoFaucetCooldownMs: readInt("DEMO_FAUCET_COOLDOWN_MS", 12 * 60 * 60 * 1000),
  demoFaucetNativeReserve: readFloat("DEMO_FAUCET_NATIVE_RESERVE", 1),
  demoFaucetStableReserve: readFloat("DEMO_FAUCET_STABLE_RESERVE", 5),
  selfMode: readString("SELF_MODE", "mock"),
  selfRequiredForAgent: readBool("SELF_REQUIRED_FOR_AGENT", true),
  selfScope: readString("SELF_SCOPE", "liquidai"),
  selfVerifyEndpoint: readString("SELF_VERIFY_ENDPOINT", ""),
  selfUserIdType: readString("SELF_USER_ID_TYPE", "hex"),
  selfMockPassport: readBool("SELF_MOCK_PASSPORT", chain !== "mainnet"),
  selfMinimumAge: readInt("SELF_MINIMUM_AGE", 18),
  selfExcludedCountries: readList("SELF_EXCLUDED_COUNTRIES", []),
  selfOfac: readBool("SELF_OFAC", true),
  // Security Rule 1: Keys loaded only from environment variables
  privateKey: readString("PRIVATE_KEY", ""), 
};
