import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Copy, CheckCircle2, Edit2, Camera,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const WALLET = "0x4aF3...D9c2";
const FULL_WALLET = "0x4aF3b9d2E1c8A7f6B0e5D9c2";

export function ProfileDadosPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_WALLET).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields = [
    { label: "Nome completo", value: "Alex Johnson", icon: User, editable: true },
    { label: "E-mail", value: "alex@liquidai.io", icon: Mail, editable: true },
    { label: "Telefone", value: "+55 11 99999-0000", icon: Phone, editable: true },
    { label: "País", value: "Brasil", icon: MapPin, editable: true },
  ];

  return (
    <div className="min-h-dvh bg-background pb-12">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 className="font-bold text-text-primary">Dados Pessoais</h1>
          <p className="text-xs text-text-muted">Suas informações de conta</p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: editing ? "rgba(163,217,119,0.15)" : "var(--surface-solid)",
            border: editing ? "1px solid #A3D977" : "1px solid var(--border-light)",
          }}
        >
          <Edit2 className="w-4 h-4" style={{ color: editing ? "#A3D977" : "var(--text-muted)" }} />
        </button>
      </header>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6 px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-3"
        >
          <div
            className="w-24 h-24 rounded-3xl overflow-hidden"
            style={{ border: "3px solid #A3D977" }}
          >
            <img
              src="https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=200&h=200&fit=crop&crop=face"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          {editing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#A3D977", border: "2px solid var(--background)" }}
            >
              <Camera className="w-4 h-4" style={{ color: "#0D4B2E" }} />
            </motion.button>
          )}
        </motion.div>
        <p className="font-bold text-text-primary">Alex Johnson</p>
        <p className="text-xs text-text-muted">Membro desde Jan 2026</p>
        <div
          className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977" }}
        >
          ✦ Premium · 127 dias ativo
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Informações Pessoais
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {fields.map(({ label, value, icon: Icon, editable }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < fields.length - 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(13,75,46,0.08)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#0D4B2E" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted">{label}</p>
                {editing && editable ? (
                  <input
                    defaultValue={value}
                    className="text-sm font-medium w-full bg-transparent outline-none mt-0.5"
                    style={{
                      color: "var(--text-primary)",
                      borderBottom: "1px solid #A3D977",
                    }}
                  />
                ) : (
                  <p className="text-sm font-medium text-text-primary mt-0.5">{value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Wallet Address */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Carteira MiniPay · Celo
        </p>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl px-4 py-4 flex items-center gap-3"
          style={{
            background: "var(--surface-solid)",
            border: "1px solid rgba(163,217,119,0.2)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(13,75,46,0.1)" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#0D4B2E" }}
            >
              <span style={{ color: "#A3D977", fontSize: 9, fontWeight: 700 }}>$</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted">Endereço Celo (cUSD)</p>
            <p
              className="text-sm font-mono font-semibold mt-0.5 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {WALLET}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: copied ? "rgba(163,217,119,0.15)" : "var(--muted)" }}
          >
            {copied
              ? <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
              : <Copy className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
          </button>
        </motion.div>
      </div>

      {/* Save button */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5"
        >
          <button
            onClick={() => setEditing(false)}
            className="w-full py-4 rounded-2xl font-semibold text-sm"
            style={{ background: "#0D4B2E", color: "#fff", boxShadow: "0 4px 20px rgba(13,75,46,0.3)" }}
          >
            Salvar Alterações
          </button>
        </motion.div>
      )}
    </div>
  );
}
