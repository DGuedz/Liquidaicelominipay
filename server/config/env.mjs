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

function normalizeCeloChain(value) {
  const normalized = value.toLowerCase();
  if (normalized === "mainnet" || normalized === "celo") return "mainnet";
  if (normalized === "alfajores") return "alfajores";
  return "sepolia";
}

const chain = normalizeCeloChain(readString("CELO_CHAIN", "sepolia"));

const MAINNET_USDM = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const SEPOLIA_USDM = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";
const LEGACY_ALFAJORES_CUSD = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
const MAINNET_SORTED_ORACLES = "0xFe36E2B8D6dA60EAFB5B81A2a9CCC3F53e4D0015";
const ALFAJORES_SORTED_ORACLES = "0x789299D3008985172087532B4C56357d38392576"; // Alfajores SortedOracles
const MAINNET_ORACLE_REFERENCE_STABLE = MAINNET_USDM;
const ALFAJORES_ORACLE_REFERENCE_STABLE = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // cUSD Alfajores
const DEFAULT_AAVE_RPC_URL = "https://forno.celo.org";

const defaultRpcUrl =
  chain === "alfajores"
    ? "https://alfajores-forno.celo-testnet.org"
    : "https://forno.celo.org";

const rawRpcUrl = readString("CELO_RPC_URL", "");
const celoRpcUrl =
  chain === "alfajores" && rawRpcUrl.toLowerCase().includes("celo-sepolia")
    ? defaultRpcUrl
    : rawRpcUrl || defaultRpcUrl;

const rawFeeCurrencyAddress = readString(
  "FEE_CURRENCY_ADDRESS",
  readString("CUSD_ADDRESS", ""),
);
const defaultFeeCurrencyAddress = chain === "alfajores" ? LEGACY_ALFAJORES_CUSD : MAINNET_USDM;
const feeCurrencyAddress =
  chain === "alfajores" &&
  !rawFeeCurrencyAddress
    ? defaultFeeCurrencyAddress
    : rawFeeCurrencyAddress || defaultFeeCurrencyAddress;

export const env = {
  nodeEnv: readString("NODE_ENV", "development"),
  port: readInt("API_PORT", 8787),
  frontendOrigin: readString("FRONTEND_ORIGIN", "*"),
  authSecret: readString("AUTH_SECRET", "liquidai-dev-secret-change-me"),
  authNonceTtlMs: readInt("AUTH_NONCE_TTL_MS", 5 * 60 * 1000),
  authTokenTtlMs: readInt("AUTH_TOKEN_TTL_MS", 24 * 60 * 60 * 1000),
  settlementLockTtlMs: readInt("SETTLEMENT_LOCK_TTL_MS", 2 * 60 * 1000),
  celoChain: chain,
  celoChainId: chain === "alfajores" ? 44787 : 42220,
  celoRpcUrl,
  feeCurrencyAddress,
  usdStableAddress: feeCurrencyAddress,
  sortedOraclesAddress: readString(
    "SORTED_ORACLES_ADDRESS",
    chain === "alfajores" ? ALFAJORES_SORTED_ORACLES : MAINNET_SORTED_ORACLES,
  ),
  oracleReferenceStableAddress: readString(
    "ORACLE_REFERENCE_STABLE_ADDRESS",
    chain === "alfajores" ? ALFAJORES_ORACLE_REFERENCE_STABLE : MAINNET_ORACLE_REFERENCE_STABLE,
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
  // Security Rule 1: Keys loaded only from environment variables
  privateKey: readString("PRIVATE_KEY", ""), 
};
