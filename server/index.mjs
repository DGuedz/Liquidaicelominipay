import cors from "cors";
import express from "express";
import { getAddress, isAddress } from "viem";
import { env } from "./config/env.mjs";
import { getChainHeartbeat } from "./lib/celo-client.mjs";
import { getAnalyticsOverview } from "./services/analytics-service.mjs";
import { buildAgentState, resolveRiskMode } from "./services/agent-engine.mjs";
import { getActivationRoute } from "./services/activation-router-service.mjs";
import { createAuthChallenge, readAuthSession, verifyAuthChallenge } from "./services/auth-service.mjs";
import { generateChatReply } from "./services/chat-service.mjs";
import { getDashboardData } from "./services/dashboard-service.mjs";
import { claimDemoFunds, getFaucetStatus } from "./services/faucet-service.mjs";
import { createGoal, getSavingsOverview, patchGoal } from "./services/savings-service.mjs";
import { getWalletSnapshot } from "./services/wallet-service.mjs";
import { getYieldSnapshot } from "./services/yield-service.mjs";
import { getCeloUsdOraclePrice } from "./services/oracle-service.mjs";
import {
  getActionState,
  getOps,
  incrementOps,
  markActionAuthorized,
  markActionDismissed,
} from "./store/session-store.mjs";
import { optimizeLiquidityNetwork } from "./services/liquidity-network-service.mjs";
import {
  getSelfVerification,
  isSelfVerified,
  markSelfVerified,
  resetSelfVerification,
} from "./store/self-store.mjs";
import {
  checkRegistrationStatus,
  getSelfServiceStatus,
  initSelfAgent,
  startSelfRegistration,
} from "./services/self-service.mjs";
import {
  createConditionalLock,
  finalizeSettlement,
  getSettlementStatus,
  listRecentSettlements,
} from "./services/settlement-service.mjs";
import { getUserProfile, updateUserProfile } from "./services/profile-service.mjs";
import { getKarmaReputation } from "./services/karma-service.mjs";

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin === "*" ? true : env.frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "512kb" }));

function parseNumeric(value, fallback) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function queryParams(req) {
  return {
    address: typeof req.query.address === "string" ? req.query.address : "",
    riskMode: resolveRiskMode(typeof req.query.riskMode === "string" ? req.query.riskMode : "balanced"),
    capitalUsd: parseNumeric(req.query.capitalUsd, env.defaultUserCapitalUsd),
    liquidityBufferUsd: parseNumeric(req.query.liquidityBufferUsd, env.defaultLiquidityBufferUsd),
  };
}

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

function success(res, data) {
  res.json({
    ok: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

function authError(res, status, message) {
  res.status(status).json({
    ok: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
}

function readBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== "string") return "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

function walletAuthGuard(extractAddress) {
  return (req, res, next) => {
    const candidate = extractAddress(req);
    if (!isAddress(candidate)) {
      next();
      return;
    }

    const token = readBearerToken(req);
    if (!token) {
      authError(res, 401, "Wallet authentication required.");
      return;
    }

    const session = readAuthSession(token);
    if (!session) {
      authError(res, 401, "Invalid or expired auth session.");
      return;
    }

    const requestedAddress = getAddress(candidate);
    if (session.address !== requestedAddress) {
      authError(res, 403, "Session address does not match request address.");
      return;
    }

    req.authSession = session;
    next();
  };
}

app.get(
  "/api/health",
  asyncRoute(async (_req, res) => {
    const [chain, yields, oracle] = await Promise.all([
      getChainHeartbeat(),
      getYieldSnapshot(),
      getCeloUsdOraclePrice().catch(() => null),
    ]);
    success(res, {
      status: "healthy",
      chain,
      yieldsUpdatedAt: yields.updatedAt,
      oracleUpdatedAt: oracle?.updatedAt || null,
      oracleSource: oracle?.source || null,
      service: "liquidai-backend",
    });
  }),
);

app.post(
  "/api/auth/challenge",
  asyncRoute(async (req, res) => {
    const { address = "" } = req.body || {};
    const challenge = createAuthChallenge(address);
    success(res, challenge);
  }),
);

app.post(
  "/api/auth/verify",
  asyncRoute(async (req, res) => {
    const { address = "", nonce = "", signature = "" } = req.body || {};
    const session = await verifyAuthChallenge({
      rawAddress: address,
      rawNonce: nonce,
      rawSignature: signature,
    });
    success(res, session);
  }),
);

app.get(
  "/api/auth/me",
  asyncRoute(async (req, res) => {
    const token = readBearerToken(req);
    const session = readAuthSession(token);
    if (!session) {
      authError(res, 401, "No valid auth session.");
      return;
    }

    success(res, {
      address: session.address,
      expiresAt: new Date(session.exp).toISOString(),
    });
  }),
);

app.get(
  "/api/yields",
  asyncRoute(async (_req, res) => {
    const snapshot = await getYieldSnapshot({ force: false });
    success(res, snapshot);
  }),
);

app.get(
  "/api/oracles/celo-usd",
  asyncRoute(async (_req, res) => {
    const snapshot = await getCeloUsdOraclePrice();
    success(res, snapshot);
  }),
);

app.get(
  "/api/wallet/:address",
  asyncRoute(async (req, res) => {
    const snapshot = await getWalletSnapshot(req.params.address);
    success(res, snapshot);
  }),
);

app.get(
  "/api/testnet/faucet",
  asyncRoute(async (req, res) => {
    const address = typeof req.query.address === "string" ? req.query.address : "";
    const payload = await getFaucetStatus(address);
    success(res, payload);
  }),
);

app.post(
  "/api/testnet/faucet/claim",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "" } = req.body || {};
    const claim = await claimDemoFunds(address);
    success(res, claim);
  }),
);

app.get(
  "/api/router/activation",
  asyncRoute(async (req, res) => {
    const address = typeof req.query.address === "string" ? req.query.address : "";
    const correctNetwork = typeof req.query.correctNetwork === "string"
      ? req.query.correctNetwork === "true"
      : true;
    const data = await getActivationRoute({
      rawAddress: address,
      authToken: readBearerToken(req),
      correctNetwork,
    });
    success(res, data);
  }),
);

app.get(
  "/api/dashboard",
  asyncRoute(async (req, res) => {
    const data = await getDashboardData(queryParams(req));
    success(res, data);
  }),
);

app.get(
  "/api/agent/state",
  asyncRoute(async (req, res) => {
    const params = queryParams(req);
    const dashboard = await getDashboardData(params);
    const { authorizedActionIds, dismissedActionIds } = getActionState(params.address);
    const pendingAuthorizations = dashboard.agentState.pendingAuthorizations.filter((action) => {
      const key = String(action.id);
      return !authorizedActionIds.has(key) && !dismissedActionIds.has(key);
    });

    success(res, {
      ...dashboard.agentState,
      pendingAuthorizations,
    });
  }),
);

app.post(
  "/api/agent/rebalance",
  asyncRoute(async (req, res) => {
    const payload = req.body || {};
    const yields = await getYieldSnapshot();
    const plan = buildAgentState({
      riskMode: resolveRiskMode(payload.riskMode),
      capitalUsd: parseNumeric(payload.capitalUsd, env.defaultUserCapitalUsd),
      liquidityBufferUsd: parseNumeric(payload.liquidityBufferUsd, env.defaultLiquidityBufferUsd),
      yields,
      opsCount: getOps(payload.address),
      yieldTodayUsd: parseNumeric(payload.yieldTodayUsd, 0.72),
    });
    success(res, plan);
  }),
);

app.post(
  "/api/agent/optimize",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "", riskMode = "balanced" } = req.body || {};

    if (env.selfRequiredForAgent && !isSelfVerified(address)) {
      authError(res, 403, "Self verification required before optimizing liquidity.");
      return;
    }

    const dashboard = await getDashboardData({
      address,
      riskMode: resolveRiskMode(riskMode),
      capitalUsd: env.defaultUserCapitalUsd,
      liquidityBufferUsd: env.defaultLiquidityBufferUsd,
    });

    const network = optimizeLiquidityNetwork(address, dashboard.agentState, {
      balanceUsd: dashboard.summary.balanceUsd,
    });

    if (network.lastDecision?.reallocate) {
      incrementOps(address, 1);
    }

    success(res, {
      network,
      opsCount: getOps(address),
    });
  }),
);

app.get(
  "/api/self/status",
  asyncRoute(async (req, res) => {
    const address = req.query.address;
    if (typeof address !== "string" || !isAddress(address)) {
      res.status(400).json({ ok: false, error: "Invalid address" });
      return;
    }

    const { mode, ready, message } = getSelfServiceStatus();
    const verified = await isSelfVerified(address);

    success(res, {
      ready,
      mode,
      verified,
      requiredForAgent: mode === "agent" && !verified,
      message,
    });
  }),
);

app.post(
  "/api/self/start-registration",
  walletAuthGuard((req) => req.body.address),
  asyncRoute(async (req, res) => {
    const { address } = req.body;
    if (!isAddress(address)) throw new Error("Invalid address");

    const session = await startSelfRegistration(address);
    success(res, session);
  })
);

app.get(
  "/api/self/poll-registration",
  walletAuthGuard((req) => req.query.address),
  asyncRoute(async (req, res) => {
    const { address, sessionToken } = req.query;
    if (!sessionToken) throw new Error("Missing sessionToken");

    const status = await checkRegistrationStatus(sessionToken);
    
    if (status.verified) {
      await markSelfVerified(address);
    }

    success(res, status);
  })
);

app.post(
  "/api/agent/authorize",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "", actionId = "", accepted = true } = req.body || {};

    if (accepted && env.selfRequiredForAgent && !isSelfVerified(address)) {
      authError(res, 403, "Self verification required before activating the agent.");
      return;
    }
    
    if (accepted) {
      // Regra 2 - Não finalizamos aqui diretamente se envolver capital, mas para manter compatibilidade com o frontend atual, 
      // criamos o lock atômico e o finalizamos no mesmo endpoint para simular a atomicidade do backend
      // Em uma V2 de frontend, isso seria separado.
      const lock = createConditionalLock({
        address,
        amount: 1, // Placeholder amount for generic agent actions
        protocol: "agent",
        actionType: "authorize_action"
      });
      
      const settlement = await finalizeSettlement({
        address,
        settlementId: lock.settlementId
      });

      markActionAuthorized(address, actionId);
      incrementOps(address, 1);
      const dashboard = await getDashboardData({
        address,
        riskMode: "balanced",
        capitalUsd: env.defaultUserCapitalUsd,
        liquidityBufferUsd: env.defaultLiquidityBufferUsd,
      });
      const network = optimizeLiquidityNetwork(
        address,
        dashboard.agentState,
        { balanceUsd: dashboard.summary.balanceUsd },
        { proofTxHash: settlement.txHash || null },
      );
      
      success(res, {
        actionId,
        accepted: Boolean(accepted),
        opsCount: getOps(address),
        network,
        settlement: {
          id: settlement.settlementId,
          hash: settlement.hash,
          status: settlement.status,
          txHash: settlement.txHash,
          onChainProof: settlement.onChainProof,
        }
      });
    } else {
      markActionDismissed(address, actionId);
      success(res, {
        actionId,
        accepted: Boolean(accepted),
        opsCount: getOps(address),
      });
    }
  }),
);

// Endpoints explícitos de Liquidação (Regra 2) para integrações futuras do frontend
app.post(
  "/api/settlement/lock",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "", amount, protocol, actionType } = req.body || {};
    const lock = createConditionalLock({ address, amount, protocol, actionType });
    success(res, lock);
  }),
);

app.post(
  "/api/settlement/finalize",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "", settlementId = "", manualTxHash = "" } = req.body || {};
    const result = await finalizeSettlement({ address, settlementId, manualTxHash });
    success(res, result);
  }),
);

app.get(
  "/api/settlement",
  asyncRoute(async (req, res) => {
    const address = typeof req.query.address === "string" ? req.query.address : "";
    const limit = typeof req.query.limit === "string" ? req.query.limit : "20";
    const settlements = listRecentSettlements({ address, limit });
    success(res, settlements);
  }),
);

app.get(
  "/api/settlement/:id",
  asyncRoute(async (req, res) => {
    const status = getSettlementStatus(req.params.id);
    if (!status) {
      authError(res, 404, "Settlement not found");
      return;
    }
    success(res, status);
  }),
);

app.get(
  "/api/profile/settings",
  asyncRoute(async (req, res) => {
    const address = req.query.address;
    if (!address || !isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }
    const profile = getUserProfile(address);
    success(res, profile);
  }),
);

app.post(
  "/api/profile/settings",
  asyncRoute(async (req, res) => {
    const { address, updates } = req.body;
    if (!address || !isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }
    const updated = updateUserProfile(address, updates);
    success(res, updated);
  }),
);

app.get(
  "/api/analytics/overview",
  asyncRoute(async (req, res) => {
    const data = await getAnalyticsOverview(queryParams(req));
    success(res, data);
  }),
);

app.get(
  "/api/savings/goals",
  asyncRoute(async (req, res) => {
    const address = typeof req.query.address === "string" ? req.query.address : "";
    success(res, getSavingsOverview(address));
  }),
);

app.post(
  "/api/savings/goals",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "", ...payload } = req.body || {};
    success(res, createGoal(address, payload));
  }),
);

app.patch(
  "/api/savings/goals/:id",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const address = typeof req.body?.address === "string" ? req.body.address : "";
    const result = patchGoal(address, req.params.id, req.body || {});
    success(res, result);
  }),
);

app.post(
  "/api/chat",
  asyncRoute(async (req, res) => {
    const { address = "", message = "", riskMode = "balanced", capitalUsd, liquidityBufferUsd } = req.body || {};
    const dashboard = await getDashboardData({
      address,
      riskMode: resolveRiskMode(riskMode),
      capitalUsd: parseNumeric(capitalUsd, env.defaultUserCapitalUsd),
      liquidityBufferUsd: parseNumeric(liquidityBufferUsd, env.defaultLiquidityBufferUsd),
    });
    const reply = generateChatReply({ message, dashboard });
    success(res, reply);
  }),
);

app.use((error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  res.status(500).json({
    ok: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/api/karma/reputation",
  asyncRoute(async (req, res) => {
    const address = req.query.address;
    if (typeof address !== "string" || !isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }
    const reputation = getKarmaReputation(address);
    success(res, reputation);
  }),
);

app.listen(env.port, async () => {
  // eslint-disable-next-line no-console
  console.log(`[LiquidAI API] running on http://localhost:${env.port} (${env.celoChain}, chainId ${env.celoChainId})`);
  
  // Phase 2: Initialize Self Agent if enabled
  await initSelfAgent();
});
