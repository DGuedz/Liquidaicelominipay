import { useState } from "react";
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
import { BottomNavigation } from "../components/bottom-navigation";

const cashflowData = [
  { month: "Set", income: 145, spending: 82 },
  { month: "Out", income: 168, spending: 91 },
  { month: "Nov", income: 152, spending: 78 },
  { month: "Dez", income: 195, spending: 104 },
  { month: "Jan", income: 178, spending: 87 },
  { month: "Fev", income: 210, spending: 98 },
  { month: "Mar", income: 185, spending: 62 },
];

const yieldData = [
  { month: "Set", yield: 2.1 },
  { month: "Out", yield: 3.4 },
  { month: "Nov", yield: 4.2 },
  { month: "Dez", yield: 5.8 },
  { month: "Jan", yield: 6.9 },
  { month: "Fev", yield: 7.5 },
  { month: "Mar", yield: 8.15 },
];

const allocationData = [
  { name: "Capital Produtivo", value: 820, color: "#0D4B2E", pct: "66%" },
  { name: "Liquidez", value: 350, color: "#A3D977", pct: "28%" },
  { name: "Reserva", value: 70.5, color: "#E5E7EB", pct: "6%" },
];

const keyMetrics = [
  {
    icon: Percent,
    label: "APY Atual",
    value: "4.8%",
    sub: "+0.2% esta semana",
    color: "#0D4B2E",
    bg: "#E8F5E9",
  },
  {
    icon: DollarSign,
    label: "Yield Total",
    value: "$8.15",
    sub: "Este mês",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    icon: Zap,
    label: "Otimizações",
    value: "47",
    sub: "Pelo agente IA",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: TrendingUp,
    label: "Retorno Total",
    value: "+12.1%",
    sub: "Últimos 6 meses",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
  },
];

const tabs = ["Fluxo de Caixa", "Alocação", "Yield", "Proteção"];

// ─── Inflation Shield data (12 months) ────────────────────────────────────────
// BRL Savings: 7% SELIC nominal − 6.5% IPCA = ~0.5% real → purchasing power barely moves
// cUSD + LiquidAI: 4.8% APY, dollar-pegged = no inflation risk
const inflationData = (() => {
  const months = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev"];
  const startBRL = 1200; // R$ nominal start
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
})();

// ─── Agent protection log ─────────────────────────────────────────────────────
const AGENT_PROTECTION_LOGS = [
  {
    id: 1,
    time: "Hoje 06:14",
    event: "Real caiu -2.3% na semana",
    action: "Protegeu $47.50 convertendo para cUSD",
    type: "protect",
    icon: Shield,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    impact: "+$1.09 preservado",
  },
  {
    id: 2,
    time: "Hoje 02:00",
    event: "Oportunidade 5.9% APY detectada no Moola",
    action: "Realocou $172 de Mento → Moola automaticamente",
    type: "optimize",
    icon: Zap,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    impact: "+$0.45/mês adicional",
  },
  {
    id: 3,
    time: "Ontem 23:48",
    event: "IPCA de Fev acima do esperado (0.83%)",
    action: "Aumentou alocação em stablecoins +$80",
    type: "protect",
    icon: AlertTriangle,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    impact: "Risco inflação reduzido 18%",
  },
  {
    id: 4,
    time: "13 Mar 09:00",
    event: "Yield noturno capturado: $0.72",
    action: "Cobriu 2 saques PIX gratuitos automaticamente",
    type: "yield",
    icon: DollarSign,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    impact: "R$1.44 em tarifas zeradas",
  },
  {
    id: 5,
    time: "12 Mar 00:00",
    event: "Rebalance periódico executado",
    action: "Saiu do pool com maior impermanent loss",
    type: "risk",
    icon: CheckCircle2,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    impact: "-$2.10 de IL evitada",
  },
];

// ─── Vault 3-reserve architecture ────────────────────────────────────────────
const VAULT_RESERVES = [
  {
    id: "buffer",
    label: "Liquidity Buffer",
    desc: "Pagamentos instantâneos · cartão · PIX",
    pct: 12.5,
    amount: 150,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    VaultIcon: JITIcon,
    yield: "0% (disponível imediato)",
  },
  {
    id: "vault",
    label: "Yield Vault",
    desc: "AMMs + Lending · trabalhando 24/7",
    pct: 75,
    amount: 900,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    VaultIcon: YieldIcon,
    yield: "4.8% APY médio",
  },
  {
    id: "credit",
    label: "Credit Engine",
    desc: "Crédito colateralizado (Q4) · 70% do vault",
    pct: 12.5,
    amount: 150,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    VaultIcon: BankIcon,
    yield: "Limite: $840 disponível",
  },
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-dvh bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <h1 className="font-bold text-text-primary mb-1" style={{ fontSize: "1.5rem" }}>
          Analytics
        </h1>
        <p className="text-sm text-text-muted">
          Inteligência financeira em tempo real
        </p>
      </header>

      {/* Key Metrics Grid */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {keyMetrics.map((m, i) => {
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
                  Entradas vs Saídas
                </span>
                <span className="text-xs text-text-muted">6 meses</span>
              </div>
              <div className="h-44">
                <DualLineChart data={cashflowData} />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-success" />
                  <span className="text-xs text-text-muted">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-warning" />
                  <span className="text-xs text-text-muted">Saídas</span>
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
                  Alocação de Capital
                </span>
                <span className="text-xs text-text-muted">Atual</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={70}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {allocationData.map((entry) => (
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
                  {allocationData.map((item) => (
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
                    LiquidAI otimizou 66%
                  </span>{" "}
                  do seu capital em posições produtivas automaticamente
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
                  Yield Gerado pelo Agente
                </span>
                <span className="text-xs text-text-muted">Mensal ($)</span>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yieldData}
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
                    +73% de crescimento
                  </span>{" "}
                  no yield gerado nos últimos 6 meses via automação do agente IA
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Proteção (Inflation Shield) ─ */}
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
                      Poupança BRL vs cUSD + LiquidAI · 12 meses
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977" }}
                  >
                    +$57 protegido
                  </span>
                </div>

                <div className="h-48 mt-3">
                  <InflationShieldChart data={inflationData} />
                </div>

                <div className="flex items-center gap-5 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ background: "#EF4444" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      BRL real (poder de compra)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ background: "#A3D977" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      cUSD + LiquidAI
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
                      Em 12 meses, seu <span style={{ color: "#EF4444", fontWeight: 600 }}>saldo BRL perdeu ~4.7%</span> de poder de compra (IPCA 6.5% − SELIC 7%). O{" "}
                      <span style={{ color: "#A3D977", fontWeight: 600 }}>cUSD + LiquidAI ganhou +4.8%</span> — diferença real de{" "}
                      <span style={{ color: "#A3D977", fontWeight: 600 }}>+$57 em $1.200</span>.
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
                      Yield via estratégias institucionais de staking e empréstimo (Morpho · Celo Mondo · Mar/2026)
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
                    Arquitetura de 3 Reservas
                  </span>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977" }}
                  >
                    $1.200 total
                  </span>
                </div>

                {/* Visual allocation bar */}
                <div className="px-4 py-3">
                  <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
                    {VAULT_RESERVES.map((r) => (
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

                {VAULT_RESERVES.map((r, i) => (
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
                    Log de Proteção do Agente
                  </span>
                  <span
                    className="ml-auto w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#A3D977" }}
                  />
                </div>

                {AGENT_PROTECTION_LOGS.map((log, i) => {
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
                  Seu dinheiro permanece <span style={{ color: "#A3D977" }}>100% seu</span>, trabalhando automaticamente em DeFi — sem banco intermediário.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Mantém em $", value: "cUSD" },
                    { label: "Yield gerado", value: "4.8%" },
                    { label: "Banco necessário", value: "Zero" },
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
        </AnimatePresence>
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
              Insight do Agente IA
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              Detectei $350 em liquidez ociosa. Posso realocar para maximizar
              seu APY de 4.8% → 5.9% automaticamente. Estimativa: +$0.43/mês.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#A3D977", color: "#0D4B2E" }}
              >
                Autorizar
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
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