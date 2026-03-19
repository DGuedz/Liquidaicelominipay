import { useNavigate } from "react-router";
import { motion, useScroll, useTransform, useMotionValue } from "motion/react";
import { Shield, Zap, ArrowRight, Bot, Sparkles, Globe, Smartphone, CheckCircle2, TrendingUp, Lock, Bell, Search, Eye } from "lucide-react";
import { LiquidLogo } from "../components/LiquidLogo";
import { useRef } from "react";
import { PhoneTopupIcon, DepositIcon, PixIcon } from "../components/icons";

// Mockup Component for visual proof (Faithful to dApp Design)
const AppMockup = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
  <motion.div 
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 50, delay: 0.4 }}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    style={{ rotateX, rotateY, transformPerspective: 1000 }}
    className="relative w-[280px] h-[580px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden mx-auto cursor-pointer"
  >
    {/* Screen Content - Dark Theme like dApp */}
    <div className="w-full h-full bg-[#020408] relative flex flex-col font-sans">
      
      {/* Status Bar */}
      <div className="h-12 flex items-center justify-between px-5 pt-3">
        <span className="text-[10px] font-bold text-white">9:41</span>
        <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-white rounded-full opacity-20" />
            <div className="w-3 h-3 bg-white rounded-full opacity-20" />
        </div>
      </div>

      {/* App Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
            </div>
            <span className="text-white font-bold text-sm">LiquidAI</span>
        </div>
        <div className="flex gap-3 text-white/60">
            <Search size={18} />
            <Bell size={18} />
        </div>
      </div>
      
      {/* Balance Card (Exact Replica) */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="mx-4 mt-2 p-6 rounded-3xl relative overflow-hidden transition-transform duration-300 border border-white/10" 
        style={{ 
          background: "linear-gradient(135deg, #0a0a0a 0%, #111 100%)", 
          boxShadow: "0 12px 40px rgba(13,75,46,0.4)" 
        }}
      >
        {/* Glow map effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(163,217,119,0.2) 0%, transparent 70%)",
            transform: "translateY(20%) scale(1.5)"
          }}
        />
        {/* Dotted map SVG placeholder */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(163,217,119,0.5) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            transform: "translateY(30%) scaleY(0.5) scaleX(1.2)"
          }}
        />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Total Balance</span>
                  <div className="w-3.5 h-3.5 text-white opacity-60"><Eye size={14}/></div>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: "rgba(163,217,119,0.18)", border: "1px solid rgba(163,217,119,0.3)", backdropFilter: "blur(4px)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#A3D977", boxShadow: "0 0 8px #A3D977" }} />
                <span className="text-[10px]" style={{ color: "#A3D977", fontWeight: 600 }}>
                  Agent Active
                </span>
              </div>
            </div>

            <div className="font-mono text-white mb-1 drop-shadow-md" style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              $5.57
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />
              <span className="text-xs font-medium" style={{ color: "#A3D977" }}>+2.4% APY · +$0.01 this month</span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="font-mono text-xs tracking-[0.15em] drop-shadow-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                •••• •••• •••• 3424
              </span>
              <div className="flex items-center gap-1.5 opacity-80">
                <div className="text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                </div>
                <span className="text-white font-bold leading-none text-[9px] tracking-tight">MiniPay</span>
              </div>
            </div>
        </div>
      </motion.div>

      {/* Quick Actions (Replaced old buttons with grid) */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: "Send", icon: <ArrowRight size={16} className="-rotate-45" /> },
            { label: "Receive", icon: <ArrowRight size={16} className="rotate-45" /> },
            { label: "Optimize", icon: <Zap size={16} /> },
            { label: "Card", icon: <div className="grid grid-cols-2 gap-0.5 w-4 h-4"><div className="border border-current rounded-[2px]" /><div className="border border-current rounded-[2px]" /><div className="border border-current rounded-[2px]" /><div className="border border-current rounded-[2px]" /></div> },
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-green-400">
                {action.icon}
              </div>
              <span className="text-[9px] text-white/60 font-medium">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Status Card (Mini version of the real one) */}
      <div className="px-5 pt-5">
        <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
          <div className="px-3 py-2.5 flex items-center gap-2 border-b border-white/10">
            <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center relative">
              <Bot size={12} className="text-green-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 animate-pulse border border-[#020408]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">LiquidAI Agent</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-white font-bold">Online</span>
              </div>
              <div className="text-[9px] text-white/40 truncate mt-0.5">Best current opportunity: Aave v3 (USDm)...</div>
            </div>
          </div>
          <div className="grid grid-cols-3 px-2 py-2">
            {[
              { l: "Daily Yield", v: "+$0.00" },
              { l: "Managed Assets", v: "$4" },
              { l: "Current APY", v: "2.4%" },
            ].map((s, i) => (
              <div key={i} className={`text-center ${i > 0 ? 'border-l border-white/10' : ''}`}>
                <div className="font-mono text-[10px] font-bold text-green-400">{s.v}</div>
                <div className="text-[8px] text-white/40">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav Placeholder */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#020408]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4">
          <div className="flex flex-col items-center gap-1"><div className="w-5 h-5 rounded bg-green-500/20" /><div className="w-6 h-1 rounded bg-green-500" /></div>
          <div className="flex flex-col items-center gap-1 opacity-40"><div className="w-5 h-5 rounded bg-white" /><div className="w-6 h-1 rounded bg-transparent" /></div>
          <div className="flex flex-col items-center gap-1 opacity-40"><div className="w-5 h-5 rounded bg-white" /><div className="w-6 h-1 rounded bg-transparent" /></div>
          <div className="flex flex-col items-center gap-1 opacity-40"><div className="w-5 h-5 rounded bg-white" /><div className="w-6 h-1 rounded bg-transparent" /></div>
      </div>

    </div>
  </motion.div>
  );
};

export function LandingPage() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const stats = [
    { label: "Productive Capital", value: "Auto", icon: Bot },
    { label: "Target APY", value: "~4.8%", icon: TrendingUp },
    { label: "Network", value: "Celo", icon: Globe },
  ];

  return (
    <div className="min-h-dvh bg-[#020408] text-white overflow-x-hidden font-sans selection:bg-green-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg border-b border-white/5 bg-black/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <LiquidLogo size={32} variant="icon" theme="dark" />
                <span className="font-bold text-lg tracking-tight">LiquidAI</span>
            </div>
            <button 
                onClick={() => navigate("/minipay")}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full transition-all border border-white/10"
            >
                Launch App
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none opacity-30" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full">
            {/* Text Content */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left flex flex-col items-center md:items-start"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
                    <Sparkles size={12} />
                    Built for the MiniPay Ecosystem
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] mb-6 tracking-tight">
                    Hold & Earn. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                        Zero complexity.
                    </span>
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-400 mb-8 leading-relaxed max-w-xl lg:max-w-2xl">
                    LiquidAI turns your MiniPay wallet into an autonomous treasury. 
                    Keep your local cash in stablecoins and earn daily rewards, without learning DeFi.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => navigate("/minipay")}
                        className="w-full sm:w-auto h-14 px-8 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                    >
                        Explore Mini App <ArrowRight size={20} />
                    </button>
                    <button 
                        onClick={() => window.open('https://github.com/DGuedz/Liquidaicelominipay', '_blank')}
                        className="w-full sm:w-auto h-14 px-8 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all"
                    >
                        View Documentation
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center md:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 text-sm lg:text-base"><Globe size={18}/> Celo Network</div>
                    <div className="flex items-center gap-2 text-sm lg:text-base"><Shield size={18}/> Self Protocol</div>
                    <div className="flex items-center gap-2 text-sm lg:text-base"><Bot size={18}/> Karma Reputation</div>
                </div>
            </motion.div>

            {/* Visual Proof / Mockup */}
            <div className="relative flex justify-center md:justify-end h-full items-center">
                {/* Wrapper to anchor floating elements to the phone */}
                <div className="relative w-[280px]">
                    <AppMockup />
                    
                    {/* Floating Elements anchored to the phone container */}
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-16 -left-4 md:-left-12 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 z-20 w-max max-w-[180px] pointer-events-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Shield size={16} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400">Security Check</div>
                            <div className="text-xs font-bold text-white">Self Verified</div>
                        </div>
                    </motion.div>

                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-24 -right-4 md:-right-8 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 z-20 w-max pointer-events-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400">Current Yield</div>
                            <div className="text-xs font-bold text-white">2.4% APY</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x divide-white/5">
            {stats.map((stat, i) => (
                <div key={i} className="py-8 text-center group cursor-default hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-2 group-hover:text-green-400 transition-colors">
                        <stat.icon size={16} />
                        <span className="text-sm font-medium uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
            ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Invisible DeFi Infrastructure</h2>
            <p className="text-gray-400 text-lg">We hide the complexity of Web3 behind a simple 3-Tap Rule UX.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
                {
                    title: "Active Auto-Savings",
                    desc: "Your balance works for you. Idle capital is automatically routed to yield protocols.",
                    icon: Bot,
                    color: "text-green-400",
                    bg: "bg-green-400/10"
                },
                {
                    title: "Liquid Buffer",
                    desc: "Immediate liquidity for payments. The agent keeps enough ready for your daily needs.",
                    icon: Zap,
                    color: "text-yellow-400",
                    bg: "bg-yellow-400/10"
                },
                {
                    title: "Self Identity",
                    desc: "Anti-Sybil protection ensuring one human, one efficient treasury.",
                    icon: Shield,
                    color: "text-blue-400",
                    bg: "bg-blue-400/10"
                }
            ].map((feature, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-white/10 transition-all group"
                >
                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <feature.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
            ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-transparent to-green-900/10 px-6">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-8">How it works</h2>
                    <div className="space-y-8">
                        {[
                            { step: "01", title: "Connect Wallet", desc: "The app reads your real balance and understands your liquidity needs." },
                            { step: "02", title: "Agent Organizes", desc: "Part of the capital stays liquid. The rest is routed to yield opportunities." },
                            { step: "03", title: "Instant Access", desc: "Need to pay? The agent liquidates yield positions instantly." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="text-green-500 font-mono text-xl font-bold pt-1">{item.step}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:w-1/2 relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-[80px] rounded-full" />
                    <div className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                        <div className="space-y-4 font-mono text-sm text-gray-300">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Status</span>
                                <span className="text-green-400">Active ●</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Target Protocol</span>
                                <span className="text-white">Mento + Aave</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Daily Rebalance</span>
                                <span className="text-white">08:00 UTC</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Gas Strategy</span>
                                <span className="text-white">USDm Fee Abstraction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to upgrade your wallet?</h2>
            <p className="text-xl text-gray-400 mb-10">
                Join the future of automated treasury management on Celo.
            </p>
            <button 
                onClick={() => navigate("/minipay")}
                className="h-14 px-10 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200"
            >
                Launch App Now
            </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-50">
                <LiquidLogo size={24} variant="icon" theme="dark" />
                <span className="font-bold">LiquidAI</span>
            </div>
            <div className="text-gray-500 text-sm text-center md:text-left">
                <p>
                  LiquidAI - Agentic Treasury OS © 2026 by doublegreen is licensed under{' '}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline inline-flex items-center gap-1"
                  >
                    CC BY 4.0
                    <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="CC" className="h-4 w-4 opacity-70" />
                    <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="BY" className="h-4 w-4 opacity-70" />
                  </a>
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
