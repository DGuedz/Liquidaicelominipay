import { createRequire } from "module";
import { formatUnits, parseUnits } from "viem";
import { env } from "../../config/env.mjs";
import { createTtlCache } from "../../lib/cache.mjs";
import { fetchAllCeloPools } from "./defi-llama.mjs";
import { normalizeRiskDetails } from "./risk-normalizer.mjs";

const require = createRequire(import.meta.url);
const { Mento, ChainId } = require("@mento-protocol/mento-sdk");

const PROTOCOL_ID = "mento";
const PROJECT_ALIASES = ["mento"];
const TOKEN_HINT = /cUSD|cEUR|USDC|BRL|USDm/i;

const cache = createTtlCache(env.cacheTtlMs);

const FALLBACK_YIELD = {
  apy: 3.8,
  tvlUsd: 10000000,
  pool: "Mento Stable Pool",
  source: "fallback",
};

const MAINNET_USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
const SEPOLIA_USDC = "0x01C5C0122039549AD1493B8220cABEdD739BC44E";

let mentoPromise = null;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pickQuoteBaseToken() {
  return env.celoChain === "mainnet" ? MAINNET_USDC : SEPOLIA_USDC;
}

function getMentoChainId() {
  return env.celoChain === "mainnet" ? ChainId.CELO : ChainId.CELO_SEPOLIA;
}

async function getMentoClient() {
  if (!mentoPromise) {
    mentoPromise = Mento.create(getMentoChainId(), env.celoRpcUrl);
  }
  return mentoPromise;
}

function addressesMatch(left, right) {
  return String(left || "").toLowerCase() === String(right || "").toLowerCase();
}

function normalizePoolTvlUsd(details) {
  const decimals0 = Math.max(0, String(details.scalingFactor0).length - 1);
  const decimals1 = Math.max(0, String(details.scalingFactor1).length - 1);
  const reserve0 = toNumber(formatUnits(details.reserve0, decimals0));
  const reserve1 = toNumber(formatUnits(details.reserve1, decimals1));
  return reserve0 + reserve1;
}

function estimateMentoApy(details) {
  const totalFeePercent = details.poolType === "FPMM"
    ? toNumber(details.fees?.totalFeePercent, 0.05)
    : toNumber(details.spreadPercent, 0.05);
  const apy = 2.4 + totalFeePercent * 18;
  return Math.max(1.8, Math.min(5.5, apy));
}

async function getOnchainMentoYield() {
  const quoteBaseToken = pickQuoteBaseToken();
  const quoteTargetToken = env.usdStableAddress;
  const mento = await getMentoClient();
  const pools = await mento.pools.getPools();
  const targetPool = pools.find((pool) =>
    (addressesMatch(pool.token0, quoteBaseToken) && addressesMatch(pool.token1, quoteTargetToken))
    || (addressesMatch(pool.token1, quoteBaseToken) && addressesMatch(pool.token0, quoteTargetToken)),
  );

  if (!targetPool?.poolAddr) {
    throw new Error(`mento-pool-not-found:${quoteBaseToken}-${quoteTargetToken}`);
  }

  const [details, amountOut] = await Promise.all([
    mento.pools.getPoolDetails(targetPool.poolAddr),
    mento.quotes.getAmountOut(quoteBaseToken, quoteTargetToken, parseUnits("1", 6)),
  ]);

  const tvlUsd = normalizePoolTvlUsd(details);
  const amountOutNormalized = toNumber(formatUnits(amountOut, 18));
  const quotePrice = amountOutNormalized;
  const apy = estimateMentoApy(details);
  const priceDiffPercent = details.poolType === "FPMM"
    ? toNumber(details.pricing?.priceDifferencePercent, 0)
    : 0;
  const inBand = details.poolType === "FPMM" ? details.rebalancing?.inBand : true;

  return {
    id: PROTOCOL_ID,
    name: "Mento V3",
    apy,
    tvlUsd: Number.parseFloat(tvlUsd.toFixed(2)),
    pool: `${details.poolType} ${targetPool.poolAddr.slice(0, 6)}…${targetPool.poolAddr.slice(-4)}`,
    source: "mento-sdk-onchain",
    color: "#F59E0B",
    integrationStatus: "active",
    category: "stable-swap",
    quote: {
      baseToken: quoteBaseToken,
      targetToken: quoteTargetToken,
      amountIn: 1,
      amountOut: Number.parseFloat(amountOutNormalized.toFixed(8)),
      effectivePrice: Number.parseFloat(quotePrice.toFixed(8)),
    },
    poolDetails: {
      poolAddress: targetPool.poolAddr,
      poolType: details.poolType,
      reserve0: details.reserve0.toString(),
      reserve1: details.reserve1.toString(),
      tvlUsd: Number.parseFloat(tvlUsd.toFixed(2)),
      pricing: details.poolType === "FPMM" && details.pricing
        ? {
            oraclePrice: details.pricing.oraclePrice,
            reservePrice: details.pricing.reservePrice,
            priceDifferencePercent: details.pricing.priceDifferencePercent,
          }
        : null,
      fees: details.poolType === "FPMM"
        ? {
            totalFeePercent: details.fees.totalFeePercent,
            lpFeePercent: details.fees.lpFeePercent,
            protocolFeePercent: details.fees.protocolFeePercent,
          }
        : {
            spreadPercent: details.spreadPercent,
          },
      rebalancing: details.poolType === "FPMM"
        ? {
            inBand,
            rebalanceIncentivePercent: details.rebalancing.rebalanceIncentivePercent,
            rebalanceThresholdAbovePercent: details.rebalancing.rebalanceThresholdAbovePercent,
            rebalanceThresholdBelowPercent: details.rebalancing.rebalanceThresholdBelowPercent,
          }
        : null,
    },
    dataChainId: env.celoChainId,
    dataChain: env.celoChain,
    apyModel: "heuristic-onchain-liquidity",
  };
}

async function getFallbackMentoYield() {
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
    name: "Mento V3",
    apy,
    tvlUsd,
    pool: poolName,
    source,
    color: "#F59E0B",
    integrationStatus: "active",
    category: "stable-swap",
  };
}

export async function getMentoYield() {
  const cacheKey = `yield-adapter-${PROTOCOL_ID}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let result;

  try {
    result = await getOnchainMentoYield();
  } catch (error) {
    console.warn(`[Adapter:${PROTOCOL_ID}] on-chain path failed`, error.message);
    result = await getFallbackMentoYield();
  }

  const risk = normalizeRiskDetails({
    apy: result.apy,
    tvlUsd: result.tvlUsd,
    protocol: PROTOCOL_ID,
    oracleConfidence: result.source === "mento-sdk-onchain"
      ? (result.poolDetails?.rebalancing?.inBand === false ? 0.78 : 0.95)
      : result.source === "defillama"
        ? 0.94
        : 0.82,
    liquidityDepthUsd: result.tvlUsd,
  });

  result.risk = risk.risk;
  result.riskScore = risk.riskScore;
  result.riskFactors = risk.factors;

  cache.set(cacheKey, result);
  return result;
}
