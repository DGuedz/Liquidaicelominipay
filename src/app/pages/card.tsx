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
} from "lucide-react";
import { BottomNavigation } from "../components/bottom-navigation";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router";
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

const CARD_NUMBER = "4328 7453 6932 3424";
const MASKED_NUMBER = "•••• •••• •••• 3424";

const cardTransactions = [
  { id: 1, name: "Farmácia Popular", amount: -4.5, date: "Hoje, 10:15", type: "expense", Icon: PharmacyIcon, color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  { id: 2, name: "Yield Capture", amount: +1.25, date: "Hoje, 08:00", type: "income", Icon: YieldCaptureIcon, color: "#A3D977", bg: "rgba(163,217,119,0.1)" },
  { id: 3, name: "Recarga Tim", amount: -2.0, date: "13 Mar, 19:45", type: "expense", Icon: PhoneTopupIcon, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  { id: 4, name: "Mercado Local", amount: -3.5, date: "12 Mar, 14:30", type: "expense", Icon: GroceryIcon, color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  { id: 5, name: "Depósito cUSD", amount: +150.0, date: "10 Mar, 09:00", type: "income", Icon: BriefcaseIcon, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
];

const ROADMAP_QUARTERS = [
  {
    q: "Q1 2026",
    label: "Concluído",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    status: "done",
    items: [
      "Vault DeFi · Aave v3 + Mento",
      "LiquidAI Agent (rebalance autônomo)",
      "Onboarding + Self Protocol",
      "Dashboard · Analytics · Transfer",
    ],
  },
  {
    q: "Q2 2026",
    label: "Em andamento",
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
    label: "Cartão Físico + BaaS",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    status: "upcoming",
    items: [
      "Rain Cards API — Emissão Visa/cUSD",
      "JIT Funding Engine (webhook Visa)",
      "Striga KYC — Cartão Físico LatAm",
      "Cashback 1% em cUSD automático",
    ],
  },
  {
    q: "Q4 2026",
    label: "Escala Global",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    status: "planned",
    items: [
      "Pismo (Visa) — integração Brasil",
      "Cartão Metal para tier Premium",
      "Crédito colateralizado (70% DeFi)",
      "Tokenomics LQD — governance",
    ],
  },
];

const BAAS_PARTNERS = [
  {
    name: "Rain Cards",
    role: "Emissão Visa · cUSD/USDC",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    q: "Q3",
    desc: "Liquida despesas do cartão diretamente em stablecoins. Vault → Visa em milissegundos via JIT.",
    LogoIcon: RainIcon,
  },
  {
    name: "Striga",
    role: "KYC nativo · Cartão crypto",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    q: "Q3",
    desc: "Carteira + cartão vinculado com conformidade embutida. Ideal para LatAm e África.",
    LogoIcon: KycIcon,
  },
  {
    name: "Daimo",
    role: "Cross-chain On-ramp · Qualquer rede",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    q: "Q2",
    desc: "🆕 Mar/2026: MiniPay + Daimo permite receber fundos de Base, Solana, Ethereum ou qualquer L2 diretamente no Vault Celo. O usuário não precisa estar na Celo — o bridge é invisível.",
    LogoIcon: BridgeIcon,
  },
  {
    name: "Pismo (Visa)",
    role: "Core Banking · LatAm",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    q: "Q4",
    desc: "Infraestrutura por trás dos maiores neobancos brasileiros. Integração blockchain em curso.",
    LogoIcon: BankIcon,
  },
  {
    name: "Transfero / Bipa",
    role: "Crypto → PIX + Off-Ramp Global",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    q: "Q2",
    desc: "Off-ramp via PIX em segundos. Off-ramp global para contas EUA/Europa (SEPA) de 60+ países, incluindo Argentina e México.",
    LogoIcon: PixIcon,
  },
  {
    name: "Mento V3",
    role: "FX Layer da Internet · cUSD/cBRL/cEUR",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    q: "Q2",
    desc: "Mento V3 é a camada de câmbio da internet. cUSD↔cBRL↔cEUR com spread 40% menor vs V2. Rota principal de Stable Routing do LiquidAI.",
    LogoIcon: SwapIcon,
  },
];

// ─── JIT Funding animation steps ─────────────────────────────────────────────

const JIT_STEPS = [
  { id: 0, label: "Você passa o cartão", icon: CreditCard, color: "#A3D977", desc: "Na loja ou e-commerce" },
  { id: 1, label: "Visa envia webhook", icon: Zap, color: "#06B6D4", desc: "< 200ms para LiquidAI" },
  { id: 2, label: "Agente verifica Vault", icon: Bot, color: "#F59E0B", desc: "Saldo DeFi confirmado" },
  { id: 3, label: "Remove liquidez JIT", icon: Layers, color: "#8B5CF6", desc: "remove_liquidity() + swap()" },
  { id: 4, label: "Transação aprovada", icon: CheckCircle2, color: "#10B981", desc: "T+0 · Merchant pago" },
];

// ─── PIX Off-Ramp Simulation ───────────────────────────────────────────────────

type PixStatus = "idle" | "quoting" | "swapping" | "sending" | "done";

const PIX_STEPS: Record<PixStatus, string> = {
  idle: "",
  quoting: "Consultando taxa Mento (cUSD → BRL)...",
  swapping: "Swap via Mento Protocol: cUSD → Belo (BRL)...",
  sending: "Disparando PIX via Transfero API...",
  done: "PIX enviado com sucesso!",
};

// ─── Yield-free Withdrawals Widget ────────────────────────────────────────────

function YieldCoveredWidget() {
  const yieldToday = 0.72;
  const pixFee = 0.25;
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
            <p className="text-sm font-bold text-white">Saques Gratuitos via Yield</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}
            >
              Q2 Preview
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Hoje o agente gerou{" "}
            <span className="text-white font-semibold">${yieldToday.toFixed(2)}</span> de yield.
            Isso cobre{" "}
            <span style={{ color: "#A3D977" }} className="font-semibold">
              {freePix} saques PIX gratuitos
            </span>{" "}
            (normalmente $0.25/cada).
          </p>
        </div>
      </div>

      {/* Yield bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Yield hoje: ${yieldToday.toFixed(2)}
          </span>
          <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
            {freePix} PIX grátis ✓
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
          <span className="text-white font-medium">Loop de Valor:</span> DeFi paga seus custos bancários. Quanto mais yield, mais saques grátis.
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
            Just-in-Time: seu DeFi liquida o cartão em tempo real
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
            Simulando...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Simular Transação JIT
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
          Valor em cUSD
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
          Chave PIX
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
            { label: "Taxa Mento (cUSD→BRL)", value: `R$ ${brlRate.toFixed(2)}/cUSD`, muted: true },
            { label: "Spread Mento", value: "-0.2%", muted: true },
            { label: "Taxa de rede Celo", value: `$${networkFee.toFixed(2)}`, muted: true },
            { label: "Você recebe", value: `R$ ${brlAmount > 0 ? brlAmount.toFixed(2) : "–"}`, highlight: true },
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
              R$ {brlAmount > 0 ? brlAmount.toFixed(2) : "0.00"} enviados!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              PIX para {pixKey} · via Transfero · Celo Network
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
          "Processando..."
        ) : (
          <>
            <Banknote className="w-4 h-4" />
            Simular Saque PIX
          </>
        )}
      </motion.button>

      <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        Demo · Integração real via Transfero + Mento em Q2
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
    { label: "Interchange (Visa)", value: "0.8–1.5%", share: "por transação cartão", color: "#06B6D4" },
    { label: "Spread de Liquidez", value: "0.2–0.5%", share: "conversão cripto → fiat", color: "#8B5CF6" },
    { label: "Yield Share", value: "1% do pool", share: "protocolo retém, user ganha 5%", color: "#A3D977" },
    { label: "Premium Tier", value: "Metal/Plus", share: "cashback, saques ilimitados", color: "#F59E0B" },
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
            Modelo de Receita Transparente
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Como o protocolo é sustentável sem cobrar o usuário diretamente
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
    value: "-$2.10",
    pct: 18,
    statusLabel: "Baixo risco",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    icon: AlertTriangle,
    desc: "Agente saiu de 1 pool com IL acima de 2%",
  },
  {
    id: "liquidity",
    label: "Profundidade do Pool",
    value: "$4.2M",
    pct: 85,
    statusLabel: "Saudável",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    icon: Activity,
    desc: "Liquidez suficiente para exit instantâneo",
  },
  {
    id: "withdrawal",
    label: "Tempo de Saída",
    value: "2–5s",
    pct: 95,
    statusLabel: "Ultrarrápido",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    icon: Clock,
    desc: "Celo finalidade em 5s · Buffer cobre gap",
  },
];

const INTENT_SIGNALS = [
  { signal: "Usuário abre tela do cartão", action: "Pré-carrega $50 no buffer", icon: "👁️", lag: "0ms" },
  { signal: "Toca em 'Pagar'", action: "Inicia remove_liquidity() antecipado", icon: "👆", lag: "~50ms" },
  { signal: "Digita valor no PDV", action: "Swap cUSD pronto na mempool", icon: "⌨️", lag: "~200ms" },
  { signal: "Webhook Visa chega", action: "Aprovação instantânea · T+0", icon: "⚡", lag: "<200ms" },
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
          3 métricas ativas
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
    impact: "On-ramp universal para os $1.200 iniciais.",
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
    desc: "LiquidAI é o fit perfeito: usuário real ($1.200), problema real (inflação), solução autônoma (agente). Foco em utilidade para mercados emergentes — exatamente o que os juízes do Marek (Celo Foundation) buscam.",
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
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [cardVisible, setCardVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "pix" | "infra">("card");
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, "")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: isLocked
                    ? "linear-gradient(135deg, #374151 0%, #1F2937 100%)"
                    : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 60%, #0f5535 100%)",
                  boxShadow: isLocked
                    ? "0 8px 32px rgba(0,0,0,0.2)"
                    : "0 8px 32px rgba(13,75,46,0.28)",
                  aspectRatio: "1.586",
                  transition: "background 0.4s ease",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.05)", transform: "translate(35%,-35%)" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "rgba(163,217,119,0.08)", transform: "translate(-25%,35%)" }}
                />
                {/* Q3 badge on card */}
                <div
                  className="absolute top-4 right-4 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(6,182,212,0.2)", backdropFilter: "blur(4px)" }}
                >
                  <span style={{ color: "#06B6D4", fontSize: "10px", fontWeight: 700 }}>
                    🚀 Q3 · Físico
                  </span>
                </div>

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white/70 text-sm font-medium">Cartão Bloqueado</span>
                    </div>
                  </div>
                )}

                <div
                  className="relative z-10 p-6 h-full flex flex-col justify-between"
                  style={{ opacity: isLocked ? 0.3 : 1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/20" />
                      <div className="w-7 h-7 rounded-full bg-white/10 -ml-3" />
                    </div>
                    <span className="text-white/80 text-sm font-semibold tracking-wider">LIQUIDAI</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-7 rounded-lg" style={{ background: "linear-gradient(135deg, #D4AF37, #F5D46E)" }} />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cardVisible ? "show" : "hide"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-lg text-white tracking-widest"
                      >
                        {cardVisible ? CARD_NUMBER : MASKED_NUMBER}
                      </motion.div>
                    </AnimatePresence>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Titular</p>
                        <p className="text-white font-medium text-sm">Alex Johnson</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Expira</p>
                        <p className="text-white font-mono text-sm">25/29</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">CVV</p>
                        <p className="text-white font-mono text-sm">{cardVisible ? "847" : "***"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card actions */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCardVisible(!cardVisible)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  {cardVisible ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {cardVisible ? "Ocultar" : "Mostrar"}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <Copy className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {copied ? "Copiado!" : "Copiar"}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLocked(!isLocked)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: isLocked ? "#EF4444" : "var(--muted)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {isLocked ? <Unlock className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-text-secondary" />}
                  <span className="text-xs font-medium" style={{ color: isLocked ? "#fff" : "#4A5568" }}>
                    {isLocked ? "Desbloquear" : "Bloquear"}
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Card controls */}
            <div className="px-5 mb-5">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Lock, label: "Bloquear" },
                  { icon: RefreshCw, label: "Novo CVV" },
                  { icon: Settings, label: "Limites" },
                  { icon: CreditCard, label: "Física Q3", badge: true },
                ].map(({ icon: Icon, label, badge }, i) => (
                  <motion.button
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-2 relative"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                      style={{
                        background: badge ? "rgba(6,182,212,0.1)" : "var(--surface-solid)",
                        border: badge ? "1.5px solid rgba(6,182,212,0.25)" : "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: badge ? "#06B6D4" : "var(--text-secondary)" }} />
                      {badge && (
                        <span
                          className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded-full text-white"
                          style={{ background: "#06B6D4", fontSize: "7px", fontWeight: 700 }}
                        >
                          Q3
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: badge ? "#06B6D4" : "var(--text-muted)" }}>
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Spending limit */}
            <div className="px-5 mb-5">
              <div
                className="rounded-2xl p-4"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Limite Mensal</span>
                  <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>$62 / $500</span>
                </div>
                <div className="h-2.5 w-full rounded-full" style={{ background: "var(--muted)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "12.4%" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #0D4B2E, #A3D977)" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-success font-medium">12% utilizado</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>$438 disponível</span>
                </div>
              </div>
            </div>

            {/* Yield-covered widget */}
            <div className="px-5 mb-5">
              <YieldCoveredWidget />
            </div>

            {/* Transactions */}
            <div className="px-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  Transações do Cartão
                </span>
                <button className="text-xs font-medium" style={{ color: "#0D4B2E" }}>Ver tudo</button>
              </div>
              <div className="space-y-2">
                {cardTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: (tx as any).bg || "var(--muted)" }}
                    >
                      {(() => { const TxIcon = (tx as any).Icon; return <TxIcon className="w-4.5 h-4.5" style={{ color: (tx as any).color || "var(--text-secondary)" }} />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {tx.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{tx.date}</div>
                    </div>
                    <div
                      className="font-mono font-semibold text-sm flex-shrink-0 flex items-center gap-1"
                      style={{ color: tx.type === "income" ? "#10B981" : "var(--text-primary)" }}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                      ${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
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
                Modelo Ether.fi: usuário mantém <span className="text-white font-semibold">$1.200 em DeFi</span> e recebe limite de crédito de{" "}
                <span style={{ color: "#A3D977" }} className="font-semibold">$840 (70% colateral)</span>. O yield paga os juros — usuário gasta sem tirar dinheiro dos pools.
              </p>
              <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
                {[
                  { label: "Depósito", value: "$1.200" },
                  { label: "Limite (70%)", value: "$840" },
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
                . Com $1.200 em cUSD, o LiquidAI gera +$8/mês — suficiente para cobrir tarifas bancárias, saques PIX e cashback, criando um{" "}
                <span style={{ color: "#A3D977" }} className="font-semibold">
                  loop de valor autossustentável
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
