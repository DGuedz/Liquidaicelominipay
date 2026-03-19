import { createWalletClient, http, defineChain, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] } },
});

const USDM_SEPOLIA = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b"; // USDm address used by LiquidAI

const erc20Abi = [
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  }
];

async function fundTestWallet() {
  const treasuryKey = process.env.PRIVATE_KEY;
  const adminKeyRaw = process.env.ADMIN_PRIVATE_KEY;

  if (!treasuryKey || !adminKeyRaw) {
    console.error("❌ Chaves não encontradas no .env.local");
    return;
  }

  const adminKey = adminKeyRaw.startsWith("0x") ? adminKeyRaw : `0x${adminKeyRaw}`;
  const adminAccount = privateKeyToAccount(adminKey);

  // Forçando o envio da Admin (que tem $17) para a carteira específica do MiniPay (0xD93B...)
  const testWalletAddress = "0xD93B0A6BdF9C53717B2aE9890d2B21969fBa9fC7";

  const client = createWalletClient({
    account: adminAccount,
    chain: celoSepolia,
    transport: http()
  });

  const amountUsd = "17.0"; // Enviando os 17 dólares que estão na MetaMask
  const amountToTransfer = parseUnits(amountUsd, 18);

  console.log("========================================");
  console.log("🚰 FORÇANDO DEPÓSITO PARA CARTEIRA DO MINIPAY");
  console.log("========================================\n");
  console.log(`De: Admin MetaMask (${adminAccount.address})`);
  console.log(`Para: Carteira MiniPay (${testWalletAddress})`);
  console.log(`Valor: $${amountUsd} USDm\n`);

  try {
    const hash = await client.writeContract({
      address: USDM_SEPOLIA,
      abi: erc20Abi,
      functionName: "transfer",
      args: [testWalletAddress, amountToTransfer]
    });
    
    console.log(`✅ Sucesso! Transação enviada.`);
    console.log(`🔗 Hash: https://celo-sepolia.blockscout.com/tx/${hash}`);
    console.log(`\nAgora você pode abrir o App no MiniPay com a carteira ${testWalletAddress} e verá $${amountUsd} no painel!`);
  } catch (error) {
    console.error("❌ Erro ao enviar a transação:", error.message);
  }
}

fundTestWallet();