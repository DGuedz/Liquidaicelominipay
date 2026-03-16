import { finalizeSettlement, createConditionalLock } from "../server/services/settlement-service.mjs";
import { env } from "../server/config/env.mjs";

async function main() {
  console.log("🧪 Testing Real Mento Swap Integration...");
  console.log(`Agent Address: ${env.backendAddress}`); // This might be undefined if not exported, let's skip printing address if so.

  // 1. Create Lock
  console.log("1. Creating Settlement Lock (Mento Swap)...");
  const lock = createConditionalLock({
    address: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Dummy user
    amount: 10,
    protocol: "mento",
    actionType: "swap"
  });
  console.log(`   Lock ID: ${lock.settlementId}`);

  // 2. Finalize (Triggers Real Swap Attempt)
  console.log("2. Finalizing Settlement...");
  try {
    const result = await finalizeSettlement({
      address: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      settlementId: lock.settlementId
    });
    
    console.log("\n✅ Settlement Finalized!");
    console.log(`   Status: ${result.status}`);
    console.log(`   Tx Hash: ${result.txHash}`);
    console.log(`   OnChain Proof:`, result.onChainProof);
    
    if (result.txHash && result.onChainProof?.celoDeltaWei === "0") {
        console.log("\n⚠️  Note: Transaction was successful but might be a fallback proof if balance was 0.");
    }
  } catch (error) {
    console.error("\n❌ Settlement Failed:", error.message);
  }
  
  process.exit(0);
}

main();