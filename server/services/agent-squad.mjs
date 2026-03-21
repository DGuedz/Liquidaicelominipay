import { isSelfVerified } from "../store/security-state-store.mjs";

export const Sentinel = {
  async triggerIdentitySupport(address, errorCode) {
    console.warn(`[identity-support] Verification issue detected for ${address}. code=${errorCode || "unknown"}`);

    const isVerified = await isSelfVerified(address);
    if (isVerified) {
      return {
        supportAgent: "identity",
        action: "restore_session",
        message: "Your Self verification is still valid. Session restored.",
      };
    }

    return {
      supportAgent: "identity",
      action: "enforce_block",
      message: "Self verification expired or failed. Access is blocked until you verify again.",
      mitigationUrl: "/onboarding",
    };
  }
};

export const Vault = {
  async triggerYieldSupport(address, txHash = null) {
    console.log(`[yield-support] analyzing chain state for ${address}`);

    if (txHash) {
      return {
        supportAgent: "yield",
        action: "explain_transaction",
        message: `Transaction ${txHash} was processed successfully. No user action required.`,
      };
    }

    return {
      supportAgent: "yield",
      action: "rpc_latency_report",
      message: "Network latency detected. Funds remain safe while state propagation catches up.",
    };
  }
};

export const Operator = {
  async triggerAtomicExecution(address, actionPayload) {
    console.log(`[operator] authorization request for ${address}`);

    const isHumanVerified = await isSelfVerified(address);

    if (!isHumanVerified) {
      console.error("[operator] execution rejected: missing self verification");
      throw new Error("OPERATOR_REJECT: signature blocked due to missing self verification.");
    }

    console.log(`[operator] signing action ${actionPayload.actionId}`);

    return {
      supportAgent: "operator",
      status: "settled",
      receipt: `0x_mock_receipt_${Date.now()}_${actionPayload.actionId}`,
      message: "Atomic operation completed successfully.",
    };
  }
};
