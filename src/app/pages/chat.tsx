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
import { apiGet, apiPost, ChatReplyPayload, DashboardPayload, getApiAuthToken } from "../lib/api";
import { CELO_CHAIN_ID } from "../lib/celo-wallet";
import { ensureWalletAuthSession } from "../lib/wallet-auth";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { toast } from "sonner";

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
      "Resumo do dia pronto. Se o backend estiver disponível, vou priorizar os eventos reais da sua carteira e o rendimento estimado com base no capital atual.",
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
      id: "action-rebalance-1",
      title: "Realocar uma parte do capital produtivo",
      amount: "Valor calculado no backend",
      gain: "Ganho estimado após leitura on-chain",
      protocol: "Protocolo sugerido · Celo",
      risk: "Baixo",
      riskColor: "#10B981",
    },
  },
  performance: {
    thinkingTime: 1800,
    steps: ["Compilando métricas dos últimos 30 dias...", "Calculando retorno vs benchmark..."],
    text:
      "Vou consolidar performance usando apenas o histórico real já registrado para esta wallet.",
    type: "insight",
  },
  protecao: {
    thinkingTime: 1600,
    steps: ["Verificando exposição cambial...", "Monitorando BRL/USD em tempo real..."],
    text:
      "Proteção cambial ativa. Vou avaliar sua exposição atual e a parcela do saldo já preservada em stablecoins antes de sugerir qualquer ação.",
    type: "text",
  },
  saldo: {
    thinkingTime: 800,
    steps: ["Consultando carteira..."],
    text:
      "Vou ler o saldo real da carteira e dividir entre capital produtivo, liquidez imediata e projeção de yield com base no estado atual.",
    type: "text",
  },
  pix: {
    thinkingTime: 1200,
    steps: ["Verificando liquidez disponível para pagamentos...", "Checando reserva do dia..."],
    text:
      "Vou verificar a liquidez imediata real da wallet antes de orientar um pagamento. O fluxo continua o mesmo: Enviar → selecionar destino → confirmar valor.",
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
  disabled,
}: {
  data: ActionData;
  state: "pending" | "authorized" | "dismissed";
  onAuthorize: () => void;
  onDismiss: () => void;
  disabled?: boolean;
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
          disabled={disabled}
          className="flex-1 py-2 rounded-xl text-xs font-bold"
          style={{
            background: disabled ? "var(--muted)" : "#0D4B2E",
            color: disabled ? "var(--text-muted)" : "#A3D977",
            opacity: disabled ? 0.7 : 1,
          }}
        >
          ✓ Autorizar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDismiss}
          disabled={disabled}
          className="px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: "var(--muted)", color: "var(--text-muted)", opacity: disabled ? 0.6 : 1 }}
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
  actionsDisabled,
}: {
  msg: Message;
  onToggleReasoning: (id: number) => void;
  onAuthorize: (id: number) => void;
  onDismiss: (id: number) => void;
  actionsDisabled?: boolean;
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
              disabled={actionsDisabled}
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
    text: "Olá. Sou o **LiquidAI Agent**.\n\nAssim que a wallet estiver pronta em Celo Sepolia, vou responder usando apenas o saldo, a liquidez e o rendimento reais desta conta.\n\nComo posso ajudar?",
    timestamp: "08:00",
    reasoningSteps: [],
  },
];

export function ChatPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const {
    address,
    isConnected,
    hasConnector,
    wrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectWallet,
    switchToCelo,
    signWalletMessage,
  } = useCeloWallet();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("Analisando...");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sessionReady, setSessionReady] = useState(() => Boolean(getApiAuthToken()));
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const canUseProtectedFlow = isConnected && !wrongNetwork && sessionReady;
  const activeCapital = dashboard?.summary.managedCapitalUsd ?? 0;
  const activeApy = dashboard?.summary.apy ?? 0;
  const activeYieldToday = (dashboard?.summary.monthlyYieldUsd ?? 0) / 30;

  useEffect(() => {
    const syncSessionState = () => {
      setSessionReady(Boolean(getApiAuthToken()));
    };

    syncSessionState();
    window.addEventListener("focus", syncSessionState);
    window.addEventListener("storage", syncSessionState);

    return () => {
      window.removeEventListener("focus", syncSessionState);
      window.removeEventListener("storage", syncSessionState);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!address) {
      setDashboard(null);
      return () => {
        active = false;
      };
    }

    apiGet<DashboardPayload>("/api/dashboard", { address, riskMode: "balanced" })
      .then((payload) => {
        if (!active) return;
        setDashboard(payload);
      })
      .catch(() => {
        if (!active) return;
        setDashboard(null);
      });

    return () => {
      active = false;
    };
  }, [address]);

  useEffect(() => {
    if (!dashboard) return;
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].id !== 1) return prev;
      return [
        {
          ...prev[0],
          text: `Hello. I am **LiquidAI Agent**.\n\nMonitored balance: **$${dashboard.summary.balanceUsd.toFixed(2)}**.\nProductive capital: **$${dashboard.summary.managedCapitalUsd.toFixed(2)}**.\nImmediate liquidity: **$${dashboard.summary.liquidityBufferUsd.toFixed(2)}**.\n\nHow can I help you?`,
        },
      ];
    });
  }, [dashboard]);

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
      if (!canUseProtectedFlow) {
        toast.error("Prepare wallet session on Celo Sepolia before chatting with the agent.");
        return;
      }

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

      const fallbackScenario = detectScenario(text);
      const steps = fallbackScenario.steps || ["Processando..."];

      // Cycle through thinking steps
      let stepIdx = 0;
      setThinkingStep(steps[0]);
      const stepInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        setThinkingStep(steps[stepIdx]);
      }, Math.max(600, fallbackScenario.thinkingTime / steps.length));

      let remoteReply: ChatReplyPayload | null = null;
      try {
        remoteReply = await apiPost<ChatReplyPayload>("/api/chat", {
          address: address || "",
          message: text.trim(),
          riskMode: "balanced",
        });
      } catch {
        remoteReply = null;
      }

      await new Promise((r) => setTimeout(r, Math.max(900, fallbackScenario.thinkingTime * 0.45)));
      clearInterval(stepInterval);

      const replyType = remoteReply?.type || fallbackScenario.type;
      const replyText = remoteReply?.text || fallbackScenario.text;
      const replySteps = remoteReply?.thinkingSteps || fallbackScenario.steps;
      const replyAction = remoteReply?.actionData || fallbackScenario.actionData;

      const agentMsg: Message = {
        id: nextId(),
        role: "agent",
        type: replyType,
        text: replyText,
        timestamp: getTime(),
        reasoningSteps: replySteps,
        showReasoning: false,
        actionData: replyAction,
        actionState: replyAction ? "pending" : undefined,
      };

      setIsThinking(false);
      setMessages((prev) => [...prev, agentMsg]);
    },
    [address, canUseProtectedFlow, isThinking]
  );

  const handleChip = (key: string) => {
    sendMessage(QUICK_CHIPS.find((c) => c.key === key)?.label.replace(/^[^ ]+ /, "") || key);
  };

  const toggleReasoning = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showReasoning: !m.showReasoning } : m))
    );
  };

  const handlePrepareWallet = async () => {
    if (!hasConnector) {
      toast.error("No wallet detected. Open the app in MiniPay or MetaMask.");
      return;
    }

    try {
      let connectedAddress = address;

      if (!isConnected) {
        const session = await connectWallet();
        connectedAddress = session.accounts?.[0] || "";
        if (session.chainId !== CELO_CHAIN_ID) {
          await switchToCelo();
        }
      } else if (wrongNetwork) {
        await switchToCelo();
      }

      const walletAddress = connectedAddress || address;
      if (!walletAddress) {
        throw new Error("Wallet address unavailable after connection.");
      }

      await ensureWalletAuthSession(walletAddress, signWalletMessage);
      setSessionReady(true);
      toast.success("Wallet ready on Celo Sepolia.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prepare wallet session.";
      toast.error(message);
    }
  };

  const submitAuthorization = async (id: number, accepted: boolean) => {
    if (!address) {
      toast.error("Connect a wallet before authorizing agent actions.");
      return false;
    }

    if (wrongNetwork) {
      toast.error("Switch to Celo Sepolia before authorizing agent actions.");
      return false;
    }

    try {
      await ensureWalletAuthSession(address, signWalletMessage);
      setSessionReady(true);
      await apiPost("/api/agent/authorize", {
        address,
        actionId: id,
        accepted,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit authorization.";
      toast.error(message);
      return false;
    }
  };

  const handleAuthorize = async (id: number) => {
    const submitted = await submitAuthorization(id, true);
    if (!submitted) return;
    const authorizedAction = messages.find((m) => m.id === id)?.actionData?.title || "Ação autorizada";

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, actionState: "authorized" as const } : m))
    );
      // Agent confirms execution after short delay
      setTimeout(() => {
        const confirmMsg: Message = {
          id: nextId(),
          role: "agent",
          type: "success",
          text: `✅ **Autorização registrada com sucesso.**\n\n${authorizedAction}\n\nVou refletir essa decisão no estado do agente assim que a operação ficar disponível no backend.`,
          timestamp: getTime(),
        };
        setMessages((prev) => [...prev, confirmMsg]);
      }, 1200);
    };

  const handleDismiss = async (id: number) => {
    const submitted = await submitAuthorization(id, false);
    if (!submitted) return;

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
              {dashboard
                ? `Online · monitorando $${activeCapital.toFixed(2)} em ${dashboard.liquidityNetwork.connections.length || 1} fluxos`
                : "Online · aguardando snapshot da wallet"}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "rgba(163,217,119,0.12)", border: "1px solid rgba(163,217,119,0.25)" }}
        >
          <Activity className="w-3 h-3" style={{ color: "#A3D977" }} />
          <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
            {activeApy.toFixed(2)}% APY
          </span>
        </div>
      </header>

      {!canUseProtectedFlow && (
        <div className="px-4 pt-4">
          <div
            className="rounded-2xl p-4"
            style={{
              background: wrongNetwork ? "rgba(245,158,11,0.1)" : "var(--surface-solid)",
              border: `1px solid ${wrongNetwork ? "rgba(245,158,11,0.28)" : "var(--border-light)"}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: wrongNetwork ? "rgba(245,158,11,0.15)" : "rgba(163,217,119,0.12)" }}
              >
                {wrongNetwork ? (
                  <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />
                ) : (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {wrongNetwork ? "Wrong network detected" : "Wallet session required"}
                </p>
                <div className="mt-1 space-y-1">
                  <p className="text-xs" style={{ color: isConnected ? "#A3D977" : "var(--text-muted)" }}>
                    Wallet: {isConnected ? "Connected" : "Not connected"}
                  </p>
                  <p className="text-xs" style={{ color: sessionReady ? "#A3D977" : "var(--text-muted)" }}>
                    Session: {sessionReady ? "Active" : "Required"}
                  </p>
                  <p className="text-xs" style={{ color: wrongNetwork ? "#F59E0B" : "#A3D977" }}>
                    Network: {wrongNetwork ? "Wrong network" : "Celo Sepolia"}
                  </p>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  Chat and authorization stay blocked until wallet, session, and Celo Sepolia are ready.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrepareWallet}
              disabled={isConnecting || isSwitchingChain || isSigningMessage}
              className="mt-3 w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: wrongNetwork
                  ? "rgba(245,158,11,0.15)"
                  : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                color: wrongNetwork ? "#F59E0B" : "#A3D977",
                opacity: isConnecting || isSwitchingChain || isSigningMessage ? 0.7 : 1,
              }}
            >
              {isConnecting
                ? "Connecting wallet..."
                : isSwitchingChain
                  ? "Switching to Celo Sepolia..."
                  : isSigningMessage
                    ? "Activating session..."
                    : !isConnected
                      ? "Connect wallet"
                      : wrongNetwork
                        ? "Switch to Celo Sepolia"
                        : "Activate session"}
            </button>
          </div>
        </div>
      )}

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
            { label: "Yield hoje", value: `+$${activeYieldToday.toFixed(2)}`, color: "#A3D977", icon: Sparkles },
            { label: "Capital ativo", value: `$${activeCapital.toFixed(2)}`, color: "var(--text-primary)", icon: DollarSign },
            { label: "Operações", value: String(dashboard?.summary.agentOpsToday ?? 0), color: "#06B6D4", icon: RotateCcw },
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
              actionsDisabled={!canUseProtectedFlow}
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
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
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
              disabled={isThinking || !canUseProtectedFlow}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{
                background: "var(--surface-solid)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                opacity: isThinking || !canUseProtectedFlow ? 0.5 : 1,
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
              placeholder={canUseProtectedFlow ? "Pergunte ao agente..." : "Prepare wallet session first"}
              disabled={isThinking || !canUseProtectedFlow}
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
            disabled={!inputText.trim() || isThinking || !canUseProtectedFlow}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                inputText.trim() && !isThinking && canUseProtectedFlow
                  ? "linear-gradient(135deg, #0D4B2E, #1a6b45)"
                  : "var(--muted)",
              boxShadow:
                inputText.trim() && !isThinking && canUseProtectedFlow ? "0 2px 12px rgba(13,75,46,0.3)" : "none",
              transition: "background 0.2s ease",
            }}
          >
            <Send
              className="w-4.5 h-4.5"
              style={{
                color: inputText.trim() && !isThinking && canUseProtectedFlow ? "#A3D977" : "var(--text-muted)",
              }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
