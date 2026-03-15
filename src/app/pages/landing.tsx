import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { TrendingUp, Shield, Zap, ArrowRight, Bot, Sparkles, Globe, Lock, ChevronDown } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  const stats = [
    { label: "Capital Optimizado", value: "$2.4B+" },
    { label: "APY Médio", value: "4.2%" },
    { label: "Usuários Ativos", value: "12K+" },
  ];

  const features = [
    {
      icon: Bot,
      color: "#0D4B2E",
      bg: "#E8F5E9",
      title: "Agente Financeiro Autônomo",
      description: "IA que monitora e otimiza seu capital automaticamente, 24/7, sem intervenção manual.",
    },
    {
      icon: Shield,
      color: "#3B82F6",
      bg: "#EFF6FF",
      title: "Segurança Bancária",
      description: "Infraestrutura de nível institucional com total transparência e controle do usuário.",
    },
    {
      icon: Zap,
      color: "#F59E0B",
      bg: "#FFFBEB",
      title: "Regra dos 3 Toques",
      description: "Qualquer operação financeira concluída em até 3 interações. Simples assim.",
    },
    {
      icon: Globe,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      title: "Invisible DeFi",
      description: "Infraestrutura avançada operando no background. Você vê apenas resultados.",
    },
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center px-6 pt-16 pb-8 overflow-hidden">
        {/* Background decorations */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #A3D977, #0D4B2E)" }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 bg-surface-solid border border-border rounded-full px-4 py-2 mb-8"
          style={{ boxShadow: "0 2px 12px rgba(13,75,46,0.1)" }}
        >
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs font-medium text-text-secondary">
            Build Agents for the Real World V2
          </span>
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
        </motion.div>

        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
              boxShadow: "0 8px 32px rgba(13,75,46,0.3)",
            }}
          >
            <TrendingUp className="w-10 h-10 text-white" />
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-bold text-text-primary mb-3 tracking-tight">
            Liquid<span style={{ color: "#0D4B2E" }}>AI</span>
          </h1>
          <p className="text-base text-text-secondary max-w-xs mx-auto leading-relaxed">
            O Sistema Operacional de Tesouraria que transforma liquidez ociosa em capital produtivo
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm bg-surface-solid rounded-2xl p-4 mb-8 grid grid-cols-3 divide-x divide-border"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-2">
              <span className="font-mono font-bold text-xl text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-text-muted text-center leading-tight mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm space-y-3 mb-10"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/onboarding")}
            className="w-full text-white rounded-full py-4 font-semibold flex items-center justify-center gap-2 group"
            style={{
              background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
              boxShadow: "0 4px 24px rgba(13,75,46,0.35)",
            }}
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full bg-surface-solid border border-border rounded-full py-4 font-semibold text-text-primary flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-text-muted" />
            Ver Demo
          </motion.button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-1 text-text-muted"
        >
          <span className="text-xs">Saiba mais</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 text-center"
        >
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Tecnologia Invisível. Resultados Reais.
          </h2>
          <p className="text-sm text-text-muted">
            Infraestrutura DeFi operando de forma autônoma no background
          </p>
        </motion.div>

        <div className="space-y-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.08 }}
                className="bg-surface-solid rounded-2xl p-4 flex items-start gap-4"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: feature.bg }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── BEYOND HACKATHON: Mercado & Tração ────────────────────────── */}
      <div className="px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-3xl p-5"
          style={{
            background: "linear-gradient(135deg, #0D4B2E, #1a6b45)",
            boxShadow: "0 8px 32px rgba(13,75,46,0.3)",
          }}
        >
          <p className="text-xs text-white/50 uppercase tracking-widest mb-3">
            Oportunidade de Mercado
          </p>
          <h3 className="text-lg font-bold text-white mb-4 leading-tight">
            12M usuários MiniPay.<br/>
            <span style={{ color: "#A3D977" }}>0% protegidos da inflação.</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { label: "TAM estimado", value: "$14.4B", sub: "DeFi LatAm 2026" },
              { label: "Avg. saldo MiniPay", value: "$1.2K", sub: "por usuário" },
              { label: "Inflação BRL", value: "4.8%", sub: "jan-mar 2026" },
              { label: "Custo da inação", value: "-$57", sub: "por usuário/ano" },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="rounded-2xl p-3"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                <p className="font-mono font-bold text-lg" style={{ color: "#A3D977", lineHeight: 1 }}>
                  {value}
                </p>
                <p className="text-xs text-white/70 mt-0.5">{label}</p>
                <p className="text-xs text-white/35 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-3 flex items-start gap-2.5"
            style={{ background: "rgba(163,217,119,0.1)", border: "1px solid rgba(163,217,119,0.2)" }}
          >
            <span className="text-lg mt-0.5">🎯</span>
            <div>
              <p className="text-sm font-semibold text-white">Roadmap Pós-Hackathon</p>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Q2: BaaS parceiros (Rain + Daimo) · Q3: Cartão físico Celo · Q4: Credit Engine com RWA colateral
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-text-primary text-sm">LiquidAI</span>
        </div>
        <p className="text-xs text-text-muted">
          Treasury Operating System · Build Agents for the Real World V2 · 2026
        </p>
      </div>
    </div>
  );
}