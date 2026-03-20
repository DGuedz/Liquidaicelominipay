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

## 4. Compliance: Proof of Innocence
To ensure LiquidAI remains compliant with global regulations while maintaining privacy:
- The system integrates **Proof of Innocence**.
- Users can mathematically prove (via ZK) that their shielded notes did *not* originate from a known list of sanctioned or hacked addresses.
- Users can generate **Viewing Keys** to selectively reveal their transaction history to auditors or Off-Ramps, maintaining self-sovereignty over their financial data.

## 5. Required Technical Stack (Future Implementation)
- **Circuits:** circom or Noir for generating the ZK-SNARK proofs (UTXO transition, Merkle Tree inclusion).
- **Prover:** Local client-side proving (WASM) optimized for mobile (Opera MiniPay).
- **Contracts:** Solidity verifier contracts deployed on Celo.
- **Relayers:** To fully anonymize the transaction fee (Gas), transactions are submitted via Relayers (Broadcasters) who pay the Celo gas in exchange for a fee deducted directly from the shielded notes.
