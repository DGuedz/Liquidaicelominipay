# LiquidAI: ZK-Shielded Treasury Architecture

This document outlines the technical blueprint for the "Phase 3: ZK-Shielded Treasury" of LiquidAI, taking inspiration from EVM-native privacy protocols (like Railgun) and adapting them for the Celo / MiniPay ecosystem.

## 1. The Core Metaphor: The Private Computer
Ethereum (and Celo) operates as a public state machine. Every transaction, balance, and state transition is visible. 
LiquidAI's Phase 3 introduces a **Private Computer** running *inside* the public EVM. 

Technically, this is an encrypted UTXO (Unspent Transaction Output) state machine encapsulated within a smart contract on Celo. The public EVM validates that the private computer is operating correctly (via Zero-Knowledge Proofs) without ever seeing *what* is being processed.

## 2. EVM Account Model vs. Shielded UTXO Model

### The Public EVM (Account Model)
- **State:** Each address has a balance.
- **Transition:** Transactions debit sender and credit receiver.
- **Visibility:** Balances and transitions are 100% public.

### The LiquidAI Shielded Pool (UTXO Model)
- **State:** There are no balances, only **Notes**.
- **Notes:** Each note represents a specific amount of a specific token (e.g., cUSD, BRLm), encrypted for a specific recipient.
- **Transition:** Operations consume existing notes (Nullifiers) and create new notes (Commitments).
- **Visibility:** The EVM only sees cryptographic commitments and nullifiers—opaque structures that prove validity without revealing the token type, amount, sender, or receiver.

## 3. The Lifecycle of Capital in LiquidAI

### A. Shielding (The On-Ramp)
1. User sends a standard Celo transaction depositing tokens (e.g., 100 BRLm) into the LiquidAI Shield Contract.
2. The user's wallet generates a cryptographic `Commitment` containing the encrypted note data.
3. The contract escrows the public tokens and appends the `Commitment` to the private UTXO Merkle Tree.
4. **Result:** The public link is broken. The user now holds an invisible UTXO note.

### B. Internal Transfers & A2A Dark Pools (The Swap)
1. User A wants to swap 100 Shielded USDm for Shielded BRLm with User B (or the Agent Dark Pool).
2. The user generates a ZK-SNARK proof locally on their device (MiniPay/Wallet).
3. The proof asserts: "I own valid unspent notes, I am destroying them (publishing `Nullifiers`), and I am creating new notes (`Commitments`) for the recipient, and the sum of inputs equals the sum of outputs."
4. The smart contract verifies the ZK-Proof. If valid, it updates the Merkle Tree.
5. **Result:** Zero slippage, zero MEV front-running, zero public metadata.

### C. Unshielding (The Off-Ramp / PIX)
1. User wants to withdraw funds via PIX.
2. User generates a ZK-Proof destroying their Shielded Note (`Nullifier`) and instructing the contract to send the public tokens to the designated Off-Ramp address (e.g., the Fiat Gateway).
3. **Result:** The Off-Ramp receives the funds and executes the PIX. The public network sees the withdrawal, but cannot link it to the user's historical shielded activity or total shielded balance.

## 4. Rules of Engagement: When to use and when NOT to use

Understanding the boundaries of ZK-Privacy is crucial for positioning LiquidAI correctly. We do not sell "magical anonymity", we sell **architectural privacy**.

### The Exposure Matrix (Unshielding)
When a user executes an *Unshield* (e.g., sending funds from the Shielded Pool to a PIX gateway), the following metadata dynamics apply:
- 👁️ **VISIBLE to the Public EVM:** Destination address, Value, Token type, Timestamp.
- 🥷 **HIDDEN by ZK Proofs:** Who originated the transaction, which specific UTXO Note was consumed, and the internal transaction history of that capital.

### ✅ When to USE the Shielded Engine:
- **Untraceable Transfers:** When you need to move value between addresses without creating a public link.
- **Protocol-Agnostic DeFi:** When you want to interact with AMMs (Mento) or lending pools without linking your personal wallet history to those protocols.
- **Fund Separation:** When you want to separate new yields from your past on-chain history without leaving the EVM ecosystem.
- **Auditable Custody:** When you need to provide audit access (via Viewing Keys) to regulators/accountants without giving up custody or keys.

### 🚫 When NOT to use (The Limitations):
- **Pre-existing Identity Links:** If the origin of the funds is already linked to your identity (e.g., a direct KYC'd exchange withdrawal), the protocol *does not erase the past*. It only protects what happens *after* the funds are shielded.
- **Network-Level Anonymity:** ZK Proofs do not hide IP addresses. Users requiring total operational security must combine LiquidAI with network-level tools (VPNs/Tor).
- **Poor Operational Hygiene:** Reusing the same public address for multiple unshields can create metadata correlations that break the privacy set.

## 5. The "Digital Offshore" Thesis (GTM Strategy)
To ensure LiquidAI remains compliant with global regulations while maintaining privacy:
- The system integrates **Proof of Innocence**.
- Users can mathematically prove (via ZK) that their shielded notes did *not* originate from a known list of sanctioned or hacked addresses.
- Users can generate **Viewing Keys** to selectively reveal their transaction history to auditors or Off-Ramps, maintaining self-sovereignty over their financial data.

### The Validation Path: Retail to Institutional
LiquidAI's architecture inherently creates a "Digital Offshore" environment. By shielding capital in a compliant manner, it mimics the privacy and asset protection of an offshore jurisdiction, but executed entirely via cryptography on Celo.

1. **Step 1: Retail Validation (The Trojan Horse)**
   - We deploy first to the MiniPay ecosystem. 
   - **Why?** Retail users need protection from local inflation and predatory banking fees. We use the narrative of "Yield-Backed Banking" to acquire users. The privacy layer acts as a silent guardian, protecting them from MEV bots and local surveillance without friction.
2. **Step 2: Institutional Scaling (The True Endgame)**
   - Once the Shielded Pool achieves deep liquidity and the Proof of Innocence pipeline is battle-tested by retail, we open the API to Family Offices and Corporate Treasuries.
   - **Why?** Institutions *cannot* deploy capital on public blockchains if their competitors can track their every move. LiquidAI becomes the B2B infrastructure for institutional DeFi on Celo, offering Dark Pool swaps and compliant privacy.

## 6. The Alpha Secrets: Protecting DeFi Yield and Gas Metadata

### A. The "Relayer Network" (Broadcasters)
If a user pays for gas using their own public Celo wallet to execute a shielded transaction, the privacy is instantly broken by correlation. 
LiquidAI will use a **Relayer Network (Broadcasters)**. 
- The user's device creates a Zero-Knowledge Proof and signs an intent.
- This intent is sent to a decentralized Relayer.
- The Relayer pays the CELO gas fee to submit the transaction to the EVM.
- The smart contract verifies the proof and automatically compensates the Relayer from the user's shielded balance (e.g., deducting 0.01 cUSD from the shielded note). 
- **Result:** The user never needs public CELO to transact, and their public address is never exposed on block explorers.

### B. The "DeFi Adaptor" Architecture
How do you interact with a public Yield Pool (like Aave or Mento) while keeping your capital shielded?
Railgun solved this with "Adaptors", and LiquidAI will implement **Yield Shields**:
1. The user creates a ZK-Proof to Unshield 1,000 USDm and instantly call a `DeFi Adaptor` contract in the same atomic transaction.
2. The `DeFi Adaptor` takes the 1,000 USDm, deposits it into the public yield pool (e.g., Aave or Mento), and receives the yield-bearing token (e.g., aUSDm).
3. Still in the same transaction, the Adaptor instantly **Shields** the aUSDm back into the user's private UTXO state.
4. **Result:** The public EVM sees a generic "LiquidAI Adaptor" contract depositing money into a pool. It has no idea *which* user initiated it, because the funds were unshielded and reshielded atomically.

## 6. Required Technical Stack (Future Implementation)
- **Circuits:** circom or Noir for generating the ZK-SNARK proofs (UTXO transition, Merkle Tree inclusion).
- **Prover:** Local client-side proving (WASM) optimized for mobile (Opera MiniPay).
- **Contracts:** Solidity verifier contracts deployed on Celo.
- **Relayers:** To fully anonymize the transaction fee (Gas), transactions are submitted via Relayers (Broadcasters) who pay the Celo gas in exchange for a fee deducted directly from the shielded notes.
