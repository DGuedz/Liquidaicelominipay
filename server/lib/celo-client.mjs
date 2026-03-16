import { createPublicClient, createWalletClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainConfig } from "viem/celo";
import { celo } from "viem/chains";
import { env } from "../config/env.mjs";

const celoSepolia = defineChain({
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
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com",
      apiUrl: "https://celo-sepolia.blockscout.com/api",
    },
  },
  testnet: true,
});

const selectedChain = env.celoChain === "mainnet" ? celo : celoSepolia;

export const celoClient = createPublicClient({
  chain: selectedChain,
  transport: http(env.celoRpcUrl),
});

let walletClient = null;
let walletAccount = null;

if (env.privateKey && env.privateKey.startsWith("0x")) {
  try {
    walletAccount = privateKeyToAccount(env.privateKey);
    walletClient = createWalletClient({
      account: walletAccount,
      chain: selectedChain,
      transport: http(env.celoRpcUrl),
    });
    console.log(`[CeloClient] Wallet configured for ${walletAccount.address}`);
  } catch (error) {
    console.error("[CeloClient] Invalid private key format", error.message);
  }
} else if (env.privateKey) {
  console.warn("[CeloClient] Private key must start with 0x");
}

export const celoWalletClient = walletClient;
export const backendAddress = walletAccount?.address;

export async function getChainHeartbeat() {
  const [blockNumber, block] = await Promise.all([
    celoClient.getBlockNumber(),
    celoClient.getBlock({ blockTag: "latest" }),
  ]);

  return {
    chainId: selectedChain.id,
    blockNumber: blockNumber.toString(),
    blockTimestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
    rpcUrl: env.celoRpcUrl,
    backendAddress,
    chainName: selectedChain.name,
  };
}
