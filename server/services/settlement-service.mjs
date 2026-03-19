import { randomUUID, createHash } from "node:crypto";
import { erc20Abi, formatUnits, parseUnits, getAddress, isAddress, stringToHex } from "viem";
import { env } from "../config/env.mjs";
import { celoClient, celoWalletClient, backendAddress } from "../lib/celo-client.mjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Mento, ChainId } = require("@mento-protocol/mento-sdk");

// In-memory store for settlement intents (Locks)
// In a real app, this would be backed by a DB or directly queried from on-chain smart contracts.
const settlementLocks = new Map();
const recentSettlementIds = [];

const SUPPORTED_PROTOCOLS = new Set([
  "agent",
  "mento",
  "aave",
  "morpho",
  "uniswap-v3",
  "curve",
  "stcelo",
  "moola",
  "kiln",
  "untangled",
  "ethichub",
  "credit-collective",
]);

const SUPPORTED_ACTIONS = new Set([
  "authorize_action",
  "swap",
  "rebalance",
  "deposit",
  "withdraw",
  "transfer",
  "payment",
]);

function nowMs() {
  return Date.now();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProtocol(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeAction(value) {
  return String(value || "").trim().toLowerCase();
}

function pruneExpiredLocks() {
  const now = nowMs();
  for (const lock of settlementLocks.values()) {
    if (lock.status !== "pending") continue;
    if (lock.expiresAt <= now) {
      lock.status = "expired";
      lock.expiredAt = now;
    }
  }
}

function rememberSettlement(settlementId) {
  recentSettlementIds.unshift(settlementId);
  if (recentSettlementIds.length > 300) {
    recentSettlementIds.length = 300;
  }
}

function assertSupported(protocol, actionType) {
  if (!SUPPORTED_PROTOCOLS.has(protocol)) {
    throw new Error(`Unsupported settlement protocol: ${protocol}`);
  }
  if (!SUPPORTED_ACTIONS.has(actionType)) {
    throw new Error(`Unsupported settlement action: ${actionType}`);
  }
}

/**
 * Cria uma condição de bloqueio (Intent) para liquidação atômica.
 * Segue a Regra 2 (Liquidação Atômica) - Criação de condição on-chain.
 */
export function createConditionalLock({ address, amount, protocol, actionType }) {
  pruneExpiredLocks();
  if (!isAddress(address)) throw new Error("Invalid address for settlement lock.");
  const numericAmount = toNumber(amount);
  if (numericAmount <= 0) throw new Error("Invalid amount for settlement lock.");

  const normalizedAddress = getAddress(address);
  const normalizedProtocol = normalizeProtocol(protocol);
  const normalizedActionType = normalizeAction(actionType);
  assertSupported(normalizedProtocol, normalizedActionType);
  
  // Create a unique identifier for the operation
  const settlementId = randomUUID();
  const createdAt = nowMs();
  const expiresAt = createdAt + env.settlementLockTtlMs;
  
  // Generate a deterministic hash for auditing (Regra 8 - Logar apenas hashes/identificadores)
  const payloadHash = createHash("sha256")
    .update(`${normalizedAddress}:${numericAmount}:${normalizedProtocol}:${normalizedActionType}:${createdAt}`)
    .digest("hex");

  const lock = {
    id: settlementId,
    address: normalizedAddress,
    amount: numericAmount,
    protocol: normalizedProtocol,
    actionType: normalizedActionType,
    status: "pending",
    hash: payloadHash,
    createdAt,
    expiresAt,
    intent: {
      standard: "erc-8004-preview",
      type: "settlement-intent",
      telemetry: ["karma", "agentscan"],
    },
    txHash: null,
  };

  settlementLocks.set(settlementId, lock);
  rememberSettlement(settlementId);

  console.log(`[Settlement] Lock created | ID: ${settlementId} | Hash: ${payloadHash}`);

  return {
    settlementId,
    hash: payloadHash,
    status: lock.status,
    expiresAt: new Date(lock.expiresAt).toISOString(),
    protocol: lock.protocol,
    actionType: lock.actionType,
    intent: lock.intent,
  };
}

async function attemptRealMentoSwap(lock) {
  try {
    const chainId = env.celoChain === "mainnet" ? ChainId.CELO : ChainId.CELO_ALFAJORES;
    const mento = await Mento.create(chainId, celoWalletClient);
    
    // Swap 0.01 USDm for CELO (Buy CELO)
    // In a real scenario, amounts would match lock.amount
    const fromToken = env.usdStableAddress; // USDm
    const toToken = "CELO"; 
    const amountIn = parseUnits("0.01", 18); // 0.01 USDm

    console.log(`[Settlement] Attempting Real Mento Swap: ${formatUnits(amountIn, 18)} USDm -> CELO`);
    
    // Check allowance first
    const allowance = await celoClient.readContract({
      address: fromToken,
      abi: erc20Abi,
      functionName: "allowance",
      args: [backendAddress, mento.broker.address],
    });

    if (allowance < amountIn) {
      console.log("[Settlement] Approving Mento Broker...");
      const approveTx = await celoWalletClient.writeContract({
        address: fromToken,
        abi: erc20Abi,
        functionName: "approve",
        args: [mento.broker.address, amountIn * 10n],
        feeCurrency: env.usdStableAddress
      });
      await celoClient.waitForTransactionReceipt({ hash: approveTx });
      console.log(`[Settlement] Approved: ${approveTx}`);
    }

    const txObj = await mento.swapIn(fromToken, toToken, amountIn, 0);
    // Execute via viem wallet
    const hash = await celoWalletClient.sendTransaction({
      to: txObj.to,
      data: txObj.data,
      value: BigInt(txObj.value || 0),
      feeCurrency: env.usdStableAddress
    });
    
    console.log(`[Settlement] Real Swap Submitted: ${hash}`);
    return hash;
  } catch (error) {
    console.warn(`[Settlement] Real Swap Failed (Simulating instead): ${error.message}`);
    return null;
  }
}

async function submitOnChainProof(lock, manualTxHash = null) {
  if (!celoWalletClient || !backendAddress) {
    console.log("[Settlement] Skipping on-chain proof (no wallet configured)");
    return;
  }

  try {
    const [celoBalanceBefore, cusdBalanceBefore, cusdDecimals] = await Promise.all([
      celoClient.getBalance({ address: backendAddress }),
      celoClient.readContract({
        address: env.usdStableAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [backendAddress],
      }),
      celoClient.readContract({
        address: env.usdStableAddress,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ]);

    console.log(`[Settlement] Submitting proof for ${lock.id}...`);
    let hash = manualTxHash;

    if (!hash) {
      // Attempt Real Action if Mento
      if (lock.protocol === "mento" && lock.actionType === "swap") {
         hash = await attemptRealMentoSwap(lock);
      }

      // Fallback to Proof-of-Intent if real action failed or skipped
      if (!hash) {
        hash = await celoWalletClient.sendTransaction({
          to: lock.address, // Send 0 value tx to user as proof of interaction
          value: 0n,
          data: stringToHex(`Settlement:${lock.id}:${lock.hash}`),
          feeCurrency: env.usdStableAddress,
        });
      }
    } else {
      console.log(`[Settlement] Using manual txHash: ${hash}`);
    }

    const receipt = await celoClient.waitForTransactionReceipt({ hash });
    const [transaction, celoBalanceAfter, cusdBalanceAfter] = await Promise.all([
      celoClient.getTransaction({ hash }),
      celoClient.getBalance({ address: backendAddress }),
      celoClient.readContract({
        address: env.usdStableAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [backendAddress],
      }),
    ]);

    const celoDelta = celoBalanceBefore - celoBalanceAfter;
    const cusdDelta = cusdBalanceBefore - cusdBalanceAfter;
    const feeCurrencyUsed = transaction.feeCurrency ?? null;

    lock.txHash = hash;
    lock.settledOnChainAt = nowMs();
    lock.onChainProof = {
      receiptStatus: receipt.status,
      feeCurrency: feeCurrencyUsed,
      celoDeltaWei: celoDelta.toString(),
      stableDelta: formatUnits(cusdDelta, cusdDecimals),
    };
    settlementLocks.set(lock.id, lock);
    console.log(
      `[Settlement] On-chain proof submitted: ${hash} | feeCurrency=${feeCurrencyUsed || "unknown"} | celoDeltaWei=${celoDelta.toString()} | stableDelta=${formatUnits(cusdDelta, cusdDecimals)}`,
    );
  } catch (error) {
    console.error(`[Settlement] On-chain proof failed: ${error.message}`);
    // We don't fail the settlement logic itself, just the proof submission
    // In a strict VSC environment, we might want to queue this for retry
  }
}

/**
 * Finaliza a operação de liquidação usando o identificador único.
 * Segue a Regra 2 - Finalização explícita.
 * Falha de forma barata se inválida.
 */
export async function finalizeSettlement({ address, settlementId, manualTxHash }) {
  pruneExpiredLocks();
  if (!isAddress(address)) throw new Error("Invalid address for settlement finalization.");
  
  const lock = settlementLocks.get(settlementId);

  // Validação de sequência e existência (Fail fast & cheap)
  if (!lock) {
    throw new Error("Execução interrompida por violação de integridade VSC: Settlement Lock not found.");
  }

  // Validação de Ownership
  const normalizedAddress = getAddress(address);
  if (lock.address !== normalizedAddress) {
    throw new Error("Execução interrompida por violação de integridade VSC: Ownership mismatch.");
  }

  // Validação de Sequência
  if (lock.status !== "pending") {
    throw new Error("Execução interrompida por violação de integridade VSC: Invalid settlement sequence.");
  }
  if (lock.expiresAt <= nowMs()) {
    lock.status = "expired";
    lock.expiredAt = nowMs();
    throw new Error("Execução interrompida por violação de integridade VSC: Settlement lock expired.");
  }

  // Efetiva a finalização
  lock.status = "settled";
  lock.executedAt = nowMs();
  
  settlementLocks.set(settlementId, lock);

  // Auditoria Econômica (Regra 8)
  console.log(`[Settlement] Finalized | ID: ${settlementId} | Hash: ${lock.hash}`);

  // Dispara prova on-chain se configurado (async/fire-and-forget ou await dependendo do requisito)
  // Para Vercel, idealmente aguardamos o envio ao mempool
  await submitOnChainProof(lock, manualTxHash);

  return {
    settlementId,
    hash: lock.hash,
    status: lock.status,
    executedAt: lock.executedAt,
    protocol: lock.protocol,
    actionType: lock.actionType,
    intent: lock.intent,
    txHash: lock.txHash,
    onChainProof: lock.onChainProof ?? null,
  };
}

/**
 * Recupera o status de um settlement (Para UI e rastreabilidade)
 */
export function getSettlementStatus(settlementId) {
  pruneExpiredLocks();
  const lock = settlementLocks.get(settlementId);
  if (!lock) return null;
  return {
    id: lock.id,
    status: lock.status,
    hash: lock.hash,
    protocol: lock.protocol,
    actionType: lock.actionType,
    amount: lock.amount,
    createdAt: new Date(lock.createdAt).toISOString(),
    expiresAt: new Date(lock.expiresAt).toISOString(),
    executedAt: lock.executedAt ? new Date(lock.executedAt).toISOString() : null,
    intent: lock.intent,
    txHash: lock.txHash,
    onChainProof: lock.onChainProof ?? null,
  };
}

export function listRecentSettlements({ address = "", limit = 20 } = {}) {
  pruneExpiredLocks();
  const normalizedAddress = isAddress(address) ? getAddress(address) : "";
  const safeLimit = Math.max(1, Math.min(100, Number.parseInt(String(limit), 10) || 20));

  const items = [];
  for (const settlementId of recentSettlementIds) {
    const lock = settlementLocks.get(settlementId);
    if (!lock) continue;
    if (normalizedAddress && lock.address !== normalizedAddress) continue;
    items.push({
      id: lock.id,
      address: lock.address,
      protocol: lock.protocol,
      actionType: lock.actionType,
      amount: lock.amount,
      status: lock.status,
      hash: lock.hash,
      createdAt: new Date(lock.createdAt).toISOString(),
      expiresAt: new Date(lock.expiresAt).toISOString(),
      executedAt: lock.executedAt ? new Date(lock.executedAt).toISOString() : null,
    });
    if (items.length >= safeLimit) break;
  }

  return items;
}
