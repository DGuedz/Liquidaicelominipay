// Mock memory store for user profiles
// In a real app, this would be a database (PostgreSQL/MongoDB)

const profiles = new Map();

const DEFAULT_PROFILE = {
  security: {
    requireApproval: true,
    maxTransactionLimit: 500,
    biometricsEnabled: true,
  },
  protocols: {
    aave: true,
    mento: true,
    moola: true,
    ubeswap: true,
    pwn: true,
    morpho: false,
  },
  yield: {
    strategyId: "balanced",
    autoRebalance: true,
  },
};

export function getUserProfile(address) {
  const profile = profiles.get(address.toLowerCase());
  return profile || JSON.parse(JSON.stringify(DEFAULT_PROFILE));
}

export function updateUserProfile(address, updates) {
  const current = getUserProfile(address);
  const updated = {
    ...current,
    ...updates,
    // Deep merge for nested objects if needed, simplified here
    security: { ...current.security, ...(updates.security || {}) },
    protocols: { ...current.protocols, ...(updates.protocols || {}) },
    yield: { ...current.yield, ...(updates.yield || {}) },
  };
  
  profiles.set(address.toLowerCase(), updated);
  return updated;
}
