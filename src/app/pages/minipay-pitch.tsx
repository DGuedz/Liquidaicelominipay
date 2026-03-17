import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Bot,
  ShieldCheck,
  Zap,
  Globe,
  Fingerprint,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { LiquidLogo } from "../components/LiquidLogo";

// ─── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "MiniPay", label: "Ready", icon: Users },
  { value: "Wallet-first", label: "Live balance", icon: TrendingUp },
  { value: "Stable fees", label: "Fee abstraction", icon: Zap },
];

const PILLARS = [
  {
    icon: Bot,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    title: "Hold & Earn",
    description:
      "Earn daily rewards on your balance—just for keeping it cozy. The LiquidAI Agent automatically allocates to safe Celo protocols. No strings, no locks.",
    badge: "Auto-Savings",
    badgeColor: "#A3D977",
  },
  {
    icon: Zap,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    title: "Cash to Crypto & Back",
    description:
      "Payments, top-ups, P2P — everything works as before. The agent keeps a liquid buffer ready while the rest earns yield. Send funds globally in 5 seconds.",
    badge: "Liquid Buffer",
    badgeColor: "#10B981",
  },
  {
    icon: Globe,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    title: "No Fees, Just Stables",
    description:
      "No complex crypto jargon or confusing fees. If you can use MiniPay, you can use LiquidAI. Enjoy effortless onboarding and seamless fund transfers.",
    badge: "Invisible DeFi",
    badgeColor: "#06B6D4",
  },
  {
    icon: Fingerprint,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    title: "Full Control, Complete Security",
    description:
      "You hold the keys, and you make the moves. Self Protocol integration ensures verified usage, backed up and easily restorable.",
    badge: "Anti-Sybil",
    badgeColor: "#8B5CF6",
  },
];

const COMPARISON = [
  { feature: "Inflation protection", minipay: false, liquidai: true },
  { feature: "Auto-yield 4.8%", minipay: false, liquidai: true },
  { feature: "Instant liquidity (PIX)", minipay: true, liquidai: true },
  { feature: "24/7 AI Agent", minipay: false, liquidai: true },
  { feature: "Anti-Sybil Verification", minipay: false, liquidai: true },
  { feature: "Familiar interface", minipay: true, liquidai: true },
];

// ─── Section header ───────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#A3D977" }} />
      <span className="text-xs font-mono font-semibold uppercase tracking-widest" style={{ color: "#A3D977" }}>
        {text}
      </span>
    </div>
  );
}

// ─── Pillar Card ──────────────────────────────────────────────────────────────
function PillarCard({
  icon: Icon,
  color,
  bg,
  title,
  description,
  badge,
  badgeColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
      className="rounded-2xl p-5"
      style={{
        background: "var(--surface-solid)",
        border: `1px solid ${color}20`,
        boxShadow: `0 4px 20px ${color}08`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
              {title}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${badgeColor}15`, color: badgeColor }}
            >
              {badge}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MiniPayPitchPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-dvh bg-background flex flex-col pb-24 overflow-x-hidden relative">

      {/* ── STICKY BOTTOM CTA ──────────────────────────────── */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-5 flex justify-center pointer-events-none">
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
          onClick={() => navigate("/onboarding")}
          className="pointer-events-auto w-full max-w-md h-14 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-lg flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Earning Now <ArrowRight size={20} />
        </motion.button>
      </div>

      {/* ── STICKY HEADER ───────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 px-5 py-3.5 flex items-center justify-between"
        style={{
          background: isDark ? "rgba(6,13,8,0.92)" : "rgba(245,245,240,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LiquidLogo size={140} variant="horizontal" theme="auto" />
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(163,217,119,0.12)",
              border: "1px solid rgba(163,217,119,0.3)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#A3D977" }} />
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
              MiniPay Edition
            </span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto">
        {/* ── HERO ────────────────────────────────────────────── */}
        <div className="relative px-5 pt-10 pb-8 overflow-hidden md:grid md:grid-cols-2 md:gap-12 md:items-center">
          {/* BG glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none md:left-0 md:translate-x-0"
            style={{
              background: "radial-gradient(circle, rgba(163,217,119,0.12) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionLabel text="Build Agents for the Real World V2" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(1.75rem, 8vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Send it, Swap it,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #A3D977, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Earn it.
              </span>{" "}
              <br/>Anywhere, Anytime.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 text-sm md:text-base leading-relaxed"
              style={{ color: "var(--text-secondary)", maxWidth: "480px" }}
            >
              LiquidAI extends MiniPay's mission. You hold the stablecoins, we stack the rewards. No strings, no locks, no confusing DeFi fees. Just the easiest stablecoin treasury you'll ever use.
            </motion.p>
          </div>

          <div className="relative z-10">
            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-3 rounded-2xl overflow-hidden mb-8"
              style={{
                background: "var(--surface-solid)",
                boxShadow: "0 4px 20px rgba(13,75,46,0.1)",
              }}
            >
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="flex flex-col items-center py-4 px-2"
                    style={{ borderLeft: i > 0 ? "1px solid var(--border-light)" : "none" }}
                  >
                    <Icon className="w-4 h-4 mb-1.5" style={{ color: "#A3D977" }} />
                    <span
                      className="font-mono font-bold"
                      style={{ color: "var(--text-primary)", fontSize: "1rem" }}
                    >
                      {s.value}
                    </span>
                    <span className="text-center mt-0.5" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* Hero simulation card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-2xl p-5 mb-8"
              style={{
                background: "linear-gradient(145deg, #0B3D25 0%, #0D4B2E 60%, #12593A 100%)",
                boxShadow: "0 8px 32px rgba(13,75,46,0.28)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <LiquidLogo size={24} variant="icon" theme="auto" background="transparent" className="mr-1" />
                <span className="text-sm font-semibold text-white">Live model: wallet-first treasury</span>
              </div>
              {[
                { label: "Without LiquidAI (idle)", value: "$1,200.00", sub: "Local inflation: -8%/yr", color: "#EF4444" },
                { label: "With LiquidAI (4.8% APY)", value: "$1,257.60", sub: "+$57.60 in 12 months", color: "#A3D977" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{row.label}</p>
                    <p className="text-base font-mono font-bold text-white">{row.value}</p>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${row.color}20`, color: row.color }}
                  >
                    {row.sub}
                  </div>
                </div>
              ))}
              <div
                className="mt-4 p-3 rounded-xl flex items-center gap-2"
                style={{ background: "rgba(163,217,119,0.1)" }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A3D977" }} />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <span className="font-semibold text-white">$57.60 extra per year</span> — Hold stables, stack rewards. No extra steps.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── PILLARS ─────────────────────────────────────────── */}
        <div className="px-5 mb-8">
          <SectionLabel text="Why LiquidAI" />
          <h2 className="mb-5" style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700 }}>
            Invisible DeFi for the Real World
          </h2>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            {PILLARS.map((pillar, i) => (
              <PillarCard key={pillar.title} {...pillar} delay={i * 0.08} />
            ))}
          </div>
        </div>

        {/* ── COMPARISON TABLE ────────────────────────────────── */}
        <div className="px-5 mb-8">
          <SectionLabel text="Comparison" />
          <h2 className="mb-2" style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700 }}>
            MiniPay + LiquidAI
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            We boost MiniPay's power, we supercharge it. See how LiquidAI turns your existing wallet into an autonomous yield engine.
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface-solid)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-3 px-4 py-3"
              style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-light)" }}
            >
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Feature</span>
              <span className="text-xs font-semibold text-center" style={{ color: "var(--text-muted)" }}>MiniPay Only</span>
              <span className="text-xs font-semibold text-center" style={{ color: "#A3D977" }}>With LiquidAI</span>
            </div>
            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 items-center px-4 py-3"
                style={{ borderBottom: i < COMPARISON.length - 1 ? "1px solid var(--border-light)" : "none" }}
              >
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{row.feature}</span>
                <div className="flex justify-center">
                  {row.minipay ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#10B981" }} />
                  ) : (
                    <span className="text-lg" style={{ color: "var(--text-muted)", opacity: 0.3 }}>—</span>
                  )}
                </div>
                <div className="flex justify-center">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ────────────────────────────────────── */}
        <div className="px-5 mb-8">
          <SectionLabel text="How it works" />
          <h2 className="mb-5" style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700 }}>
            No extra setup. Just connect.
          </h2>
          <div className="flex flex-col gap-3 md:grid md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect MiniPay",
                desc: "Open LiquidAI inside Opera Mini. No seed phrase, no complexity.",
                color: "#A3D977",
              },
              {
                step: "02",
                title: "Verify with Self",
                desc: "1 selfie + passport = identity proven via ZK Proof. Data never exposed.",
                color: "#10B981",
              },
              {
                step: "03",
                title: "Hold & Earn",
                desc: "LiquidAI Agent optimizes your cUSD 24/7, keeping liquidity for your daily spending.",
                color: "#06B6D4",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 rounded-2xl p-4 h-full"
                style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── HACKATHON BADGE ─────────────────────────────────── */}
        <div className="px-5 mb-8">
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background: "var(--surface-solid)",
              border: "1px solid rgba(163,217,119,0.2)",
              boxShadow: "0 4px 16px rgba(13,75,46,0.08)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#0D4B2E" }}
            >
              <ShieldCheck className="w-6 h-6" style={{ color: "#A3D977" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Build Agents for the Real World V2
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                LiquidAI · Treasury OS · Celo · Self Protocol · 2026
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {["Autonomous Agent", "Anti-Sybil", "MiniPay Native"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(163,217,119,0.1)", color: "#A3D977" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 px-5 pb-8 text-center border-t pt-8" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex justify-center mb-4">
            <LiquidLogo size={48} variant="full" theme="auto" background="auto" />
          </div>
          <div className="text-xs flex flex-col items-center justify-center gap-2" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            <p>
              LiquidAI - Agentic Treasury OS © 2026 by doublegreen is licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-1"
                style={{ color: "#A3D977" }}
              >
                CC BY 4.0
                <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="CC" className="h-3.5 w-3.5 opacity-70 dark:invert" />
                <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="BY" className="h-3.5 w-3.5 opacity-70 dark:invert" />
              </a>
            </p>
            <p className="opacity-60">Build Agents for the Real World V2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
