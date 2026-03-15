import { useState, useEffect } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../hooks/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "idle" | "running" | "done";

// ─── SVG path strings ─────────────────────────────────────────────────────────
const P1 = "M54,102 C98,78 128,78 160,102";     // Idle → Agent
const P2 = "M160,102 C198,82 240,56 265,47";    // Agent → Yield
const P3 = "M160,102 C198,122 240,145 265,151"; // Agent → Pool

// ─── Particle group ───────────────────────────────────────────────────────────
function Particles({ runKey }: { runKey: number }) {
  return (
    <g key={runKey}>
      <circle r="5" fill="#A3D977" opacity="0.95">
        <animateMotion dur="1.55s" begin="0s" repeatCount="indefinite" path={P1} />
      </circle>
      <circle r="3.5" fill="#A3D977" opacity="0.52">
        <animateMotion dur="1.55s" begin="0.6s" repeatCount="indefinite" path={P1} />
      </circle>
      <circle r="4.5" fill="#A3D977" opacity="0.9">
        <animateMotion dur="1.85s" begin="0.18s" repeatCount="indefinite" path={P2} />
      </circle>
      <circle r="3" fill="#A3D977" opacity="0.48">
        <animateMotion dur="1.85s" begin="0.85s" repeatCount="indefinite" path={P2} />
      </circle>
      <circle r="4.5" fill="#A3D977" opacity="0.85">
        <animateMotion dur="2.05s" begin="0.07s" repeatCount="indefinite" path={P3} />
      </circle>
      <circle r="3" fill="#A3D977" opacity="0.44">
        <animateMotion dur="2.05s" begin="0.95s" repeatCount="indefinite" path={P3} />
      </circle>
    </g>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LiquidityMap() {
  const { isDark } = useTheme();
  const [phase, setPhase] = useState<Phase>("idle");
  const [runKey, setRunKey] = useState(0);
  const [counter, setCounter] = useState(0);

  const isRunning = phase === "running";
  const isDone = phase === "done";
  const isActive = isRunning || isDone;

  // Theme-aware colors
  const pathIdle = isDark ? "rgba(163,217,119,0.18)" : "#E8EAED";
  const labelColor = isDark ? "#6A8A70" : "#718096";
  const valueColor = isDark ? "#A3D977" : "#0D4B2E";
  const standbyColor = isDark ? "rgba(163,217,119,0.35)" : "#CBD5E0";
  const nodeFillDim = isDark ? "#122A1C" : "#1a6b45";
  const nodeStrokeDim = isDark ? "rgba(163,217,119,0.2)" : "rgba(163,217,119,0.3)";

  const handleOptimize = () => {
    if (phase !== "idle") return;
    setCounter(0);
    setRunKey((k) => k + 1);
    setPhase("running");
  };

  useEffect(() => {
    if (phase !== "running") return;
    const t = setTimeout(() => setPhase("done"), 4200);
    return () => clearTimeout(t);
  }, [phase, runKey]);

  useEffect(() => {
    if (phase !== "done") return;
    const TARGET = 12.43;
    const STEPS = 42;
    const INTERVAL = 1100 / STEPS;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setCounter(Math.min((step / STEPS) * TARGET, TARGET));
      if (step >= STEPS) clearInterval(id);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => { setPhase("idle"); setCounter(0); }, 5500);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 16px rgba(13,75,46,0.1)",
        border: "1px solid rgba(163,217,119,0.18)",
        transition: "background 0.3s ease",
      }}
    >
      {/* ── CARD HEADER ──────────────────────────────────── */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            AI Liquidity Map
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: isActive ? "rgba(16,185,129,0.1)" : "var(--surface-outline)",
              color: isActive ? "var(--success)" : "var(--text-muted)",
              fontWeight: 500,
              transition: "all 0.4s ease",
            }}
          >
            {isRunning ? "Roteando..." : isDone ? "Concluído" : "Em repouso"}
          </span>
        </div>

        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.55, x: 12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{
                background: "rgba(163,217,119,0.18)",
                border: "1px solid rgba(163,217,119,0.45)",
              }}
            >
              <CheckCircle2 className="w-3 h-3" style={{ color: "#A3D977" }} />
              <span className="font-mono text-xs" style={{ color: "#A3D977", fontWeight: 700 }}>
                +${counter.toFixed(2)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SVG MAP ──────────────────────────────────────── */}
      <div className="px-2 pt-1">
        <svg
          viewBox="0 0 320 205"
          style={{ width: "100%", height: 198 }}
          aria-label="AI Liquidity Flow Map"
        >
          <defs>
            <filter id="lm-soft" x="-55%" y="-55%" width="210%" height="210%">
              <feGaussianBlur stdDeviation="4.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="lm-strong" x="-75%" y="-75%" width="250%" height="250%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="lm-path" x="-15%" y="-120%" width="130%" height="340%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── CONNECTION PATHS ───────────────────────── */}
          {[P1, P2, P3].map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={isActive ? "#A3D977" : pathIdle}
              strokeWidth={isActive ? 2 : 1.2}
              strokeDasharray={isActive ? undefined : "5 4"}
              filter={isActive ? "url(#lm-path)" : undefined}
              style={{ transition: "stroke 0.5s ease, stroke-width 0.35s ease" }}
            />
          ))}

          {/* ── PARTICLES ─────────────────────────────── */}
          {isRunning && <Particles runKey={runKey} />}

          {/* ══════════════════════════════════════════
              NODE 1 — IDLE BALANCE (left)
          ══════════════════════════════════════════ */}
          <g>
            {isActive && (
              <>
                <circle cx="54" cy="102" r="26" fill="none" stroke="#0D4B2E" strokeWidth="1">
                  <animate attributeName="r" values="26;42;26" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="54" cy="102" r="22" fill="none" stroke="#A3D977" strokeWidth="0.8">
                  <animate attributeName="r" values="22;34;22" dur="2.4s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.22;0;0.22" dur="2.4s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            <circle
              cx="54" cy="102" r="22"
              fill="#0D4B2E"
              stroke={isActive ? "#A3D977" : "transparent"}
              strokeWidth="1.5"
              filter={isActive ? "url(#lm-soft)" : undefined}
              style={{ transition: "filter 0.45s" }}
            />
            <text x="54" y="108" textAnchor="middle" fill="#A3D977" fontSize="17" fontWeight="700" fontFamily="ui-monospace, monospace">$</text>
            <text x="54" y="134" textAnchor="middle" style={{ fill: labelColor }} fontSize="9" fontFamily="system-ui">Idle Balance</text>
            <text x="54" y="146" textAnchor="middle" style={{ fill: valueColor }} fontSize="9" fontWeight="600" fontFamily="ui-monospace, monospace">$4.2k</text>
          </g>

          {/* ══════════════════════════════════════════
              NODE 2 — AI AGENT (center hub)
          ══════════════════════════════════════════ */}
          <g>
            <circle cx="160" cy="102" r="32" fill="none" stroke="#A3D977" strokeWidth="1.5">
              <animate attributeName="r" values={isActive ? "32;50;32" : "30;42;30"} dur={isActive ? "2.8s" : "3.5s"} repeatCount="indefinite" />
              <animate attributeName="opacity" values={isActive ? "0.45;0;0.45" : "0.18;0;0.18"} dur={isActive ? "2.8s" : "3.5s"} repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="102" r="28" fill="none" stroke="#A3D977" strokeWidth="0.8">
              <animate attributeName="r" values={isActive ? "28;44;28" : "26;36;26"} dur={isActive ? "2.1s" : "2.8s"} begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={isActive ? "0.3;0;0.3" : "0.12;0;0.12"} dur={isActive ? "2.1s" : "2.8s"} begin="0.7s" repeatCount="indefinite" />
            </circle>
            <circle
              cx="160" cy="102" r="28"
              fill="#0D4B2E"
              stroke="#A3D977"
              strokeWidth={isActive ? "2.5" : "1.5"}
              filter={isActive ? "url(#lm-strong)" : "url(#lm-soft)"}
              style={{ transition: "stroke-width 0.35s" }}
            />
            <text x="160" y="98" textAnchor="middle" fill="#A3D977" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="1.5">AI</text>
            <text x="160" y="112" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="system-ui">Agent</text>
            <text
              x="160" y="145" textAnchor="middle"
              style={{ fill: isRunning ? "var(--success)" : isDone ? "#A3D977" : standbyColor, transition: "fill 0.4s" }}
              fontSize="8.5" fontFamily="system-ui"
            >
              {isRunning ? "routing funds..." : isDone ? "optimized ✓" : "standby"}
            </text>
          </g>

          {/* ══════════════════════════════════════════
              NODE 3 — YIELD STRATEGY (top right)
          ══════════════════════════════════════════ */}
          <g>
            {isDone && (
              <circle cx="265" cy="47" r="22" fill="none" stroke="#A3D977" strokeWidth="1">
                <animate attributeName="r" values="22;36;22" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.45;0;0.45" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx="265" cy="47" r="19"
              fill={isDone ? "#0D4B2E" : nodeFillDim}
              stroke={isDone ? "#A3D977" : nodeStrokeDim}
              strokeWidth={isDone ? "2" : "1"}
              filter={isDone ? "url(#lm-soft)" : undefined}
              style={{ transition: "fill 0.5s, filter 0.5s" }}
            />
            <text x="265" y="52" textAnchor="middle" fill="#A3D977" fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">↑</text>
            <text x="265" y="77" textAnchor="middle" style={{ fill: labelColor }} fontSize="9" fontFamily="system-ui">Yield Strategy</text>
            <text
              x="265" y="89" textAnchor="middle"
              style={{ fill: isDone ? "var(--success)" : "var(--text-muted)", transition: "fill 0.5s" }}
              fontSize="9" fontWeight="600" fontFamily="ui-monospace, monospace"
            >
              {isDone ? "+4.8% APY" : "4.2% APY"}
            </text>
          </g>

          {/* ══════════════════════════════════════════
              NODE 4 — LIQUIDITY POOL (bottom right)
          ══════════════════════════════════════════ */}
          <g>
            {isDone && (
              <circle cx="265" cy="151" r="22" fill="none" stroke="#A3D977" strokeWidth="1">
                <animate attributeName="r" values="22;36;22" dur="2.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.45;0;0.45" dur="2.3s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx="265" cy="151" r="19"
              fill={isDone ? "#0D4B2E" : nodeFillDim}
              stroke={isDone ? "#A3D977" : nodeStrokeDim}
              strokeWidth={isDone ? "2" : "1"}
              filter={isDone ? "url(#lm-soft)" : undefined}
              style={{ transition: "fill 0.5s, filter 0.5s" }}
            />
            <text x="265" y="156" textAnchor="middle" fill="#A3D977" fontSize="13" fontWeight="700" fontFamily="ui-monospace, monospace">≈</text>
            <text x="265" y="181" textAnchor="middle" style={{ fill: labelColor }} fontSize="9" fontFamily="system-ui">Liquidity Pool</text>
            <text
              x="265" y="193" textAnchor="middle"
              style={{ fill: isDone ? "var(--success)" : "var(--text-muted)", transition: "fill 0.5s" }}
              fontSize="9" fontWeight="600" fontFamily="ui-monospace, monospace"
            >
              {isDone ? "$8.9k" : "$8.2k"}
            </text>
          </g>
        </svg>
      </div>

      {/* ── CTA BUTTON ────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-0">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleOptimize}
          disabled={phase !== "idle"}
          className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
          style={{
            background: isDone
              ? "var(--success)"
              : isRunning
              ? "rgba(13,75,46,0.72)"
              : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            color: "#FFFFFF",
            boxShadow: isDone
              ? "0 4px 20px rgba(74,222,128,0.25)"
              : isRunning
              ? "none"
              : "0 4px 20px rgba(13,75,46,0.28)",
            transition: "background 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" style={{ color: "#A3D977" }} />
          )}
          <span className="text-sm font-semibold">
            {isDone
              ? `+$${counter.toFixed(2)} Yield Capturado`
              : isRunning
              ? "Otimizando Liquidez..."
              : "Optimize Liquidity"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
