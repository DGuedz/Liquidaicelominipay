import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  Send,
  ArrowLeft,
  CheckCircle2,
  X,
  RotateCcw,
  TrendingUp,
  Zap,
  Shield,
  Sparkles,
  AlertTriangle,
  Mic,
  ChevronDown,
  ChevronUp,
  Activity,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = "agent" | "user";
type MessageType = "text" | "action" | "success" | "insight" | "thinking";

interface ActionData {
  id: string;
  title: string;
  amount: string;
  gain: string;
  risk: string;
  riskColor: string;
  protocol: string;
}

interface Message {
  id: number;
  role: MessageRole;
  type: MessageType;
  text: string;
  timestamp: string;
  reasoningSteps?: string[];
  showReasoning?: boolean;
  actionData?: ActionData;
  actionState?: "pending" | "authorized" | "dismissed";
}

// ─── Agent Scenarios ──────────────────────────────────────────────────────────

interface Scenario {
  thinkingTime: number;
  steps?: string[];
  text: string;
  type: MessageType;
  actionData?: ActionData;
}

const SCENARIOS: Record<string, Scenario> = {
  hoje: {
    thinkingTime: 2400,
    steps: [
      "Consultando log de atividades de hoje...",
      "Calculando yield acumulado...",
      "Verificando posições abertas nos protocolos...",
    ],
    text:
      "Hoje executei **3 operações automáticas** para maximizar seu capital:\n\n🔄 **03:00** — Rebalancei $350 para Aave v3 (4.8% APY)\n✨ **08:00** — Capturei +$0.45 em yield noturno\n🛡️ **11:15** — Proteção cambial aplicada (BRL caiu 1.2%)\n\nSeu patrimônio cresceu **+$0.72** hoje. Tudo automático, sem ação necessária da sua parte.",
    type: "text",
  },
  maximizar: {
    thinkingTime: 3000,
    steps: [
      "Analisando perfil de risco 'Balanceado'...",
      "Consultando yields em tempo real via Celo...",
      "Calculando impacto no APY e liquidez mínima...",
      "Avaliando risco de protocolo Moola...",
    ],
    text:
      "Encontrei **1 oportunidade** para aumentar seu rendimento com risco baixo. Preciso da sua autorização para executar:",
    type: "action",
    actionData: {
      id: "action-moola-1",
      title: "Realocar $90 → Moola Market",
      amount: "$90.00",
      gain: "+$0.43/mês vs atual",
      protocol: "Moola · Lending · Celo",
      risk: "Baixo",
      riskColor: "#10B981",
    },
  },
  performance: {
    thinkingTime: 1800,
    steps: ["Compilando métricas dos últimos 30 dias...", "Calculando retorno vs benchmark..."],
    text:
      "Sua performance nos **últimos 30 dias** 📈\n\n• Yield gerado: **+$8.15** (meta era $7.00)\n• APY médio: **4.8%** (benchmark DeFi: 3.1%)\n• Operações automáticas: **47**\n• Capital protegido vs inflação BRL: **$14.88**\n\nVocê está **+73% acima da meta mensal**. O modo Balanceado está performando muito bem.",
    type: "insight",
  },
  protecao: {
    thinkingTime: 1600,
    steps: ["Verificando exposição cambial...", "Monitorando BRL/USD em tempo real..."],
    text:
      "Proteção cambial **100% ativa** 🛡️\n\nSeu saldo em **cUSD** (dólar digital estável) elimina o risco de desvalorização do Real.\n\n📊 Esta semana: BRL caiu **1.2%**\n✅ Seu poder de compra: **intacto**\n💚 Equivalente protegido: **+$14.88 vs quem está em reais**\n\nVocê não perde dinheiro para inflação enquanto o agente trabalha.",
    type: "text",
  },
  saldo: {
    thinkingTime: 800,
    steps: ["Consultando carteira..."],
    text:
      "Seu saldo atual é **$1,240.50 cUSD** 💚\n\n📊 **Distribuição:**\n• $820.00 — Capital produtivo (gerando 4.8% APY)\n• $350.00 — Liquidez imediata (PIX/remessas)\n• $70.50 — Reserva emergencial\n\n⚡ Rendimento diário: **+$0.72/dia**\nMeta mensal: $7.00 | Atual: **$8.15 ✓**",
    type: "text",
  },
  pix: {
    thinkingTime: 1200,
    steps: ["Verificando liquidez disponível para pagamentos...", "Checando reserva do dia..."],
    text:
      "Sua liquidez imediata está em **$350.00** — pronta para qualquer pagamento ⚡\n\nPara um PIX ou transferência:\n1. Toque em **Enviar** na tela inicial\n2. Escolha o contato\n3. Digite o valor e confirme\n\nLiquidação em menos de **1 segundo** na rede Celo. Sem taxas para valores abaixo de $10.",
    type: "text",
  },
  default: {
    thinkingTime: 2000,
    steps: ["Processando sua mensagem...", "Consultando contexto financeiro..."],
    text:
      "Entendi sua mensagem! Sou o **LiquidAI Agent** — gerencio seu capital 24/7 de forma autônoma na rede Celo.\n\nPosso ajudar com:\n• **Otimização de rendimento** automática\n• **Proteção cambial** contra inflação\n• **Transferências e PIX** rápidos\n• **Relatórios** de performance\n\nO que você precisa?",
    type: "text",
  },
};

function detectScenario(text: string): Scenario {
  const lower = text.toLowerCase();
  if (lower.includes("hoje") || lower.includes("fez") || lower.includes("resumo") || lower.includes("atividade"))
    return SCENARIOS.hoje;
  if (lower.includes("maximizar") || lower.includes("yield") || lower.includes("rendimento") || lower.includes("oportunidade"))
    return SCENARIOS.maximizar;
  if (lower.includes("performance") || lower.includes("analytics") || lower.includes("resultado") || lower.includes("mês"))
    return SCENARIOS.performance;
  if (lower.includes("proteção") || lower.includes("cambial") || lower.includes("inflação") || lower.includes("real") || lower.includes("brl"))
    return SCENARIOS.protecao;
  if (lower.includes("saldo") || lower.includes("quanto") || lower.includes("carteira") || lower.includes("dinheiro"))
    return SCENARIOS.saldo;
  if (lower.includes("pix") || lower.includes("enviar") || lower.includes("transferir") || lower.includes("pagar"))
    return SCENARIOS.pix;
  return SCENARIOS.default;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 100;
function nextId() {
  return ++_idCounter;
}

function getTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Render markdown-style **bold** and newlines
function RenderText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/\*\*/).map((part, pi) =>
            pi % 2 === 1 ? (
              <strong key={pi} style={{ fontWeight: 700 }}>
                {part}
              </strong>
            ) : (
              <span key={pi}>{part}</span>
            )
          )}
        </span>
      ))}
    </>
  );
}

// ─── QUICK CHIPS ─────────────────────────────────────────────────────────────

const QUICK_CHIPS = [
  { label: "📊 Resumo de hoje", key: "hoje" },
  { label: "💰 Maximizar yield", key: "maximizar" },
  { label: "🛡️ Proteção cambial", key: "protecao" },
  { label: "📈 Minha performance", key: "performance" },
  { label: "💸 Fazer PIX", key: "pix" },
];

// ─── Thinking Indicator ───────────────────────────────────────────────────────

function ThinkingBubble({ step }: { step: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 mb-4"
    >
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(13,75,46,0.12)" }}
      >
        <Bot className="w-4.5 h-4.5" style={{ color: "#0D4B2E" }} />
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%]"
        style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#A3D977" }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2 }}
            className="text-xs italic"
            style={{ color: "var(--text-muted)" }}
          >
            {step}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Action Card (Inline Authorization) ───────────────────────────────────────

function ActionCard({
  data,
  state,
  onAuthorize,
  onDismiss,
}: {
  data: ActionData;
  state: "pending" | "authorized" | "dismissed";
  onAuthorize: () => void;
  onDismiss: () => void;
}) {
  if (state === "authorized") {
    return (
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        className="rounded-2xl p-3.5 flex items-center gap-3 mt-2"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
      >
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#10B981" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#10B981" }}>
            ✓ Autorizado! Executando...
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {data.title} — em andamento
          </p>
        </div>
      </motion.div>
    );
  }

  if (state === "dismissed") {
    return (
      <div
        className="rounded-xl px-3 py-2 mt-2 flex items-center gap-2"
        style={{ background: "var(--muted)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Ação ignorada. Você pode reativar mais tarde.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-3.5 mt-2"
      style={{
        background: "var(--surface-solid)",
        border: "1px solid rgba(245,158,11,0.3)",
        boxShadow: "0 2px 12px rgba(245,158,11,0.08)",
      }}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(245,158,11,0.1)" }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {data.title}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {data.protocol}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs font-bold" style={{ color: "#10B981" }}>
              {data.gain}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: `${data.riskColor}18`, color: data.riskColor }}
            >
              Risco {data.risk}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAuthorize}
          className="flex-1 py-2 rounded-xl text-xs font-bold"
          style={{ background: "#0D4B2E", color: "#A3D977" }}
        >
          ✓ Autorizar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDismiss}
          className="px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: "var(--muted)", color: "var(--text-muted)" }}
        >
          Ignorar
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onToggleReasoning,
  onAuthorize,
  onDismiss,
}: {
  msg: Message;
  onToggleReasoning: (id: number) => void;
  onAuthorize: (id: number) => void;
  onDismiss: (id: number) => void;
}) {
  const isAgent = msg.role === "agent";

  const bgMap: Record<MessageType, string> = {
    text: "var(--surface-solid)",
    action: "var(--surface-solid)",
    success: "rgba(16,185,129,0.1)",
    insight: "rgba(163,217,119,0.08)",
    thinking: "var(--surface-solid)",
  };

  if (msg.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-end justify-end gap-2 mb-4"
      >
        <div
          className="rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            boxShadow: "0 2px 10px rgba(13,75,46,0.25)",
          }}
        >
          <p className="text-sm text-white leading-relaxed">{msg.text}</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {msg.timestamp}
          </p>
        </div>
      </motion.div>
    );
  }

  // Agent message
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2.5 mb-4"
    >
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(13,75,46,0.1)" }}
      >
        <Bot className="w-4.5 h-4.5" style={{ color: "#0D4B2E" }} />
      </div>
      <div className="flex-1 max-w-[85%]">
        {/* Reasoning steps (if any) */}
        {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
          <div className="mb-1.5">
            <button
              onClick={() => onToggleReasoning(msg.id)}
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#A3D977" }}
              />
              {msg.showReasoning ? "Ocultar" : "Ver"} raciocínio do agente
              {msg.showReasoning ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            <AnimatePresence>
              {msg.showReasoning && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 pl-3 border-l-2" style={{ borderColor: "rgba(163,217,119,0.4)" }}>
                    {msg.reasoningSteps.map((step, i) => (
                      <p key={i} className="text-xs py-0.5" style={{ color: "var(--text-muted)" }}>
                        <span style={{ color: "#A3D977" }}>▸</span> {step}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Main bubble */}
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3"
          style={{
            background: bgMap[msg.type] || "var(--surface-solid)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            border:
              msg.type === "insight"
                ? "1px solid rgba(163,217,119,0.2)"
                : msg.type === "success"
                ? "1px solid rgba(16,185,129,0.2)"
                : "none",
          }}
        >
          {msg.type === "insight" && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#A3D977" }} />
              <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
                Insight do Agente
              </span>
            </div>
          )}
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
            <RenderText text={msg.text} />
          </p>
          {msg.actionData && (
            <ActionCard
              data={msg.actionData}
              state={msg.actionState || "pending"}
              onAuthorize={() => onAuthorize(msg.id)}
              onDismiss={() => onDismiss(msg.id)}
            />
          )}
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {msg.timestamp}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "agent",
    type: "text",
    text: "Olá, Alex! 👋 Sou o **LiquidAI Agent** — seu gestor financeiro autônomo na rede Celo.\n\nEnquanto você dormia, capturei **+$0.45 em yield** e mantive **$350 em liquidez** para seus pagamentos. Tudo certo!\n\nComo posso ajudar você hoje?",
    timestamp: "08:00",
    reasoningSteps: [],
  },
];

export function ChatPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("Analisando...");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        type: "text",
        text: text.trim(),
        timestamp: getTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsThinking(true);

      const scenario = detectScenario(text);
      const steps = scenario.steps || ["Processando..."];

      // Cycle through thinking steps
      let stepIdx = 0;
      setThinkingStep(steps[0]);
      const stepInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        setThinkingStep(steps[stepIdx]);
      }, Math.max(600, scenario.thinkingTime / steps.length));

      await new Promise((r) => setTimeout(r, scenario.thinkingTime));
      clearInterval(stepInterval);

      const agentMsg: Message = {
        id: nextId(),
        role: "agent",
        type: scenario.type,
        text: scenario.text,
        timestamp: getTime(),
        reasoningSteps: scenario.steps,
        showReasoning: false,
        actionData: scenario.actionData,
        actionState: scenario.actionData ? "pending" : undefined,
      };

      setIsThinking(false);
      setMessages((prev) => [...prev, agentMsg]);
    },
    [isThinking]
  );

  const handleChip = (key: string) => {
    const scenario = SCENARIOS[key] || SCENARIOS.default;
    sendMessage(QUICK_CHIPS.find((c) => c.key === key)?.label.replace(/^[^ ]+ /, "") || key);
  };

  const toggleReasoning = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showReasoning: !m.showReasoning } : m))
    );
  };

  const handleAuthorize = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, actionState: "authorized" as const } : m))
    );
    // Agent confirms execution after short delay
    setTimeout(() => {
      const confirmMsg: Message = {
        id: nextId(),
        role: "agent",
        type: "success",
        text: "✅ **Operação executada com sucesso!**\n\n$90 realocados para Moola Market (5.9% APY). Você vai ganhar +$0.43/mês adicionais.\n\nAtualização no log de atividade em instantes.",
        timestamp: getTime(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    }, 1200);
  };

  const handleDismiss = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, actionState: "dismissed" as const } : m))
    );
  };

  const handleSend = () => sendMessage(inputText);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-5 pt-14 pb-4"
        style={{
          borderBottom: "1px solid var(--border-light)",
          background: isDark ? "rgba(6,13,8,0.98)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </motion.button>

        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: "rgba(13,75,46,0.12)" }}
        >
          <Bot className="w-5 h-5" style={{ color: "#0D4B2E" }} />
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
            style={{ background: "#A3D977", border: "2px solid var(--background)" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            LiquidAI Agent
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#A3D977" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Online · Gerenciando $820 em 3 protocolos
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "rgba(163,217,119,0.12)", border: "1px solid rgba(163,217,119,0.25)" }}
        >
          <Activity className="w-3 h-3" style={{ color: "#A3D977" }} />
          <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
            4.8% APY
          </span>
        </div>
      </header>

      {/* ── MESSAGES ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: "160px" }}>
        {/* Contextual stats strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          {[
            { label: "Yield hoje", value: "+$0.72", color: "#A3D977", icon: Sparkles },
            { label: "Capital ativo", value: "$820", color: "var(--text-primary)", icon: DollarSign },
            { label: "Operações", value: "47", color: "#06B6D4", icon: RotateCcw },
          ].map(({ label, value, color, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl p-2.5 text-center"
              style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
            >
              <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color }} />
              <div className="font-mono text-sm font-bold" style={{ color }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onToggleReasoning={toggleReasoning}
              onAuthorize={handleAuthorize}
              onDismiss={handleDismiss}
            />
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {isThinking && <ThinkingBubble key="thinking" step={thinkingStep} />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT AREA ──────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 mx-auto"
        style={{
          maxWidth: 430,
          left: "50%",
          transform: "translateX(-50%)",
          background: isDark ? "rgba(6,13,8,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-light)",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
        }}
      >
        {/* Quick Chips */}
        <div className="px-4 pt-3 pb-2 overflow-x-auto flex gap-2 scrollbar-hide">
          {QUICK_CHIPS.map((chip) => (
            <motion.button
              key={chip.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => sendMessage(chip.label.replace(/^[^ ]+ /, ""))}
              disabled={isThinking}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{
                background: "var(--surface-solid)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                opacity: isThinking ? 0.5 : 1,
              }}
            >
              {chip.label}
            </motion.button>
          ))}
        </div>

        {/* Text Input */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{
              background: "var(--surface-solid)",
              border: "1.5px solid var(--border)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte ao agente..."
              disabled={isThinking}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            {inputText === "" && (
              <Mic className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                inputText.trim() && !isThinking
                  ? "linear-gradient(135deg, #0D4B2E, #1a6b45)"
                  : "var(--muted)",
              boxShadow:
                inputText.trim() && !isThinking ? "0 2px 12px rgba(13,75,46,0.3)" : "none",
              transition: "background 0.2s ease",
            }}
          >
            <Send
              className="w-4.5 h-4.5"
              style={{
                color: inputText.trim() && !isThinking ? "#A3D977" : "var(--text-muted)",
              }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
