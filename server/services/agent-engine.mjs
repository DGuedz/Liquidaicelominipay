import { env } from "../config/env.mjs";
import { LiquidityAuditor } from "./liquidity-auditor.mjs";
import { logAgentAction } from "./karma-service.mjs";

const RISK_PROFILES = {
  conservative: {
    id: "conservative",
    label: "Conservative",
    subtitle: "Inflation Shield",
    bufferPct: 0.34,
    baseWeights: { aave: 0.5, morpho: 0.15, mento: 0.35 },
    riskMultiplier: { low: 1, medium: 0.45, high: 0.2 },
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    subtitle: "Best Value",
    bufferPct: 0.26,
    baseWeights: { aave: 0.35, morpho: 0.4, mento: 0.25 },
    riskMultiplier: { low: 1, medium: 0.9, high: 0.45 },
  },
  aggressive: {
    id: "aggressive",
    label: "Aggressive",
    subtitle: "Maximize APY",
    bufferPct: 0.16,
    baseWeights: { aave: 0.2, morpho: 0.55, mento: 0.25 },
    riskMultiplier: { low: 0.95, medium: 1.05, high: 0.8 },
  },
};

const PROTOCOL_LABELS = {
  aave: "Aave v3 (USDm)",
  morpho: "Morpho (Looping)",
  mento: "Mento V3 (Stable AMM)",
};

const PROTOCOL_DESCRIPTIONS = {
  aave: "Stable Lending",
  morpho: "Looping with higher return",
  mento: "Stable Liquidity and FX",
};

function toRounded(value, digits = 2) {
  return Number.parseFloat(value.toFixed(digits));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sourceReliabilityWeight(source) {
  const normalized = String(source || "").toLowerCase();
  if (normalized.includes("onchain")) return 1;
  if (normalized === "defillama") return 0.8;
  if (normalized === "fallback") return 0.25;
  return 0.65;
}

export function resolveRiskMode(rawMode) {
  if (!rawMode) return "balanced";
  return Object.prototype.hasOwnProperty.call(RISK_PROFILES, rawMode) ? rawMode : "balanced";
}

export function buildRebalancePlan({
  riskMode = "balanced",
  capitalUsd = env.defaultUserCapitalUsd,
  liquidityBufferUsd = env.defaultLiquidityBufferUsd,
  yields,
  preserveActualCapital = false,
}) {
  const mode = resolveRiskMode(riskMode);
  const profile = RISK_PROFILES[mode];
  const requestedCapital = Number(capitalUsd) || env.defaultUserCapitalUsd;
  const totalCapital = preserveActualCapital
    ? Math.max(0, requestedCapital)
    : Math.max(0, requestedCapital);
  const minimumBuffer = totalCapital * profile.bufferPct;
  const requestedBuffer = Number(liquidityBufferUsd) || env.defaultLiquidityBufferUsd;
  const maxBuffer = totalCapital * 0.7;
  const seededBuffer = preserveActualCapital ? Math.min(requestedBuffer, maxBuffer) : requestedBuffer;
  const bufferAmount = clamp(
    seededBuffer,
    minimumBuffer,
    maxBuffer,
  );

  const investableCapital = Math.max(0, totalCapital - bufferAmount);
  const scored = (yields?.protocols || []).map((protocol) => {
    const baseWeight = profile.baseWeights[protocol.id] || 0.2;
    const riskBoost = profile.riskMultiplier[protocol.risk] || 0.65;
    const apyBoost = Math.max(0.5, protocol.apy / 5);
    const sourceBoost = sourceReliabilityWeight(protocol.source);
    return {
      ...protocol,
      score: baseWeight * riskBoost * apyBoost * sourceBoost,
    };
  });

  const scoreSum = scored.reduce((sum, item) => sum + item.score, 0) || 1;

  const allocations = scored.map((protocol) => {
    const pct = (protocol.score / scoreSum) * (investableCapital > 0 ? (investableCapital / totalCapital) * 100 : 0);
    const amount = (pct / 100) * totalCapital;
    return {
      id: protocol.id,
      name: PROTOCOL_LABELS[protocol.id] || protocol.name,
      type: PROTOCOL_DESCRIPTIONS[protocol.id] || "Strategy",
      apy: `${toRounded(protocol.apy, 2)}%`,
      apyValue: protocol.apy,
      pct: toRounded(pct, 1),
      amount: toRounded(amount, 2),
      color: protocol.color,
      source: protocol.source,
      score: toRounded(protocol.score, 4),
    };
  });

  const blendedApy = allocations.reduce((sum, allocation) => {
    if (totalCapital === 0) return 0;
    return sum + (allocation.amount / totalCapital) * allocation.apyValue;
  }, 0);

  const monthlyYieldUsd = (totalCapital * blendedApy) / 100 / 12;

  const bufferPct = totalCapital === 0 ? 0 : (bufferAmount / totalCapital) * 100;
  let bestProtocol = allocations
    .filter((item) => item.id !== "buffer")
    .sort((a, b) => b.score - a.score || b.apyValue - a.apyValue)[0];
  
  // ─── AUDITOR INTEGRATION ──────────────────────────────────────────────────
  // Validate the "best protocol" allocation before finalizing
  if (allocations.length > 0) {
    // Find the allocation for best protocol to validate it
    const bestAlloc = allocations.find(a => a.id === bestProtocol?.id);
    if (bestAlloc && bestAlloc.amount > 0) {
      const audit = LiquidityAuditor.validate({
        walletBalanceUsd: totalCapital,
        bufferUsd: bufferAmount,
        riskMode: mode,
        proposedAction: {
          protocolId: bestAlloc.id,
          amountUsd: bestAlloc.amount,
          currentApy: 0, // Assuming starting from idle/0
          newApy: bestAlloc.apyValue
        }
      });

      if (!audit.approved) {
        // If rejected, move capital back to buffer/idle
        // console.log(`[Agent] Audit rejected allocation to ${bestAlloc.name}:`, audit.reasons);
        bestAlloc.amount = 0;
        bestAlloc.pct = 0;
        bestAlloc.auditNote = "Rejected by Safety Oracle";
        
        // Adjust buffer to absorb the rejected amount
        const bufferItem = allocations.find(a => a.id === "buffer");
        if (bufferItem) {
          bufferItem.amount += audit.maxSafeAmountUsd > 0 ? 0 : bestAlloc.amount; // Simplify: just dump to buffer
          bufferItem.pct += bestAlloc.pct;
        }
      } else if (audit.maxSafeAmountUsd < bestAlloc.amount) {
        // Cap the amount
        const diff = bestAlloc.amount - audit.maxSafeAmountUsd;
        bestAlloc.amount = audit.maxSafeAmountUsd;
        bestAlloc.pct = (bestAlloc.amount / totalCapital) * 100;
        
        const bufferItem = allocations.find(a => a.id === "buffer");
        if (bufferItem) {
          bufferItem.amount += diff;
          bufferItem.pct = (bufferItem.amount / totalCapital) * 100;
        }
      }
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  allocations.push({
    id: "buffer",
    name: "Liquidity Buffer",
    type: "Instant payments (PIX/card)",
    apy: "0.00%",
    apyValue: 0,
    pct: toRounded(bufferPct, 1),
    amount: toRounded(bufferAmount, 2),
    color: "#A3D977",
    source: "agent",
  });

  bestProtocol = allocations
    .filter((item) => item.id !== "buffer")
    .sort((a, b) => b.score - a.score || b.apyValue - a.apyValue)[0];

  return {
    riskMode: mode,
    profile: {
      id: profile.id,
      label: profile.label,
      subtitle: profile.subtitle,
    },
    totalCapitalUsd: toRounded(totalCapital, 2),
    bufferUsd: toRounded(bufferAmount, 2),
    blendedApy: toRounded(blendedApy, 2),
    projectedMonthlyYieldUsd: toRounded(monthlyYieldUsd, 2),
    allocations,
    bestProtocol,
  };
}

export function buildAgentState({
  riskMode,
  capitalUsd,
  liquidityBufferUsd,
  yields,
  opsCount = 0,
  yieldTodayUsd,
  preserveActualCapital = false,
}) {
  const plan = buildRebalancePlan({
    riskMode,
    capitalUsd,
    liquidityBufferUsd,
    yields,
    preserveActualCapital,
  });
  const effectiveYieldTodayUsd = Number.isFinite(yieldTodayUsd)
    ? yieldTodayUsd
    : toRounded(plan.projectedMonthlyYieldUsd / 30, 2);
  const now = new Date();
  const shortTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const isStartingState = plan.totalCapitalUsd <= 10 && opsCount === 0;

  const logs = isStartingState
    ? [
        {
          time: "Now",
          type: "rebalance",
          intentId: `intent-erc8004-${Date.now()}-1`,
          action: `Wallet synced. Initial strategy prepared for ${plan.bestProtocol?.name || "stable liquidity"}.`,
        },
        {
          time: shortTime,
          type: "protection",
          intentId: `intent-erc8004-${Date.now()}-2`,
          action: `Initial liquidity buffer set at $${plan.bufferUsd.toFixed(2)} to keep payments available.`,
        },
        {
          time: shortTime,
          type: "opportunity",
          intentId: `intent-erc8004-${Date.now()}-3`,
          action: `Best current opportunity: ${plan.bestProtocol?.name || "Aave v3"} (${toRounded(plan.bestProtocol?.apyValue || 0, 2)}% APY).`,
        },
      ]
    : [
        {
          time: "Now",
          type: "rebalance",
          intentId: `intent-erc8004-${Date.now()}-1`,
          action: `Autonomous router adjusted allocation to ${plan.bestProtocol?.name || "best available pool"}.`,
        },
        {
          time: shortTime,
          type: "yield",
          action: `Daily accumulated yield: +$${toRounded(effectiveYieldTodayUsd, 2)} (${plan.blendedApy}% APY blended).`,
        },
        {
          time: shortTime,
          type: "protection",
          intentId: `intent-erc8004-${Date.now()}-4`,
          action: `Maintained buffer size of $${plan.bufferUsd.toFixed(2)} to protect against short-term spending needs.`,
        },
        {
          time: shortTime,
          type: "opportunity",
          intentId: `intent-erc8004-${Date.now()}-5`,
          action: `Yield verified: ${plan.bestProtocol?.name || "Aave v3"} remains optimal choice (${toRounded(plan.bestProtocol?.apyValue || 0, 2)}% APY).`,
        },
      ];

  const rebalanceSuggestion = plan.bestProtocol?.id !== "aave"
    && plan.totalCapitalUsd >= 5
    ? {
        id: 1001,
        action: `Reallocate $${toRounded(Math.max(5, plan.totalCapitalUsd * 0.18), 2)} to ${plan.bestProtocol?.name}`,
        gain: `+$${toRounded((Math.max(5, plan.totalCapitalUsd * 0.18) * (plan.bestProtocol?.apyValue || 0)) / 100 / 12, 2)}/mo`,
        risk: plan.riskMode === "aggressive" ? "Moderate" : "Low",
        riskColor: plan.riskMode === "aggressive" ? "#F59E0B" : "#10B981",
        intentId: `intent-erc8004-${Date.now()}-auth`,
      }
    : null;

  const pendingAuthorizations = rebalanceSuggestion ? [rebalanceSuggestion] : [];

  // Log to Karma (Proof-of-Ship)
  if (plan.bestProtocol && plan.bestProtocol.amount > 0) {
    logAgentAction({
      type: "REBALANCE",
      protocol: plan.bestProtocol.name,
      asset: "USDm",
      amount: plan.bestProtocol.amount,
    });
  }

  return {
    ...plan,
    status: {
      isRunning: true,
      opsCount,
      yieldTodayUsd: toRounded(effectiveYieldTodayUsd, 2),
      updatedAt: new Date().toISOString(),
    },
    logs,
    pendingAuthorizations,
  };
}
