import { motion } from "motion/react";
import { ArrowLeft, ExternalLink, Star, Zap, Shield, Globe, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const TECH_STACK = [
  { label: "Blockchain", value: "Celo Mainnet · L2 EVM", color: "#A3D977" },
  { label: "Stablecoin", value: "USDm (Mento Protocol)", color: "#10B981" },
  { label: "DeFi Layer", value: "Aave v3 · Morpho · Mento V3", color: "#3B82F6" },
  { label: "Off-ramp", value: "Transfero · Bipa · MiniPay", color: "#F59E0B" },
  { label: "Identity", value: "Self Protocol (Anti-Sybil)", color: "#8B5CF6" },
  { label: "Frontend", value: "React + Tailwind + Motion", color: "#06B6D4" },
];

const FEATURES = [
  { icon: Zap, label: "Agente Autônomo", desc: "Rebalanceamento 24/7 sem intervenção humana", color: "#A3D977" },
  { icon: Shield, label: "Invisible DeFi", desc: "Zero DeFi complexity for the end user", color: "#3B82F6" },
  { icon: Globe, label: "Mercados Emergentes", desc: "Proteção real contra inflação do BRL/MXN/COP", color: "#10B981" },
  { icon: TrendingUp, label: "Yield-Backed Banking", desc: "Cartão + PIX financiado pelo yield gerado", color: "#F59E0B" },
];

export function ProfileSobrePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

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
          <h1 className="font-bold text-text-primary">Sobre o LiquidAI</h1>
          <p className="text-xs text-text-muted">v2.0.0 · Celo Hackathon 2026</p>
        </div>
      </header>

      {/* Hero */}
      <div className="px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 text-center"
          style={{ background: "linear-gradient(135deg, #0D4B2E, #1a6b45)", boxShadow: "0 8px 32px rgba(13,75,46,0.3)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(163,217,119,0.15)", border: "1.5px solid rgba(163,217,119,0.3)" }}
          >
            <span style={{ color: "#A3D977", fontSize: 28, fontWeight: 900, fontFamily: "monospace" }}>L</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">LiquidAI</h2>
          <p className="text-sm text-white/60 mb-3">Treasury Operating System · MiniPay</p>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(163,217,119,0.15)", border: "1px solid rgba(163,217,119,0.3)" }}
          >
            <Star className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
              Build Agents for the Real World V2 · Celo
            </span>
          </div>
        </motion.div>
      </div>

      {/* Mission */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Missão
        </p>
        <div
          className="bg-surface-solid rounded-2xl p-5"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <p className="text-sm leading-relaxed text-text-secondary">
            LiquidAI is an <span className="font-semibold text-text-primary">Autonomous Treasury OS</span> for the MiniPay user. We start with the real capital in the wallet, enabling daily microtransactions while preserving liquidity and ensuring no balance is left idle.
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            Our philosophy is <span className="font-semibold text-text-primary">Invisible DeFi</span>: a maximum of 3 taps per action, with zero DeFi complexity — the agent handles everything automatically.
          </p>
        </div>
      </div>

      {/* Core features */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Diferenciais
        </p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-surface-solid rounded-2xl p-4"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-text-primary leading-tight">{label}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Tech Stack
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {TECH_STACK.map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < TECH_STACK.length - 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <p className="text-xs text-text-muted w-24 flex-shrink-0">{label}</p>
              <p className="text-xs font-semibold text-text-primary flex-1">{value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Brief Link */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate("/brief")}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-primary">Project Brief & Handoff</p>
              <p className="text-xs text-text-muted">Complete technical documentation</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary/60" />
        </button>
      </div>

      {/* Links */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "GitHub", url: "https://github.com" },
            { label: "Celo Hackathon", url: "https://celo.org" },
            { label: "Whitepaper", url: "#" },
            { label: "Audit Report", url: "#" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "var(--surface-solid)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-text-muted pb-4">
        Made with ♥ for Celo · Build Agents V2 · March 2026
      </p>
    </div>
  );
}
