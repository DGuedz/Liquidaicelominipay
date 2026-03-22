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
  assertSelfCallbackContext,
  checkRegistrationStatus,
  getSelfServiceStatus,
  initSelfAgent,
  markSelfCallbackProcessed,
  startSelfRegistration,
  verifySelfProofPayload,
} from "./services/self-service.mjs";
import { Sentinel, Vault, Operator } from "./services/agent-squad.mjs";
import {
  createConditionalLock,
  finalizeSettlement,
  getSettlementStatus,
  listRecentSettlements,
} from "./services/settlement-service.mjs";
import { getUserProfile, updateUserProfile } from "./services/profile-service.mjs";
import { getKarmaReputation } from "./services/karma-service.mjs";
import {
  consumeRateLimitBucket,
  getSecurityStateStoreMode,
} from "./store/security-state-store.mjs";

const app = express();
const AUTH_COOKIE_PATH = "/";

function parseCookies(req) {
  const raw = typeof req.headers.cookie === "string" ? req.headers.cookie : "";
  if (!raw) return {};
  return raw.split(";").reduce((acc, item) => {
    const [key, ...rest] = item.trim().split("=");
    if (!key) return acc;
    const rawValue = rest.join("=") || "";
    try {
      acc[key] = decodeURIComponent(rawValue);
    } catch {
      acc[key] = rawValue;
    }
    return acc;
  }, {});
}

function readAuthCookie(req) {
  const cookies = parseCookies(req);
  const value = cookies[env.authCookieName];
  return typeof value === "string" ? value.trim() : "";
}

function setAuthCookie(res, token) {
  const options = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: AUTH_COOKIE_PATH,
    maxAge: env.authTokenTtlMs,
  };
  if (env.authCookieDomain) {
    res.cookie(env.authCookieName, token, {
      ...options,
      domain: env.authCookieDomain,
    });
    return;
  }
  res.cookie(env.authCookieName, token, options);
}

function clearAuthCookie(res) {
  const options = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: AUTH_COOKIE_PATH,
  };
  if (env.authCookieDomain) {
    res.clearCookie(env.authCookieName, {
      ...options,
      domain: env.authCookieDomain,
    });
    return;
  }
  res.clearCookie(env.authCookieName, options);
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (env.frontendOrigins.includes("*")) return true;

  return env.frontendOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;
    if (allowedOrigin.startsWith("*.") && origin.endsWith(allowedOrigin.slice(1))) return true;
    if (allowedOrigin.includes("://*.")) {
      const [, suffix = ""] = allowedOrigin.split("*.");
      return origin.endsWith(suffix);
    }
    return false;
  });
}

app.use(
  cors({
    origin(origin, callback) {
      const allowed = isAllowedOrigin(origin);
      callback(allowed ? null : new Error("CORS origin not allowed."), allowed);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "512kb" }));

function parseNumeric(value, fallback) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function parseSafeActionId(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1_000_000) {
    throw new Error("Invalid actionId.");
  }
  return parsed;
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

function createRouteRateLimiter({
  windowMs,
  maxRequests,
  message,
  keyBuilder,
}) {
  const safeWindowMs = Math.max(1_000, Number(windowMs) || 60_000);
  const safeMaxRequests = Math.max(1, Number(maxRequests) || 30);

  return async (req, res, next) => {
    const identity = typeof keyBuilder === "function"
      ? String(keyBuilder(req) || "")
      : String(req.ip || "unknown");
    const routeKey = `${req.path}:${identity}`;
    try {
      const result = await consumeRateLimitBucket(routeKey, {
        windowMs: safeWindowMs,
        maxRequests: safeMaxRequests,
      });
      if (!result.allowed) {
        authError(res, 429, message || "Too many requests. Try again later.");
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

function readIpAddress(req) {
  const forwarded = typeof req.headers["x-forwarded-for"] === "string"
    ? req.headers["x-forwarded-for"].split(",")[0]
    : "";
  const raw = String(req.ip || forwarded || "unknown").trim().toLowerCase();
  return raw.slice(0, 128);
}

function readRequestAddress(req) {
  if (typeof req.body?.address === "string") return req.body.address.trim().toLowerCase().slice(0, 128);
  if (typeof req.query?.address === "string") return req.query.address.trim().toLowerCase().slice(0, 128);
  return "";
}

const authChallengeRateLimit = createRouteRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  message: "Too many auth challenge attempts. Please retry in a minute.",
  keyBuilder: (req) => `${readIpAddress(req)}:${readRequestAddress(req) || "no-address"}`,
});

const authVerifyRateLimit = createRouteRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  message: "Too many signature verifications. Please retry in a minute.",
  keyBuilder: (req) => `${readIpAddress(req)}:${readRequestAddress(req) || "no-address"}`,
});

const faucetClaimRateLimit = createRouteRateLimiter({
  windowMs: 5 * 60_000,
  maxRequests: 5,
  message: "Too many faucet requests. Please wait before trying again.",
  keyBuilder: (req) => `${readIpAddress(req)}:${readRequestAddress(req) || "no-address"}`,
});

const selfStartRateLimit = createRouteRateLimiter({
  windowMs: 10 * 60_000,
  maxRequests: 10,
  message: "Too many Self registration attempts. Please retry later.",
  keyBuilder: (req) => `${readIpAddress(req)}:${readRequestAddress(req) || "no-address"}`,
});

const selfPollRateLimit = createRouteRateLimiter({
  windowMs: 60_000,
  maxRequests: 60,
  message: "Self polling rate exceeded. Slow down and retry.",
  keyBuilder: (req) => `${readIpAddress(req)}:${readRequestAddress(req) || "no-address"}`,
});

const selfVerifyRateLimit = createRouteRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  message: "Self callback rate exceeded.",
  keyBuilder: (req) => readIpAddress(req),
});

const agentAuthorizeRateLimit = createRouteRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  message: "Too many authorization requests. Please retry shortly.",
  keyBuilder: (req) => `${readIpAddress(req)}:${readRequestAddress(req) || "no-address"}`,
});

function readBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return readAuthCookie(req);
}

function walletAuthGuard(extractAddress) {
  return (req, res, next) => {
    const candidate = extractAddress(req);
    if (typeof candidate !== "string" || !candidate.trim()) {
      authError(res, 400, "A valid wallet address is required.");
      return;
    }
    if (!isAddress(candidate)) {
      authError(res, 400, "Invalid wallet address.");
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

function selfAuthGuard(extractAddress) {
  return async (req, res, next) => {
    if (!env.selfRequiredForAgent) {
      next();
      return;
    }

    const candidate = extractAddress(req);
    if (!isAddress(candidate)) {
      next();
      return;
    }

    const verified = await isSelfVerified(candidate);
    if (!verified) {
      authError(res, 403, "Self verification required before executing agent actions.");
      return;
    }

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
      securityStateStore: getSecurityStateStoreMode(),
      service: "liquidai-backend",
    });
  }),
);

app.post(
  "/api/auth/challenge",
  authChallengeRateLimit,
  asyncRoute(async (req, res) => {
    const { address = "" } = req.body || {};
    const challenge = createAuthChallenge(address);
    success(res, challenge);
  }),
);

app.post(
  "/api/auth/verify",
  authVerifyRateLimit,
  asyncRoute(async (req, res) => {
    const { address = "", nonce = "", signature = "" } = req.body || {};
    const session = await verifyAuthChallenge({
      rawAddress: address,
      rawNonce: nonce,
      rawSignature: signature,
    });
    setAuthCookie(res, session.token);
    success(res, session);
  }),
);

app.post(
  "/api/auth/logout",
  asyncRoute(async (_req, res) => {
    clearAuthCookie(res);
    success(res, { loggedOut: true });
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
  faucetClaimRateLimit,
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "" } = req.body || {};
    if (!isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }
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
  selfAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "", riskMode = "balanced" } = req.body || {};
    if (!isAddress(address)) {
      authError(res, 400, "Invalid address");
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

    const { mode, ready, message, verifier } = getSelfServiceStatus();
    const verified = await isSelfVerified(address);

    success(res, {
      ready,
      mode,
      verified,
      requiredForAgent: mode === "agent" && !verified,
      message,
      verifier,
    });
  }),
);

app.post(
  "/api/self/start-registration",
  selfStartRateLimit,
  walletAuthGuard((req) => req.body.address),
  asyncRoute(async (req, res) => {
    const { address } = req.body;
    if (!isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }

    const session = await startSelfRegistration(address);
    success(res, session);
  })
);

app.get(
  "/api/self/poll-registration",
  selfPollRateLimit,
  walletAuthGuard((req) => req.query.address),
  asyncRoute(async (req, res) => {
    const { address, sessionToken } = req.query;
    if (!isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }
    if (typeof sessionToken !== "string" || !sessionToken.trim()) {
      authError(res, 400, "Missing sessionToken");
      return;
    }

    try {
      const status = await checkRegistrationStatus(sessionToken, String(address));
      if (status.verified) {
        await markSelfVerified(address);
        success(res, status);
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/does not belong to the authenticated wallet/i.test(message)) {
        authError(res, 403, message);
        return;
      }
      const transientProviderIssue =
        /missing session token|self api error:\s*400/i.test(message);
      if (!transientProviderIssue) {
        throw error;
      }
    }

    // Fallback source of truth: verification callback writes to backend store.
    const verified = await isSelfVerified(address);
    success(res, {
      stage: verified ? "completed" : "pending",
      verified,
      source: verified ? "backend_store" : "provider_poll_fallback",
    });
  })
);

app.post(
  "/api/self/verify",
  selfVerifyRateLimit,
  asyncRoute(async (req, res) => {
    const {
      address = "",
      attestationId,
      proof,
      publicSignals,
      pubSignals,
      userContextData,
    } = req.body || {};
    const callbackSecret = typeof req.query?.selfSecret === "string"
      ? req.query.selfSecret
      : (typeof req.headers["x-self-callback-secret"] === "string" ? req.headers["x-self-callback-secret"] : "");
    const callbackContext = await assertSelfCallbackContext({
      rawAddress: address,
      attestationId,
      userContextData,
      callbackSecret,
    });

    const verification = await verifySelfProofPayload({
      attestationId,
      proof,
      publicSignals,
      pubSignals,
      userContextData,
    });

    const isValid = Boolean(verification?.isValidDetails?.isValid);
    if (!isValid) {
      success(res, {
        status: "error",
        result: false,
        verification,
      });
      return;
    }

    await markSelfCallbackProcessed({
      attestationId: callbackContext.attestationId,
      sessionToken: callbackContext.sessionToken,
    });

    const proofRef = `self-proof-${callbackContext.attestationId || "unknown"}-${Date.now()}`;
    await markSelfVerified(callbackContext.address, {
      mode: "agent",
      provider: "Self Protocol",
      proofRef,
    });

    success(res, {
      status: "success",
      result: true,
      verification,
    });
  }),
);

app.post(
  "/api/self/reset",
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  asyncRoute(async (req, res) => {
    const { address = "" } = req.body || {};
    if (!isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }

    resetSelfVerification(address);
    const { mode, ready, message, verifier } = getSelfServiceStatus();

    success(res, {
      ready,
      mode,
      verified: false,
      requiredForAgent: mode === "agent",
      message,
      verifier,
    });
  }),
);

app.post(
  "/api/agent/squad/support",
  walletAuthGuard((req) => req.body?.address),
  asyncRoute(async (req, res) => {
    const { address, issueType, txHash, errorCode } = req.body;
    
    if (!isAddress(address)) {
      return authError(res, 400, "Invalid address");
    }

    let squadResponse;

    if (issueType === "identity_timeout" || issueType === "self_error") {
      squadResponse = await Sentinel.triggerIdentitySupport(address, errorCode);
    } else if (issueType === "yield_query" || issueType === "rpc_latency") {
      squadResponse = await Vault.triggerYieldSupport(address, txHash);
    } else {
      return authError(res, 400, "Unknown issueType for support squad");
    }

    success(res, squadResponse);
  })
);

app.post(
  "/api/agent/authorize",
  agentAuthorizeRateLimit,
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
  selfAuthGuard((req) => (parseBoolean(req.body?.accepted, true) ? (typeof req.body?.address === "string" ? req.body.address : "") : "")),
  asyncRoute(async (req, res) => {
    const { address = "", actionId = "", accepted = true } = req.body || {};
    if (!isAddress(address)) {
      authError(res, 400, "Invalid address");
      return;
    }
    const acceptedFlag = parseBoolean(accepted, true);
    const normalizedActionId = parseSafeActionId(actionId);

    if (acceptedFlag) {
      try {
        const executionReceipt = await Operator.triggerAtomicExecution(address, { actionId: normalizedActionId });
        markActionAuthorized(address, normalizedActionId);
        incrementOps(address, 1);
        
        success(res, {
          actionId: normalizedActionId,
          accepted: acceptedFlag,
          opsCount: getOps(address),
          status: "settled",
          receipt: executionReceipt,
          message: "Action authorized and settled on-chain by operator.",
        });
      } catch (error) {
        authError(res, 403, error.message);
      }
    } else {
      markActionDismissed(address, normalizedActionId);
      success(res, {
        actionId: normalizedActionId,
        accepted: acceptedFlag,
        opsCount: getOps(address),
        status: "dismissed",
        message: "Action dismissed by user.",
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
  walletAuthGuard((req) => (typeof req.query.address === "string" ? req.query.address : "")),
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
  walletAuthGuard((req) => (typeof req.body?.address === "string" ? req.body.address : "")),
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
  const requestedStatus = Number(error?.statusCode ?? error?.status ?? 500);
  const status = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
    ? requestedStatus
    : 500;
  res.status(status).json({
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

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[LiquidAI API] running on port ${env.port} (${env.celoChain}, chainId ${env.celoChainId})`);

  // Self init must not take the API down if it fails at boot.
  initSelfAgent().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[Self Service] boot initialization failed:", message);
  });
});
