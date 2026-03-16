import { getAddress, isAddress, parseAbi } from "viem";
import { env } from "../config/env.mjs";
import { createTtlCache } from "../lib/cache.mjs";
import { celoClient } from "../lib/celo-client.mjs";

const cache = createTtlCache(env.cacheTtlMs);

const sortedOraclesAbi = parseAbi([
  "function medianRate(address token) view returns (uint256 numerator, uint256 denominator)",
  "function medianTimestamp(address token) view returns (uint256)",
  "function numRates(address token) view returns (uint256)",
  "function isOldestReportExpired(address token) view returns (bool)",
]);

function toRounded(value, digits = 6) {
  return Number.parseFloat(value.toFixed(digits));
}

function resolveOracleConfig() {
  if (!isAddress(env.sortedOraclesAddress) || !isAddress(env.oracleReferenceStableAddress)) {
    return null;
  }

  return {
    sortedOraclesAddress: getAddress(env.sortedOraclesAddress),
    referenceStableAddress: getAddress(env.oracleReferenceStableAddress),
  };
}

export async function getCeloUsdOraclePrice({ force = false } = {}) {
  if (!force) {
    const cached = cache.get("celo-usd-oracle");
    if (cached) return cached;
  }

  const oracleConfig = resolveOracleConfig();
  if (!oracleConfig) {
    throw new Error("SortedOracles is not configured for this environment.");
  }

  const [medianRate, medianTimestamp, numRates, isOldestReportExpired] = await Promise.all([
    celoClient.readContract({
      address: oracleConfig.sortedOraclesAddress,
      abi: sortedOraclesAbi,
      functionName: "medianRate",
      args: [oracleConfig.referenceStableAddress],
    }),
    celoClient.readContract({
      address: oracleConfig.sortedOraclesAddress,
      abi: sortedOraclesAbi,
      functionName: "medianTimestamp",
      args: [oracleConfig.referenceStableAddress],
    }),
    celoClient.readContract({
      address: oracleConfig.sortedOraclesAddress,
      abi: sortedOraclesAbi,
      functionName: "numRates",
      args: [oracleConfig.referenceStableAddress],
    }),
    celoClient.readContract({
      address: oracleConfig.sortedOraclesAddress,
      abi: sortedOraclesAbi,
      functionName: "isOldestReportExpired",
      args: [oracleConfig.referenceStableAddress],
    }),
  ]);

  const numerator = Number(medianRate[0]);
  const denominator = Number(medianRate[1]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    throw new Error("SortedOracles returned an invalid median rate.");
  }

  const priceUsd = numerator / denominator;
  const updatedAt = new Date(Number(medianTimestamp) * 1000).toISOString();

  const snapshot = {
    source: "sorted-oracles",
    priceUsd: toRounded(priceUsd, 6),
    numerator: medianRate[0].toString(),
    denominator: medianRate[1].toString(),
    rateCount: Number(numRates),
    oldestReportExpired: Boolean(isOldestReportExpired),
    updatedAt,
    sortedOraclesAddress: oracleConfig.sortedOraclesAddress,
    referenceStableAddress: oracleConfig.referenceStableAddress,
  };

  return cache.set("celo-usd-oracle", snapshot);
}
