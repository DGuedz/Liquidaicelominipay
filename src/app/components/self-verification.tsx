import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, CheckCircle2, ExternalLink, Fingerprint, X, Zap } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

type VerifyState = "idle" | "scanning" | "proving" | "done";

// ─── Mini animated ZK proof steps ─────────────────────────────────────────────
const ZK_STEPS = [
  "Lendo dados do passaporte...",
  "Gerando ZK Proof...",
  "Verificando sem expor dados pessoais...",
  "Identidade confirmada ✓",
];

// ─── QR pattern (static decoration) ──────────────────────────────────────────
function QRDecoration() {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,0,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0,0,1,1,0,0,0,1,0,1,0,0,1],
    [1,1,0,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1],
    [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,1,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,0,0,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,0,1,0,0,1,1,0],
  ];
  const SIZE = 6;
  return (
    <svg viewBox={`0 0 ${cells[0].length * SIZE} ${cells.length * SIZE}`} className="w-full h-full">
      {cells.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * SIZE}
              y={r * SIZE}
              width={SIZE - 0.5}
              height={SIZE - 0.5}
              rx="0.8"
              fill="currentColor"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface SelfVerificationProps {
  onVerified?: () => void;
}

export function SelfVerification({ onVerified }: SelfVerificationProps) {
  const { isDark } = useTheme();
  const [state, setState]     = useState<VerifyState>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [showQr, setShowQr]   = useState(false);

  const isVerified = state === "done";

  // ── ZK proof step ticker ──────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "proving") return;
    setStepIdx(0);
    const id = setInterval(() => {
      setStepIdx((i) => {
        if (i >= ZK_STEPS.length - 1) {
          clearInterval(id);
          setTimeout(() => {
            setState("done");
            localStorage.setItem("selfVerified", "true");
            onVerified?.();
          }, 600);
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [state, onVerified]);

  // ── Simulate scan delay ───────────────────────────────────────────────────
  const handleStartScan = () => {
    setState("scanning");
    setShowQr(true);
    setTimeout(() => {
      setState("proving");
      setShowQr(false);
    }, 2800);
  };

  // ── VERIFIED STATE ────────────────────────────────────────────────────────
  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #071A0E 0%, #0F2D1A 100%)"
            : "linear-gradient(135deg, #E8F5E9 0%, #F0FAF0 100%)",
          border: "1px solid rgba(163,217,119,0.35)",
          boxShadow: "0 4px 20px rgba(13,75,46,0.15)",
        }}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(163,217,119,0.18)" }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: "#A3D977" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Identidade Verificada
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                via Self Protocol · ZK Proof
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(163,217,119,0.2)", color: "#A3D977" }}
            >
              ✓ Self
            </div>
          </div>

          {/* ZK proof hash */}
          <div
            className="rounded-xl px-3 py-2.5 mb-3"
            style={{ background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              ZK Proof Hash
            </p>
            <p
              className="font-mono text-xs break-all"
              style={{ color: isDark ? "#A3D977" : "#0D4B2E", fontSize: "10px" }}
            >
              0x7f3a9c2e...d4b8e1f0
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span>Nenhum dado pessoal foi exposto — apenas prova criptográfica</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── QR SCANNING STATE ─────────────────────────────────────────────────────
  if (showQr) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-solid)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4 flex flex-col items-center">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Abra o app Self
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Escaneie com seu passaporte ou ID
          </p>

          {/* QR Code */}
          <div
            className="relative w-44 h-44 rounded-2xl p-3 mb-4"
            style={{
              background: isDark ? "#EDF7E5" : "#fff",
              color: "#0D4B2E",
              boxShadow: "0 4px 20px rgba(13,75,46,0.18)",
            }}
          >
            <QRDecoration />
            {/* Scan line */}
            <motion.div
              animate={{ y: [-62, 62, -62] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-4 right-4 h-0.5 rounded-full"
              style={{ background: "rgba(163,217,119,0.9)" }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-3 h-3" style={{ color: "#A3D977" }} />
            </motion.div>
            Aguardando leitura do documento...
          </div>

          <button
            onClick={() => { setState("idle"); setShowQr(false); }}
            className="mt-3 text-xs flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </motion.div>
    );
  }

  // ── ZK PROVING STATE ──────────────────────────────────────────────────────
  if (state === "proving") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-solid)",
          border: "1px solid rgba(163,217,119,0.25)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4 flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(163,217,119,0.12)" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Fingerprint className="w-7 h-7" style={{ color: "#A3D977" }} />
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Gerando Prova ZK
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {ZK_STEPS[stepIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Step progress dots */}
          <div className="flex items-center gap-2">
            {ZK_STEPS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: i === stepIdx ? 1.3 : 1 }}
                className="rounded-full"
                style={{
                  width: i === stepIdx ? 8 : 5,
                  height: i === stepIdx ? 8 : 5,
                  background: i <= stepIdx ? "#A3D977" : (isDark ? "#1E3A28" : "#D1D5DB"),
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── IDLE (default) STATE ──────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? "rgba(59,130,246,0.15)" : "#EFF6FF" }}
          >
            <Fingerprint className="w-5 h-5" style={{ color: "#3B82F6" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Verificar Identidade
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Powered by{" "}
              <a
                href="https://ai.self.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#3B82F6" }}
              >
                Self Protocol
              </a>{" "}
              · ZK Proofs
            </p>
          </div>
          <a
            href="https://ai.self.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          </a>
        </div>

        {/* Value props */}
        {[
          { icon: "🔒", text: "Passaporte ou ID verificado via ZK Proof — sem expor dados" },
          { icon: "🛡️", text: "Previne Sybil attacks e garante 1 humano = 1 conta" },
          { icon: "🌐", text: "Compatível com Celo · Ethereum · Self app" },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-2.5 mb-2.5">
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {item.text}
            </p>
          </div>
        ))}

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStartScan}
          className="w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
            boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
          }}
        >
          <Fingerprint className="w-4 h-4" />
          Verificar com Self
        </motion.button>
      </div>
    </div>
  );
}

// ─── Compact badge (for use in other pages) ────────────────────────────────────
export function SelfVerifiedBadge({ size = "sm" }: { size?: "xs" | "sm" }) {
  if (size === "xs") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB" }}
      >
        <Shield className="w-2.5 h-2.5" />
        Self ID
      </span>
    );
  }
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: "rgba(37,99,235,0.1)",
        border: "1px solid rgba(37,99,235,0.25)",
      }}
    >
      <Shield className="w-3 h-3" style={{ color: "#2563EB" }} />
      <span className="text-xs font-semibold" style={{ color: "#2563EB" }}>
        Self Verified
      </span>
    </div>
  );
}