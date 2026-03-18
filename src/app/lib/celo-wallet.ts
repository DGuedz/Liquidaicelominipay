import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { chainConfig } from "viem/celo";
import { injected, metaMask } from "wagmi/connectors";

const DEFAULT_CELO_RPC_URL = "https://forno.celo-sepolia.celo-testnet.org";
const APP_WALLET_RESET_KEY = "liquidai.wallet-reset";

type InjectedProvider = {
  isMiniPay?: boolean;
  isMetaMask?: boolean;
  providers?: InjectedProvider[];
  request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  _metamask?: {
    isUnlocked?: () => Promise<boolean>;
  };
};

export type WalletMode = "minipay" | "browser";

function getEnvVar(key: "VITE_CELO_RPC_URL" | "VITE_APP_URL"): string {
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

function getInjectedProviderForTarget(targetId?: string): InjectedProvider | null {
  const ethereum = getBrowserEthereum();
  if (!ethereum) return null;

  const providers = Array.isArray(ethereum.providers) && ethereum.providers.length > 0
    ? ethereum.providers
    : [ethereum];

  if (targetId?.toLowerCase().includes("minipay")) {
    return providers.find((provider) => provider?.isMiniPay) ?? null;
  }

  if (targetId?.toLowerCase().includes("meta")) {
    return providers.find((provider) => provider?.isMetaMask) ?? null;
  }

  return providers.find((provider) => provider?.isMiniPay)
    ?? providers.find((provider) => provider?.isMetaMask)
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

export const wagmiConfig = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: [CELO_CHAIN],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "LiquidAI",
        url: APP_URL,
      },
    }),
    injected({
      shimDisconnect: true,
      target() {
        const provider = getPreferredInjectedProvider();
        return {
          id: provider?.isMiniPay ? "minipay" : provider?.isMetaMask ? "metamask" : "injected",
          name: provider?.isMiniPay ? "MiniPay" : provider?.isMetaMask ? "MetaMask" : "Injected Wallet",
          provider,
        };
      },
    }),
  ],
  transports: {
    [CELO_CHAIN_ID]: http(CELO_RPC_URL),
  },
});

export const queryClient = new QueryClient();
