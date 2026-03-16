import { env } from "../../config/env.mjs";
import { createTtlCache } from "../../lib/cache.mjs";
import { fetchJson } from "../../lib/http.mjs";

const cache = createTtlCache(env.cacheTtlMs * 2); // cache for longer globally

export async function fetchAllCeloPools() {
  const cacheKey = "defi-llama-celo-pools";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const payload = await fetchJson("https://yields.llama.fi/pools", {
      timeoutMs: env.externalTimeoutMs,
    });
    const allPools = Array.isArray(payload?.data) ? payload.data : [];
    const celoPools = allPools.filter((pool) => String(pool.chain || "").toLowerCase() === "celo");
    cache.set(cacheKey, celoPools);
    return celoPools;
  } catch (error) {
    console.error("[DefiLlama] Failed to fetch pools:", error.message);
    throw error;
  }
}
