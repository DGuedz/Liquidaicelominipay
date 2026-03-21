# Security Best Practices Report

Date: 2026-03-20  
Scope: Wallet auth/session, Self verification callback flow, rate limiting, wallet-connection viability simulation.

## Executive Summary
The three previously open medium findings were addressed in code:
1) strict wallet auth guard now fails early on missing/invalid address,  
2) Self registration session/replay state moved out of in-memory maps to durable security state storage,  
3) rate-limit buckets moved out of per-process memory to shared security state storage (file-backed with locking).

Wallet viability simulation passed for the managed wallets set in `.env.local` (5/5).  
One residual dependency risk remains: `elliptic@6.6.1` transitively from `@selfxyz/core` (low severity, no upstream patched version currently published).

## Findings (Ordered by Severity)

### SEC-006 (Resolved): `walletAuthGuard` permissive for invalid/empty address
Impact: protected routes could continue middleware chain without strict address validation.

Fix:
- `walletAuthGuard` now rejects missing/invalid address with `400` before token/session checks.
- Evidence:
  - `server/index.mjs:298`
  - `server/index.mjs:301`
  - `server/index.mjs:305`

Status: Resolved.

### SEC-007 (Resolved): Self registration sessions and replay state in memory only
Impact: restart/deploy could drop pending Self session context and replay history.

Fix:
- Introduced durable security state store (`memory` or `file`) with TTL pruning, lock file, and atomic write/rename.
- Self flow now persists and reads registration sessions/attestation replay state from this store.
- Evidence:
  - `server/store/security-state-store.mjs:207`
  - `server/store/security-state-store.mjs:319`
  - `server/services/self-service.mjs:168`
  - `server/services/self-service.mjs:233`
  - `server/services/self-service.mjs:377`
  - `server/services/self-service.mjs:435`

Status: Resolved.

### SEC-008 (Resolved for current deployment model): Rate limiting was process-local
Impact: with multiple workers/instances, limits could be bypassed by traffic sharding.

Fix:
- Replaced per-process `Map` buckets with security-state-backed buckets.
- Current default is `SECURITY_STATE_STORE=file` (shared only where filesystem is shared).
- Evidence:
  - `server/index.mjs:197`
  - `server/index.mjs:212`
  - `server/store/security-state-store.mjs:361`

Status: Resolved for single-host or shared-filesystem deployment.  
Residual note: for fully distributed multi-node deployments, use a network shared store (e.g. Redis/Upstash adapter) to guarantee global limits.

### SEC-009 (Open, Low): Transitive crypto advisory on `elliptic` via `@selfxyz/core`
Impact: low-severity cryptographic implementation weakness advisory; no fixed upstream package release currently available.

Evidence:
- `pnpm audit --prod --json` reports:
  - advisory: `GHSA-848j-6mx2-7j84` / `CVE-2025-14505`
  - path: `.>@selfxyz/core>@selfxyz/common>elliptic`

Status: Open (upstream constraint).

Mitigation:
1. Track upstream `@selfxyz/core` / `@selfxyz/common` release with patched dependency.
2. Keep Self flow scoped and guarded (callback secret + attestation replay protection + session binding already implemented).
3. Added explicit audit gate + temporary allowlist with expiry:
   - `scripts/security-audit-gate.mjs`
   - `security/advisory-allowlist.json`
4. `h3` transitives (moderate advisories) were remediated with override to `1.15.9`:
   - `package.json` (`pnpm.overrides.h3`)

## Wallet Viability Simulation
Simulation script added:
- `scripts/simulate-managed-wallet-connections.mjs:1`

Coverage:
1. SIWE-like auth challenge + signature verify for each managed wallet key.
2. Protected route success (`/api/profile/settings`) with matching token/address.
3. Negative guard cases:
   - invalid address (`0x123`) returns `400`
   - empty address returns `400`
   - token/address mismatch returns `403`
4. Rate-limit probe:
   - repeated `/api/auth/challenge` requests trigger `429`.

Latest result:
- 5/5 managed wallets passed.
- Guard negative tests passed.
- Rate-limit probe passed (`6/25` requests returned `429`).

## Validation Log
1. `node --check server/store/security-state-store.mjs` passed.
2. `node --check server/services/self-service.mjs` passed.
3. `node --check server/index.mjs` passed.
4. `node --check scripts/simulate-managed-wallet-connections.mjs` passed.
5. `LIQUIDAI_SIM_API_BASE_URL=http://localhost:9876 node scripts/simulate-managed-wallet-connections.mjs` passed.
6. `npm run build` passed.
7. `pnpm run security:check` passed with audit gate active.
8. `pnpm audit --prod --json` now reports only `elliptic` low (SEC-009).
