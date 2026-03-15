import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, Shield, Fingerprint, Key, Smartphone, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Lock, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

function Toggle({
  enabled,
  onToggle,
  color = "#A3D977",
}: {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 flex-shrink-0"
      style={{ background: enabled ? color : "var(--muted)", justifyContent: enabled ? "flex-end" : "flex-start" }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

export function ProfileSegurancaPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [agentLimit, setAgentLimit] = useState(true);
  const [showSeed, setShowSeed] = useState(false);

  const securityScore = [biometric, twoFA, agentLimit].filter(Boolean).length;
  const scoreColor = securityScore === 3 ? "#A3D977" : securityScore === 2 ? "#F59E0B" : "#EF4444";
  const scoreLabel = securityScore === 3 ? "Excelente" : securityScore === 2 ? "Bom" : "Fraco";

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
          <h1 className="font-bold text-text-primary">Segurança & Privacidade</h1>
          <p className="text-xs text-text-muted">Proteja seu Treasury OS</p>
        </div>
      </header>

      {/* Security Score */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{
            background: `linear-gradient(135deg, ${scoreColor}18, ${scoreColor}08)`,
            border: `1px solid ${scoreColor}30`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${scoreColor}20` }}
            >
              <Shield className="w-7 h-7" style={{ color: scoreColor }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-muted mb-1">Nível de Segurança</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-mono font-bold" style={{ color: scoreColor }}>
                  {securityScore}/3
                </p>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${scoreColor}20`, color: scoreColor }}
                >
                  {scoreLabel}
                </span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-500"
                    style={{ background: i < securityScore ? scoreColor : "var(--muted)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auth options */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Autenticação
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {[
            {
              Icon: Fingerprint,
              label: "Biometria / Face ID",
              sub: "Desbloqueio rápido e seguro",
              color: "#A3D977",
              bg: "rgba(163,217,119,0.1)",
              state: biometric,
              toggle: () => setBiometric((v) => !v),
            },
            {
              Icon: Smartphone,
              label: "Autenticação 2FA",
              sub: "App autenticador (TOTP)",
              color: "#3B82F6",
              bg: "rgba(59,130,246,0.1)",
              state: twoFA,
              toggle: () => setTwoFA((v) => !v),
            },
          ].map(({ Icon, label, sub, color, bg, state, toggle }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{sub}</p>
              </div>
              <Toggle enabled={state} onToggle={toggle} color={color} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Agent security */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Segurança do Agente IA
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Lock className="w-4.5 h-4.5" style={{ color: "#F59E0B" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Limite por transação</p>
              <p className="text-xs text-text-muted mt-0.5">Agente não pode mover mais que $50/tx sem 2FA</p>
            </div>
            <Toggle enabled={agentLimit} onToggle={() => setAgentLimit((v) => !v)} color="#F59E0B" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.1)" }}>
              <Eye className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Ocultar saldo</p>
              <p className="text-xs text-text-muted mt-0.5">Esconde valores em toda a interface</p>
            </div>
            <Toggle enabled={hideBalance} onToggle={() => setHideBalance((v) => !v)} color="#8B5CF6" />
          </div>
        </div>
      </div>

      {/* Phrase / Key */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Chave de Recuperação
        </p>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4"
          style={{
            background: "var(--surface-solid)",
            border: "1px solid rgba(239,68,68,0.15)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
              <Key className="w-4.5 h-4.5" style={{ color: "#EF4444" }} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Seed Phrase</p>
              <p className="text-xs text-text-muted">12 palavras · MiniPay / Celo</p>
            </div>
          </div>

          {showSeed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-xl mb-3 grid grid-cols-3 gap-2"
              style={{ background: "var(--muted)" }}
            >
              {["turtle", "lens", "voyage", "oracle", "flame", "dusk", "river", "token", "vault", "chain", "mist", "dawn"].map((word, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xs text-text-muted">{i + 1}.</span>
                  <span className="text-xs font-mono font-semibold text-text-primary">{word}</span>
                </div>
              ))}
            </motion.div>
          ) : (
            <div
              className="p-3 rounded-xl mb-3 flex items-center gap-2"
              style={{ background: "var(--muted)" }}
            >
              <EyeOff className="w-4 h-4 text-text-muted flex-shrink-0" />
              <p className="text-xs text-text-muted">•••• •••• •••• •••• •••• ••••</p>
            </div>
          )}

          <div className="flex items-start gap-2 mb-3 p-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.06)" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: "#EF4444" }}>
              Nunca compartilhe sua seed phrase. Nenhuma pessoa da LiquidAI irá pedi-la.
            </p>
          </div>

          <button
            onClick={() => setShowSeed((v) => !v)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: showSeed ? "rgba(239,68,68,0.08)" : "rgba(163,217,119,0.1)",
              color: showSeed ? "#EF4444" : "#A3D977",
              border: `1px solid ${showSeed ? "rgba(239,68,68,0.2)" : "rgba(163,217,119,0.2)"}`,
            }}
          >
            {showSeed ? "Ocultar Seed Phrase" : "Revelar Seed Phrase"}
          </button>
        </motion.div>
      </div>

      {/* Activity */}
      <div className="px-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Atividade Recente de Login
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {[
            { device: "Chrome · Brasil", time: "Agora · São Paulo", ok: true },
            { device: "MiniPay · Android", time: "Ontem 14:30 · São Paulo", ok: true },
            { device: "Safari · iOS", time: "12 Mar 09:00 · Brasil", ok: true },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#A3D977" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{s.device}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.time}</p>
              </div>
              {i === 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977", fontSize: "9px" }}
                >
                  Atual
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
