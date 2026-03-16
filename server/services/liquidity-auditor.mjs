// ─── LiquidAI Treasury Auditor (Skill) ───────────────────────────────────────
// Purpose: Validates all agent proposals against strict solvency/safety rules.
// "Never spend what you don't have. Never lock what you need now."
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AuditRequest
 * @property {number} walletBalanceUsd - Real on-chain balance (no fake data)
 * @property {number} bufferUsd - Minimum liquidity required for user actions
 * @property {string} riskMode - 'conservative' | 'balanced' | 'aggressive'
 * @property {Object} proposedAction - The strategy the agent wants to run
 * @property {string} proposedAction.protocolId - Target protocol
 * @property {number} proposedAction.amountUsd - Amount to move
 * @property {number} proposedAction.currentApy - Current yield
 * @property {number} proposedAction.newApy - Expected yield
 */

/**
 * @typedef {Object} AuditResult
 * @property {boolean} approved - Can we proceed?
 * @property {string[]} reasons - Why yes or why no
 * @property {number} maxSafeAmountUsd - Cap enforced by auditor
 */

export class LiquidityAuditor {
  static RULES = {
    MIN_YIELD_DELTA: 0.5, // 0.5% APY min improvement to justify gas/risk
    GAS_RESERVE_USD: 0.10, // Keep $0.10 for gas always
    MIN_ALLOCATION_USD: 1.00, // Don't dust the protocols
  };

  /**
   * Main entry point for validating any agent strategy
   * @param {AuditRequest} req
   * @returns {AuditResult}
   */
  static validate(req) {
    const reasons = [];
    let approved = true;
    let safeAmount = req.proposedAction.amountUsd;

    // 1. Solvency Check (Real Capital First)
    if (req.walletBalanceUsd <= 0) {
      return {
        approved: false,
        reasons: ["Zero balance. Cannot allocate ghost capital."],
        maxSafeAmountUsd: 0
      };
    }

    // 2. Buffer Integrity (Liquidity First)
    const availableAfterBuffer = req.walletBalanceUsd - req.bufferUsd - this.RULES.GAS_RESERVE_USD;
    if (safeAmount > availableAfterBuffer) {
      reasons.push(`Proposed amount $${safeAmount.toFixed(2)} breaches liquidity buffer.`);
      safeAmount = Math.max(0, availableAfterBuffer);
      
      if (safeAmount < this.RULES.MIN_ALLOCATION_USD) {
        return {
          approved: false,
          reasons: [...reasons, "Available capital below minimum allocation threshold."],
          maxSafeAmountUsd: 0
        };
      }
      reasons.push(`Amount capped to $${safeAmount.toFixed(2)} to preserve buffer.`);
    }

    // 3. Yield Materiality (Is it worth it?)
    const delta = req.proposedAction.newApy - req.proposedAction.currentApy;
    if (delta < this.RULES.MIN_YIELD_DELTA && req.proposedAction.currentApy > 0) {
      // If we are already earning, switching for < 0.5% might not be worth gas/risk
      // Unless we are in "aggressive" mode
      if (req.riskMode !== "aggressive") {
        return {
          approved: false,
          reasons: [`Yield delta ${delta.toFixed(2)}% too low for non-aggressive profile.`],
          maxSafeAmountUsd: 0
        };
      }
    }

    // 4. Protocol Safety (Mock Oracle)
    // In a real system, this would call an on-chain risk oracle
    if (!this._isProtocolSafe(req.proposedAction.protocolId, req.riskMode)) {
        return {
            approved: false,
            reasons: [`Protocol ${req.proposedAction.protocolId} exceeds risk tolerance for ${req.riskMode}.`],
            maxSafeAmountUsd: 0
        };
    }

    return {
      approved: true,
      reasons: ["Solvency check passed", "Buffer respected", "Yield delta material"],
      maxSafeAmountUsd: safeAmount
    };
  }

  static _isProtocolSafe(protocolId, riskMode) {
    const RISK_SCORES = {
      mento: 1, // Safe
      aave: 2,  // Safe/Mid
      curve: 2,
      uni: 3,
      morpho: 3,
      pwn: 4,
      untangled: 4, // RWA
      ethichub: 5   // RWA High Yield
    };

    const MAX_ALLOWED_RISK = {
      conservative: 2,
      balanced: 3,
      aggressive: 5
    };

    const score = RISK_SCORES[protocolId] || 5;
    return score <= MAX_ALLOWED_RISK[riskMode];
  }
}
