const BASE_PROTOCOL_RISK = {
  aave: 1.1,
  mento: 1.2,
  curve: 1.3,
  uniswap: 1.5,
  stcelo: 1.6,
  moola: 1.8,
  morpho: 2.0,
  kiln: 2.1,
  untangled: 2.8,
  ethichub: 3.0,
  "credit-collective": 3.0,
};

const PROTOCOL_CATEGORY = {
  aave: "lending",
  mento: "stable-swap",
  curve: "stable-swap",
  uniswap: "amm",
  stcelo: "staking",
  moola: "lending",
  morpho: "loop-lending",
  kiln: "managed-yield",
  untangled: "rwa-credit",
  ethichub: "rwa-credit",
  "credit-collective": "rwa-credit",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function tvlRiskScore(tvlUsd) {
  if (tvlUsd >= 100_000_000) return 1.0;
  if (tvlUsd >= 25_000_000) return 1.4;
  if (tvlUsd >= 10_000_000) return 1.8;
  if (tvlUsd >= 1_000_000) return 2.4;
  return 3.2;
}

function apyRiskScore(apy) {
  if (apy <= 5) return 1.2;
  if (apy <= 10) return 1.8;
  if (apy <= 16) return 2.5;
  return 3.4;
}

function oracleRiskScore(oracleConfidence) {
  if (oracleConfidence >= 0.95) return 1.0;
  if (oracleConfidence >= 0.85) return 1.5;
  if (oracleConfidence >= 0.7) return 2.2;
  return 3.0;
}

function liquidityRiskScore(liquidityDepthUsd, tvlUsd) {
  const depth = Math.max(toNumber(liquidityDepthUsd), toNumber(tvlUsd));
  if (depth >= 50_000_000) return 1.1;
  if (depth >= 10_000_000) return 1.6;
  if (depth >= 1_000_000) return 2.2;
  return 3.1;
}

function riskBand(score) {
  if (score < 1.9) return "low";
  if (score < 2.75) return "medium";
  return "high";
}

export function normalizeRiskDetails({
  apy,
  tvlUsd,
  protocol,
  oracleConfidence = 0.9,
  liquidityDepthUsd = 0,
}) {
  const protocolKey = String(protocol || "unknown").toLowerCase();
  const baseProtocolRisk = BASE_PROTOCOL_RISK[protocolKey] || 3.1;
  const normalizedTvlUsd = Math.max(0, toNumber(tvlUsd));
  const normalizedApy = Math.max(0, toNumber(apy));
  const normalizedOracleConfidence = clamp(toNumber(oracleConfidence, 0.75), 0.1, 1);

  const factors = {
    protocolScore: baseProtocolRisk,
    tvlScore: tvlRiskScore(normalizedTvlUsd),
    apyScore: apyRiskScore(normalizedApy),
    oracleScore: oracleRiskScore(normalizedOracleConfidence),
    liquidityScore: liquidityRiskScore(liquidityDepthUsd, normalizedTvlUsd),
  };

  const weighted =
    factors.protocolScore * 0.35 +
    factors.tvlScore * 0.25 +
    factors.apyScore * 0.2 +
    factors.liquidityScore * 0.15 +
    factors.oracleScore * 0.05;

  const riskScore = Number.parseFloat(weighted.toFixed(2));
  const risk = riskBand(riskScore);

  return {
    risk,
    riskScore,
    category: PROTOCOL_CATEGORY[protocolKey] || "other",
    factors,
  };
}

export function normalizeRisk(input) {
  return normalizeRiskDetails(input).risk;
}
