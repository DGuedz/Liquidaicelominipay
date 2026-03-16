import { getAddress, isAddress } from "viem";
import { env } from "../config/env.mjs";
import { getChainHeartbeat } from "../lib/celo-client.mjs";
import { readAuthSession } from "./auth-service.mjs";
import { getFaucetStatus } from "./faucet-service.mjs";
import { listRecentSettlements } from "./settlement-service.mjs";
import { isSelfVerified } from "../store/self-store.mjs";
import { getWalletSnapshot } from "./wallet-service.mjs";

function emptyBalances() {
  return {
    native: { token: "CELO", balance: 0, usdValue: 0 },
    stable: { token: "USDm", balance: 0, usdValue: 0, address: env.usdStableAddress },
  };
}

function resolveNextAction({
  hasAddress,
  correctNetwork = true,
  sessionReady,
  selfVerified,
  selfRequired,
  walletFunded,
  hasRecentProof,
}) {
  if (!hasAddress) return "connect_wallet";
  if (!correctNetwork) return "switch_network";
  if (!sessionReady) return "activate_session";
  if (selfRequired && !selfVerified) return "verify_self";
  if (!walletFunded) return "claim_faucet";
  if (hasRecentProof) return "open_dashboard";
  return "activate_agent";
}

function recommendedCta(nextAction) {
  return {
    connect_wallet: "Connect wallet",
    switch_network: "Switch to Celo Sepolia",
    activate_session: "Sign session",
    verify_self: "Verify with Self",
    claim_faucet: "Get test funds",
    activate_agent: "Activate agent",
    open_dashboard: "Open dashboard",
  }[nextAction] || "Continue";
}

export async function getActivationRoute({ rawAddress = "", authToken = "", correctNetwork = true } = {}) {
  const hasAddress = isAddress(rawAddress);
  const address = hasAddress ? getAddress(rawAddress) : "";
  const session = authToken ? readAuthSession(authToken) : null;
  const sessionReady = Boolean(address && session?.address === address);
  const selfRequired = env.selfRequiredForAgent;
  const selfVerified = address ? isSelfVerified(address) : false;

  const [backendHealth, faucetStatus, walletSnapshot, recentSettlements] = await Promise.all([
    getChainHeartbeat().catch(() => null),
    getFaucetStatus(address).catch(() => null),
    address ? getWalletSnapshot(address).catch(() => null) : Promise.resolve(null),
    Promise.resolve(address ? listRecentSettlements({ address, limit: 5 }) : []),
  ]);

  const balances = walletSnapshot?.balances || emptyBalances();
  const nativeBalance = Number(balances.native.balance || 0);
  const stableBalance = Number(balances.stable.balance || 0);
  const walletFunded =
    nativeBalance >= env.demoFaucetNativeAmount &&
    stableBalance >= env.demoFaucetStableAmount;
  const hasRecentProof = recentSettlements.some((item) => item.status === "completed");
  const treasuryHealthy = Boolean(faucetStatus?.enabled);
  const faucetAvailable = Boolean(faucetStatus?.enabled) && !hasRecentProof;

  const nextAction = resolveNextAction({
    hasAddress,
    correctNetwork,
    sessionReady,
    selfVerified,
    selfRequired,
    walletFunded,
    hasRecentProof,
  });

  const blockers = [];
  if (!hasAddress) blockers.push("Connect a wallet to begin.");
  if (hasAddress && !correctNetwork) blockers.push("Switch to Celo Sepolia before continuing.");
  if (hasAddress && !sessionReady) blockers.push("Sign the LiquidAI session to continue.");
  if (hasAddress && selfRequired && !selfVerified) {
    blockers.push("Complete Self verification before agent activation.");
  }
  if (hasAddress && !walletFunded) {
    if (faucetStatus?.enabled) {
      blockers.push("Claim Sepolia demo funds before activating the agent.");
    } else {
      blockers.push("Demo faucet is unavailable. Refill treasury or fund this wallet manually.");
    }
  }

  return {
    address,
    chainId: env.celoChainId,
    ready: nextAction === "activate_agent" || nextAction === "open_dashboard",
    nextAction,
    recommendedCta: recommendedCta(nextAction),
    blockers,
    checks: {
      walletAddressProvided: hasAddress,
      correctNetwork,
      sessionReady,
      selfRequired,
      selfVerified,
      walletFunded,
      faucetAvailable,
      treasuryHealthy,
      backendHealthy: Boolean(backendHealth),
      hasRecentProof,
    },
    balances,
    faucet: faucetStatus
      ? {
          enabled: faucetStatus.enabled,
          cooldownMs: faucetStatus.cooldownMs,
          claimAmount: faucetStatus.claimAmount,
          claimState: faucetStatus.claimState,
        }
      : null,
    serviceHealth: {
      backendHealthy: Boolean(backendHealth),
      backendAddress: backendHealth?.backendAddress || faucetStatus?.backendAddress || null,
    },
    updatedAt: new Date().toISOString(),
  };
}
