import { getDashboardData } from "./dashboard-service.mjs";
import { getYieldSnapshot } from "./yield-service.mjs";

function toRounded(value, digits = 2) {
  return Number.parseFloat(value.toFixed(digits));
}

function lastMonths() {
  return ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Hoje"];
}

function makeCashflowData(baseInflow, baseOutflow) {
  return lastMonths().map((month, index) => {
    const seasonality = 1 + ((index % 3) - 1) * 0.07;
    return {
      month,
      income: toRounded(Math.max(0, baseInflow * seasonality), 2),
      spending: toRounded(Math.max(0, baseOutflow * (1 - ((index % 2) * 0.04))), 2),
    };
  });
}

function makeYieldData(baseApy, monthlyYieldUsd) {
  return lastMonths().map((month, index) => ({
    month,
    yield: toRounded(Math.max(0, (monthlyYieldUsd / 6) * ((index + 1) / 7)), 2),
  }));
}

export async function getAnalyticsOverview(params) {
  const [dashboard, yields] = await Promise.all([
    getDashboardData(params),
    getYieldSnapshot(),
  ]);

  const mode = dashboard.summary.riskMode;
  const totalBalance = Math.max(0, dashboard.summary.balanceUsd || 0);
  const keyMetrics = [
    {
      label: "APY Atual",
      value: `${dashboard.summary.apy.toFixed(2)}%`,
      sub: `${dashboard.marketOpportunity.protocol} em destaque`,
      color: "#0D4B2E",
      bg: "#E8F5E9",
    },
    {
      label: "Yield Total",
      value: `$${dashboard.summary.monthlyYieldUsd.toFixed(2)}`,
      sub: "Projeção mensal",
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      label: "Otimizações",
      value: dashboard.summary.agentOpsToday.toString(),
      sub: "Operações automáticas",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      label: "Retorno Total",
      value: `+$${dashboard.summary.monthlyYieldUsd.toFixed(2)}`,
      sub: "Projeção atual",
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.1)",
    },
  ];

  const investable = dashboard.summary.managedCapitalUsd;
  const buffer = dashboard.summary.liquidityBufferUsd;
  const reserve = Math.max(0, dashboard.summary.balanceUsd - investable - buffer);

  const allocationData = [
    { name: "Capital Produtivo", value: toRounded(investable, 2), color: "#0D4B2E" },
    { name: "Liquidez", value: toRounded(buffer, 2), color: "#A3D977" },
    { name: "Reserva", value: toRounded(reserve, 2), color: "#E5E7EB" },
  ];

  const protectionLogs = dashboard.agentState.logs.map((log, index) => ({
    id: index + 1,
    time: log.time,
    event: log.action,
    action: log.action,
    type: log.type,
    impact: log.type === "yield" ? `+$${toRounded(dashboard.summary.monthlyYieldUsd / 30, 2)}/dia` : "Risco controlado",
  }));

  const vaultReserves = [
    {
      id: "buffer",
      label: "Liquidity Buffer",
      desc: "Pagamentos instantâneos",
      pct: totalBalance > 0 ? toRounded((buffer / totalBalance) * 100, 1) : 0,
      amount: toRounded(buffer, 2),
      color: "#06B6D4",
      bg: "rgba(6,182,212,0.1)",
      yield: "0% (imediato)",
    },
    {
      id: "vault",
      label: "Yield Vault",
      desc: `${yields.protocols[0]?.name || "Aave"} + ${yields.protocols[1]?.name || "Morpho"}`,
      pct: totalBalance > 0 ? toRounded((investable / totalBalance) * 100, 1) : 0,
      amount: toRounded(investable, 2),
      color: "#A3D977",
      bg: "rgba(163,217,119,0.1)",
      yield: `${dashboard.summary.apy.toFixed(2)}% APY`,
    },
    {
      id: "credit",
      label: "Credit Engine",
      desc: "Reserva para expansão de crédito",
      pct: totalBalance > 0 ? toRounded((reserve / totalBalance) * 100, 1) : 0,
      amount: toRounded(reserve, 2),
      color: "#8B5CF6",
      bg: "rgba(139,92,246,0.1)",
      yield: mode === "aggressive" ? "Ativo" : "Planejado",
    },
  ];

  return {
    keyMetrics,
    cashflowData: makeCashflowData(
      dashboard.financialStats.inflowUsd,
      dashboard.financialStats.outflowUsd,
    ),
    yieldData: makeYieldData(dashboard.summary.apy, dashboard.summary.monthlyYieldUsd),
    allocationData,
    protectionLogs,
    vaultReserves,
    updatedAt: new Date().toISOString(),
  };
}
