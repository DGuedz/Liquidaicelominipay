import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";

// Endereço do backend local
const API_URL = "http://localhost:8787/api";

// Chave privada TEMPORÁRIA apenas para este teste (cliente simulado)
// Em produção, isso viria da MiniPay/Opera wallet do usuário
// Use uma chave de teste segura (ex: Anvil #0) via variável de ambiente ou gere uma nova
const MOCK_USER_PK = process.env.TEST_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 
const userAccount = privateKeyToAccount(MOCK_USER_PK);

if (!process.env.TEST_PRIVATE_KEY) {
  console.warn("⚠️  Aviso: Usando chave de teste pública (Anvil #0). NÃO use em Mainnet!");
}

console.log("🌊 LiquidAI E2E Test: Agent Authorization Flow (Testnet)");
console.log("-------------------------------------------------------");
console.log(`👤 User Address: ${userAccount.address}`);
console.log(`🌐 Target API:   ${API_URL}`);

async function runTest() {
  try {
    // 1. Simular Login / Obter Sessão
    console.log("\n1. 🔐 Authenticating...");
    const challengeRes = await fetch(`${API_URL}/auth/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: userAccount.address }),
    });
    const challenge = await challengeRes.json();
    
    if (!challenge.ok) throw new Error("Challenge failed");
    console.log("   Challenge received:", challenge.data.message);

    const signature = await userAccount.signMessage({ message: challenge.data.message });
    
    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: userAccount.address,
        nonce: challenge.data.nonce,
        signature,
      }),
    });
    const session = await verifyRes.json();
    if (!session.ok) throw new Error("Auth failed");
    
    const token = session.data.token;
    console.log("   ✅ Authenticated! Token received.");

    // 1.5. Simular Verificação Self (Mock) para passar na barreira Anti-Sybil
    console.log("\n1.5. 🛡️  Simulating Self Protocol Verification...");
    const selfRes = await fetch(`${API_URL}/self/start-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ address: userAccount.address })
    });
    const selfData = await selfRes.json();
    if (!selfData.ok) throw new Error("Self mock start failed");
    
    // Complete the mock flow
    const pollRes = await fetch(`${API_URL}/self/poll-registration?address=${userAccount.address}&sessionToken=${selfData.data.sessionToken}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const pollData = await pollRes.json();
    if (!pollData.ok || !pollData.data.verified) throw new Error("Self mock verification failed");
    
    console.log("   ✅ Self Mock session completed (bypasses gate for demo).");

    // 2. Autorizar Ação do Agente (Simulando clique no frontend)
    console.log("\n2. 🤖 Authorizing Agent Action...");
    const authRes = await fetch(`${API_URL}/agent/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        address: userAccount.address,
        actionId: 101, // ID fictício de uma ação pendente
        accepted: true
      }),
    });
    
    const authResult = await authRes.json();
    console.log("   Response:", JSON.stringify(authResult, null, 2));

    if (authResult.ok && authResult.data.settlement) {
      console.log("\n   ✅ Settlement Lock Created & Finalized!");
      console.log(`   Settlement ID: ${authResult.data.settlement.id}`);
      console.log(`   Status:        ${authResult.data.settlement.status}`);
      console.log(`   Hash:          ${authResult.data.settlement.hash}`);
      
      // O backend dispara o txHash de forma assíncrona, então vamos consultar o status
      // após alguns segundos para ver se o txHash aparece
      console.log("\n3. ⏳ Waiting for On-Chain Proof (5s)...");
      await new Promise(r => setTimeout(r, 5000));
      
      const statusRes = await fetch(`${API_URL}/settlement/${authResult.data.settlement.id}`);
      const statusData = await statusRes.json();
      
      console.log("   Settlement Status Update:");
      console.log(JSON.stringify(statusData, null, 2));
      
      if (statusData.data && statusData.data.txHash) {
        console.log(`\n🎉 SUCCESS! On-Chain Proof TX: https://alfajores.celoscan.io/tx/${statusData.data.txHash}`);
      } else {
        console.log("\n⚠️  TX Hash not yet available (might be pending or wallet has no funds). Check backend logs.");
      }

    } else {
      console.error("❌ Authorization failed or returned unexpected structure.");
    }

  } catch (error) {
    console.error("❌ Test Failed:", error.message);
  }
}

runTest();
