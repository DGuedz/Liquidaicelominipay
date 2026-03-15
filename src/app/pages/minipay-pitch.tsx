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

// ─── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "12M+", label: "Usuários MiniPay", icon: Users },
  { value: "4.8%", label: "APY médio", icon: TrendingUp },
  { value: "< $5", label: "Microtransações", icon: Zap },
];

const PILLARS = [
  {
    icon: Bot,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    title: "Sua Reserva Trabalha 24/7",
    description:
      "Com $1.200 cUSD parados na MiniPay, a inflação local come seu dinheiro mesmo em dólar. O LiquidAI Agent aloca automaticamente em protocolos Celo para gerar +4.8% APY — sem você precisar entender DeFi.",
    badge: "+$8/mês",
    badgeColor: "#A3D977",
  },
  {
    icon: Zap,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    title: "Pronto para o Dia a Dia",
    description:
      "PIX de $3,50, recarga de $2, remessa P2P — tudo funciona como antes. O agente mantém $350 em liquidez imediata enquanto o restante rende. Liquidação em 1 segundo na rede Celo.",
    badge: "≤ 3 toques",
    badgeColor: "#10B981",
  },
  {
    icon: Globe,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    title: "Brasil, Argentina, África",
    description:
      "Sem palavras difíceis do mundo cripto. Se você sabe enviar uma mensagem no WhatsApp, você sabe usar o LiquidAI. Interface em português, design familiar, resultados reais.",
    badge: "Invisible DeFi",
    badgeColor: "#06B6D4",
  },
  {
    icon: Fingerprint,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    title: "Apenas Para Humanos Reais",
    description:
      "A integração com o Self Protocol garante verificação de identidade via ZK Proof sem expor seus dados. 1 humano = 1 conta. Robôs e sybils são bloqueados, humanos ganham taxas premium.",
    badge: "Anti-Sybil",
    badgeColor: "#8B5CF6",
  },
];

const COMPARISON = [
  { feature: "Proteção contra inflação", minipay: false, liquidai: true },
  { feature: "Yield automático 4.8%", minipay: false, liquidai: true },
  { feature: "Liquidez imediata PIX", minipay: true, liquidai: true },
  { feature: "Agente IA 24/7", minipay: false, liquidai: true },
  { feature: "Verificação Anti-Sybil", minipay: false, liquidai: true },
  { feature: "Interface familiar", minipay: true, liquidai: true },
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
    <div className="min-h-dvh bg-background flex flex-col pb-10 overflow-x-hidden">

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
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#0D4B2E" }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "#A3D977" }} />
          </div>
          <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            LiquidAI
          </span>
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
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <div className="relative px-5 pt-10 pb-8 overflow-hidden">
        {/* BG glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
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
              fontSize: "clamp(1.75rem, 8vw, 2.25rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Seu cUSD protegido{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A3D977, #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              da inflação.
            </span>{" "}
            Rendendo.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)", maxWidth: "340px" }}
          >
            Mais de 12 milhões de pessoas usam a MiniPay para guardar saldo e
            pagar o dia a dia. O LiquidAI transforma esse saldo em um ativo que
            trabalha 24/7 — sem você precisar saber o que é DeFi.
          </motion.p>

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
                  <span className="text-xs text-center mt-0.5" style={{ color: "var(--text-muted)" }}>
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
              <Sparkles className="w-4 h-4" style={{ color: "#A3D977" }} />
              <span className="text-sm font-semibold text-white">Simulação: saldo de $1.200 cUSD</span>
            </div>
            {[
              { label: "Sem LiquidAI (parado)", value: "$1.200", sub: "Inflação local: -8%/ano", color: "#EF4444" },
              { label: "Com LiquidAI (APY 4.8%)", value: "$1.257,60", sub: "+$57,60 em 12 meses", color: "#A3D977" },
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
                <span className="font-semibold text-white">$57,60 extras por ano</span> apenas por deixar o agente trabalhar — sem risco adicional
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── PILLARS ─────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <SectionLabel text="Por que LiquidAI" />
        <h2 className="mb-5" style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700 }}>
          Invisible DeFi para o mundo real
        </h2>
        <div className="flex flex-col gap-4">
          {PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.title} {...pillar} delay={i * 0.08} />
          ))}
        </div>
      </div>

      {/* ── COMPARISON TABLE ────────────────────────────────── */}
      <div className="px-5 mb-8">
        <SectionLabel text="Comparativo" />
        <h2 className="mb-4" style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700 }}>
          MiniPay vs LiquidAI
        </h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-solid)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-3 px-4 py-3"
            style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-light)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Recurso</span>
            <span className="text-xs font-semibold text-center" style={{ color: "var(--text-muted)" }}>MiniPay</span>
            <span className="text-xs font-semibold text-center" style={{ color: "#A3D977" }}>LiquidAI</span>
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
        <SectionLabel text="Como funciona" />
        <h2 className="mb-5" style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700 }}>
          3 toques, sem complicação
        </h2>
        <div className="flex flex-col gap-3">
          {[
            {
              step: "01",
              title: "Conecte sua MiniPay",
              desc: "Abra o LiquidAI dentro do Opera Mini. Sem seed phrase, sem complexidade.",
              color: "#A3D977",
            },
            {
              step: "02",
              title: "Verifique com Self",
              desc: "1 selfie + passaporte = identidade comprovada via ZK Proof. Dados jamais expostos.",
              color: "#10B981",
            },
            {
              step: "03",
              title: "O agente cuida do resto",
              desc: "O LiquidAI Agent otimiza seu cUSD 24/7, mantendo liquidez para seus gastos diários.",
              color: "#06B6D4",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-2xl p-4"
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

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 mb-3"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            color: "#FFFFFF",
            boxShadow: "0 6px 28px rgba(13,75,46,0.35)",
          }}
        >
          Experimentar Agora
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Auditoria completa · Zero taxas ocultas · Liquidação em 1s · Rede Celo
        </p>
      </div>
    </div>
  );
}