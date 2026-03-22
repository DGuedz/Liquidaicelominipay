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
  // Keep generic injected wallets available (EIP-1193 / EIP-6963 providers).
  /injected/i,
];

const DEFAULT_ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "app.liquidai.ai",
  "liquidai.ai",
  "liquidai-app.vercel.app",
  "*.vercel.app",
  "*.onrender.com"
];

function parseBooleanFlag(rawValue: string) {
  const normalized = String(rawValue || "").trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

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
  const allowVercelPreview =
    import.meta.env.DEV || parseBooleanFlag(String(import.meta.env.VITE_ALLOW_VERCEL_PREVIEW || ""));

  if (allowVercelPreview && !allowedHosts.includes("*.vercel.app")) {
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
    const compactAllowList = allowedHosts.slice(0, 8).join(", ");
    throw new Error(
      `Blocked wallet connection on untrusted domain "${normalized}". Allowed hosts: ${compactAllowList}.`,
    );
  }
}

export function isAllowedConnector(
  connector: ConnectorLike | undefined,
  allowedConnectorPatterns: RegExp[] = DEFAULT_ALLOWED_CONNECTOR_PATTERNS,
) {
  if (!connector) return false;
  const fingerprint = normalizeConnectorFingerprint(connector);
  if (allowedConnectorPatterns.some((pattern) => pattern.test(fingerprint))) {
    return true;
  }

  // Fallback: allow injected providers discovered at runtime.
  return String(connector.type || "").toLowerCase().trim() === "injected";
}

export function assertExpectedChainId(actualChainId: number | undefined, expectedChainId: number) {
  if (typeof actualChainId !== "number") {
    throw new Error("Wallet chain is unavailable. Reconnect and try again.");
  }
  if (actualChainId !== expectedChainId) {
    throw new Error(`Wrong network detected (${actualChainId}). Expected chainId ${expectedChainId}.`);
  }
}
