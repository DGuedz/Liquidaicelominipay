import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { chainConfig } from "viem/celo";
import { injected, metaMask } from "wagmi/connectors";

const DEFAULT_CELO_RPC_URL = "https://forno.celo-sepolia.celo-testnet.org";

type InjectedProvider = {
  isMiniPay?: boolean;
  isMetaMask?: boolean;
  providers?: InjectedProvider[];
  request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

function getEnvVar(key: "VITE_CELO_RPC_URL"): string {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : "";
}

function getBrowserEthereum(): InjectedProvider | null {
  if (typeof window === "undefined") return null;
  const ethereum = (window as Window & { ethereum?: InjectedProvider }).ethereum;
  return ethereum ?? null;
}

export function getPreferredInjectedProvider(): InjectedProvider | null {
  const ethereum = getBrowserEthereum();
  if (!ethereum) return null;

  const providers = Array.isArray(ethereum.providers) && ethereum.providers.length > 0
    ? ethereum.providers
    : [ethereum];

  return providers.find((provider) => provider?.isMiniPay)
    ?? providers.find((provider) => provider?.isMetaMask)
    ?? providers[0]
    ?? null;
}

export function isMiniPayEnvironment() {
  return Boolean(getPreferredInjectedProvider()?.isMiniPay);
}

export async function requestPreferredAccounts() {
  const provider = getPreferredInjectedProvider();
  if (!provider?.request) return [];
  const result = await provider.request({ method: "eth_requestAccounts" });
  return Array.isArray(result) ? result : [];
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
      http: [DEFAULT_CELO_RPC_URL],
    },
    public: {
      http: [DEFAULT_CELO_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com",
      apiUrl: "https://celo-sepolia.blockscout.com/api",
    },
  },
  testnet: true,
});
export const CELO_CHAIN_ID = CELO_CHAIN.id;
export const CELO_RPC_URL = getEnvVar("VITE_CELO_RPC_URL") || DEFAULT_CELO_RPC_URL;

export const wagmiConfig = createConfig({
  chains: [CELO_CHAIN],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "LiquidAI",
        url: "http://localhost:5173",
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
