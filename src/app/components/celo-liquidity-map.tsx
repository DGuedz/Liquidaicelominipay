import { useState, useEffect } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../hooks/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "idle" | "running" | "done";
type Category = "amm" | "lending" | "rwa" | "other";

interface Protocol {
  id: string;
  short: string;
  label: string;
  cx: number;
  cy: number;
  ly: number;
  path: string;
  category: Category;
  apy: string;
  dur: string;
}

interface ControlledConnection {
  id: string;
  apy: string;
}

interface ControlledNetworkState {
  status: "standby" | "optimized";
  sourceAmountUsd: number;
  yieldCapturedUsd: number;
  activeProtocolIds: string[];
  connections: ControlledConnection[];
  ctaLabel: string;
  canOptimize: boolean;
}

interface CeloLiquidityMapProps {
  network?: ControlledNetworkState | null;
  onOptimize?: () => Promise<void> | void;
}

// ─── Category colour system ───────────────────────────────────────────────────
const CAT = {
  amm:     { fill: "#064E3B", stroke: "#10B981", particle: "#10B981", label: "Stable AMM" },
  lending: { fill: "#0C4A6E", stroke: "#06B6D4", particle: "#06B6D4", label: "Lending"    },
  rwa:     { fill: "#5C2900", stroke: "#F59E0B", particle: "#F59E0B", label: "RWA Pool"   },
  other:   { fill: "#1E293B", stroke: "#64748B", particle: "#94A3B8", label: "Other"      },
} as const;

const NODE_RADIUS = 13;
const NODE_DIAMETER = NODE_RADIUS * 2;

const LOGO_MAP: Record<string, string> = {
  // ── Valora address-metadata (Celo native / ecosystem) ─────────────────────
  mento: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/cUSD.png",
  moola: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/MOO.png",
  ethichub: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/ETHIX.png",
  ube: "https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/UBE.png",

  // ── Trust Wallet Assets (EVM) ──────────────────────────────────────────────
  curve: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
  uni: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
  aave: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png",
  morpho: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9994E35Db50125E0DF82e4c2dde62496CE330999/logo.png",
  sushi: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2/logo.png",
  pool: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0cEC1A9154Ff802e7934Fc916Ed7Cb50Bde0f41E/logo.png",
};

// ─── Fixed positions ──────────────────────────────────────────────────────────
const AI   = { cx: 148, cy: 188 };
const IDLE = { cx: 24,  cy: 188 };

const IDLE_PATH = "M24,188 C70,168 108,178 148,188";

// ─── Protocol registry ────────────────────────────────────────────────────────
const PROTOCOLS: Protocol[] = [
  // ── Stable AMMs (emerald, upper-right fan) ────────────────────────────────
  { id:"mento",     short:"M",   label:"Mento",     cx:232, cy:52,  ly:76,  path:"M148,188 C178,152 212,92 232,52",   category:"amm",     apy:"3.8%",  dur:"1.55s" },
  { id:"curve",     short:"C",   label:"Curve",     cx:285, cy:90,  ly:114, path:"M148,188 C202,165 258,115 285,90",  category:"amm",     apy:"5.2%",  dur:"1.75s" },
  { id:"uni",       short:"U3",  label:"Uni v3",    cx:306, cy:148, ly:172, path:"M148,188 C212,175 272,160 306,148", category:"amm",     apy:"7.1%",  dur:"1.65s" },
  // ── Lending (cyan, right column) ──────────────────────────────────────────
  { id:"aave",      short:"Av",  label:"Aave v3",   cx:308, cy:195, ly:219, path:"M148,188 C210,188 268,190 308,195", category:"lending", apy:"4.8%",  dur:"1.60s" },
  { id:"moola",     short:"Mo",  label:"Moola",     cx:295, cy:248, ly:272, path:"M148,188 C205,202 262,232 295,248", category:"lending", apy:"5.9%",  dur:"1.85s" },
  { id:"pwn",       short:"P",   label:"PWN",       cx:268, cy:292, ly:316, path:"M148,188 C195,225 242,268 268,292", category:"lending", apy:"8.2%",  dur:"1.95s" },
  // ── RWA pools (amber, lower arc) ──────────────────────────────────────────
  { id:"untangled", short:"Un",  label:"Untangled", cx:228, cy:325, ly:349, path:"M148,188 C175,238 208,298 228,325", category:"rwa",     apy:"9.1%",  dur:"2.10s" },
  { id:"credit",    short:"CC",  label:"Credit Co", cx:172, cy:352, ly:376, path:"M148,188 C152,248 158,308 172,352", category:"rwa",     apy:"11.4%", dur:"2.20s" },
  { id:"ethichub",  short:"EH",  label:"EthicHub",  cx:115, cy:330, ly:354, path:"M148,188 C142,248 128,298 115,330", category:"rwa",     apy:"12.8%", dur:"2.05s" },
  // ── Other ecosystem (slate, upper-left & lower-left) ──────────────────────
  { id:"morpho",    short:"Mf",  label:"Morpho",    cx:78,  cy:72,  ly:96,  path:"M148,188 C132,150 108,105 78,72",   category:"other",   apy:"6.3%",  dur:"1.70s" },
  { id:"sushi",     short:"S",   label:"Sushi",     cx:32,  cy:132, ly:156, path:"M148,188 C112,178 65,155 32,132",   category:"other",   apy:"4.2%",  dur:"1.68s" },
  { id:"pool",      short:"PT",  label:"PoolTo.",   cx:30,  cy:252, ly:276, path:"M148,188 C108,205 58,232 30,252",   category:"other",   apy:"3.5%",  dur:"1.80s" },
  { id:"ube",       short:"Ub",  label:"Ubeswap",   cx:68,  cy:308, ly:332, path:"M148,188 C118,232 88,278 68,308",   category:"other",   apy:"4.9%",  dur:"1.90s" },
];

// ─── Particle pair (remounts via JSX key) ─────────────────────────────────────
function Particles({ path, color, dur }: { path: string; color: string; dur: string }) {
  const half = (parseFloat(dur) * 0.55).toFixed(2);
  return (
    <>
      <circle r="4.5" fill={color} opacity="0.92">
        <animateMotion dur={dur} begin="0s" repeatCount="indefinite" path={path} />
      </circle>
      <circle r="3" fill={color} opacity="0.5">
        <animateMotion dur={dur} begin={`${half}s`} repeatCount="indefinite" path={path} />
      </circle>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CeloLiquidityMap({ network, onOptimize }: CeloLiquidityMapProps = {}) {
  const { isDark } = useTheme();
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [runKey,      setRunKey]      = useState(0);
  const [activeIds,   setActiveIds]   = useState<Set<string>>(new Set());
  const [counter,     setCounter]     = useState(0);
  const [yieldTarget, setYieldTarget] = useState(32.5);
  const [remoteOptimizing, setRemoteOptimizing] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  const controlled = Boolean(network);
  const controlledApyMap = new Map(
    (network?.connections || []).map((connection) => [connection.id, connection.apy]),
  );
  const effectivePhase: Phase = remoteOptimizing
    ? "running"
    : controlled
      ? network?.status === "optimized"
        ? "done"
        : "idle"
      : phase;
  const effectiveActiveIds = controlled ? new Set(network?.activeProtocolIds || []) : activeIds;
  const effectiveCounter = controlled ? Number(network?.yieldCapturedUsd || 0) : counter;
  const sourceAmountUsd = Number(network?.sourceAmountUsd || 350);

  const isRunning = effectivePhase === "running";
  const isDone    = effectivePhase === "done";
  const isActive  = isRunning || isDone;

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleOptimize = () => {
    if (controlled) {
      if (!onOptimize || remoteOptimizing || network?.canOptimize === false) return;
      const maybePromise = onOptimize();
      if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
        setRemoteOptimizing(true);
        (maybePromise as Promise<void>).finally(() => {
          setRemoteOptimizing(false);
        });
      }
      return;
    }

    if (phase !== "idle") return;

    // Guarantee at least one node per category, then random extras
    const cats: Category[] = ["amm", "lending", "rwa", "other"];
    const chosen: string[] = [];
    cats.forEach((cat) => {
      const group = PROTOCOLS.filter((p) => p.category === cat);
      chosen.push(group[Math.floor(Math.random() * group.length)].id);
    });
    const extras = PROTOCOLS
      .filter((p) => !chosen.includes(p.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 1 + Math.floor(Math.random() * 3))
      .map((p) => p.id);

    setActiveIds(new Set([...chosen, ...extras]));
    setYieldTarget(12 + Math.random() * 28);
    setCounter(0);
    setRunKey((k) => k + 1);
    setPhase("running");
  };

  // ── phase transitions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (controlled) return;
    if (phase !== "running") return;
    const t = setTimeout(() => setPhase("done"), 4500);
    return () => clearTimeout(t);
  }, [controlled, phase, runKey]);

  // ── yield counter ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (controlled) return;
    if (phase !== "done") return;
    const STEPS = 52;
    const MS    = 1300 / STEPS;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setCounter(Math.min((step / STEPS) * yieldTarget, yieldTarget));
      if (step >= STEPS) clearInterval(id);
    }, MS);
    return () => clearInterval(id);
  }, [controlled, phase, yieldTarget]);

  // ── auto-reset ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (controlled) return;
    if (phase !== "done") return;
    const t = setTimeout(() => {
      setPhase("idle");
      setCounter(0);
      setActiveIds(new Set());
    }, 6500);
    return () => clearTimeout(t);
  }, [controlled, phase]);

  // ── derived style helpers ──────────────────────────────────────────────────
  const idlePathColor   = isDark ? "rgba(163,217,119,0.14)" : "#DDE3EA";
  const dimNodeFill     = isDark ? "#091510" : "#0F2018";
  const dimNodeStroke   = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.12)";
  const standbyTextFill = isDark ? "rgba(163,217,119,0.32)" : "#CBD5E0";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 20px rgba(13,75,46,0.1)",
        border: "1px solid rgba(163,217,119,0.18)",
        transition: "background 0.3s ease",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Celo Liquidity Network
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isActive ? "rgba(16,185,129,0.12)" : "var(--surface-outline)",
              color: isActive ? "var(--success)" : "var(--text-muted)",
              transition: "all 0.4s",
            }}
          >
            {isRunning
              ? `Routing → ${activeIds.size} pools`
              : isDone
              ? "Optimized ✓"
              : "Standby"}
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
              <span className="font-mono text-xs font-bold" style={{ color: "#A3D977" }}>
                +${counter.toFixed(2)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SVG MAP ────────────────────────────────────────────────────────── */}
      <div className="px-1">
        <svg
          viewBox="0 0 340 405"
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-label="Celo DeFi Liquidity Network"
        >
          <defs>
            <filter id="clm-soft"   x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4"   result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="clm-strong" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="9"   result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="clm-node"   x="-55%" y="-55%" width="210%" height="210%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="clm-path"   x="-20%" y="-150%" width="140%" height="400%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ════════════════════════════════════════
              IDLE → AGENT PATH
          ════════════════════════════════════════ */}
          <path
            d={IDLE_PATH}
            fill="none"
            stroke={isActive ? "#A3D977" : idlePathColor}
            strokeWidth={isActive ? 2 : 1.2}
            strokeDasharray={isActive ? undefined : "4 3"}
            filter={isActive ? "url(#clm-path)" : undefined}
            style={{ transition: "stroke 0.5s ease" }}
          />

          {/* ════════════════════════════════════════
              PROTOCOL PATHS (Vein Animation)
          ════════════════════════════════════════ */}
          {PROTOCOLS.map((p) => {
            const active = effectiveActiveIds.has(p.id);
            const cat    = CAT[p.category];
            
            return (
              <motion.path
                key={`path-${p.id}`}
                d={p.path}
                fill="none"
                stroke={active ? cat.stroke : idlePathColor}
                strokeWidth={active ? 2 : 0.9}
                strokeDasharray={active ? "4 4" : "3 3"}
                initial={false}
                animate={active ? {
                  strokeDashoffset: [0, -24],
                  strokeWidth: [2, 2.8, 2],
                  strokeOpacity: [0.8, 1, 0.8],
                } : {
                  strokeDashoffset: 0,
                  strokeWidth: 0.9,
                  strokeOpacity: 0.7
                }}
                transition={active ? {
                  strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" },
                  strokeWidth: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }, // Heartbeat rhythm
                  strokeOpacity: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                } : { duration: 0.4 }}
                style={{ filter: active ? "url(#clm-path)" : undefined }}
              />
            );
          })}

          {/* ════════════════════════════════════════
              PARTICLES — Idle → Agent
          ════════════════════════════════════════ */}
          {isRunning && (
            <Particles key={`idle-${runKey}`} path={IDLE_PATH} color="#A3D977" dur="1.45s" />
          )}

          {/* ════════════════════════════════════════
              PARTICLES — Agent → Protocols
          ════════════════════════════════════════ */}
          {isRunning &&
            PROTOCOLS.map((p) =>
              effectiveActiveIds.has(p.id) ? (
                <Particles
                  key={`pt-${p.id}-${runKey}`}
                  path={p.path}
                  color={CAT[p.category].particle}
                  dur={p.dur}
                />
              ) : null
            )}

          {/* ════════════════════════════════════════
              IDLE BALANCE NODE
          ════════════════════════════════════════ */}
          <g>
            {isActive && (
              <>
                <circle cx={IDLE.cx} cy={IDLE.cy} r="22" fill="none" stroke="#0D4B2E" strokeWidth="1">
                  <animate attributeName="r"       values="22;38;22" dur="2.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle cx={IDLE.cx} cy={IDLE.cy} r="19" fill="none" stroke="#A3D977" strokeWidth="0.6">
                  <animate attributeName="r"       values="19;30;19" dur="2.6s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0;0.2" dur="2.6s" begin="0.6s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            <circle
              cx={IDLE.cx} cy={IDLE.cy} r="17"
              fill="#0D4B2E"
              stroke={isActive ? "#A3D977" : "rgba(163,217,119,0.4)"}
              strokeWidth={isActive ? "1.8" : "1"}
              filter={isActive ? "url(#clm-soft)" : undefined}
              style={{ transition: "stroke 0.4s, filter 0.4s" }}
            />
            <text x={IDLE.cx} y={IDLE.cy + 5} textAnchor="middle"
              fill="#A3D977" fontSize="14" fontWeight="700" fontFamily="ui-monospace, monospace">
              $
            </text>
            {/* Labels */}
            <text x="5" y={IDLE.cy + 22}
              fill={isDark ? "#4A6A52" : "#718096"}
              fontSize="7" fontFamily="system-ui, sans-serif">
              Liquidity
            </text>
            <text x="5" y={IDLE.cy + 32}
              fill="#A3D977" fontSize="7" fontWeight="600"
              fontFamily="ui-monospace, monospace">
              ${sourceAmountUsd >= 100 ? Math.round(sourceAmountUsd) : sourceAmountUsd.toFixed(2)}
            </text>
          </g>

          {/* ════════════════════════════════════════
              AI AGENT HUB (center)
          ════════════════════════════════════════ */}
          <g>
            {/* Breathing orbit rings */}
            <circle cx={AI.cx} cy={AI.cy} r="36" fill="none" stroke="#A3D977" strokeWidth="1.2">
              <animate attributeName="r"
                values={isActive ? "36;56;36" : "34;48;34"}
                dur={isActive ? "2.4s" : "3.6s"}
                repeatCount="indefinite" />
              <animate attributeName="opacity"
                values={isActive ? "0.42;0;0.42" : "0.15;0;0.15"}
                dur={isActive ? "2.4s" : "3.6s"}
                repeatCount="indefinite" />
            </circle>
            <circle cx={AI.cx} cy={AI.cy} r="30" fill="none" stroke="#A3D977" strokeWidth="0.7">
              <animate attributeName="r"
                values={isActive ? "30;50;30" : "28;42;28"}
                dur={isActive ? "1.9s" : "2.9s"}
                begin="0.85s"
                repeatCount="indefinite" />
              <animate attributeName="opacity"
                values={isActive ? "0.28;0;0.28" : "0.10;0;0.10"}
                dur={isActive ? "1.9s" : "2.9s"}
                begin="0.85s"
                repeatCount="indefinite" />
            </circle>

            {/* Hub fill */}
            <circle
              cx={AI.cx} cy={AI.cy} r="26"
              fill="#0D4B2E"
              stroke="#A3D977"
              strokeWidth={isActive ? "2.5" : "1.5"}
              filter={isActive ? "url(#clm-strong)" : "url(#clm-soft)"}
              style={{ transition: "stroke-width 0.3s" }}
            />
            <text x={AI.cx} y={AI.cy - 2} textAnchor="middle"
              fill="#A3D977" fontSize="11" fontWeight="700"
              fontFamily="system-ui, sans-serif" letterSpacing="1.5">
              AI
            </text>
            <text x={AI.cx} y={AI.cy + 11} textAnchor="middle"
              fill="rgba(255,255,255,0.55)" fontSize="7.5" fontFamily="system-ui">
              Agent
            </text>

            {/* Status sub-label */}
            <text
              x={AI.cx} y={AI.cy + 48} textAnchor="middle"
              fill={isRunning ? "var(--success)" : isDone ? "#A3D977" : standbyTextFill}
              fontSize="8" fontFamily="system-ui"
              style={{ transition: "fill 0.4s" }}
            >
              {isRunning
                ? "routing funds..."
                : isDone
                ? "optimized ✓"
                : controlled && network?.canOptimize === false
                ? "connections stable"
                : "standby"}
            </text>
          </g>

          {/* ════════════════════════════════════════
              PROTOCOL NODES
          ════════════════════════════════════════ */}
          {PROTOCOLS.map((p) => {
            const isSelected = effectiveActiveIds.has(p.id);
            const isFocused = selectedProtocol?.id === p.id;
            const cat        = CAT[p.category];
            const nodeFill   = isSelected ? cat.fill : dimNodeFill;
            const nodeStroke = isSelected ? cat.stroke : dimNodeStroke;

            return (
              <g 
                key={p.id} 
                onClick={(e) => { e.stopPropagation(); if (isSelected) setSelectedProtocol(p); }}
                style={{ cursor: isSelected ? "pointer" : "default" }}
              >
                {/* Selection Halo */}
                {isFocused && (
                  <circle cx={p.cx} cy={p.cy} r={NODE_RADIUS + 8} fill="none" stroke={cat.stroke} strokeWidth="1.5" strokeDasharray="2 2">
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${p.cx} ${p.cy}`} to={`360 ${p.cx} ${p.cy}`} dur="4s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Done glow pulse ring */}
                {isSelected && isDone && !isFocused && (
                  <circle cx={p.cx} cy={p.cy} r="17" fill="none" stroke={cat.stroke} strokeWidth="1">
                    <animate attributeName="r"       values="17;28;17" dur="2.1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.1s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Running subtle pulse */}
                {isSelected && isRunning && (
                  <circle cx={p.cx} cy={p.cy} r="15" fill="none" stroke={cat.stroke} strokeWidth="0.8">
                    <animate attributeName="r"       values="15;22;15" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Main circle */}
                <circle
                  cx={p.cx} cy={p.cy} r={NODE_RADIUS}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={isSelected ? "1.8" : "1"}
                  filter={isSelected ? "url(#clm-node)" : undefined}
                  style={{ transition: "fill 0.5s ease, stroke 0.5s ease" }}
                />

                {/* Short abbreviation inside */}
                <text
                  x={p.cx} y={p.cy + 4} textAnchor="middle"
                  fill={isSelected ? cat.stroke : "rgba(255,255,255,0.28)"}
                  fontSize={p.short.length > 2 ? "6.5" : "8"}
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                  style={{ transition: "fill 0.5s" }}
                >
                  {p.short}
                </text>

                {/* Protocol logo image (fallback = short text above) */}
                {LOGO_MAP[p.id] && (
                  <>
                    <defs>
                      <clipPath id={`clip-${p.id}`}>
                        <circle cx={p.cx} cy={p.cy} r={NODE_RADIUS} />
                      </clipPath>
                    </defs>
                    <image
                      href={LOGO_MAP[p.id]}
                      x={p.cx - NODE_RADIUS}
                      y={p.cy - NODE_RADIUS}
                      width={NODE_DIAMETER}
                      height={NODE_DIAMETER}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#clip-${p.id})`}
                      opacity={isSelected ? 1 : 0.72}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </>
                )}

                {/* Protocol name label */}
                <text
                  x={p.cx} y={p.ly} textAnchor="middle"
                  fill={isSelected
                    ? (isDark ? "#D4EFC4" : "#1A2A1A")
                    : (isDark ? "#2E4A36" : "#9CA3AF")}
                  fontSize="7.5"
                  fontFamily="system-ui, sans-serif"
                  style={{ transition: "fill 0.5s" }}
                >
                  {p.label}
                </text>

                {/* APY — shown when this node is active */}
                <text
                  x={p.cx} y={p.ly + 10} textAnchor="middle"
                  fill={cat.stroke}
                  fontSize="7"
                  fontWeight="600"
                  fontFamily="ui-monospace, monospace"
                  opacity={isSelected && isActive ? 1 : 0}
                  style={{ transition: "opacity 0.4s" }}
                >
                  {controlledApyMap.get(p.id) || p.apy}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── CATEGORY LEGEND ────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 flex items-center justify-center gap-4 flex-wrap">
        {(Object.entries(CAT) as [string, typeof CAT[keyof typeof CAT]][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: val.stroke }} />
            <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* ── CTA BUTTON ─────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 relative z-10">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleOptimize}
          disabled={controlled ? remoteOptimizing || network?.canOptimize === false : phase !== "idle"}
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
          {isDone && !remoteOptimizing ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" style={{ color: "#A3D977" }} />
          )}
          <span className="text-sm font-semibold">
            {controlled
              ? remoteOptimizing
                ? `Routing ${effectiveActiveIds.size || 1} pools...`
                : isDone
                  ? `+$${effectiveCounter.toFixed(2)} Yield Captured`
                  : network?.ctaLabel || "Optimize Liquidity"
              : isDone
                ? `+$${effectiveCounter.toFixed(2)} Yield Captured`
                : isRunning
                  ? `Routing ${effectiveActiveIds.size} pools...`
                  : "Optimize Liquidity"}
          </span>
        </motion.button>
      </div>

      {/* ── DETAIL OVERLAY (Interactive Vein) ────────────────────────────── */}
      <AnimatePresence>
        {selectedProtocol && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-20 flex items-end justify-center pb-4 px-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setSelectedProtocol(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full rounded-2xl p-5"
              style={{
                background: "var(--surface-solid)",
                border: "1px solid var(--border-light)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: CAT[selectedProtocol.category].fill }}
                >
                  <img 
                    src={LOGO_MAP[selectedProtocol.id]} 
                    alt={selectedProtocol.label} 
                    className="w-8 h-8 rounded-full"
                    onError={(e) => { e.currentTarget.style.display = 'none' }} 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    {selectedProtocol.label}
                  </h3>
                  <p className="text-xs font-mono" style={{ color: CAT[selectedProtocol.category].stroke }}>
                    {selectedProtocol.apy} APY · {CAT[selectedProtocol.category].label}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedProtocol(null)}
                  className="ml-auto text-xs font-bold px-2 py-1 rounded hover:bg-white/10"
                  style={{ color: "var(--text-muted)" }}
                >
                  CLOSE
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.2)]">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Liquidity</p>
                  <p className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedProtocol.id === 'mento' ? '$55.20' : selectedProtocol.id === 'aave' ? '$32.10' : '$12.40'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.2)]">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Yield Earned</p>
                  <p className="font-mono text-lg font-bold" style={{ color: "#10B981" }}>
                    {selectedProtocol.id === 'mento' ? '+$0.42' : selectedProtocol.id === 'aave' ? '+$0.18' : '+$0.05'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // Simulation: Remove node from active set
                    if (selectedProtocol) {
                      const id = selectedProtocol.id;
                      if (!controlled) {
                        setActiveIds(prev => {
                          const next = new Set(prev);
                          next.delete(id);
                          return next;
                        });
                      }
                      setSelectedProtocol(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm border hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: "var(--border-light)", color: "var(--text-primary)" }}
                >
                  Withdraw
                </button>
                <button 
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: CAT[selectedProtocol.category].stroke }}
                >
                  Adjust Cap
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
