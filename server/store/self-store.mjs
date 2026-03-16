import { getAddress, isAddress } from "viem";

const records = new Map();

function walletKey(address) {
  if (!isAddress(address)) return "";
  return getAddress(address).toLowerCase();
}

function buildProofRef(address, mode) {
  const safeAddress = walletKey(address).slice(2, 10);
  const entropy = Math.random().toString(16).slice(2, 10);
  return `self-${mode}-${safeAddress}-${entropy}`;
}

export function getSelfVerification(address) {
  const key = walletKey(address);
  if (!key) return null;
  return records.get(key) || null;
}

export function isSelfVerified(address) {
  const record = getSelfVerification(address);
  return Boolean(record?.verified);
}

export function markSelfVerified(address, options = {}) {
  if (!isAddress(address)) {
    throw new Error("Valid wallet address required for Self verification.");
  }

  const normalizedAddress = getAddress(address);
  const mode = typeof options.mode === "string" && options.mode.trim() ? options.mode.trim() : "mock";
  const proofRef =
    typeof options.proofRef === "string" && options.proofRef.trim()
      ? options.proofRef.trim()
      : buildProofRef(normalizedAddress, mode);

  const record = {
    address: normalizedAddress,
    verified: true,
    mode,
    provider: options.provider || "Self Protocol",
    proofRef,
    verifiedAt: new Date().toISOString(),
  };

  records.set(walletKey(normalizedAddress), record);
  return record;
}

export function resetSelfVerification(address) {
  const key = walletKey(address);
  if (!key) return false;
  return records.delete(key);
}
