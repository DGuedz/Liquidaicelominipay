# Wallet + Self SDK Execution Plan (Celo / MiniPay / EVM L2)

## Objective

Run wallet connectivity and Self verification with high reliability across:
- MiniPay (in-app injected)
- Browser injected wallets (MetaMask, Rabby, Trust extension, Coinbase extension)
- WalletConnect wallets (Trust mobile, Rainbow, BitPay, Ledger, Coinbase Wallet app, etc.)
- Celo + Celo Sepolia + optional Ethereum L2s (Base, Arbitrum, Optimism) for cross-ecosystem flows

Target: production-grade behavior, not demo-only behavior.

---

## Current State (already implemented)

- Multi-wallet connectors in frontend (`wagmi + viem`) with WalletConnect support when `VITE_WALLETCONNECT_PROJECT_ID` is configured.
- Wallet-origin/connector gate in connect flow (`walletValidator`).
- Basic tx input sanitation (`txGuard`).
- Session hardening:
  - Auth challenge now SIWE-like (`domain`, `uri`, `chainId`, nonce, expiry).
  - Backend sets `httpOnly` auth cookie.
  - Frontend uses `credentials: include`, no durable auth token storage.
- Profile settings endpoints now protected by wallet auth guard.
- Security CI workflow added:
  - Dependency policy check for critical wallet SDKs.
  - High+ vulnerability gate.
- Dependency remediations applied:
  - `wagmi` upgraded to `2.17.5`.
  - `@metamask/sdk` resolved to `0.33.1`.
  - `socket.io-parser` resolved to `4.2.6`.
  - `snarkjs` forced to `0.7.6`.
  - `underscore` resolved to `1.13.8`.

Residual: 1 low vulnerability (`elliptic`) in `@selfxyz/common` path, no upstream patch currently advertised.

---

## Phase 1 (P0): Reliability Baseline for Wallet Connectivity

### 1.1 WalletConnect production readiness
- Provision production Reown project IDs (prod + staging).
- Add explicit runtime health check for WalletConnect relay availability.
- Add feature flag to disable WalletConnect at runtime without redeploy.

Acceptance:
- WalletConnect can be toggled on/off by env flag.
- Error messaging differentiates:
  - Missing config
  - Relay unavailable
  - Wallet rejected request

### 1.2 Connector determinism and fallback policy
- Keep persisted preferred connector (already implemented) and add stale-connector recovery:
  - If preferred connector unavailable, auto-fallback and update persisted value.
- Add explicit connector telemetry:
  - `connector_id`, `connector_name`, `mode(injected|walletconnect)`, `connect_latency_ms`, `error_code`.

Acceptance:
- No “stuck on old connector” after extension uninstall/reinstall.
- Connect success rate >= 99% in regression suite on supported browsers.

### 1.3 Chain policy enforcement
- Extend chain policy from current single-chain assumption to policy object:
  - Allowed chains by environment.
  - Mandatory settlement chain.
  - Reject unknown/unmapped chain IDs.

Acceptance:
- Wrong-chain flows always blocked before protected actions.
- User sees exact chain mismatch and one-click switch if wallet supports it.

---

## Phase 2 (P0): Self SDK Robustness Across Wallet Types

### 2.1 Standardize Self session model
- Persist Self registration sessions in durable store (not in-memory map):
  - Key: `sessionToken`.
  - Attributes: `walletAddress`, `connectorType`, `network`, `createdAt`, `expiresAt`, `status`.
- Add explicit TTL and cleanup job.

Acceptance:
- Self poll survives backend restart/deploy.
- No lost registrations during rolling deploy.

### 2.2 Wallet-agnostic proof binding
- Bind Self verification to canonical wallet identity:
  - EOA: checksum address.
  - Smart accounts (future): owner EOA + account address mapping.
- Add guard: Self verification must match active wallet session identity before agent authorization.

Acceptance:
- Verification for wallet A cannot unlock wallet B.
- Works with injected and WalletConnect sessions.

### 2.3 Self transport resilience
- Add retry strategy with exponential backoff for:
  - `/api/agent/register`
  - `/api/agent/register/status`
- Add typed failure codes:
  - `self_session_expired`
  - `self_identity_root_stale`
  - `self_provider_unavailable`

Acceptance:
- UX receives deterministic error code + message.
- 3 transient network failures do not hard-fail verification flow.

---

## Phase 3 (P1): Transaction Safety Controls

### 3.1 Contract allow-list enforcement
- Move protocol contract allow-list to config registry by chain.
- Enforce allow-list in backend settlement execution path before any write.
- Reject unknown target contracts.

Acceptance:
- No settlement call executes to a non-allow-listed contract.

### 3.2 Approval policy hardening
- Replace generic approve multiplier with strict policy:
  - Exact amount by default.
  - Bounded allowance caps.
  - Optional revoke-after-use for risky routes.

Acceptance:
- Unlimited approvals never issued by default.

### 3.3 Human-readable tx preview
- Add pre-sign transaction diff in UI:
  - Token/amount expected vs on-chain encoded intent.
  - Recipient contract label + risk tag.
- Block submit on mismatch.

Acceptance:
- Mismatch between intended amount and encoded amount is blocked and logged.

---

## Phase 4 (P1): QA Matrix and Test Automation

### 4.1 Wallet compatibility matrix
- Browsers: Chrome, Brave, Opera.
- Devices: Android (MiniPay + WalletConnect), iOS (WalletConnect).
- Wallets:
  - MiniPay
  - MetaMask extension + mobile WC
  - Rabby extension
  - Coinbase extension + mobile app WC
  - Trust extension + mobile app WC
  - Rainbow app WC
  - Ledger via WC

### 4.2 Automated tests
- Add Playwright E2E suites:
  - Connect/disconnect/switch chain/session signing.
  - Self verification happy path + failure paths.
  - Authorization submission with tx guard.
- Add mock providers for adversarial tests:
  - Fake connector IDs.
  - Wrong chainId.
  - Malformed calldata / actionId.

Acceptance:
- Green CI for wallet smoke suite.
- Reproducible test artifacts (video + traces).

---

## Phase 5 (P2): Operational Security and Incident Response

### 5.1 Runtime kill switches
- Add emergency flags:
  - `READ_ONLY_MODE`
  - `DISABLE_SETTLEMENTS`
  - `DISABLE_WALLETCONNECT`
  - `DISABLE_SELF_VERIFICATION`

### 5.2 Monitoring
- Structured logs with correlation IDs:
  - `wallet_session_id`, `self_session_id`, `settlement_id`.
- Alerts:
  - Spike in failed auth signatures.
  - Spike in rejected tx guard events.
  - Abnormal settlement volume pattern.

### 5.3 Runbooks
- Incident playbooks:
  - Wallet SDK supply-chain alert.
  - WalletConnect relay outage.
  - Self provider outage.
  - Suspicious authorization burst.

Acceptance:
- Team can switch to safe mode in < 5 minutes.

---

## Architecture Target (Wallet + Self)

1. **Client security layer**
- `walletValidator` (origin, connector, chain checks)
- `txGuard` (sanitization and allow-list checks)
- Session-awareness (`hasApiAuthSession`)

2. **Backend trust layer**
- SIWE-like challenge verification
- `httpOnly` cookie sessions
- Auth + Self guards on protected routes

3. **Identity layer (Self)**
- Registration + polling + proof verification
- Durable session store
- Wallet-bound verification state

4. **Execution layer**
- Settlement locks
- Contract allow-list
- Approval policy enforcement
- On-chain proof logs

---

## 2-Week Delivery Sprint (pragmatic)

### Week 1
- P0.1 WalletConnect readiness and telemetry
- P0.2 Durable Self sessions
- P0.3 Chain policy config + enforcement
- P1.1 Contract allow-list enforcement

### Week 2
- P1.2 Approval policy hardening
- P1.3 Tx preview mismatch blocker
- P1.4 Playwright wallet smoke tests
- P2.1 Incident kill switches + runbook draft

---

## Open Risks / Dependencies

- `@selfxyz/common` transitive `elliptic` low advisory has no clear upstream patched range.
- Wallet ecosystem churn (extensions and WalletConnect clients) requires frequent compatibility retests.
- Some WalletConnect paths depend on external relay/network reliability.

Mitigation:
- Keep CI security gate active.
- Maintain explicit dependency overrides with quarterly review.
- Run wallet matrix smoke tests on every release candidate.
