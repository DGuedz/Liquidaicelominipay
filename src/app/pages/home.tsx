import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
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
  Fingerprint,
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
import { CeloLiquidityMap } from "../components/celo-liquidity-map";
import { useTheme } from "../hooks/useTheme";
import { NotificationsDrawer } from "../components/notifications-drawer";
import { AgentPulse } from "../components/agent-pulse";
import { apiGet, apiPost, DashboardPayload, OptimizeLiquidityPayload, SavingsOverviewPayload } from "../lib/api";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { LiquidLogo } from "../components/LiquidLogo";

import { ensureWalletAuthSession } from "../lib/wallet-auth";

// ─── Data ───────────────────────────────────────────────────────────────────

const sparklineData = [
  { day: "Sun", value: 0 },
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
];

const transactions = [
  {
    id: 1,
    name: "PIX Transfer",
    subtitle: "Waiting for first real payment",
    type: "expense",
    kind: "pix",
    amount: 0,
    icon: PixIcon,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
  },
  {
    id: 2,
    name: "Yield Capture",
    subtitle: "Waiting for first live rebalance",
    type: "income",
    kind: "yield",
    amount: 0,
    icon: YieldCaptureIcon,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    id: 3,
    name: "Wallet Sync",
    subtitle: "The app will record the first real deposit or swap here",
    type: "income",
    kind: "deposit",
    amount: 0,
    icon: DepositIcon,
    color: "#0D4B2E",
    bg: "rgba(13,75,46,0.08)",
  },
  {
    id: 4,
    name: "Agent Buffer",
    subtitle: "Immediate liquidity will appear after the first operation",
    type: "expense",
    kind: "rebalance",
    amount: 0,
    icon: PhoneTopupIcon,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
  },
];

const agentEvents = [
  "Wallet connected and ready for the first live allocation",
  "The agent will log the first real rebalance here",
  "Opportunities are evaluated against current on-chain APY",
  "Liquidity buffer is preserved before yield routing",
  "Session is active and ready for the next on-chain step",
  "Stable routing waits for the first actionable opportunity",
];

function formatUsdValue(value: number | null) {
  if (value == null) return "$ --";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompactUsd(value: number | null) {
  if (value == null) return "--";
  return `$${Math.round(value)}`;
}

function formatPercent(value: number | null, digits = 1) {
  if (value == null) return "--";
  return `${value.toFixed(digits)}%`;
}

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
          { val: days, label: "days" },
          { val: hours, label: "hours" },
          { val: mins, label: "min" },
          { val: secs, label: "sec" },
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

      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#A3D977" }} />
        <p className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          <span className="text-white font-semibold">Celo Hackathon</span> · Agent track active
        </p>
        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(163,217,119,0.15)", color: "#A3D977" }}>
          Agent Track
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

function MiniTrend({ up, inverse }: { up: boolean; inverse?: boolean }) {
  const isPositive = inverse ? !up : up;
  return (
    <div
      className="flex items-center gap-1 text-xs font-semibold"
      style={{ color: isPositive ? "var(--success)" : "var(--destructive)" }}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
      <span>{up ? "+2.4%" : "-1.2%"}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { address, signWalletMessage } = useCeloWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [agentIdx, setAgentIdx] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hackathonDismissed, setHackathonDismissed] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [savingsOverview, setSavingsOverview] = useState<SavingsOverviewPayload | null>(null);
  const [optimizingNetwork, setOptimizingNetwork] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  async function loadDashboard() {
    if (!address) {
      setDashboard(null);
      setDashboardLoading(false);
      setDashboardError("");
      return null;
    }
    setDashboardLoading(true);
    setDashboardError("");
    const payload = await apiGet<DashboardPayload>("/api/dashboard", {
      address: address || "",
      riskMode: "balanced",
    });
    setDashboard(payload);
    setDashboardLoading(false);
    return payload;
  }

  async function loadSavingsOverview() {
    if (!address) {
      setSavingsOverview(null);
      return null;
    }
    const payload = await apiGet<SavingsOverviewPayload>("/api/savings/goals", {
      address: address || "",
    });
    setSavingsOverview(payload);
    return payload;
  }

  useEffect(() => {
    let alive = true;
    if (!address) {
      setDashboard(null);
      setSavingsOverview(null);
      setDashboardLoading(false);
      setDashboardError("");
      return () => {
        alive = false;
      };
    }
    setDashboardLoading(true);
    setDashboardError("");

    Promise.allSettled([loadDashboard(), loadSavingsOverview()]).then((results) => {
      if (!alive) return;

      const [dashboardResult, savingsResult] = results;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
        setDashboardError("");
      } else {
        setDashboardError(
          dashboardResult.reason instanceof Error
            ? dashboardResult.reason.message
            : "Failed to load wallet snapshot.",
        );
      }

      if (savingsResult.status === "fulfilled") {
        setSavingsOverview(savingsResult.value);
      }

      setDashboardLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [address]);

  async function handleOptimizeNetwork() {
    if (!address || optimizingNetwork) return;
    setOptimizingNetwork(true);
    try {
      await ensureWalletAuthSession(address, signWalletMessage);
      await apiPost<OptimizeLiquidityPayload>("/api/agent/optimize", {
        address,
        riskMode: "balanced",
      });
      await loadDashboard();
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setOptimizingNetwork(false);
    }
  }

  const autoOptimizeDone = useRef(false);

  useEffect(() => {
    if (!address || optimizingNetwork || autoOptimizeDone.current) return;
    const state = location.state as { autoOptimize?: boolean } | null;
    if (state?.autoOptimize) {
      autoOptimizeDone.current = true;
      handleOptimizeNetwork();
      // clean up history state so we don't trigger again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [address, location.state, optimizingNetwork]);

  const displayEvents = dashboard?.agentEvents?.length ? dashboard.agentEvents : agentEvents;
  const displaySparkline = dashboard?.sparkline?.length ? dashboard.sparkline : sparklineData;
  const hasConnectedWallet = Boolean(address);
  const balance = dashboard?.summary.balanceUsd ?? (hasConnectedWallet ? null : 0);
  const yieldRate = dashboard?.summary.apy ?? (hasConnectedWallet ? null : 0);
  const yieldEarned = dashboard?.summary.monthlyYieldUsd ?? (hasConnectedWallet ? null : 0);
  const inflowUsd = dashboard?.financialStats.inflowUsd ?? (hasConnectedWallet ? null : 0);
  const outflowUsd = dashboard?.financialStats.outflowUsd ?? (hasConnectedWallet ? null : 0);
  const managedCapital = dashboard?.summary.managedCapitalUsd ?? (hasConnectedWallet ? null : 0);
  const agentOpsToday = dashboard?.summary.agentOpsToday ?? 0;
  const savingsGoals = savingsOverview?.goals || [];
  const savingsPreview = savingsGoals.slice(0, 3).map((goal) => {
    const iconMap = {
      shield: EmergencyFundIcon,
      emergency: EmergencyFundIcon,
      travel: TravelIcon,
      phone: SmartphoneSvg,
    } as const;
    const total = goal.target || 1;
    return {
      Icon: iconMap[(goal.emoji as keyof typeof iconMap)] || YieldIcon,
      name: goal.name,
      pct: Math.round((goal.saved / total) * 100),
      color: goal.color,
      bg: goal.bg,
      saved: goal.saved,
      target: goal.target,
    };
  });
  const displayTransactions = dashboard?.transactions?.length
    ? dashboard.transactions.map((tx) => {
        if (tx.kind === "yield") {
          return {
            ...tx,
            icon: YieldCaptureIcon,
            color: "#10B981",
            bg: "rgba(16,185,129,0.1)",
          };
        }
        if (tx.kind === "rebalance") {
          return {
            ...tx,
            icon: AgentSvg,
            color: "#A3D977",
            bg: "rgba(163,217,119,0.15)",
          };
        }
        return {
          ...tx,
          icon: PixIcon,
          color: "#EF4444",
          bg: "rgba(239,68,68,0.08)",
        };
      })
    : transactions;

  const notificationItems = displayTransactions.map((tx, index) => {
    const txKind = 'kind' in tx ? tx.kind : "unknown";
    return {
      id: index + 1,
      type: (txKind === "yield" ? "yield" : txKind === "rebalance" ? "rebalance" : "success") as "yield" | "rebalance" | "success" | "alert" | "tip" | "protect",
      title: tx.name,
      body: tx.subtitle,
      time: txKind === "yield" ? "Live" : "Now",
      read: index > 0,
      icon: txKind === "yield" ? Sparkles : txKind === "rebalance" ? Bot : Shield,
      color: txKind === "yield" ? "#A3D977" : txKind === "rebalance" ? "#10B981" : "#3B82F6",
      bg: txKind === "yield" ? "rgba(163,217,119,0.12)" : txKind === "rebalance" ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)",
    } as const;
  });
  const sparklineStart = displaySparkline[0]?.value ?? null;
  const sparklineEnd = displaySparkline[displaySparkline.length - 1]?.value ?? null;
  const sparklineDelta = sparklineStart != null && sparklineEnd != null ? sparklineEnd - sparklineStart : null;

  useEffect(() => {
    if (!address) return;

    const handleFocusRefresh = () => {
      void loadDashboard().catch((error) => {
        setDashboardError(error instanceof Error ? error.message : "Failed to refresh wallet snapshot.");
        setDashboardLoading(false);
      });
    };

    window.addEventListener("focus", handleFocusRefresh);
    document.addEventListener("visibilitychange", handleFocusRefresh);

    return () => {
      window.removeEventListener("focus", handleFocusRefresh);
      document.removeEventListener("visibilitychange", handleFocusRefresh);
    };
  }, [address]);

  useEffect(() => {
    if (!displayEvents.length) return;
    const id = setInterval(() => setAgentIdx((i) => (i + 1) % displayEvents.length), 3500);
    return () => clearInterval(id);
  }, [displayEvents.length]);

  const quickActions = [
    { icon: Send, label: "Send", path: "/transfer", primary: true },
    { icon: Download, label: "Receive", path: "/scan", primary: false },
    { icon: Zap, label: "Optimize", path: "/agent", primary: false },
    { icon: QrCode, label: "Card", path: "/card", primary: false },
  ];

  return (
    <div className="min-h-dvh pb-6 overflow-x-hidden bg-background">

      {/* Top Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <LiquidLogo variant="full" size={42} theme="auto" background="transparent" animate={true} />
        <div className="flex items-center gap-3">
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
          className="relative rounded-3xl overflow-hidden border border-white/10"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #111 100%)",
            boxShadow: "0 12px 40px rgba(13,75,46,0.4)",
            minHeight: 200,
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

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-wider uppercase font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Your MiniPay Balance
                </span>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {balanceVisible ? (
                    <Eye className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.7)" }} />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.7)" }} />
                  )}
                </button>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10B981" }} />
                <span className="text-[10px] font-bold text-white tracking-wide">Celo Network</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={balanceVisible ? "v" : "h"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-white mb-1 drop-shadow-md"
                style={{ fontSize: "clamp(1.9rem, 10vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                {balanceVisible ? formatUsdValue(balance) : "$\u00A0••••••"}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />
              <span className="text-xs font-medium" style={{ color: "#A3D977" }}>
                {dashboardError
                  ? "Wallet snapshot failed. Tap to retry."
                  : dashboardLoading || yieldRate == null || yieldEarned == null
                  ? "Loading wallet snapshot..."
                  : `+${formatPercent(yieldRate)} APY · +$${yieldEarned.toFixed(2)} this month`}
              </span>
            </div>

            {dashboardError && (
              <button
                onClick={() => {
                  void loadDashboard().catch((error) => {
                    setDashboardError(error instanceof Error ? error.message : "Failed to load wallet snapshot.");
                    setDashboardLoading(false);
                  });
                }}
                className="mb-4 text-xs font-semibold underline underline-offset-4"
                style={{ color: "#F59E0B" }}
              >
                Retry wallet sync
              </button>
            )}

            <div className="mt-8 mb-6 flex justify-between items-end">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Daily Yield <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-white/10 text-white/90">Agent</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold" style={{ color: "#A3D977" }}>
                    {balanceVisible ? (yieldEarned != null ? `+$${(yieldEarned / 30).toFixed(2)}` : "--") : "****"}
                  </span>
                  <MiniTrend up={true} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Managed Capital
                </p>
                <span className="font-mono text-xl font-bold text-white">
                  {balanceVisible ? formatCompactUsd(managedCapital) : "****"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6">
              <span className="text-[10px] uppercase tracking-wider text-white/50">Current APY</span>
              <span className="text-xs font-bold text-white px-2 py-1 rounded-md bg-white/10">{formatPercent(yieldRate)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl active:scale-95 transition-transform"
              style={{
                background: action.primary ? "rgba(163,217,119,0.15)" : "var(--surface-solid)",
                border: `1px solid ${action.primary ? "rgba(163,217,119,0.3)" : "var(--border-light)"}`,
                boxShadow: action.primary ? "0 4px 12px rgba(163,217,119,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <action.icon
                className="w-5 h-5 mb-1.5"
                style={{ color: action.primary ? "#A3D977" : "var(--text-primary)" }}
              />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: action.primary ? "#A3D977" : "var(--text-secondary)" }}
              >
                {action.label}
              </span>
            </button>
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
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  LiquidAI Engine
                </span>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold"
                  style={{ background: "rgba(163,217,119,0.15)", color: "#0D4B2E" }}
                >
                  Autopilot
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
                  {displayEvents[agentIdx] || displayEvents[0]}
                </motion.p>
              </AnimatePresence>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          </div>

          <div className="grid grid-cols-1 divide-y divide-[var(--border-light)]">
            {[
              {
                icon: <Zap className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />,
                title: "Smart Remittances",
                desc: "FX Routing via Mento V3 Oracles",
              },
              {
                icon: <Shield className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />,
                title: "Agent-to-Agent Dark Pool",
                desc: "Zero AMM Slippage Matching",
              },
              {
                icon: <Sparkles className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />,
                title: "Gas-Optimized Batching",
                desc: "Institutional Yield Access",
              },
              {
                icon: <Fingerprint className="w-3.5 h-3.5" style={{ color: "#8B5CF6" }} />,
                title: "Proof of Innocence",
                desc: "Compliant ZK Privacy (Q4 Vision)",
              },
            ].map((m, i) => (
              <div key={m.title} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--background)", border: "1px solid var(--border-light)" }}
                >
                  {m.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {m.title}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {m.desc}
                  </div>
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
          <CeloLiquidityMap
            network={dashboard?.liquidityNetwork
              ? {
                  ...dashboard.liquidityNetwork,
                  canOptimize: optimizingNetwork ? false : dashboard.liquidityNetwork.canOptimize,
                }
              : null}
            onOptimize={handleOptimizeNetwork}
          />
        </motion.div>
      </div>

      {/* ── AGENT PULSE LIVE FEED ──────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <AgentPulse
            stats={{
              ops: agentOpsToday,
              totalYield: yieldEarned ?? 0,
              apy: yieldRate ?? 0,
            }}
            feed={displayTransactions.map((tx) => {
              const txKind = 'kind' in tx ? tx.kind : "unknown";
              return {
                kind:
                  txKind === "yield"
                    ? "yield"
                    : txKind === "pix"
                      ? "jit"
                      : txKind === "rebalance"
                        ? "rebalance"
                        : "opportunity",
                title: tx.name,
                detail: tx.subtitle,
                amount: tx.amount > 0 ? `${tx.type === "income" ? "+" : "-"}$${tx.amount.toFixed(2)}` : undefined,
              };
            })}
          />
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
                Balance Growth
              </span>
              <span
                className="text-xs ml-2 inline-flex items-center gap-0.5"
                style={{ color: "var(--success)", fontWeight: 500 }}
              >
                <TrendingUp className="w-3 h-3" />
                {sparklineDelta == null ? "--" : `${sparklineDelta >= 0 ? "+" : "-"}$${Math.abs(sparklineDelta).toFixed(2)} (7d)`}
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>7 days</span>
          </div>

          <div style={{ height: 88 }}>
            <Sparkline data={displaySparkline} color="#A3D977" height={68} />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              {formatUsdValue(sparklineStart)}
            </span>
            <span className="font-mono text-xs" style={{ color: "#A3D977", fontWeight: 600 }}>
              {formatUsdValue(sparklineEnd)}
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
              {inflowUsd == null ? "--" : `+$${inflowUsd.toFixed(2)}`}
            </div>
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Deposits</div>
              <MiniTrend up={inflowUsd != null && inflowUsd >= 0} />
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
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              <ArrowUpRight className="w-4 h-4" style={{ color: "var(--destructive)" }} />
            </div>
            <div className="font-mono mb-0.5" style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700 }}>
              {outflowUsd == null ? "--" : `-$${outflowUsd.toFixed(2)}`}
            </div>
            <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Spent</div>
              <MiniTrend up={outflowUsd != null && outflowUsd >= 0} inverse />
          </motion.div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Recent Activity
          </span>
          <button className="text-xs" style={{ color: "#A3D977", fontWeight: 600 }}>
            See All
          </button>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          {displayTransactions.map((tx, i) => {
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
            Savings Goals
          </span>
          <button
            className="text-xs flex items-center gap-1"
            style={{ color: "#A3D977", fontWeight: 600 }}
            onClick={() => navigate("/savings")}
          >
            See All
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
          {savingsPreview.length > 0 ? savingsPreview.map((goal, i) => (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < savingsPreview.length - 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: goal.bg }}
              >
                <TrophySvg className="w-5 h-5" style={{ color: goal.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{goal.name}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    ${goal.saved.toFixed(0)} / ${goal.target.toFixed(0)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full" style={{ background: "var(--muted)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((goal.saved / goal.target) * 100, 100)}%`,
                      background: goal.color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="p-5 text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No active goals</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Create a goal to start saving automatically</p>
            </div>
          )}
        </motion.div>
      </div>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} items={notificationItems} />
    </div>
  );
}
