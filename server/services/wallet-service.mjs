import { formatUnits, getAddress, isAddress, parseAbi } from "viem";
import { env } from "../config/env.mjs";
import { createTtlCache } from "../lib/cache.mjs";
import { celoClient, getChainHeartbeat } from "../lib/celo-client.mjs";
import { fetchJson } from "../lib/http.mjs";
import { getCeloUsdOraclePrice } from "./oracle-service.mjs";

const cache = createTtlCache(env.cacheTtlMs);

const erc20Abi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

function toRounded(value, decimals = 4) {
  return Number.parseFloat(value.toFixed(decimals));
}

async function getCeloUsdPrice() {
  const cached = cache.get("celo-usd-price");
  if (cached) return cached;

  try {
    const oracleSnapshot = await getCeloUsdOraclePrice();
    if (Number.isFinite(oracleSnapshot?.priceUsd) && oracleSnapshot.priceUsd > 0) {
      return cache.set("celo-usd-price", {
        priceUsd: oracleSnapshot.priceUsd,
        source: oracleSnapshot.source,
        updatedAt: oracleSnapshot.updatedAt,
        oldestReportExpired: oracleSnapshot.oldestReportExpired,
      }, env.cacheTtlMs);
    }
  } catch {
    // fallback below
  }

  try {
    const payload = await fetchJson("https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd", {
      timeoutMs: env.externalTimeoutMs,
    });
    const price = Number(payload?.celo?.usd);
    if (Number.isFinite(price) && price > 0) {
      return cache.set("celo-usd-price", {
        priceUsd: price,
        source: "coingecko",
        updatedAt: new Date().toISOString(),
        oldestReportExpired: false,
      }, env.cacheTtlMs);
    }
  } catch {
    // fallback below
  }

  return cache.set("celo-usd-price", {
    priceUsd: env.celoUsdFallbackPrice,
    source: "fallback",
    updatedAt: new Date().toISOString(),
    oldestReportExpired: false,
  }, env.cacheTtlMs);
}

async function readStableBalance(address) {
  const [rawBalance, decimals, symbol] = await Promise.all([
    celoClient.readContract({
      address: env.usdStableAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
    celoClient.readContract({
      address: env.usdStableAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }),
    celoClient.readContract({
      address: env.usdStableAddress,
      abi: erc20Abi,
      functionName: "symbol",
    }),
  ]);

  const balance = Number.parseFloat(formatUnits(rawBalance, decimals));

  return {
    token: symbol,
    address: env.usdStableAddress,
    balance: toRounded(balance, 6),
    usdValue: toRounded(balance, 2),
  };
}

export async function getWalletSnapshot(rawAddress) {
  if (!isAddress(rawAddress)) {
    throw new Error("Invalid wallet address.");
  }

  const address = getAddress(rawAddress);
  const [nativeBalanceRaw, chain, stableBalance, celoUsdPrice] = await Promise.all([
    celoClient.getBalance({ address }),
    getChainHeartbeat(),
    readStableBalance(address),
    getCeloUsdPrice(),
  ]);

  const nativeCelo = Number.parseFloat(formatUnits(nativeBalanceRaw, 18));
  const nativeUsd = nativeCelo * celoUsdPrice.priceUsd;
  const totalUsd = stableBalance.usdValue + nativeUsd;

  return {
    address,
    chain,
    balances: {
      native: {
        token: "CELO",
        balance: toRounded(nativeCelo, 6),
        usdValue: toRounded(nativeUsd, 2),
      },
      stable: stableBalance,
    },
    pricing: {
      celoUsd: {
        price: toRounded(celoUsdPrice.priceUsd, 6),
        source: celoUsdPrice.source,
        updatedAt: celoUsdPrice.updatedAt,
        oldestReportExpired: Boolean(celoUsdPrice.oldestReportExpired),
      },
    },
    totalUsd: toRounded(totalUsd, 2),
    updatedAt: new Date().toISOString(),
  };
}
