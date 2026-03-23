import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, TrendingUp, CheckCircle2, Plus, ChevronDown, ChevronUp,
  ExternalLink, Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { apiGet, DashboardPayload } from "../lib/api";

const PROTOCOLS = [
  {
    id: "aave",
    name: "Aave v3",
    type: "Lending",
    apy: "4.8%",
    allocated: 0,
    pct: 0,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    connected: false,
    risk: "Low",
    riskColor: "#A3D977",
    desc: "The largest DeFi lending protocol. Your capital generates yield by lending to other users with overcollateralization.",
    chain: "Waiting sync",
  },
  {
    id: "morpho",
    name: "Morpho (Mondo)",
    type: "Looping · stCELO",
    apy: "9.1%",
    allocated: 0,
    pct: 0,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    connected: false,
    risk: "Medium",
    riskColor: "#F59E0B",
    desc: "stCELO looping with 2x leverage managed by agent. Boosted APY without abrupt liquidations thanks to continuous rebalancing.",
    chain: "Waiting sync",
  },
  {
    id: "mento",
    name: "Mento V3",
    type: "Stable AMM · FX",
    apy: "3.8%",
    allocated: 0,
    pct: 0,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    connected: false,
    risk: "Very Low",
    riskColor: "#A3D977",
    desc: "Native liquidity USDm↔BRLm↔EURm. PIX conversion route optimized for low slippage and fast withdrawals.",
    chain: "Waiting sync",
  },
  {
    id: "curve",
    name: "Curve Finance",
    type: "Stable AMM",
    apy: "5.2%",
    allocated: 0,
    pct: 0,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    connected: false,
    risk: "Low",
    riskColor: "#A3D977",
    desc: "AMM specialized in stablecoins with low impermanent loss. Available for activation in Balanced+ profile.",
    chain: "Waiting sync",
  },
  {
    id: "untangled",
    name: "Untangled · RWA",
    type: "Real World Assets",
    apy: "11.4%",
    allocated: 0,
    pct: 0,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    connected: false,
    risk: "High",
    riskColor: "#EF4444",
    desc: "Tokenized real-world assets. LatAm SME loans with above-market yield. Exclusive to Aggressive profile.",
    chain: "Waiting sync",
  },
];

const PROTOCOL_META = Object.fromEntries(PROTOCOLS.map((protocol) => [protocol.id, protocol]));

export function ProfileProtocolosPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { address } = useCeloWallet();
  const [expanded, setExpanded] = useState<string | null>("aave");
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    let alive = true;
    if (!address) {
      setDashboard(null);
      return () => {
        alive = false;
      };
    }

    apiGet<DashboardPayload>("/api/dashboard", { address, riskMode: "balanced" })
      .then((payload) => {
        if (!alive) return;
        setDashboard(payload);
      })
      .catch(() => {
        if (!alive) return;
        setDashboard(null);
      });

    return () => {
      alive = false;
    };
  }, [address]);

  const displayProtocols = useMemo(() => {
    const connections = dashboard?.liquidityNetwork.connections || [];
    const activeIds = new Set(connections.map((connection) => connection.id));

    return PROTOCOLS.map((protocol) => {
      const live = connections.find((connection) => connection.id === protocol.id);
      return {
        ...protocol,
        apy: live ? `${live.apyValue.toFixed(2)}%` : protocol.apy,
        allocated: live ? live.amountUsd : 0,
        pct: live ? Math.round(live.pct) : 0,
        connected: activeIds.has(protocol.id),
        chain: live?.source?.includes("onchain") ? "On-chain" : protocol.chain,
      };
    });
  }, [dashboard]);

  const totalAllocated = displayProtocols.filter((p) => p.connected).reduce((s, p) => s + p.allocated, 0);

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
          <h1 className="font-bold text-text-primary">DeFi Protocols</h1>
          <p className="text-xs text-text-muted">
            {displayProtocols.filter((p) => p.connected).length} connected · ${totalAllocated.toFixed(2)} allocated
          </p>
        </div>
      </header>

      {/* Active allocation bar */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Active Allocation</p>
            <p className="text-xs font-mono font-bold" style={{ color: "#A3D977" }}>${totalAllocated.toFixed(2)}</p>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
            {displayProtocols.filter((p) => p.connected && p.pct > 0).map((p) => (
              <motion.div
                key={p.id}
                initial={{ width: 0 }}
                animate={{ width: `${p.pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ background: p.color }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {displayProtocols.filter((p) => p.connected && p.pct > 0).map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-xs text-text-muted">{p.name} {p.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Protocol list */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          All Protocols
        </p>
        <div className="space-y-3">
          {displayProtocols.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-surface-solid rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: p.connected ? `1px solid ${p.color}30` : "1px solid var(--border-light)",
                opacity: p.connected ? 1 : 0.7,
              }}
            >
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: p.bg }}>
                  <span style={{ color: p.color, fontWeight: 700, fontSize: 12 }}>
                    {p.name.slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    {p.connected && (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted">{p.type}</span>
                    <span className="text-xs font-semibold" style={{ color: p.riskColor }}>
                      · {p.risk}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="font-mono font-bold text-sm" style={{ color: p.color }}>{p.apy}</p>
                  <p className="text-xs text-text-muted">APY</p>
                </div>
                {expanded === p.id
                  ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
              </button>

              <AnimatePresence>
                {expanded === p.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs text-text-secondary leading-relaxed mb-3">{p.desc}</p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { label: "Allocated", value: p.allocated > 0 ? `$${p.allocated}` : "Inactive" },
                          { label: "Share", value: p.pct > 0 ? `${p.pct}%` : "—" },
                          { label: "Network", value: p.chain, span: true },
                        ].map(({ label, value, span }) => (
                          <div
                            key={label}
                            className={`rounded-xl p-2.5 ${span ? "col-span-2" : ""}`}
                            style={{ background: "var(--muted)" }}
                          >
                            <p className="text-xs text-text-muted">{label}</p>
                            <p className="text-sm font-mono font-semibold text-text-primary mt-0.5">{typeof value === "number" ? value.toFixed(2) : value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {p.connected ? (
                          <button
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                            style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                            style={{ background: "rgba(163,217,119,0.1)", color: "#A3D977", border: "1px solid rgba(163,217,119,0.25)" }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Activate Protocol
                          </button>
                        )}
                        <a
                          href="#"
                          className="w-10 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--muted)" }}
                        >
                          <ExternalLink className="w-4 h-4 text-text-muted" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add custom */}
      <div className="px-5">
        <button
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ background: "var(--surface-solid)", border: "1.5px dashed rgba(163,217,119,0.35)", color: "#A3D977" }}
        >
          <Plus className="w-4 h-4" />
          Add Custom Protocol
        </button>
      </div>
    </div>
  );
}
