# LiquidAI: Agentic Treasury OS for MiniPay

[![Built for Celo](https://img.shields.io/badge/Built_for-Celo-10B981?style=flat-square&logo=celo&logoColor=white)](https://celo.org/)
[![MiniPay Compatible](https://img.shields.io/badge/MiniPay-Compatible-FFCC00?style=flat-square)](https://minipay.opera.com/)
[![Self Protocol Identity](https://img.shields.io/badge/Identity-Self_Protocol-8B5CF6?style=flat-square)](https://self.xyz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**LiquidAI is an AI liquidity agent built for MiniPay users on Celo.** It acts as an autonomous treasury manager that protects value, routes FX on-chain via Mento V3, optimizes liquidity pools (LP), and maintains instant liquidity for everyday spending.

By abstracting the complexity of AMMs, fee structures, and bridge routing, LiquidAI delivers a simple, natural-language experience: protecting idle balances against inflation while generating yield, all powered by Celo's fast, low-cost L2 architecture and fee abstraction.

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
  - **AgentScan Profile:** [LiquidAI (Agent #2729)](https://agentscan.info/agents/celo/2729)
- **Karma Telemetry:** Execution intents are logged via Karma API for reputation building.

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