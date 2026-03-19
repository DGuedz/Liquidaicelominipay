import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Zap,
  DollarSign,
  Percent,
  Shield,
  Bot,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  YieldIcon,
  InflationShieldIcon,
  PoolsIcon,
  ApyIcon,
  WalletIcon,
  AgentIcon as AgentSvg,
  BankIcon,
  SwapIcon,
  NetworkIcon,
  JITIcon,
} from "../components/icons";
import { apiGet, AnalyticsPayload } from "../lib/api";
import { useCeloWallet } from "../hooks/use-celo-wallet";

const cashflowData = [
  { month: "D-6", income: 0, spending: 0 },
  { month: "D-5", income: 0, spending: 0 },
  { month: "D-4", income: 0, spending: 0 },
  { month: "D-3", income: 0, spending: 0 },
  { month: "D-2", income: 0, spending: 0 },
  { month: "D-1", income: 0, spending: 0 },
  { month: "Today", income: 0, spending: 0 },
];

const yieldData = [
  { month: "D-6", yield: 0 },
  { month: "D-5", yield: 0 },
  { month: "D-4", yield: 0 },
  { month: "D-3", yield: 0 },
  { month: "D-2", yield: 0 },
  { month: "D-1", yield: 0 },
  { month: "Today", yield: 0 },
];

const allocationData = [
  { name: "Productive Capital", value: 0, color: "#0D4B2E", pct: "0%" },
  { name: "Yield Reserve", value: 0, color: "#A3D977", pct: "0%" },
  { name: "Reserve", value: 0, color: "#E5E7EB", pct: "0%" },
];

const keyMetrics = [
  {
    icon: Percent,
    label: "Current APY",
    value: "--",
    sub: "Waiting for snapshot",
    color: "#0D4B2E",
    bg: "#E8F5E9",
  },
  {
    icon: DollarSign,
    label: "Total Yield",
    value: "$0.00",
    sub: "No history yet",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    icon: Zap,
    label: "Optimizations",
    value: "0",
    sub: "By AI Agent",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: TrendingUp,
    label: "Total Return",
    value: "$0.00",
    sub: "Current projection",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
  },
];

const tabs = ["Cashflow", "Allocation", "Yield", "Protection", "Value"];

// ─── Inflation Shield data (12 months) ────────────────────────────────────────
// BRL Savings: 7% SELIC nominal − 6.5% IPCA = ~0.5% real → purchasing power barely moves
// USDm + LiquidAI: 4.8% APY, dollar-pegged = no inflation risk
function buildInflationData(startBRL: number) {
  const months = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
  const inflationMonthly = 0.0054;    // ~6.5% IPCA annually
  const selicMonthly = 0.00583;       // ~7% SELIC annually
  const liquidAIMonthly = 0.004;      // 4.8% APY monthly compounding
  return months.map((month, i) => {
    const brlNominal = startBRL * Math.pow(1 + selicMonthly, i);
    const brlReal = startBRL * Math.pow(1 + (selicMonthly - inflationMonthly), i); // real purchasing power
    const liquidAI = startBRL * Math.pow(1 + liquidAIMonthly, i);
    return {
      month,
      brlNominal: parseFloat(brlNominal.toFixed(2)),
      brlReal: parseFloat(brlReal.toFixed(2)),
      liquidAI: parseFloat(liquidAI.toFixed(2)),
    };
  });
}

// ─── Agent protection log ─────────────────────────────────────────────────────
const AGENT_PROTECTION_LOGS = [
  {
    id: 1,
    time: "Now",
    event: "Wallet synced",
    action: "Protection logs will appear after the first live hedge or rebalance.",
    type: "protect",
    icon: Shield,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    impact: "No impact realized yet",
  },
];

// ─── Vault 3-reserve architecture ────────────────────────────────────────────
const VAULT_RESERVES = [
  {
    id: "buffer",
    label: "Liquidity Buffer",
    desc: "Instant payments · card · PIX",
    pct: 12.5,
    amount: 0,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    VaultIcon: JITIcon,
    yield: "Available after first operation",
  },
  {
    id: "vault",
    label: "Yield Vault",
    desc: "AMMs + Lending · working 24/7",
    pct: 75,
    amount: 0,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    VaultIcon: YieldIcon,
    yield: "Dynamic APY",
  },
  {
    id: "credit",
    label: "Credit Engine",
    desc: "Collateralized credit (Q4) · 70% of vault",
    pct: 12.5,
    amount: 0,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    VaultIcon: BankIcon,
    yield: "Available when credit module is active",
  },
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [overview, setOverview] = useState<AnalyticsPayload | null>(null);
  const { address } = useCeloWallet();

  useEffect(() => {
    let active = true;
    apiGet<AnalyticsPayload>("/api/analytics/overview", { riskMode: "balanced", address: address || "" })
      .then((payload) => {
        if (!active) return;
        setOverview(payload);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [address]);

  const displayMetrics = overview?.keyMetrics?.length
    ? overview.keyMetrics.map((metric) => ({
        ...metric,
        icon: keyMetrics.find((item) => item.label === metric.label)?.icon || TrendingUp,
      }))
    : keyMetrics;
  const displayCashflowData = overview?.cashflowData?.length ? overview.cashflowData : cashflowData;
  const displayYieldData = overview?.yieldData?.length ? overview.yieldData : yieldData;
  const displayAllocationData = overview?.allocationData?.length
    ? overview.allocationData.map((item) => ({
        ...item,
        pct: `${Math.round((item.value / (overview.allocationData.reduce((sum, row) => sum + row.value, 0) || 1)) * 100)}%`,
      }))
    : allocationData;
  const displayProtectionLogs = overview?.protectionLogs?.length
    ? overview.protectionLogs.map((log) => ({
        ...log,
        icon:
          log.type === "protect"
            ? Shield
            : log.type === "yield"
            ? DollarSign
            : log.type === "risk"
            ? CheckCircle2
            : Zap,
        color:
          log.type === "protect"
            ? "#3B82F6"
            : log.type === "yield"
            ? "#10B981"
            : log.type === "risk"
            ? "#8B5CF6"
            : "#A3D977",
        bg:
          log.type === "protect"
            ? "rgba(59,130,246,0.1)"
            : log.type === "yield"
            ? "rgba(16,185,129,0.1)"
            : log.type === "risk"
            ? "rgba(139,92,246,0.1)"
            : "rgba(163,217,119,0.1)",
      }))
    : AGENT_PROTECTION_LOGS;
  const displayVaultReserves = overview?.vaultReserves?.length
    ? overview.vaultReserves.map((reserve) => ({
        ...reserve,
        VaultIcon:
          reserve.id === "buffer"
            ? JITIcon
            : reserve.id === "vault"
            ? YieldIcon
            : BankIcon,
      }))
    : VAULT_RESERVES;
  const trackedBalance = displayAllocationData.reduce((sum, item) => sum + item.value, 0);
  const inflationData = buildInflationData(Math.max(1, trackedBalance || 1));
  const yieldStart = displayYieldData[0]?.yield || 0;
  const yieldEnd = displayYieldData[displayYieldData.length - 1]?.yield || 0;
  const yieldGrowthPct = yieldStart > 0 ? ((yieldEnd - yieldStart) / yieldStart) * 100 : 0;
  const protectedDelta = Math.max(0, (inflationData[inflationData.length - 1]?.liquidAI || 0) - (inflationData[inflationData.length - 1]?.brlReal || 0));
  const totalVaultUsd = displayVaultReserves.reduce((sum, reserve) => sum + reserve.amount, 0);

  return (
    <div className="min-h-dvh bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <h1 className="font-bold text-text-primary mb-1" style={{ fontSize: "1.5rem" }}>
          Analytics
        </h1>
        <p className="text-sm text-text-muted">
          Real-time financial intelligence
        </p>
      </header>

      {/* Key Metrics Grid */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {displayMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-surface-solid rounded-2xl p-4"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: m.bg }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: m.color }} />
                </div>
                <div className="font-mono font-bold text-xl text-text-primary mb-0.5">
                  {m.value}
                </div>
                <div className="text-xs text-text-muted">{m.label}</div>
                <div className="text-xs mt-1 font-medium" style={{ color: m.color }}>
                  {m.sub}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chart Section */}
      <div className="px-5 mb-5">
        {/* Tab Selector */}
        <div
          className="flex gap-1 bg-surface-solid rounded-2xl p-1 mb-4"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTab === i ? "#0D4B2E" : "transparent",
                color: activeTab === i ? "#FFFFFF" : "var(--text-muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Cashflow ── */}
          {activeTab === 0 && (
            <motion.div
              key="cashflow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-surface-solid rounded-2xl p-5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-text-primary text-sm">
                  Inflow vs Outflow
                </span>
                <span className="text-xs text-text-muted">Last checkpoints</span>
              </div>
              <div className="h-44">
                <DualLineChart data={displayCashflowData} />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-success" />
                  <span className="text-xs text-text-muted">Inflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-warning" />
                  <span className="text-xs text-text-muted">Outflow</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Allocation ── */}
          {activeTab === 1 && (
            <motion.div
              key="allocation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-surface-solid rounded-2xl p-5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-text-primary text-sm">
                  Capital Allocation
                </span>
                <span className="text-xs text-text-muted">Current</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={70}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {displayAllocationData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface-solid)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        formatter={(v: number) => `$${v.toLocaleString("en-US")}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {displayAllocationData.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span className="text-xs text-text-muted leading-tight">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          {item.pct}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full w-full"
                        style={{ background: "var(--muted)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ background: item.color, width: item.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="mt-4 p-3 rounded-xl"
                style={{ background: "var(--card-bg)" }}
              >
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold" style={{ color: "#A3D977" }}>
                    LiquidAI allocated {displayAllocationData.find((item) => item.name === "Productive Capital")?.pct || "0%"}
                  </span>{" "}
                  of current capital in productive positions
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Yield ── */}
          {activeTab === 2 && (
            <motion.div
              key="yield"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-surface-solid rounded-2xl p-5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-text-primary text-sm">
                  Yield Generated by Agent
                </span>
                <span className="text-xs text-text-muted">Monthly ($)</span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayYieldData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#718096", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#718096", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface-solid)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, "Yield"]}
                      cursor={{ fill: "rgba(13,75,46,0.05)" }}
                    />
                    <Bar dataKey="yield" fill="#0D4B2E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className="mt-4 p-3 rounded-xl"
                style={{ background: "rgba(163,217,119,0.1)" }}
              >
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-semibold" style={{ color: "#A3D977" }}>
                    {yieldGrowthPct > 0 ? `+${yieldGrowthPct.toFixed(0)}% growth` : "No historical growth yet"}
                  </span>{" "}
                  in yield generated in the last 6 months via AI agent automation
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Protection (Inflation Shield) ─ */}
          {activeTab === 3 && (
            <motion.div
              key="protection"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Inflation Shield Chart */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      Inflation Shield
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      BRL Savings vs USDm + LiquidAI · 12 months
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977" }}
                  >
                    +${protectedDelta.toFixed(2)} protected
                  </span>
                </div>

                <div className="h-48 mt-3">
                  <InflationShieldChart data={inflationData} />
                </div>

                <div className="flex items-center gap-5 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ background: "#EF4444" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      BRL real (purchasing power)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ background: "#A3D977" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      USDm + LiquidAI
                    </span>
                  </div>
                </div>

                {/* Delta callout */}
                <div
                  className="mt-3 rounded-xl p-3 flex items-start gap-3"
                  style={{ background: "rgba(163,217,119,0.07)", border: "1px solid rgba(163,217,119,0.2)" }}
                >
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#A3D977" }} />
                  <div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      This projection compares keeping capital idle in local currency vs keeping the same balance under agent monitoring. The gain shown uses real synchronized capital now, without artificial seeding.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { label: "Morpho Looping", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
                        { label: "Mento V3 FX", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
                        { label: "stCELO Staking", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
                        { label: "Daimo On-ramp", color: "#A3D977", bg: "rgba(163,217,119,0.1)" },
                      ].map((tag) => (
                        <span
                          key={tag.label}
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: tag.bg, color: tag.color, fontSize: "9px" }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                      Yield via institutional staking and lending strategies (Morpho · Celo Mondo · Mar/2026)
                    </p>
                  </div>
                </div>
              </div>

              {/* Vault 3-Reserve Architecture */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
                >
                  <Layers className="w-4 h-4" style={{ color: "#A3D977" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    3-Reserve Architecture
                  </span>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977" }}
                  >
                    ${totalVaultUsd.toFixed(2)} total
                  </span>
                </div>

                {/* Visual allocation bar */}
                <div className="px-4 py-3">
                  <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
                    {displayVaultReserves.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ background: r.color }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>Buffer 12.5%</span>
                    <span style={{ color: "#A3D977", fontWeight: 600 }}>Yield Vault 75%</span>
                    <span>Credit 12.5%</span>
                  </div>
                </div>

                {displayVaultReserves.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: r.bg }}
                    >
                      {(() => { const VI = r.VaultIcon; return <VI className="w-5 h-5" style={{ color: r.color }} />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {r.label}
                        </span>
                        <span className="font-mono text-sm font-bold" style={{ color: r.color }}>
                          ${r.amount}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.desc}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: r.color }}>
                        {r.yield}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agent Protection Log */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
                >
                  <Bot className="w-4 h-4" style={{ color: "#A3D977" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Agent Protection Log
                  </span>
                  <span
                    className="ml-auto w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#A3D977" }}
                  />
                </div>

                {displayProtectionLogs.map((log, i) => {
                  const Icon = log.icon;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="px-4 py-3.5"
                      style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : "none" }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: log.bg }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: log.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                              {log.event}
                            </p>
                            <span
                              className="text-xs flex-shrink-0 ml-2"
                              style={{ color: "var(--text-muted)", fontSize: "10px" }}
                            >
                              {log.time}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {log.action}
                          </p>
                          <div
                            className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full"
                            style={{ background: log.bg }}
                          >
                            <span className="text-xs font-semibold" style={{ color: log.color, fontSize: "10px" }}>
                              {log.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Narrative card */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(135deg, #0B3D25, #0D4B2E)",
                  boxShadow: "0 4px 24px rgba(13,75,46,0.22)",
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(163,217,119,0.6)" }}>
                  Self-Custody Yield Bank
                </p>
                <p className="text-sm text-white mb-3 leading-relaxed">
                  Your money remains <span style={{ color: "#A3D977" }}>100% yours</span>, working automatically in DeFi — without an intermediary bank.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Keeps in $", value: "USDm" },
                    { label: "Yield generated", value: "4.8%" },
                    { label: "Bank required", value: "Zero" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-2.5 text-center"
                      style={{ background: "rgba(255,255,255,0.06)" }}
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
            </motion.div>
          )}
          {/* ── Value Delivered (Win-Win) ─ */}
          {activeTab === 4 && (
            <motion.div
              key="value"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Win-Win Model Header */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      Agent Value Delivered
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Win-Win Protocol Economics
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(163,217,119,0.12)" }}
                  >
                    <Bot className="w-5 h-5" style={{ color: "#A3D977" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border-light)" }}>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">User Value</p>
                    <p className="font-mono text-lg font-bold" style={{ color: "#10B981" }}>+${(monthlyYieldUsd * 0.9 + 2.5).toFixed(2)}</p>
                    <p className="text-[10px] mt-1 text-text-secondary">Slippage & gas saved</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "#8B5CF6" }}>Protocol Revenue</p>
                    <p className="font-mono text-lg font-bold" style={{ color: "#8B5CF6" }}>${(monthlyYieldUsd * 0.1).toFixed(2)}</p>
                    <p className="text-[10px] mt-1 text-text-secondary">Invisible success fee (10%)</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  LiquidAI <span className="font-semibold text-text-primary">never charges from your principal</span>. The protocol sustains itself by taking a fraction of the extra value generated by the AI agent's optimizations (Dark Pools, Yield Routing, and Gas Batching).
                </p>
              </div>

              {/* Revenue Streams Breakdown */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--border-light)", background: "var(--muted)" }}
                >
                  <Layers className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Unfair Advantage Engines
                  </span>
                </div>

                {[
                  {
                    title: "Smart Remittances & FX Timing",
                    desc: "Agent waits for optimal Mento V3 oracle rates before swapping local currencies.",
                    userWin: "Better exchange rate",
                    protoWin: "Spread capture",
                    color: "#A3D977",
                    icon: SwapIcon
                  },
                  {
                    title: "A2A Dark Pools",
                    desc: "Agents match intent peer-to-peer at oracle price before hitting the AMM.",
                    userWin: "Zero AMM slippage",
                    protoWin: "Match fee",
                    color: "#F59E0B",
                    icon: PoolsIcon
                  },
                  {
                    title: "Gas-Optimized Batching",
                    desc: "Thousands of user intents executed in a single transaction via Fee Abstraction.",
                    userWin: "Institutional yield access",
                    protoWin: "Performance fee",
                    color: "#3B82F6",
                    icon: NetworkIcon
                  }
                ].map((item, i) => (
                  <div key={i} className="p-4" style={{ borderTop: i > 0 ? "1px solid var(--border-light)" : "none" }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20` }}>
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                        <span className="font-semibold">User:</span> {item.userWin}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-md" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>
                        <span className="font-semibold">Protocol:</span> {item.protoWin}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Route Intelligence Panel */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface-solid)",
            boxShadow: "0 4px 20px rgba(13,75,46,0.15)",
            border: "1px solid rgba(163,217,119,0.25)",
          }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)", background: "rgba(163,217,119,0.05)" }}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "#A3D977" }} />
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Route Intelligence
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "#A3D977", color: "#0D4B2E" }}>
              Live Mento V3
            </span>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: "var(--background)" }}>
                <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Effective Rate</p>
                <p className="font-mono text-sm font-bold" style={{ color: "#A3D977" }}>1 USDm = 5.02 BRLm</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--background)" }}>
                <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Projected Slippage</p>
                <p className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>&lt; 0.1%</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--background)" }}>
                <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Gas Cost</p>
                <p className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>0.001 USDm</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--background)" }}>
                <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Pool Depth</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <p className="font-mono text-sm font-bold" style={{ color: "var(--success)" }}>Healthy</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#8B5CF6" }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Reward Overlay Active</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Agent is optimizing yield across Uniswap/Merkl with fee abstraction in stablecoins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            boxShadow: "0 4px 20px rgba(13,75,46,0.2)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">
              AI Agent Insight
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              The agent compares buffer, pools, and on-chain opportunities using only the current wallet balance. When there is a material APY improvement, it appears here with real impact estimation.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#A3D977", color: "#0D4B2E" }}
              >
                Authorize
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                See details
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Custom dual-line SVG chart (replaces Recharts AreaChart) ─────────────────
function DualLineChart({
  data,
}: {
  data: { month: string; income: number; spending: number }[];
}) {
  const W = 320;
  const H = 130;
  const pad = { t: 8, r: 8, b: 22, l: 36 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const allVals = data.flatMap((d) => [d.income, d.spending]);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * iW);
  const yIncome = data.map((d) => pad.t + (1 - (d.income - min) / range) * iH);
  const ySpend = data.map((d) => pad.t + (1 - (d.spending - min) / range) * iH);

  const makePath = (ys: number[]) =>
    xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");

  const makeArea = (ys: number[]) =>
    makePath(ys) +
    ` L ${xs[xs.length - 1].toFixed(1)} ${(pad.t + iH).toFixed(1)}` +
    ` L ${xs[0].toFixed(1)} ${(pad.t + iH).toFixed(1)} Z`;

  const yTicks = [min, (min + max) / 2, max].map((v) => ({
    val: v,
    y: pad.t + (1 - (v - min) / range) * iH,
    label: `$${Math.round(v)}`,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      {yTicks.map((t, i) => (
        <text key={`y-${i}`} x={pad.l - 4} y={t.y + 3} textAnchor="end" fill="#A0AEC0" fontSize="8.5" fontFamily="system-ui">
          {t.label}
        </text>
      ))}
      <path d={makeArea(yIncome)} fill="#10B981" fillOpacity={0.1} />
      <path d={makeArea(ySpend)} fill="#F59E0B" fillOpacity={0.1} />
      <path d={makePath(yIncome)} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={makePath(ySpend)} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={`x-${i}`} x={xs[i]} y={H - 5} textAnchor="middle" fill="#A0AEC0" fontSize="9" fontFamily="system-ui">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─── Inflation Shield SVG Chart ────────────────────────────────────────────────
function InflationShieldChart({
  data,
}: {
  data: { month: string; brlNominal: number; brlReal: number; liquidAI: number }[];
}) {
  const W = 320;
  const H = 150;
  const pad = { t: 8, r: 8, b: 22, l: 40 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const allVals = data.flatMap((d) => [d.brlReal, d.liquidAI]);
  const min = Math.min(...allVals) - 2;
  const max = Math.max(...allVals) + 2;
  const range = max - min || 1;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * iW);

  const yBRLReal   = data.map((d) => pad.t + (1 - (d.brlReal - min) / range) * iH);
  const yLiquidAI  = data.map((d) => pad.t + (1 - (d.liquidAI - min) / range) * iH);

  const makePath = (ys: number[]) =>
    xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");

  const makeArea = (ys: number[], baseY: number) =>
    makePath(ys) +
    ` L ${xs[xs.length - 1].toFixed(1)} ${baseY.toFixed(1)}` +
    ` L ${xs[0].toFixed(1)} ${baseY.toFixed(1)} Z`;

  const baseY = pad.t + iH;

  const yTicks = [min, (min + max) / 2, max].map((v) => ({
    val: v,
    y: pad.t + (1 - (v - min) / range) * iH,
    label: `$${Math.round(v)}`,
  }));

  // Show only every other month label
  const xLabels = data.filter((_, i) => i % 2 === 0);
  const xLabelXs = xs.filter((_, i) => i % 2 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="liquidAIGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A3D977" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#A3D977" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="brlGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {yTicks.map((t, i) => (
        <g key={`yt-${i}`}>
          <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="var(--border-light)" strokeWidth="0.5" />
          <text x={pad.l - 4} y={t.y + 3} textAnchor="end" fill="#A0AEC0" fontSize="8.5" fontFamily="system-ui">
            {t.label}
          </text>
        </g>
      ))}

      {/* BRL real area */}
      <path d={makeArea(yBRLReal, baseY)} fill="url(#brlGrad)" />
      {/* LiquidAI area */}
      <path d={makeArea(yLiquidAI, baseY)} fill="url(#liquidAIGrad)" />

      {/* BRL real line (dashed red) */}
      <path
        d={makePath(yBRLReal)}
        fill="none"
        stroke="#EF4444"
        strokeWidth="1.8"
        strokeDasharray="5,3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* LiquidAI line (solid green) */}
      <path
        d={makePath(yLiquidAI)}
        fill="none"
        stroke="#A3D977"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dots */}
      <circle
        cx={xs[xs.length - 1]}
        cy={yBRLReal[yBRLReal.length - 1]}
        r="3.5"
        fill="#EF4444"
        stroke="var(--surface-solid)"
        strokeWidth="1.5"
      />
      <circle
        cx={xs[xs.length - 1]}
        cy={yLiquidAI[yLiquidAI.length - 1]}
        r="4"
        fill="#A3D977"
        stroke="var(--surface-solid)"
        strokeWidth="2"
      />

      {/* End labels */}
      <text
        x={xs[xs.length - 1] - 28}
        y={yLiquidAI[yLiquidAI.length - 1] - 7}
        fill="#A3D977"
        fontSize="9"
        fontFamily="system-ui"
        fontWeight="700"
      >
        ${data[data.length - 1].liquidAI.toFixed(0)}
      </text>
      <text
        x={xs[xs.length - 1] - 28}
        y={yBRLReal[yBRLReal.length - 1] + 14}
        fill="#EF4444"
        fontSize="9"
        fontFamily="system-ui"
        fontWeight="700"
      >
        ${data[data.length - 1].brlReal.toFixed(0)}
      </text>

      {/* X-axis labels */}
      {xLabels.map((d, i) => (
        <text key={`xl-${i}`} x={xLabelXs[i]} y={H - 4} textAnchor="middle" fill="#A0AEC0" fontSize="9" fontFamily="system-ui">
          {d.month}
        </text>
      ))}
    </svg>
  );
}
