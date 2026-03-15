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
import { BottomNavigation } from "../components/bottom-navigation";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskMode = "conservative" | "balanced" | "aggressive";

// ─── Rich Risk Mode Config ────────────────────────────────────────────────────
const RISK_CONFIG = {
  conservative: {
    id: "conservative" as RiskMode,
    label: "Conservador",
    subtitle: "Escudo de Inflação",
    apy: "3.2–4.2%",
    apyTarget: 3.8,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    icon: Shield,
    ModeIcon: ShieldSvg,
    narrative:
      "Preservação total de capital. O agente prioriza liquidez imediata e stablecoins, derrotando a inflação sem volatilidade.",
    agentBehavior:
      "Monitora IPCA em tempo real. Se inflação sobe, migra 100% do saldo para cUSD. Buffer de $150 sempre protegido.",
    sampleLog: "IPCA subiu +0.6% → 100% do saldo alocado em dólar estável.",
    pools: [
      { name: "Aave v3 (cUSD)", type: "Lending · baixo risco", apy: "4.8%", pct: 55, amount: 660, color: "#06B6D4" },
      { name: "Mento cUSD/USDC", type: "AMM estável · IL mínimo", apy: "3.8%", pct: 30, amount: 360, color: "#10B981" },
      { name: "Liquidity Buffer", type: "Cartão + PIX imediato", apy: "0%", pct: 15, amount: 180, color: "#A3D977" },
    ],
    riskMetrics: { il: 8, ilLabel: "Muito Baixo", poolDepth: 95, withdrawalTime: 98, ilPositive: true },
    creditEngine: false,
    tags: ["100% Stablecoins", "Anti-Inflação", "Zero IL"],
  },
  balanced: {
    id: "balanced" as RiskMode,
    label: "Balanceado",
    subtitle: "Acelerador de Patrimônio",
    apy: "5.8–9%",
    apyTarget: 7.2,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    icon: Activity,
    ModeIcon: LightningIcon,
    narrative:
      "Supera a SELIC com folga via Morpho looping de stCELO. APY orgânico de 1.85% turbinado para 8%+ pelo agente — sem que o usuário entenda de colateralização.",
    agentBehavior:
      "Executa looping: stCELO → Morpho (colateral) → mais CELO emprestado → re-stake. Monitora rácio de liquidação. Se volatilidade do CELO >15%, rebalanceia 20% para stables.",
    sampleLog: "Morpho looping ativado: stCELO como colateral → +3% yield extra sem vender posição.",
    pools: [
      { name: "Aave v3 (cUSD)", type: "Lending · base estável", apy: "4.8%", pct: 30, amount: 360, color: "#06B6D4" },
      { name: "Morpho + stCELO Loop", type: "🆕 Looping institucional · Mar 2026", apy: "9.1%", pct: 32, amount: 384, color: "#10B981" },
      { name: "Ubeswap cUSD/CELO", type: "AMM · yield adicional", apy: "8.2%", pct: 22, amount: 264, color: "#F59E0B" },
      { name: "Liquidity Buffer", type: "Cartão + PIX", apy: "0%", pct: 16, amount: 192, color: "#A3D977" },
    ],
    riskMetrics: { il: 42, ilLabel: "Moderado", poolDepth: 85, withdrawalTime: 92, ilPositive: true },
    creditEngine: false,
    tags: ["Morpho Looping", "stCELO Colateral", "7.2% APY alvo"],
  },
  aggressive: {
    id: "aggressive" as RiskMode,
    label: "Arrojado",
    subtitle: "Modo Degenerado Utilitário",
    apy: "8–20%+",
    apyTarget: 14,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    icon: Zap,
    ModeIcon: FlameIcon,
    narrative:
      "Maximiza yield via Morpho looping agressivo + pares exóticos. Cada R$1 em yield paga tarifas de cartão, PIX e gera renda extra — gerenciado pelo Risk Engine em tempo real.",
    agentBehavior:
      "Morpho looping máximo + Credit Engine como ponte. Risk Engine em alerta: saída em 2–5s via Mento V3 se IL > threshold. Off-ramp via Daimo se precisar de liquidez de outra chain.",
    sampleLog: "Arbitragem CELO/ETH +$0.85 noturno + Morpho loop +$1.20 = 4 PIX gratuitos amanhã.",
    pools: [
      { name: "Morpho + stCELO Loop (Agressivo)", type: "🆕 Looping máximo · 3x leverage", apy: "15%", pct: 30, amount: 360, color: "#10B981" },
      { name: "CELO/ETH (Ubeswap)", type: "Par volátil · arbitragem", apy: "18%", pct: 25, amount: 300, color: "#EF4444" },
      { name: "PWN / EthicHub (RWA)", type: "Crédito real · yield estável", apy: "11.4%", pct: 22, amount: 264, color: "#8B5CF6" },
      { name: "Credit Engine (Bridge)", type: "Ponte · não toca pools lucrativos", apy: "–", pct: 13, amount: 156, color: "#06B6D4" },
      { name: "Buffer Emergência", type: "Saída rápida Mento V3 · 2–5s", apy: "0%", pct: 10, amount: 120, color: "#A3D977" },
    ],
    riskMetrics: { il: 78, ilLabel: "Elevado", poolDepth: 65, withdrawalTime: 72, ilPositive: false },
    creditEngine: true,
    tags: ["Morpho Looping 3x", "Mento V3 Exit", "Risk Engine ativo"],
  },
} as const;

// ─── Dynamic log per mode ─────────────────────────────────────────────────────
const MODE_LOGS: Record<RiskMode, typeof INITIAL_LOGS> = {
  conservative: [
    { time: "Agora", action: "IPCA mensal +0.6% detectado → mantendo 100% em stablecoins", type: "protect", icon: Shield, color: "#3B82F6" },
    { time: "08:00", action: "Yield capturado: +$0.45 · Aave v3 (4.8% APY)", type: "yield", icon: Sparkles, color: "#10B981" },
    { time: "06:14", action: "Real caiu -2.3% · proteção cambial aplicada automaticamente", type: "protect", icon: Shield, color: "#3B82F6" },
    { time: "03:00", action: "Buffer $180 intacto · liquidez para cartão garantida", type: "reserve", icon: Lock, color: "#A3D977" },
    { time: "Ontem 22:00", action: "Rebalance: Mento cUSD/USDC otimizado sem IL", type: "rebalance", icon: RotateCcw, color: "#0D4B2E" },
    { time: "Ontem 12:00", action: "Saldo protegido contra inflação · +$0.38 em yield real", type: "yield", icon: DollarSign, color: "#10B981" },
  ],
  balanced: [
    { time: "Agora", action: "🆕 Morpho looping ativado: stCELO → colateral → +3% yield extra", type: "optimize", icon: Sparkles, color: "#10B981" },
    { time: "14:30", action: "Capturou +$1.20 em spread cUSD/CELO · pool saudável", type: "yield", icon: DollarSign, color: "#A3D977" },
    { time: "08:00", action: "Morpho posição: rácio de liquidação 68% · seguro", type: "detect", icon: Activity, color: "#10B981" },
    { time: "03:00", action: "Rebalance: volatilidade CELO +8% · mantendo posição", type: "rebalance", icon: RotateCcw, color: "#0D4B2E" },
    { time: "Ontem 22:00", action: "Daimo bridge: +$200 entrada via Base network recebidos", type: "detect", icon: Activity, color: "#A3D977" },
    { time: "Ontem 18:45", action: "Mento V3: spread cUSD→cBRL 40% menor · rota atualizada", type: "optimize", icon: RotateCcw, color: "#F59E0B" },
  ],
  aggressive: [
    { time: "Agora", action: "🔥 Morpho 3x loop: stCELO → Morpho → CELO → re-stake · +$1.20", type: "yield", icon: Zap, color: "#10B981" },
    { time: "04:00", action: "Arbitragem CELO/ETH: +$0.85 capturado via Ubeswap", type: "yield", icon: DollarSign, color: "#F59E0B" },
    { time: "03:00", action: "Credit Bridge: PIX $10 pago via buffer · pool Morpho intacta", type: "optimize", icon: Layers, color: "#06B6D4" },
    { time: "Ontem 23:48", action: "Risk Engine: IL CELO/ETH 4.2% · abaixo do threshold 5%", type: "protect", icon: AlertTriangle, color: "#EF4444" },
    { time: "Ontem 22:00", action: "Mento V3 exit route testada: saída em 2.3s · aprovado", type: "detect", icon: Activity, color: "#A3D977" },
    { time: "Ontem 18:00", action: "Off-ramp global: $50 enviados para conta SEPA Argentina", type: "optimize", icon: RotateCcw, color: "#8B5CF6" },
  ],
};

// ─── Shared initial logs (fallback) ──────────────────────────────────────────
const INITIAL_LOGS = [
  { time: "14:30", action: "Rebalanceou $350 → Aave v3 (4.8% APY)", type: "optimize", icon: RotateCcw, color: "#A3D977" },
  { time: "08:00", action: "Capturou +$0.45 em yield noturno", type: "yield", icon: Sparkles, color: "#10B981" },
  { time: "03:00", action: "Rebalance automático concluído", type: "rebalance", icon: RotateCcw, color: "#0D4B2E" },
  { time: "Ontem 22:00", action: "Detectou oportunidade 5.2% em Moola", type: "detect", icon: Activity, color: "#06B6D4" },
  { time: "Ontem 18:45", action: "Manteve $390 em liquidez para PIX", type: "reserve", icon: Lock, color: "#8B5CF6" },
  { time: "Ontem 12:00", action: "Proteção cambial aplicada automaticamente", type: "protect", icon: Shield, color: "#3B82F6" },
];

// ─── Pending authorizations (dynamic per mode) ────────────────────────────────
const MODE_AUTHS: Record<RiskMode, { id: number; action: string; gain: string; risk: string; riskColor: string }[]> = {
  conservative: [{ id: 1, action: "Realocar $60 → Mento cUSD/USDC (3.8% APY)", gain: "+$0.08/dia", risk: "Mínimo", riskColor: "#10B981" }],
  balanced: [{ id: 2, action: "Realocar $180 → Moola (5.9% APY)", gain: "+$0.18/dia", risk: "Baixo", riskColor: "#10B981" }],
  aggressive: [
    { id: 3, action: "Abrir posição CELO/ETH +$120 (18% APY)", gain: "+$0.59/dia", risk: "Elevado", riskColor: "#EF4444" },
    { id: 4, action: "Ativar Credit Bridge para próximo PIX", gain: "Pool intacta", risk: "Nenhum", riskColor: "#A3D977" },
  ],
};

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
function PoolCompositionTable({ mode }: { mode: RiskMode }) {
  const cfg = RISK_CONFIG[mode];
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {cfg.pools.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="px-4 py-3.5"
          style={{ borderBottom: i < cfg.pools.length - 1 ? "1px solid var(--border-light)" : "none" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${p.color}18` }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            </div>
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
        <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Total Gerenciado</span>
        <span className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>$1,200.00</span>
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
      badge: m.ilPositive ? "Lucro Real ✓" : null,
    },
    {
      label: "Profundidade do Pool",
      pct: m.poolDepth,
      value: m.poolDepth >= 85 ? "$4.2M+" : m.poolDepth >= 65 ? "$1.8M" : "$0.9M",
      color: m.poolDepth >= 85 ? "#A3D977" : m.poolDepth >= 65 ? "#F59E0B" : "#EF4444",
      status: m.poolDepth >= 85 ? "Saudável" : m.poolDepth >= 65 ? "Adequada" : "Monitorando",
      badge: null,
    },
    {
      label: "Tempo de Saída",
      pct: m.withdrawalTime,
      value: m.withdrawalTime >= 90 ? "2–3s" : m.withdrawalTime >= 70 ? "3–5s" : "5–8s",
      color: m.withdrawalTime >= 90 ? "#06B6D4" : m.withdrawalTime >= 70 ? "#F59E0B" : "#EF4444",
      status: m.withdrawalTime >= 90 ? "Ultrarrápido" : "Rápido",
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
            ⚠️ Alerta Máximo
          </span>
        )}
        {!isAggressive && (
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${cfg.color}15`, color: cfg.color }}
          >
            Monitorando
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
            <span style={{ color: "#06B6D4", fontWeight: 600 }}>Rota garantida:</span>{" "}
            {mode === "aggressive"
              ? "Buffer $96 + Credit Bridge $144 cobrem qualquer pagamento sem tocar nos pools de alto yield."
              : "Liquidação sempre via cUSD → USDC (Mento). Tokens voláteis nunca usados como ponte."}
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
    { label: "PIX de $10 solicitado", color: "#A3D977", icon: "💳" },
    { label: "Agent acessa Credit Bridge", color: "#06B6D4", icon: "🤖" },
    { label: "PIX pago via $150 bridge", color: "#F59E0B", icon: "⚡" },
    { label: "Pool CELO/ETH intacta", color: "#10B981", icon: "🌿" },
    { label: "Yield paga dívida amanhã", color: "#8B5CF6", icon: "♾️" },
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
          Modo Arrojado
        </span>
      </div>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
        Em vez de desfazer um pool lucrativo para pagar um PIX de $10, o agente usa os{" "}
        <span className="text-white font-semibold">$150 do Credit Engine como ponte temporária</span>{" "}
        — pagando a dívida com o rendimento acumulado no dia seguinte.
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
            Executando bridge...
          </>
        ) : (
          <><Layers className="w-3.5 h-3.5" /> Simular Credit Bridge</>
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
        <span style={{ color, fontWeight: 600 }}>JIT Warmup ativo:</span>{" "}
        Ao abrir o cartão, o agente pré-aquece liquidação via{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{pool}</span> → sem atraso no pagamento.
      </p>
      <Brain className="w-4 h-4 flex-shrink-0" style={{ color }} />
    </motion.div>
  );
}

// ─── Agent Page ───────────────────────────────────────────────────────────────
export function AgentPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [riskMode, setRiskMode] = useState<RiskMode>("balanced");
  const [isRunning, setIsRunning] = useState(true);
  const [yieldToday, setYieldToday] = useState(0.72);
  const [opsCount, setOpsCount] = useState(47);
  const [authorized, setAuthorized] = useState<number[]>([]);
  const [dismissedAuths, setDismissedAuths] = useState<number[]>([]);
  const [liveLog, setLiveLog] = useState(MODE_LOGS.balanced);
  const [newLogFlash, setNewLogFlash] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);

  const cfg = RISK_CONFIG[riskMode];

  // Switch log + reset on mode change
  useEffect(() => {
    setLiveLog(MODE_LOGS[riskMode]);
    setProfileExpanded(false);
    setAuthorized([]);
    setDismissedAuths([]);
  }, [riskMode]);

  // Simulate live yield ticking
  useEffect(() => {
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
  }, [isRunning, riskMode]);

  const pendingAuths = MODE_AUTHS[riskMode].filter(
    (a) => !authorized.includes(a.id) && !dismissedAuths.includes(a.id)
  );

  const handleAuthorize = (id: number) => {
    setAuthorized((prev) => [...prev, id]);
    setOpsCount((c) => c + 1);
  };

  // APY shown in header varies by mode
  const apyDisplay = cfg.apyTarget.toFixed(1) + "%";

  return (
    <div className="min-h-dvh bg-background pb-28 overflow-x-hidden">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
            Agente IA
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
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>Chat IA</span>
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
              {isRunning ? "Online" : "Pausado"}
            </span>
          </div>
        </div>
      </header>

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
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>v2.0 · Celo Mainnet · Uptime 99.8%</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${cfg.color}25`, color: cfg.color }}>
                    {(() => { const MI = (cfg as any).ModeIcon; return <MI className="w-3 h-3" style={{ color: cfg.color }} />; })()}
                    <span>{cfg.label}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                    {cfg.apy} APY
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
                { label: "Yield hoje", value: `+$${yieldToday.toFixed(2)}`, color: "#A3D977" },
                { label: "Capital gerido", value: "$1.200", color: "#ffffff" },
                { label: "Operações", value: opsCount.toString(), color: "#ffffff" },
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
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Yield acumulado (6 meses)</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#A3D977" }}>+$8.15</span>
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
          Perfil de Risco
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
                        <p className="text-xs font-semibold mb-1" style={{ color: cfg.color }}>Comportamento do Agente</p>
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
              Aguardando Autorização
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
                          Risco {auth.risk}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAuthorize(auth.id)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "#0D4B2E", color: "#A3D977" }}
                    >
                      ✓ Autorizar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDismissedAuths((prev) => [...prev, auth.id])}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "var(--muted)", color: "var(--text-muted)" }}
                    >
                      Ignorar
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
            Composição das Pools
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
            <PoolCompositionTable mode={riskMode} />
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

      {/* ── CREDIT ENGINE BRIDGE (aggressive only) ─────────── */}
      <AnimatePresence>
        {riskMode === "aggressive" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 mb-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
              Credit Engine Bridge
            </p>
            <CreditEngineBridge />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVITY LOG ───────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Log de Atividade
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
                ● Nova ação
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
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{log.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── INSIGHTS CARD ──────────────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.div
          key={`insight-${riskMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)", boxShadow: "0 4px 24px rgba(13,75,46,0.25)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">
              {riskMode === "conservative" && "Proteção Máxima Ativa"}
              {riskMode === "balanced" && "Próxima Oportunidade"}
              {riskMode === "aggressive" && "Arbitragem Detectada"}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              {riskMode === "conservative" &&
                <>IPCA acumulado YTD: 6.5%. Seu saldo em cUSD cresceu <span className="font-semibold text-white">+4.8%</span> — você está <span style={{ color: "#A3D977" }} className="font-semibold">+11.3% acima da inflação</span>.</>}
              {riskMode === "balanced" &&
                <>Detectei <span className="font-semibold text-white">$90 ociosos</span> na reserva. Realocando para Moola (5.9% APY) geraria <span style={{ color: "#A3D977" }} className="font-semibold">+$0.43/mês</span> com risco baixo.</>}
              {riskMode === "aggressive" &&
                <>Par CELO/ETH com spread de 0.8% detectado. Arbitragem estimada: <span style={{ color: "#A3D977" }} className="font-semibold">+$0.85 noturno</span> = 3 transferências PIX gratuitas.</>}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAuthorize(99)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#A3D977", color: "#0D4B2E" }}
              >
                Autorizar
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
              >
                Detalhes
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── PERFORMANCE STATS ──────────────────────────────── */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
          Performance Acumulada
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: DollarSign, label: "Yield este mês", value: "$8.15", sub: "+73% vs mês anterior", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
            { icon: TrendingUp, label: "APY atual", value: apyDisplay, sub: cfg.subtitle, color: cfg.color, bg: cfg.bg },
            { icon: Clock, label: "Tempo ativo", value: "127d", sub: "Uptime 99.8%", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
            { icon: Activity, label: "Operações", value: opsCount.toString(), sub: "Automáticas pelo agente", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
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
            { icon: Shield, label: "Configurações de Segurança", sub: "Limites e permissões do agente", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
            { icon: Globe, label: "Protocolos Permitidos", sub: "Aave, Mento, Moola, Ubeswap, PWN", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
            { icon: Sparkles, label: "Estratégia de Yield", sub: `${cfg.subtitle} · Modo automático ativo`, color: cfg.color, bg: cfg.bg },
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

      <BottomNavigation />
    </div>
  );
}
