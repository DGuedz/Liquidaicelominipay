import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.mjs";

const SUPPORTED_MODES = new Set(["memory", "file"]);
const DEFAULT_STATE = Object.freeze({
  version: 1,
  selfSessions: {},
  selfAddressIndex: {},
  selfAttestations: {},
  rateLimits: {},
});

const memoryState = {
  selfSessions: new Map(),
  selfAddressIndex: new Map(),
  selfAttestations: new Map(),
  rateLimits: new Map(),
};

const configuredMode = String(env.securityStateStore || "file").trim().toLowerCase();
const securityStateStoreMode = SUPPORTED_MODES.has(configuredMode) ? configuredMode : "file";
const securityStateFile = path.resolve(process.cwd(), env.securityStateFilePath || ".data/security-state.json");
const securityStateLockFile = `${securityStateFile}.lock`;

function nowMs() {
  return Date.now();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanKey(raw, maxLen = 256) {
  return String(raw || "").trim().slice(0, maxLen);
}

function ttlToExpiresAt(ttlMs, fallbackMs = 5 * 60_000) {
  const safeTtl = Math.max(1_000, Number(ttlMs) || fallbackMs);
  return nowMs() + safeTtl;
}

function normalizeStoreAddress(address) {
  return String(address || "").trim().toLowerCase();
}

function cloneDefaultFileState() {
  return {
    version: DEFAULT_STATE.version,
    selfSessions: {},
    selfAddressIndex: {},
    selfAttestations: {},
    rateLimits: {},
  };
}

function pruneMemoryState() {
  const now = nowMs();

  for (const [token, session] of memoryState.selfSessions.entries()) {
    if (!session || Number(session.expiresAt || 0) <= now) {
      memoryState.selfSessions.delete(token);
    }
  }

  for (const [address, token] of memoryState.selfAddressIndex.entries()) {
    const session = memoryState.selfSessions.get(token);
    if (!session || Number(session.expiresAt || 0) <= now) {
      memoryState.selfAddressIndex.delete(address);
    }
  }

  for (const [attestationId, record] of memoryState.selfAttestations.entries()) {
    if (!record || Number(record.expiresAt || 0) <= now) {
      memoryState.selfAttestations.delete(attestationId);
    }
  }

  for (const [bucketKey, bucket] of memoryState.rateLimits.entries()) {
    if (!bucket || Number(bucket.resetAt || 0) <= now) {
      memoryState.rateLimits.delete(bucketKey);
    }
  }
}

function pruneFileState(state) {
  const now = nowMs();
  const safeState = state && typeof state === "object" ? state : cloneDefaultFileState();
  safeState.selfSessions = safeState.selfSessions && typeof safeState.selfSessions === "object"
    ? safeState.selfSessions
    : {};
  safeState.selfAddressIndex = safeState.selfAddressIndex && typeof safeState.selfAddressIndex === "object"
    ? safeState.selfAddressIndex
    : {};
  safeState.selfAttestations = safeState.selfAttestations && typeof safeState.selfAttestations === "object"
    ? safeState.selfAttestations
    : {};
  safeState.rateLimits = safeState.rateLimits && typeof safeState.rateLimits === "object"
    ? safeState.rateLimits
    : {};

  for (const [token, session] of Object.entries(safeState.selfSessions)) {
    if (!session || Number(session.expiresAt || 0) <= now) {
      delete safeState.selfSessions[token];
    }
  }

  for (const [address, token] of Object.entries(safeState.selfAddressIndex)) {
    const session = safeState.selfSessions[token];
    if (!session || Number(session.expiresAt || 0) <= now) {
      delete safeState.selfAddressIndex[address];
    }
  }

  for (const [attestationId, record] of Object.entries(safeState.selfAttestations)) {
    if (!record || Number(record.expiresAt || 0) <= now) {
      delete safeState.selfAttestations[attestationId];
    }
  }

  for (const [bucketKey, bucket] of Object.entries(safeState.rateLimits)) {
    if (!bucket || Number(bucket.resetAt || 0) <= now) {
      delete safeState.rateLimits[bucketKey];
    }
  }

  return safeState;
}

async function ensureFileStoreReady() {
  await fs.mkdir(path.dirname(securityStateFile), { recursive: true });
}

async function readFileState() {
  try {
    const raw = await fs.readFile(securityStateFile, "utf8");
    const parsed = JSON.parse(raw);
    return pruneFileState(parsed);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return cloneDefaultFileState();
    }
    throw error;
  }
}

async function writeFileState(state) {
  const safeState = pruneFileState(state);
  const payload = JSON.stringify(safeState);
  const tmpFile = `${securityStateFile}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
  await fs.writeFile(tmpFile, payload, "utf8");
  await fs.rename(tmpFile, securityStateFile);
}

async function acquireFileLock() {
  const timeoutMs = Math.max(250, Number(env.securityStateLockTimeoutMs) || 2_000);
  const staleLockMs = Math.max(1_000, Number(env.securityStateLockStaleMs) || 20_000);
  const startedAt = nowMs();

  while (true) {
    try {
      const handle = await fs.open(securityStateLockFile, "wx");
      return async () => {
        await handle.close().catch(() => {});
        await fs.unlink(securityStateLockFile).catch(() => {});
      };
    } catch (error) {
      if (!error || typeof error !== "object" || error.code !== "EEXIST") {
        throw error;
      }

      const elapsed = nowMs() - startedAt;
      if (elapsed > timeoutMs) {
        try {
          const stat = await fs.stat(securityStateLockFile);
          const stale = nowMs() - Number(stat.mtimeMs || 0) > staleLockMs;
          if (stale) {
            await fs.unlink(securityStateLockFile).catch(() => {});
            continue;
          }
        } catch {}
        throw new Error("Timed out waiting for security state file lock.");
      }

      await wait(20);
    }
  }
}

async function withFileState(mutator) {
  await ensureFileStoreReady();
  const release = await acquireFileLock();
  try {
    const state = await readFileState();
    const result = await mutator(state);
    await writeFileState(state);
    return result;
  } finally {
    await release().catch(() => {});
  }
}

export function getSecurityStateStoreMode() {
  return securityStateStoreMode;
}

export async function putSelfRegistrationSession(sessionToken, sessionPayload, ttlMs) {
  const token = cleanKey(sessionToken, 512);
  if (!token) {
    throw new Error("Self session token is required.");
  }

  const safePayload = sessionPayload && typeof sessionPayload === "object" ? { ...sessionPayload } : {};
  const walletAddress = normalizeStoreAddress(safePayload.walletAddress);
  const expiresAt = Number(safePayload.expiresAt) > nowMs()
    ? Number(safePayload.expiresAt)
    : ttlToExpiresAt(ttlMs, env.selfSessionTtlMs);
  const record = {
    ...safePayload,
    walletAddress,
    expiresAt,
  };

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    memoryState.selfSessions.set(token, record);
    if (walletAddress) {
      memoryState.selfAddressIndex.set(walletAddress, token);
    }
    return record;
  }

  return withFileState(async (state) => {
    state.selfSessions[token] = record;
    if (walletAddress) {
      state.selfAddressIndex[walletAddress] = token;
    }
    return record;
  });
}

export async function getSelfRegistrationSession(sessionToken) {
  const token = cleanKey(sessionToken, 512);
  if (!token) return null;

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    return memoryState.selfSessions.get(token) || null;
  }

  return withFileState(async (state) => state.selfSessions[token] || null);
}

export async function findSelfRegistrationSessionTokenByAddress(address) {
  const normalizedAddress = normalizeStoreAddress(address);
  if (!normalizedAddress) return "";

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    const token = memoryState.selfAddressIndex.get(normalizedAddress);
    if (!token) return "";
    const session = memoryState.selfSessions.get(token);
    if (!session || Number(session.expiresAt || 0) <= nowMs()) {
      memoryState.selfAddressIndex.delete(normalizedAddress);
      return "";
    }
    return token;
  }

  return withFileState(async (state) => {
    const token = String(state.selfAddressIndex[normalizedAddress] || "");
    if (!token) return "";
    const session = state.selfSessions[token];
    if (!session || Number(session.expiresAt || 0) <= nowMs()) {
      delete state.selfAddressIndex[normalizedAddress];
      return "";
    }
    return token;
  });
}

export async function patchSelfRegistrationSession(sessionToken, patch) {
  const token = cleanKey(sessionToken, 512);
  if (!token) return null;
  const patchPayload = patch && typeof patch === "object" ? { ...patch } : {};

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    const current = memoryState.selfSessions.get(token);
    if (!current) return null;
    const next = {
      ...current,
      ...patchPayload,
    };
    memoryState.selfSessions.set(token, next);
    const normalizedAddress = normalizeStoreAddress(next.walletAddress);
    if (normalizedAddress) {
      memoryState.selfAddressIndex.set(normalizedAddress, token);
    }
    return next;
  }

  return withFileState(async (state) => {
    const current = state.selfSessions[token];
    if (!current) return null;
    const next = {
      ...current,
      ...patchPayload,
    };
    state.selfSessions[token] = next;
    const normalizedAddress = normalizeStoreAddress(next.walletAddress);
    if (normalizedAddress) {
      state.selfAddressIndex[normalizedAddress] = token;
    }
    return next;
  });
}

export async function isSelfAttestationUsed(attestationId) {
  const key = cleanKey(attestationId, 512);
  if (!key) return false;

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    return memoryState.selfAttestations.has(key);
  }

  return withFileState(async (state) => Boolean(state.selfAttestations[key]));
}

export async function markSelfAttestationUsed(attestationId, ttlMs) {
  const key = cleanKey(attestationId, 512);
  if (!key) return false;
  const record = {
    usedAt: nowMs(),
    expiresAt: ttlToExpiresAt(ttlMs, env.selfCallbackReplayWindowMs),
  };

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    memoryState.selfAttestations.set(key, record);
    return true;
  }

  return withFileState(async (state) => {
    state.selfAttestations[key] = record;
    return true;
  });
}

export async function consumeRateLimitBucket(bucketKey, { windowMs, maxRequests }) {
  const key = cleanKey(bucketKey, 768);
  if (!key) {
    return {
      allowed: true,
      count: 0,
      remaining: Math.max(0, Number(maxRequests) || 0),
      resetAt: nowMs() + Math.max(1_000, Number(windowMs) || 60_000),
    };
  }

  const safeWindowMs = Math.max(1_000, Number(windowMs) || 60_000);
  const safeMaxRequests = Math.max(1, Number(maxRequests) || 30);
  const now = nowMs();

  const evaluate = (currentBucket) => {
    if (!currentBucket || Number(currentBucket.resetAt || 0) <= now) {
      return {
        bucket: { count: 1, resetAt: now + safeWindowMs },
        count: 1,
        resetAt: now + safeWindowMs,
      };
    }
    return {
      bucket: {
        count: Number(currentBucket.count || 0) + 1,
        resetAt: Number(currentBucket.resetAt || (now + safeWindowMs)),
      },
      count: Number(currentBucket.count || 0) + 1,
      resetAt: Number(currentBucket.resetAt || (now + safeWindowMs)),
    };
  };

  let count = 0;
  let resetAt = now + safeWindowMs;

  if (securityStateStoreMode === "memory") {
    pruneMemoryState();
    const current = memoryState.rateLimits.get(key);
    const next = evaluate(current);
    memoryState.rateLimits.set(key, next.bucket);
    count = next.count;
    resetAt = next.resetAt;
  } else {
    const next = await withFileState(async (state) => {
      const current = state.rateLimits[key];
      const evaluated = evaluate(current);
      state.rateLimits[key] = evaluated.bucket;
      return evaluated;
    });
    count = next.count;
    resetAt = next.resetAt;
  }

  const remaining = Math.max(0, safeMaxRequests - count);
  return {
    allowed: count <= safeMaxRequests,
    count,
    remaining,
    resetAt,
  };
}
