import { env } from "../config/env.mjs";
import { getAddress, isAddress } from "viem";
import {
  findSelfRegistrationSessionTokenByAddress,
  getSelfRegistrationSession,
  isSelfAttestationUsed,
  markSelfAttestationUsed,
  patchSelfRegistrationSession,
  putSelfRegistrationSession,
} from "../store/security-state-store.mjs";

let initError = null;
let verifier = null;
let verifierError = null;

function nowMs() {
  return Date.now();
}

function normalizeAddress(value) {
  if (!isAddress(value)) {
    throw new Error("Invalid wallet address for Self flow.");
  }
  return getAddress(value);
}

function readDeepLinkTokenCandidates(deepLink = "") {
  const tokens = [];
  if (!deepLink) return tokens;
  try {
    const url = new URL(deepLink);
    const selfAppEncoded = url.searchParams.get("selfApp");
    if (!selfAppEncoded) return tokens;
    const selfApp = JSON.parse(selfAppEncoded);
    const fromDeepLink = [
      selfApp?.sessionId,
      selfApp?.sessionToken,
      selfApp?.token,
    ]
      .filter((value) => typeof value === "string" && value.length > 0);
    return fromDeepLink;
  } catch {
    return tokens;
  }
}

function nonEmptyString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
}

function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

function encodeSelfAppPayload(payload) {
  try {
    return `https://redirect.self.xyz?selfApp=${encodeURIComponent(JSON.stringify(payload))}`;
  } catch {
    return "";
  }
}

function resolveSelfClientLinks(payload = {}) {
  const safePayload = asRecord(payload) || {};
  const rawDeepLink = nonEmptyString(safePayload.deepLink)
    || nonEmptyString(safePayload.deeplink)
    || nonEmptyString(safePayload.url)
    || nonEmptyString(safePayload.actionUrl)
    || nonEmptyString(safePayload.selfUrl);

  const qrRawString = nonEmptyString(safePayload.qrData);
  const qrRecord = asRecord(safePayload.qrData);
  const qrDeepLink = qrRecord
    ? nonEmptyString(qrRecord.deepLink)
      || nonEmptyString(qrRecord.deeplink)
      || nonEmptyString(qrRecord.url)
      || nonEmptyString(qrRecord.actionUrl)
    : "";
  const qrEncoded = qrRecord ? encodeSelfAppPayload(qrRecord) : "";

  const deepLink = rawDeepLink || qrDeepLink || qrEncoded || qrRawString;
  const qrData = qrRawString || qrDeepLink || qrEncoded || deepLink;

  return {
    deepLink,
    qrData,
  };
}

function resolveSelfNetwork() {
  return env.celoChain === "mainnet" ? "mainnet" : "testnet";
}

function resolveSelfVerifyEndpoint(includeSecret = true) {
  const fallback = "https://liquidaicelominipay.onrender.com/api/self/verify";
  const raw = env.selfVerifyEndpoint || fallback;
  const trimmed = String(raw).trim();
  const matched = trimmed.match(/https?:\/\/[^\s]+/i);
  const resolved = matched?.[0] || trimmed || fallback;

  if (!includeSecret || !env.selfCallbackSecret) return resolved;

  try {
    const url = new URL(resolved);
    if (!url.searchParams.has("selfSecret")) {
      url.searchParams.set("selfSecret", env.selfCallbackSecret);
    }
    return url.toString();
  } catch {
    return resolved;
  }
}

function extractSessionTokenFromResponse(payload = {}) {
  const direct =
    payload?.sessionToken ||
    payload?.token ||
    payload?.registrationToken ||
    payload?.sessionId ||
    "";
  if (typeof direct === "string" && direct.length > 0) {
    return direct;
  }

  const { deepLink } = resolveSelfClientLinks(payload);
  if (deepLink) {
    const candidates = readDeepLinkTokenCandidates(deepLink);
    if (candidates.length) {
      return candidates[0];
    }
  }
  return "";
}

function extractCallbackContextCandidates(userContextData) {
  const tokens = new Set();
  const addresses = new Set();

  const maybeAddAddress = (value) => {
    if (typeof value !== "string") return;
    if (!isAddress(value)) return;
    addresses.add(getAddress(value));
  };
  const maybeAddToken = (value) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 8) return;
    tokens.add(trimmed);
  };

  const visit = (node, depth = 0) => {
    if (depth > 5 || node === null || node === undefined) return;
    if (typeof node === "string") {
      maybeAddAddress(node);
      maybeAddToken(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }
    if (typeof node !== "object") return;

    for (const [key, value] of Object.entries(node)) {
      const normalizedKey = key.toLowerCase();
      if (
        normalizedKey.includes("token") ||
        normalizedKey.includes("session") ||
        normalizedKey.includes("attestation")
      ) {
        maybeAddToken(value);
      }
      if (
        normalizedKey.includes("address") ||
        normalizedKey.includes("wallet") ||
        normalizedKey.includes("human")
      ) {
        maybeAddAddress(value);
      }
      visit(value, depth + 1);
    }
  };

  if (typeof userContextData === "string") {
    const trimmed = userContextData.trim();
    maybeAddAddress(trimmed);
    maybeAddToken(trimmed);
    try {
      const parsed = JSON.parse(trimmed);
      visit(parsed, 0);
    } catch {}
  } else {
    visit(userContextData, 0);
  }

  return {
    tokens: Array.from(tokens),
    addresses: Array.from(addresses),
  };
}

async function findSessionByAddress(address) {
  const normalized = normalizeAddress(address);
  const sessionToken = await findSelfRegistrationSessionTokenByAddress(normalized);
  if (!sessionToken) return null;
  const session = await getSelfRegistrationSession(sessionToken);
  if (!session) return null;
  return { sessionToken, session };
}

export async function assertSelfCallbackContext({
  rawAddress,
  attestationId,
  userContextData,
  callbackSecret = "",
}) {
  if (env.selfMode !== "agent") {
    return {
      address: normalizeAddress(rawAddress),
      attestationId: String(attestationId || "").trim(),
      sessionToken: "",
    };
  }

  if (!env.selfCallbackSecret) {
    throw new Error("Self callback secret is not configured (SELF_CALLBACK_SECRET).");
  }

  if (env.selfCallbackSecret && callbackSecret !== env.selfCallbackSecret) {
    throw new Error("Unauthorized Self verification callback.");
  }

  const normalizedAddress = normalizeAddress(rawAddress);
  const normalizedAttestationId = String(attestationId || "").trim();
  if (normalizedAttestationId.length < 6) {
    throw new Error("Invalid attestationId in Self callback.");
  }
  const replayDetected = await isSelfAttestationUsed(normalizedAttestationId);
  if (replayDetected) {
    throw new Error("Replay detected: attestation already processed.");
  }

  const context = extractCallbackContextCandidates(userContextData);
  if (context.addresses.length && !context.addresses.includes(normalizedAddress)) {
    throw new Error("Self callback address mismatch with wallet session.");
  }

  let matchedSessionToken = "";
  if (context.tokens.length) {
    for (const token of context.tokens) {
      const session = await getSelfRegistrationSession(token);
      if (!session) continue;
      if (session.walletAddress !== normalizedAddress) continue;
      if (Number(session.expiresAt || 0) <= nowMs()) continue;
      matchedSessionToken = token;
      break;
    }
    if (!matchedSessionToken) {
      throw new Error("Self callback token is not bound to wallet session.");
    }
  } else {
    const fallbackSession = await findSessionByAddress(normalizedAddress);
    if (!fallbackSession) {
      throw new Error("No active Self registration session found for callback wallet.");
    }
    matchedSessionToken = fallbackSession.sessionToken;
  }

  return {
    address: normalizedAddress,
    attestationId: normalizedAttestationId,
    sessionToken: matchedSessionToken,
  };
}

export async function markSelfCallbackProcessed({ attestationId, sessionToken }) {
  const normalizedAttestationId = String(attestationId || "").trim();
  if (normalizedAttestationId) {
    const replayTtlMs = Math.max(60_000, env.selfCallbackReplayWindowMs);
    await markSelfAttestationUsed(normalizedAttestationId, replayTtlMs);
  }

  if (!sessionToken) return;
  const current = await getSelfRegistrationSession(sessionToken);
  if (!current) return;
  const nextStatus = current.status === "pending" ? "callback_verified" : current.status;
  await patchSelfRegistrationSession(sessionToken, {
    callbackValidated: true,
    callbackValidatedAt: nowMs(),
    status: nextStatus,
  });
}

async function ensureSelfVerifier() {
  if (verifier) return verifier;
  if (verifierError) return null;

  try {
    const core = await import("@selfxyz/core");
    const { SelfBackendVerifier, DefaultConfigStore, AllIds } = core;

    verifier = new SelfBackendVerifier(
      env.selfScope,
      resolveSelfVerifyEndpoint(),
      env.selfMockPassport,
      AllIds,
      new DefaultConfigStore({
        minimumAge: env.selfMinimumAge,
        excludedCountries: env.selfExcludedCountries,
        ofac: env.selfOfac,
      }),
      env.selfUserIdType === "uuid" ? "uuid" : "hex",
    );

    verifierError = null;
    return verifier;
  } catch (error) {
    verifierError = error instanceof Error ? error.message : "Failed to initialize @selfxyz/core verifier.";
    return null;
  }
}

export async function initSelfAgent() {
  initError = null;

  if (env.selfMode !== "agent") return;

  try {
    await ensureSelfVerifier();
    console.log(`[Self Service] Agent service ready in '${env.selfMode}' mode on ${resolveSelfNetwork()}.`);
  } catch (error) {
    initError = error instanceof Error ? error.message : "Unknown Self client initialization error.";
    console.warn("[Self Service] failed to initialize client:", initError);
  }
}

export function getSelfServiceStatus() {
  if (env.selfMode === "mock") {
    return {
      mode: "mock",
      ready: true,
      message: "Mock verification active for demo flow.",
      verifier: {
        ready: false,
        endpoint: resolveSelfVerifyEndpoint(false),
        message: "SelfBackendVerifier disabled in mock mode.",
      },
    };
  }

  if (env.selfMode === "agent") {
    const secretReady = Boolean(env.selfCallbackSecret);
    const verifierReady = Boolean(verifier) && !verifierError;
    return {
      mode: "agent",
      ready: !initError && verifierReady && secretReady,
      message:
        initError ||
        verifierError ||
        (secretReady
          ? "Agent client online. Ready for start-registration → poll-registration → self/status flow."
          : "SELF_CALLBACK_SECRET missing. Configure callback secret before enabling agent mode."),
      verifier: {
        ready: verifierReady,
        endpoint: resolveSelfVerifyEndpoint(false),
        message: verifierError || "SelfBackendVerifier online.",
      },
    };
  }

  return {
    mode: env.selfMode,
    ready: false,
    message: "Self verification disabled.",
    verifier: {
      ready: false,
      endpoint: resolveSelfVerifyEndpoint(false),
      message: "SelfBackendVerifier disabled.",
    },
  };
}

/**
 * Initiates a new registration session with Self
 */
export async function startSelfRegistration(humanAddress) {
    if (env.selfMode === "mock") {
        return {
            sessionToken: "mock_session_token",
            deepLink: "https://self.xyz/mock-deep-link",
            qrData: "mock_qr_data",
            mode: "mock"
        };
    }

    try {
        const normalizedAddress = normalizeAddress(humanAddress);
        const response = await fetch("https://app.ai.self.xyz/api/agent/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mode: env.selfAgentRegisterMode,
                minimumAge: env.selfMinimumAge, 
                ofac: env.selfOfac,
                network: resolveSelfNetwork(),
                humanAddress: normalizedAddress,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Self API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        const sessionToken = extractSessionTokenFromResponse(data);
        if (!sessionToken) {
          throw new Error("Self API response missing session token.");
        }

        const { privateKeyHex: _privateKeyHex, ...safeData } = data || {};
        const links = resolveSelfClientLinks(safeData);

        // Guarda apenas campos não sensíveis para o poll.
        await putSelfRegistrationSession(
          sessionToken,
          {
            ...safeData,
            deepLink: links.deepLink,
            qrData: links.qrData,
            walletAddress: normalizedAddress,
            startedAt: nowMs(),
            expiresAt: nowMs() + env.selfSessionTtlMs,
            status: "pending",
            callbackValidated: false,
          },
          env.selfSessionTtlMs,
        );
        
        return { 
            sessionToken,
            deepLink: links.deepLink,
            qrData: links.qrData,
            mode: "agent" 
        };
    } catch (error) {
        console.error("[Self Service] Registration start failed:", error);
        throw error;
    }
}

/**
 * Polls for registration completion
 */
export async function checkRegistrationStatus(sessionToken) {
    if (env.selfMode === "mock") {
        return { stage: "completed", agentId: 999, verified: true };
    }

    const session = await getSelfRegistrationSession(sessionToken);
    if (!session) {
        throw new Error("Session not found or expired");
    }

    try {
        const statusUrl = new URL("https://app.ai.self.xyz/api/agent/register/status");
        // Keep query param for backwards compatibility, but always send bearer token (required by current API).
        statusUrl.searchParams.set("token", sessionToken);
        const response = await fetch(statusUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            throw new Error(`Self API Error: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`);
        }

        const data = await response.json();
        
        const isVerified = data.status === "verified" || data.stage === "completed" || data.stage === "verified" || data.stage === "agent-ready";
        const isFailed = data.status === "failed" || data.stage === "failed" || data.status === "expired" || data.stage === "expired";

        if (isVerified) {
            // Em produção, o privateKey gerado deve ser injetado na session/db do usuário
            console.log(`[Self Service] Agent ${data.agentId || 'verified'} verified successfully!`);
            await patchSelfRegistrationSession(sessionToken, {
              status: "verified",
              verifiedAt: nowMs(),
            });
            return { 
                stage: "completed",
                agentId: data.agentId,
                verified: true
            };
        } else if (isFailed) {
            await patchSelfRegistrationSession(sessionToken, {
              status: "failed",
              failedAt: nowMs(),
            });
            throw new Error(`Self registration failed or expired: ${data.reason || data.stage}`);
        }
        
        // Status pending
        return { stage: "pending", verified: false };
    } catch (error) {
        console.error("[Self Service] Status check failed:", error);
        throw error;
    }
}

export async function verifySelfProofPayload(payload = {}) {
  const current = await ensureSelfVerifier();
  if (!current) {
    throw new Error(verifierError || "Self backend verifier is not available.");
  }

  const {
    attestationId,
    proof,
    publicSignals,
    pubSignals,
    userContextData,
  } = payload;

  const signals = Array.isArray(publicSignals) ? publicSignals : pubSignals;
  if (!proof || !Array.isArray(signals) || !attestationId || !userContextData) {
    throw new Error("Proof, publicSignals, attestationId and userContextData are required.");
  }

  const result = await current.verify(attestationId, proof, signals, userContextData);
  return result;
}

// Kept for backward compatibility if needed, but primary flow is now start -> poll
export async function verifySelfUser(address, proof) {
  // ... legacy or alternative verification logic if passing raw proof manually
  return { verified: false, message: "Use startSelfRegistration flow" }; 
}
