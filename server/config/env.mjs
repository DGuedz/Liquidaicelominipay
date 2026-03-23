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

function readCountry3List(name, fallback = []) {
  const values = readList(name, fallback)
    .map((value) => String(value || "").trim().toUpperCase())
    .filter((value) => /^[A-Z]{3}$/.test(value));
  return values.length ? values : [];
}

function readUrlLike(name, fallback = "") {
  const raw = process.env[name];
  if (typeof raw !== "string" || !raw.trim()) return fallback;

  const extract = (input) => {
    const cleaned = String(input || "")
      .trim()
      .replace(/^[-*]\s*/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (!cleaned) return "";
    const matched = cleaned.match(/https?:\/\/[^\s,"'\\]+/i);
    const candidate = matched ? matched[0] : cleaned;
    try {
      return new URL(candidate).toString().replace(/\/+$/, "");
    } catch {
      return "";
    }
  };

  const direct = extract(raw);
  if (direct) return direct;

  const lines = raw
    .split(/\r?\n|,/g)
    .map((line) => extract(line))
    .filter(Boolean);
  if (lines.length) return lines[0];

  const match = raw.match(/https?:\/\/[^\s,"'\\]+/i);
  if (!match) return fallback;
  return extract(match[0]) || fallback;
}

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
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
    : "https://alfajores-forno.celo-testnet.org";

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
  host: readString("HOST", "0.0.0.0"),
  port: readInt("PORT", readInt("API_PORT", 8787)),
  frontendOrigin: readString("FRONTEND_ORIGIN", DEFAULT_FRONTEND_ORIGINS.join(",")),
  frontendOrigins: mergedFrontendOrigins,
  authDomain: readString("AUTH_DOMAIN", "liquidai-app.vercel.app"),
  authUri: readString("AUTH_URI", "https://liquidai-app.vercel.app"),
  authCookieName: readString("AUTH_COOKIE_NAME", "liquidai_auth"),
  authCookieDomain: readString("AUTH_COOKIE_DOMAIN", ""),
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
  selfMode: readString("SELF_MODE", "agent"),
  selfRequiredForAgent: readBool("SELF_REQUIRED_FOR_AGENT", true),
  selfScope: readString("SELF_SCOPE", "liquidai").slice(0, 30),
  publicApiBaseUrl: readUrlLike("PUBLIC_API_BASE_URL", ""),
  selfVerifyEndpoint: readUrlLike("SELF_VERIFY_ENDPOINT", ""),
  selfEnforceCallbackSecret: readBool("SELF_ENFORCE_CALLBACK_SECRET", false),
  selfUserIdType: readString("SELF_USER_ID_TYPE", "hex"),
  selfAgentRegisterMode: readString("SELF_AGENT_REGISTER_MODE", "linked"),
  selfMockPassport: readBool("SELF_MOCK_PASSPORT", chain !== "mainnet"),
  selfMinimumAge: clampInt(process.env.SELF_MINIMUM_AGE, 0, 99, 18),
  selfExcludedCountries: readCountry3List("SELF_EXCLUDED_COUNTRIES", []),
  selfOfac: readBool("SELF_OFAC", true),
  selfSessionTtlMs: readInt("SELF_SESSION_TTL_MS", 30 * 60 * 1000),
  selfCallbackSecret: readString("SELF_CALLBACK_SECRET", ""),
  selfCallbackReplayWindowMs: readInt("SELF_CALLBACK_REPLAY_WINDOW_MS", 24 * 60 * 60 * 1000),
  securityStateStore: readString("SECURITY_STATE_STORE", "file"),
  securityStateFilePath: readString("SECURITY_STATE_FILE", ".data/security-state.json"),
  securityStateLockTimeoutMs: readInt("SECURITY_STATE_LOCK_TIMEOUT_MS", 2_000),
  securityStateLockStaleMs: readInt("SECURITY_STATE_LOCK_STALE_MS", 20_000),
  // Security Rule 1: Keys loaded only from environment variables
  privateKey: readString("PRIVATE_KEY", ""), 
};
