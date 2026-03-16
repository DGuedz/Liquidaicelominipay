import { env } from "../config/env.mjs";
import { createTtlCache } from "../lib/cache.mjs";
import { getAaveYield, getMorphoYield, getMentoYield } from "../adapters/yield/index.mjs";
import { ECOSYSTEM_RADAR } from "../adapters/yield/radar.mjs";

const cache = createTtlCache(env.cacheTtlMs);

export async function getYieldSnapshot({ force = false } = {}) {
  if (!force) {
    const cached = cache.get("yield-snapshot");
    if (cached) return cached;
  }

  const adapters = [
    { id: "aave", run: getAaveYield },
    { id: "morpho", run: getMorphoYield },
    { id: "mento", run: getMentoYield },
  ];

  const settled = await Promise.allSettled(adapters.map((adapter) => adapter.run()));
  const protocols = [];
  const providerWarnings = [];

  settled.forEach((result, index) => {
    const adapterId = adapters[index].id;
    if (result.status === "fulfilled" && result.value) {
      protocols.push(result.value);
      return;
    }
    providerWarnings.push({
      protocol: adapterId,
      reason: result.status === "rejected"
        ? result.reason?.message || "adapter-failed"
        : "adapter-empty-response",
    });
  });

  const providerError = providerWarnings.length > 0
    ? `yield-provider-partial-failure:${providerWarnings.map((item) => item.protocol).join(",")}`
    : "";

  const weightedApy = protocols.length > 0 
    ? protocols.reduce((sum, protocol) => sum + protocol.apy, 0) / protocols.length
    : 0;

  const snapshot = {
    chainId: env.celoChainId,
    chain: env.celoChain,
    protocols,
    blendedApy: Number.parseFloat(weightedApy.toFixed(2)),
    providerError,
    providerWarnings,
    ecosystemRadar: ECOSYSTEM_RADAR,
    updatedAt: new Date().toISOString(),
  };

  return cache.set("yield-snapshot", snapshot);
}
