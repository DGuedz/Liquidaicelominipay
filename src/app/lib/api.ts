const DEFAULT_API_BASE_URL = "http://localhost:8787";
const AUTH_TOKEN_STORAGE_KEY = "liquidai-auth-token";
let inMemoryAuthToken = "";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  error?: string;
};

export type DashboardTransaction = {
  id: string;
  name: string;
  subtitle: string;
  type: "income" | "expense";
  amount: number;
  kind: "yield" | "rebalance" | "pix" | string;
};

export type DashboardPayload = {
  user?: {
    address: string | null;
    walletConnected: boolean;
  };
  summary: {
    balanceUsd: number;
    apy: number;
    monthlyYieldUsd: number;
    agentOpsToday: number;
    managedCapitalUsd: number;
    liquidityBufferUsd: number;
    riskMode: string;
  };
  financialStats: {
    inflowUsd: number;
    outflowUsd: number;
  };
  sparkline: Array<{ day: string; value: number }>;
  transactions: DashboardTransaction[];
  agentEvents: string[];
  liquidityNetwork: {
    status: "standby" | "optimized";
    sourceAmountUsd: number;
    yieldCapturedUsd: number;
    activeProtocolIds: string[];
    connections: Array<{
      id: string;
      name: string;
      type: string;
      apy: string;
      apyValue: number;
      amountUsd: number;
      pct: number;
      color: string;
      source: string;
      connectedAt?: string;
      lastReallocatedAt?: string;
    }>;
    lastOptimizedAt: string | null;
    lastDecision: null | {
      reallocate: boolean;
      reason: string;
      driftUsd: number;
      apyDelta: number;
      evaluatedAt?: string;
    };
    ctaLabel: string;
    canOptimize: boolean;
    totalReallocations?: number;
    proofTxHash?: string | null;
  };
};

export type AgentStatePayload = {
  riskMode: "conservative" | "balanced" | "aggressive";
  blendedApy: number;
  projectedMonthlyYieldUsd: number;
  totalCapitalUsd: number;
  bufferUsd?: number;
  allocations?: Array<{
    id: string;
    name: string;
    type: string;
    apy: string;
    apyValue: number;
    pct: number;
    amount: number;
    color: string;
    source: string;
    score?: number;
  }>;
  bestProtocol?: {
    id: string;
    name: string;
    type: string;
    apy: string;
    apyValue: number;
    pct: number;
    amount: number;
    color: string;
    source: string;
  };
  status: {
    isRunning: boolean;
    opsCount: number;
    yieldTodayUsd: number;
  };
  logs: Array<{ time: string; type: string; action: string }>;
  pendingAuthorizations: Array<{
    id: number | string;
    action: string;
    gain: string;
    risk: string;
    riskColor: string;
    intentId?: string;
  }>;
};

export type OptimizeLiquidityPayload = {
  network: DashboardPayload["liquidityNetwork"];
  opsCount: number;
};

export type AnalyticsPayload = {
  keyMetrics: Array<{
    label: string;
    value: string;
    sub: string;
    color: string;
    bg: string;
  }>;
  cashflowData: Array<{ month: string; income: number; spending: number }>;
  yieldData: Array<{ month: string; yield: number }>;
  allocationData: Array<{ name: string; value: number; color: string }>;
  protectionLogs: Array<{
    id: number;
    time: string;
    event: string;
    action: string;
    type: string;
    impact: string;
  }>;
  vaultReserves: Array<{
    id: string;
    label: string;
    desc: string;
    pct: number;
    amount: number;
    color: string;
    bg: string;
    yield: string;
  }>;
};

export type SavingsGoalPayload = {
  id: number;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  monthlyContribution: number;
  color: string;
  bg: string;
  deadline: string;
  autoSave: boolean;
  agentOptimized: boolean;
};

export type SavingsOverviewPayload = {
  goals: SavingsGoalPayload[];
  summary: {
    totalTarget: number;
    totalSaved: number;
    completionPct: number;
    autoSaveCount: number;
  };
  insight: string;
};

export type ChatReplyPayload = {
  type: "text" | "action" | "insight" | "success";
  text: string;
  thinkingSteps?: string[];
  actionData?: {
    id: string;
    title: string;
    amount: string;
    gain: string;
    risk: string;
    riskColor: string;
    protocol: string;
  };
};

export type AuthChallengePayload = {
  address: string;
  nonce: string;
  message: string;
  expiresAt: string;
};

export type AuthSessionPayload = {
  address: string;
  token: string;
  expiresAt: string;
};

export type FaucetStatusPayload = {
  enabled: boolean;
  chainId: number;
  backendAddress: string | null;
  cooldownMs: number;
  claimAmount: {
    nativeToken: string;
    nativeAmount: number;
    stableToken: string;
    stableAmount: number;
  };
  treasury: {
    address: string | null;
    native: { token: string; balance: number };
    stable: { token: string; address: string; balance: number; decimals?: number };
  };
  claimState: {
    claimCount: number;
    lastClaimAt: string | null;
    nextEligibleAt: string | null;
    cooldownMs: number;
    remainingMs: number;
    lastClaim: null | {
      address: string;
      nativeTxHash: string;
      stableTxHash: string;
      nativeExplorerUrl: string;
      stableExplorerUrl: string;
      nativeAmount: number;
      stableAmount: number;
      stableToken: string;
      claimedAt: string;
    };
  };
};

export type FaucetClaimPayload = {
  address: string;
  nativeTxHash: string;
  stableTxHash: string;
  nativeExplorerUrl: string;
  stableExplorerUrl: string;
  nativeAmount: number;
  stableAmount: number;
  stableToken: string;
  claimedAt: string;
  claimCount: number;
  nextEligibleAt: string;
};

export type SelfStatusPayload = {
  ready: boolean;
  mode: string;
  verified: boolean;
  requiredForAgent: boolean;
  message?: string;
};

export type SelfRegistrationPayload = {
  sessionToken: string;
  deepLink?: string;
  qrData?: string | Record<string, unknown>;
  mode: string;
};

export type SelfPollPayload = {
  stage: string;
  agentId?: number | string;
  verified: boolean;
};

export type ActivationRoutePayload = {
  address: string;
  chainId: number;
  ready: boolean;
  nextAction:
    | "connect_wallet"
    | "switch_network"
    | "activate_session"
    | "verify_self"
    | "claim_faucet"
    | "activate_agent"
    | "open_dashboard";
  recommendedCta: string;
  blockers: string[];
  checks: {
    walletAddressProvided: boolean;
    correctNetwork: boolean;
    sessionReady: boolean;
    selfRequired: boolean;
    selfVerified: boolean;
    walletFunded: boolean;
    faucetAvailable: boolean;
    treasuryHealthy: boolean;
    backendHealthy: boolean;
    hasRecentProof: boolean;
  };
  balances: {
    native: { token: string; balance: number; usdValue: number };
    stable: { token: string; balance: number; usdValue: number; address: string };
  };
  faucet: null | {
    enabled: boolean;
    cooldownMs: number;
    claimAmount: FaucetStatusPayload["claimAmount"];
    claimState: FaucetStatusPayload["claimState"];
  };
  serviceHealth: {
    backendHealthy: boolean;
    backendAddress: string | null;
  };
  updatedAt: string;
};

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getApiAuthToken() {
  return inMemoryAuthToken;
}

export function setApiAuthToken(token: string) {
  if (typeof token !== "string" || !token.trim()) {
    inMemoryAuthToken = "";
    return;
  }
  inMemoryAuthToken = token.trim();
}

export function clearApiAuthToken() {
  inMemoryAuthToken = "";
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  if (typeof window !== "undefined") {
    void fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }
}

export async function hasApiAuthSession() {
  try {
    await apiGet<{ address: string; expiresAt: string }>("/api/auth/me");
    return true;
  } catch {
    return false;
  }
}

function withQuery(path: string, query?: Record<string, string | number | undefined>) {
  if (!query) return path;
  const url = new URL(path, `${API_BASE_URL}/`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString().replace(API_BASE_URL, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const authToken = getApiAuthToken();
  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const raw = await response.text();
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = raw ? (JSON.parse(raw) as ApiEnvelope<T>) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const backendError = payload && typeof payload.error === "string" ? payload.error : "";
    throw new Error(backendError || `API ${response.status}: ${response.statusText}`);
  }

  if (!payload) {
    throw new Error("API response could not be parsed.");
  }
  if (!payload.ok) {
    throw new Error(payload.error || "API request failed.");
  }
  return payload.data;
}

export function apiGet<T>(path: string, query?: Record<string, string | number | undefined>) {
  return request<T>(withQuery(path, query));
}

export function apiPost<T>(path: string, body?: unknown, method: "POST" | "PATCH" = "POST") {
  return request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}
