# Hackathon Audit + Delivery Plan

Date: 2026-03-20
Project: LiquidAI (Celo / MiniPay / EVM L2)

## 1) Current Position in Synthesis

Based on local CLI checklist (`pnpm synth checklist`):

Draft readiness:
- [ ] Registered participant with issued API key
- [ ] Team UUID confirmed
- [ ] At least one valid track UUID confirmed in submission payload
- [ ] Required project fields fully populated in draft payload

Publish readiness:
- [ ] All team members transferred to self-custody
- [ ] Public repo final and up to date
- [ ] Deployment URL stable and working
- [ ] Demo video URL final and working

Known recommended tracks in local runbook:
- Celo: `ff26ab4933c84eea856a5c6bf513370b`
- Self: `437781b864994698b2a304227e277b56`
- Zyfai Yield Agents: `58be0ff54518490fb94bf2b0f58bb78c`

Conclusion:
- Submission pipeline exists and is operational.
- Remaining work is mostly operational completion (keys/UUIDs/publish artifacts), not tooling.

## 2) Current Position in “Build Agents on Celo”

### What is already strong
- MiniPay + EVM wallet connectivity with `wagmi + viem`:
  - `src/app/lib/celo-wallet.ts`
  - `src/app/hooks/use-celo-wallet.ts`
- Wallet auth session with signed challenge + backend session cookie:
  - `server/services/auth-service.mjs`
  - `server/index.mjs` (`/api/auth/*`, guards)
- Self-gated protected agent actions:
  - `server/index.mjs` (`selfAuthGuard` on agent optimize/authorize)
- Settlement/proof pipeline and audit trail endpoints:
  - `server/services/settlement-service.mjs`

### What is still partial
- Self callback trust binding is incomplete:
  - `/api/self/verify` still needs strict proof-to-wallet session binding.
- Self registration resilience is incomplete:
  - sessions are still in-memory only (`activeSessions` map).
- Abuse resistance is incomplete:
  - no rate limiting on auth/self sensitive routes.
- Wallet compatibility confidence is incomplete:
  - no automated wallet matrix E2E yet.

Conclusion:
- The core narrative for “agent on Celo” is real and demonstrable.
- To be competition-grade under adversarial conditions, hardening + QA automation are still required.

## 3) What Was Fixed in This Audit Pass

1. Connector reliability hardening:
- Runtime availability probing + connector fallback
- File: `src/app/hooks/use-celo-wallet.ts`

2. Connector security hardening:
- Removed generic `injected` allow-list bypass
- File: `src/app/security/walletValidator.ts`

3. Self sensitive data hardening:
- Removed `privateKeyHex` from response/session persistence
- File: `server/services/self-service.mjs`

4. Profile auth stability:
- Ensured wallet session before protected profile reads/writes
- Files:
  - `src/app/pages/profile/security.tsx`
  - `src/app/pages/profile/protocols.tsx`
  - `src/app/pages/profile/yield.tsx`

5. Missing endpoint fix:
- Added `/api/self/reset` backend route with auth guard
- File: `server/index.mjs`

Validation:
- `npm run build` passed
- `pnpm run security:check` passed (remaining: 1 low advisory)

## 4) Complete Build Plan to Run Smoothly with EVM Wallets + Self SDK

## Phase P0 (must-have before finals)

1. Proof binding and anti-replay
- Bind `/api/self/verify` to server-side registration session and wallet.
- Reject mismatched wallet/proof context.
- Add idempotency + replay lock by attestation/session token.

2. Durable Self sessions
- Move registration sessions from memory to Redis/Postgres with TTL.
- Persist states: `pending`, `verified`, `failed`, `expired`.

3. Endpoint abuse controls
- Add route-level rate limiting for:
  - `/api/auth/challenge`
  - `/api/auth/verify`
  - `/api/self/start-registration`
  - `/api/self/poll-registration`
  - `/api/agent/authorize`

4. WalletConnect production readiness
- Provision `VITE_WALLETCONNECT_PROJECT_ID` for staging + production.
- Add runtime health check + clear user-facing error states.

## Phase P1 (stability + multi-wallet excellence)

1. Wallet QA matrix automation (Playwright)
- Scenarios:
  - connect/disconnect
  - wrong chain + switch
  - session sign
  - Self verify flow
  - authorize flow
- Wallet targets:
  - MetaMask, Rabby, Coinbase extension
  - WalletConnect flows for Trust/Rainbow/BitPay/Ledger

2. Transaction guard expansion
- Enforce backend contract allow-list before settlement write path.
- Add human-readable tx preview diff (intended vs encoded value).

3. Runtime kill switches
- Flags:
  - `READ_ONLY_MODE`
  - `DISABLE_SETTLEMENTS`
  - `DISABLE_WALLETCONNECT`
  - `DISABLE_SELF_VERIFICATION`

## Phase P2 (competition + investor polish)

1. Observability
- Structured logs and correlation IDs for wallet/self/settlement flows.
- Alerting for auth failures, suspicious authorize spikes, relay outages.

2. Release gates
- CI gate: build + wallet smoke + security policy + high-severity audit.
- Pre-submission checklist generated from CI artifacts.

## 5) 10-Day Execution Calendar

Day 1-2:
- Implement proof binding in `/api/self/verify` + replay protection.

Day 3-4:
- Durable Self session store + migration from in-memory.

Day 5:
- Add rate limits + abuse logging.

Day 6-7:
- WalletConnect prod/stage setup + relay health handling.

Day 8-9:
- Playwright wallet matrix smoke suite.

Day 10:
- Final hardening pass + submission artifact lock (repo/deploy/video).

## 6) Definition of Done for “Rodar Liso”

- Multi-wallet connect success rate >= 99% in test matrix.
- Self verification survives backend restart and deploy.
- No protected action succeeds without wallet session + Self policy checks.
- No sensitive key material leaves backend trust boundary.
- Submission checklist fully green for draft + publish.
