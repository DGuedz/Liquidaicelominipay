# 🌊 LiquidAI | Agentic Treasury OS
**Transforming idle capital into an autonomous Micro-AMM on Celo.**

[![Built for MiniPay](https://img.shields.io/badge/Built_for-MiniPay-10B981?style=for-the-badge)](https://minipay.opera.com/)
[![Network Celo Alfajores](https://img.shields.io/badge/Network-Celo_Alfajores-06B6D4?style=for-the-badge)](https://celo.org/)
[![Identity Self ZK](https://img.shields.io/badge/Identity-Self_ZK-EC4899?style=for-the-badge)](https://ai.self.xyz)
[![Standard ERC-8004 Intents](https://img.shields.io/badge/Standard-ERC--8004_Intents-F59E0B?style=for-the-badge)](https://8004scan.io/)

LiquidAI is an autonomous financial infrastructure designed for the real economy in emerging markets. It acts as an **Invisible DeFi Orchestrator**, automatically routing idle stablecoin balances into yield-bearing strategies (like stCELO and Aave) and executing Just-In-Time (JIT) liquidity swaps via Mento Protocol when payments are due.

**Built for the "Build Agents for the Real World V2" Hackathon.**

---

## 🏆 Hackathon Tracks Targeted

1. **Build for MiniPay:** 100% Mobile-first UI, bundle size < 2MB, implicit wallet detection (`window.ethereum.isMiniPay`), and zero gas friction (Fee Abstraction via cUSD).
2. **Best Agent on Celo:** Not just a chatbot, but a determinist financial agent that creates execution plans, respects strict risk policies, and automates Treasury Management.
3. **Highest Rank on AgentScan:** Fully compliant with **ERC-8004**. Every liquidity optimization generates a unique `intentId` and logs a "Proof-of-Ship" attestation to the **Karma Protocol** to build on-chain agent reputation.

---

## 🧠 The "Invisible DeFi" Architecture

LiquidAI hides the complexity of Web3 behind a "3-Tap Rule" UX, while leveraging an institutional-grade backend:

*   **Fee Abstraction (cUSD Gasless):** Users never need native CELO. Our Viem/Wagmi implementation forces `feeCurrency` to cUSD for all operations.
*   **Self Protocol Anti-Sybil Gate:** Autonomous session keys (ERC-4337) are strictly gated. The backend only provisions agent control after verifying the user's Zero-Knowledge Proof of humanity via the `@selfxyz/agent-sdk`.
*   **Mento Broker & SortedOracles:** The agent consults Celo's native `SortedOracles` to prevent price manipulation and uses Mento's `getAmountOut` for atomic, low-slippage swaps.
*   **Karma Ledger (Proof-of-Ship):** Every successful rebalance or yield harvest triggers our `karma-service.mjs`, permanently logging the agent's economic efficiency and updating its reputation score.

---

## 🚀 How to Run locally (Testnet-First)

LiquidAI is built to be tested natively inside the MiniPay environment using the Celo Alfajores Testnet.

### 1. Installation
```bash
git clone https://github.com/your-org/liquid-ai.git
cd liquid-ai
npm install
```

### 2. Environment Variables (`.env.local`)
Copy `.env.example` to `.env.local` and add your Alfajores testnet keys:
```env
NEXT_PUBLIC_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
PRIVATE_KEY=0x... # (Used strictly in the backend KMS for Session Keys)
NEXT_PUBLIC_KARMA_ENDPOINT=https://api.karma.xyz/v1/attestations
```

### 3. Start the Development Server & Tunnel
```bash
npm run dev
# In another terminal, expose the server for MiniPay testing:
ngrok http 3000
```

### 4. Test in MiniPay (Android Emulator or Physical Device)
1. Open the **Opera Mini Beta** app.
2. Go to MiniPay Settings -> About -> Tap "Version" repeatedly to enable **Developer Mode**.
3. Toggle **Use Testnet (Alfajores)**.
4. Tap **Load Test Page** and paste your `ngrok` HTTPS URL.
5. Experience LiquidAI natively!

---

## 🗺️ Post-Hackathon Vision: "Yield-Backed Banking"

We didn't just build a hackathon project; we built the liquidity engine for the next generation of Neo-banks on Celo.

*   **Q2 2026:** **BaaS & Real-World Ramps:** Direct PIX/Fiat routing to Celo via Mento and Daimo SDK.
*   **Q3 2026:** **LiquidAI Physical Card:** Swipe a card in the real world; the agent uses Just-In-Time (JIT) `remove_liquidity` to pay for coffee using your yield.
*   **Q4 2026:** **Collateralized Credit Engine:** Use idle productive capital (stCELO/Aave) to issue instant, low-interest credit lines using Untangled Finance (RWA).

---
*Built with ⚡️ (and Extreme Programming) by the LiquidAI Team.*
