# LiquidAI Backend

Backend REST API para alimentar o frontend com dados de carteira, yields e estado do agente autônomo.

## Run

```bash
pnpm api:dev
```

Default URL: `http://localhost:8787`

In public hosting, the server now binds `PORT` first and falls back to `API_PORT`.

## Endpoints

- `GET /api/health`
- `POST /api/auth/challenge`
- `POST /api/auth/verify`
- `GET /api/auth/me`
- `GET /api/yields`
- `GET /api/wallet/:address`
- `GET /api/dashboard`
- `GET /api/agent/state`
- `POST /api/agent/rebalance`
- `POST /api/agent/authorize`
- `GET /api/settlement`
- `POST /api/settlement/lock`
- `POST /api/settlement/finalize`
- `GET /api/settlement/:id`
- `GET /api/analytics/overview`
- `GET /api/savings/goals`
- `POST /api/savings/goals`
- `PATCH /api/savings/goals/:id`
- `POST /api/chat`

## Data Sources

- Celo RPC (`CELO_RPC_URL`) via `viem`
- Fee/stable token (`FEE_CURRENCY_ADDRESS`, com fallback legado para `CUSD_ADDRESS`) on-chain
- APY snapshot via DeFiLlama (`Aave v3`, `Morpho`, `Mento`) com fallback local

## Notes

- Backend usa `process.env` (sem prefixo `VITE_`).
- Frontend usa `VITE_API_BASE_URL` para apontar para o backend.
- Para autenticação de carteira, configure `AUTH_SECRET` no backend.
- `FRONTEND_ORIGIN` accepts comma-separated origins, for example:
  `http://localhost:5173,https://app.liquidai.ai,https://liquidai.ai,https://*.vercel.app`
