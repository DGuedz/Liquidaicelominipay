import { createWalletClient, http, defineChain, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const celoSepolia = defineChain({
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
  },
});

async function main() {
  const treasuryKey = process.env.PRIVATE_KEY;
  const adminKeyRaw = process.env.ADMIN_PRIVATE_KEY;

  if (!treasuryKey || !adminKeyRaw) {
    console.error("❌ As chaves PRIVATE_KEY ou ADMIN_PRIVATE_KEY não foram encontradas no .env.local");
    process.exit(1);
  }

  // A Wagmi/Viem exige que chaves privadas comecem com '0x'
  const adminKey = adminKeyRaw.startsWith("0x") ? adminKeyRaw : `0x${adminKeyRaw}`;

  const treasuryAccount = privateKeyToAccount(treasuryKey);
  const adminAccount = privateKeyToAccount(adminKey);

  console.log(`🏦 Treasury Wallet (Backend): ${treasuryAccount.address}`);
  console.log(`👤 Admin Wallet (Sua MetaMask): ${adminAccount.address}`);

  const client = createWalletClient({
    account: treasuryAccount,
    chain: celoSepolia,
    transport: http()
  });

  const amount = parseEther("0.1"); // Enviando 0.1 CELO

  console.log(`\n💸 Transferindo 0.1 CELO de teste da Treasury para a Admin Wallet...`);
  
  try {
    const hash = await client.sendTransaction({
      to: adminAccount.address,
      value: amount,
    });
    console.log(`✅ Sucesso! Transação enviada.`);
    console.log(`🔗 Hash: https://celoscan.io/tx/${hash}`);
    console.log(`\nAgora sua carteira ${adminAccount.address} tem fundos para pagar a taxa do AgentScan!`);
  } catch (error) {
    console.error("❌ Erro ao enviar a transação:", error.message);
  }
}

main();