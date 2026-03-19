import { createPublicClient, http, defineChain, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const celoMainnet = defineChain({
  id: 42220,
  name: "Celo Mainnet",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: { default: { http: ["https://forno.celo.org"] } },
});

const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] } },
});

const mainnetClient = createPublicClient({ chain: celoMainnet, transport: http() });
const sepoliaClient = createPublicClient({ chain: celoSepolia, transport: http() });

// O contrato do USDm na Sepolia
const USDm_SEPOLIA = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Legacy USDm address or USDm depending on config
// O contrato do USDm na Sepolia (usado no nosso app)
const USDM_SEPOLIA = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  }
];

async function checkBalances() {
  const treasuryKey = process.env.PRIVATE_KEY;
  const adminKeyRaw = process.env.ADMIN_PRIVATE_KEY;

  if (!treasuryKey || !adminKeyRaw) {
    console.error("❌ Chaves não encontradas no .env.local");
    return;
  }

  const adminKey = adminKeyRaw.startsWith("0x") ? adminKeyRaw : `0x${adminKeyRaw}`;
  const treasuryAccount = privateKeyToAccount(treasuryKey);
  const adminAccount = privateKeyToAccount(adminKey);

  console.log("========================================");
  console.log("💰 LEVANTAMENTO DE CAPITAL (LIQUIDAI)");
  console.log("========================================\n");

  const accounts = [
    { name: "Treasury Wallet (Backend)", address: treasuryAccount.address },
    { name: "Admin Wallet (MetaMask)", address: adminAccount.address }
  ];

  for (const acc of accounts) {
    console.log(`👤 ${acc.name}`);
    console.log(`   Endereço: ${acc.address}`);

    // Mainnet
    const mainnetCelo = await mainnetClient.getBalance({ address: acc.address });
    
    // Sepolia
    const sepoliaCelo = await sepoliaClient.getBalance({ address: acc.address });
    
    // Stablecoins na Sepolia
    let sepoliaUsdm = 0n;
    try {
      sepoliaUsdm = await sepoliaClient.readContract({
        address: USDM_SEPOLIA,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [acc.address]
      });
    } catch (e) { /* ignore */ }

    console.log(`   🌐 CELO (Mainnet): ${formatEther(mainnetCelo)} CELO`);
    console.log(`   🧪 CELO (Sepolia): ${formatEther(sepoliaCelo)} CELO`);
    console.log(`   💵 USDm (Sepolia): ${formatEther(sepoliaUsdm)} USDm`);
    console.log("----------------------------------------");
  }
}

checkBalances();