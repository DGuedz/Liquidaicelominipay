import crypto from "node:crypto";
import { getAddress, isAddress, recoverMessageAddress } from "viem";
import { env } from "../config/env.mjs";

const challenges = new Map();

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function signValue(value) {
  return crypto.createHmac("sha256", env.authSecret).update(value).digest("base64url");
}

function toAddress(value) {
  if (!isAddress(value)) {
    throw new Error("Invalid wallet address.");
  }
  return getAddress(value);
}

function readChallengeNonce(nonce) {
  if (typeof nonce !== "string" || nonce.trim().length < 8) {
    throw new Error("Invalid authentication nonce.");
  }
  return nonce.trim();
}

function nowMs() {
  return Date.now();
}

function pruneExpiredChallenges() {
  const now = nowMs();
  for (const [key, challenge] of challenges.entries()) {
    if (challenge.expiresAtMs <= now || challenge.used) {
      challenges.delete(key);
    }
  }
}

export function createAuthChallenge(rawAddress) {
  pruneExpiredChallenges();
  const address = toAddress(rawAddress);
  const nonce = crypto.randomBytes(16).toString("hex");
  const issuedAt = new Date();
  const expiresAtMs = nowMs() + env.authNonceTtlMs;
  const expiresAt = new Date(expiresAtMs).toISOString();

  const message = [
    `${env.authDomain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to LiquidAI Treasury OS.",
    "",
    `URI: ${env.authUri}`,
    "Version: 1",
    `Chain ID: ${env.celoChainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    `Expiration Time: ${expiresAt}`,
  ].join("\n");

  challenges.set(nonce, {
    address,
    message,
    expiresAtMs,
    used: false,
  });

  return {
    address,
    nonce,
    message,
    expiresAt,
  };
}

function issueSessionToken(address) {
  const now = nowMs();
  const payload = {
    address,
    iat: now,
    exp: now + env.authTokenTtlMs,
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp).toISOString(),
  };
}

function parseToken(rawToken) {
  if (typeof rawToken !== "string" || !rawToken.includes(".")) return null;
  const [encodedPayload, receivedSignature] = rawToken.split(".");
  if (!encodedPayload || !receivedSignature) return null;

  const expectedSignature = signValue(encodedPayload);
  const left = Buffer.from(receivedSignature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }

  let payload = null;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  if (!isAddress(payload.address)) return null;
  if (!Number.isFinite(payload.exp) || payload.exp <= nowMs()) return null;

  return {
    address: getAddress(payload.address),
    exp: payload.exp,
    iat: Number(payload.iat) || 0,
  };
}

export function readAuthSession(rawToken) {
  return parseToken(rawToken);
}

export async function verifyAuthChallenge({ rawAddress, rawNonce, rawSignature }) {
  pruneExpiredChallenges();
  const address = toAddress(rawAddress);
  const nonce = readChallengeNonce(rawNonce);

  if (typeof rawSignature !== "string" || rawSignature.trim().length < 32) {
    throw new Error("Invalid signature.");
  }

  const challenge = challenges.get(nonce);
  if (!challenge) {
    throw new Error("Authentication challenge not found or expired.");
  }

  if (challenge.used || challenge.expiresAtMs <= nowMs()) {
    challenges.delete(nonce);
    throw new Error("Authentication challenge expired.");
  }

  if (challenge.address !== address) {
    throw new Error("Address mismatch for authentication challenge.");
  }

  const recoveredAddress = await recoverMessageAddress({
    message: challenge.message,
    signature: rawSignature,
  });

  if (getAddress(recoveredAddress) !== address) {
    throw new Error("Wallet signature verification failed.");
  }

  challenge.used = true;
  challenges.delete(nonce);

  const session = issueSessionToken(address);
  return {
    address,
    ...session,
  };
}
