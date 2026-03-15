import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, TrendingUp, CheckCircle2, Plus, ChevronDown, ChevronUp,
  ExternalLink, Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const PROTOCOLS = [
  {
    id: "aave",
    name: "Aave v3",
    type: "Lending",
    apy: "4.8%",
    allocated: 820,
    pct: 66,
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    connected: true,
    risk: "Baixo",
    riskColor: "#A3D977",
    desc: "O maior protocolo de empréstimo DeFi. Seu capital gera rendimento emprestado a outros usuários com supercolateralização.",
    chain: "Celo Mainnet",
  },
  {
    id: "morpho",
    name: "Morpho (Mondo)",
    type: "Looping · stCELO",
    apy: "9.1%",
    allocated: 350,
    pct: 28,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    connected: true,
    risk: "Médio",
    riskColor: "#F59E0B",
    desc: "Looping de stCELO com alavancagem 2x gerenciada pelo agente. APY turbinado sem liquidações abruptas graças ao rebalance contínuo.",
    chain: "Celo Mainnet",
  },
  {
    id: "mento",
    name: "Mento V3",
    type: "Stable AMM · FX",
    apy: "3.8%",
    allocated: 70,
    pct: 6,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    connected: true,
    risk: "Muito Baixo",
    riskColor: "#A3D977",
    desc: "Liquidez nativa cUSD↔cBRL↔cEUR. Rota de conversão PIX com spread 40% menor que V2. Seu buffer de liquidez para saques rápidos.",
    chain: "Celo Mainnet",
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
    risk: "Baixo",
    riskColor: "#A3D977",
    desc: "AMM especializada em stablecoins com baixo impermanent loss. Disponível para ativação no perfil Balanceado+.",
    chain: "Celo Mainnet",
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
    risk: "Alto",
    riskColor: "#EF4444",
    desc: "Ativos do mundo real tokenizados. Empréstimos de PMEs LatAm com rendimento acima do mercado. Exclusivo perfil Arrojado.",
    chain: "Celo Mainnet",
  },
];

export function ProfileProtocolosPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<string | null>("aave");
  const totalAllocated = PROTOCOLS.filter((p) => p.connected).reduce((s, p) => s + p.allocated, 0);

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
          <h1 className="font-bold text-text-primary">Protocolos DeFi</h1>
          <p className="text-xs text-text-muted">
            {PROTOCOLS.filter((p) => p.connected).length} conectados · ${totalAllocated.toLocaleString("en-US")} alocados
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
            <p className="text-sm font-semibold text-text-primary">Alocação Ativa</p>
            <p className="text-xs font-mono font-bold" style={{ color: "#A3D977" }}>${totalAllocated.toLocaleString("en-US")}</p>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
            {PROTOCOLS.filter((p) => p.connected && p.pct > 0).map((p) => (
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
            {PROTOCOLS.filter((p) => p.connected && p.pct > 0).map((p) => (
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
          Todos os Protocolos
        </p>
        <div className="space-y-3">
          {PROTOCOLS.map((p, i) => (
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
                          { label: "Alocado", value: p.allocated > 0 ? `$${p.allocated}` : "Inativo" },
                          { label: "Participação", value: p.pct > 0 ? `${p.pct}%` : "—" },
                          { label: "Rede", value: p.chain, span: true },
                        ].map(({ label, value, span }) => (
                          <div
                            key={label}
                            className={`rounded-xl p-2.5 ${span ? "col-span-2" : ""}`}
                            style={{ background: "var(--muted)" }}
                          >
                            <p className="text-xs text-text-muted">{label}</p>
                            <p className="text-sm font-mono font-semibold text-text-primary mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {p.connected ? (
                          <button
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                            style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}
                          >
                            Desconectar
                          </button>
                        ) : (
                          <button
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                            style={{ background: "rgba(163,217,119,0.1)", color: "#A3D977", border: "1px solid rgba(163,217,119,0.25)" }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Ativar Protocolo
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
          Adicionar Protocolo Personalizado
        </button>
      </div>
    </div>
  );
}
