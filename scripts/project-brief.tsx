/**
 * LiquidAI — Project Brief & Handoff Document
 * Guia completo para o próximo agente Builder/Designer Sênior
 * Inclui: Design System · Arquitetura · Libraries · Branding · Prompt Completo
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Code2,
  Palette,
  Layout,
  Package,
  Globe,
  Cpu,
  BookOpen,
  Layers,
  Zap,
  Shield,
  Bot,
  ExternalLink,
} from "lucide-react";
import { LiquidAILogo } from "../src/app/components/liquidai-logo";
import { useTheme } from "../src/app/hooks/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "design" | "architecture" | "libraries" | "protocols" | "prompt";

interface Section {
  id: string;
  title: string;
  open: boolean;
}

// ─── Full Prompt Text ─────────────────────────────────────────────────────────

const FULL_PROMPT = `# LIQUIDAI — SYSTEM PROMPT COMPLETO
# Para: Agente Builder/Designer Sênior (Próxima Sessão)
# Contexto: Hackathon Celo "Build Agents for the Real World V2" · Deadline: 18 Mar 2026

---

## 🎯 IDENTIDADE DO PROJETO

**Produto:** LiquidAI — "Sistema Operacional de Tesouraria" (Treasury OS)
**Tagline:** TREASURY OS · CELO
**Filosofia:** "Invisible DeFi" — DeFi tão simples que o usuário não precisa saber que é DeFi
**Regra de ouro:** Máximo 3 toques por ação crítica
**Público-alvo:** Usuários de MiniPay (Celo mobile wallet) no Brasil e África
**Hackathon:** Celo "Build Agents for the Real World V2" · Categoria: Agentes Financeiros

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Principal
- **Framework:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 (NÃO usar tailwind.config.js)
- **Roteamento:** \`react-router\` (NUNCA usar \`react-router-dom\`)
- **Animação:** \`motion/react\` (subpath do pacote \`motion\`) — import: \`import { motion } from 'motion/react'\`
- **Ícones:** \`lucide-react\`
- **Gráficos:** SVG custom para linhas/sparklines; \`recharts\` APENAS para BarChart e PieChart

### Estrutura de Arquivos
\`\`\`
/src/
├── app/
│   ├── App.tsx                    ← Entry point com RouterProvider
│   ├── routes.ts                  ← createBrowserRouter (react-router)
│   ├── components/
│   │   ├── liquidai-logo.tsx      ← Logo system (IconMark, FullMark, WordMark)
│   │   ├── bottom-navigation.tsx  ← Nav com logo central elevado
│   │   ├── celo-liquidity-map.tsx ← Mapa SVG de protocolos
│   │   ├── agent-pulse.tsx        ← Feed live do agente
│   │   ├── icons.tsx              ← Biblioteca SVG customizada
│   │   ├── root-layout.tsx        ← ThemeProvider wrapper
│   │   ├── page-header.tsx        ← Header padrão das páginas
│   │   ├── balance-card.tsx       ← Card de saldo reutilizável
│   │   ├── stat-card.tsx          ← Card de métrica
│   │   ├── action-button.tsx      ← Botão de ação primária
│   │   ├── notifications-drawer.tsx
│   │   ├── numeric-keypad.tsx
│   │   ├── self-verification.tsx  ← Integração Self Protocol
│   │   └── toast-provider.tsx     ← Sistema de toasts (sonner)
│   ├── hooks/
│   │   └── useTheme.tsx           ← ThemeProvider + useTheme hook
│   ├── pages/
│   │   ├── home.tsx               ← Dashboard principal
│   │   ├── agent.tsx              ← Agente autônomo (modo conservador/balanceado/arrojado)
│   │   ├── analytics.tsx          ← Analytics financeiro
│   │   ├── savings.tsx            ← Poupança com metas
│   │   ├── transfer.tsx           ← Transferência PIX/CELO
│   │   ├── receipt.tsx            ← Recibo de transação
│   │   ├── card.tsx               ← Cartão virtual
│   │   ├── scan.tsx               ← QR Code scanner
│   │   ├── chat.tsx               ← Chat com agente
│   │   ├── profile.tsx            ← Perfil do usuário
│   │   ├── profile-*.tsx          ← Sub-páginas de perfil
│   │   ├── onboarding.tsx         ← Fluxo de onboarding
│   │   ├── landing.tsx            ← Landing page
│   │   ├── karma-dashboard.tsx    ← Karma/reputação DeFi
│   │   ├── workflow-diagram.tsx   ← Diagrama de fluxo técnico
│   │   ├── logo-generator.tsx     ← Playground do logo
│   │   └── minipay-pitch.tsx      ← Pitch deck para MiniPay
│   └── utils/
│       └── formatters.ts
└── styles/
    ├── theme.css                  ← Tokens de design (NÃO modificar sem pedido explícito)
    └── fonts.css                  ← Imports de fontes (adicionar aqui)
\`\`\`

### Rotas Registradas
| Path | Componente | Descrição |
|------|-----------|-----------|
| / | HomePage | Dashboard principal |
| /agent | AgentPage | Agente autônomo |
| /analytics | AnalyticsPage | Analytics financeiro |
| /savings | SavingsPage | Metas e poupança |
| /transfer | TransferPage | Transferências |
| /receipt | ReceiptPage | Recibos |
| /card | CardPage | Cartão virtual |
| /scan | ScanPage | QR scanner |
| /chat | ChatPage | Chat com agente |
| /profile | ProfilePage | Perfil |
| /profile/dados | ProfileDadosPage | Dados pessoais |
| /profile/carteiras | ProfileCarteirasPage | Carteiras conectadas |
| /profile/notificacoes | ProfileNotificacoesPage | Notificações |
| /profile/seguranca | ProfileSegurancaPage | Segurança |
| /profile/agente-config | ProfileAgenteConfigPage | Configuração do agente |
| /profile/relatorios | ProfileRelatoriosPage | Relatórios |
| /profile/protocolos | ProfileProtocolosPage | Protocolos DeFi |
| /profile/suporte | ProfileSuportePage | Suporte |
| /profile/sobre | ProfileSobrePage | Sobre o app |
| /karma | KarmaDashboardPage | Dashboard de Karma |
| /onboarding | OnboardingPage | Onboarding |
| /landing | LandingPage | Landing page |
| /minipay-pitch | MiniPayPitchPage | Pitch para MiniPay |
| /workflow | WorkflowDiagramPage | Diagrama técnico |
| /logo | LogoGeneratorPage | Playground logo |
| /brief | ProjectBriefPage | Este documento |

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores (Tokens CSS em /src/styles/theme.css)

#### Light Mode — "Zinc-Sage System"
\`\`\`css
--background:    #E8ECEA   /* Zinc-sage base */
--primary:       #0D4B2E   /* Verde floresta escuro */
--primary-light: #4A7C59
--secondary:     #A3D977   /* Verde lima vibrante */
--accent:        #10B981   /* Emerald */
--surface-solid: #F9FBF9   /* Cards elevados */
--card-bg:       #EEF2F0
--text-primary:  #1A1A1A
--text-secondary:#4A5568
--text-muted:    #718096
\`\`\`

#### Dark Mode — "Deep Emerald Inversion"
\`\`\`css
--background:    #060D08   /* Quase preto com tint verde */
--primary:       #0D4B2E
--secondary:     #A3D977   /* Verde lima (mantido) */
--surface-solid: #0F2117
--card-bg:       #0E2016
--text-primary:  #EDF7E5
--text-secondary:#96B59E
--text-muted:    #5A7A62
\`\`\`

#### Tokens do Logo (hard-coded no logo system)
\`\`\`
Verde principal: #35D07F   ← Celo brand green
Verde escuro:    #1A8A4A
Dourado AI:      #FCFF52 → #F0C030 (gradient)
Background dark: #0A0E1A
Surface dark:    #0F1829
\`\`\`

### Tipografia
- **Sans-serif:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue"
- **Monospace (numérico):** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas
- **Uso:** Sempre monospace para valores financeiros (balances, APY, percentuais)
- **Tamanhos:** Usar apenas via tokens CSS, NÃO usar classes Tailwind de font-size/weight/leading

### Raios de Borda
\`\`\`css
--radius:      1rem     (16px)
--radius-sm:   0.5rem   (8px)
--radius-md:   0.75rem  (12px)
--radius-lg:   1.25rem  (20px)
--radius-xl:   1.5rem   (24px)
--radius-full: 9999px   (pills)
\`\`\`

### Sombras (com tint botânico — NÃO usar preto puro)
\`\`\`css
--shadow-sm: 0 1px 3px rgba(13, 75, 46, 0.07)
--shadow-md: 0 4px 8px rgba(13, 75, 46, 0.09)
--shadow-lg: 0 10px 20px rgba(13, 75, 46, 0.10)
--shadow-xl: 0 20px 32px rgba(13, 75, 46, 0.12)
\`\`\`

### Classes Utilitárias Customizadas
\`\`\`css
.card-elevated   → background: surface-solid + shadow-md
.card-subtle     → background: card-bg
.mono-numeric    → font-mono + tnum
.scrollbar-hide  → oculta scrollbar
.theme-transition → transição suave bg/color/border
\`\`\`

---

## 🖼️ SISTEMA DE LOGO (liquidai-logo.tsx)

### Props
\`\`\`tsx
<LiquidAILogo
  variant="full" | "horizontal" | "icon" | "wordmark"
  theme="dark" | "light" | "auto"
  size={number}        // px (default: icon=48, others=120)
  animate={boolean}    // ativa animações SMIL
  className={string}
/>
\`\`\`

### Variantes
| Variante | ViewBox | Descrição |
|----------|---------|-----------|
| icon | 200×200 | IconMark standalone (drop + neural nodes) |
| full | 500×520 | Drop grande sem texto (texto comentado) |
| horizontal | via WordMark | Logotipo texto "Liquid" branco + "AI" verde |
| wordmark | 300×60 | Texto puro: "Liquid" + "AI" gradient |

### Anatomia do IconMark
1. **Container:** rect com rx=44 (squircle)
2. **Glow radial:** aura verde ao redor
3. **Anéis orbitais:** dashed + solid, opacity reage ao hover
4. **Liquid waves:** 2 paths SVG que animam via \`<animate>\`
5. **Liquid drop:** path em forma de gota que "cai e sobe" (3.2s loop)
6. **Gold node:** círculo dourado (#FCFF52) que pulsa no impacto
7. **Splash ring:** expansão na colisão gota→nó
8. **Neural nodes:** 5 pontos que recebem liquidez em cascata
9. **Celo orbit:** elipse rotativa com dot (representa Celo network)

### Cores do Logo
\`\`\`
dark theme: bg=#0A0E1A, surface=#0F1829, green=#35D07F, gold=#FCFF52
light theme: bg=#F0FDF4, surface=#E8FBF0, green=#16A34A
\`\`\`

### Uso nos Componentes
- **BottomNavigation:** variant="icon" theme="dark" size=36 (centro elevado)
- **HomePage header:** variant="horizontal" theme={isDark?"dark":"light"} size=100
- **AgentPage:** variant="icon" animate={agentActive}
- **OnboardingPage:** variant="full" animate={true}

---

## 📦 BIBLIOTECAS E DEPENDÊNCIAS

### Instaladas (verificar package.json antes de instalar)
\`\`\`json
{
  "motion": "latest",           // import { motion } from 'motion/react'
  "lucide-react": "latest",     // ícones genéricos
  "recharts": "latest",         // APENAS BarChart e PieChart
  "react-router": "latest",     // NÃO react-router-dom
  "sonner": "latest"            // toasts: import { toast } from 'sonner'
}
\`\`\`

### Regras Críticas de Libraries
1. **NUNCA** importar de \`react-router-dom\` — usar \`react-router\`
2. **NUNCA** usar \`recharts\` para gráficos de linha/área — criar SVG custom
3. **NUNCA** adicionar font imports fora de \`/src/styles/fonts.css\`
4. **NUNCA** criar \`tailwind.config.js\` (Tailwind v4)
5. **NUNCA** modificar \`/src/styles/theme.css\` sem pedido explícito
6. **SEMPRE** usar \`unsplash_tool\` para imagens externas
7. **SEMPRE** verificar package.json antes de instalar qualquer pacote
8. Para react-hook-form: usar versão específica \`react-hook-form@7.55.0\`

### Pattern de Animação (Motion)
\`\`\`tsx
// CORRETO:
import { motion, AnimatePresence } from 'motion/react'
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} />

// INCORRETO:
import { motion } from 'framer-motion'  // ← NÃO usar
\`\`\`

### Pattern de Roteamento
\`\`\`tsx
// CORRETO:
import { useNavigate, useLocation, Outlet } from 'react-router'
import { createBrowserRouter, RouterProvider } from 'react-router'

// INCORRETO:
import { ... } from 'react-router-dom'  // ← NÃO usar
\`\`\`

---

## 🌐 PROTOCOLOS WEB3 (Logos via CDN)

### CDN Primário — Trust Wallet Assets
\`\`\`
Base URL: https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/{chain}/assets/{address}/logo.png
\`\`\`

### CDN Alternativo — CoinGecko
\`\`\`
Base URL: https://assets.coingecko.com/coins/images/{id}/small/{slug}.png
\`\`\`

### Protocolos Mapeados no CeloLiquidityMap
| ID | Label | Categoria | APY | CDN Logo Pattern |
|----|-------|-----------|-----|-----------------|
| mento | Mento | AMM estável | 3.8% | Mento Protocol logo |
| curve | Curve | AMM estável | 5.2% | curve-dao-token |
| uni | Uni v3 | AMM estável | 7.1% | uniswap |
| aave | Aave v3 | Lending | 4.8% | aave |
| moola | Moola | Lending | 5.9% | moola-market |
| pwn | PWN | Lending | 8.2% | pwn-dao |
| untangled | Untangled | RWA | 9.1% | untangled |
| credit | Credit Co. | RWA | 11.4% | creditcoin-2 |
| ethichub | EthicHub | RWA | 12.8% | ethichub |
| morpho | Morpho | Other | 6.3% | morpho |
| sushi | Sushi | Other | 4.2% | sushiswap |
| pool | PoolTogether | Other | 3.5% | pooltogether |
| ube | Ubeswap | Other | 4.9% | ubeswap |

### Categorias e Cores
\`\`\`
AMM estável: fill=#064E3B · stroke=#10B981 · particle=#10B981
Lending:     fill=#0C4A6E · stroke=#06B6D4 · particle=#06B6D4
RWA Pool:    fill=#5C2900 · stroke=#F59E0B · particle=#F59E0B
Other:       fill=#1E293B · stroke=#64748B · particle=#94A3B8
\`\`\`

---

## 🤖 SISTEMA DO AGENTE (agent.tsx)

### Modos de Risco
| Modo | Label | APY Target | Cor |
|------|-------|-----------|-----|
| conservative | Conservador — Escudo de Inflação | 3.8% | #3B82F6 |
| balanced | Balanceado — Acelerador de Patrimônio | 7.2% | #A3D977 |
| aggressive | Arrojado — Modo Degenerado Utilitário | 14% | #F59E0B |

### generateRecentLogs — REGRA ATUAL
- **SEM** ícones/emojis no campo \`action\` do log
- Texto puramente minimalista e técnico
- Formato: \`"IPCA mensal +0.6% detectado → mantendo 100% em stablecoins"\`
- Cada modo tem seu próprio conjunto de logs (MODE_LOGS)

### Pools por Modo
- **Conservative:** Aave v3 (55%), Mento AMM (30%), Buffer (15%)
- **Balanced:** Aave v3 (30%), Morpho+stCELO Loop (32%), Ubeswap (22%), Buffer (16%)
- **Aggressive:** Morpho Agressivo (30%), CELO/ETH (25%), PWN/EthicHub (22%), Credit Engine (13%), Buffer (10%)

---

## 📱 LAYOUT E NAVEGAÇÃO

### Shell Mobile-First
\`\`\`tsx
// App.tsx — container mobile centrado
<div className="min-h-screen bg-gray-100 flex justify-center">
  <div className="w-full relative bg-background" style={{ maxWidth: "430px", minHeight: "100dvh" }}>
    <RouterProvider router={router} />
  </div>
</div>
\`\`\`

### BottomNavigation (5 itens)
- **Esquerda:** Home (/), Analytics (/analytics)
- **Centro:** Logo Icon elevado → /agent (ponto de destaque visual)
- **Direita:** Savings (/savings), Profile (/profile)
- Logo central tem: gradiente verde escuro + glow + pulse dot animado

### Touch Targets
- Mínimo 44×44px para todos os elementos interativos
- \`touch-action: manipulation\` em button/a/[role=button]
- Tap highlight desativado: \`-webkit-tap-highlight-color: transparent\`

---

## 🔑 INTEGRAÇÕES WEB3

### Protocolos Celo Nativos
- **Mento V3:** Swap USDm↔BRLm · spread reduzido 40%
- **Aave v3 on Celo:** USDm lending · 4.8% APY base
- **Morpho on Celo:** stCELO looping · 9.1% APY com alavancagem
- **Ubeswap:** AMM nativo Celo · pares CELO/USDm
- **Curve on Celo:** Stable pools
- **EthicHub:** RWA crédito rural · 12.8% APY
- **PWN:** NFT-backed lending · 8.2% APY
- **Untangled:** RWA institutional · 9.1% APY

### Integrações Cross-chain
- **Daimo:** Bridge da Base Network para Celo
- **Self Protocol:** Verificação de identidade descentralizada (Self Badge no perfil)

### Moedas Suportadas
- USDm (Celo Dollar — stablecoin principal)
- BRLm (Celo Real — proteção cambial Brasil)
- CELO (token nativo — colateral em Morpho)
- stCELO (Celo Liquid Staking — via Morpho looping)

---

## 🔭 PESQUISA ONLINE — TOOLS E FONTES

### Para Logos de Protocolos
- Trust Wallet Assets: https://github.com/trustwallet/assets
- CoinGecko Assets API: https://api.coingecko.com/api/v3/coins/{id}
- DefiLlama Protocol List: https://api.llama.fi/protocols
- Token Icons CDN: https://tokens.1inch.io/{chainId}/{address}.png

### Para Dados DeFi em Tempo Real
- DeFiLlama TVL: https://api.llama.fi/tvl/{protocol}
- DeFiLlama Yields: https://yields.llama.fi/pools
- Celo Network Stats: https://explorer.celo.org
- Mento Protocol: https://app.mento.org
- Aave on Celo: https://app.aave.com/?marketName=proto_celo_v3

### Para Design Inspiration
- Revolut Design System: https://revolut.com (referência UI)
- Apple Finance: iOS Wallet/Stocks app (referência UX)
- Linear.app: https://linear.app (motion e dark mode)
- Vercel Design: https://vercel.com/design (tipografia e espaçamento)

### Para Web3 UX Research
- a16z Crypto UX research: https://a16zcrypto.com
- Rainbow Wallet UX: https://rainbow.me
- Rabby Wallet: https://rabby.io
- Coinbase Wallet: https://wallet.coinbase.com

### Para Celo Ecosystem
- Celo Docs: https://docs.celo.org
- Celo Hackathon: https://celo.org/hackathons
- MiniPay Docs: https://docs.celo.org/developer/build-on-minipay
- Mento Docs: https://docs.mento.org
- Ubeswap: https://ubeswap.org

---

## ⚡ PADRÕES DE CÓDIGO

### Componente de Página Padrão
\`\`\`tsx
export function ExamplePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-dvh pb-28 overflow-x-hidden bg-background">
      {/* Header */}
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <h1 style={{ color: "var(--text-primary)" }}>Título</h1>
        <div className="w-9" /> {/* spacer */}
      </header>

      {/* Content */}
      <div className="px-5 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{ background: "var(--surface-solid)" }}
        >
          {/* ... */}
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
}
\`\`\`

### SVG Chart Custom (para linhas/sparklines)
\`\`\`tsx
function Sparkline({ data, color = "#A3D977", height = 72 }) {
  const W = 320; const H = height + 20;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const range = max - min || 1;
  const xs = data.map((_, i) => 6 + (i / (data.length - 1)) * (W - 12));
  const ys = vals.map(v => 4 + (1 - (v - min) / range) * (H - 24));
  const linePath = xs.map((x, i) => \`\${i === 0 ? "M" : "L"} \${x} \${ys[i]}\`).join(" ");
  const areaPath = linePath + \` L \${xs[xs.length-1]} \${H} L \${xs[0]} \${H} Z\`;
  return (
    <svg viewBox={\`0 0 \${W} \${H}\`} preserveAspectRatio="none" className="w-full h-full">
      <path d={areaPath} fill={color} fillOpacity={0.08} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
\`\`\`

### useTheme Hook
\`\`\`tsx
import { useTheme } from '../hooks/useTheme';
const { isDark, toggleTheme } = useTheme();
// isDark: boolean — para condicionar estilos
// toggleTheme: () => void — botão de toggle
\`\`\`

### Formatação de Valores Financeiros
\`\`\`tsx
import { formatters } from '../utils/formatters';
// Valores sempre em font-mono + feature-settings: "tnum"
<span className="mono-numeric">{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
\`\`\`

---

## 🎭 IDENTIDADE VISUAL — REGRAS DE BRANDING

### Do's ✅
- Usar verde (#A3D977 / #35D07F) como cor primária de ação e destaque
- Dourado (#FCFF52) APENAS para o "gold node" do logo e elementos AI especiais
- Cards com bordas sutis em rgba do verde primário
- Glow effects com opacidade 10–35% do verde
- Typography: "LiquidAI" escrito sempre como uma palavra (não "Liquid AI")
- Tagline: "TREASURY OS · CELO" em monospace uppercase
- Pulse dots animados para indicar agente ativo
- Liquid waves como motivo decorativo de fundo

### Don'ts ❌
- NÃO usar preto puro (#000000) em sombras — usar tint verde
- NÃO usar vermelho como cor primária (apenas para alertas)
- NÃO usar emojis/ícones inline em logs do agente (texto puro)
- NÃO misturar tokens do logo (#35D07F) com tokens do tema (#0D4B2E)
- NÃO renderizar textos de balanço sem classe mono-numeric
- NÃO usar mais de 3 cores distintas por card/componente

### Tom de Voz
- Técnico mas acessível: "O agente capturou yield" (não "sua IA ganhou dinheiro")
- Proativo: informar ao usuário o que o agente fez, não o que ele deveria fazer
- Confiante: sem disclaimers desnecessários na UI (apenas onde legalmente necessário)
- Minimalista: cada toque tem propósito, cada palavra tem peso

---

## 📋 CHECKLIST PARA NOVAS FEATURES

Antes de implementar qualquer nova funcionalidade:

- [ ] Máximo 3 toques para completar a ação?
- [ ] Funciona em mobile 430px (e responsivo em telas maiores)?
- [ ] Usa tokens CSS do tema (não cores hard-coded, exceto no logo)?
- [ ] Importa de 'react-router' (não 'react-router-dom')?
- [ ] Animações via 'motion/react' (não 'framer-motion')?
- [ ] Gráficos de linha/área são SVG custom (não recharts)?
- [ ] Touch targets mínimo 44×44px?
- [ ] Suporte a dark/light mode via useTheme?
- [ ] Logs do agente sem emojis/ícones inline?
- [ ] Logos de protocolos via CDN (não assets locais)?

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS

1. **Integração Real com Celo Mainnet**
   - Conectar carteira via WalletConnect + wagmi
   - Ler saldos reais de USDm/BRLm/CELO
   - Executar swaps via Mento V3 SDK

2. **Agente Autônomo Real**
   - Integrar com protocolo de agentes (Brian AI, Gaia, etc.)
   - Webhook para notificações push de ações do agente
   - Dashboard de P&L real com histórico on-chain

3. **MiniPay Deep Integration**
   - Detecção de ambiente MiniPay (window.ethereum provider)
   - UX simplificado para usuários MiniPay (sem seed phrase)
   - Pagamentos diretos via USDm

4. **Self Protocol KYC**
   - Integrar SDK Self para verificação de identidade
   - Liberar funcionalidades premium para usuários verificados
   - Badge "Self Verified" no perfil

5. **Karma System**
   - Score on-chain baseado em comportamento DeFi
   - Recompensas em USDm por uso responsável do agente
   - Leaderboard comunitário

---

*Documento gerado em: ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}*
*Projeto: LiquidAI · Hackathon Celo "Build Agents for the Real World V2" · Deadline: 18 Mar 2026*`;

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",      label: "Overview",      icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: "design",        label: "Design System",  icon: <Palette className="w-3.5 h-3.5" /> },
  { id: "architecture",  label: "Arquitetura",    icon: <Layout className="w-3.5 h-3.5" /> },
  { id: "libraries",     label: "Libraries",      icon: <Package className="w-3.5 h-3.5" /> },
  { id: "protocols",     label: "Protocolos",     icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "prompt",        label: "Full Prompt",    icon: <Code2 className="w-3.5 h-3.5" /> },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

function Accordion({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ background: "var(--surface-solid)", border: "1px solid var(--border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4"
              style={{ borderTop: "1px solid var(--border-light)" }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({ hex, label, sub }: { hex: string; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 border"
        style={{ background: hex, borderColor: "rgba(255,255,255,0.12)" }}
      />
      <div>
        <div className="text-xs font-mono" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{hex}</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}{sub ? ` · ${sub}` : ""}</div>
      </div>
    </div>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div
      className="rounded-xl overflow-hidden mt-2 mb-3"
      style={{ background: "#0A0E1A", border: "1px solid rgba(53,208,127,0.15)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="font-mono text-xs" style={{ color: "#35D07F", opacity: 0.7 }}>{lang}</span>
        <button onClick={copy} className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
          {copied
            ? <Check className="w-3 h-3" style={{ color: "#35D07F" }} />
            : <Copy className="w-3 h-3" style={{ color: "#A3D977" }} />}
          <span className="text-xs font-mono" style={{ color: "#A3D977", fontSize: 10 }}>
            {copied ? "copiado!" : "copiar"}
          </span>
        </button>
      </div>
      <pre className="px-3 py-3 overflow-x-auto" style={{ margin: 0 }}>
        <code className="font-mono text-xs" style={{ color: "#E2E8F0", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ label, color = "#A3D977", bg }: { label: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs mr-1.5 mb-1.5"
      style={{ color, background: bg ?? `${color}18`, fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

// ─── Protocol Row ─────────────────────────────────────────────────────────────

function ProtocolRow({ name, category, apy, color, cdnNote }: {
  name: string; category: string; apy: string; color: string; cdnNote: string;
}) {
  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={{ borderBottom: "1px solid var(--border-light)" }}
    >
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}
      >
        <span className="font-mono" style={{ fontSize: 9, color, fontWeight: 700 }}>
          {name.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{name}</div>
        <div className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>{category} · {cdnNote}</div>
      </div>
      <span className="font-mono text-xs" style={{ color, fontWeight: 700 }}>{apy}</span>
    </div>
  );
}

// ─── Tabs Content ─────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-3">
      {/* Hero */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(145deg, #0B3D25 0%, #0D4B2E 60%, #12593A 100%)",
          border: "1px solid rgba(163,217,119,0.25)",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <LiquidAILogo variant="icon" theme="dark" size={48} animate />
          <div>
            <h2 className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>LiquidAI</h2>
            <p className="font-mono text-xs" style={{ color: "#A3D977", letterSpacing: "0.1em" }}>TREASURY OS · CELO</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
          Sistema Operacional de Tesouraria mobile-first para o Hackathon da Celo.
          Usa um agente autônomo para otimizar liquidez via DeFi — de forma invisível para o usuário final.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge label="Celo Hackathon V2" color="#A3D977" />
          <Badge label="Deadline: 18 Mar 2026" color="#FCFF52" />
          <Badge label="Mobile-First" color="#06B6D4" />
          <Badge label="Invisible DeFi" color="#F59E0B" />
        </div>
      </div>

      {/* Filosofia */}
      <Accordion title="🧠 Filosofia & Princípios" defaultOpen>
        <div className="space-y-3 pt-3">
          {[
            { rule: "Regra dos 3 Toques", desc: "Qualquer ação crítica deve ser completável em no máximo 3 interações do usuário." },
            { rule: "Invisible DeFi", desc: "O usuário não precisa saber que está usando DeFi. O agente abstrai toda a complexidade." },
            { rule: "Agente Autônomo", desc: "O LiquidAI Agent trabalha 24/7, capturando yield, rebalanceando posições e protegendo contra inflação sem intervenção manual." },
            { rule: "Mobile-First · 430px", desc: "Shell centralizada de 430px. Responsivo para desktop como preview, mas otimizado para MiniPay." },
          ].map(({ rule, desc }) => (
            <div key={rule} className="flex gap-3">
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#A3D977" }} />
              <div>
                <div className="text-xs" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{rule}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Status atual */}
      <Accordion title="📊 Status Atual do Projeto" defaultOpen>
        <div className="space-y-2 pt-3">
          {[
            { item: "Shell mobile + roteamento", done: true },
            { item: "Design System (theme.css tokens)", done: true },
            { item: "LiquidAI Logo System (3 variantes + animações)", done: true },
            { item: "BottomNavigation com logo central", done: true },
            { item: "HomePage Dashboard completo", done: true },
            { item: "AgentPage (3 modos de risco)", done: true },
            { item: "CeloLiquidityMap SVG", done: true },
            { item: "AgentPulse live feed", done: true },
            { item: "Analytics (recharts BarChart + PieChart)", done: true },
            { item: "Savings (metas com progress)", done: true },
            { item: "Transfer + Receipt", done: true },
            { item: "Profile completo (9 sub-páginas)", done: true },
            { item: "Karma Dashboard", done: true },
            { item: "MiniPay Pitch Page", done: true },
            { item: "Self Protocol integration (UI)", done: true },
            { item: "Hackathon Countdown (live)", done: true },
            { item: "Integração real com Celo Mainnet", done: false },
            { item: "Agente autônomo real (blockchain)", done: false },
            { item: "WalletConnect / wagmi", done: false },
          ].map(({ item, done }) => (
            <div key={item} className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: done ? "rgba(163,217,119,0.2)" : "rgba(255,255,255,0.06)" }}
              >
                {done && <Check className="w-2.5 h-2.5" style={{ color: "#A3D977" }} />}
              </div>
              <span className="text-xs" style={{ color: done ? "var(--text-primary)" : "var(--text-muted)" }}>{item}</span>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

function DesignTab() {
  return (
    <div className="space-y-3">
      {/* Color Palette */}
      <Accordion title="🎨 Paleta de Cores" defaultOpen>
        <div className="pt-2">
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Light Mode — Zinc-Sage System</p>
          <ColorSwatch hex="#E8ECEA" label="--background" sub="base surface" />
          <ColorSwatch hex="#0D4B2E" label="--primary" sub="verde floresta" />
          <ColorSwatch hex="#4A7C59" label="--primary-light" sub="hover states" />
          <ColorSwatch hex="#A3D977" label="--secondary" sub="verde lima / destaque" />
          <ColorSwatch hex="#10B981" label="--accent" sub="emerald / success" />
          <ColorSwatch hex="#F9FBF9" label="--surface-solid" sub="cards elevados" />
          <div className="my-3 border-t" style={{ borderColor: "var(--border)" }} />
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Dark Mode — Deep Emerald Inversion</p>
          <ColorSwatch hex="#060D08" label="--background dark" sub="quase preto verde" />
          <ColorSwatch hex="#0F2117" label="--surface-solid dark" />
          <ColorSwatch hex="#EDF7E5" label="--text-primary dark" />
          <div className="my-3 border-t" style={{ borderColor: "var(--border)" }} />
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Logo System (hard-coded)</p>
          <ColorSwatch hex="#35D07F" label="Celo green" sub="logo principal" />
          <ColorSwatch hex="#FCFF52" label="Gold node" sub="AI accent" />
          <ColorSwatch hex="#0A0E1A" label="Logo background" sub="dark surface" />
        </div>
      </Accordion>

      {/* Typography */}
      <Accordion title="✍️ Tipografia">
        <div className="pt-3 space-y-3">
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sans-serif (UI geral)</div>
            <div style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>
              -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Monospace (valores financeiros)</div>
            <div className="mono-numeric" style={{ color: "var(--text-primary)" }}>
              $1,240.50 · 4.8% APY · 0.00123 CELO
            </div>
          </div>
          <CodeBlock lang="css" code={`/* REGRA: NUNCA usar Tailwind para font-size/weight/leading */
/* USAR tokens CSS: */
.mono-numeric {
  font-family: var(--font-mono);
  font-feature-settings: "tnum"; /* tabular numbers */
}
/* Tamanhos padrão definidos em theme.css para h1-h4, label, button, input */`} />
        </div>
      </Accordion>

      {/* Spacing */}
      <Accordion title="📐 Bordas e Sombras">
        <div className="pt-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "--radius-sm", val: "0.5rem", r: "8px" },
              { label: "--radius-md", val: "0.75rem", r: "12px" },
              { label: "--radius", val: "1rem", r: "16px" },
              { label: "--radius-lg", val: "1.25rem", r: "20px" },
              { label: "--radius-xl", val: "1.5rem", r: "24px" },
              { label: "--radius-full", val: "9999px", r: "pill" },
            ].map(({ label, val, r }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 flex-shrink-0"
                  style={{ background: "var(--secondary)", opacity: 0.4, borderRadius: r }}
                />
                <div>
                  <div className="font-mono" style={{ fontSize: 9, color: "var(--text-muted)" }}>{label}</div>
                  <div className="font-mono" style={{ fontSize: 9, color: "#A3D977" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Sombras: sempre com tint verde rgba(13,75,46,…) — NUNCA preto puro
          </p>
        </div>
      </Accordion>

      {/* Logo System */}
      <Accordion title="🔰 Sistema de Logo">
        <div className="pt-3">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(["icon", "full", "wordmark"] as const).map((v) => (
              <div
                key={v}
                className="flex flex-col items-center gap-2 p-3 rounded-xl"
                style={{ background: "#0A0E1A" }}
              >
                <LiquidAILogo variant={v} theme="dark" size={v === "wordmark" ? 80 : 48} animate />
                <span className="font-mono text-xs" style={{ color: "#35D07F", opacity: 0.7 }}>variant="{v}"</span>
              </div>
            ))}
            <div
              className="flex flex-col items-center gap-2 p-3 rounded-xl"
              style={{ background: "#0A0E1A" }}
            >
              <LiquidAILogo variant="icon" theme="light" size={48} />
              <span className="font-mono text-xs" style={{ color: "#35D07F", opacity: 0.7 }}>theme="light"</span>
            </div>
          </div>
          <CodeBlock code={`<LiquidAILogo
  variant="icon" | "full" | "horizontal" | "wordmark"
  theme="dark" | "light" | "auto"
  size={48}          // px
  animate={true}     // ativa SMIL animations
  className="..."
/>`} />
        </div>
      </Accordion>
    </div>
  );
}

function ArchitectureTab() {
  return (
    <div className="space-y-3">
      <Accordion title="🗂️ Estrutura de Arquivos" defaultOpen>
        <CodeBlock lang="bash" code={`src/
├── app/
│   ├── App.tsx              # RouterProvider entry
│   ├── routes.ts            # createBrowserRouter
│   ├── components/
│   │   ├── liquidai-logo.tsx      # Logo system
│   │   ├── bottom-navigation.tsx  # Nav 5 itens + logo centro
│   │   ├── celo-liquidity-map.tsx # SVG mapa de protocolos
│   │   ├── agent-pulse.tsx        # Feed live do agente
│   │   ├── icons.tsx              # Custom SVG icons
│   │   ├── root-layout.tsx        # ThemeProvider + Outlet
│   │   ├── page-header.tsx        # Header reutilizável
│   │   ├── balance-card.tsx       # Card de saldo
│   │   ├── stat-card.tsx          # Métrica card
│   │   ├── action-button.tsx      # Botão de ação
│   │   ├── notifications-drawer.tsx
│   │   ├── numeric-keypad.tsx
│   │   ├── self-verification.tsx  # Self Protocol
│   │   └── toast-provider.tsx     # Toasts (sonner)
│   ├── hooks/
│   │   └── useTheme.tsx           # Dark/light mode
│   ├── pages/                     # 24 páginas registradas
│   └── utils/
│       └── formatters.ts
└── styles/
    ├── theme.css            # Design tokens (CSS vars)
    └── fonts.css            # Font imports (APENAS aqui)`} />
      </Accordion>

      <Accordion title="🔀 Roteamento (react-router)" defaultOpen>
        <CodeBlock code={`// routes.ts — SEMPRE react-router, NUNCA react-router-dom
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,   // ThemeProvider + Outlet
    ErrorBoundary: ErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: "agent", Component: AgentPage },
      { path: "analytics", Component: AnalyticsPage },
      // ... 21 rotas adicionais
    ],
  },
]);

// App.tsx
import { RouterProvider } from "react-router";
<RouterProvider router={router} />`} />
      </Accordion>

      <Accordion title="🌗 Sistema de Temas">
        <CodeBlock code={`// useTheme.tsx — Context + hook
const { isDark, toggleTheme } = useTheme();

// RootLayout envolve tudo com ThemeProvider
// O tema é aplicado via classe .dark no root
// Todos os componentes acessam via CSS vars

// Exemplo de uso condicional:
style={{
  background: isDark ? "#0F2117" : "#F9FBF9",
  color: "var(--text-primary)", // ← preferível (auto dark/light)
}}`} />
      </Accordion>

      <Accordion title="📱 Layout Shell">
        <CodeBlock code={`// App.tsx — container principal
<div className="min-h-screen bg-gray-100 flex justify-center">
  <div
    className="w-full relative bg-background"
    style={{ maxWidth: "430px", minHeight: "100dvh" }}
  >
    <RouterProvider router={router} />
  </div>
</div>

// Toda página usa pb-28 para não sobrepor BottomNav:
<div className="min-h-dvh pb-28 overflow-x-hidden bg-background">
  {/* conteúdo */}
  <BottomNavigation /> {/* fixo no bottom */}
</div>`} />
      </Accordion>
    </div>
  );
}

function LibrariesTab() {
  const libs = [
    {
      name: "react-router",
      version: "latest",
      use: "Roteamento — NUNCA usar react-router-dom",
      ok: true,
      imports: ["createBrowserRouter", "RouterProvider", "useNavigate", "useLocation", "Outlet"],
    },
    {
      name: "motion",
      version: "latest",
      use: "Animações — subpath motion/react",
      ok: true,
      imports: ["motion", "AnimatePresence"],
    },
    {
      name: "lucide-react",
      version: "latest",
      use: "Ícones genéricos — complementa icons.tsx",
      ok: true,
      imports: ["Bot", "Zap", "Shield", "Bell", "ArrowLeft", "..."],
    },
    {
      name: "recharts",
      version: "latest",
      use: "Gráficos — APENAS BarChart e PieChart",
      ok: true,
      imports: ["BarChart", "Bar", "PieChart", "Pie", "Cell", "ResponsiveContainer", "Tooltip"],
    },
    {
      name: "sonner",
      version: "latest",
      use: "Sistema de toasts",
      ok: true,
      imports: ["toast", "Toaster"],
    },
  ];

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-3"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
          <div>
            <div className="text-xs" style={{ color: "#EF4444", fontWeight: 700 }}>Regras Críticas</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
              NUNCA importar de <code className="font-mono">react-router-dom</code> · 
              NUNCA usar recharts para linhas/área · 
              Motion: import de <code className="font-mono">motion/react</code> (não framer-motion)
            </div>
          </div>
        </div>
      </div>

      {libs.map((lib) => (
        <Accordion key={lib.name} title={lib.name}>
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge label={`v${lib.version}`} color="#A3D977" />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{lib.use}</span>
            </div>
            <CodeBlock lang="ts" code={`import { ${lib.imports.join(", ")} } from "${lib.name === "motion" ? "motion/react" : lib.name}"`} />
          </div>
        </Accordion>
      ))}

      <Accordion title="📌 Versões Específicas">
        <div className="pt-2">
          <CodeBlock lang="bash" code={`# react-hook-form DEVE ser esta versão exata:
react-hook-form@7.55.0

# Instalação:
# Usar SEMPRE a ferramenta install_package
# Checar package.json ANTES de instalar
# NÃO editar package.json manualmente`} />
        </div>
      </Accordion>

      <Accordion title="🚫 Packages Proibidos">
        <div className="pt-3 space-y-2">
          {[
            { pkg: "react-router-dom", reason: "Usar react-router (sem -dom)" },
            { pkg: "framer-motion", reason: "Usar motion/react (subpath de motion)" },
            { pkg: "react-resizable", reason: "Usar re-resizable" },
            { pkg: "konva", reason: "Usar canvas API nativo" },
            { pkg: "tailwind.config.js", reason: "Projeto usa Tailwind v4 (sem config)" },
          ].map(({ pkg, reason }) => (
            <div key={pkg} className="flex items-start gap-2">
              <span className="text-xs mt-0.5" style={{ color: "#EF4444" }}>✕</span>
              <div>
                <code className="font-mono text-xs" style={{ color: "#F87171" }}>{pkg}</code>
                <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>→ {reason}</span>
              </div>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

function ProtocolsTab() {
  const protocols = [
    { name: "Mento", category: "AMM estável", apy: "3.8%", color: "#10B981", cdnNote: "github.com/mento-protocol" },
    { name: "Curve", category: "AMM estável", apy: "5.2%", color: "#10B981", cdnNote: "coingecko: curve-dao-token" },
    { name: "Uniswap v3", category: "AMM estável", apy: "7.1%", color: "#10B981", cdnNote: "coingecko: uniswap" },
    { name: "Aave v3", category: "Lending", apy: "4.8%", color: "#06B6D4", cdnNote: "coingecko: aave" },
    { name: "Moola", category: "Lending", apy: "5.9%", color: "#06B6D4", cdnNote: "moola.market" },
    { name: "PWN", category: "Lending NFT", apy: "8.2%", color: "#06B6D4", cdnNote: "coingecko: pwn-dao" },
    { name: "Untangled", category: "RWA Pool", apy: "9.1%", color: "#F59E0B", cdnNote: "untangled.finance" },
    { name: "Credit Collective", category: "RWA Pool", apy: "11.4%", color: "#F59E0B", cdnNote: "coingecko: creditcoin-2" },
    { name: "EthicHub", category: "RWA Crédito Rural", apy: "12.8%", color: "#F59E0B", cdnNote: "ethichub.com" },
    { name: "Morpho", category: "Looping / Leverage", apy: "6.3–15%", color: "#64748B", cdnNote: "coingecko: morpho" },
    { name: "Sushi", category: "AMM Other", apy: "4.2%", color: "#64748B", cdnNote: "coingecko: sushiswap" },
    { name: "PoolTogether", category: "Prize Savings", apy: "3.5%", color: "#64748B", cdnNote: "coingecko: pooltogether" },
    { name: "Ubeswap", category: "AMM Celo nativo", apy: "4.9%", color: "#64748B", cdnNote: "ubeswap.org" },
  ];

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-3"
        style={{ background: "var(--surface-solid)", border: "1px solid var(--border)" }}
      >
        <div className="text-xs font-mono mb-2" style={{ color: "var(--text-muted)" }}>CDN de Logos</div>
        <CodeBlock lang="bash" code={`# Trust Wallet Assets (primário)
https://raw.githubusercontent.com/trustwallet/assets/master/
  blockchains/{chain}/assets/{address}/logo.png

# CoinGecko (alternativo)
https://assets.coingecko.com/coins/images/{id}/small/{slug}.png

# 1inch Token Icons
https://tokens.1inch.io/{chainId}/{address}.png`} />
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface-solid)", border: "1px solid var(--border)" }}
      >
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Protocolos Mapeados</div>
        </div>
        <div className="px-4">
          {protocols.map((p) => (
            <ProtocolRow key={p.name} {...p} />
          ))}
        </div>
      </div>

      <Accordion title="🔑 Integrações Cross-chain">
        <div className="pt-3 space-y-3">
          {[
            { name: "Daimo", desc: "Bridge da Base Network → Celo · recebimento multi-chain", color: "#818CF8" },
            { name: "Self Protocol", desc: "Verificação de identidade ZK · badge no perfil", color: "#2563EB" },
            { name: "Mento V3", desc: "Swap USDm↔BRLm · saída de emergência em 2–5s", color: "#10B981" },
          ].map(({ name, desc, color }) => (
            <div key={name} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}
              >
                <Globe className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{name}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="🪙 Moedas Suportadas">
        <div className="pt-3 space-y-2">
          {[
            { coin: "USDm", desc: "Celo Dollar — stablecoin principal, lastreada em USD", color: "#10B981" },
            { coin: "BRLm", desc: "Celo Real — proteção cambial para usuários BR", color: "#F59E0B" },
            { coin: "CELO", desc: "Token nativo — colateral em Morpho looping", color: "#35D07F" },
            { coin: "stCELO", desc: "Liquid Staking — base para looping alavancado", color: "#06B6D4" },
          ].map(({ coin, desc, color }) => (
            <div key={coin} className="flex items-center gap-3 py-1.5">
              <span
                className="font-mono text-xs px-2 py-0.5 rounded-lg"
                style={{ background: `${color}22`, color, fontWeight: 700 }}
              >
                {coin}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</span>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

function PromptTab() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(FULL_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-3">
      {/* CTA copy */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={copyPrompt}
        className="w-full rounded-2xl py-4 flex items-center justify-center gap-3"
        style={{
          background: copied
            ? "linear-gradient(135deg, #064E3B, #0D4B2E)"
            : "linear-gradient(135deg, #0D4B2E, #1a6b45)",
          boxShadow: "0 6px 24px rgba(13,75,46,0.35)",
          border: "1px solid rgba(163,217,119,0.3)",
        }}
      >
        {copied
          ? <Check className="w-5 h-5" style={{ color: "#A3D977" }} />
          : <Copy className="w-5 h-5" style={{ color: "#A3D977" }} />}
        <span style={{ color: "white", fontWeight: 700 }}>
          {copied ? "Prompt Copiado! ✓" : "Copiar Prompt Completo"}
        </span>
      </motion.button>

      <div
        className="rounded-2xl p-3"
        style={{ background: "rgba(163,217,119,0.08)", border: "1px solid rgba(163,217,119,0.2)" }}
      >
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#A3D977" }} />
          <div className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            Cole este prompt no início de uma nova sessão com o agente builder/designer.
            Ele contém toda a arquitetura, design system, regras de código, protocolos e próximos passos do LiquidAI.
          </div>
        </div>
      </div>

      {/* Prompt preview */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0A0E1A", border: "1px solid rgba(53,208,127,0.2)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="font-mono text-xs" style={{ color: "#35D07F" }}>system_prompt.md</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
            <span className="w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} />
            <span className="w-2 h-2 rounded-full" style={{ background: "#A3D977" }} />
          </div>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 400 }}>
          <pre
            className="font-mono text-xs"
            style={{
              color: "#E2E8F0",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {FULL_PROMPT.slice(0, 3000)}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>
              {"\n\n... [copie o prompt completo acima para ver o conteúdo total]"}
            </span>
          </pre>
        </div>
      </div>

      {/* Research links */}
      <Accordion title="🔭 Links de Pesquisa para o Agente">
        <div className="pt-3 space-y-2">
          {[
            { label: "Celo Docs", url: "https://docs.celo.org", cat: "Ecosystem" },
            { label: "Mento Protocol", url: "https://docs.mento.org", cat: "DeFi" },
            { label: "Aave on Celo", url: "https://app.aave.com/?marketName=proto_celo_v3", cat: "DeFi" },
            { label: "DeFiLlama Yields", url: "https://yields.llama.fi/pools", cat: "Data" },
            { label: "Trust Wallet Assets CDN", url: "https://github.com/trustwallet/assets", cat: "Assets" },
            { label: "CoinGecko API", url: "https://api.coingecko.com/api/v3", cat: "Data" },
            { label: "MiniPay Docs", url: "https://docs.celo.org/developer/build-on-minipay", cat: "Integration" },
            { label: "Self Protocol", url: "https://self.xyz", cat: "Identity" },
            { label: "Morpho Docs", url: "https://docs.morpho.org", cat: "DeFi" },
            { label: "Ubeswap", url: "https://ubeswap.org", cat: "DeFi" },
          ].map(({ label, url, cat }) => (
            <div key={url} className="flex items-center gap-2.5 py-1.5">
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              <div className="flex-1 min-w-0">
                <span className="text-xs" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{label}</span>
              </div>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977", fontSize: 9 }}
              >
                {cat}
              </span>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProjectBriefPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabContent: Record<Tab, React.ReactNode> = {
    overview: <OverviewTab />,
    design: <DesignTab />,
    architecture: <ArchitectureTab />,
    libraries: <LibrariesTab />,
    protocols: <ProtocolsTab />,
    prompt: <PromptTab />,
  };

  return (
    <div className="min-h-dvh pb-8 bg-background overflow-x-hidden">

      {/* ── HEADER ── */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: isDark ? "rgba(6,13,8,0.95)" : "rgba(232,236,234,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="px-4 pt-12 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--surface-solid)" }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 style={{ color: "var(--text-primary)", fontSize: "1rem" }}>Project Brief</h1>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{ background: "rgba(163,217,119,0.15)", color: "#A3D977", fontSize: 9 }}
                >
                  v1.0 · Handoff
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Guia completo para o próximo agente sênior
              </p>
            </div>
            <LiquidAILogo variant="icon" theme={isDark ? "dark" : "light"} size={32} />
          </div>

          {/* Tabs scroll */}
          <div
            ref={scrollRef}
            className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide"
          >
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0 transition-all duration-200"
                style={{
                  background: activeTab === tab.id
                    ? "#0D4B2E"
                    : "var(--surface-solid)",
                  border: activeTab === tab.id
                    ? "1px solid rgba(163,217,119,0.3)"
                    : "1px solid var(--border-light)",
                  color: activeTab === tab.id ? "#A3D977" : "var(--text-muted)",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 12,
                }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-4 mt-6 pb-4 text-center">
        <p className="font-mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.05em" }}>
          LiquidAI · Treasury OS · Celo Hackathon 2026
        </p>
        <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(163,217,119,0.4)", fontSize: 9 }}>
          Deadline: 18 Mar 2026 · Build Agents for the Real World V2
        </p>
      </div>
    </div>
  );
}
