let goalId = 500;

const sessions = new Map();

const DEFAULT_GOALS = [];

function actorKey(address) {
  if (typeof address === "string" && address.trim()) return address.toLowerCase();
  return "demo-user";
}

function cloneGoals(goals) {
  return goals.map((goal) => ({ ...goal }));
}

function ensureSession(address) {
  const key = actorKey(address);
  const existing = sessions.get(key);
  if (existing) return existing;

  const seed = {
    goals: cloneGoals(DEFAULT_GOALS),
    opsCount: 0,
    authorizedActionIds: new Set(),
    dismissedActionIds: new Set(),
    liquidityNetwork: {
      status: "standby",
      activeProtocolIds: [],
      connections: [],
      yieldCapturedUsd: 0,
      sourceAmountUsd: 0,
      lastOptimizedAt: null,
      lastDecision: null,
      lastProofTxHash: null,
      totalReallocations: 0,
    },
  };
  sessions.set(key, seed);
  return seed;
}

export function getSession(address) {
  return ensureSession(address);
}

export function getGoals(address) {
  const session = ensureSession(address);
  return cloneGoals(session.goals);
}

export function addGoal(address, payload) {
  const session = ensureSession(address);
  const target = Number(payload.target) || 0;
  const safeTarget = target > 0 ? target : 300;
  const contribution = Number(payload.monthlyContribution) || Math.max(10, Math.round(safeTarget / 12));

  const nextGoal = {
    id: ++goalId,
    name: payload.name || "Nova Meta",
    emoji: payload.emoji || "target",
    target: safeTarget,
    saved: Number(payload.saved) || 0,
    monthlyContribution: contribution,
    color: payload.color || "#0D4B2E",
    bg: payload.bg || "rgba(13,75,46,0.1)",
    deadline: payload.deadline || "2027",
    autoSave: Boolean(payload.autoSave),
    agentOptimized: Boolean(payload.agentOptimized),
  };

  session.goals.push(nextGoal);
  return { ...nextGoal };
}

export function updateGoal(address, goalIdToUpdate, patch) {
  const session = ensureSession(address);
  const goalIdNumber = Number(goalIdToUpdate);
  const index = session.goals.findIndex((goal) => goal.id === goalIdNumber);
  if (index < 0) return null;

  session.goals[index] = {
    ...session.goals[index],
    ...patch,
  };

  return { ...session.goals[index] };
}

export function incrementOps(address, amount = 1) {
  const session = ensureSession(address);
  session.opsCount += amount;
  return session.opsCount;
}

export function getOps(address) {
  const session = ensureSession(address);
  return session.opsCount;
}

export function markActionAuthorized(address, actionId) {
  const session = ensureSession(address);
  session.authorizedActionIds.add(String(actionId));
}

export function markActionDismissed(address, actionId) {
  const session = ensureSession(address);
  session.dismissedActionIds.add(String(actionId));
}

export function getActionState(address) {
  const session = ensureSession(address);
  return {
    authorizedActionIds: new Set(session.authorizedActionIds),
    dismissedActionIds: new Set(session.dismissedActionIds),
  };
}

export function getLiquidityNetwork(address) {
  const session = ensureSession(address);
  return {
    ...session.liquidityNetwork,
    activeProtocolIds: [...session.liquidityNetwork.activeProtocolIds],
    connections: session.liquidityNetwork.connections.map((connection) => ({ ...connection })),
    lastDecision: session.liquidityNetwork.lastDecision
      ? { ...session.liquidityNetwork.lastDecision }
      : null,
  };
}

export function setLiquidityNetwork(address, nextState) {
  const session = ensureSession(address);
  session.liquidityNetwork = {
    ...session.liquidityNetwork,
    ...nextState,
    activeProtocolIds: Array.isArray(nextState.activeProtocolIds)
      ? [...nextState.activeProtocolIds]
      : [...session.liquidityNetwork.activeProtocolIds],
    connections: Array.isArray(nextState.connections)
      ? nextState.connections.map((connection) => ({ ...connection }))
      : session.liquidityNetwork.connections.map((connection) => ({ ...connection })),
    lastDecision: nextState.lastDecision
      ? { ...nextState.lastDecision }
      : nextState.lastDecision === null
        ? null
        : session.liquidityNetwork.lastDecision,
  };
  return getLiquidityNetwork(address);
}
