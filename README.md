<div align="center">

<img src="https://img.shields.io/badge/Celo-FCFF52?style=for-the-badge&logo=celo&logoColor=black" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />

# 🌊 LiquidAI

### Treasury Operating System for MiniPay Users

**Build Agents for the Real World V2 · Celo Hackathon 2026**

[Live Demo](https://liquidai.vercel.app) · [Pitch Deck](#) · [Video Demo](#)

</div>

---

## 🎯 O Problema

**12 milhões de usuários MiniPay. 0% protegidos da inflação local.**

O usuário médio da MiniPay (Opera Mini integrada) possui ~$1.200 em cUSD, realiza microtransações diárias abaixo de $5 e perde ~$57/ano em poder de compra sem nenhum mecanismo de proteção — enquanto a infraestrutura DeFi do Celo permanece invisível e inacessível para ele.

## 💡 A Solução

**LiquidAI** é um **Sistema Operacional de Tesouraria** mobile-first que usa um **agente autônomo** para otimizar liquidez automaticamente, seguindo a filosofia **"Invisible DeFi"** — máximo de 3 toques por qualquer ação.

```
Usuário deposita cUSD → Agente otimiza 24/7 → Yield chega automaticamente
```

---

## ✨ Features

| Feature | Descrição |
|---|---|
| 🤖 **Agente Autônomo** | Rebalanceamento, yield capture e proteção cambial automáticos 24/7 |
| ⚡ **Regra dos 3 Toques** | PIX, recarga, remessa — qualquer ação em ≤ 3 interações |
| 🌊 **DeFi Invisível** | Morpho, Aave v3, Mento V3 no fundo — usuário vê só o resultado |
| 🪪 **Self Protocol** | Verificação de identidade com ZK Proof — sem expor dados pessoais |
| 📊 **Agent Pulse Live** | Feed em tempo real das ações do agente na home |
| 🛡️ **Proteção Cambial** | cUSD como hedge automático contra inflação BRL/naira/peso |
| 💳 **MiniPay Native** | Integração direta com Opera Mini MiniPay |

---

## 🏗️ Arquitetura

```
LiquidAI
├── Camada de Interface (React + Tailwind CSS v4)
│   ├── Mobile-first, 390px target (MiniPay/Opera Mini)
│   ├── Paleta verde fintech (#0D4B2E, #A3D977)
│   └── 32 ícones SVG premium custom (strokeWidth 1.5)
│
├── Camada de Agente (Autônomo)
│   ├── Yield Engine → Aave v3 + Morpho Looping
│   ├── Rebalance Engine → Mento V3 cUSD/cBRL/cKES
│   ├── JIT Funding → Buffer para microtransações
│   └── Opportunity Scanner → APY monitoring
│
├── Camada de Protocolo (Celo)
│   ├── Mento V3 (stablecoins nativas)
│   ├── Aave v3 on Celo (lending)
│   ├── Morpho (looping strategy)
│   └── Daimo (cross-chain bridge Base↔Celo)
│
└── Camada de Identidade
    └── Self Protocol (ZK Proof, anti-sybil)
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/DGuedz/liquidai.git
cd liquidai

# Instale as dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse `http://localhost:5173`

### Build para Produção

```bash
pnpm build
pnpm preview
```

---

## 🔧 Variáveis de Ambiente

```env
# Celo Network
VITE_CELO_RPC_URL=https://forno.celo.org
VITE_CELO_CHAIN_ID=42220

# WalletConnect (MiniPay integration)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Self Protocol
VITE_SELF_APP_ID=your_self_app_id
VITE_SELF_SCOPE=liquidai-v1

# Aave v3 Subgraph
VITE_AAVE_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/aave/protocol-v3-celo

# Analytics (opcional)
VITE_POSTHOG_KEY=your_posthog_key
```

---

## 📱 Páginas & Rotas

| Rota | Descrição |
|---|---|
| `/` | Dashboard principal (Home) |
| `/landing` | Landing page pública |
| `/onboarding` | Setup inicial (MiniPay + Self + Risk) |
| `/agent` | Painel do Agente Autônomo |
| `/analytics` | Analytics detalhados |
| `/savings` | Metas de poupança |
| `/transfer` | Transferência / PIX |
| `/scan` | QR Code scanner |
| `/card` | Cartão virtual |
| `/chat` | Chat com Agente IA |
| `/profile` | Perfil + 9 sub-rotas |

---

## 🌊 Estratégia de Yield

### Conservador (3.2–4.2% APY)
- Aave v3 cUSD lending (base yield)
- Mento V3 spread capture

### Balanceado (4.2–9.1% APY) ⭐ Recomendado
- Aave v3 + Morpho optimization
- JIT liquidity provision
- Automated rebalancing

### Arrojado (9–18% APY)
- Morpho looping strategy (stCELO 2x)
- Cross-chain yield (Daimo bridge Base↔Celo)
- LP positions concentradas

---

## 🤝 Protocolos Integrados

| Protocolo | Função | Status |
|---|---|---|
| **Mento V3** | Stablecoins nativas Celo | ✅ Integrado |
| **Aave v3** | Lending/Borrowing | ✅ Integrado |
| **Morpho** | Yield optimization | ✅ Integrado |
| **Daimo** | Cross-chain bridge | 🔄 Em desenvolvimento |
| **Self Protocol** | Identity/ZK Proof | ✅ Integrado |
| **Rain Cards** | Cartão físico DeFi | 🔄 Roadmap Q3 |

---

## 📊 Oportunidade de Mercado

```
TAM (DeFi LatAm 2026):     $14.4B
MiniPay usuários ativos:    12M+
Avg. saldo por usuário:     $1.200 cUSD
Custo anual da inação:      -$57/usuário
Inflação BRL (jan-mar/26):  4.8%
```

---

## 🛤️ Roadmap

```
Q1 2026 (Hackathon MVP) ✅
├── Dashboard mobile-first
├── Agente autônomo (mock)
├── MiniPay integration
├── Self Protocol ZK Proof
└── Onboarding < 15 segundos

Q2 2026
├── Smart contracts em produção (Celo Mainnet)
├── BaaS parceiros: Rain + Daimo
├── Notificações push (yield alerts)
└── 500 usuários beta

Q3 2026
├── Cartão físico Celo (Rain Cards)
├── Credit Engine (micro-empréstimos)
├── Expansion: Nigéria (cKES), Argentina (cUSD)
└── 10.000 usuários ativos

Q4 2026
├── RWA como colateral
├── DAO governance token
├── BaaS API para terceiros
└── 100.000 usuários ativos
```

---

## 🏆 Hackathon

**Build Agents for the Real World V2 · Celo · Março 2026**

- **Categoria:** AI Agents + DeFi
- **Target:** MiniPay users (Opera Mini, mercados emergentes)
- **USP:** Único "Treasury OS" com agente autônomo para o usuário médio

---

## 👨‍💻 Equipe

**[doublegreen / DGuedz](https://github.com/DGuedz)**
Founder, CEO & Tech Lead · [Black Mindz Labs](https://blackmindzlabs.com)
Web3 · RWA · DeFi · IA

---

## 📄 Licença

MIT © 2026 Black Mindz Labs

---

<div align="center">
  <p>Feito com 🌊 e ☕ no Brasil</p>
  <p><strong>Powered by Celo · Invisible DeFi</strong></p>
</div>
