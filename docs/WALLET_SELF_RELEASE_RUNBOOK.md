# Wallet + Self Release Runbook

Updated: March 21, 2026

## Goal

Release safely with verified support for:

- MiniPay
- MetaMask
- Rabby
- Trust Wallet
- Coinbase Wallet
- WalletConnect-compatible wallets
- Self verification flow (deep link + QR)

## Preconditions

- `SELF_MODE=agent` in target environment.
- `SELF_CALLBACK_SECRET` configured in target environment.
- `SELF_VERIFY_ENDPOINT` points to the deployed backend `/api/self/verify`.
- `VITE_WALLETCONNECT_PROJECT_ID` configured where WalletConnect is required.
- Backend and frontend deployed from the same commit SHA.

## Local Gate

Run all commands before merge:

```bash
npm run release:wallet-self:gate -- --skip-prod
npm run build
pnpm run security:check
node scripts/simulate-managed-wallet-connections.mjs
```

Expected:

- Build passes.
- Security gate passes (only approved advisories in allowlist).
- Simulation reports `passed=5 failed=0`.
- Self probe reports `deepLink=yes` and `qrData=string`.

## Staging Gate

Use staging API:

```bash
LIQUIDAI_SIM_API_BASE_URL=https://<staging-api> node scripts/simulate-managed-wallet-connections.mjs
```

If staging keeps old guards and you need connectivity-only validation:

```bash
LIQUIDAI_SIM_API_BASE_URL=https://<staging-api> LIQUIDAI_SIM_SKIP_NEGATIVE=1 node scripts/simulate-managed-wallet-connections.mjs
```

Then run strict negative checks manually:

1. `/api/self/start-registration` with invalid address must return `400`.
2. `/api/self/start-registration` with empty address must return `400`.
3. `/api/profile/settings?address=<other-wallet>` with mismatched token must return `403`.

## Production Gate

Connectivity + Self viability:

```bash
LIQUIDAI_SIM_API_BASE_URL=https://liquidaicelominipay.onrender.com LIQUIDAI_SIM_SKIP_NEGATIVE=1 node scripts/simulate-managed-wallet-connections.mjs
```

One-command gate (full local + prod):

```bash
npm run release:wallet-self:gate
```

Strict guard validation:

```bash
LIQUIDAI_SIM_API_BASE_URL=https://liquidaicelominipay.onrender.com node scripts/simulate-managed-wallet-connections.mjs
```

Temporary mode when production is known to be one deploy behind:

```bash
npm run release:wallet-self:gate -- --allow-prod-strict-fail
```

If strict validation fails but skip mode passes, production is likely running an older backend build.

## Test Reset (Before MiniPay Rollout)

When you want a clean security boundary in test (new managed wallets + fresh secrets + isolated state):

```bash
npm run reset:wallet-security-wall
```

What it does:

- Rotates managed test wallets (`TREASURY`, `TEST_USER_PRIMARY`, `TEST_USER_SECONDARY`, `RESERVE`, `ADMIN`).
- Sets backend `PRIVATE_KEY` to the new treasury private key.
- Rotates `AUTH_SECRET` and `SELF_CALLBACK_SECRET`.
- Moves `SECURITY_STATE_FILE` to a new file (isolates old sessions/replay/rate-limit buckets).
- Removes local `.data/security-state*` files.
- Writes a Render-ready snippet to `.data/wallet-reset-<timestamp>.env`.

After running:

1. Copy values from `.data/wallet-reset-<timestamp>.env` to Render Environment.
2. Redeploy backend.
3. Run production gate using lowercase test address shown by script output.

## Manual QA Matrix (Mobile + Desktop)

Run these checks on the live frontend:

1. Connect each wallet provider.
2. Sign LiquidAI auth challenge.
3. Switch to Celo Sepolia when prompted.
4. Trigger Self verification.
5. Confirm one of these appears:
   - Deep link opens Self app.
   - QR appears and can be scanned in Self app.
6. Confirm `/api/self/status` flips to `verified=true`.
7. Confirm agent-protected actions unlock only after verification.

## Rollback Criteria

Rollback immediately if any of these happen:

- `500` on invalid wallet input for guarded routes.
- Self start-registration returns no `deepLink` and no usable `qrData`.
- Auth token from wallet A is accepted for wallet B.
- Multiple wallets fail to connect after release.

## Observability Minimum

- Alert on spikes of:
  - `/api/self/start-registration` failures
  - `/api/self/poll-registration` failures
  - `/api/auth/verify` failures
- Track by wallet connector name and chain id.
- Keep correlation IDs for `wallet_session_id` and `self_session_id`.

## Known Residual Risk

- `elliptic` low advisory under `@selfxyz/common` remains transitive until upstream patch.
- Keep `security/advisory-allowlist.json` expiry updated and reassess at each release.
