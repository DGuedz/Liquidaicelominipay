import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, CheckCircle2, Plus, Trash2, ExternalLink, Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const WALLETS = [
  {
    id: 1,
    name: "MiniPay Principal",
    address: "0x4aF3b9d2E1c8A7f6B0e5D9c2",
    short: "0x4aF3...D9c2",
    balance: "$1,240.50",
    network: "Celo",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    active: true,
    type: "MiniPay",
  },
  {
    id: 2,
    name: "MetaMask Backup",
    address: "0x9Bc2e7aF1D3c6E8f4B5a0C7d",
    short: "0x9Bc2...C7d",
    balance: "$0.00",
    network: "Celo",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    active: false,
    type: "MetaMask",
  },
];

export function ProfileCarteirasPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<number | null>(1);
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (id: number, addr: string) => {
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 className="font-bold text-text-primary">Carteiras Conectadas</h1>
          <p className="text-xs text-text-muted">{WALLETS.length} carteiras · Rede Celo</p>
        </div>
      </header>

      <div className="px-5 mb-4">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "linear-gradient(135deg, #0D4B2E, #1a6b45)",
            boxShadow: "0 4px 20px rgba(13,75,46,0.25)",
          }}
        >
          <p className="text-xs text-white/50 mb-1">Saldo Total Consolidado</p>
          <p className="text-3xl font-mono font-bold text-white">$1,240.50</p>
          <p className="text-xs mt-1" style={{ color: "#A3D977" }}>+4.8% APY · Agente Ativo ✓</p>
        </motion.div>

        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Minhas Carteiras
        </p>

        <div className="space-y-3">
          {WALLETS.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface-solid rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: w.active ? "1px solid rgba(163,217,119,0.25)" : "1px solid transparent" }}
            >
              <button
                onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: w.bg }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: w.color }}
                  >
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>$</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{w.name}</p>
                    {w.active && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977", fontSize: "9px" }}
                      >
                        Ativa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">{w.short}</p>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>{w.balance}</p>
                  <p className="text-xs text-text-muted">{w.network}</p>
                </div>
                {expanded === w.id
                  ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
              </button>

              <AnimatePresence>
                {expanded === w.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs text-text-muted mb-1">Endereço completo</p>
                      <div
                        className="flex items-center gap-2 p-2.5 rounded-xl"
                        style={{ background: "var(--muted)" }}
                      >
                        <p className="text-xs font-mono flex-1 text-text-secondary truncate">{w.address}</p>
                        <button onClick={() => handleCopy(w.id, w.address)} className="flex-shrink-0">
                          {copied === w.id
                            ? <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
                            : <Copy className="w-4 h-4 text-text-muted" />}
                        </button>
                        <a
                          href={`https://celoscan.io/address/${w.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4 text-text-muted" />
                        </a>
                      </div>
                      {!w.active && (
                        <button
                          className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold"
                          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
                          Remover carteira
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add wallet */}
      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{
            background: "var(--surface-solid)",
            border: "1.5px dashed rgba(163,217,119,0.35)",
            color: "#A3D977",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Plus className="w-4 h-4" />
          Conectar Nova Carteira
        </motion.button>
        <p className="text-center text-xs text-text-muted mt-3">
          Compatible com MiniPay, MetaMask e qualquer carteira WalletConnect
        </p>
      </div>
    </div>
  );
}
