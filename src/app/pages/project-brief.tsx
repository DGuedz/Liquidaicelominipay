import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Copy,
  Check,
  ArrowLeft,
  Code2,
  Palette,
  Layout,
  Package,
  Globe,
  BookOpen,
} from "lucide-react";
import { LiquidLogo } from "../components/LiquidLogo";
import { useTheme } from "../hooks/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "design" | "architecture" | "libraries" | "protocols" | "prompt";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "design", label: "Design System", icon: Palette },
  { id: "architecture", label: "Architecture", icon: Layout },
  { id: "libraries", label: "Libraries", icon: Package },
  { id: "protocols", label: "Protocols", icon: Globe },
  { id: "prompt", label: "Full Prompt", icon: Code2 },
];

const FULL_PROMPT = `# LIQUIDAI — FULL SYSTEM PROMPT
# For: Senior Builder/Designer Agent (Next Session)
# Context: Celo Hackathon "Build Agents for the Real World V2" · Deadline: Mar 18, 2026

---

## 🎯 PROJECT IDENTITY

**Product:** LiquidAI — "Treasury Operating System" (Treasury OS)
**Tagline:** TREASURY OS · CELO
**Philosophy:** "Invisible DeFi" — DeFi so simple the user doesn't need to know it's DeFi
**Golden Rule:** Maximum 3 taps per critical action
**Target Audience:** MiniPay users (Celo mobile wallet) in Brazil and Africa
**Hackathon:** Celo "Build Agents for the Real World V2" · Category: Financial Agents

---

## 🏗️ TECHNICAL ARCHITECTURE

### Main Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (DO NOT use tailwind.config.js)
- **Routing:** \`react-router\` (NEVER use \`react-router-dom\`)
- **Animation:** \`motion/react\` (subpath of \`motion\` package) — import: \`import { motion } from 'motion/react'\`
- **Icons:** \`lucide-react\`
- **Charts:** Custom SVG for lines/sparklines; \`recharts\` ONLY for BarChart and PieChart

### File Structure
\`\`\`
/src/
├── app/
│   ├── App.tsx                    ← Entry point with RouterProvider
│   ├── routes.ts                  ← createBrowserRouter (react-router)
│   ├── components/
│   │   ├── LiquidLogo.tsx         ← Logo system (IconMark, FullMark, WordMark)
│   │   ├── bottom-navigation.tsx  ← Nav with elevated central logo
│   │   ├── celo-liquidity-map.tsx ← SVG map of protocols
│   │   ├── agent-pulse.tsx        ← Live agent feed
│   │   ├── icons.tsx              ← Custom SVG library
│   │   ├── root-layout.tsx        ← ThemeProvider wrapper
│   │   ├── page-header.tsx        ← Standard page header
│   │   ├── balance-card.tsx       ← Reusable balance card
│   │   ├── stat-card.tsx          ← Metric card
│   │   ├── action-button.tsx      ← Primary action button
│   │   ├── notifications-drawer.tsx
│   │   ├── numeric-keypad.tsx
│   │   ├── self-verification.tsx  ← Self Protocol integration
│   │   └── toast-provider.tsx     ← Toast system (sonner)
│   ├── hooks/
│   │   └── useTheme.tsx           ← ThemeProvider + useTheme hook
│   ├── pages/
│   │   ├── home.tsx               ← Main Dashboard
│   │   ├── agent.tsx              ← Autonomous Agent (conservative/balanced/aggressive modes)
│   │   ├── analytics.tsx          ← Financial Analytics
│   │   ├── savings.tsx            ← Savings & Goals
│   │   ├── transfer.tsx           ← PIX/CELO Transfers
│   │   ├── receipt.tsx            ← Transaction Receipt
│   │   ├── card.tsx               ← Virtual Card
│   │   ├── scan.tsx               ← QR Code Scanner
│   │   ├── chat.tsx               ← Chat with Agent
│   │   ├── profile.tsx            ← User Profile
│   │   ├── profile-*.tsx          ← Profile Sub-pages
│   │   ├── onboarding.tsx         ← Onboarding Flow
│   │   ├── landing.tsx            ← Landing Page
│   │   ├── karma-dashboard.tsx    ← Karma/DeFi Reputation
│   │   ├── logo-generator.tsx     ← Logo Playground
│   │   └── minipay-pitch.tsx      ← MiniPay Pitch Deck
│   └── utils/
│       └── formatters.ts
└── styles/
    ├── theme.css                  ← Design tokens (DO NOT modify without explicit request)
    └── fonts.css                  ← Font imports (add here)
\`\`\`

### Registered Routes
| Path | Component | Description |
|------|-----------|-----------|
| / | HomePage | Main Dashboard |
| /agent | AgentPage | Autonomous Agent |
| /analytics | AnalyticsPage | Financial Analytics |
| /savings | SavingsPage | Goals & Savings |
| /transfer | TransferPage | Transfers |
| /receipt | ReceiptPage | Receipts |
| /card | CardPage | Virtual Card |
| /scan | ScanPage | QR Scanner |
| /chat | ChatPage | Agent Chat |
| /profile | ProfilePage | Profile |
| /profile/* | Profile*Page | Profile Sub-pages |
| /karma | KarmaDashboardPage | Karma Dashboard |
| /onboarding | OnboardingPage | Onboarding |
| /landing | LandingPage | Landing Page |
| /minipay-pitch | MiniPayPitchPage | MiniPay Pitch |
| /brief | ProjectBriefPage | This document |

---

## 🎨 DESIGN SYSTEM

### Color Palette (CSS Tokens in /src/styles/theme.css)

#### Light Mode — "Zinc-Sage System"
\`\`\`css
--background:    #E8ECEA   /* Zinc-sage base */
--primary:       #0D4B2E   /* Dark Forest Green */
--primary-light: #4A7C59
--secondary:     #A3D977   /* Vibrant Lime Green */
--accent:        #10B981   /* Emerald */
--surface-solid: #F9FBF9   /* Elevated Cards */
--card-bg:       #EEF2F0
--text-primary:  #1A1A1A
--text-secondary:#4A5568
--text-muted:    #718096
\`\`\`

#### Dark Mode — "Deep Emerald Inversion"
\`\`\`css
--background:    #060D08   /* Almost black with green tint */
--primary:       #0D4B2E
--secondary:     #A3D977   /* Lime Green (maintained) */
--surface-solid: #0F2117
--card-bg:       #0E2016
--text-primary:  #EDF7E5
--text-secondary:#96B59E
--text-muted:    #5A7A62
\`\`\`

#### Logo Tokens (hard-coded in logo system)
\`\`\`
Main Green:      #35D07F   ← Celo brand green
Dark Green:      #1A8A4A
AI Gold:         #FCFF52 → #F0C030 (gradient)
Dark Background: #0A0E1A
Dark Surface:    #0F1829
\`\`\`

### Typography
- **Sans-serif:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue"
- **Monospace (numeric):** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas
- **Usage:** Always monospace for financial values (balances, APY, percentages)
- **Sizes:** Use ONLY via CSS tokens, DO NOT use Tailwind font-size/weight/leading classes

### Border Radii
\`\`\`css
--radius:      1rem     (16px)
--radius-sm:   0.5rem   (8px)
--radius-md:   0.75rem  (12px)
--radius-lg:   1.25rem  (20px)
--radius-xl:   1.5rem   (24px)
--radius-full: 9999px   (pills)
\`\`\`

### Shadows (with botanical tint — DO NOT use pure black)
\`\`\`css
--shadow-sm: 0 1px 3px rgba(13, 75, 46, 0.07)
--shadow-md: 0 4px 8px rgba(13, 75, 46, 0.09)
--shadow-lg: 0 10px 20px rgba(13, 75, 46, 0.10)
--shadow-xl: 0 20px 32px rgba(13, 75, 46, 0.12)
\`\`\`

---

## 🖼️ LOGO SYSTEM (LiquidLogo.tsx)

### Props
\`\`\`tsx
<LiquidLogo
  variant="full" | "horizontal" | "icon" | "wordmark"
  theme="dark" | "light" | "auto"
  size={number}        // px (default: icon=48, others=120)
  animate={boolean}    // activates Framer Motion animations
  className={string}
/>
\`\`\`

### Variants
| Variant | ViewBox | Description |
|---------|---------|-------------|
| icon | 200×200 | IconMark standalone (drop + neural nodes) |
| full | 500×520 | Large drop without text (text commented out) |
| horizontal | via WordMark | Text logotype "Liquid" white + "AI" green |
| wordmark | 300×60 | Pure text: "Liquid" + "AI" gradient |

---

## 📦 LIBRARIES & DEPENDENCIES

### Installed (check package.json before installing)
\`\`\`json
{
  "motion": "latest",           // import { motion } from 'motion/react'
  "lucide-react": "latest",     // generic icons
  "recharts": "latest",         // ONLY BarChart and PieChart
  "react-router": "latest",     // NOT react-router-dom
  "sonner": "latest"            // toasts: import { toast } from 'sonner'
}
\`\`\`

### Critical Library Rules
1. **NEVER** import from \`react-router-dom\` — use \`react-router\`
2. **NEVER** use \`recharts\` for line/area charts — create custom SVG
3. **NEVER** add font imports outside of \`/src/styles/fonts.css\`
4. **NEVER** create \`tailwind.config.js\` (Tailwind v4)
5. **NEVER** modify \`/src/styles/theme.css\` without explicit request
6. **ALWAYS** check package.json before installing any package

---

## 🌐 WEB3 PROTOCOLS (Logos via CDN)

### Primary CDN — Trust Wallet Assets
\`\`\`
Base URL: https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/{chain}/assets/{address}/logo.png
\`\`\`

### Protocols Mapped in CeloLiquidityMap
| ID | Label | Category | APY | CDN Logo Pattern |
|----|-------|----------|-----|------------------|
| mento | Mento | Stable AMM | 3.8% | Mento Protocol logo |
| curve | Curve | Stable AMM | 5.2% | curve-dao-token |
| uni | Uni v3 | Stable AMM | 7.1% | uniswap |
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

---

## 🤖 AGENT SYSTEM

### Risk Modes
| Mode | Label | APY Target | Color |
|------|-------|------------|-------|
| conservative | Conservative — Inflation Shield | 3.8% | #3B82F6 |
| balanced | Balanced — Wealth Accelerator | 7.2% | #A3D977 |
| aggressive | Aggressive — Utility Degenerate | 14% | #F59E0B |

---
`;

export function ProjectBriefPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between bg-surface-solid sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight">Project Brief</h1>
            <p className="text-xs text-text-muted">Handoff & Documentation</p>
          </div>
        </div>
        <LiquidLogo variant="icon" size={32} theme={isDark ? "dark" : "light"} />
      </header>

      {/* Tabs */}
      <div className="px-5 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-surface-solid text-text-secondary border border-border"}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <TabOverview />}
            {activeTab === "design" && <TabDesign />}
            {activeTab === "architecture" && <TabArchitecture />}
            {activeTab === "libraries" && <TabLibraries />}
            {activeTab === "protocols" && <TabProtocols />}
            {activeTab === "prompt" && <TabPrompt fullText={FULL_PROMPT} onCopy={handleCopy} copied={copied} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components for Tabs ──────────────────────────────────────────────────

function TabOverview() {
  const checklist = [
    { label: "Main Dashboard", status: "done" },
    { label: "Autonomous Agent (UI)", status: "done" },
    { label: "Design System Tokens", status: "done" },
    { label: "Logo System (SVG)", status: "done" },
    { label: "Dark/Light Mode", status: "done" },
    { label: "Mobile Navigation", status: "done" },
    { label: "Liquidity Map", status: "done" },
    { label: "MiniPay Pitch Deck", status: "done" },
    { label: "Celo Integration (Wagmi)", status: "pending" },
    { label: "Self Protocol (KYC)", status: "pending" },
    { label: "Mento V3 Swaps", status: "pending" },
    { label: "Push Notifications", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-surface-solid border border-border">
        <div className="flex items-center gap-3 mb-4">
          <LiquidLogo size={48} variant="icon" />
          <div>
            <h2 className="font-bold text-xl text-text-primary">LiquidAI</h2>
            <p className="text-sm text-primary font-mono tracking-wider">TREASURY OS · CELO</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          "Invisible DeFi" — Treasury operating system for MiniPay users.
          DeFi so simple the user doesn't need to know it's DeFi.
          Maximum 3 taps per critical action.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">Fintech</span>
          <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-medium">Agentic AI</span>
          <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">Celo</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Implementation Status</h3>
        <div className="grid grid-cols-1 gap-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card-bg border border-border-light">
              <span className="text-sm font-medium text-text-primary">{item.label}</span>
              {item.status === "done" ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" /> Done
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabDesign() {
  const { isDark } = useTheme();
  return (
    <div className="space-y-8">
      {/* Colors */}
      <section>
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Color Palette</h3>
        <div className="space-y-4">
          <ColorRow name="Primary" hex={isDark ? "#0D4B2E" : "#0D4B2E"} bg="bg-primary" text="text-white" />
          <ColorRow name="Secondary" hex={isDark ? "#A3D977" : "#A3D977"} bg="bg-secondary" text="text-primary" />
          <ColorRow name="Accent" hex={isDark ? "#6FCF97" : "#10B981"} bg="bg-accent" text="text-white" />
          <ColorRow name="Background" hex={isDark ? "#060D08" : "#E8ECEA"} bg="bg-background" text="text-text-primary" border />
          <ColorRow name="Surface" hex={isDark ? "#0F2117" : "#F9FBF9"} bg="bg-surface-solid" text="text-text-primary" border />
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Typography</h3>
        <div className="space-y-4 p-4 rounded-2xl bg-surface-solid border border-border">
          <div>
            <p className="text-xs text-text-muted mb-1">Display</p>
            <p className="text-2xl font-bold text-text-primary">LiquidAI Treasury</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Body</p>
            <p className="text-sm text-text-secondary">
              Invisible DeFi for the real world. The agent manages your wealth while you live your life.
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Monospace (Numeric)</p>
            <p className="text-lg font-mono text-primary font-medium tracking-tight">$0.00</p>
          </div>
        </div>
      </section>

      {/* Logo System */}
      <section>
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Logo System</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-solid border border-border flex flex-col items-center gap-2">
            <LiquidLogo variant="icon" size={64} theme={isDark ? "dark" : "light"} />
            <span className="text-xs text-text-muted">IconMark</span>
          </div>
          <div className="p-4 rounded-2xl bg-surface-solid border border-border flex flex-col items-center gap-2">
            <LiquidLogo variant="wordmark" size={80} theme={isDark ? "dark" : "light"} />
            <span className="text-xs text-text-muted">WordMark</span>
          </div>
          <div className="col-span-2 p-6 rounded-2xl bg-surface-solid border border-border flex flex-col items-center gap-4">
            <LiquidLogo variant="full" size={120} theme={isDark ? "dark" : "light"} animate />
            <span className="text-xs text-text-muted">FullMark (Animated)</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorRow({ name, hex, bg, text, border }: any) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${bg} ${border ? "border border-border" : ""}`}>
      <span className={`text-sm font-medium ${text}`}>{name}</span>
      <span className={`text-xs font-mono opacity-80 ${text}`}>{hex}</span>
    </div>
  );
}

function TabArchitecture() {
  const structure = [
    { name: "app", type: "dir", children: ["components", "hooks", "pages", "utils", "routes.ts", "App.tsx"] },
    { name: "styles", type: "dir", children: ["theme.css", "fonts.css"] },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-surface-solid border border-border">
        <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary mb-4">
          <Layout className="w-5 h-5 text-primary" />
          File Structure
        </h3>
        <pre className="text-xs font-mono text-text-secondary overflow-x-auto">
          {`/src/
├── app/
│   ├── components/  (Reusable UI)
│   ├── hooks/       (State logic)
│   ├── pages/       (App routes)
│   ├── utils/       (Pure helpers)
│   ├── routes.ts    (Route definitions)
│   └── App.tsx      (Entry point)
└── styles/
    ├── theme.css    (Global CSS tokens)
    └── fonts.css    (Fonts)`}
        </pre>
      </div>

      <div className="p-5 rounded-2xl bg-surface-solid border border-border">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Main Routes</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex gap-2"><span className="font-mono text-primary">/</span> Dashboard</li>
          <li className="flex gap-2"><span className="font-mono text-primary">/agent</span> Autonomous Agent</li>
          <li className="flex gap-2"><span className="font-mono text-primary">/profile</span> Settings</li>
          <li className="flex gap-2"><span className="font-mono text-primary">/onboarding</span> Initial Flow</li>
          <li className="flex gap-2"><span className="font-mono text-primary">/minipay-pitch</span> Presentation</li>
        </ul>
      </div>
    </div>
  );
}

function TabLibraries() {
  const libs = [
    { name: "React 18", desc: "Core Framework", required: true },
    { name: "TypeScript", desc: "Type Safety", required: true },
    { name: "Vite", desc: "Build Tool", required: true },
    { name: "Tailwind CSS v4", desc: "Styling Engine", required: true },
    { name: "motion/react", desc: "Animation Library", required: true },
    { name: "react-router", desc: "Routing (NOT dom)", required: true },
    { name: "lucide-react", desc: "Icons", required: true },
    { name: "sonner", desc: "Toasts", required: true },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm">
        <strong>Critical Rule:</strong> NEVER use <code>react-router-dom</code> or <code>framer-motion</code> directly.
        Always check <code>package.json</code>.
      </div>

      <div className="grid gap-3">
        {libs.map((lib) => (
          <div key={lib.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-solid border border-border">
            <div>
              <p className="text-sm font-bold text-text-primary">{lib.name}</p>
              <p className="text-xs text-text-muted">{lib.desc}</p>
            </div>
            {lib.required && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                Core
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabProtocols() {
  const protocols = [
    { name: "Mento", cat: "AMM", apy: "3.8%" },
    { name: "Curve", cat: "AMM", apy: "5.2%" },
    { name: "Uni v3", cat: "AMM", apy: "7.1%" },
    { name: "Aave v3", cat: "Lending", apy: "4.8%" },
    { name: "Moola", cat: "Lending", apy: "5.9%" },
    { name: "PWN", cat: "Lending", apy: "8.2%" },
    { name: "Untangled", cat: "RWA", apy: "9.1%" },
    { name: "Credit Co.", cat: "RWA", apy: "11.4%" },
    { name: "EthicHub", cat: "RWA", apy: "12.8%" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {protocols.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-solid border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-bold text-text-secondary">
                {p.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{p.name}</p>
                <p className="text-xs text-text-muted">{p.cat}</p>
              </div>
            </div>
            <span className="font-mono text-sm font-medium text-emerald-500">{p.apy}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabPrompt({ fullText, onCopy, copied }: { fullText: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Copy this prompt to pass full context to the next session.
        </p>
        <button
          onClick={onCopy}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
            ${copied ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary-light"}
          `}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Prompt"}
        </button>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-border bg-[#0A0E1A]">
        <div className="absolute top-0 left-0 right-0 h-8 bg-[#151b2b] border-b border-white/5 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="absolute inset-0 top-8 overflow-auto p-4 scrollbar-hide">
          <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
            {fullText}
          </pre>
        </div>
      </div>
    </div>
  );
}
