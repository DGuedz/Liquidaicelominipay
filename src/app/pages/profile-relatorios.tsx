import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Download, TrendingUp, DollarSign, RotateCcw, Shield,
  ChevronRight, FileText, Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const REPORTS = [
  {
    id: 1,
    title: "Relatório de Março 2026",
    period: "01/03 – 15/03/2026",
    status: "new",
    yield: "+$4.20",
    txCount: 23,
    apyAvg: "4.8%",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
  },
  {
    id: 2,
    title: "Relatório de Fevereiro 2026",
    period: "01/02 – 28/02/2026",
    status: "ready",
    yield: "+$7.50",
    txCount: 41,
    apyAvg: "4.6%",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    id: 3,
    title: "Relatório de Janeiro 2026",
    period: "01/01 – 31/01/2026",
    status: "ready",
    yield: "+$6.90",
    txCount: 38,
    apyAvg: "4.2%",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
  },
  {
    id: 4,
    title: "Q4 2025 — Resumo Anual",
    period: "Out – Dez 2025",
    status: "ready",
    yield: "+$18.40",
    txCount: 112,
    apyAvg: "3.9%",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
  },
];

export function ProfileRelatoriosPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = (id: number) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1800);
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 className="font-bold text-text-primary">Relatórios</h1>
          <p className="text-xs text-text-muted">Histórico completo do agente</p>
        </div>
      </header>

      {/* YTD summary */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #0D4B2E, #1a6b45)", boxShadow: "0 4px 20px rgba(13,75,46,0.25)" }}
        >
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">YTD · Jan–Mar 2026</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40">Total Yield</p>
              <p className="text-2xl font-mono font-bold text-white">$18.60</p>
              <p className="text-xs mt-1" style={{ color: "#A3D977" }}>+73% vs Q4 2025</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Transações</p>
              <p className="text-2xl font-mono font-bold text-white">102</p>
              <p className="text-xs mt-1" style={{ color: "#A3D977" }}>47 pelo agente</p>
            </div>
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex gap-4">
              {[
                { label: "APY Médio", value: "4.8%", icon: TrendingUp },
                { label: "Proteção Cambial", value: "3x", icon: Shield },
                { label: "Rebalances", value: "47", icon: RotateCcw },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex-1 text-center">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-white/40" />
                  <p className="text-xs font-mono font-bold text-white">{value}</p>
                  <p className="text-xs text-white/40 mt-0.5" style={{ fontSize: "9px" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report list */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Relatórios Mensais
        </p>
        <div className="space-y-3">
          {REPORTS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4"
              style={{
                background: "var(--surface-solid)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: r.status === "new" ? "1px solid rgba(163,217,119,0.25)" : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.bg }}>
                  <FileText className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{r.title}</p>
                    {r.status === "new" && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977", fontSize: "9px" }}>
                        Novo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-text-muted" />
                    <p className="text-xs text-text-muted">{r.period}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Yield", value: r.yield, color: "#A3D977" },
                  { label: "APY Médio", value: r.apyAvg, color: "var(--text-primary)" },
                  { label: "Transações", value: r.txCount.toString(), color: "var(--text-primary)" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <p className="font-mono font-bold text-sm" style={{ color }}>{value}</p>
                    <p className="text-xs text-text-muted mt-0.5" style={{ fontSize: "10px" }}>{label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleDownload(r.id)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: downloading === r.id ? "rgba(163,217,119,0.12)" : "var(--muted)",
                  color: downloading === r.id ? "#A3D977" : "var(--text-secondary)",
                  border: downloading === r.id ? "1px solid rgba(163,217,119,0.25)" : "none",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                {downloading === r.id ? "Baixando PDF..." : "Baixar PDF"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Auto-report setting */}
      <div className="px-5">
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(163,217,119,0.06)", border: "1px solid rgba(163,217,119,0.15)" }}
        >
          <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: "#A3D977" }} />
          <p className="text-xs text-text-secondary flex-1 leading-relaxed">
            Relatórios gerados automaticamente todo dia 1º. Próximo: <span style={{ color: "#A3D977", fontWeight: 600 }}>01/04/2026</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
