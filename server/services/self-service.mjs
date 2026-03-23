import { env } from "../config/env.mjs";
import { getAddress, isAddress } from "viem";
import { timingSafeEqual } from "node:crypto";
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
const RETRYABLE_SELF_HTTP_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function nowMs() {
  return Date.now();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

function normalizeBaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const toUrl = (candidate) => {
    const cleaned = String(candidate || "")
      .trim()
      .replace(/^[-*]\s*/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (!cleaned) return "";
    const matched = cleaned.match(/https?:\/\/[^\s,"'\\]+/i);
    const normalized = matched ? matched[0] : cleaned;
    try {
      return new URL(normalized).toString().replace(/\/+$/, "");
    } catch {
      return "";
    }
  };

  const direct = toUrl(raw);
  if (direct) return direct;

  const parts = raw
    .split(/\r?\n|,/g)
    .map((part) => toUrl(part))
    .filter(Boolean);
  if (parts.length) return parts[0];

  const match = raw.match(/https?:\/\/[^\s,"'\\]+/i);
  if (!match) return "";
  return toUrl(match[0]);
}

function resolveSelfVerifyEndpoint() {
  const explicit = normalizeBaseUrl(env.selfVerifyEndpoint);
  if (explicit) {
    if (/\/api\/self\/verify\/?$/i.test(explicit)) return explicit;
    return `${explicit}/api/self/verify`;
  }

  const publicBase = normalizeBaseUrl(env.publicApiBaseUrl);
  if (publicBase) {
    return `${publicBase}/api/self/verify`;
  }

  if (env.nodeEnv !== "production") {
    return `http://localhost:${env.port}/api/self/verify`;
  }

  return "https://liquidaicelominipay.onrender.com/api/self/verify";
}

function safeEqualSecrets(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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
        normalizedKey.includes("session")
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
    if (!isAddress(rawAddress)) {
      throw createHttpError(400, "Invalid wallet address in Self callback.");
    }
    return {
      address: normalizeAddress(rawAddress),
      attestationId: String(attestationId || "").trim(),
      sessionToken: "",
    };
  }

  if (env.selfEnforceCallbackSecret) {
    if (!env.selfCallbackSecret) {
      throw createHttpError(500, "SELF_ENFORCE_CALLBACK_SECRET=true but SELF_CALLBACK_SECRET is missing.");
    }
    if (!safeEqualSecrets(callbackSecret, env.selfCallbackSecret)) {
      throw createHttpError(401, "Unauthorized Self verification callback.");
    }
  }

  const callbackAddressCandidate = typeof rawAddress === "string" && isAddress(rawAddress)
    ? normalizeAddress(rawAddress)
    : "";
  const normalizedAttestationId = String(attestationId || "").trim();
  if (normalizedAttestationId.length < 6) {
    throw createHttpError(400, "Invalid attestationId in Self callback.");
  }
  const replayDetected = await isSelfAttestationUsed(normalizedAttestationId);
  if (replayDetected) {
    throw createHttpError(409, "Replay detected: attestation already processed.");
  }

  const context = extractCallbackContextCandidates(userContextData);
  let normalizedAddress = callbackAddressCandidate;
  if (!normalizedAddress && context.addresses.length === 1) {
    normalizedAddress = context.addresses[0];
  }
  if (normalizedAddress && context.addresses.length && !context.addresses.includes(normalizedAddress)) {
    throw createHttpError(403, "Self callback address mismatch with wallet session.");
  }

  let matchedSessionToken = "";
  let matchedSessionAddress = "";
  if (context.tokens.length) {
    for (const token of context.tokens) {
      const session = await getSelfRegistrationSession(token);
      if (!session) continue;
      if (Number(session.expiresAt || 0) <= nowMs()) continue;
      const sessionAddress = String(session.walletAddress || "").trim();
      if (!isAddress(sessionAddress)) continue;
      const normalizedSessionAddress = getAddress(sessionAddress);
      if (normalizedAddress && normalizedSessionAddress !== normalizedAddress) continue;
      matchedSessionToken = token;
      matchedSessionAddress = normalizedSessionAddress;
      if (!normalizedAddress) {
        normalizedAddress = normalizedSessionAddress;
      }
      break;
    }
  }

  if (!matchedSessionToken && normalizedAddress) {
    const fallbackSession = await findSessionByAddress(normalizedAddress);
    if (!fallbackSession) {
      throw createHttpError(404, "No active Self registration session found for callback wallet.");
    }
    matchedSessionToken = fallbackSession.sessionToken;
    matchedSessionAddress = normalizeAddress(fallbackSession.session.walletAddress);
  }

  if (!matchedSessionToken) {
    throw createHttpError(404, "Self callback token is not bound to wallet session.");
  }

  if (!normalizedAddress && matchedSessionAddress) {
    normalizedAddress = matchedSessionAddress;
  }
  if (!normalizedAddress) {
    throw createHttpError(400, "Self callback missing wallet address context.");
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
        endpoint: resolveSelfVerifyEndpoint(),
        message: "SelfBackendVerifier disabled in mock mode.",
      },
    };
  }

  if (env.selfMode === "agent") {
    const secretReady = env.selfEnforceCallbackSecret ? Boolean(env.selfCallbackSecret) : true;
    const verifierReady = Boolean(verifier) && !verifierError;
    return {
      mode: "agent",
      ready: !initError && verifierReady && secretReady,
      message:
        initError ||
        verifierError ||
        (secretReady
          ? "Agent client online. Ready for start-registration → poll-registration → self/status flow."
          : "SELF_ENFORCE_CALLBACK_SECRET=true but SELF_CALLBACK_SECRET is missing."),
      verifier: {
        ready: verifierReady,
        endpoint: resolveSelfVerifyEndpoint(),
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
      endpoint: resolveSelfVerifyEndpoint(),
      message: "SelfBackendVerifier disabled.",
    },
  };
}

/**
 * Initiates a new registration session with Self
 */
export async function startSelfRegistration(humanAddress) {
    if (env.selfMode === "mock") {
        const normalizedAddress = normalizeAddress(humanAddress);
        const mockSessionToken = `mock_${normalizedAddress.toLowerCase()}_${nowMs()}`;
        const mockDeepLink = "https://self.xyz/mock-deep-link";
        await putSelfRegistrationSession(
          mockSessionToken,
          {
            walletAddress: normalizedAddress,
            deepLink: mockDeepLink,
            qrData: mockDeepLink,
            startedAt: nowMs(),
            expiresAt: nowMs() + env.selfSessionTtlMs,
            status: "pending",
            callbackValidated: false,
          },
          env.selfSessionTtlMs,
        );
        return {
            sessionToken: mockSessionToken,
            deepLink: mockDeepLink,
            qrData: mockDeepLink,
            mode: "mock"
        };
    }

    try {
        const serviceStatus = getSelfServiceStatus();
        if (!serviceStatus.ready) {
          throw createHttpError(
            503,
            serviceStatus.message || "Self service not ready. Check backend Self configuration.",
          );
        }

        const normalizedAddress = normalizeAddress(humanAddress);
        let data = null;
        let lastStatus = 0;
        let lastErrorBody = "";
        for (let attempt = 1; attempt <= 3; attempt += 1) {
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
                }),
            });

            if (response.ok) {
                data = await response.json();
                break;
            }

            lastStatus = response.status;
            lastErrorBody = await response.text().catch(() => "");
            const canRetry = RETRYABLE_SELF_HTTP_STATUS.has(response.status) && attempt < 3;
            if (canRetry) {
                await sleep(800 * attempt);
                continue;
            }

            if (response.status === 429) {
                throw createHttpError(
                    503,
                    "Self service temporarily rate-limited. Please retry in a few seconds.",
                );
            }

            const compactErrorBody = lastErrorBody.trim().slice(0, 220);
            throw createHttpError(
                response.status >= 500 ? 502 : 400,
                compactErrorBody
                    ? `Self API Error: ${response.status} - ${compactErrorBody}`
                    : `Self API Error: ${response.status}`,
            );
        }

        if (!data) {
            if (lastStatus === 429) {
                throw createHttpError(
                    503,
                    "Self service temporarily rate-limited. Please retry in a few seconds.",
                );
            }
            throw createHttpError(503, "Self service unavailable. Retry in a few seconds.");
        }
        
        const sessionToken = extractSessionTokenFromResponse(data);
        if (!sessionToken) {
          throw createHttpError(502, "Self API response missing session token.");
        }

        const { privateKeyHex: _privateKeyHex, ...safeData } = data || {};
        const links = resolveSelfClientLinks(safeData);
        if (!links.deepLink && !links.qrData) {
          throw createHttpError(502, "Self API response missing deep link and QR payload.");
        }

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
export async function checkRegistrationStatus(sessionToken, expectedAddress = "") {
    const session = await getSelfRegistrationSession(sessionToken);
    if (!session) {
        throw createHttpError(410, "Self registration session not found or expired.");
    }
    if (expectedAddress && isAddress(expectedAddress)) {
      const normalizedExpected = getAddress(expectedAddress).toLowerCase();
      const sessionAddress = String(session.walletAddress || "").trim().toLowerCase();
        if (!sessionAddress || sessionAddress !== normalizedExpected) {
          throw createHttpError(403, "Self session token does not belong to the authenticated wallet.");
        }
    }
    if (env.selfMode === "mock") {
        await patchSelfRegistrationSession(sessionToken, {
          status: "verified",
          verifiedAt: nowMs(),
        });
        return { stage: "completed", agentId: 999, verified: true };
    }

    try {
        const statusUrl = new URL("https://app.ai.self.xyz/api/agent/register/status");
        // Keep query param for backwards compatibility, but always send bearer token (required by current API).
        statusUrl.searchParams.set("token", sessionToken);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.externalTimeoutMs);
        let response;
        try {
          response = await fetch(statusUrl, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${sessionToken}`,
              },
              signal: controller.signal,
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            throw createHttpError(504, "Self status provider timeout. Retry in a few seconds.");
          }
          throw createHttpError(503, "Self status provider unavailable. Retry in a few seconds.");
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            const compactErrorBody = errorBody.trim().slice(0, 220);
            if (response.status === 401 || response.status === 403) {
              throw createHttpError(403, "Self session token rejected by provider.");
            }
            if (response.status === 404 || response.status === 410) {
              throw createHttpError(410, "Self registration session expired at provider.");
            }
            if (response.status === 429) {
              throw createHttpError(429, "Self provider rate limit exceeded. Retry shortly.");
            }
            if (response.status >= 500) {
              throw createHttpError(503, "Self provider temporary failure. Retry shortly.");
            }
            throw createHttpError(
              400,
              compactErrorBody
                ? `Self API Error: ${response.status} - ${compactErrorBody}`
                : `Self API Error: ${response.status}`,
            );
        }

        const data = await response.json().catch(() => null);
        if (!data || typeof data !== "object") {
          throw createHttpError(502, "Invalid payload from Self status provider.");
        }
        
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
            throw createHttpError(410, `Self registration failed or expired: ${data.reason || data.stage}`);
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
