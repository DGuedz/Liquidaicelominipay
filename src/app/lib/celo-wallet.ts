import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { chainConfig } from "viem/celo";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const DEFAULT_CELO_RPC_URL = "https://forno.celo-sepolia.celo-testnet.org";
const APP_WALLET_RESET_KEY = "liquidai.wallet-reset";

type InjectedProvider = {
  isMiniPay?: boolean;
  isMetaMask?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: InjectedProvider[];
  request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  _metamask?: {
    isUnlocked?: () => Promise<boolean>;
  };
};

export type WalletMode = "minipay" | "browser";

function getEnvVar(key: "VITE_CELO_RPC_URL" | "VITE_APP_URL" | "VITE_WALLETCONNECT_PROJECT_ID"): string {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : "";
}

function getBrowserEthereum(): InjectedProvider | null {
  if (typeof window === "undefined") return null;
  const ethereum = (window as Window & { ethereum?: InjectedProvider }).ethereum;
  return ethereum ?? null;
}

function hasWindowStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function listInjectedProviders(): InjectedProvider[] {
  const ethereum = getBrowserEthereum();
  if (!ethereum) return [];
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return ethereum.providers;
  }
  return [ethereum];
}

function resolveInjectedProviderId(provider: InjectedProvider): string {
  if (provider.isMiniPay) return "minipay";
  if (provider.isMetaMask) return "metamask";
  if (provider.isRabby) return "rabby";
  if (provider.isTrust) return "trust";
  if (provider.isCoinbaseWallet) return "coinbase";
  return "injected";
}

function resolveInjectedProviderName(provider: InjectedProvider): string {
  if (provider.isMiniPay) return "MiniPay";
  if (provider.isMetaMask) return "MetaMask";
  if (provider.isRabby) return "Rabby";
  if (provider.isTrust) return "Trust Wallet";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  return "Injected Wallet";
}

function getInjectedProviderForTarget(targetId?: string): InjectedProvider | null {
  const providers = listInjectedProviders();
  if (!providers.length) return null;

  const normalizedTarget = String(targetId || "").toLowerCase();
  if (normalizedTarget.includes("minipay")) {
    return providers.find((provider) => provider?.isMiniPay) ?? null;
  }

  if (normalizedTarget.includes("meta")) {
    return providers.find((provider) => provider?.isMetaMask) ?? null;
  }

  if (normalizedTarget.includes("rabby")) {
    return providers.find((provider) => provider?.isRabby) ?? null;
  }

  if (normalizedTarget.includes("trust")) {
    return providers.find((provider) => provider?.isTrust) ?? null;
  }

  if (normalizedTarget.includes("coinbase")) {
    return providers.find((provider) => provider?.isCoinbaseWallet) ?? null;
  }

  return providers.find((provider) => provider?.isMiniPay)
    ?? providers.find((provider) => provider?.isMetaMask)
    ?? providers.find((provider) => provider?.isRabby)
    ?? providers.find((provider) => provider?.isTrust)
    ?? providers.find((provider) => provider?.isCoinbaseWallet)
    ?? providers[0]
    ?? null;
}

export function getPreferredInjectedProvider(targetId?: string) {
  return getInjectedProviderForTarget(targetId);
}

export function isMiniPayEnvironment() {
  return Boolean(getPreferredInjectedProvider()?.isMiniPay);
}

export function resolveWalletMode(targetId?: string): WalletMode {
  return getPreferredInjectedProvider(targetId)?.isMiniPay ? "minipay" : "browser";
}

export function isWalletResetOverride() {
  if (!hasWindowStorage()) return false;
  return window.localStorage.getItem(APP_WALLET_RESET_KEY) === "1";
}

export function setWalletResetOverride(disconnected: boolean) {
  if (!hasWindowStorage()) return;
  if (disconnected) {
    window.localStorage.setItem(APP_WALLET_RESET_KEY, "1");
    return;
  }
  window.localStorage.removeItem(APP_WALLET_RESET_KEY);
}

export function clearWalletConnectorPersistence() {
  if (!hasWindowStorage()) return;

  const keysToRemove = new Set([
    "wagmi.store",
    "wagmi.wallet",
    "wagmi.connected",
    APP_WALLET_RESET_KEY,
  ]);

  for (const key of Object.keys(window.localStorage)) {
    if (
      key.startsWith("wagmi.") ||
      key.startsWith("injected.") ||
      key.startsWith("metaMask.") ||
      key.startsWith("mipd.") ||
      key.startsWith("walletconnect")
    ) {
      keysToRemove.add(key);
    }
  }

  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }
}

export async function requestPreferredAccounts(targetId?: string) {
  const provider = getInjectedProviderForTarget(targetId);
  if (!provider?.request) return [];
  const result = await provider.request({ method: "eth_requestAccounts" });
  return Array.isArray(result) ? result : [];
}

export async function readPreferredAccounts(targetId?: string) {
  const provider = getInjectedProviderForTarget(targetId);
  if (!provider?.request) return [];
  const result = await provider.request({ method: "eth_accounts" });
  return Array.isArray(result) ? result : [];
}

export async function isPreferredWalletUnlocked() {
  const provider = getPreferredInjectedProvider();
  if (!provider) return true;

  if (typeof provider._metamask?.isUnlocked === "function") {
    try {
      return await provider._metamask.isUnlocked();
    } catch {
      return true;
    }
  }

  return true;
}

type ProviderEventHandlers = {
  onAccountsChanged?: (accounts: string[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

export function subscribePreferredProviderEvents(handlers: ProviderEventHandlers) {
  const provider = getPreferredInjectedProvider();
  if (!provider?.on || !provider.removeListener) {
    return () => {};
  }

  const handleAccountsChanged = (accounts: unknown) => {
    if (!handlers.onAccountsChanged) return;
    const nextAccounts = Array.isArray(accounts)
      ? accounts.filter((value): value is string => typeof value === "string")
      : [];
    handlers.onAccountsChanged(nextAccounts);
  };

  const handleConnect = () => {
    handlers.onConnect?.();
  };

  const handleDisconnect = () => {
    handlers.onDisconnect?.();
  };

  provider.on("accountsChanged", handleAccountsChanged);
  provider.on("connect", handleConnect);
  provider.on("disconnect", handleDisconnect);

  return () => {
    provider.removeListener?.("accountsChanged", handleAccountsChanged);
    provider.removeListener?.("connect", handleConnect);
    provider.removeListener?.("disconnect", handleDisconnect);
  };
}

export const CELO_CHAIN = defineChain({
  ...chainConfig,
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "CELO",
    symbol: "CELO",
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
    public: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Blockscout",
      url: "https://celo-sepolia.blockscout.com",
      apiUrl: "https://celo-sepolia.blockscout.com/api",
    },
  },
  testnet: true,
});
export const CELO_CHAIN_ID = CELO_CHAIN.id;
export const CELO_RPC_URL = getEnvVar("VITE_CELO_RPC_URL") || DEFAULT_CELO_RPC_URL;
export const APP_URL = getEnvVar("VITE_APP_URL") || "http://localhost:5173";
export const WALLETCONNECT_PROJECT_ID = getEnvVar("VITE_WALLETCONNECT_PROJECT_ID");

const baseConnectors = [
  metaMask({
    dappMetadata: {
      name: "LiquidAI",
      url: APP_URL,
    },
  }),
  injected({
    shimDisconnect: true,
    target() {
      const provider = getPreferredInjectedProvider("minipay");
      return {
        id: "minipay",
        name: "MiniPay",
        provider,
      };
    },
  }),
  injected({
    shimDisconnect: true,
    target() {
      const provider = getPreferredInjectedProvider("rabby");
      return {
        id: "rabby",
        name: "Rabby",
        provider,
      };
    },
  }),
  injected({
    shimDisconnect: true,
    target() {
      const provider = getPreferredInjectedProvider("trust");
      return {
        id: "trust",
        name: "Trust Wallet",
        provider,
      };
    },
  }),
  injected({
    shimDisconnect: true,
    target() {
      const provider = getPreferredInjectedProvider("coinbase");
      return {
        id: "coinbase",
        name: "Coinbase Wallet",
        provider,
      };
    },
  }),
  injected({
    shimDisconnect: true,
    target() {
      const provider = getPreferredInjectedProvider();
      return {
        id: resolveInjectedProviderId(provider || {}),
        name: resolveInjectedProviderName(provider || {}),
        provider,
      };
    },
  }),
];

if (WALLETCONNECT_PROJECT_ID) {
  baseConnectors.push(
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      metadata: {
        name: "LiquidAI",
        description: "LiquidAI Treasury OS for Celo",
        url: APP_URL,
        icons: [`${APP_URL}/favicon.ico`],
      },
    }),
  );
}

export const wagmiConfig = createConfig({
  // Enable EIP-6963 discovery so multiple injected wallets can coexist in the UI.
  multiInjectedProviderDiscovery: true,
  chains: [CELO_CHAIN],
  connectors: baseConnectors,
  transports: {
    [CELO_CHAIN_ID]: http(CELO_RPC_URL),
  },
});

export const queryClient = new QueryClient();
