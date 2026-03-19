import { env } from "../../config/env.mjs";
import { createTtlCache } from "../../lib/cache.mjs";
import { fetchAllCeloPools } from "./defi-llama.mjs";
import { normalizeRiskDetails } from "./risk-normalizer.mjs";

const PROTOCOL_ID = "morpho";
const PROJECT_ALIASES = ["morpho-blue", "morpho"];
const TOKEN_HINT = /stCELO|CELO|USDm/i;

const cache = createTtlCache(env.cacheTtlMs);

const FALLBACK_YIELD = {
  apy: 6.3,
  tvlUsd: 5000000,
  pool: "Morpho CELO",
  source: "fallback",
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getMorphoYield() {
  const cacheKey = `yield-adapter-${PROTOCOL_ID}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

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
    console.warn(`[Adapter:${PROTOCOL_ID}] using fallback`, error.message);
  }

  const result = {
    id: PROTOCOL_ID,
    name: "Morpho",
    apy,
    tvlUsd,
    pool: poolName,
    source,
    color: "#10B981",
    integrationStatus: "active",
    category: "loop-lending",
  };

  const risk = normalizeRiskDetails({
    apy,
    tvlUsd,
    protocol: PROTOCOL_ID,
    oracleConfidence: source === "defillama" ? 0.88 : 0.72,
    liquidityDepthUsd: tvlUsd,
  });

  result.risk = risk.risk;
  result.riskScore = risk.riskScore;
  result.riskFactors = risk.factors;

  cache.set(cacheKey, result);
  return result;
}
