import { isAddress } from "viem";
import { env } from "../config/env.mjs";
import { buildAgentState, resolveRiskMode } from "./agent-engine.mjs";
import { getYieldSnapshot } from "./yield-service.mjs";
import { getWalletSnapshot } from "./wallet-service.mjs";
import { getOps } from "../store/session-store.mjs";
import { getLiquidityNetworkView } from "./liquidity-network-service.mjs";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toRounded(value, digits = 2) {
  return Number.parseFloat(value.toFixed(digits));
}

function buildSparkline(totalBalanceUsd) {
  const start = totalBalanceUsd * 0.91;
  return WEEK_DAYS.map((day, index) => ({
    day,
    value: toRounded(start + (index / (WEEK_DAYS.length - 1)) * (totalBalanceUsd - start), 2),
  }));
}

function buildTransactions(agentState) {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const bestPool = agentState.bestProtocol?.name || "Aave v3";
  const hasYield = agentState.status.yieldTodayUsd > 0;
  const transactions = [];

  if (hasYield) {
    transactions.push({
      id: "tx-1",
      name: "Yield Capture",
      subtitle: `LiquidAI Agent · Today ${time}`,
      type: "income",
      amount: toRounded(agentState.status.yieldTodayUsd, 2),
      kind: "yield",
    });
  }

  transactions.push({
    id: "tx-2",
    name: "Strategy Sync",
    subtitle: `${bestPool} · Today ${time}`,
    type: "income",
    amount: 0,
    kind: "rebalance",
  });

  if (agentState.status.opsCount > 0) {
    transactions.push({
      id: "tx-3",
      name: "Liquidity Buffer Ready",
      subtitle: "Instant payments enabled",
      type: "expense",
      amount: 0,
      kind: "pix",
    });
  }

  return transactions;
}

export async function getDashboardData({
  address,
  riskMode,
  capitalUsd,
  liquidityBufferUsd,
}) {
  const yields = await getYieldSnapshot();
  const mode = resolveRiskMode(riskMode);

  let wallet = null;
  if (typeof address === "string" && isAddress(address)) {
    try {
      wallet = await getWalletSnapshot(address);
    } catch {
      wallet = null;
    }
  }

  const resolvedCapitalUsd = wallet?.totalUsd && wallet.totalUsd > 0
    ? wallet.totalUsd
    : Number(capitalUsd) || env.defaultUserCapitalUsd;
  const hasRealWalletBalance = Boolean(wallet?.totalUsd && wallet.totalUsd > 0);

  const sessionOps = getOps(address);
  const agentState = buildAgentState({
    riskMode: mode,
    capitalUsd: resolvedCapitalUsd,
    liquidityBufferUsd,
    yields,
    opsCount: sessionOps,
    preserveActualCapital: hasRealWalletBalance,
  });

  const sparkline = buildSparkline(agentState.totalCapitalUsd);
  const transactions = buildTransactions(agentState);
  const agentEvents = agentState.logs.map((log) => log.action);
  const inflow = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const outflow = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);

  return {
    user: {
      address: wallet?.address || null,
      walletConnected: Boolean(wallet),
    },
    summary: {
      balanceUsd: agentState.totalCapitalUsd,
      apy: agentState.blendedApy,
      monthlyYieldUsd: agentState.projectedMonthlyYieldUsd,
      agentOpsToday: agentState.status.opsCount,
      managedCapitalUsd: toRounded(agentState.totalCapitalUsd - agentState.bufferUsd, 2),
      liquidityBufferUsd: agentState.bufferUsd,
      riskMode: mode,
    },
    financialStats: {
      inflowUsd: toRounded(inflow, 2),
      outflowUsd: toRounded(outflow, 2),
    },
    sparkline,
    transactions,
    agentEvents,
    marketOpportunity: {
      protocol: agentState.bestProtocol?.name || "Aave v3",
      apy: toRounded(agentState.bestProtocol?.apyValue || agentState.blendedApy, 2),
      estimatedMonthlyGain: toRounded(agentState.projectedMonthlyYieldUsd, 2),
    },
    agentState,
    liquidityNetwork: getLiquidityNetworkView(address, agentState, {
      balanceUsd: agentState.totalCapitalUsd,
    }),
    chain: wallet?.chain || null,
    updatedAt: new Date().toISOString(),
  };
}
