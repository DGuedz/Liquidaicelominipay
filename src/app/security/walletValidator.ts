type ConnectorLike = {
  id?: string;
  name?: string;
  type?: string;
};

export type WalletSecurityPolicy = {
  expectedChainId: number;
  allowedHosts: string[];
  allowedConnectorPatterns: RegExp[];
};

const DEFAULT_ALLOWED_CONNECTOR_PATTERNS = [
  /minipay/i,
  /metamask|meta/i,
  /rabby/i,
  /trust/i,
  /coinbase/i,
  /walletconnect/i,
];

const DEFAULT_ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "app.liquidai.ai",
  "liquidai.ai",
];

function parseAllowedHosts(rawValue: string) {
  return rawValue
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function matchesHostPattern(hostname: string, pattern: string) {
  if (pattern === hostname) return true;
  if (!pattern.startsWith("*.")) return false;
  const suffix = pattern.slice(1);
  return hostname.endsWith(suffix);
}

function normalizeConnectorFingerprint(connector?: ConnectorLike) {
  const id = String(connector?.id || "").toLowerCase().trim();
  const name = String(connector?.name || "").toLowerCase().trim();
  const type = String(connector?.type || "").toLowerCase().trim();
  return `${id} ${name} ${type}`.trim();
}

export function getRuntimeWalletSecurityPolicy(expectedChainId: number): WalletSecurityPolicy {
  const envHosts = parseAllowedHosts(String(import.meta.env.VITE_ALLOWED_APP_HOSTS || ""));
  const allowedHosts = envHosts.length ? envHosts : [...DEFAULT_ALLOWED_HOSTS];

  if (import.meta.env.DEV && !allowedHosts.includes("*.vercel.app")) {
    allowedHosts.push("*.vercel.app");
  }

  return {
    expectedChainId,
    allowedHosts,
    allowedConnectorPatterns: DEFAULT_ALLOWED_CONNECTOR_PATTERNS,
  };
}

export function assertTrustedOrigin(hostname: string, allowedHosts: string[]) {
  const normalized = String(hostname || "").trim().toLowerCase();
  if (!normalized) {
    throw new Error("Invalid dApp origin. Could not determine current hostname.");
  }

  const trusted = allowedHosts.some((pattern) => matchesHostPattern(normalized, pattern.toLowerCase()));
  if (!trusted) {
    throw new Error(
      `Blocked wallet connection on untrusted domain "${normalized}". Use an approved LiquidAI domain.`,
    );
  }
}

export function isAllowedConnector(
  connector: ConnectorLike | undefined,
  allowedConnectorPatterns: RegExp[] = DEFAULT_ALLOWED_CONNECTOR_PATTERNS,
) {
  const fingerprint = normalizeConnectorFingerprint(connector);
  return allowedConnectorPatterns.some((pattern) => pattern.test(fingerprint));
}

export function assertExpectedChainId(actualChainId: number | undefined, expectedChainId: number) {
  if (typeof actualChainId !== "number") {
    throw new Error("Wallet chain is unavailable. Reconnect and try again.");
  }
  if (actualChainId !== expectedChainId) {
    throw new Error(`Wrong network detected (${actualChainId}). Expected chainId ${expectedChainId}.`);
  }
}
