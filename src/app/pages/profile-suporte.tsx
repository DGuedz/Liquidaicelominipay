import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, HelpCircle, MessageSquare, ChevronDown, ChevronUp,
  Send, ExternalLink, Zap, Shield, DollarSign, RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const FAQS = [
  {
    q: "Como o agente move meu dinheiro sem permissão?",
    a: "O agente opera dentro dos limites que você definiu (perfil de risco + limite por transação). Ele nunca saca para carteiras externas — apenas realoca entre protocolos DeFi autorizados dentro do vault.",
    icon: Shield,
    color: "#3B82F6",
  },
  {
    q: "O que acontece se um protocolo DeFi for hackeado?",
    a: "O agente monitora alertas de segurança 24/7 e sai automaticamente de protocolos sinalizados. Usamos apenas protocolos auditados. Seu capital nunca fica concentrado em um único protocolo — diversificação é automática.",
    icon: HelpCircle,
    color: "#EF4444",
  },
  {
    q: "Quando o yield é creditado na minha conta?",
    a: "O yield é acumulado continuamente (por bloco). O agente consolida e exibe diariamente às 08:00. Você pode sacar yield acumulado a qualquer momento sem afetar o principal.",
    icon: DollarSign,
    color: "#A3D977",
  },
  {
    q: "Como funciona o PIX com cUSD?",
    a: "Via Mento V3: cUSD → cBRL (conversão na rede Celo) → Transfero/Bipa converte para BRL e envia via PIX. O processo leva de 30 segundos a 2 minutos. Taxa total: ~0.5% vs ~1.5% de câmbio tradicional.",
    icon: RotateCcw,
    color: "#10B981",
  },
  {
    q: "Meu dinheiro é meu? E se a LiquidAI fechar?",
    a: "100% sim. Seus fundos estão em protocolos DeFi descentralizados — a LiquidAI é apenas a interface de gerenciamento. Você pode acessar seus fundos diretamente via MiniPay ou qualquer carteira Celo mesmo sem o app.",
    icon: Zap,
    color: "#8B5CF6",
  },
];

const QUICK_LINKS = [
  { label: "Documentação Técnica", url: "#" },
  { label: "Auditorias de Segurança", url: "#" },
  { label: "Status do Sistema", url: "#" },
  { label: "Discord · Comunidade", url: "#" },
];

export function ProfileSuportePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  };

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
          <h1 className="font-bold text-text-primary">Suporte</h1>
          <p className="text-xs text-text-muted">Central de Ajuda · LiquidAI</p>
        </div>
      </header>

      {/* Status bar */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(163,217,119,0.08)", border: "1px solid rgba(163,217,119,0.18)" }}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#A3D977" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#A3D977" }}>Todos os sistemas operacionais</p>
            <p className="text-xs text-text-muted mt-0.5">Agente online · Protocols OK · PIX Online</p>
          </div>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Perguntas Frequentes
        </p>
        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const Icon = faq.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-surface-solid rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${faq.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: faq.color }} />
                  </div>
                  <p className="flex-1 text-sm font-medium text-text-primary leading-snug">{faq.q}</p>
                  {expanded === i
                    ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderTop: "1px solid var(--border-light)" }}
                    >
                      <p className="px-4 py-3 text-xs text-text-secondary leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Links Rápidos
        </p>
        <div className="bg-surface-solid rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {QUICK_LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.url}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < QUICK_LINKS.length - 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <ExternalLink className="w-4 h-4 text-text-muted flex-shrink-0" />
              <p className="flex-1 text-sm font-medium text-text-primary">{l.label}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Enviar Mensagem
        </p>
        <div
          className="bg-surface-solid rounded-2xl p-4"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(163,217,119,0.12)" }}>
                <Send className="w-6 h-6" style={{ color: "#A3D977" }} />
              </div>
              <p className="font-semibold text-text-primary">Mensagem enviada!</p>
              <p className="text-xs text-text-muted mt-1">Resposta em até 24h úteis</p>
            </motion.div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva seu problema ou dúvida..."
                rows={4}
                className="w-full text-sm rounded-xl px-3 py-3 outline-none resize-none mb-3"
                style={{
                  background: "var(--muted)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                }}
              />
              <button
                onClick={handleSend}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: message.trim() ? "#0D4B2E" : "var(--muted)",
                  color: message.trim() ? "#fff" : "var(--text-muted)",
                  boxShadow: message.trim() ? "0 4px 16px rgba(13,75,46,0.25)" : "none",
                }}
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
