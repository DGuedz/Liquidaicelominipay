import { createPublicClient, formatUnits, http } from "viem";
import { celo } from "viem/chains";
import { AaveV3Celo } from "@bgd-labs/aave-address-book";
import { env } from "../../config/env.mjs";
import { createTtlCache } from "../../lib/cache.mjs";
import { fetchAllCeloPools } from "./defi-llama.mjs";
import { normalizeRiskDetails } from "./risk-normalizer.mjs";

const PROTOCOL_ID = "aave";
const PROJECT_ALIASES = ["aave-v3", "aave"];
const TOKEN_HINT = /USDm|USDC|USDT/i;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

const cache = createTtlCache(env.cacheTtlMs);

const FALLBACK_YIELD = {
  apy: 4.8,
  tvlUsd: 15000000,
  pool: "Aave v3 USDm",
  source: "fallback",
};

const aaveClient = createPublicClient({
  chain: celo,
  transport: http(env.aaveRpcUrl),
});

const poolAbi = [
  {
    name: "getReserveData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "configuration", type: "uint256" },
        { name: "liquidityIndex", type: "uint128" },
        { name: "currentLiquidityRate", type: "uint128" },
        { name: "variableBorrowIndex", type: "uint128" },
        { name: "currentVariableBorrowRate", type: "uint128" },
        { name: "currentStableBorrowRate", type: "uint128" },
        { name: "lastUpdateTimestamp", type: "uint40" },
        { name: "id", type: "uint16" },
        { name: "aTokenAddress", type: "address" },
        { name: "stableDebtTokenAddress", type: "address" },
        { name: "variableDebtTokenAddress", type: "address" },
        { name: "interestRateStrategyAddress", type: "address" },
        { name: "accruedToTreasury", type: "uint128" },
        { name: "unbacked", type: "uint128" },
        { name: "isolationModeTotalDebt", type: "uint128" },
      ],
    }],
  },
];

const erc20Abi = [{
  name: "totalSupply",
  type: "function",
  stateMutability: "view",
  inputs: [],
  outputs: [{ type: "uint256" }],
}];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function aprRayToApyPercent(rawRate) {
  const apr = toNumber(formatUnits(rawRate, 27));
  if (!Number.isFinite(apr) || apr <= 0) return 0;
  const apy = Math.pow(1 + apr / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1;
  return apy * 100;
}

async function readReserve(assetConfig, label) {
  const [reserveData, totalSupply] = await Promise.all([
    aaveClient.readContract({
      address: AaveV3Celo.POOL,
      abi: poolAbi,
      functionName: "getReserveData",
      args: [assetConfig.UNDERLYING],
    }),
    aaveClient.readContract({
      address: assetConfig.A_TOKEN,
      abi: erc20Abi,
      functionName: "totalSupply",
    }),
  ]);

  const apy = aprRayToApyPercent(reserveData.currentLiquidityRate);
  const tvlUsd = toNumber(formatUnits(totalSupply, assetConfig.decimals));

  return {
    label,
    asset: assetConfig.UNDERLYING,
    aToken: assetConfig.A_TOKEN,
    decimals: assetConfig.decimals,
    apy: Number.parseFloat(apy.toFixed(4)),
    tvlUsd: Number.parseFloat(tvlUsd.toFixed(2)),
    reserveData: {
      liquidityIndex: reserveData.liquidityIndex.toString(),
      currentLiquidityRate: reserveData.currentLiquidityRate.toString(),
      variableBorrowIndex: reserveData.variableBorrowIndex.toString(),
      currentVariableBorrowRate: reserveData.currentVariableBorrowRate.toString(),
      lastUpdateTimestamp: new Date(Number(reserveData.lastUpdateTimestamp) * 1000).toISOString(),
      aTokenAddress: reserveData.aTokenAddress,
      variableDebtTokenAddress: reserveData.variableDebtTokenAddress,
    },
  };
}

async function getOnchainAaveYield() {
  const candidates = await Promise.all([
    readReserve(AaveV3Celo.ASSETS.USDm, "USDm"),
    readReserve(AaveV3Celo.ASSETS.USDC, "USDC"),
  ]);

  const best = candidates.reduce((currentBest, candidate) => {
    const candidateScore = candidate.tvlUsd * Math.max(0.5, candidate.apy / 10);
    if (!currentBest) return candidate;
    const bestScore = currentBest.tvlUsd * Math.max(0.5, currentBest.apy / 10);
    return candidateScore > bestScore ? candidate : currentBest;
  }, null);

  if (!best) {
    throw new Error("aave-reserve-not-found");
  }

  return {
    id: PROTOCOL_ID,
    name: "Aave v3",
    apy: Number.parseFloat(best.apy.toFixed(2)),
    tvlUsd: best.tvlUsd,
    pool: `Aave v3 ${best.label}`,
    source: "aave-v3-onchain",
    color: "#06B6D4",
    integrationStatus: "active",
    category: "lending",
    dataChainId: 42220,
    dataChain: "mainnet",
    asset: best.asset,
    reserve: {
      marketAsset: best.label,
      aToken: best.aToken,
      liquidityRateRay: best.reserveData.currentLiquidityRate,
      liquidityIndexRay: best.reserveData.liquidityIndex,
      variableBorrowRateRay: best.reserveData.currentVariableBorrowRate,
      lastUpdateTimestamp: best.reserveData.lastUpdateTimestamp,
    },
    reserveCandidates: candidates.map((candidate) => ({
      marketAsset: candidate.label,
      asset: candidate.asset,
      apy: Number.parseFloat(candidate.apy.toFixed(2)),
      tvlUsd: candidate.tvlUsd,
      lastUpdateTimestamp: candidate.reserveData.lastUpdateTimestamp,
    })),
  };
}

async function getFallbackAaveYield() {
  let apy = FALLBACK_YIELD.apy;
  let tvlUsd = FALLBACK_YIELD.tvlUsd;
  let poolName = FALLBACK_YIELD.pool;
  let source = FALLBACK_YIELD.source;

  try {
    const pools = await fetchAllCeloPools();
    const candidates = pools.filter((pool) =>
      PROJECT_ALIASES.some((alias) => String(pool.project || "").toLowerCase() === alias),
    );

    if (candidates.length) {
      const hinted = candidates.filter((pool) => TOKEN_HINT.test(`${pool.symbol || ""}/${pool.poolMeta || ""}`));
      const bestSource = hinted.length > 0 ? hinted : candidates;

      const bestPool = bestSource.reduce((best, current) => {
        const currentScore = toNumber(current.tvlUsd) * Math.max(0.5, toNumber(current.apy, 0) / 10);
        if (!best) return current;
        const bestScore = toNumber(best.tvlUsd) * Math.max(0.5, toNumber(best.apy, 0) / 10);
        return currentScore > bestScore ? current : best;
      }, null);

      if (bestPool) {
        apy = toNumber(bestPool.apy, FALLBACK_YIELD.apy);
        tvlUsd = toNumber(bestPool.tvlUsd, FALLBACK_YIELD.tvlUsd);
        poolName = bestPool.symbol || bestPool.poolMeta || FALLBACK_YIELD.pool;
        source = "defillama";
      }
    }
  } catch (error) {
    console.warn(`[Adapter:${PROTOCOL_ID}] fallback provider degraded`, error.message);
  }

  return {
    id: PROTOCOL_ID,
    name: "Aave v3",
    apy,
    tvlUsd,
    pool: poolName,
    source,
    color: "#06B6D4",
    integrationStatus: "active",
    category: "lending",
  };
}

export async function getAaveYield() {
  const cacheKey = `yield-adapter-${PROTOCOL_ID}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let result;

  try {
    result = await getOnchainAaveYield();
  } catch (error) {
    console.warn(`[Adapter:${PROTOCOL_ID}] on-chain path failed`, error.message);
    result = await getFallbackAaveYield();
  }

  const risk = normalizeRiskDetails({
    apy: result.apy,
    tvlUsd: result.tvlUsd,
    protocol: PROTOCOL_ID,
    oracleConfidence: result.source === "aave-v3-onchain"
      ? 0.98
      : result.source === "defillama"
        ? 0.9
        : 0.75,
    liquidityDepthUsd: result.tvlUsd,
  });

  result.risk = risk.risk;
  result.riskScore = risk.riskScore;
  result.riskFactors = risk.factors;

  cache.set(cacheKey, result);
  return result;
}
