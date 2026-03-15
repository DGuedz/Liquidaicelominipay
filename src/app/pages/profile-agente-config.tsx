import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Zap, Shield, Activity, ChevronRight, RotateCcw, Clock, DollarSign,
  TrendingUp, Bell, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

type Mode = "conservative" | "balanced" | "aggressive";

const MODES = [
  {
    id: "conservative" as Mode,
    label: "Conservador",
    apy: "3.2–4.2%",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    icon: Shield,
    desc: "Foco em estabilidade. Aave v3 + Mento. Ideal para proteção cambial.",
  },
  {
    id: "balanced" as Mode,
    label: "Balanceado",
    apy: "4.2–9.1%",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    icon: Activity,
    desc: "Melhor custo-benefício. Morpho looping + Aave. APY otimizado automaticamente.",
    recommended: true,
  },
  {
    id: "aggressive" as Mode,
    label: "Arrojado",
    apy: "9–18%",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    icon: Zap,
    desc: "Morpho 3x loop + RWA pools. Maior yield, maior volatilidade gerenciada.",
  },
];

function Toggle({ enabled, onToggle, color = "#A3D977" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      className="w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 flex-shrink-0"
      style={{ background: enabled ? color : "var(--muted)", justifyContent: enabled ? "flex-end" : "flex-start" }}
    >
      <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}

export function ProfileAgenteConfigPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [mode, setMode] = useState<Mode>("balanced");
  const [autoRebalance, setAutoRebalance] = useState(true);
  const [yieldNotify, setYieldNotify] = useState(true);
  const [maxTx, setMaxTx] = useState(50);
  const [rebalanceFreq, setRebalanceFreq] = useState("daily");
  const [saved, setSaved] = useState(false);

  const currentMode = MODES.find((m) => m.id === mode)!;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-dvh bg-background pb-16">
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 className="font-bold text-text-primary">Configurar Agente</h1>
          <p className="text-xs text-text-muted">Perfil ativo: <span style={{ color: currentMode.color }}>{currentMode.label}</span></p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#A3D977" }} />
          <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>Ativo</span>
        </div>
      </header>

      {/* Current stats */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #0D4B2E, #1a6b45)", boxShadow: "0 4px 20px rgba(13,75,46,0.25)" }}
        >
          <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Performance Atual</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "APY Real", value: "4.8%", color: "#A3D977" },
              { label: "Yield/mês", value: "$8.15", color: "#10B981" },
              { label: "Ações", value: "47", color: "#F59E0B" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk mode selector */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Perfil de Risco
        </p>
        <div className="space-y-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(m.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                style={{
                  background: active ? m.bg : "var(--surface-solid)",
                  border: active ? `1.5px solid ${m.color}50` : "1.5px solid var(--border-light)",
                  boxShadow: active ? `0 4px 16px ${m.color}18` : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: active ? m.bg : "var(--muted)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: active ? m.color : "var(--text-muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: active ? m.color : "var(--text-primary)" }}>
                      {m.label}
                    </p>
                    {(m as any).recommended && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977", fontSize: "9px" }}>
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-mono font-bold text-sm" style={{ color: active ? m.color : "var(--text-muted)" }}>
                    {m.apy}
                  </p>
                  <p className="text-xs text-text-muted">APY</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Automation rules */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Regras de Automação
        </p>
        <div className="bg-surface-solid rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(163,217,119,0.1)" }}>
              <RotateCcw className="w-4 h-4" style={{ color: "#A3D977" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Rebalanceamento automático</p>
              <p className="text-xs text-text-muted mt-0.5">Agente realoca quando APY cair &gt;0.5%</p>
            </div>
            <Toggle enabled={autoRebalance} onToggle={() => setAutoRebalance((v) => !v)} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Bell className="w-4 h-4" style={{ color: "#F59E0B" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Notificar antes de agir</p>
              <p className="text-xs text-text-muted mt-0.5">Confirmar acima de ${maxTx}</p>
            </div>
            <Toggle enabled={yieldNotify} onToggle={() => setYieldNotify((v) => !v)} color="#F59E0B" />
          </div>
          {/* Max tx slider */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm font-medium text-text-primary">Limite por transação</p>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: "#A3D977" }}>${maxTx}</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={maxTx}
              onChange={(e) => setMaxTx(Number(e.target.value))}
              className="w-full accent-green-600 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>$5</span>
              <span>$200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rebalance frequency */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Frequência de Rebalanceamento
        </p>
        <div className="bg-surface-solid rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          {[
            { id: "realtime", label: "Tempo real", sub: "Agente age assim que oportunidade surge", icon: Zap },
            { id: "daily", label: "Diário (03:00)", sub: "Rebalance noturno silencioso", icon: Clock },
            { id: "weekly", label: "Semanal", sub: "Todo domingo às 00:00", icon: TrendingUp },
          ].map(({ id, label, sub, icon: Icon }, i) => (
            <button
              key={id}
              onClick={() => setRebalanceFreq(id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: rebalanceFreq === id ? "rgba(163,217,119,0.1)" : "var(--muted)" }}
              >
                <Icon className="w-4 h-4" style={{ color: rebalanceFreq === id ? "#A3D977" : "var(--text-muted)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{sub}</p>
              </div>
              {rebalanceFreq === id && (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A3D977" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{
            background: saved ? "rgba(163,217,119,0.15)" : "#0D4B2E",
            color: saved ? "#A3D977" : "#fff",
            border: saved ? "1px solid rgba(163,217,119,0.3)" : "none",
            boxShadow: saved ? "none" : "0 4px 20px rgba(13,75,46,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
          {saved ? "Configurações Salvas!" : "Salvar Configurações"}
        </motion.button>
      </div>
    </div>
  );
}
