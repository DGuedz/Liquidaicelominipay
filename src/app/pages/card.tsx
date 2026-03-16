import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Copy,
  Lock,
  Unlock,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  RefreshCw,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  Bot,
  Shield,
  Globe,
  Smartphone,
  Building2,
  Banknote,
  TrendingUp,
  Layers,
  AlertCircle,
  Gift,
  Rocket,
  Info,
  X,
  AlertTriangle,
  Activity,
  Route,
  Brain,
  Tag,
  Coins,
} from "lucide-react";
import { BottomNavigation } from "../components/bottom-navigation";
import { useTheme } from "../hooks/useTheme";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { useNavigate } from "react-router";
import { apiGet, DashboardPayload } from "../lib/api";
import {
  PharmacyIcon,
  YieldCaptureIcon,
  PhoneTopupIcon,
  GroceryIcon,
  BriefcaseIcon,
  RainIcon,
  KycIcon,
  BridgeIcon,
  BankIcon,
  PixIcon,
  LeafIcon,
  TrophyIcon as TrophySvg,
  WorldPayIcon,
  NetworkIcon,
  LightningIcon as LightningSvg,
  SwapIcon,
  JITIcon,
  LoopIcon,
} from "../components/icons";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_NUMBER = "PREVIEW •••• •••• 3424";
const MASKED_NUMBER = "PREVIEW •••• •••• 3424";

function truncateAddress(address: string | null | undefined) {
  if (!address) return "Wallet preview";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatUsd(value: number, decimals = 2) {
  return `$${value.toFixed(decimals)}`;
}

const ROADMAP_QUARTERS = [
  {
    q: "Q1 2026",
    label: "Completed",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    status: "done",
    items: [
      "Auto-Savings DeFi · Aave v3 + Mento",
      "LiquidAI Agent (autonomous rebalance)",
      "Onboarding + Self Protocol",
      "Dashboard · Analytics · Transfer",
    ],
  },
  {
    q: "Q2 2026",
    label: "In Progress",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    status: "active",
    items: [
      "PIX Off-Ramp (Transfero / Bipa)",
      "Mento Bridge: cUSD → BRL (Belo)",
      "Yield-Covered Withdrawals",
      "Smart Contract Audit",
    ],
  },
  {
    q: "Q3 2026",
    label: "Physical Card + BaaS",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    status: "upcoming",
    items: [
      "Rain Cards API — Visa/cUSD Issuance",
      "JIT Funding Engine (webhook Visa)",
      "Striga KYC — Physical Card LatAm",
      "Cashback 1% in cUSD automatic",
    ],
  },
  {
    q: "Q4 2026",
    label: "Global Scale",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    status: "planned",
    items: [
      "Pismo (Visa) — Brazil integration",
      "Metal Card for Premium tier",
      "Collateralized Credit (70% DeFi)",
      "Tokenomics LQD — governance",
    ],
  },
];

const BAAS_PARTNERS = [
  {
    name: "Rain Cards",
    role: "Visa Issuance · cUSD/USDC",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    q: "Q3",
    desc: "Settles card expenses directly in stablecoins. Vault → Visa in milliseconds via JIT.",
    LogoIcon: RainIcon,
  },
  {
    name: "Striga",
    role: "Native KYC · Crypto Card",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    q: "Q3",
    desc: "Wallet + linked card with built-in compliance. Ideal for LatAm and Africa.",
    LogoIcon: KycIcon,
  },
  {
    name: "Daimo",
    role: "Cross-chain On-ramp · Any chain",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    q: "Q2",
    desc: "🆕 Mar/2026: MiniPay + Daimo allows receiving funds from Base, Solana, Ethereum or any L2 directly into Celo Vault. User doesn't need to be on Celo — the bridge is invisible.",
    LogoIcon: BridgeIcon,
  },
  {
    name: "Pismo (Visa)",
    role: "Core Banking · LatAm",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    q: "Q4",
    desc: "Infrastructure behind major Brazilian neobanks. Blockchain integration underway.",
    LogoIcon: BankIcon,
  },
  {
    name: "Transfero / Bipa",
    role: "Crypto → PIX + Global Off-Ramp",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    q: "Q2",
    desc: "Off-ramp via PIX in seconds. Global off-ramp to US/Europe accounts (SEPA) from 60+ countries, including Argentina and Mexico.",
    LogoIcon: PixIcon,
  },
  {
    name: "Mento V3",
    role: "Internet FX Layer · cUSD/cBRL/cEUR",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    q: "Q2",
    desc: "Mento V3 is the internet's exchange layer. cUSD↔cBRL↔cEUR with 40% lower spread vs V2. Main Stable Routing route for LiquidAI.",
    LogoIcon: SwapIcon,
  },
];

// ─── JIT Funding animation steps ─────────────────────────────────────────────

const JIT_STEPS = [
  { id: 0, label: "You swipe the card", icon: CreditCard, color: "#A3D977", desc: "In-store or e-commerce" },
  { id: 1, label: "Visa sends webhook", icon: Zap, color: "#06B6D4", desc: "< 200ms to LiquidAI" },
  { id: 2, label: "Agent checks Vault", icon: Bot, color: "#F59E0B", desc: "DeFi balance confirmed" },
  { id: 3, label: "Removes JIT liquidity", icon: Layers, color: "#8B5CF6", desc: "remove_liquidity() + swap()" },
  { id: 4, label: "Transaction approved", icon: CheckCircle2, color: "#10B981", desc: "T+0 · Merchant paid" },
];

// ─── PIX Off-Ramp Simulation ───────────────────────────────────────────────────

type PixStatus = "idle" | "quoting" | "swapping" | "sending" | "done";

const PIX_STEPS: Record<PixStatus, string> = {
  idle: "",
  quoting: "Quoting Mento rate (cUSD → BRL)...",
  swapping: "Swap via Mento Protocol: cUSD → Belo (BRL)...",
  sending: "Firing PIX via Transfero API...",
  done: "PIX sent successfully!",
};

// ─── Yield-free Withdrawals Widget ────────────────────────────────────────────

function YieldCoveredWidget({
  yieldToday,
  pixFee = 0.25,
}: {
  yieldToday: number;
  pixFee?: number;
}) {
  const freePix = Math.floor(yieldToday / pixFee);
  const pct = Math.min((yieldToday / (pixFee * 4)) * 100, 100);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, #0B3D25 0%, #0D4B2E 100%)",
        boxShadow: "0 4px 24px rgba(13,75,46,0.22)",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(163,217,119,0.15)" }}
        >
          <Gift className="w-5 h-5" style={{ color: "#A3D977" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-white">Free Withdrawals via Yield</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}
            >
              Q2 Preview
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {yieldToday > 0 ? (
              <>
                Today the agent accumulated{" "}
                <span className="text-white font-semibold">{formatUsd(yieldToday)}</span> in yield.
                This already subsidizes{" "}
                <span style={{ color: "#A3D977" }} className="font-semibold">
                  {freePix} free PIX withdrawals
                </span>{" "}
                without consuming principal.
              </>
            ) : (
              <>
                Not enough yield captured yet to subsidize withdrawals. Once the allocation earns, the agent starts covering recurring exits without touching the principal.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Yield bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Yield today: ${yieldToday.toFixed(2)}
          </span>
          <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
            {freePix} free PIX ✓
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #A3D977, #6EC94F)" }}
          />
        </div>
      </div>

      <div
        className="rounded-xl px-3 py-2.5 flex items-center gap-2"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A3D977" }} />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          <span className="text-white font-medium">Value Loop:</span> as yield grows, the agent can cover operational costs without reducing the wallet's principal.
        </p>
      </div>
    </div>
  );
}

// ─── JIT Funding Engine ───────────────────────────────────────────────────────

function JITFundingEngine() {
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setActiveStep(0);
    JIT_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i);
        if (i === JIT_STEPS.length - 1) {
          setTimeout(() => {
            setRunning(false);
            setActiveStep(-1);
          }, 2000);
        }
      }, i * 900);
    });
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid rgba(6,182,212,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap className="w-4 h-4" style={{ color: "#06B6D4" }} />
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              JIT Funding Engine
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4" }}
            >
              Q3 · Rain Cards
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Just-in-Time: your DeFi settles the card in real-time
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        {JIT_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === i;
          const isDone = activeStep > i;
          return (
            <motion.div
              key={step.id}
              animate={{
                opacity: activeStep === -1 ? 1 : isActive ? 1 : isDone ? 0.7 : 0.35,
                scale: isActive ? 1.01 : 1,
              }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: isActive
                  ? `${step.color}12`
                  : isDone
                  ? "rgba(16,185,129,0.05)"
                  : "var(--muted)",
                border: isActive ? `1px solid ${step.color}30` : "1px solid transparent",
              }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDone ? "rgba(16,185,129,0.15)" : isActive ? `${step.color}20` : "transparent",
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10B981" }} />
                ) : (
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? step.color : "var(--text-muted)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold"
                  style={{ color: isActive ? step.color : isDone ? "#10B981" : "var(--text-muted)" }}
                >
                  {step.label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                  {step.desc}
                </p>
              </div>
              {i < JIT_STEPS.length - 1 && (
                <ArrowRight
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: isActive ? step.color : "var(--border)" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={runSimulation}
        disabled={running}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: running ? "var(--muted)" : "linear-gradient(135deg, #06B6D4, #0284C7)",
          color: running ? "var(--text-muted)" : "#fff",
          boxShadow: running ? "none" : "0 4px 16px rgba(6,182,212,0.3)",
        }}
      >
        {running ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
            />
            Simulating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Simulate JIT Transaction
          </>
        )}
      </motion.button>
    </div>
  );
}

// ─── PIX Off-Ramp Simulator ────────────────────────────────────────────────────

function PixOffRampSimulator() {
  const [amount, setAmount] = useState("50");
  const [pixStatus, setPixStatus] = useState<PixStatus>("idle");
  const [pixKey, setPixKey] = useState("+55 11 99999-1234");
  const [showResult, setShowResult] = useState(false);

  const brlRate = 5.82; // cUSD → BRL
  const mentoSpread = 0.002; // 0.2%
  const networkFee = 0.01;
  const numAmount = parseFloat(amount) || 0;
  const brlAmount = numAmount * brlRate * (1 - mentoSpread) - networkFee * brlRate;
  const effectiveRate = brlAmount / numAmount;

  const simulate = async () => {
    if (numAmount <= 0 || pixStatus !== "idle") return;
    setShowResult(false);

    const steps: PixStatus[] = ["quoting", "swapping", "sending", "done"];
    for (const step of steps) {
      setPixStatus(step);
      await new Promise((r) => setTimeout(r, step === "done" ? 400 : 1100));
    }
    setShowResult(true);
    setTimeout(() => {
      setPixStatus("idle");
    }, 4000);
  };

  const isRunning = pixStatus !== "idle" && pixStatus !== "done";

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid rgba(16,185,129,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.1)" }}
        >
          <Banknote className="w-4.5 h-4.5" style={{ color: "#10B981" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              PIX Off-Ramp
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}
            >
              Q2 Preview
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            cUSD → BRL (Mento) → PIX (Transfero)
          </p>
        </div>
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Amount in cUSD
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ background: "var(--background)", border: "1.5px solid var(--border)" }}
        >
          <span className="font-mono text-xl font-bold" style={{ color: "var(--text-muted)" }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setShowResult(false); }}
            disabled={isRunning}
            className="flex-1 bg-transparent font-mono text-xl font-bold outline-none"
            style={{ color: "var(--text-primary)" }}
            min="1"
            max="500"
          />
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>cUSD</span>
        </div>
      </div>

      {/* PIX key */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          PIX Key
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5"
          style={{ background: "var(--background)", border: "1.5px solid var(--border)" }}
        >
          <Smartphone className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            disabled={isRunning}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Quote breakdown */}
      {numAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 mb-4 space-y-2"
          style={{ background: "var(--muted)" }}
        >
          {[
            { label: "Mento Rate (cUSD→BRL)", value: `R$ ${brlRate.toFixed(2)}/cUSD`, muted: true },
            { label: "Mento Spread", value: "-0.2%", muted: true },
            { label: "Celo Network Fee", value: `$${networkFee.toFixed(2)}`, muted: true },
            { label: "You Receive", value: `R$ ${brlAmount > 0 ? brlAmount.toFixed(2) : "–"}`, highlight: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{row.label}</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: row.highlight ? "#10B981" : "var(--text-secondary)" }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Status */}
      <AnimatePresence mode="wait">
        {pixStatus !== "idle" && (
          <motion.div
            key={pixStatus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-3 rounded-xl px-3 py-2.5 flex items-center gap-2"
            style={{
              background: pixStatus === "done" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${pixStatus === "done" ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.2)"}`,
            }}
          >
            {pixStatus === "done" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} />
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: "rgba(245,158,11,0.3)", borderTopColor: "#F59E0B" }}
              />
            )}
            <span
              className="text-xs font-semibold"
              style={{ color: pixStatus === "done" ? "#10B981" : "#F59E0B" }}
            >
              {PIX_STEPS[pixStatus]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-2xl p-4 text-center"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <p className="text-2xl mb-1">✅</p>
            <p className="text-sm font-bold" style={{ color: "#10B981" }}>
              R$ {brlAmount > 0 ? brlAmount.toFixed(2) : "0.00"} sent!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              PIX to {pixKey} · via Transfero · Celo Network
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={simulate}
        disabled={numAmount <= 0 || isRunning}
        className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background:
            numAmount > 0 && !isRunning
              ? "linear-gradient(135deg, #0D4B2E, #1a6b45)"
              : "var(--muted)",
          color: numAmount > 0 && !isRunning ? "#fff" : "var(--text-muted)",
          boxShadow: numAmount > 0 && !isRunning ? "0 4px 18px rgba(13,75,46,0.25)" : "none",
        }}
      >
        {isRunning ? (
          "Processing..."
        ) : (
          <>
            <Banknote className="w-4 h-4" />
            Simulate PIX Withdrawal
          </>
        )}
      </motion.button>

      <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        Demo · Real integration via Transfero + Mento in Q2
      </p>
    </div>
  );
}

// ─── BaaS Partners Section ─────────────────────────────────────────────────────

function BaaSPartners() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const qColor: Record<string, string> = {
    Q2: "#F59E0B",
    Q3: "#06B6D4",
    Q4: "#8B5CF6",
  };

  return (
    <div className="space-y-2.5">
      {BAAS_PARTNERS.map((p) => (
        <motion.div
          key={p.name}
          layout
          className="rounded-2xl overflow-hidden cursor-pointer"
          style={{
            background: "var(--surface-solid)",
            border: `1px solid ${expanded === p.name ? p.color + "30" : "transparent"}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
          onClick={() => setExpanded(expanded === p.name ? null : p.name)}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: p.bg }}
            >
              {(() => { const L = (p as any).LogoIcon; return <L className="w-5 h-5" style={{ color: p.color }} />; })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `${qColor[p.q]}15`, color: qColor[p.q] }}
                >
                  {p.q}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.role}</p>
            </div>
            <ChevronRight
              className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
              style={{
                color: "var(--text-muted)",
                transform: expanded === p.name ? "rotate(90deg)" : "none",
              }}
            />
          </div>
          <AnimatePresence>
            {expanded === p.name && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="px-4 pb-4 pt-1"
                  style={{ borderTop: "1px solid var(--border-light)" }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Roadmap Timeline ─────────────────────────────────────────────────────────

function RoadmapTimeline() {
  const [expanded, setExpanded] = useState<string | null>("Q3 2026");

  return (
    <div className="space-y-3">
      {ROADMAP_QUARTERS.map((quarter, qi) => {
        const isExpanded = expanded === quarter.q;
        const statusIcon: Record<typeof quarter.status, string> = {
          done: "✓",
          active: "⚡",
          upcoming: "🚀",
          planned: "📅",
        };

        return (
          <motion.div
            key={quarter.q}
            layout
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--surface-solid)",
              border: `1px solid ${isExpanded ? quarter.color + "30" : "transparent"}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              onClick={() => setExpanded(isExpanded ? null : quarter.q)}
            >
              {/* Timeline dot */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: quarter.bg }}
              >
                {statusIcon[quarter.status]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {quarter.q}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: quarter.bg, color: quarter.color }}
                  >
                    {quarter.label}
                  </span>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--text-muted)",
                  transform: isExpanded ? "rotate(90deg)" : "none",
                }}
              />
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-4 space-y-2"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    {quarter.items.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-2.5 pt-2"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: quarter.bg }}
                        >
                          <span style={{ fontSize: 9, color: quarter.color, fontWeight: 700 }}>
                            {quarter.status === "done" ? "✓" : i + 1}
                          </span>
                        </div>
                        <span
                          className="text-xs"
                          style={{
                            color:
                              quarter.status === "done"
                                ? "var(--text-muted)"
                                : "var(--text-secondary)",
                            textDecoration: quarter.status === "done" ? "line-through" : "none",
                          }}
                        >
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Revenue Model ────────────────────────────────────────────────────────────

function RevenueModel() {
  const items = [
    { label: "Interchange (Visa)", value: "0.8–1.5%", share: "per card transaction", color: "#06B6D4" },
    { label: "Liquidity Spread", value: "0.2–0.5%", share: "crypto → fiat conversion", color: "#8B5CF6" },
    { label: "Yield Share", value: "1% of pool", share: "protocol retains, user gets 5%", color: "#A3D977" },
    { label: "Premium Tier", value: "Metal/Plus", share: "cashback, unlimited withdrawals", color: "#F59E0B" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: "#A3D977" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Transparent Revenue Model
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          How the protocol is sustainable without charging the user directly
        </p>
      </div>
      {items.map((item, i) => (
        <div
          key={item.label}
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border-light)" : "none" }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: item.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {item.label}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.share}</p>
          </div>
          <span
            className="font-mono text-xs font-bold flex-shrink-0"
            style={{ color: item.color }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Liquidity Risk Engine data ───────────────────────────────────────────────

const RISK_METRICS = [
  {
    id: "il",
    label: "Impermanent Loss",
    value: "0.0%",
    pct: 18,
    statusLabel: "Low Risk",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    icon: AlertTriangle,
    desc: "No unmanaged exposure detected in current route",
  },
  {
    id: "liquidity",
    label: "Pool Depth",
    value: "Live",
    pct: 85,
    statusLabel: "Healthy",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    icon: Activity,
    desc: "Protocol depth read before each exit",
  },
  {
    id: "withdrawal",
    label: "Exit Time",
    value: "2–5s",
    pct: 95,
    statusLabel: "Ultra Fast",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    icon: Clock,
    desc: "Celo finality in 5s · Buffer covers gap",
  },
];

const INTENT_SIGNALS = [
  { signal: "User opens card screen", action: "Preloads available buffer", icon: "👁️", lag: "0ms" },
  { signal: "Taps 'Pay'", action: "Initiates early remove_liquidity()", icon: "👆", lag: "~50ms" },
  { signal: "Types amount at POS", action: "Swap cUSD ready in mempool", icon: "⌨️", lag: "~200ms" },
  { signal: "Visa webhook arrives", action: "Instant approval · T+0", icon: "⚡", lag: "<200ms" },
];

// ─── Liquidity Risk Engine Component ─────────────────────────────────────────

function LiquidityRiskEngine() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid rgba(163,217,119,0.12)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
      >
        <Activity className="w-4 h-4" style={{ color: "#A3D977" }} />
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Liquidity Risk Engine
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
        >
          3 active metrics
        </span>
      </div>

      {RISK_METRICS.map((m, i) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="px-4 py-3.5"
            style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : "none" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{m.label}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: m.bg, color: m.color, fontSize: "10px" }}
                    >
                      {m.statusLabel}
                    </span>
                    <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: m.color }}>
                      {m.value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1.5 rounded-full mb-1.5" style={{ background: "var(--muted)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: m.color }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>{m.desc}</p>
          </div>
        );
      })}

      <div
        className="mx-4 mb-4 rounded-xl p-3 flex items-start gap-2"
        style={{ background: "rgba(163,217,119,0.06)", border: "1px solid rgba(163,217,119,0.15)" }}
      >
        <Brain className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#A3D977" }} />
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <span style={{ color: "#A3D977", fontWeight: 600 }}>Agente avalia:</span> qual pool tem menor IL + maior profundidade para saída segura. Sempre prioriza{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>cUSD/USDC</span> na rota de liquidação.
        </p>
      </div>
    </div>
  );
}

// ─── Transaction Intent Detection ─────────────────────────────────────────────

function TransactionIntentDetection() {
  const [activeSignal, setActiveSignal] = useState(-1);
  const [running, setRunning] = useState(false);

  const runDemo = () => {
    if (running) return;
    setRunning(true);
    setActiveSignal(0);
    INTENT_SIGNALS.forEach((_, i) => {
      setTimeout(() => {
        setActiveSignal(i);
        if (i === INTENT_SIGNALS.length - 1) {
          setTimeout(() => { setRunning(false); setActiveSignal(-1); }, 2500);
        }
      }, i * 850);
    });
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid rgba(139,92,246,0.15)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-4 h-4" style={{ color: "#8B5CF6" }} />
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Transaction Intent Detection
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Agente detecta intenção de pagamento e pré-carrega liquidez <em>antes</em> do webhook Visa chegar
      </p>

      <div className="space-y-2 mb-4">
        {INTENT_SIGNALS.map((s, i) => {
          const isActive = activeSignal === i;
          const isDone = activeSignal > i;
          return (
            <motion.div
              key={i}
              animate={{
                opacity: activeSignal === -1 ? 1 : isActive ? 1 : isDone ? 0.65 : 0.3,
                scale: isActive ? 1.01 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 rounded-xl p-2.5"
              style={{
                background: isActive ? "rgba(139,92,246,0.08)" : isDone ? "rgba(16,185,129,0.04)" : "var(--muted)",
                border: isActive ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: isActive ? "#8B5CF6" : isDone ? "#10B981" : "var(--text-muted)" }}>
                  {s.signal}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                  → {s.action}
                </p>
              </div>
              <span
                className="text-xs font-mono font-bold flex-shrink-0"
                style={{ color: isActive ? "#8B5CF6" : isDone ? "#10B981" : "var(--text-muted)", fontSize: "10px" }}
              >
                {s.lag}
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={runDemo}
        disabled={running}
        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: running ? "var(--muted)" : "linear-gradient(135deg, #8B5CF6, #7C3AED)",
          color: running ? "var(--text-muted)" : "#fff",
          boxShadow: running ? "none" : "0 4px 14px rgba(139,92,246,0.3)",
        }}
      >
        {running ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white"
            />
            Detectando sinais...
          </>
        ) : (
          <>
            <Brain className="w-3.5 h-3.5" />
            Simular Detecção de Intenção
          </>
        )}
      </motion.button>
    </div>
  );
}

// ─── Stable Routing Card ──────────────────────────────────────────────────────

function StableRoutingCard() {
  const routes = [
    { from: "cUSD", to: "USDC", via: "Mento", preferred: true, reason: "Spread mínimo · native Celo" },
    { from: "cUSD", to: "cEUR", via: "Mento", preferred: false, reason: "Conversão EUR para viagens" },
    { from: "USDC", to: "cUSD", via: "Ubeswap", preferred: false, reason: "Fallback se Mento tiver baixa liquidez" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: "1px solid rgba(6,182,212,0.12)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
      >
        <Route className="w-4 h-4" style={{ color: "#06B6D4" }} />
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Stable Routing
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4" }}
        >
          Nunca tokens voláteis
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          O agente <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>sempre roteia liquidações via stablecoins</span> — cUSD ou USDC. Tokens voláteis (ETH, CELO) nunca são usados como ponte.
        </p>
        <div className="space-y-2">
          {routes.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: r.preferred ? "rgba(163,217,119,0.07)" : "var(--muted)",
                border: r.preferred ? "1px solid rgba(163,217,119,0.2)" : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(163,217,119,0.15)", color: "#A3D977" }}>
                  {r.from}
                </span>
                <ArrowRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.12)", color: "#06B6D4" }}>
                  {r.to}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                  via {r.via} · {r.reason}
                </p>
              </div>
              {r.preferred && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: "rgba(163,217,119,0.2)", color: "#A3D977", fontSize: "9px" }}>
                  ★ Principal
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Celo Ecosystem Live Feed ─────────────────────────────────────────────────

const CELO_NEWS = [
  {
    id: "morpho",
    Icon: LoopIcon,
    title: "Celo Mondo + Morpho",
    tag: "LIVE · Mar 2026",
    tagColor: "#10B981",
    tagBg: "rgba(16,185,129,0.1)",
    headline: "Looping via stCELO — APY turbinado",
    desc: "stCELO agora como colateral no Morpho para looping de yield. APY orgânico 1.85% turbinado para 8–15% via alavancagem gerenciada pelo agente LiquidAI — sem que o usuário precise entender de colateralização.",
    impact: "Ativado nos perfis Balanceado e Arrojado do Agente.",
    color: "#10B981",
  },
  {
    id: "daimo",
    Icon: BridgeIcon,
    title: "MiniPay + Daimo",
    tag: "LIVE · Mar 2026",
    tagColor: "#A3D977",
    tagBg: "rgba(163,217,119,0.1)",
    headline: "Receba de qualquer chain",
    desc: "MiniPay + Daimo permite receber fundos de Base, Solana, Ethereum ou qualquer L2 diretamente no Vault Celo. O bridge é invisível — o usuário não precisa ter CELO para começar.",
    impact: "On-ramp universal para o capital real que chega à wallet.",
    color: "#A3D977",
  },
  {
    id: "offramp",
    Icon: WorldPayIcon,
    title: "Off-ramp Global MiniPay",
    tag: "LIVE · Mar 2026",
    tagColor: "#06B6D4",
    tagBg: "rgba(6,182,212,0.1)",
    headline: "EUA, Europa, LatAm (60+ países)",
    desc: "MiniPay agora envia diretamente para contas bancárias nos EUA e Europa via SEPA, incluindo Argentina e México. LiquidAI é a camada inteligente que decide quando e quanto sacar para maximizar yield.",
    impact: "Trilho de saída oficial — LiquidAI otimiza o timing.",
    color: "#06B6D4",
  },
  {
    id: "mento",
    Icon: SwapIcon,
    title: "Mento V3 — FX Layer",
    tag: "LIVE · Mar 2026",
    tagColor: "#F59E0B",
    tagBg: "rgba(245,158,11,0.1)",
    headline: "Spread 40% menor · cBRL nativo",
    desc: "Mento V3 é a camada de câmbio da internet. Conversões ultra-eficientes cUSD↔cBRL (Belo)↔cEUR. Cada saque PIX gera 40% mais real líquido para o usuário vs Mento V2.",
    impact: "+40% de spread preservado por transação PIX.",
    color: "#F59E0B",
  },
  {
    id: "hackathon",
    Icon: TrophySvg,
    title: "Build Agents Hackathon V2",
    tag: "Deadline: 18 Mar",
    tagColor: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.1)",
    headline: "Categoria: Agentes Financeiros",
    desc: "LiquidAI é o fit perfeito: capital real na wallet, problema real de idle cash e uma solução autônoma que responde ao rendimento on-chain. Foco em utilidade para mercados emergentes e execução verificável.",
    impact: "Submissão demonstrável: agente + yield + cartão + PIX.",
    color: "#8B5CF6",
  },
];

function CeloEcosystemFeed() {
  const [expanded, setExpanded] = useState<string | null>("morpho");

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface-solid)", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid rgba(163,217,119,0.12)" }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
      >
        <NetworkIcon className="w-4.5 h-4.5 flex-shrink-0" style={{ color: "#A3D977" }} />
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Celo Ecosystem · Março 2026
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: "9px" }}>
          5 updates
        </span>
        <span className="ml-auto w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#A3D977" }} />
      </div>

      {CELO_NEWS.map((item, i) => (
        <motion.div
          key={item.id}
          layout
          className="overflow-hidden cursor-pointer"
          style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : "none" }}
          onClick={() => setExpanded(expanded === item.id ? null : item.id)}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: item.tagBg }}
            >
              {(() => { const NI = (item as any).Icon; return <NI className="w-4.5 h-4.5" style={{ color: item.color }} />; })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{item.title}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{ background: item.tagBg, color: item.tagColor, fontSize: "9px" }}
                >
                  {item.tag}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.headline}</p>
            </div>
            <ChevronRight
              className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
              style={{ color: "var(--text-muted)", transform: expanded === item.id ? "rotate(90deg)" : "none" }}
            />
          </div>

          <AnimatePresence>
            {expanded === item.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <p className="text-xs leading-relaxed pt-3 mb-2" style={{ color: "var(--text-secondary)" }}>
                    {item.desc}
                  </p>
                  <div
                    className="flex items-start gap-2 rounded-xl px-3 py-2"
                    style={{ background: item.tagBg }}
                  >
                    <span className="text-xs flex-shrink-0" style={{ color: item.color, fontWeight: 700, fontSize: "10px" }}>
                      ↗ LiquidAI:
                    </span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>
                      {item.impact}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Tab navigation ───────────────────────────────────────────────────────────

const TABS = [
  { id: "card", label: "Cartão", icon: CreditCard },
  { id: "pix", label: "PIX", icon: Banknote },
  { id: "infra", label: "Infraestrutura", icon: Rocket },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function CardPage() {
  useTheme();
  const navigate = useNavigate();
  const { address, shortAddress } = useCeloWallet();
  const [cardVisible, setCardVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "pix" | "infra">("card");
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    let alive = true;

    if (!address) {
      setDashboard(null);
      return () => {
        alive = false;
      };
    }

    apiGet<DashboardPayload>("/api/dashboard", { address, riskMode: "balanced" })
      .then((payload) => {
        if (!alive) return;
        setDashboard(payload);
      })
      .catch(() => {
        if (!alive) return;
        setDashboard(null);
      });

    return () => {
      alive = false;
    };
  }, [address]);

  const handleCopy = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, "")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardholderLabel = shortAddress ? `Wallet ${shortAddress}` : "Wallet preview";
  const walletCapitalUsd = dashboard?.summary.balanceUsd ?? 0;
  const managedCapitalUsd = dashboard?.summary.managedCapitalUsd ?? 0;
  const liquidityBufferUsd = dashboard?.summary.liquidityBufferUsd ?? 0;
  const monthlyYieldUsd = dashboard?.summary.monthlyYieldUsd ?? 0;
  const utilizationPct = 0;
  const availableSpendUsd = liquidityBufferUsd;
  const creditPreviewUsd = walletCapitalUsd * 0.7;
  const currentPixTransactions = (dashboard?.transactions || [])
    .filter((tx) => tx.kind === "pix")
    .map((tx) => ({
      id: tx.id,
      name: tx.name,
      amount: tx.amount,
      date: tx.subtitle,
      type: tx.type,
      Icon: tx.type === "income" ? YieldCaptureIcon : PixIcon,
      color: tx.type === "income" ? "#10B981" : "#0D4B2E",
      bg: tx.type === "income" ? "rgba(16,185,129,0.08)" : "rgba(13,75,46,0.08)",
    }));

  return (
    <div className="min-h-dvh bg-background pb-28 overflow-x-hidden">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.5rem" }}>
              Cartão & Banking
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Yield-Backed Banking · LiquidAI
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: "rgba(163,217,119,0.12)", border: "1px solid rgba(163,217,119,0.25)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#A3D977" }} />
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
              Agente Ativo
            </span>
          </div>
        </div>
      </header>

      {/* ── Q3 INFO BANNER ─────────────────────────────────── */}
      <AnimatePresence>
        {showInfoBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="mx-5 mb-4 rounded-2xl p-3.5 flex items-start gap-3"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.2)",
            }}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#06B6D4" }} />
            <p className="flex-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <span className="font-semibold" style={{ color: "#06B6D4" }}>Roadmap Q3:</span>{" "}
              O Cartão Físico + JIT Funding via Rain Cards/Striga está planejado para Q3 2026. Explore as features interativas abaixo como preview.
            </p>
            <button onClick={() => setShowInfoBanner(false)}>
              <X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TAB SELECTOR ───────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTab === id ? "#0D4B2E" : "transparent",
                color: activeTab === id ? "#FFFFFF" : "var(--text-muted)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ════════════ TAB: CARTÃO ════════════ */}
        {activeTab === "card" && (
          <motion.div
            key="card"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            {/* Virtual Card */}
            <div className="px-5 mb-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden border border-white/10"
                style={{
                  background: isLocked
                    ? "linear-gradient(135deg, #111827 0%, #000000 100%)"
                    : "linear-gradient(135deg, #0a0a0a 0%, #111 100%)",
                  boxShadow: isLocked
                    ? "0 8px 32px rgba(0,0,0,0.5)"
                    : "0 12px 40px rgba(13,75,46,0.4)",
                  aspectRatio: "1.586",
                  transition: "background 0.4s ease",
                }}
              >
                {/* Glow map effect */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(163,217,119,0.2) 0%, transparent 70%)",
                    transform: "translateY(20%) scale(1.5)"
                  }}
                />
                {/* Dotted map SVG placeholder or abstract dots */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(rgba(163,217,119,0.5) 1px, transparent 1px)",
                    backgroundSize: "8px 8px",
                    maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                    transform: "translateY(30%) scaleY(0.5) scaleX(1.2)"
                  }}
                />

                {/* Q3 badge on card */}
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full"
                  style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", backdropFilter: "blur(4px)" }}
                >
                  <span style={{ color: "#06B6D4", fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>
                    PREVIEW · Q3
                  </span>
                </div>

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-20" style={{ backdropFilter: "blur(2px)" }}>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                      >
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white/90 text-sm font-medium tracking-wide">Cartão Bloqueado</span>
                    </div>
                  </div>
                )}

                <div
                  className="relative z-10 p-6 h-full flex flex-col justify-between"
                  style={{ opacity: isLocked ? 0.3 : 1 }}
                >
                  <div className="flex items-start justify-between">
                    {/* Premium Metallic Chip */}
                    <div className="w-11 h-8 rounded-md flex flex-col justify-evenly p-1 border border-black/20 shadow-inner" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 50%, #f5f5f5 100%)" }}>
                      <div className="w-full h-[1px] bg-black/20"></div>
                      <div className="w-full h-[1px] bg-black/20"></div>
                      <div className="w-full h-[1px] bg-black/20"></div>
                    </div>
                    
                    {/* MiniPay / LiquidAI Logo */}
                    <div className="flex items-center gap-2">
                      <div className="text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold leading-none text-[15px] tracking-tight">MiniPay</span>
                        <span className="text-[#A3D977] font-bold leading-none text-[8px] tracking-[0.2em] mt-1">LIQUIDAI</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cardVisible ? "show" : "hide"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[1.1rem] text-white tracking-[0.2em] drop-shadow-md"
                      >
                        {cardVisible ? CARD_NUMBER : MASKED_NUMBER}
                      </motion.div>
                    </AnimatePresence>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Titular</p>
                          <p className="text-white font-medium text-xs tracking-wider drop-shadow-sm">{cardholderLabel}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Expira</p>
                          <p className="text-white font-mono text-xs tracking-wider drop-shadow-sm">25/29</p>
                        </div>
                        <AnimatePresence>
                          {cardVisible && (
                            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}>
                              <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">CVV</p>
                              <p className="text-white font-mono text-xs tracking-wider drop-shadow-sm">847</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* VISA Logo */}
                      <div className="text-white text-3xl font-bold italic tracking-tighter opacity-90 drop-shadow-md" style={{ fontFamily: "Arial, sans-serif" }}>
                        VISA
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Coming soon section */}
              <div className="px-5 mt-8 mb-6">
                <h2 className="text-[22px] font-bold mb-6 tracking-tight" style={{ color: "var(--text-primary)" }}>
                  Coming soon!
                </h2>
                <div className="space-y-5 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                      <Tag className="w-5 h-5" style={{ color: "#60A5FA" }} />
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                      Earn cashback in yield everytime you use the card
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                      <CreditCard className="w-5 h-5" style={{ color: "#60A5FA" }} />
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                      Get the virtual card instantly in your wallet
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                      <Coins className="w-5 h-5" style={{ color: "#60A5FA" }} />
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                      Save on FX fees when traveling
                    </p>
                  </div>
                </div>
                
                <button
                  disabled
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all tracking-wide"
                  style={{ background: "var(--surface-solid)", color: "var(--text-muted)", opacity: 0.6 }}
                >
                  You're in
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* ════════════ TAB: PIX ════════════ */}
        {activeTab === "pix" && (
          <motion.div
            key="pix"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="px-5 space-y-5"
          >
            {/* Intro */}
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "var(--surface-solid)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <Globe className="w-5 h-5" style={{ color: "#10B981" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Off-Ramp: cUSD → PIX
                </p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Fluxo:{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    cUSD → Mento Bridge → Belo (BRL) → Transfero API → PIX na sua conta
                  </span>
                </p>
              </div>
            </div>

            {/* PIX Simulator */}
            <PixOffRampSimulator />

            {/* Yield-covered */}
            <YieldCoveredWidget />

            {/* Flow diagram */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--surface-solid)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Arquitetura Técnica
              </p>
              <div className="space-y-2">
                {[
                  { step: "1", label: "User → insere chave PIX + valor", color: "#A3D977" },
                  { step: "2", label: "Vault → LiquidAI desbloqueio de cUSD", color: "#06B6D4" },
                  { step: "3", label: "Mento AMM → swap cUSD → Belo (BRL)", color: "#8B5CF6" },
                  { step: "4", label: "Transfero API → dispara PIX em BRL", color: "#F59E0B" },
                  { step: "5", label: "Conta bancária recebe PIX em <5s", color: "#10B981" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ background: s.color }}
                    >
                      {s.step}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════ TAB: INFRAESTRUTURA ════════════ */}
        {activeTab === "infra" && (
          <motion.div
            key="infra"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="px-5 space-y-5"
          >
            {/* JIT Engine */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                JIT Funding · Como Coinbase/Revolut fazem
              </p>
              <JITFundingEngine />
            </div>

            {/* Transaction Intent Detection */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Intent Detection · Pre-autorização de Liquidez
              </p>
              <TransactionIntentDetection />
            </div>

            {/* Liquidity Risk Engine */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Liquidity Risk Engine · Monitoramento contínuo
              </p>
              <LiquidityRiskEngine />
            </div>

            {/* Stable Routing */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Stable Routing · Rota de liquidação segura
              </p>
              <StableRoutingCard />
            </div>

            {/* Celo Ecosystem Live */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Ecossistema Celo · Março 2026 Live
              </p>
              <CeloEcosystemFeed />
            </div>

            {/* BaaS Partners */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Parceiros BaaS · Card-as-a-Service
              </p>
              <BaaSPartners />
            </div>

            {/* Roadmap */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Roadmap Técnico
              </p>
              <RoadmapTimeline />
            </div>

            {/* Revenue model */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Sustentabilidade do Protocolo
              </p>
              <RevenueModel />
            </div>

            {/* Credit collateral model */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, #0B3D25, #0D4B2E)",
                boxShadow: "0 4px 24px rgba(13,75,46,0.22)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" style={{ color: "#A3D977" }} />
                <span className="text-sm font-bold text-white">Crédito Colateralizado · Q4</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(139,92,246,0.3)", color: "#C4B5FD" }}
                >
                  Planejado
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                Modelo planejado: o usuário mantém o capital real da própria wallet em DeFi e recebe uma linha de crédito proporcional ao colateral disponível. O yield ajuda a compensar o custo de uso sem desmontar a posição principal.
              </p>
              <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
                {[
                  { label: "Capital atual", value: formatUsd(walletCapitalUsd) },
                  { label: "Preview 70%", value: formatUsd(creditPreviewUsd) },
                  { label: "Juros pagos por", value: "Yield" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="px-2 py-2.5 text-center"
                    style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
                  >
                    <div className="font-mono font-bold text-sm" style={{ color: "#A3D977" }}>
                      {s.value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch summary */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--surface-solid)",
                border: "1px solid rgba(163,217,119,0.2)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" style={{ color: "#A3D977" }} />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  O "Santo Graal" para Celo + MiniPay
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                "Yield-Backed Banking" resolve o maior problema do usuário de baixa renda:{" "}
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  o custo de oportunidade de deixar o dinheiro parado
                </span>
                . Com o capital real da wallet, o LiquidAI projeta{" "}
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatUsd(monthlyYieldUsd)}/mês
                </span>{" "}
                em rendimento e mantém um{" "}
                <span style={{ color: "#A3D977" }} className="font-semibold">
                  loop de valor progressivamente sustentável
                </span>
                .
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
}
