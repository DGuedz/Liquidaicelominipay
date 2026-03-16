import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Zap, ArrowRight, Bot, Sparkles, Globe, Lock, ChevronDown, Target } from "lucide-react";
import { LiquidLogo } from "../components/LiquidLogo";

export function LandingPage() {
  const navigate = useNavigate();

  const stats = [
    { label: "Optimized Capital", value: "$2.4B+" },
    { label: "Avg APY", value: "4.2%" },
    { label: "Active Users", value: "12K+" },
  ];

  const features = [
    {
      icon: Bot,
      color: "#0D4B2E",
      bg: "#E8F5E9",
      title: "Autonomous Financial Agent",
      description: "AI that monitors and optimizes your capital automatically, 24/7, without manual intervention.",
    },
    {
      icon: Shield,
      color: "#3B82F6",
      bg: "#EFF6FF",
      title: "Bank-Grade Security",
      description: "Institutional-grade infrastructure with total transparency and user control.",
    },
    {
      icon: Zap,
      color: "#F59E0B",
      bg: "#FFFBEB",
      title: "3-Tap Rule",
      description: "Any financial operation completed in up to 3 interactions. Simple as that.",
    },
    {
      icon: Globe,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      title: "Invisible DeFi",
      description: "Advanced infrastructure operating in the background. You only see results.",
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
            className="mb-6 flex justify-center"
          >
            <LiquidLogo size={80} variant="icon" theme="auto" background="auto" animate={true} />
          </motion.div>

          <h1 className="text-5xl font-bold text-text-primary mb-3 tracking-tight">
            Liquid<span style={{ color: "#0D4B2E" }}>AI</span>
          </h1>
          <p className="text-base text-text-secondary max-w-xs mx-auto leading-relaxed">
            The Treasury Operating System that turns idle liquidity into productive capital
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
            Start Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full bg-surface-solid border border-border rounded-full py-4 font-semibold text-text-primary flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-text-muted" />
            View Demo
          </motion.button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-1 text-text-muted"
        >
          <span className="text-xs">Learn more</span>
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
            Invisible Technology. Real Results.
          </h2>
          <p className="text-sm text-text-muted">
            DeFi infrastructure operating autonomously in the background
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
            Market Opportunity
          </p>
          <h3 className="text-lg font-bold text-white mb-4 leading-tight">
            12M MiniPay users.<br/>
            <span style={{ color: "#A3D977" }}>0% protected from inflation.</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { label: "Estimated TAM", value: "$14.4B", sub: "DeFi LatAm 2026" },
              { label: "Avg. MiniPay Balance", value: "$1.2K", sub: "per user" },
              { label: "BRL Inflation", value: "4.8%", sub: "Jan-Mar 2026" },
              { label: "Cost of Inaction", value: "-$57", sub: "per user/year" },
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
            className="rounded-2xl p-4"
            style={{
              background: "rgba(163,217,119,0.08)",
              border: "1px solid rgba(163,217,119,0.2)",
              boxShadow: "0 0 20px rgba(163,217,119,0.15)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-white/10 flex-shrink-0">
                <Target className="w-5 h-5 text-[#A3D977]" />
              </div>
              <p className="text-sm font-bold text-white">
                Post-Hackathon Roadmap
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="border-l-2 border-[#A3D977]/30 pl-3">
                <p className="text-xs font-bold text-[#A3D977] mb-0.5">Q2 2026: LiquidAI Card (Powered by MiniPay)</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Virtual card instantly in your wallet. Earn cashback in yield every time you use it. Save on FX fees when traveling.
                </p>
              </div>
              
              <div className="border-l-2 border-[#A3D977]/30 pl-3">
                <p className="text-xs font-bold text-[#A3D977] mb-0.5">Q3 2026: DeFi Derivatives</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Launch of yield-backed derivatives built directly on top of our financial techno-stack.
                </p>
              </div>
              
              <div className="border-l-2 border-[#A3D977]/30 pl-3">
                <p className="text-xs font-bold text-[#A3D977] mb-0.5">Q4 2026: White-label Infrastructure</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  Allow users and communities to create their own branded cards utilizing our underlying Treasury OS.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LiquidLogo size={26} variant="icon" theme="auto" background="transparent" />
          <span className="font-semibold text-text-primary text-sm">LiquidAI</span>
        </div>
        <p className="text-xs text-text-muted">
          Treasury Operating System · Build Agents for the Real World V2 · 2026
        </p>
      </div>
    </div>
  );
}
