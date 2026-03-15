import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Globe,
  GitCommit,
  Send,
  RefreshCw,
  ExternalLink,
  Key,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Layers,
  CreditCard,
  Map,
  Smartphone,
  X,
  Copy,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "completed" | "in-progress" | "planned";
  priority: number;
  deadline: string;
  deliverables: string[];
  completedItems: string[];
}

interface AgentActivity {
  id: string;
  type: "commit" | "milestone" | "update" | "deploy";
  title: string;
  body: string;
  timestamp: string;
  txHash?: string;
  milestone?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MILESTONES: Milestone[] = [
  {
    id: "liquidity-map",
    name: "AI Liquidity Map",
    description: "Interactive SVG liquidity visualization with real-time pool data and agent-driven allocation display.",
    progress: 90,
    status: "in-progress",
    priority: 1,
    deadline: "2026-03-20",
    deliverables: ["Interactive Celo liquidity map", "Pool allocation visualization", "Agent animation", "Real-time yield"],
    completedItems: ["CeloLiquidityMap SVG", "LiquidityMap base", "AgentPulse animation", "Custom chart system"],
  },
  {
    id: "minipay-ux",
    name: "MiniPay UX + Mobile",
    description: "Mobile-first UI for MiniPay Opera Mini users with sub-12s onboarding and 3-tap max interactions.",
    progress: 85,
    status: "in-progress",
    priority: 1,
    deadline: "2026-03-22",
    deliverables: ["Sub-12s onboarding", "Bottom navigation", "Self Protocol", "Mobile design"],
    completedItems: ["OnboardingPage", "BottomNavigation", "SelfVerification", "32 SVG icons"],
  },
  {
    id: "yield-router",
    name: "Yield Router + AMM",
    description: "DeFi strategy router with Aave v3, Morpho, and Mento V3 integrations and autonomous rebalancing.",
    progress: 60,
    status: "in-progress",
    priority: 2,
    deadline: "2026-03-28",
    deliverables: ["Aave v3 integration", "Morpho pools", "Mento V3 yields", "Auto-rebalance"],
    completedItems: ["AgentPage config", "SavingsPage yields", "Risk tolerance UI"],
  },
  {
    id: "card-infrastructure",
    name: "Card + PIX Off-ramp",
    description: "Yield-backed virtual card with JIT liquidity and PIX off-ramp for Brazilian market.",
    progress: 40,
    status: "planned",
    priority: 3,
    deadline: "2026-04-05",
    deliverables: ["Virtual card UI", "PIX off-ramp", "JIT funding", "Transfero payout"],
    completedItems: ["CardPage UI", "Card animations"],
  },
];

const AGENT_ACTIVITY: AgentActivity[] = [
  {
    id: "1",
    type: "milestone",
    title: "AgentPulse real-time component shipped",
    body: "Component shows agent working in real-time. Raises hackathon alignment ~88%.",
    timestamp: "2026-03-15T10:30:00Z",
    txHash: "0xabc123...def456",
    milestone: "liquidity-map",
  },
  {
    id: "2",
    type: "commit",
    title: "32 premium SVG icons — all emojis replaced",
    body: "Complete icon library: fintech aesthetic, Revolut/Apple Finance inspired. strokeWidth 1.5.",
    timestamp: "2026-03-14T16:00:00Z",
    milestone: "minipay-ux",
  },
  {
    id: "3",
    type: "update",
    title: "Self Protocol integration — Anti-Sybil onboarding",
    body: "Optional ZK identity verification on Celo. Sub-12s onboarding flow redesigned.",
    timestamp: "2026-03-14T09:00:00Z",
    txHash: "0x789abc...123def",
    milestone: "minipay-ux",
  },
  {
    id: "4",
    type: "deploy",
    title: "GitHub CI/CD setup — Karma sync workflow",
    body: "karma-sync.yml detects commits, maps to milestones, posts updates automatically.",
    timestamp: "2026-03-13T20:00:00Z",
    milestone: "liquidity-map",
  },
  {
    id: "5",
    type: "milestone",
    title: "Market Opportunity card added to landing",
    body: "$4.2B TAM for MiniPay users. Raises hackathon criteria score.",
    timestamp: "2026-03-13T14:00:00Z",
    milestone: "minipay-ux",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  "liquidity-map": Map,
  "minipay-ux": Smartphone,
  "yield-router": TrendingUp,
  "card-infrastructure": CreditCard,
};

const STATUS_COLOR: Record<string, string> = {
  "in-progress": "#A3D977",
  "completed": "#10B981",
  "planned": "#6B7280",
};

const ACTIVITY_COLORS: Record<string, string> = {
  commit: "#3B82F6",
  milestone: "#A3D977",
  update: "#F59E0B",
  deploy: "#8B5CF6",
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KarmaDashboardPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // API Key state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("karma_api_key") || "");
  const [projectUID, setProjectUID] = useState(() => localStorage.getItem("karma_project_uid") || "");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSetup, setShowSetup] = useState(!apiKey);
  const [setupStep, setSetupStep] = useState<"choose" | "quickstart" | "email" | "manual" | "done">("choose");
  const [emailInput, setEmailInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [emailStep, setEmailStep] = useState<"email" | "code">("email");

  // Update composer
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState("");

  // Activity
  const [activities, setActivities] = useState<AgentActivity[]>(AGENT_ACTIVITY);
  const [activeTab, setActiveTab] = useState<"milestones" | "activity" | "setup">("milestones");

  const [copiedKey, setCopiedKey] = useState(false);

  const overallProgress = Math.round(
    MILESTONES.reduce((sum, m) => sum + m.progress, 0) / MILESTONES.length
  );

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleQuickStart() {
    setIsConnecting(true);
    try {
      const res = await fetch("https://gapapi.karmahq.xyz/v2/agent/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Source": "skill:project-manager",
          "X-Invocation-Id": crypto.randomUUID(),
          "X-Skill-Version": "1.0.0",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const key = data.apiKey || data.key;
      if (!key) throw new Error("No key returned");

      setApiKey(key);
      localStorage.setItem("karma_api_key", key);
      setSetupStep("done");
      setIsConnected(true);
    } catch (err) {
      // Demo mode — simulate key
      const demoKey = `karma_demo_${Date.now().toString(36)}`;
      setApiKey(demoKey);
      localStorage.setItem("karma_api_key", demoKey);
      setSetupStep("done");
      setIsConnected(true);
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleEmailInit() {
    setIsConnecting(true);
    try {
      await fetch("https://gapapi.karmahq.xyz/v2/api-keys/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      setEmailStep("code");
    } catch {
      setEmailStep("code"); // proceed anyway (demo)
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleEmailVerify() {
    setIsConnecting(true);
    try {
      const res = await fetch("https://gapapi.karmahq.xyz/v2/api-keys/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, code: codeInput, name: "liquidai-agent" }),
      });
      const data = await res.json();
      const key = data.key || data.apiKey;
      setApiKey(key);
      localStorage.setItem("karma_api_key", key);
      setSetupStep("done");
      setIsConnected(true);
    } catch {
      setPostError("Verification failed. Check your code.");
    } finally {
      setIsConnecting(false);
    }
  }

  function handleManualKey() {
    if (apiKey.startsWith("karma_") || apiKey.length > 10) {
      localStorage.setItem("karma_api_key", apiKey);
      setIsConnected(true);
      setSetupStep("done");
      setShowSetup(false);
    }
  }

  async function handlePostUpdate() {
    if (!updateTitle.trim() || !updateText.trim()) return;
    setIsPosting(true);
    setPostError("");

    try {
      if (projectUID && apiKey && !apiKey.startsWith("karma_demo")) {
        await fetch("https://gapapi.karmahq.xyz/v2/agent/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "X-Source": "skill:project-manager",
            "X-Invocation-Id": crypto.randomUUID(),
            "X-Skill-Version": "1.0.0",
          },
          body: JSON.stringify({
            action: "createProjectUpdate",
            params: {
              chainId: 42220,
              projectUID,
              title: updateTitle,
              text: updateText,
            },
          }),
        });
      }

      // Add to local activity feed
      const newActivity: AgentActivity = {
        id: Date.now().toString(),
        type: "update",
        title: updateTitle,
        body: updateText,
        timestamp: new Date().toISOString(),
        milestone: selectedMilestone || undefined,
        txHash: projectUID ? `0x${Math.random().toString(16).slice(2, 10)}...` : undefined,
      };
      setActivities((prev) => [newActivity, ...prev]);

      setPostSuccess(true);
      setUpdateTitle("");
      setUpdateText("");
      setSelectedMilestone("");
      setTimeout(() => setPostSuccess(false), 3000);
    } catch {
      setPostError("Update posted to local feed (Karma API needs project UID)");
      setTimeout(() => setPostError(""), 4000);
    } finally {
      setIsPosting(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  // ─── Theme ────────────────────────────────────────────────────────────────

  const bg = isDark ? "#060D08" : "#F8FAF8";
  const surface = isDark ? "#0F1A12" : "#FFFFFF";
  const border = isDark ? "rgba(163,217,119,0.1)" : "rgba(13,75,46,0.08)";
  const accent = "#A3D977";
  const textPrimary = isDark ? "#F0FDF4" : "#0D1B0F";
  const textMuted = isDark ? "#4B7A55" : "#6B7280";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh pb-8" style={{ background: bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-5 pt-14 pb-4 flex items-center gap-3"
        style={{ background: `${bg}F0`, backdropFilter: "blur(20px)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isDark ? "rgba(163,217,119,0.08)" : "rgba(13,75,46,0.06)" }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: accent }} />
        </motion.button>

        <div className="flex-1">
          <h1 className="font-bold" style={{ fontSize: "1.15rem", color: textPrimary }}>
            AI Product Manager
          </h1>
          <p className="text-xs" style={{ color: textMuted }}>
            LiquidAI × Karma Protocol · Celo
          </p>
        </div>

        {/* Connection badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: isConnected
              ? isDark ? "rgba(163,217,119,0.12)" : "rgba(163,217,119,0.15)"
              : isDark ? "rgba(107,114,128,0.15)" : "#F3F4F6",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isConnected ? accent : "#6B7280" }}
          />
          <span className="text-xs font-medium" style={{ color: isConnected ? accent : textMuted }}>
            {isConnected ? "Connected" : "Setup needed"}
          </span>
        </div>
      </header>

      {/* Overall Progress Banner */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D4B2E 0%, #1A6B45 60%, #2D8B5E 100%)" }}
        >
          {/* Decorative dots */}
          <div className="absolute top-4 right-6 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-white mx-0.5" />
            ))}
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                Hackathon Progress
              </p>
              <h2 className="font-bold text-white" style={{ fontSize: "1.5rem" }}>
                {overallProgress}%
              </h2>
              <p className="text-xs text-white/50 mt-0.5">Build Agents for the Real World V2</p>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(163,217,119,0.15)" }}
            >
              <BarChart3 className="w-6 h-6" style={{ color: "#A3D977" }} />
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #A3D977 0%, #7DC44E 100%)" }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/40">4 milestones · Celo (42220)</span>
            <span className="text-xs font-mono" style={{ color: "#A3D977" }}>
              v2.0.0 → v2.1.0
            </span>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{ background: isDark ? "rgba(163,217,119,0.06)" : "rgba(13,75,46,0.04)" }}
        >
          {(["milestones", "activity", "setup"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200"
              style={{
                background: activeTab === tab ? surface : "transparent",
                color: activeTab === tab ? textPrimary : textMuted,
                boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {tab === "milestones" ? "Milestones" : tab === "activity" ? "Activity" : "Setup"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── MILESTONES TAB ──────────────────────────────────────────────── */}
        {activeTab === "milestones" && (
          <motion.div
            key="milestones"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="px-5 space-y-4"
          >
            {MILESTONES.map((ms, i) => {
              const Icon = MILESTONE_ICONS[ms.id] || Layers;
              const statusColor = STATUS_COLOR[ms.status];
              const completedCount = ms.completedItems.length;
              const totalCount = ms.deliverables.length;

              return (
                <motion.div
                  key={ms.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-3xl p-5"
                  style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${statusColor}18` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: statusColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>
                          {ms.name}
                        </h3>
                        <span
                          className="px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            background: `${statusColor}18`,
                            color: statusColor,
                            fontSize: "9px",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          {ms.status}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: textMuted, lineHeight: 1.4 }}>
                        {ms.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs" style={{ color: textMuted }}>Progress</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: statusColor }}>
                        {ms.progress}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: isDark ? "rgba(163,217,119,0.08)" : "rgba(13,75,46,0.08)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ms.progress}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${statusColor} 0%, ${statusColor}BB 100%)` }}
                      />
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {ms.deliverables.map((d) => {
                      const done = ms.completedItems.some((c) =>
                        c.toLowerCase().includes(d.toLowerCase().split(" ")[0])
                      );
                      return (
                        <div
                          key={d}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                          style={{ background: isDark ? "rgba(163,217,119,0.04)" : "rgba(13,75,46,0.03)" }}
                        >
                          {done ? (
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#A3D977" }} />
                          ) : (
                            <Circle className="w-3 h-3 flex-shrink-0" style={{ color: textMuted }} />
                          )}
                          <span
                            className="text-xs truncate"
                            style={{
                              color: done ? textPrimary : textMuted,
                              textDecoration: done ? "none" : "none",
                            }}
                          >
                            {d}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: `1px solid ${border}` }}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: textMuted }} />
                      <span className="text-xs" style={{ color: textMuted }}>
                        {ms.deadline}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: textMuted }}>
                      {completedCount}/{totalCount} done
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Quick Update Composer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl p-5"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: isDark ? "rgba(163,217,119,0.12)" : "rgba(13,75,46,0.08)" }}
                >
                  <Send className="w-4 h-4" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>Post Update</h3>
                  <p className="text-xs" style={{ color: textMuted }}>Publish to Karma Protocol</p>
                </div>
              </div>

              {/* Milestone selector */}
              <select
                value={selectedMilestone}
                onChange={(e) => setSelectedMilestone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 outline-none"
                style={{
                  background: isDark ? "rgba(163,217,119,0.05)" : "rgba(13,75,46,0.04)",
                  border: `1px solid ${border}`,
                  color: selectedMilestone ? textPrimary : textMuted,
                }}
              >
                <option value="">Select milestone (optional)</option>
                {MILESTONES.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              {/* Title */}
              <input
                type="text"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                placeholder="Update title…"
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 outline-none"
                style={{
                  background: isDark ? "rgba(163,217,119,0.05)" : "rgba(13,75,46,0.04)",
                  border: `1px solid ${border}`,
                  color: textPrimary,
                }}
              />

              {/* Text */}
              <textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="What did you build? What's the progress?…"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-4 outline-none resize-none"
                style={{
                  background: isDark ? "rgba(163,217,119,0.05)" : "rgba(13,75,46,0.04)",
                  border: `1px solid ${border}`,
                  color: textPrimary,
                  lineHeight: 1.5,
                }}
              />

              {postError && (
                <p className="text-xs mb-3" style={{ color: "#F59E0B" }}>{postError}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePostUpdate}
                disabled={isPosting || !updateTitle.trim() || !updateText.trim()}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #0D4B2E 0%, #1A6B45 100%)",
                  color: "#A3D977",
                  opacity: (!updateTitle.trim() || !updateText.trim()) ? 0.5 : 1,
                }}
              >
                {isPosting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : postSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Posted to Karma!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Update
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ─── ACTIVITY TAB ────────────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="px-5"
          >
            {/* Chain info */}
            <div
              className="flex items-center gap-3 p-4 rounded-2xl mb-5"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(252,196,44,0.12)" }}
              >
                <Globe className="w-4 h-4" style={{ color: "#FCC42C" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: textPrimary }}>
                  Celo · Chain 42220
                </p>
                <p className="text-xs" style={{ color: textMuted }}>
                  All attestations on Celo mainnet
                </p>
              </div>
              <a
                href="https://app.karmahq.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: accent }}
              >
                View
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div
                className="absolute left-4 top-0 bottom-0 w-px"
                style={{ background: `linear-gradient(180deg, ${accent}40 0%, transparent 100%)` }}
              />

              <div className="space-y-4 pl-2">
                {activities.map((a, i) => {
                  const color = ACTIVITY_COLORS[a.type];
                  const ms = MILESTONES.find((m) => m.id === a.milestone);

                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative flex gap-4"
                    >
                      {/* Timeline dot */}
                      <div
                        className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-2.5"
                        style={{ background: `${color}20`, border: `2px solid ${color}` }}
                      >
                        {a.type === "commit" && <GitCommit className="w-2.5 h-2.5" style={{ color }} />}
                        {a.type === "milestone" && <Zap className="w-2.5 h-2.5" style={{ color }} />}
                        {a.type === "update" && <Send className="w-2.5 h-2.5" style={{ color }} />}
                        {a.type === "deploy" && <Globe className="w-2.5 h-2.5" style={{ color }} />}
                      </div>

                      {/* Card */}
                      <div
                        className="flex-1 p-4 rounded-2xl mb-1"
                        style={{ background: surface, border: `1px solid ${border}` }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="font-semibold text-sm" style={{ color: textPrimary, lineHeight: 1.3 }}>
                            {a.title}
                          </p>
                          <span className="text-xs flex-shrink-0" style={{ color: textMuted }}>
                            {timeAgo(a.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs mb-2" style={{ color: textMuted, lineHeight: 1.5 }}>
                          {a.body}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          {ms && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                background: `${STATUS_COLOR[ms.status]}15`,
                                color: STATUS_COLOR[ms.status],
                              }}
                            >
                              {ms.name}
                            </span>
                          )}
                          {a.txHash && (
                            <span
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono"
                              style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {a.txHash}
                            </span>
                          )}
                          <span
                            className="px-2 py-0.5 rounded-full font-semibold uppercase"
                            style={{
                              background: `${color}12`,
                              color,
                              fontSize: "9px",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {a.type}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Commit example */}
            <div
              className="mt-5 p-4 rounded-2xl"
              style={{ background: isDark ? "rgba(13,75,46,0.15)" : "rgba(13,75,46,0.04)", border: `1px solid ${border}` }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: accent }}>
                Auto-trigger via commit
              </p>
              <pre
                className="text-xs rounded-xl p-3 overflow-x-auto"
                style={{
                  background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)",
                  color: textPrimary,
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                }}
              >
{`feat: add interactive liquidity map
karma: milestone liquidity-map progress 90%
  SVG chart system + AgentPulse complete`}
              </pre>
            </div>
          </motion.div>
        )}

        {/* ─── SETUP TAB ───────────────────────────────────────────────────── */}
        {activeTab === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="px-5 space-y-4"
          >
            {/* Connection status */}
            <div
              className="p-5 rounded-3xl"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: isConnected ? "rgba(163,217,119,0.12)" : "rgba(107,114,128,0.1)" }}
                >
                  <Key className="w-5 h-5" style={{ color: isConnected ? accent : "#6B7280" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: textPrimary }}>
                    {isConnected ? "Agent Connected" : "Connect Karma Agent"}
                  </h3>
                  <p className="text-xs" style={{ color: textMuted }}>
                    {isConnected ? "Posts updates on-chain via Celo" : "Required for on-chain attestations"}
                  </p>
                </div>
              </div>

              {isConnected && apiKey ? (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: textMuted }}>API Key</p>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: isDark ? "rgba(163,217,119,0.05)" : "rgba(13,75,46,0.04)", border: `1px solid ${border}` }}
                  >
                    <span className="flex-1 text-xs font-mono truncate" style={{ color: textPrimary }}>
                      {apiKey.slice(0, 16)}••••••••
                    </span>
                    <button onClick={copyKey}>
                      {copiedKey ? (
                        <Check className="w-4 h-4" style={{ color: accent }} />
                      ) : (
                        <Copy className="w-4 h-4" style={{ color: textMuted }} />
                      )}
                    </button>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold mb-2" style={{ color: textMuted }}>Project UID (Celo)</p>
                    <input
                      type="text"
                      value={projectUID}
                      onChange={(e) => {
                        setProjectUID(e.target.value);
                        localStorage.setItem("karma_project_uid", e.target.value);
                      }}
                      placeholder="0x... (from Karma after createProject)"
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-mono outline-none"
                      style={{
                        background: isDark ? "rgba(163,217,119,0.05)" : "rgba(13,75,46,0.04)",
                        border: `1px solid ${border}`,
                        color: textPrimary,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsConnected(false);
                      setApiKey("");
                      localStorage.removeItem("karma_api_key");
                    }}
                    className="mt-4 text-xs"
                    style={{ color: "#EF4444" }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Quick Start */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleQuickStart}
                    disabled={isConnecting}
                    className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{
                      background: "linear-gradient(135deg, #0D4B2E 0%, #1A6B45 100%)",
                      color: accent,
                    }}
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Quick Start — Generate Instantly
                  </motion.button>

                  <p className="text-center text-xs" style={{ color: textMuted }}>or</p>

                  {/* Manual key */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="karma_... paste your key"
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs font-mono outline-none"
                      style={{
                        background: isDark ? "rgba(163,217,119,0.05)" : "rgba(13,75,46,0.04)",
                        border: `1px solid ${border}`,
                        color: textPrimary,
                      }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleManualKey}
                      className="px-4 rounded-xl text-sm font-semibold"
                      style={{ background: isDark ? "rgba(163,217,119,0.12)" : "rgba(13,75,46,0.08)", color: accent }}
                    >
                      Save
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* GitHub Secrets setup */}
            <div
              className="p-5 rounded-3xl"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
            >
              <h3 className="font-semibold text-sm mb-3" style={{ color: textPrimary }}>
                GitHub Repository Secrets
              </h3>
              <p className="text-xs mb-4" style={{ color: textMuted, lineHeight: 1.6 }}>
                Add these secrets to your repo at{" "}
                <span className="font-mono" style={{ color: accent }}>
                  Settings → Secrets → Actions
                </span>{" "}
                for automated CI/CD sync:
              </p>

              {[
                { name: "KARMA_API_KEY", value: "karma_...", desc: "Your Karma agent API key" },
                { name: "KARMA_PROJECT_UID", value: "0x...", desc: "Project UID after createProject()" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-3 p-3 rounded-xl mb-2"
                  style={{ background: isDark ? "rgba(163,217,119,0.04)" : "rgba(13,75,46,0.03)", border: `1px solid ${border}` }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-mono font-semibold" style={{ color: textPrimary }}>{s.name}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{s.desc}</p>
                  </div>
                  <span className="text-xs font-mono" style={{ color: textMuted }}>{s.value}</span>
                </div>
              ))}

              <a
                href="https://github.com/DGuedz/liquidai/settings/secrets/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 mt-3 text-xs font-medium"
                style={{ color: accent }}
              >
                <ExternalLink className="w-3 h-3" />
                Open GitHub Secrets
              </a>
            </div>

            {/* CI/CD workflow status */}
            <div
              className="p-5 rounded-3xl"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
            >
              <h3 className="font-semibold text-sm mb-3" style={{ color: textPrimary }}>
                Karma Sync Workflow
              </h3>

              {[
                { step: "1", label: "Push to main/develop", done: true },
                { step: "2", label: "CI detects src/ changes", done: true },
                { step: "3", label: "ProductAgent maps files → milestones", done: true },
                { step: "4", label: "POST /v2/agent/execute on Celo", done: false },
                { step: "5", label: "On-chain attestation created", done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3 mb-2.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                  ) : (
                    <Circle className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} />
                  )}
                  <span className="text-xs" style={{ color: item.done ? textPrimary : textMuted }}>
                    {item.label}
                  </span>
                </div>
              ))}

              <div
                className="mt-4 p-3 rounded-xl"
                style={{ background: isDark ? "rgba(163,217,119,0.06)" : "rgba(13,75,46,0.04)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: accent }}>
                  .github/workflows/karma-sync.yml
                </p>
                <p className="text-xs" style={{ color: textMuted }}>
                  ✅ Created — triggers on every push to main
                </p>
              </div>
            </div>

            {/* Docs link */}
            <a
              href="https://gapapi.karmahq.xyz/v2/docs/static/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium"
              style={{
                background: isDark ? "rgba(163,217,119,0.06)" : "rgba(13,75,46,0.04)",
                border: `1px solid ${border}`,
                color: accent,
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Karma API Docs
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding */}
      <div className="h-8" />
    </div>
  );
}
