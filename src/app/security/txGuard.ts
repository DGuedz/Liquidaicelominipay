import { getAddress, isAddress } from "viem";

export type TxGuardPolicy = {
  allowedContractAddresses: string[];
  maxNativeValueWei: bigint;
};

export type NormalizedTxIntent = {
  to: `0x${string}`;
  valueWei: bigint;
  data: `0x${string}`;
};

const HEX_REGEX = /^0x[0-9a-fA-F]*$/;

export function sanitizeActionId(value: unknown) {
  const next = Number(value);
  if (!Number.isInteger(next) || next < 0 || next > 1_000_000) {
    throw new Error("Invalid action id.");
  }
  return next;
}

export function sanitizeHexData(rawData: unknown) {
  if (typeof rawData !== "string" || !rawData.trim()) return "0x";
  const normalized = rawData.trim();
  if (!HEX_REGEX.test(normalized)) {
    throw new Error("Invalid transaction calldata. Expected 0x-prefixed hex.");
  }
  return normalized as `0x${string}`;
}

export function sanitizeToAddress(rawTo: unknown) {
  if (typeof rawTo !== "string" || !isAddress(rawTo)) {
    throw new Error("Invalid transaction target address.");
  }
  return getAddress(rawTo);
}

export function assertAllowedContractAddress(to: string, policy: TxGuardPolicy) {
  const normalized = getAddress(to);
  const allowed = new Set(policy.allowedContractAddresses.map((item) => getAddress(item)));
  if (!allowed.has(normalized)) {
    throw new Error(`Blocked transaction to non allow-listed contract: ${normalized}`);
  }
}

export function assertValueLimit(valueWei: bigint, policy: TxGuardPolicy) {
  if (valueWei < 0n) {
    throw new Error("Invalid transaction value.");
  }
  if (valueWei > policy.maxNativeValueWei) {
    throw new Error(`Transaction value exceeds policy limit (${policy.maxNativeValueWei.toString()} wei).`);
  }
}

export function validateTransactionIntent(
  intent: { to: unknown; valueWei?: bigint; data?: unknown },
  policy: TxGuardPolicy,
): NormalizedTxIntent {
  const to = sanitizeToAddress(intent.to);
  const valueWei = typeof intent.valueWei === "bigint" ? intent.valueWei : 0n;
  const data = sanitizeHexData(intent.data);

  assertAllowedContractAddress(to, policy);
  assertValueLimit(valueWei, policy);

  return {
    to: to as `0x${string}`,
    valueWei,
    data,
  };
}
