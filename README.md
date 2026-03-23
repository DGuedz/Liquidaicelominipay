# LiquidAI: Autonomous Treasury Infrastructure

[![Built for Celo](https://img.shields.io/badge/Built_for-Celo-FCFF52?style=flat-square&logo=celo&logoColor=black)](https://celo.org/)
[![MiniPay Compatible](https://img.shields.io/badge/MiniPay-Compatible-10B981?style=flat-square)](https://minipay.opera.com/)
[![Self Protocol Identity](https://img.shields.io/badge/Identity-Self_Protocol-8B5CF6?style=flat-square)](https://self.xyz/)
[![AgentScan](https://img.shields.io/badge/AgentScan-ERC--8004-blue?style=flat-square)](https://agentscan.info/)
[![Stack: Viem](https://img.shields.io/badge/Stack-Viem_&_Wagmi-white?style=flat-square)](https://viem.sh/)
[![DeFi: Mento V3](https://img.shields.io/badge/DeFi-Mento_V3-000000?style=flat-square)](https://mento.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray.svg?style=flat-square)](https://opensource.org/licenses/MIT)

LiquidAI is an autonomous treasury infrastructure layer designed to optimize idle stablecoins in high-latency or low-literacy environments. Operating primarily within the Opera MiniPay ecosystem, it relies on strict Zero-Knowledge identity verification (Self Protocol) and deterministic on-chain execution.

## Jury Quick Links

- **Live dApp (Vercel):** https://liquidai-app.vercel.app
- **Demo Video (YouTube):** https://youtu.be/pMjBLznBTvQ
- **Pitch Deck (Google Drive):** https://drive.google.com/file/d/19fUEtTRC5IUodulmQvjdOGb99CuNQPmG/view?usp=sharing
- **Synthesis Submission:** https://synthesis.devfolio.co/projects/faa5281797514ddfa17d950f5c2b102a
- **Synthesis Project UUID:** `faa5281797514ddfa17d950f5c2b102a`
- **Karma Project:** https://www.karmahq.xyz/project/liquidai-odl-agent
- **GitHub Repository:** https://github.com/DGuedz/Liquidaicelominipay
- **X Update Thread:** https://x.com/dg_doublegreen/status/2035746225337639250
- **AgentScan (network index):** https://agentscan.info/

## The A2A (Agent-to-Agent) Execution Model

Our architecture utilizes a multi-agent state machine designed for capital efficiency and absolute operational silence. Human intervention is reduced to cryptographic intent delegation. 

1. **Identity Gate (Sentinel):** Enforces Sybil-resistance via ZK proofs. No transaction is routed without a 1:1 human-to-agent mapping.
2. **Oracle Routing (Vault):** Continuously evaluates state across Celo L2 (Mento/stCelo) to determine the most capital-efficient path for idle assets.
3. **Settlement (Operator):** Secures the execution environment. Uses ERC-4337 style Session Keys to sign and settle intents atomically.

**Economic Efficiency:** By aggregating micro-deposits from the MiniPay ecosystem into systemic liquidity nodes, the protocol achieves high-frequency rebalancing. Value capture occurs naturally at the protocol level through optimized routing and gas abstraction (CIP-64).

---

## Core Features & Hackathon Tracks Alignment

### 1. MiniPay Track (Real-World Payments)
- **Zero Friction Onboarding:** Built with the "3-Tap Rule". No manual wallet connection popups when opened inside the Opera MiniPay app.
- **Gasless Operations (Fee Abstraction):** Users never need native CELO to pay for gas. All agent execution and settlement fees are abstracted and paid in stablecoins (USDm/USDm).
- **Idle Balance Optimization:** Converts static stablecoin balances into dynamic yield strategies while maintaining a "cash buffer" for instant daily payments.

### 2. Best Agent on Celo (Agentic Frameworks & Self Protocol)
- **Mento V3 FX Routing:** The agent natively understands and fetches yields from Mento V3 Fixed-Price Market Makers (FPMMs), acting as an on-chain FX router for USDm, EURm, and other local stables.
- **Sybil Protection (Self Protocol):** To prevent malicious bot executions, the agent is strictly gated by **Self Protocol**. It will only authorize and sign ERC-8004 intents if the user's wallet has a verified Zero-Knowledge Proof of Humanity.

### 3. Highest Rank on AgentScan (ERC-8004 Standard)
- **Trustless Execution:** Instead of operating as a black box, every agent decision is packaged as a transparent Intent.
- **On-Chain Identity:** LiquidAI is officially registered on the Celo Mainnet Identity Registry.
  - **AgentScan Index:** [AgentScan Home](https://agentscan.info/) (project-specific page may depend on index refresh timing)
- **Karma Telemetry:** Execution intents are logged via Karma API for reputation building.

### Hackathon Compliance (Build Agents for the Real World V2 & Synthesis)

**1. Build Agents for the Real World V2 (Celo)**
- **Karma Project:** [LiquidAI (ODL Agent)](https://www.karmahq.xyz/project/liquidai-odl-agent) (Active & Endorsed)
- **AgentScan:** [agentscan.info](https://agentscan.info/) (index status can vary by crawler refresh windows)

**2. Synthesis Hackathon (Bounty Stacking)**
- 🪪 **Self Protocol (Best Agent Identity Integration):** LiquidAI implements a rigorous Zero-Knowledge (ZK) "Kill Switch". The backend agent (`Sentinel`) strictly refuses to sign or execute any on-chain transaction unless the user wallet holds a valid, active Proof-of-Humanity session from the Self App. Zero PII is leaked. 1:1 Human-to-Agent mapping enforced.
- 🦊 **MetaMask (Programmable Spending Permissions):** Our backend `Operator` agent leverages Session Keys (ERC-4337 style delegation) tied to the user's MetaMask/MiniPay wallet. Users grant a programmable spending permission for the agent to autonomously move idle stablecoins into Yield protocols (Mento/stCelo), with risk modes and absolute limits controlled via the UI.
- 🦄 **On-chain Value Movement:** The core engine acts as a Treasury OS, automatically locking/releasing USDm/cUSD into DeFi protocols with atomic settlements and gas abstraction (CIP-64).

---

## Wallet Connectivity (EVM L2)

LiquidAI uses `wagmi + viem` connectors to support browser and mobile wallets on Celo Sepolia:
- MiniPay (in-app injected provider)
- MetaMask / Rabby / Trust / Coinbase Wallet extension (injected providers)
- WalletConnect v2 (mobile wallets, including Trust/Rainbow/BitPay/Ledger flows)

### Required env for WalletConnect

If `VITE_WALLETCONNECT_PROJECT_ID` is missing, WalletConnect is disabled and only injected wallets will be available.

1. Create a project at [Reown Cloud](https://cloud.reown.com).
2. Add the project id to your env:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

3. Restart the frontend dev server.

### Wallet Session Security

- Wallet auth sessions are set by the backend as `httpOnly` cookies.
- The frontend no longer persists auth tokens in `localStorage`.
- Connection is blocked on untrusted hostnames unless they are allow-listed via:

```bash
VITE_ALLOWED_APP_HOSTS=localhost,127.0.0.1,app.liquidai.ai,liquidai.ai
```

- For Vercel preview domains (`*.vercel.app`), set:

```bash
VITE_ALLOW_VERCEL_PREVIEW=true
```

---

## Technical Evidence & On-Chain Proofs

LiquidAI architecture has been fully verified and deployed on-chain:

**1. Zero-Knowledge Proof of Humanity (Self Protocol)**
No autonomous transaction is executed without cryptographic proof that the wallet owner is a verified human.
- **Tested Wallet:** `0xD93B0A6BdF9C53717B2aE9890d2B21969fBa9fC7`
- **Verification Status:** `verified: true`, `mode: "agent"`

**2. Trustless Agent Execution (ERC-8004)**
The agent's decision-making is logged following the ERC-8004 standard, and executed using Gas Abstraction.
- **Agent Identity Registry:** `0xf8024Db04E64298B9BF89A1D4D0cc1D3F13E34a7`
- **Successful Intent Cycle (`authorize -> settlement`):** 
  - Status: `settled`
  - On-chain Proof: [View Transaction on Blockscout](https://celo-sepolia.blockscout.com/tx/0x02b13320d81fd71c323684010407f7658a9f299c7313a7044b5daf90164fed54)

---

## Roadmap

- **Q1:** MiniPay-native agent, stablecoin fee abstraction, session/auth shielding (Self Protocol), liquidity map.
- **Q2:** Deep Mento V3 routing, BRLm/USDm/EURm intelligence, route scoring and FPMM dynamic spreads.
- **Q3:** LP management with reward overlay (Merkl/Steer) and slippage-aware routing.
- **Q4:** Card/PIX off-ramp integration, buffer manager, and collateralized credit lines.
- **Vision (Deep Tech): ZK-Shielded Treasury.** Evolution towards a compliant "Private Computer" architecture inside the Celo EVM. By migrating from an account-based model to a ZK-encrypted UTXO state machine (inspired by protocols like Railgun), LiquidAI replaces public balances with opaque "notes". The EVM only sees commitments and nullifiers. This enables A2A Dark Pools and Proof of Innocence for seamless fiat on/off-ramps without compromising user privacy. 
  - 📖 **Read the Blueprint:** [ZK-Shielded Architecture](docs/ZK_SHIELD_ARCHITECTURE.md)
  - 🛠️ **Read the Execution Plan:** [ZK Implementation Plan](docs/ZK_IMPLEMENTATION_PLAN.md)
  - 💰 **Read the Business Case:** [Revenue Model & Projections](docs/REVENUE_MODEL_PROJECTIONS.md)
  - 🔐 **Read Wallet + Self Execution Plan:** [Wallet + Self Plan](docs/WALLET_SELF_EXECUTION_PLAN.md)
  - 🚀 **Read Release Runbook (Wallet + Self):** [Wallet + Self Release Runbook](docs/WALLET_SELF_RELEASE_RUNBOOK.md)
