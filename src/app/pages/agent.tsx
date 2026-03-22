import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  DollarSign,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Globe,
  Lock,
  ChevronRight,
  MessageSquare,
  ChevronDown,
  Brain,
  Layers,
  Route,
} from "lucide-react";
import {
  ShieldIcon as ShieldSvg,
  LightningIcon,
  FlameIcon,
  YieldIcon,
  PoolsIcon,
  LoopIcon,
  BrainIcon as BrainSvg,
  RouteIcon as RouteSvg,
  JITIcon,
  TrophyIcon as TrophySvg,
} from "../components/icons";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router";
import { apiGet, apiPost, AgentStatePayload, hasApiAuthSession } from "../lib/api";
import { CELO_CHAIN_ID } from "../lib/celo-wallet";
import { ensureWalletAuthSession } from "../lib/wallet-auth";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { sanitizeActionId } from "../security/txGuard";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskMode = "conservative" | "balanced" | "aggressive";

// ─── Rich Risk Mode Config ────────────────────────────────────────────────────
const RISK_CONFIG = {
  conservative: {
    id: "conservative" as RiskMode,
    label: "Conservative",
    subtitle: "Inflation Shield",
    apy: "3.2–4.2%",
    apyTarget: 3.8,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    icon: Shield,
    ModeIcon: ShieldSvg,
    narrative:
      "Total capital preservation. The agent prioritizes immediate liquidity and stablecoins, defeating inflation without volatility.",
    agentBehavior:
      "Monitors stable routes and keeps the liquidity buffer protected before moving capital into lower-risk pools.",
    sampleLog: "Stable route favored → balance kept productive without reducing the payment buffer.",
    pools: [
      { name: "Aave v3 (USDm)", type: "Lending · low risk", apy: "4.8%", pct: 55, amount: 0, color: "#06B6D4", iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png" },
      { name: "Mento USDm/USDC", type: "Stable AMM · min IL", apy: "3.8%", pct: 30, amount: 0, color: "#10B981", iconUrl: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/USDm.png" },
      { name: "Liquidity Buffer", type: "Card + Instant PIX", apy: "0%", pct: 15, amount: 0, color: "#A3D977" },
    ],
    riskMetrics: { il: 8, ilLabel: "Very Low", poolDepth: 95, withdrawalTime: 98, ilPositive: true },
    creditEngine: false,
    tags: ["100% Stablecoins", "Anti-Inflation", "Zero IL"],
  },
  balanced: {
    id: "balanced" as RiskMode,
    label: "Balanced",
    subtitle: "Wealth Accelerator",
    apy: "5.8–9%",
    apyTarget: 7.2,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    icon: Activity,
    ModeIcon: LightningIcon,
    narrative:
      "Outperforms the base stable benchmark via managed stCELO looping when risk conditions remain healthy.",
    agentBehavior:
      "Executes looping only when the collateral profile stays healthy. If volatility rises materially, the agent rotates part of the position back into stables.",
    sampleLog: "Looping opportunity approved → position resized while preserving exit liquidity.",
    pools: [
      { name: "Aave v3 (USDm)", type: "Lending · stable base", apy: "4.8%", pct: 30, amount: 0, color: "#06B6D4", iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png" },
      { name: "Morpho + stCELO Loop", type: "Institutional Looping · live", apy: "9.1%", pct: 32, amount: 0, color: "#10B981", iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9994E35Db50125E0DF82e4c2dde124b36Ee1535e/logo.png" },
      { name: "Ubeswap USDm/CELO", type: "AMM · extra yield", apy: "8.2%", pct: 22, amount: 0, color: "#F59E0B", iconUrl: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/CELO.png" },
      { name: "Liquidity Buffer", type: "Card + PIX", apy: "0%", pct: 16, amount: 0, color: "#A3D977" },
    ],
    riskMetrics: { il: 42, ilLabel: "Moderate", poolDepth: 85, withdrawalTime: 92, ilPositive: true },
    creditEngine: false,
    tags: ["Morpho Looping", "stCELO Collateral", "7.2% Target APY"],
  },
  aggressive: {
    id: "aggressive" as RiskMode,
    label: "Aggressive",
    subtitle: "Utility Degen Mode",
    apy: "8–20%+",
    apyTarget: 14,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    icon: Zap,
    ModeIcon: FlameIcon,
    narrative:
      "Maximizes yield via aggressive looping and higher-volatility routes, but only while the risk engine can still guarantee a fast exit path.",
    agentBehavior:
      "Max Morpho looping + Credit Engine as bridge. Risk Engine keeps an emergency exit via Mento V3 whenever liquidity conditions deteriorate.",
    sampleLog: "Arbitrage window detected → risk engine kept the route active while preserving the emergency exit.",
    pools: [
      { name: "Morpho + stCELO Loop (Aggressive)", type: "🆕 Max Looping · 3x leverage", apy: "15%", pct: 30, amount: 0, color: "#10B981", iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9994E35Db50125E0DF82e4c2dde124b36Ee1535e/logo.png" },
      { name: "CELO/ETH (Ubeswap)", type: "Volatile Pair · arbitrage", apy: "18%", pct: 25, amount: 0, color: "#EF4444", iconUrl: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/CELO.png" },
      { name: "PWN / EthicHub (RWA)", type: "Real Credit · stable yield", apy: "11.4%", pct: 22, amount: 0, color: "#8B5CF6" },
      { name: "Credit Engine (Bridge)", type: "Bridge · does not touch profitable pools", apy: "–", pct: 13, amount: 0, color: "#06B6D4" },
      { name: "Emergency Buffer", type: "Fast Mento V3 Exit · liquidity-aware", apy: "0%", pct: 10, amount: 0, color: "#A3D977", iconUrl: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/USDm.png" },
    ],
    riskMetrics: { il: 78, ilLabel: "High", poolDepth: 65, withdrawalTime: 72, ilPositive: false },
    creditEngine: true,
    tags: ["Morpho Looping 3x", "Mento V3 Exit", "Active Risk Engine"],
  },
} as const;

// ─── Dynamic log per mode ─────────────────────────────────────────────────────
const MODE_LOGS: Record<RiskMode, typeof INITIAL_LOGS> = {
  conservative: [
    { time: "Now", action: "Stable-only routing active while the wallet remains in the conservative profile.", type: "protect", icon: Shield, color: "#3B82F6" },
    { time: "08:00", action: "Latest yield checkpoint recorded on the stable lending route.", type: "yield", icon: Sparkles, color: "#10B981" },
    { time: "06:14", action: "FX protection kept the productive balance inside dollar-pegged assets.", type: "protect", icon: Shield, color: "#3B82F6" },
    { time: "03:00", action: "Liquidity buffer preserved for near-instant payments.", type: "reserve", icon: Lock, color: "#A3D977" },
    { time: "Yesterday 22:00", action: "Stable AMM route reviewed with no reallocation required.", type: "rebalance", icon: RotateCcw, color: "#0D4B2E" },
    { time: "Yesterday 12:00", action: "Protection mode stayed active while yield continued to accumulate.", type: "yield", icon: DollarSign, color: "#10B981" },
  ],
  balanced: [
    { time: "Now", action: "Balanced router selected the current best mix between lending, looping and stable liquidity.", type: "optimize", icon: Sparkles, color: "#10B981" },
    { time: "14:30", action: "Latest yield capture checkpoint stored for the active route.", type: "yield", icon: DollarSign, color: "#A3D977" },
    { time: "08:00", action: "Loop health and collateral safety stayed inside the accepted range.", type: "detect", icon: Activity, color: "#10B981" },
    { time: "03:00", action: "No drift threshold breach detected, so allocations stayed connected.", type: "rebalance", icon: RotateCcw, color: "#0D4B2E" },
    { time: "Yesterday 22:00", action: "Cross-chain ingress remains available if fresh liquidity is detected.", type: "detect", icon: Activity, color: "#A3D977" },
    { time: "Yesterday 18:45", action: "Stable route pricing was refreshed using the current on-chain quote.", type: "optimize", icon: RotateCcw, color: "#F59E0B" },
  ],
  aggressive: [
    { time: "Now", action: "Aggressive routing remains active while the risk engine keeps the exit path healthy.", type: "yield", icon: Zap, color: "#10B981" },
    { time: "04:00", action: "High-volatility pair monitored for a profitable arbitrage window.", type: "yield", icon: DollarSign, color: "#F59E0B" },
    { time: "03:00", action: "Bridge capacity reserved so productive pools do not need to unwind for small payments.", type: "optimize", icon: Layers, color: "#06B6D4" },
    { time: "Yesterday 23:48", action: "Impermanent loss remained below the configured safety threshold.", type: "protect", icon: AlertTriangle, color: "#EF4444" },
    { time: "Yesterday 22:00", action: "Fast exit route confirmed through the stable router.", type: "detect", icon: Activity, color: "#A3D977" },
    { time: "Yesterday 18:00", action: "Off-ramp route stayed available without forcing a full unwind.", type: "optimize", icon: RotateCcw, color: "#8B5CF6" },
  ],
};

// ─── Shared initial logs (fallback) ──────────────────────────────────────────
const INITIAL_LOGS = [
  { time: "14:30", action: "Rebalanced productive capital into the current best route", type: "optimize", icon: RotateCcw, color: "#A3D977" },
  { time: "08:00", action: "Latest overnight yield checkpoint recorded", type: "yield", icon: Sparkles, color: "#10B981" },
  { time: "03:00", action: "Automatic rebalance completed", type: "rebalance", icon: RotateCcw, color: "#0D4B2E" },
  { time: "Yesterday 22:00", action: "Detected 5.2% opportunity in Morpho", type: "detect", icon: Activity, color: "#06B6D4" },
  { time: "Yesterday 18:45", action: "Liquidity buffer preserved for instant payments", type: "reserve", icon: Lock, color: "#8B5CF6" },
  { time: "Yesterday 12:00", action: "Forex protection applied automatically", type: "protect", icon: Shield, color: "#3B82F6" },
];

// ─── Pending authorizations (dynamic per mode) ────────────────────────────────
const MODE_AUTHS: Record<RiskMode, { id: number; action: string; gain: string; risk: string; riskColor: string }[]> = {
  conservative: [{ id: 1, action: "Route the excess stable balance to the current best low-risk pool", gain: "Improves monthly projection", risk: "Minimum", riskColor: "#10B981" }],
  balanced: [{ id: 2, action: "Shift part of the productive balance to the strongest live APY route", gain: "Improves monthly projection", risk: "Low", riskColor: "#10B981" }],
  aggressive: [
    { id: 3, action: "Open a higher-volatility route only if the exit engine remains healthy", gain: "Higher upside if approved", risk: "High", riskColor: "#EF4444" },
    { id: 4, action: "Keep bridge liquidity available for the next payment event", gain: "Pools remain intact", risk: "None", riskColor: "#A3D977" },
  ],
};

function mapServerLogToUi(log: { time: string; type: string; action: string }) {
  if (log.type === "yield") return { ...log, icon: DollarSign, color: "#10B981" };
  if (log.type === "rebalance") return { ...log, icon: RotateCcw, color: "#0D4B2E" };
  if (log.type === "protection") return { ...log, icon: Shield, color: "#3B82F6" };
  if (log.type === "opportunity") return { ...log, icon: Sparkles, color: "#A3D977" };
  return { ...log, icon: Activity, color: "#06B6D4" };
}

// ─── Mini Performance Chart ───────────────────────────────────────────────────
const PERF_DATA = [2.1, 3.4, 4.2, 5.8, 6.9, 7.5, 8.15];

function MiniPerfChart({ isDark }: { isDark: boolean }) {
  const W = 280; const H = 52;
  const pad = { t: 4, r: 4, b: 4, l: 4 };
  const iW = W - pad.l - pad.r; const iH = H - pad.t - pad.b;
  const min = Math.min(...PERF_DATA); const max = Math.max(...PERF_DATA); const range = max - min || 1;
  const xs = PERF_DATA.map((_, i) => pad.l + (i / (PERF_DATA.length - 1)) * iW);
  const ys = PERF_DATA.map((v) => pad.t + (1 - (v - min) / range) * iH);
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const area = line + ` L ${xs[xs.length - 1].toFixed(1)} ${(pad.t + iH).toFixed(1)} L ${xs[0].toFixed(1)} ${(pad.t + iH).toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <path d={area} fill="#A3D977" fillOpacity={isDark ? 0.12 : 0.1} />
      <path d={line} fill="none" stroke="#A3D977" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1].toFixed(1)} cy={ys[ys.length - 1].toFixed(1)} r="3.5" fill="#A3D977" stroke="var(--surface-solid)" strokeWidth="2" />
    </svg>
  );
}

// ─── Pool Composition Table ───────────────────────────────────────────────────
function PoolCompositionTable({ mode, allocations, totalCapitalUsd }: { mode: RiskMode; allocations?: AgentStatePayload["allocations"]; totalCapitalUsd?: number }) {
  const cfg = RISK_CONFIG[mode];
  const displayPools = allocations?.length
    ? allocations.filter((item) => item.id !== "buffer").map((item) => ({
        name: item.name,
        type: item.type,
        apy: item.apy,
        pct: item.pct,
        amount: item.amount,
        color: item.color,
      }))
    : cfg.pools;
  const totalManagedUsd = typeof totalCapitalUsd === "number"
    ? totalCapitalUsd
    : displayPools.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {displayPools.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="px-4 py-3.5"
          style={{ borderBottom: i < displayPools.length - 1 ? "1px solid var(--border-light)" : "none" }}
        >
          <div className="flex items-center gap-3 mb-2">
            {(p as any).iconUrl ? (
              <img src={(p as any).iconUrl} alt={p.name} className="w-8 h-8 rounded-xl object-contain p-1" style={{ background: `${p.color}18` }} />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${p.color}18` }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                <div className="flex items-center gap-2 ml-2">
                  <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: p.color }}>
                    {p.apy}
                  </span>
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    ${p.amount}
                  </span>
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>{p.type}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${p.pct}%` }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: p.color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: "9px" }}>{p.type}</span>
            <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-muted)", fontSize: "9px" }}>{p.pct}%</span>
          </div>
        </motion.div>
      ))}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "var(--card-bg)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Total Managed</span>
        <span className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>${totalManagedUsd.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Live Risk Monitor ────────────────────────────────────────────────────────
function LiveRiskMonitor({ mode }: { mode: RiskMode }) {
  const cfg = RISK_CONFIG[mode];
  const m = cfg.riskMetrics;
  const isAggressive = mode === "aggressive";

  const metrics = [
    {
      label: "Impermanent Loss",
      pct: m.il,
      value: isAggressive ? `${m.il}%` : `${m.il}%`,
      color: m.il < 20 ? "#10B981" : m.il < 60 ? "#F59E0B" : "#EF4444",
      status: m.ilLabel,
      badge: m.ilPositive ? "Real Profit ✓" : null,
    },
    {
      label: "Pool Depth",
      pct: m.poolDepth,
      value: m.poolDepth >= 85 ? "Deep" : m.poolDepth >= 65 ? "Adequate" : "Thin",
      color: m.poolDepth >= 85 ? "#A3D977" : m.poolDepth >= 65 ? "#F59E0B" : "#EF4444",
      status: m.poolDepth >= 85 ? "Healthy" : m.poolDepth >= 65 ? "Adequate" : "Monitoring",
      badge: null,
    },
    {
      label: "Exit Time",
      pct: m.withdrawalTime,
      value: m.withdrawalTime >= 90 ? "2–3s" : m.withdrawalTime >= 70 ? "3–5s" : "5–8s",
      color: m.withdrawalTime >= 90 ? "#06B6D4" : m.withdrawalTime >= 70 ? "#F59E0B" : "#EF4444",
      status: m.withdrawalTime >= 90 ? "Ultra Fast" : "Fast",
      badge: null,
    },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: isAggressive ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(163,217,119,0.12)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
      >
        <Activity className="w-4 h-4" style={{ color: cfg.color }} />
        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Live Risk Monitor
        </span>
        {isAggressive && (
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold animate-pulse"
            style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
          >
            ⚠️ Max Alert
          </span>
        )}
        {!isAggressive && (
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${cfg.color}15`, color: cfg.color }}
          >
            Monitoring
          </span>
        )}
      </div>

      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className="px-4 py-3"
          style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : "none" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {metric.label}
            </span>
            <div className="flex items-center gap-2">
              {metric.badge && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(163,217,119,0.15)", color: "#A3D977", fontSize: "9px" }}
                >
                  {metric.badge}
                </span>
              )}
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${metric.color}15`, color: metric.color, fontSize: "10px" }}>
                {metric.status}
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: metric.color }}>{metric.value}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metric.pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: metric.color }}
            />
          </div>
        </div>
      ))}

      {/* Stable routing guarantee */}
      <div className="px-4 pb-4 pt-2">
        <div
          className="rounded-xl p-2.5 flex items-start gap-2"
          style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}
        >
          <Route className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#06B6D4" }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "#06B6D4", fontWeight: 600 }}>Guaranteed Route:</span>{" "}
            {mode === "aggressive"
              ? "Buffer and bridge capacity cover payment events without touching the highest-yield pools."
              : "Liquidation always via USDm → USDC (Mento). Volatile tokens never used as bridge."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Credit Engine Bridge (aggressive only) ───────────────────────────────────
function CreditEngineBridge() {
  const [simulating, setSimulating] = useState(false);
  const [step, setStep] = useState(-1);

  const steps = [
    { label: "Small payment requested", color: "#A3D977", icon: "💳" },
    { label: "Agent accesses Credit Bridge", color: "#06B6D4", icon: "🤖" },
    { label: "Payment handled via bridge liquidity", color: "#F59E0B", icon: "⚡" },
    { label: "CELO/ETH Pool intact", color: "#10B981", icon: "🌿" },
    { label: "Yield pays debt tomorrow", color: "#8B5CF6", icon: "♾️" },
  ];

  const run = () => {
    if (simulating) return;
    setSimulating(true);
    setStep(0);
    steps.forEach((_, i) => {
      setTimeout(() => {
        setStep(i);
        if (i === steps.length - 1) setTimeout(() => { setSimulating(false); setStep(-1); }, 2000);
      }, i * 850);
    });
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, #0B3D25, #0D4B2E)",
        boxShadow: "0 4px 24px rgba(13,75,46,0.22)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4" style={{ color: "#06B6D4" }} />
        <span className="text-sm font-bold text-white">Credit Engine Bridge</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(6,182,212,0.25)", color: "#67E8F9" }}
        >
          Aggressive Mode
        </span>
      </div>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
        Instead of unwinding a profitable pool to pay a small transfer, the agent uses the{" "}
        <span className="text-white font-semibold">Credit Engine as a temporary bridge</span>{" "}
        — paying the debt with accumulated yield the next day.
      </p>

      <div className="space-y-2 mb-4">
        {steps.map((s, i) => {
          const isActive = step === i;
          const isDone = step > i;
          return (
            <motion.div
              key={i}
              animate={{ opacity: step === -1 ? 1 : isActive ? 1 : isDone ? 0.6 : 0.25 }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{
                background: isActive ? "rgba(255,255,255,0.12)" : isDone ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <p
                className="flex-1 text-xs font-semibold"
                style={{ color: isActive ? "#fff" : isDone ? "#A3D977" : "rgba(255,255,255,0.4)" }}
              >
                {s.label}
              </p>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A3D977" }} />}
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={run}
        disabled={simulating}
        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: simulating ? "rgba(255,255,255,0.08)" : "#A3D977",
          color: simulating ? "rgba(255,255,255,0.4)" : "#0D4B2E",
        }}
      >
        {simulating ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-3.5 h-3.5 rounded-full border-2 border-green-900/30 border-t-green-900" />
            Bridging...
          </>
        ) : (
          <><Layers className="w-3.5 h-3.5" /> Simulate Credit Bridge</>
        )}
      </motion.button>
    </div>
  );
}

// ─── Intent Detection Pulse (JIT warmup visual) ───────────────────────────────
function JITWarmupBadge({ mode }: { mode: RiskMode }) {
  const pool = mode === "conservative" ? "Aave v3" : mode === "balanced" ? "Ubeswap" : "Credit Bridge";
  const color = mode === "conservative" ? "#3B82F6" : mode === "balanced" ? "#A3D977" : "#F59E0B";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-5 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <p className="flex-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <span style={{ color, fontWeight: 600 }}>Active JIT Warmup:</span>{" "}
        When opening the card, the agent pre-heats liquidation via{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{pool}</span> → no payment delay.
      </p>
      <Brain className="w-4 h-4 flex-shrink-0" style={{ color }} />
    </motion.div>
  );
}

// ─── Agent Page ───────────────────────────────────────────────────────────────
export function AgentPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const {
    address,
    isConnected,
    hasConnector,
    walletSupportLabelEn,
    wrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectWallet,
    switchToCelo,
    signWalletMessage,
  } = useCeloWallet();
  const [riskMode, setRiskMode] = useState<RiskMode>("balanced");
  const [isRunning, setIsRunning] = useState(true);
  const [yieldToday, setYieldToday] = useState(0);
  const [opsCount, setOpsCount] = useState(0);
  const [authorized, setAuthorized] = useState<number[]>([]);
  const [dismissedAuths, setDismissedAuths] = useState<number[]>([]);
  const [liveLog, setLiveLog] = useState(MODE_LOGS.balanced);
  const [newLogFlash, setNewLogFlash] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [remoteState, setRemoteState] = useState<AgentStatePayload | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const cfg = RISK_CONFIG[riskMode];
  const canUseProtectedFlow = isConnected && !wrongNetwork && sessionReady;

  useEffect(() => {
    let active = true;
    const syncSessionState = async () => {
      const ready = await hasApiAuthSession();
      if (!active) return;
      setSessionReady(ready);
    };

    void syncSessionState();
    const onFocus = () => {
      void syncSessionState();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Switch log + reset on mode change
  useEffect(() => {
    setLiveLog(MODE_LOGS[riskMode]);
    setProfileExpanded(false);
    setAuthorized([]);
    setDismissedAuths([]);
  }, [riskMode]);

  useEffect(() => {
    let active = true;
    apiGet<AgentStatePayload>("/api/agent/state", {
      address: address || "",
      riskMode,
    })
      .then((payload) => {
        if (!active) return;
        setRemoteState(payload);
        setYieldToday(payload.status.yieldTodayUsd);
        setOpsCount(payload.status.opsCount);
        if (payload.logs?.length) {
          setLiveLog(payload.logs.map(mapServerLogToUi));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [address, riskMode]);

  // Simulate live yield ticking
  useEffect(() => {
    if (remoteState) return;
    if (!isRunning) return;
    const id = setInterval(() => {
      const tick = riskMode === "aggressive" ? 0.03 : riskMode === "balanced" ? 0.02 : 0.01;
      setYieldToday((v) => Math.round((v + tick) * 100) / 100);
      if (Math.random() < 0.18) {
        setOpsCount((c) => c + 1);
        setNewLogFlash(true);
        setTimeout(() => setNewLogFlash(false), 1000);
        const newEntry = MODE_LOGS[riskMode][Math.floor(Math.random() * 3)];
        setLiveLog((prev) => [{ ...newEntry, time: "Agora" }, ...prev.slice(0, 5)]);
      }
    }, 3200);
    return () => clearInterval(id);
  }, [isRunning, riskMode, remoteState]);

  const pendingAuths = (remoteState?.pendingAuthorizations?.length
    ? remoteState.pendingAuthorizations.map((item) => ({ ...item, id: Number(item.id) }))
    : MODE_AUTHS[riskMode]
  ).filter(
    (a) => !authorized.includes(a.id) && !dismissedAuths.includes(a.id)
  );

  const handlePrepareWallet = async () => {
    if (!hasConnector) {
      toast.error(`No wallet detected. Open the app in ${walletSupportLabelEn}.`);
      return;
    }

    try {
      let connectedAddress = address;

      if (!isConnected) {
        const session = await connectWallet();
        connectedAddress = session.accounts?.[0] || "";
        if (session.chainId !== CELO_CHAIN_ID) {
          await switchToCelo();
        }
      } else if (wrongNetwork) {
        await switchToCelo();
      }

      const walletAddress = connectedAddress || address;
      if (!walletAddress) {
        throw new Error("Wallet address unavailable after connection.");
      }

      await ensureWalletAuthSession(walletAddress, signWalletMessage);
      setSessionReady(true);
      toast.success("Wallet ready on Celo Sepolia.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prepare wallet session.";
      toast.error(message);
    }
  };

  const submitAuthorization = async (id: number, accepted: boolean) => {
    if (!address) {
      toast.error("Connect a wallet before authorizing agent actions.");
      return false;
    }
    
    // Karma Telemetry for Hackathon
    if (accepted && window.location.hostname !== 'localhost') {
      console.log(`[AgentScan Telemetry] Intent ERC-8004 authorized by ${address}`);
      // In a real implementation this would ping the Karma execute endpoint
    }

    if (wrongNetwork) {
      toast.error("Switch to Celo Sepolia before authorizing agent actions.");
      return false;
    }

    try {
      await ensureWalletAuthSession(address, signWalletMessage);
      setSessionReady(true);
      const safeActionId = sanitizeActionId(id);
      await apiPost("/api/agent/authorize", {
        address,
        actionId: safeActionId,
        accepted,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit authorization.";
      toast.error(message);
      return false;
    }
  };

  const handleAuthorize = async (id: number | string) => {
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) || 1001 : id;
    const submitted = await submitAuthorization(numericId, true);
    if (!submitted) return;
    setAuthorized((prev) => [...prev, numericId]);
    setOpsCount((c) => c + 1);
  };

  const handleDismiss = async (id: number) => {
    const submitted = await submitAuthorization(id, false);
    if (!submitted) return;
    setDismissedAuths((prev) => [...prev, id]);
  };

  // APY shown in header varies by mode
  const apyDisplay = (remoteState?.blendedApy ?? cfg.apyTarget).toFixed(1) + "%";

  return (
    <div className="min-h-dvh bg-background pb-28 overflow-x-hidden">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
            AI Agent
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            LiquidAI Treasury Optimizer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(163,217,119,0.12)", border: "1px solid rgba(163,217,119,0.3)" }}
          >
            <MessageSquare className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>AI Chat</span>
          </motion.button>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: isRunning ? "rgba(163,217,119,0.15)" : "rgba(107,114,128,0.1)",
              border: `1px solid ${isRunning ? "rgba(163,217,119,0.4)" : "rgba(107,114,128,0.2)"}`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: isRunning ? "#A3D977" : "#6B7280", animation: isRunning ? "pulse 1.5s infinite" : "none" }}
            />
            <span className="text-xs font-semibold" style={{ color: isRunning ? "#A3D977" : "var(--text-muted)" }}>
              {isRunning ? "Online" : "Paused"}
            </span>
          </div>
        </div>
      </header>

      {!canUseProtectedFlow && (
        <div className="px-5 mt-4">
          <div
            className="rounded-2xl p-4"
            style={{
              background: wrongNetwork ? "rgba(245,158,11,0.1)" : "var(--surface-solid)",
              border: `1px solid ${wrongNetwork ? "rgba(245,158,11,0.28)" : "var(--border-light)"}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: wrongNetwork ? "rgba(245,158,11,0.15)" : "rgba(163,217,119,0.12)" }}
              >
                {wrongNetwork ? (
                  <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />
                ) : (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {wrongNetwork ? "Wrong network detected" : "Wallet session required"}
                </p>
                <div className="mt-1 space-y-1">
                  <p className="text-xs" style={{ color: isConnected ? "#A3D977" : "var(--text-muted)" }}>
                    Wallet: {isConnected ? "Connected" : "Not connected"}
                  </p>
                  <p className="text-xs" style={{ color: sessionReady ? "#A3D977" : "var(--text-muted)" }}>
                    Session: {sessionReady ? "Active" : "Required"}
                  </p>
                  <p className="text-xs" style={{ color: wrongNetwork ? "#F59E0B" : "#A3D977" }}>
                    Network: {wrongNetwork ? "Wrong network" : "Celo Sepolia"}
                  </p>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  Authorize Agent stays blocked until wallet, session, and Celo Sepolia are ready.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrepareWallet}
              disabled={isConnecting || isSwitchingChain || isSigningMessage}
              className="mt-3 w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: wrongNetwork
                  ? "rgba(245,158,11,0.15)"
                  : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                color: wrongNetwork ? "#F59E0B" : "#A3D977",
                opacity: isConnecting || isSwitchingChain || isSigningMessage ? 0.7 : 1,
              }}
            >
              {isConnecting
                ? "Connecting wallet..."
                : isSwitchingChain
                  ? "Switching to Celo Sepolia..."
                  : isSigningMessage
                    ? "Activating session..."
                    : !isConnected
                      ? "Connect wallet"
                      : wrongNetwork
                        ? "Switch to Celo Sepolia"
                        : "Activate session"}
            </button>
          </div>
        </div>
      )}

      {/* ── AGENT STATUS CARD ──────────────────────────────── */}
      <div className="px-5 mt-4 mb-5">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: isRunning
              ? "linear-gradient(145deg, #0B3D25 0%, #0D4B2E 50%, #12593A 100%)"
              : "linear-gradient(145deg, #1F2937 0%, #374151 100%)",
            boxShadow: isRunning ? "0 12px 40px rgba(13,75,46,0.3)" : "0 8px 24px rgba(0,0,0,0.2)",
            transition: "background 0.5s ease",
          }}
        >
          <div
            className="absolute top-0 right-0 rounded-full pointer-events-none"
            style={{ width: 180, height: 180, background: "radial-gradient(circle, rgba(163,217,119,0.12) 0%, transparent 70%)", transform: "translate(30%,-30%)" }}
          />
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(163,217,119,0.15)" }}>
                <Bot className="w-7 h-7" style={{ color: "#A3D977" }} />
                {isRunning && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full" style={{ background: "#A3D977", border: "2px solid #0D4B2E", animation: "pulse 1.5s infinite" }} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">LiquidAI Agent</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {remoteState
                    ? `Celo synced · $${remoteState.totalCapitalUsd.toFixed(2)} under automation`
                    : "Waiting for wallet snapshot"}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${cfg.color}25`, color: cfg.color }}>
                    {(() => { const MI = (cfg as any).ModeIcon; return <MI className="w-3 h-3" style={{ color: cfg.color }} />; })()}
                    <span>{cfg.label}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                    {apyDisplay} APY
                  </div>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsRunning((r) => !r)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                {isRunning ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </motion.button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 rounded-2xl overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
              {[
                { label: "Yield Today", value: `+$${yieldToday.toFixed(2)}`, color: "#A3D977" },
                { label: "Managed Capital", value: remoteState ? `$${remoteState.totalCapitalUsd.toFixed(2)}` : "--", color: "#ffffff" },
                { label: "Operations", value: opsCount.toString(), color: "#ffffff" },
              ].map((m, i) => (
                <div key={m.label} className="px-2 py-3 text-center" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <div className="font-mono font-bold" style={{ color: m.color, fontSize: "1rem" }}>{m.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Perf chart */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Current monthly projection</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#A3D977" }}>
                  {remoteState ? `+$${remoteState.projectedMonthlyYieldUsd.toFixed(2)}` : "--"}
                </span>
              </div>
              <div style={{ height: 52 }}><MiniPerfChart isDark={isDark} /></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── JIT WARMUP BADGE ───────────────────────────────── */}
      <JITWarmupBadge mode={riskMode} />

      {/* ── RISK MODE SELECTOR ─────────────────────────────── */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
          Risk Profile
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {(Object.values(RISK_CONFIG) as typeof RISK_CONFIG[RiskMode][]).map((mode) => {
            const Icon = mode.icon;
            const active = riskMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setRiskMode(mode.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl relative"
                style={{
                  background: active ? mode.bg : "var(--surface-solid)",
                  border: `1.5px solid ${active ? mode.color : "transparent"}`,
                  boxShadow: active ? `0 4px 16px ${mode.color}20` : "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease",
                }}
              >
                {(() => { const MI = (mode as any).ModeIcon; return <MI className="w-5 h-5" style={{ color: active ? mode.color : "var(--text-muted)" }} />; })()}
                <span className="text-xs font-semibold text-center leading-tight" style={{ color: active ? mode.color : "var(--text-muted)" }}>
                  {mode.label}
                </span>
                <span className="font-mono text-xs font-bold" style={{ color: active ? mode.color : "var(--text-muted)", opacity: active ? 1 : 0.5 }}>
                  {mode.apy}
                </span>
                {active && (
                  <motion.div
                    layoutId="riskIndicator"
                    className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{ background: mode.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Profile detail card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={riskMode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface-solid)", border: `1px solid ${cfg.color}20`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
          >
            <button
              className="w-full px-4 py-3.5 text-left flex items-start gap-3"
              onClick={() => setProfileExpanded((v) => !v)}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                {(() => { const MI = (cfg as any).ModeIcon; return <MI className="w-4.5 h-4.5" style={{ color: cfg.color }} />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.subtitle}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {cfg.narrative}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cfg.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cfg.color}12`, color: cfg.color, fontSize: "10px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronDown
                className="w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-200"
                style={{ color: "var(--text-muted)", transform: profileExpanded ? "rotate(180deg)" : "none" }}
              />
            </button>

            <AnimatePresence>
              {profileExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid var(--border-light)" }}>
                    <div
                      className="rounded-xl p-3 flex items-start gap-2"
                      style={{ background: `${cfg.color}08` }}
                    >
                      <Brain className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: cfg.color }}>Agent Behavior</p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{cfg.agentBehavior}</p>
                        <p className="text-xs mt-1.5 font-mono" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                          Ex: "{cfg.sampleLog}"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── PENDING AUTHORIZATION ──────────────────────────── */}
      <AnimatePresence>
        {pendingAuths.length > 0 && (
          <motion.div
            key={`auths-${riskMode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-5 mb-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
              Pending Authorization
            </p>
            <div className="space-y-3">
              {pendingAuths.map((auth) => (
                <div
                  key={auth.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: "var(--surface-solid)",
                    border: `1px solid ${auth.risk === "Elevado" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`,
                    boxShadow: `0 2px 16px ${auth.risk === "Elevado" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)"}`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${auth.riskColor}15` }}
                    >
                      <AlertTriangle className="w-4 h-4" style={{ color: auth.riskColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{auth.action}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono font-bold" style={{ color: "#10B981" }}>{auth.gain}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${auth.riskColor}12`, color: auth.riskColor }}>
                          Risk {auth.risk}
                        </span>
                        {auth.intentId && (
                          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full" style={{ background: `rgba(163,217,119,0.1)`, color: "#A3D977" }}>
                            ERC-8004
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAuthorize(auth.id)}
                      disabled={!canUseProtectedFlow}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: canUseProtectedFlow ? "#0D4B2E" : "var(--muted)",
                        color: canUseProtectedFlow ? "#A3D977" : "var(--text-muted)",
                        opacity: canUseProtectedFlow ? 1 : 0.7,
                      }}
                    >
                      ✓ Authorize
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleDismiss(auth.id);
                      }}
                      disabled={!canUseProtectedFlow}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: "var(--muted)",
                        color: "var(--text-muted)",
                        opacity: canUseProtectedFlow ? 1 : 0.6,
                      }}
                    >
                      Ignore
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POOL COMPOSITION ───────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Pool Composition
          </p>
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.subtitle}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`pools-${riskMode}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
          >
            <PoolCompositionTable
              mode={riskMode}
              allocations={remoteState?.allocations}
              totalCapitalUsd={remoteState?.totalCapitalUsd}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── LIVE RISK MONITOR ──────────────────────────────── */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
          Live Risk Monitor
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={`risk-${riskMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LiveRiskMonitor mode={riskMode} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CREDIT ENGINE BRIDGE (REMOVED FOR MVP STREAMLINING) ─────────── */}
      {/* ── ACTIVITY LOG ───────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Activity Log
          </p>
          <AnimatePresence>
            {newLogFlash && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs font-semibold"
                style={{ color: "#A3D977" }}
              >
                ● New Action
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <AnimatePresence initial={false}>
            {liveLog.slice(0, 6).map((log, i) => {
              const Icon = log.icon;
              return (
                <motion.div
                  key={`${log.time}-${log.action}-${i}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderBottom: i < 5 ? "1px solid var(--border-light)" : "none" }}
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${log.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: log.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{log.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{log.time}</p>
                      {log.intentId && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm" style={{ background: `${log.color}10`, color: log.color }}>
                          ERC-8004: {log.intentId.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── INSIGHTS CARD (REMOVED FOR MVP STREAMLINING) ──────────────────────────────────── */}

      {/* ── PERFORMANCE STATS ──────────────────────────────── */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
          Cumulative Performance
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: DollarSign, label: "Projected Yield", value: remoteState ? `$${remoteState.projectedMonthlyYieldUsd.toFixed(2)}` : "--", sub: remoteState ? "Based on current capital" : "Waiting sync", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
            { icon: TrendingUp, label: "Current APY", value: apyDisplay, sub: cfg.subtitle, color: cfg.color, bg: cfg.bg },
            { icon: Clock, label: "State", value: remoteState ? "Live" : "Standby", sub: remoteState ? "Session synced" : "Waiting wallet snapshot", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
            { icon: Activity, label: "Operations", value: opsCount.toString(), sub: "Automated by agent", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="rounded-2xl p-4"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="font-mono font-bold mb-0.5" style={{ color: "var(--text-primary)", fontSize: "1.15rem" }}>
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
                <div className="text-xs mt-1 font-medium" style={{ color: stat.color }}>{stat.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── AGENT CONTROLS ─────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="space-y-2.5">
          {[
            { icon: Shield, label: "Security Settings", sub: "Agent limits and permissions", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
            { icon: Globe, label: "Allowed Protocols", sub: "Aave, Morpho, Mento, Ubeswap, PWN", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
            { icon: Sparkles, label: "Yield Strategy", sub: `${cfg.subtitle} · Auto mode active`, color: cfg.color, bg: cfg.bg },
          ].map(({ icon: Icon, label, sub, color, bg }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
              style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  );
}
