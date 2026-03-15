import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Search,
  Send,
  Download,
  Zap,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Bot,
  ArrowUp,
  Sun,
  Moon,
  Shield,
  MessageSquare,
  Target,
  X,
} from "lucide-react";
import {
  EmergencyFundIcon,
  TravelIcon,
  SmartphoneIcon as SmartphoneSvg,
  TrophyIcon as TrophySvg,
  YieldIcon,
  WalletIcon,
  YieldCaptureIcon,
  DepositIcon,
  PhoneTopupIcon,
  AgentIcon as AgentSvg,
  PixIcon,
} from "../components/icons";
import { motion, AnimatePresence } from "motion/react";
import { BottomNavigation } from "../components/bottom-navigation";
import { CeloLiquidityMap } from "../components/celo-liquidity-map";
import { useTheme } from "../hooks/useTheme";
import { NotificationsDrawer } from "../components/notifications-drawer";
import { AgentPulse } from "../components/agent-pulse";

// ─── Data ───────────────────────────────────────────────────────────────────

const sparklineData = [
  { day: "Dom", value: 1120 },
  { day: "Seg", value: 1180 },
  { day: "Ter", value: 1150 },
  { day: "Qua", value: 1210 },
  { day: "Qui", value: 1190 },
  { day: "Sex", value: 1230 },
  { day: "Sáb", value: 1240 },
];

const transactions = [
  {
    id: 1,
    name: "Transferência PIX",
    subtitle: "Mercado Local · Hoje 14:30",
    type: "expense",
    amount: 3.50,
    icon: PixIcon,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
  },
  {
    id: 2,
    name: "Yield Capture",
    subtitle: "LiquidAI Agent · Hoje 08:00",
    type: "income",
    amount: 1.25,
    icon: YieldCaptureIcon,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    id: 3,
    name: "Depósito cUSD",
    subtitle: "Proteção cambial · 13 Mar, 09:00",
    type: "income",
    amount: 150.0,
    icon: DepositIcon,
    color: "#0D4B2E",
    bg: "rgba(13,75,46,0.08)",
  },
  {
    id: 4,
    name: "Recarga de Celular",
    subtitle: "Utilidade · 12 Mar 19:45",
    type: "expense",
    amount: 2.00,
    icon: PhoneTopupIcon,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    id: 5,
    name: "Rebalance Automático",
    subtitle: "LiquidAI Agent · 12 Mar 00:00",
    type: "income",
    amount: 0.85,
    icon: AgentSvg,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.15)",
  },
];

const agentEvents = [
  "Rebalanceou $350 para maior rendimento",
  "Capturou +$0.45 em yield noturno",
  "Detectou oportunidade 4.8% APY",
  "Morpho looping ativado: +3% yield extra via stCELO",
  "Daimo bridge: recebendo fundos da Base network",
  "Mento V3: spread cUSD→cBRL reduzido 40%",
];

// ─── Hackathon Countdown (March 18, 2026) ────────────────────────────────────

function HackathonCountdown({ onDismiss }: { onDismiss: () => void }) {
  const deadline = new Date("2026-03-18T23:59:59-03:00").getTime();
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = Date.now();
    return Math.max(0, deadline - now);
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, deadline - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="mx-5 mb-5 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0B3D25 0%, #0D4B2E 60%, #1a6b45 100%)",
        boxShadow: "0 6px 28px rgba(13,75,46,0.35)",
        border: "1px solid rgba(163,217,119,0.25)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <TrophySvg className="w-4 h-4" style={{ color: "#A3D977" }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#A3D977" }}>
            Build Agents for the Real World V2
          </span>
        </div>
        <button onClick={onDismiss}>
          <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      </div>

      {/* Countdown grid */}
      <div className="grid grid-cols-4 gap-2 px-4 pb-3">
        {[
          { val: days, label: "dias" },
          { val: hours, label: "horas" },
          { val: mins, label: "min" },
          { val: secs, label: "seg" },
        ].map(({ val, label }) => (
          <div
            key={label}
            className="rounded-xl py-2.5 text-center"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            <div className="font-mono font-bold text-white" style={{ fontSize: "1.4rem", lineHeight: 1 }}>
              {String(val).padStart(2, "0")}
            </div>
            <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom status */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#A3D977" }} />
        <p className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          <span className="text-white font-semibold">Celo Hackathon</span> · Deadline: 18 Mar 2026 · Categoria: Agentes Financeiros
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
          style={{ background: "rgba(163,217,119,0.2)", color: "#A3D977" }}
        >
          Inscrito ✓
        </span>
      </div>
    </motion.div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({
  data,
  color = "#0D4B2E",
  height = 72,
}: {
  data: { day: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const W = 320;
  const H = height + 20;
  const pad = { t: 4, r: 6, b: 20, l: 6 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * innerW);
  const ys = vals.map((v) => pad.t + (1 - (v - min) / range) * innerH);

  const linePath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L ${xs[xs.length - 1].toFixed(1)} ${(pad.t + innerH).toFixed(1)}` +
    ` L ${xs[0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <path d={areaPath} fill={color} fillOpacity={0.08} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xs[xs.length - 1].toFixed(1)}
        cy={ys[ys.length - 1].toFixed(1)}
        r="4"
        fill={color}
        stroke="var(--surface-solid)"
        strokeWidth="2"
      />
      {data.map((d, i) => (
        <text
          key={`t-${i}`}
          x={xs[i]}
          y={H - 4}
          textAnchor="middle"
          style={{ fill: "var(--text-muted)" }}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
        >
          {d.day}
        </text>
      ))}
    </svg>
  );
}

// ─── Mini trend badge ─────────────────────────────────────────────────────────

function MiniTrend({ up }: { up: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full"
      style={{
        background: up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
        color: up ? "var(--success)" : "var(--destructive)",
      }}
    >
      <ArrowUp className="w-2.5 h-2.5" style={{ transform: up ? "none" : "rotate(180deg)" }} />
      {up ? "12%" : "3%"}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [agentIdx, setAgentIdx] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hackathonDismissed, setHackathonDismissed] = useState(false);
  const balance = 1240.50;
  const yieldRate = 4.8;
  const yieldEarned = 8.15;

  // Read Self verification status (set in Profile)
  const selfVerified = typeof window !== "undefined"
    ? localStorage.getItem("selfVerified") === "true"
    : false;

  useEffect(() => {
    const id = setInterval(() => setAgentIdx((i) => (i + 1) % agentEvents.length), 3500);
    return () => clearInterval(id);
  }, []);

  const quickActions = [
    { icon: Send, label: "Enviar", path: "/transfer", primary: true },
    { icon: Download, label: "Receber", path: "/scan", primary: false },
    { icon: Zap, label: "Otimizar", path: "/agent", primary: false },
    { icon: QrCode, label: "Cartão", path: "/card", primary: false },
  ];

  return (
    <div className="min-h-dvh pb-28 overflow-x-hidden bg-background">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        {/* Avatar + Greeting */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                border: "2.5px solid #A3D977",
              }}
            >
              AJ
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: "#A3D977", borderColor: "var(--background)" }}
            />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Bom dia,
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Alex Johnson
              </p>
              {selfVerified && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}
                >
                  <Shield className="w-2.5 h-2.5" />
                  <span style={{ fontSize: "9px", fontWeight: 700 }}>Self</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Icons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "var(--surface-solid)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
            }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                {isDark ? (
                  <Sun className="w-4.5 h-4.5" style={{ color: "#A3D977" }} />
                ) : (
                  <Moon className="w-4.5 h-4.5" style={{ color: "var(--text-secondary)" }} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.12)" }}
          >
            <Search className="w-4.5 h-4.5" style={{ color: "var(--text-secondary)" }} />
          </button>
          <button
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.12)" }}
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="w-4.5 h-4.5" style={{ color: "var(--text-secondary)" }} />
            <span
              className="absolute top-2 right-2.5 w-2 h-2 rounded-full"
              style={{ background: "#EF4444", border: "1.5px solid var(--background)" }}
            />
          </button>
        </div>
      </header>

      {/* ── BALANCE HERO CARD ──────────────────────────────── */}
      <div className="px-5 mt-4 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0B3D25 0%, #0D4B2E 45%, #12593A 100%)",
            boxShadow: "0 12px 40px rgba(13,75,46,0.32), 0 2px 8px rgba(13,75,46,0.2)",
            minHeight: 200,
          }}
        >
          <div
            className="absolute top-0 right-0 rounded-full pointer-events-none"
            style={{
              width: 200, height: 200,
              background: "radial-gradient(circle, rgba(163,217,119,0.14) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 rounded-full pointer-events-none"
            style={{
              width: 160, height: 160,
              background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
              transform: "translate(-40%, 40%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Saldo Total
                </span>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  {balanceVisible ? (
                    <Eye className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(163,217,119,0.18)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#A3D977" }} />
                <span className="text-xs" style={{ color: "#A3D977", fontWeight: 500 }}>
                  Agente Ativo
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={balanceVisible ? "v" : "h"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-white mb-1"
                style={{ fontSize: "clamp(1.9rem, 10vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                {balanceVisible
                  ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "$\u00A0••••••"}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-3 h-3" style={{ color: "#A3D977" }} />
              <span className="text-xs" style={{ color: "#A3D977" }}>
                +{yieldRate}% APY · +${yieldEarned.toFixed(2)} este mês
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className="font-mono text-sm"
                style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}
              >
                •••• •••• •••• 3424
              </span>
              <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                12/2029
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map(({ icon: Icon, label, path, primary }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05, ease: "easeOut" }}
              whileTap={{ scale: 0.88 }}
              onClick={() => path && navigate(path)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: primary ? "#0D4B2E" : "var(--surface-solid)",
                  boxShadow: primary
                    ? "0 4px 18px rgba(13,75,46,0.28)"
                    : "0 1px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: primary ? "#A3D977" : "var(--text-secondary)" }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── HACKATHON COUNTDOWN ────────────────────────────── */}
      <AnimatePresence>
        {!hackathonDismissed && (
          <HackathonCountdown onDismiss={() => setHackathonDismissed(true)} />
        )}
      </AnimatePresence>

      {/* ── AI AGENT STATUS ────────────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface-solid)",
            boxShadow: "0 2px 16px rgba(13,75,46,0.1)",
            border: "1px solid rgba(163,217,119,0.25)",
          }}
        >
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
              style={{ background: "rgba(13,75,46,0.1)" }}
            >
              <Bot className="w-5 h-5" style={{ color: "#0D4B2E" }} />
              <span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                style={{ background: "#A3D977", border: "2px solid var(--surface-solid)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  LiquidAI Agent
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(163,217,119,0.15)", color: "#FFFFFF", fontWeight: 600 }}
                >
                  Online
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={agentIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {agentEvents[agentIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          </div>

          <div className="grid grid-cols-3">
            {[
              { label: "Otimização hoje", value: "+2.3%" },
              { label: "Capital gerido", value: "$850" },
              { label: "APY atual", value: "4.8%" },
            ].map((m, i) => (
              <div
                key={m.label}
                className="px-3 py-3 text-center"
                style={{
                  borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                }}
              >
                <div className="font-mono text-sm" style={{ color: "#A3D977", fontWeight: 700 }}>
                  {m.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── AI LIQUIDITY MAP ───────────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CeloLiquidityMap />
        </motion.div>
      </div>

      {/* ── AGENT PULSE LIVE FEED ──────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <AgentPulse />
        </motion.div>
      </div>

      {/* ── CASHFLOW SPARKLINE ─────────────────────────────── */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Evolução do Saldo
              </span>
              <span
                className="text-xs ml-2 inline-flex items-center gap-0.5"
                style={{ color: "var(--success)", fontWeight: 500 }}
              >
                <TrendingUp className="w-3 h-3" />
                +$120 (7d)
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>7 dias</span>
          </div>

          <div style={{ height: 88 }}>
            <Sparkline data={sparklineData} color="#A3D977" height={68} />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              $1.120
            </span>
            <span className="font-mono text-xs" style={{ color: "#A3D977", fontWeight: 600 }}>
              $1.240
            </span>
          </div>
        </div>
      </div>

      {/* ── FINANCIAL STATS ────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-2xl p-4"
            style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(16,185,129,0.1)" }}
            >
              <ArrowDownLeft className="w-4 h-4" style={{ color: "var(--success)" }} />
            </div>
            <div className="font-mono mb-0.5" style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700 }}>
              +$150
            </div>
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Entradas</div>
            <MiniTrend up={true} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-2xl p-4"
            style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(245,158,11,0.08)" }}
            >
              <ArrowUpRight className="w-4 h-4" style={{ color: "var(--warning)" }} />
            </div>
            <div className="font-mono mb-0.5" style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700 }}>
              -$30
            </div>
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Saídas</div>
            <MiniTrend up={false} />
          </motion.div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Atividade Recente
          </span>
          <button className="text-xs" style={{ color: "#A3D977", fontWeight: 600 }}>
            Ver tudo
          </button>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          {transactions.map((tx, i) => {
            const Icon = tx.icon;
            const isLast = i === transactions.length - 1;
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.055 }}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: isLast ? "none" : "1px solid var(--border-light)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: tx.bg }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: tx.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {tx.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {tx.subtitle}
                  </div>
                </div>
                <div
                  className="font-mono text-sm flex-shrink-0"
                  style={{
                    color: tx.type === "income" ? "var(--success)" : "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SAVINGS GOALS PREVIEW ──────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Metas de Poupança
          </span>
          <button
            className="text-xs flex items-center gap-1"
            style={{ color: "#A3D977", fontWeight: 600 }}
            onClick={() => navigate("/savings")}
          >
            Ver tudo
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        >
          {[
            { Icon: EmergencyFundIcon, name: "Fundo de Emergência", pct: 60, color: "#3B82F6", bg: "rgba(59,130,246,0.1)", saved: 480, target: 800 },
            { Icon: TravelIcon, name: "Viagem a Portugal", pct: 35, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", saved: 420, target: 1200 },
            { Icon: SmartphoneSvg, name: "Smartphone Novo", pct: 80, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", saved: 320, target: 400 },
          ].map((goal, i) => (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: goal.bg }}>
                <goal.Icon className="w-4 h-4" style={{ color: goal.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {goal.name}
                  </span>
                  <span className="text-xs font-mono font-semibold ml-2" style={{ color: goal.color }}>
                    {goal.pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.pct}%` }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: goal.color }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                ${goal.saved}/${goal.target}
              </span>
            </motion.div>
          ))}
          {/* Optimize CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/chat")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="w-full px-4 py-3 flex items-center gap-2"
            style={{ background: "rgba(163,217,119,0.06)", borderTop: "1px solid var(--border-light)" }}
          >
            <MessageSquare className="w-4 h-4" style={{ color: "#A3D977" }} />
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
              Pedir ao Agente para otimizar suas metas
            </span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ color: "#A3D977" }} />
          </motion.button>
        </motion.div>
      </div>

      <BottomNavigation />
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}