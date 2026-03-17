# 🌊 LiquidAI | The Treasury OS for Web3 Wallets
**Transforming static stablecoin balances into an autonomous, yield-generating economy.**

[![Built for MiniPay](https://img.shields.io/badge/Built_for-MiniPay-10B981?style=for-the-badge)](https://minipay.opera.com/)
[![Network Celo Alfajores](https://img.shields.io/badge/Network-Celo_Alfajores-06B6D4?style=for-the-badge)](https://celo.org/)
[![Identity Self ZK](https://img.shields.io/badge/Identity-Self_ZK-EC4899?style=for-the-badge)](https://ai.self.xyz)
[![Standard ERC-8004 Intents](https://img.shields.io/badge/Standard-ERC--8004_Intents-F59E0B?style=for-the-badge)](https://8004scan.io/)

---

## 🎯 The Strategic Gap (Our Thesis)

In emerging markets (Africa, LatAm), millions are adopting stablecoins to escape hyperinflation. Wallets like **MiniPay** have brilliantly solved the "Access" and "P2P Transfer" problems. 

However, a massive bottleneck remains: **Capital Efficiency.**
Currently, a user's $50 cUSD sits idle. It doesn't grow. It doesn't fight the ~3% inherent USD inflation. And because it's static, users treat the wallet as a *transit layer* (cash-in -> transfer -> cash-out), draining the ecosystem's Total Value Locked (TVL).

DeFi solves this, but DeFi is fundamentally broken for the next billion users. It requires understanding APYs, Impermanent Loss, bridging, and gas fees. 

## 💡 The Solution: Agentic Treasury OS

**LiquidAI is not just a dApp; it's an infrastructure layer.** We upgrade static wallets into autonomous treasuries. 

Through our **Agentic Intent Abstraction (AIA)**, the user simply toggles "Earn". That's it. 
Behind the scenes, our AI Agent:
1. Keeps a "Liquid Buffer" for daily instant payments.
2. Routes idle capital to institutional-grade DeFi on Celo (Mento, Aave).
3. Auto-rebalances based on market conditions and user spending habits.

**The result?** Users earn 4-8% APY silently. They keep their money inside the ecosystem longer (increasing TVL and retention), and the wallet evolves from a simple ledger into an autonomous wealth manager.

---

## 🚀 The "Unmatched Skill" (Our Differentiator)

Most hackathon projects build basic CRUD interfaces for smart contracts. **LiquidAI introduces a paradigm shift in Web3 architecture that no other project possesses:**

### 🛡️ ZK-Gated Autonomous Execution (Self Protocol + AI Agent)
We are the first to combine **Zero-Knowledge Proofs of Humanity** with **Delegated Agentic Execution**. 
1. The user proves they are a unique human via **Self Protocol**.
2. This proof mints an *ephemeral, scoped session key* (ERC-4337 style).
3. The AI Agent uses this key to execute complex, multi-step DeFi routing (e.g., cUSD -> Mento Swap -> Aave Supply) *on behalf of the user*, without prompting them for 15 MetaMask signatures.

**We didn't just abstract gas (Fee Abstraction); we abstracted the decision-making process itself.**

---

## 💼 Grounded Business Model (The "Real World" Play)

We are building a sustainable business, not a token-farm.

*   **B2C (The Hackathon Demo):** Free to use. LiquidAI takes a **10% performance fee on the generated yield** (not the principal). If the agent makes the user $10, we keep $1. Total alignment of incentives.
*   **B2B2C (The Post-Hackathon Vision):** LiquidAI as an **Infrastructure-as-a-Service (IaaS)**. We provide our SDK/API to massive consumer wallets (like Opera's MiniPay). They integrate our "Earn Module" natively, instantly boosting their user retention and creating a new revenue-share stream for the wallet provider.

---

## 🛠️ Technical Architecture & Hackathon Alignment

1. **Build for MiniPay:** 100% Mobile-first UI, responsive simulator for desktop, implicit wallet detection (`window.ethereum.isMiniPay`), and zero gas friction.
2. **Best Agent on Celo:** A determinist financial agent that creates execution plans, respects strict risk policies, and automates Treasury Management.
3. **Highest Rank on AgentScan:** Fully compliant with **ERC-8004**. Every liquidity optimization logs a "Proof-of-Ship" attestation to the **Karma Protocol** to build on-chain agent reputation.

---

## 🏃‍♂️ How to Run Locally (MiniPay Environment)

LiquidAI is built to be tested natively inside the MiniPay ecosystem using the Celo Alfajores Testnet.

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Ensure your `.env.local` is set with your Karma and RPC keys (see `.env.example`).

### 3. Start the Development Server
```bash
npm run dev
# In another terminal, expose the server via ngrok:
ngrok http 5173
```

### 4. Test in MiniPay (The Intended Way)
1. Open the **Opera Mini Beta** app on your phone.
2. Go to MiniPay Settings -> About -> Tap "Version" repeatedly to enable **Developer Mode**.
3. Toggle **Use Testnet (Alfajores)**.
4. Tap **Load Test Page** and paste your `ngrok` HTTPS URL (or our live Vercel link: `https://liquidai-app.vercel.app`).
5. Experience the autonomous treasury.

---

<p align="center">
  LiquidAI - Agentic Treasury OS © 2026 by doublegreen is licensed under 
  <a href="https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">
    CC BY 4.0
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="">
  </a>
</p>