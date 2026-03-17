import { erc20Abi, formatEther, formatUnits, getAddress, isAddress, parseEther, parseUnits } from "viem";
import { env } from "../config/env.mjs";
import { backendAddress, celoClient, celoWalletClient } from "../lib/celo-client.mjs";
import { getFaucetClaimState, recordFaucetClaim } from "../store/faucet-store.mjs";
import { isSelfVerified } from "../store/self-store.mjs";

function round(value, decimals = 4) {
  return Number.parseFloat(value.toFixed(decimals));
}

function explorerLink(hash) {
  const base =
    env.celoChain === "sepolia"
      ? "https://celo-sepolia.blockscout.com/tx/"
      : "https://celoscan.io/tx/";
  return `${base}${hash}`;
}

async function readTreasury() {
  if (!backendAddress) {
    return {
      address: null,
      native: { token: "CELO", balance: 0 },
      stable: { token: "USDm", balance: 0, address: env.usdStableAddress },
    };
  }

  const [nativeBalanceRaw, stableBalanceRaw, stableDecimals, stableSymbol] = await Promise.all([
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
    celoClient.readContract({
      address: env.usdStableAddress,
      abi: erc20Abi,
      functionName: "symbol",
    }),
  ]);

  return {
    address: backendAddress,
    native: {
      token: "CELO",
      balance: round(Number.parseFloat(formatEther(nativeBalanceRaw)), 6),
    },
    stable: {
      token: stableSymbol,
      address: env.usdStableAddress,
      balance: round(Number.parseFloat(formatUnits(stableBalanceRaw, stableDecimals)), 6),
      decimals: stableDecimals,
    },
  };
}

function assertFaucetReady() {
  if (env.celoChain !== "sepolia") {
    throw new Error("Demo faucet is only enabled on Celo Sepolia.");
  }
  if (!celoWalletClient || !backendAddress) {
    throw new Error("Demo faucet backend wallet is not configured.");
  }
}

export async function getFaucetStatus(rawAddress = "") {
  const claimState =
    typeof rawAddress === "string" && isAddress(rawAddress)
      ? getFaucetClaimState(getAddress(rawAddress), env.demoFaucetCooldownMs)
      : getFaucetClaimState("", env.demoFaucetCooldownMs);

  const treasury = await readTreasury();
  const enabled =
    env.celoChain === "sepolia" &&
    Boolean(backendAddress) &&
    treasury.native.balance > env.demoFaucetNativeAmount + env.demoFaucetNativeReserve &&
    treasury.stable.balance > env.demoFaucetStableAmount + env.demoFaucetStableReserve;

  return {
    enabled,
    chainId: env.celoChainId,
    backendAddress,
    cooldownMs: env.demoFaucetCooldownMs,
    claimAmount: {
      nativeToken: "CELO",
      nativeAmount: env.demoFaucetNativeAmount,
      stableToken: treasury.stable.token,
      stableAmount: env.demoFaucetStableAmount,
    },
    treasury,
    claimState,
  };
}

export async function claimDemoFunds(rawAddress) {
  assertFaucetReady();
  if (!isAddress(rawAddress)) {
    throw new Error("Invalid faucet recipient address.");
  }

  const address = getAddress(rawAddress);
  if (backendAddress && address === backendAddress) {
    throw new Error("Connect a different wallet to claim demo funds from the treasury wallet.");
  }
  
  // Relax Self check for demo purposes if needed, but strict mode is safer
  if (env.selfRequiredForAgent && !isSelfVerified(address)) {
     // throw new Error("Self verification required before claiming faucet.");
     // We allow faucet even without Self for now to let user onboard, 
     // but Agent activation will block later.
  }

  const claimState = getFaucetClaimState(address, env.demoFaucetCooldownMs);
  if (claimState.remainingMs > 0) {
    throw new Error(`Faucet cooldown active. Try again after ${claimState.nextEligibleAt}.`);
  }

  const [treasury, stableDecimals] = await Promise.all([
    readTreasury(),
    celoClient.readContract({
      address: env.usdStableAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);

  if (treasury.native.balance < env.demoFaucetNativeAmount + env.demoFaucetNativeReserve) {
    throw new Error("Demo faucet is out of CELO liquidity.");
  }

  if (treasury.stable.balance < env.demoFaucetStableAmount + env.demoFaucetStableReserve) {
    throw new Error(`Demo faucet is out of ${treasury.stable.token} liquidity.`);
  }

  const nativeValue = parseEther(String(env.demoFaucetNativeAmount));
  const stableValue = parseUnits(String(env.demoFaucetStableAmount), stableDecimals);

  const nativeTxHash = await celoWalletClient.sendTransaction({
    to: address,
    value: nativeValue,
    feeCurrency: env.usdStableAddress,
  });
  await celoClient.waitForTransactionReceipt({ hash: nativeTxHash });

  const stableTxHash = await celoWalletClient.writeContract({
    address: env.usdStableAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [address, stableValue],
    feeCurrency: env.usdStableAddress,
  });
  await celoClient.waitForTransactionReceipt({ hash: stableTxHash });

  const claim = {
    address,
    nativeTxHash,
    stableTxHash,
    nativeExplorerUrl: explorerLink(nativeTxHash),
    stableExplorerUrl: explorerLink(stableTxHash),
    nativeAmount: env.demoFaucetNativeAmount,
    stableAmount: env.demoFaucetStableAmount,
    stableToken: treasury.stable.token,
    claimedAt: new Date().toISOString(),
  };

  const record = recordFaucetClaim(address, claim);

  return {
    ...claim,
    claimCount: record.claimCount,
    nextEligibleAt: new Date(record.lastClaimAt + env.demoFaucetCooldownMs).toISOString(),
  };
}
