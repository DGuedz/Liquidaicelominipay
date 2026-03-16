const faucetClaims = new Map();

function actorKey(address) {
  if (typeof address === "string" && address.trim()) return address.toLowerCase();
  return "demo-user";
}

export function getFaucetClaimState(address, cooldownMs) {
  const entry = faucetClaims.get(actorKey(address));
  if (!entry) {
    return {
      claimCount: 0,
      lastClaimAt: null,
      nextEligibleAt: null,
      cooldownMs,
      remainingMs: 0,
      lastClaim: null,
    };
  }

  const nextEligibleAt = entry.lastClaimAt + cooldownMs;
  const remainingMs = Math.max(0, nextEligibleAt - Date.now());

  return {
    claimCount: entry.claimCount,
    lastClaimAt: new Date(entry.lastClaimAt).toISOString(),
    nextEligibleAt: new Date(nextEligibleAt).toISOString(),
    cooldownMs,
    remainingMs,
    lastClaim: entry.lastClaim,
  };
}

export function recordFaucetClaim(address, claim) {
  const key = actorKey(address);
  const previous = faucetClaims.get(key);
  const next = {
    claimCount: (previous?.claimCount || 0) + 1,
    lastClaimAt: Date.now(),
    lastClaim: { ...claim },
  };
  faucetClaims.set(key, next);
  return next;
}
