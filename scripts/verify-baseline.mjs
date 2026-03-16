
import { createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";

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

const API_URL = "http://localhost:8787/api";
const BASELINE_TX_HASH = "0x4f032682e7eb17e7a2742dea9b58e83c552916266732ad4552e8a184ee32f0c0";

// Read PK from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let PRIVATE_KEY;

try {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/PRIVATE_KEY=(0x[a-fA-F0-9]+)/);
  if (match) {
    PRIVATE_KEY = match[1];
  } else {
    console.error("❌ PRIVATE_KEY not found or invalid format in .env.local");
    process.exit(1);
  }
} catch (e) {
  console.error("❌ Could not read .env.local");
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createWalletClient({
  account,
  chain: celoSepolia,
  transport: http()
});

async function authenticate() {
  console.log("🔐 Authenticating...");
  
  // 1. Get Challenge
  const challengeRes = await fetch(`${API_URL}/auth/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: account.address })
  });
  const challengeData = await challengeRes.json();
  if (!challengeData.ok) throw new Error("Failed to get challenge");
  
  const { nonce, message } = challengeData.data;
  
  // 2. Sign Challenge
  const signature = await client.signMessage({ message });
  
  // 3. Verify & Get Token
  const verifyRes = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: account.address,
      nonce,
      signature
    })
  });
  
  const verifyData = await verifyRes.json();
  if (!verifyData.ok) throw new Error("Failed to verify signature");
  
  return verifyData.data.token;
}

async function run() {
  console.log("❄️  Freezing Flow: Baseline Test Verification");
  console.log(`   Wallet: ${account.address}`);
  console.log("-------------------------------------------");

  const token = await authenticate();
  console.log("✅ Authenticated!");

  // 1. Create Settlement Lock (Intent)
  console.log("\n1. Creating Settlement Intent...");
  const lockRes = await fetch(`${API_URL}/settlement/lock`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      address: account.address,
      amount: 1, 
      protocol: "agent",
      actionType: "authorize_action"
    })
  });
  
  const lockData = await lockRes.json();
  if (!lockData.ok) {
    console.error("❌ Failed to create lock:", lockData);
    process.exit(1);
  }
  
  const { settlementId } = lockData.data;
  console.log(`   ✅ Lock Created: ${settlementId}`);

  // 2. Finalize with Manual TxHash (The "Plug")
  console.log("\n2. Finalizing with Baseline TxHash...");
  const finalizeRes = await fetch(`${API_URL}/settlement/finalize`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      address: account.address,
      settlementId,
      manualTxHash: BASELINE_TX_HASH
    })
  });

  const finalizeData = await finalizeRes.json();
  if (!finalizeData.ok) {
    console.error("❌ Failed to finalize:", finalizeData);
    process.exit(1);
  }

  const result = finalizeData.data;
  
  console.log("   ✅ Settlement Finalized!");
  console.log("   --------------------------------");
  console.log(`   Status:       ${result.status}`);
  console.log(`   TxHash:       ${result.txHash}`);
  
  // Verify OnChainProof details
  if (result.onChainProof) {
    console.log(`   Receipt:      ${result.onChainProof.receiptStatus}`);
    console.log(`   FeeCurrency:  ${result.onChainProof.feeCurrency}`);
  } else {
    console.log("   Receipt:      Pending/None");
  }
  
  if (result.txHash === BASELINE_TX_HASH) {
    console.log("\n✨ SUCCESS: Baseline flow verified and frozen.");
  } else {
    console.error("\n❌ ERROR: TxHash mismatch!");
  }
}

run().catch(console.error);
