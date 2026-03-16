export function createTtlCache(defaultTtlMs) {
  const store = new Map();

  return {
    get(key) {
      const found = store.get(key);
      if (!found) return null;
      if (Date.now() > found.expiresAt) {
        store.delete(key);
        return null;
      }
      return found.value;
    },
    set(key, value, ttlMs = defaultTtlMs) {
      store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    },
    clear() {
      store.clear();
    },
  };
}
