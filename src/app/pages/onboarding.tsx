import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  Zap,
  Shield,
  ChevronRight,
  TrendingUp,
  Wallet,
  Check,
  ArrowRight,
  Activity,
  Fingerprint,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskId = "conservative" | "balanced" | "aggressive";

const RISK_OPTS = [
  {
    id: "conservative" as RiskId,
    label: "Conservador",
    apy: "3.2–4.2%",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    icon: Shield,
    sub: "Segurança acima de tudo",
  },
  {
    id: "balanced" as RiskId,
    label: "Balanceado",
    apy: "4.2–9.1%",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    icon: Activity,
    sub: "Melhor custo-benefício",
    recommended: true,
  },
  {
    id: "aggressive" as RiskId,
    label: "Arrojado",
    apy: "9–18%",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    icon: Zap,
    sub: "Maximizar rendimento",
  },
];

// ─── Progress Pill ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            background:
              i === current
                ? "#A3D977"
                : i < current
                ? "#0D4B2E"
                : "rgba(163,217,119,0.25)",
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

// ─── Floating Coins ────────────────────────────────────────────────────────────
function FloatingCoins() {
  const coins = [
    { delay: 0, x: 60, size: 36, opacity: 0.7 },
    { delay: 0.5, x: -50, size: 28, opacity: 0.5 },
    { delay: 1.0, x: 90, size: 22, opacity: 0.35 },
    { delay: 1.4, x: -80, size: 18, opacity: 0.25 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map((c, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-1/2"
          initial={{ y: 0, x: c.x, opacity: 0 }}
          animate={{ y: -300, opacity: [0, c.opacity, 0] }}
          transition={{ delay: c.delay, duration: 3.8, repeat: Infinity, ease: "easeOut" }}
        >
          <div
            className="rounded-full flex items-center justify-center text-white"
            style={{
              width: c.size,
              height: c.size,
              background: "linear-gradient(135deg, #A3D977, #0D4B2E)",
              fontSize: c.size * 0.45,
              fontWeight: 700,
            }}
          >
            $
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Step 0: Welcome (compressed — was 2 steps, now 1) ────────────────────────
function StepWelcome({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const highlights = [
    { icon: TrendingUp, color: "#A3D977", label: "4.8% APY médio", sub: "Yield automático 24/7" },
    { icon: Zap, color: "#10B981", label: "3 toques por ação", sub: "PIX, recarga, remessa" },
    { icon: Shield, color: "#3B82F6", label: "DeFi Invisível", sub: "Celo seguro no fundo" },
  ];

  return (
    <div className="flex flex-col items-center text-center px-6 pt-10 pb-8 h-full">
      <div className="relative flex-1 flex flex-col items-center justify-center w-full">
        <FloatingCoins />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
          className="relative mb-6"
        >
          <div
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #0B3D25 0%, #0D4B2E 60%, #12593A 100%)",
              boxShadow: "0 16px 48px rgba(13,75,46,0.45)",
            }}
          >
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#A3D977" }}
          >
            <Bot className="w-4 h-4" style={{ color: "#0D4B2E" }} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-mono mb-1"
          style={{
            fontSize: "clamp(2.4rem, 12vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          Liquid<span style={{ color: "#0D4B2E" }}>AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm mb-6 max-w-[260px]"
          style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}
        >
          Seu dinheiro rende enquanto você vive. Agente autônomo no Celo.
        </motion.p>

        {/* Compact value highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-[320px] rounded-2xl overflow-hidden mb-6"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
        >
          {highlights.map(({ icon: Icon, color, label, sub }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="w-full max-w-[320px] flex flex-col gap-3"
      >
        <button
          onClick={onNext}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2 text-white font-semibold"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            boxShadow: "0 8px 32px rgba(13,75,46,0.4)",
          }}
        >
          Começar em 15 segundos
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="text-xs py-2"
          style={{ color: "var(--text-muted)" }}
        >
          Já tenho conta — Entrar direto
        </button>
      </motion.div>
    </div>
  );
}

// ─── Step 1: Connect MiniPay + Self (unified, <8s) ────────────────────────────
function StepConnect({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<"idle" | "connecting" | "connected" | "verifying" | "done">("idle");
  const [selfEnabled, setSelfEnabled] = useState(true);

  const handleConnect = () => {
    setPhase("connecting");
    setTimeout(() => {
      setPhase("connected");
      if (selfEnabled) {
        setTimeout(() => {
          setPhase("verifying");
          setTimeout(() => setPhase("done"), 1800);
        }, 600);
      } else {
        setPhase("done");
      }
    }, 1600);
  };

  const isDone = phase === "done" || (phase === "connected" && !selfEnabled);

  return (
    <div className="flex flex-col h-full px-6 pt-10 pb-8">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#A3D977" }}>
          Passo 1 de 2
        </p>
        <h2 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.5rem", lineHeight: 1.2 }}>
          Conecte sua carteira
          <br />& verifique identidade
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          MiniPay + Self Protocol · ZK Proof · Sem expor dados
        </p>
      </div>

      {/* Status visual */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <div className="flex items-center gap-6">
          {/* MiniPay node */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={phase === "connecting" ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.7, repeat: phase === "connecting" ? Infinity : 0 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background:
                  phase === "idle"
                    ? "var(--surface-solid)"
                    : (phase === "connected" || phase === "verifying" || phase === "done")
                    ? "linear-gradient(135deg, #0D4B2E, #1a6b45)"
                    : "var(--surface-solid)",
                border: "2px solid " + (phase === "idle" ? "var(--border-light)" : "transparent"),
                boxShadow:
                  (phase === "connected" || phase === "done")
                    ? "0 8px 28px rgba(13,75,46,0.35)"
                    : "0 2px 12px rgba(0,0,0,0.1)",
                transition: "all 0.4s ease",
              }}
            >
              {(phase === "connected" || phase === "verifying" || phase === "done") ? (
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <Wallet
                  className="w-8 h-8"
                  style={{ color: phase === "connecting" ? "#A3D977" : "var(--text-muted)" }}
                />
              )}
              {phase === "connecting" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: "2px solid transparent", borderTopColor: "#A3D977" }}
                />
              )}
            </motion.div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>MiniPay</p>
          </div>

          {/* Connector line */}
          <div className="flex-1 flex items-center">
            <motion.div
              animate={{ scaleX: phase !== "idle" ? 1 : 0 }}
              initial={{ scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{
                height: 2,
                flex: 1,
                background: "linear-gradient(90deg, #0D4B2E, #A3D977)",
                transformOrigin: "left",
              }}
            />
          </div>

          {/* Self node */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={phase === "verifying" ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.7, repeat: phase === "verifying" ? Infinity : 0 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background:
                  phase === "done"
                    ? "linear-gradient(135deg, #3B82F6, #6366F1)"
                    : selfEnabled
                    ? "rgba(59,130,246,0.08)"
                    : "var(--muted)",
                border: "2px solid " + (selfEnabled ? "rgba(59,130,246,0.25)" : "var(--border-light)"),
                boxShadow: phase === "done" ? "0 8px 28px rgba(59,130,246,0.3)" : "none",
                transition: "all 0.4s ease",
                opacity: selfEnabled ? 1 : 0.4,
              }}
            >
              {phase === "done" ? (
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <Fingerprint
                  className="w-8 h-8"
                  style={{ color: phase === "verifying" ? "#3B82F6" : selfEnabled ? "#3B82F6" : "var(--text-muted)" }}
                />
              )}
              {phase === "verifying" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: "2px solid transparent", borderTopColor: "#3B82F6" }}
                />
              )}
            </motion.div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Self ID</p>
          </div>
        </div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center px-4"
          >
            {phase === "idle" && (
              <>
                <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                  Pronto para conectar
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Opera Mini MiniPay detectado
                </p>
              </>
            )}
            {phase === "connecting" && (
              <>
                <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>Conectando MiniPay...</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Autenticando na rede Celo</p>
              </>
            )}
            {phase === "connected" && selfEnabled && (
              <>
                <p className="font-semibold text-base" style={{ color: "#A3D977" }}>
                  MiniPay ✓ · $1,240.50 cUSD
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Verificando identidade com Self...</p>
              </>
            )}
            {phase === "verifying" && (
              <>
                <p className="font-semibold text-base" style={{ color: "#3B82F6" }}>Gerando ZK Proof...</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Zero dados expostos · Anti-Sybil
                </p>
              </>
            )}
            {phase === "done" && (
              <>
                <p className="font-semibold text-base" style={{ color: "#A3D977" }}>
                  Tudo conectado! 🎉
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {selfEnabled ? "MiniPay + Self ID verificado" : "MiniPay conectado"}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Self toggle */}
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.12)" }}
            >
              <Fingerprint className="w-4.5 h-4.5" style={{ color: "#3B82F6" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Self Protocol
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                ZK proof · Anti-Sybil · Sem expor dados
              </p>
            </div>
            <button
              onClick={() => setSelfEnabled((v) => !v)}
              className="w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 flex-shrink-0"
              style={{
                background: selfEnabled ? "#3B82F6" : "var(--muted)",
                justifyContent: selfEnabled ? "flex-end" : "flex-start",
              }}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </button>
          </motion.div>
        )}
      </div>

      {/* Action button */}
      {isDone ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            boxShadow: "0 6px 24px rgba(13,75,46,0.35)",
          }}
        >
          Continuar
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConnect}
          disabled={phase === "connecting" || phase === "connected" || phase === "verifying"}
          className="w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2"
          style={{
            background:
              phase !== "idle"
                ? "rgba(13,75,46,0.4)"
                : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            color: "#fff",
            boxShadow: phase === "idle" ? "0 6px 24px rgba(13,75,46,0.35)" : "none",
          }}
        >
          {phase === "idle" ? (
            <>
              <Wallet className="w-5 h-5" />
              Conectar MiniPay
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
              />
              {phase === "connecting" ? "Conectando..." : "Verificando identidade..."}
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

// ─── Step 2: Risk Setup ────────────────────────────────────────────────────────
function StepRisk({ onFinish }: { onFinish: (risk: RiskId) => void }) {
  const [selected, setSelected] = useState<RiskId>("balanced");
  const sel = RISK_OPTS.find((r) => r.id === selected)!;

  const projections: Record<RiskId, string> = {
    conservative: "4.10",
    balanced: "8.15",
    aggressive: "14.50",
  };

  return (
    <div className="flex flex-col h-full px-6 pt-10 pb-8">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#A3D977" }}>
          Passo 2 de 2 · Último
        </p>
        <h2 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.5rem", lineHeight: 1.2 }}>
          Como prefere que seu
          <br />agente invista?
        </h2>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          Você pode alterar a qualquer momento nas configurações
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 mb-4">
        {RISK_OPTS.map((opt) => {
          const Icon = opt.icon;
          const active = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(opt.id)}
              className="rounded-2xl p-4 flex items-center gap-4 text-left relative"
              style={{
                background: active ? opt.bg : "var(--surface-solid)",
                border: `2px solid ${active ? opt.color : "transparent"}`,
                boxShadow: active ? `0 4px 20px ${opt.color}25` : "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.22s ease",
              }}
            >
              {(opt as any).recommended && (
                <div
                  className="absolute top-2.5 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#A3D977", color: "#0D4B2E", fontSize: "9px" }}
                >
                  Recomendado
                </div>
              )}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: opt.bg }}
              >
                <Icon className="w-5.5 h-5.5" style={{ color: opt.color }} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: active ? opt.color : "var(--text-primary)" }}>
                  {opt.label}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{opt.sub}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm" style={{ color: active ? opt.color : "var(--text-muted)" }}>
                  {opt.apy}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>APY</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Projection chip */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4 flex items-center justify-between"
        style={{ background: sel.bg, border: `1px solid ${sel.color}30` }}
      >
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{ color: sel.color }}>
            Projeção mensal · $1.240 investidos
          </div>
          <div className="font-mono font-bold" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
            +${projections[selected]}/mês
          </div>
        </div>
        <TrendingUp className="w-7 h-7" style={{ color: sel.color, opacity: 0.6 }} />
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onFinish(selected)}
        className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
          boxShadow: "0 6px 24px rgba(13,75,46,0.35)",
        }}
      >
        <Sparkles className="w-5 h-5" />
        Ativar Agente IA
      </motion.button>
    </div>
  );
}

// ─── Step 3: Launch (faster — 400ms each) ─────────────────────────────────────
function StepLaunch({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const steps = [
    { icon: Bot, label: "Configurando agente..." },
    { icon: Activity, label: "Conectando protocolos Celo..." },
    { icon: TrendingUp, label: "Analisando oportunidades..." },
    { icon: Sparkles, label: "Pronto para otimizar! 🎉" },
  ];

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setPhase(i);
      if (i >= steps.length) {
        clearInterval(id);
        setTimeout(onDone, 500);
      }
    }, 420);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: 1, ease: "easeInOut" }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 relative"
        style={{
          background: "linear-gradient(145deg, #0B3D25, #0D4B2E, #12593A)",
          boxShadow: "0 16px 48px rgba(13,75,46,0.4)",
        }}
      >
        <Bot className="w-12 h-12" style={{ color: "#A3D977" }} />
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl"
          style={{ border: "2px solid #A3D977" }}
        />
      </motion.div>

      <h2 className="font-bold mb-6" style={{ color: "var(--text-primary)", fontSize: "1.5rem" }}>
        Ativando seu Agente
      </h2>

      <div className="space-y-2.5 w-full max-w-[280px]">
        {steps.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -12 }}
            animate={
              phase > i ? { opacity: 1, x: 0 } : phase === i ? { opacity: 0.4, x: 0 } : { opacity: 0, x: -12 }
            }
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: phase > i ? "rgba(163,217,119,0.12)" : "var(--surface-solid)" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: phase > i ? "#A3D977" : "var(--muted)" }}
            >
              {phase > i ? (
                <Check className="w-3.5 h-3.5" style={{ color: "#0D4B2E" }} strokeWidth={2.5} />
              ) : (
                <Icon className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              )}
            </div>
            <span className="text-sm text-left" style={{ color: phase > i ? "#A3D977" : "var(--text-muted)" }}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────
export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 2; // step 1 = connect, step 2 = risk

  const handleNext = () => setStep((s) => s + 1);
  const handleSkip = () => navigate("/");
  const handleFinish = (_risk: RiskId) => setStep(3); // launch
  const handleDone = () => navigate("/");

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Top bar for steps 1-2 */}
      {step > 0 && step < 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-14 pb-2 flex items-center justify-between"
        >
          <ProgressDots total={TOTAL_STEPS} current={step - 1} />
          <button
            onClick={handleSkip}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              color: "var(--text-muted)",
              background: "var(--surface-solid)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            Pular
          </button>
        </motion.div>
      )}

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="flex-1 pt-14">
          <StepWelcome onNext={handleNext} onSkip={handleSkip} />
        </div>
      )}

      {/* Steps 1-3 animated */}
      <AnimatePresence mode="wait">
        {step > 0 && step < 4 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {step === 1 && <StepConnect onNext={handleNext} />}
            {step === 2 && <StepRisk onFinish={handleFinish} />}
            {step === 3 && <StepLaunch onDone={handleDone} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
