import { getLiquidityNetwork, setLiquidityNetwork } from "../store/session-store.mjs";

const MIN_CONNECTION_USD = 0.25;
const MIN_REALLOCATION_USD = 1;
const MIN_REALLOCATION_DRIFT = 0.18;
const MIN_BEST_PROTOCOL_APY_DELTA = 0.35;

function toRounded(value, digits = 2) {
  return Number.parseFloat(value.toFixed(digits));
}

function nowIso() {
  return new Date().toISOString();
}

function sortConnections(connections) {
  return [...connections].sort((left, right) => right.amountUsd - left.amountUsd);
}

function materializeTargetConnections(agentState) {
  return sortConnections(
    (agentState?.allocations || [])
      .filter((allocation) => allocation.id !== "buffer")
      .filter((allocation) => Number(allocation.amount) >= MIN_CONNECTION_USD)
      .map((allocation) => ({
        id: allocation.id,
        name: allocation.name,
        type: allocation.type,
        apy: allocation.apy,
        apyValue: allocation.apyValue,
        amountUsd: toRounded(Number(allocation.amount) || 0),
        pct: toRounded(Number(allocation.pct) || 0, 1),
        color: allocation.color,
        source: allocation.source,
      })),
  );
}

function activeConnectionIds(connections) {
  return connections.map((connection) => connection.id);
}

function connectionMap(connections) {
  return new Map(connections.map((connection) => [connection.id, connection]));
}

function calculateDrift(currentConnections, targetConnections) {
  const current = connectionMap(currentConnections);
  const target = connectionMap(targetConnections);
  const ids = new Set([...current.keys(), ...target.keys()]);
  let totalDriftUsd = 0;
  let maxSingleDriftUsd = 0;

  ids.forEach((id) => {
    const currentAmount = Number(current.get(id)?.amountUsd || 0);
    const targetAmount = Number(target.get(id)?.amountUsd || 0);
    const drift = Math.abs(targetAmount - currentAmount);
    totalDriftUsd += drift;
    maxSingleDriftUsd = Math.max(maxSingleDriftUsd, drift);
  });

  return {
    totalDriftUsd: toRounded(totalDriftUsd),
    maxSingleDriftUsd: toRounded(maxSingleDriftUsd),
  };
}

function shouldReallocate(currentState, targetConnections, agentState) {
  if (!currentState.connections.length) {
    return {
      reallocate: targetConnections.length > 0,
      reason: "first-allocation",
      driftUsd: 0,
      apyDelta: 0,
    };
  }

  const { totalDriftUsd, maxSingleDriftUsd } = calculateDrift(currentState.connections, targetConnections);
  const investableCapital = Math.max(0, Number(agentState.totalCapitalUsd) - Number(agentState.bufferUsd));
  const driftRatio = investableCapital > 0 ? totalDriftUsd / investableCapital : 0;

  const currentBest = sortConnections(currentState.connections)[0] || null;
  const targetBest = targetConnections[0] || null;
  const currentBestApy = Number(currentBest?.apyValue || 0);
  const targetBestApy = Number(targetBest?.apyValue || 0);
  const apyDelta = toRounded(targetBestApy - currentBestApy, 2);

  if (!targetConnections.length) {
    return {
      reallocate: false,
      reason: "no-target-connections",
      driftUsd: totalDriftUsd,
      apyDelta,
    };
  }

  if (targetBest && currentBest && targetBest.id !== currentBest.id && apyDelta >= MIN_BEST_PROTOCOL_APY_DELTA) {
    return {
      reallocate: true,
      reason: "better-best-protocol",
      driftUsd: totalDriftUsd,
      apyDelta,
    };
  }

  if (maxSingleDriftUsd >= MIN_REALLOCATION_USD && driftRatio >= MIN_REALLOCATION_DRIFT) {
    return {
      reallocate: true,
      reason: "allocation-drift-threshold",
      driftUsd: totalDriftUsd,
      apyDelta,
    };
  }

  return {
    reallocate: false,
    reason: "connections-stable",
    driftUsd: totalDriftUsd,
    apyDelta,
  };
}

function mergeConnections(currentState, targetConnections, reallocate) {
  if (reallocate) {
    const optimizedAt = nowIso();
    return targetConnections.map((connection) => {
      const existing = currentState.connections.find((candidate) => candidate.id === connection.id);
      return {
        ...connection,
        connectedAt: existing?.connectedAt || optimizedAt,
        lastReallocatedAt: optimizedAt,
      };
    });
  }

  return currentState.connections.map((connection) => {
    const target = targetConnections.find((candidate) => candidate.id === connection.id);
    return target
      ? {
          ...connection,
          apy: target.apy,
          apyValue: target.apyValue,
          amountUsd: target.amountUsd,
          pct: target.pct,
          source: target.source,
          color: target.color,
          name: target.name,
          type: target.type,
        }
      : connection;
  });
}

export function getLiquidityNetworkView(address, agentState, summary = {}) {
  const currentState = getLiquidityNetwork(address);
  const targetConnections = materializeTargetConnections(agentState);
  const recommendation = shouldReallocate(currentState, targetConnections, agentState);
  const connections = currentState.connections.length
    ? mergeConnections(currentState, targetConnections, false)
    : [];
  const activeProtocolIds = activeConnectionIds(connections);

  return {
    status: activeProtocolIds.length ? "optimized" : "standby",
    sourceAmountUsd: toRounded(Number(summary.balanceUsd || agentState?.totalCapitalUsd || 0)),
    yieldCapturedUsd: toRounded(Number(currentState.yieldCapturedUsd || 0)),
    activeProtocolIds,
    connections,
    lastOptimizedAt: currentState.lastOptimizedAt,
    lastDecision: recommendation,
    ctaLabel: recommendation.reallocate
      ? "Reallocate Liquidity"
      : activeProtocolIds.length
        ? "Connections Stable"
        : "Optimize Liquidity",
    canOptimize: recommendation.reallocate || !activeProtocolIds.length,
  };
}

export function optimizeLiquidityNetwork(address, agentState, summary = {}, { proofTxHash = null } = {}) {
  const currentState = getLiquidityNetwork(address);
  const targetConnections = materializeTargetConnections(agentState);
  const decision = shouldReallocate(currentState, targetConnections, agentState);
  const optimizedAt = nowIso();
  const nextConnections = mergeConnections(currentState, targetConnections, decision.reallocate);
  const totalYieldCaptured = decision.reallocate
    ? Number(currentState.yieldCapturedUsd || 0) + Number(agentState.status?.yieldTodayUsd || 0)
    : Number(currentState.yieldCapturedUsd || 0);

  const nextState = setLiquidityNetwork(address, {
    status: nextConnections.length ? "optimized" : "standby",
    activeProtocolIds: activeConnectionIds(nextConnections),
    connections: nextConnections,
    yieldCapturedUsd: toRounded(totalYieldCaptured),
    sourceAmountUsd: toRounded(Number(summary.balanceUsd || agentState?.totalCapitalUsd || 0)),
    lastOptimizedAt: decision.reallocate ? optimizedAt : currentState.lastOptimizedAt,
    lastDecision: {
      ...decision,
      evaluatedAt: optimizedAt,
    },
    lastProofTxHash: proofTxHash || currentState.lastProofTxHash || null,
    totalReallocations: decision.reallocate
      ? Number(currentState.totalReallocations || 0) + 1
      : Number(currentState.totalReallocations || 0),
  });

  return {
    status: nextState.status,
    sourceAmountUsd: nextState.sourceAmountUsd,
    yieldCapturedUsd: nextState.yieldCapturedUsd,
    activeProtocolIds: nextState.activeProtocolIds,
    connections: nextState.connections,
    lastOptimizedAt: nextState.lastOptimizedAt,
    lastDecision: nextState.lastDecision,
    ctaLabel: decision.reallocate ? "Liquidity Optimized" : "Connections Stable",
    canOptimize: decision.reallocate,
    totalReallocations: nextState.totalReallocations,
    proofTxHash: nextState.lastProofTxHash,
  };
}
