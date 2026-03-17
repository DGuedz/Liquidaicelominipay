# Vercel Deploy Prep

## Scope

This repository is currently split into:

- `frontend`: Vite SPA in `src/app`
- `backend`: Express API in `server/`

The current `vercel.json` is suitable for deploying the **frontend only**.
It is not a full-stack Vercel deployment yet, because the Express backend is not adapted to Vercel Functions.

## Current status

- SPA routing is ready via `vercel.json` rewrite to `/index.html`
- Internal route audit is clean: no broken `navigate(...)` or `route:` references
- Frontend chain config is aligned to `Celo Sepolia`
- Frontend app URL is configurable through `VITE_APP_URL`

## Recommended domain split

- `liquidai.ai` -> marketing / root redirect
- `app.liquidai.ai` -> Vercel frontend SPA
- `api.liquidai.ai` -> backend host (recommended: Render web service for the current Express app)

## Recommended backend host

The current backend is a long-running Express process with in-memory stores and wallet flows that assume a normal Node server.
Do not force this into Vercel Functions right now.

Recommended path:

1. Keep the frontend on Vercel.
2. Deploy the backend to **Render** as a standard Node web service.
3. Point `api.liquidai.ai` to the Render service.
4. Only after the public API is healthy, switch the frontend `VITE_API_BASE_URL` to the real domain.

Why Render first:

- matches the current Express runtime model
- simple health checks for `/api/health`
- no forced function refactor before the hackathon
- easy custom domain + TLS

Prepared file:

- [render.yaml](/Users/doublegreen/Documents/trae_projects/LiquidAI_MVP_Celo_Minipay/render.yaml)

## Render checklist

1. Create a new Render **Web Service** from this repository.
2. Let Render use `render.yaml`.
3. Add the missing secrets in the Render dashboard:
   - `AUTH_SECRET`
   - `PRIVATE_KEY`
4. Do not set `API_PORT` on Render.
   Render injects `PORT`, and the backend now respects `PORT` first.
5. Point the custom domain `api.liquidai.ai` to the Render service.
6. After the API is healthy, update the frontend env on Vercel:
   - `VITE_API_BASE_URL=https://api.liquidai.ai`
   - `VITE_APP_URL=https://app.liquidai.ai`

## CORS policy

The backend now supports comma-separated allowed origins in `FRONTEND_ORIGIN`.
Recommended value:

- `http://localhost:5173,https://app.liquidai.ai,https://liquidai.ai,https://*.vercel.app`

This covers:
- local development
- the final app domain
- the root marketing domain
- temporary Vercel preview deployments

## Frontend Vercel env vars

Set these in the Vercel project for the frontend:

- `VITE_APP_URL=https://app.liquidai.ai`
- `VITE_API_BASE_URL=https://api.liquidai.ai`
- `VITE_CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org`
- `VITE_KARMA_API_URL=https://gapapi.karmahq.xyz`
- `VITE_APP_NAME=LiquidAI`
- `VITE_APP_VERSION=0.1.0`

Do not expose backend secrets as `VITE_*`.

## Backend env vars

These must stay outside the frontend deploy:

- `API_PORT`
- `FRONTEND_ORIGIN=https://app.liquidai.ai`
- `AUTH_SECRET`
- `AUTH_NONCE_TTL_MS`
- `AUTH_TOKEN_TTL_MS`
- `SETTLEMENT_LOCK_TTL_MS`
- `CELO_CHAIN=sepolia`
- `CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org`
- `FEE_CURRENCY_ADDRESS=0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b`
- `SORTED_ORACLES_ADDRESS=0xAb077999e5fA13bCda1599926F8927dDEADe533C`
- `ORACLE_REFERENCE_STABLE_ADDRESS=0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80`
- `AAVE_RPC_URL=https://forno.celo.org`
- `DEFAULT_USER_CAPITAL_USD=0`
- `DEFAULT_LIQUIDITY_BUFFER_USD=0`
- `DEMO_FAUCET_NATIVE_AMOUNT=0.05`
- `DEMO_FAUCET_STABLE_AMOUNT=1`
- `DEMO_FAUCET_COOLDOWN_MS=43200000`
- `DEMO_FAUCET_NATIVE_RESERVE=1`
- `DEMO_FAUCET_STABLE_RESERVE=5`
- `SELF_MODE=mock` or `agent`
- `SELF_REQUIRED_FOR_AGENT=true`
- `PRIVATE_KEY`

## Vercel config notes

The current `vercel.json` is intentionally frontend-oriented:

- framework preset: `vite`
- build output: `dist`
- SPA rewrites for React Router
- static asset cache headers

If you later move API traffic behind the same domain, the rewrite strategy must be updated so `/api/*` is excluded from the SPA fallback.

## Conflicts checked before deploy

- No broken internal app routes from static scan
- No duplicated bottom navigation in app-shell pages
- Scroll reset on route changes is active
- Frontend and backend now agree on `Celo Sepolia`

## Known blockers before production deploy

1. Bundle size is still heavy for MiniPay/3G.
2. Backend is not packaged as Vercel Functions.
3. Some external protocol logo URLs still return `404`.
4. Self verification flow is still partially demo-gated, not fully production-complete.

## Recommended deploy order

1. Deploy frontend SPA to Vercel
2. Deploy backend separately using `render.yaml`
3. Point `VITE_API_BASE_URL` to `api.liquidai.ai`
4. Attach `app.liquidai.ai` to the Vercel frontend project
5. Only then switch production wallet/provider metadata to the custom domain
