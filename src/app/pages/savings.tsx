import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Sparkles,
  Plus,
  ChevronRight,
  Bot,
  TrendingUp,
  Zap,
  Globe,
  Shield,
  CheckCircle2,
  Plane,
  Smartphone,
  Home,
  GraduationCap,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  EmergencyFundIcon,
  TravelIcon,
  SmartphoneIcon as SmartphoneSvg,
  HouseIcon,
  EducationIcon,
  YieldIcon,
  SavingsIcon as SavingsSvg,
} from "../components/icons";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { apiGet, apiPost, SavingsGoalPayload, SavingsOverviewPayload } from "../lib/api";
import { useCeloWallet } from "../hooks/use-celo-wallet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Goal {
  id: number;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  monthlyContribution: number;
  color: string;
  bg: string;
  deadline: string;
  autoSave: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  agentOptimized: boolean;
}

const GOAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: EmergencyFundIcon,
  emergency: EmergencyFundIcon,
  travel: TravelIcon,
  phone: SmartphoneSvg,
  home: HouseIcon,
  edu: EducationIcon,
  education: EducationIcon,
  target: Target,
};

function hydrateGoal(goal: SavingsGoalPayload): Goal {
  return {
    ...goal,
    icon: GOAL_ICON_MAP[goal.emoji] || Target,
  };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_GOALS: Goal[] = [];

// ─── SVG Progress Circle ───────────────────────────────────────────────────────

function ProgressCircle({
  pct,
  color,
  size = 72,
  strokeWidth = 6,
}: {
  pct: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min((pct / 100) * circ, circ);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ─── Agent Insight Banner ──────────────────────────────────────────────────────

function AgentInsightBanner({ onChat, message }: { onChat: () => void; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mx-5 mb-5 rounded-2xl p-4 flex items-start gap-3"
      style={{
        background: "linear-gradient(135deg, #0B3D25 0%, #0D4B2E 100%)",
        boxShadow: "0 4px 20px rgba(13,75,46,0.25)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(163,217,119,0.15)" }}
      >
        <Bot className="w-5 h-5" style={{ color: "#A3D977" }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white mb-0.5">Optimization Detected</p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {message}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onChat}
          className="mt-2 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
          style={{ background: "#A3D977", color: "#0D4B2E" }}
        >
          <Sparkles className="w-3 h-3" />
          Chat with Agent
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Add Goal Modal ────────────────────────────────────────────────────────────

const PRESET_GOALS = [
  { name: "Own Home", emoji: "🏠", target: 2000, color: "#0D4B2E", icon: Home },
  { name: "Travel", emoji: "✈️", target: 300, color: "#F59E0B", icon: Plane },
  { name: "Electronics", emoji: "📱", target: 250, color: "#8B5CF6", icon: Smartphone },
  { name: "Education", emoji: "🎓", target: 400, color: "#10B981", icon: GraduationCap },
  { name: "Emergency", emoji: "🛡️", target: 500, color: "#3B82F6", icon: Shield },
  { name: "Investment", emoji: "📈", target: 1000, color: "#06B6D4", icon: TrendingUp },
];

function AddGoalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, emoji: string, target: number, color: string) => void }) {
  const [selected, setSelected] = useState<typeof PRESET_GOALS[0] | null>(null);
  const [targetStr, setTargetStr] = useState("");

  const handleAdd = () => {
    if (!selected) return;
    const target = parseFloat(targetStr) || selected.target;
    onAdd(selected.name, selected.emoji, target, selected.color);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl overflow-hidden"
        style={{
          maxWidth: 430,
          background: "var(--background)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
          maxHeight: "80dvh",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <div className="flex items-center justify-between px-5 pb-4">
          <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            New Goal
          </p>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--surface-solid)" }}
          >
            <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="px-5 overflow-y-auto" style={{ maxHeight: "60dvh", paddingBottom: "2rem" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Choose a category
          </p>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {PRESET_GOALS.map((g) => (
              <motion.button
                key={g.name}
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  setSelected(g);
                  setTargetStr(String(g.target));
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl"
                style={{
                  background: selected?.name === g.name ? `${g.color}15` : "var(--surface-solid)",
                  border: `1.5px solid ${selected?.name === g.name ? g.color : "transparent"}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                <span style={{ fontSize: 22 }}>{g.emoji}</span>
                <span
                  className="text-xs font-semibold text-center leading-tight"
                  style={{ color: selected?.name === g.name ? g.color : "var(--text-muted)" }}
                >
                  {g.name}
                </span>
              </motion.button>
            ))}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Target Amount (cUSD)
              </p>
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-3"
                style={{ background: "var(--surface-solid)", border: "1.5px solid var(--border)" }}
              >
                <span className="font-mono text-xl font-bold" style={{ color: "var(--text-muted)" }}>
                  $
                </span>
                <input
                  type="number"
                  value={targetStr}
                  onChange={(e) => setTargetStr(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-xl outline-none font-bold"
                  style={{ color: "var(--text-primary)" }}
                  placeholder={String(selected.target)}
                />
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  cUSD
                </span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                The agent will suggest the ideal monthly contribution
              </p>
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={!selected}
            className="w-full py-4 rounded-full font-semibold text-white"
            style={{
              background: selected
                ? "linear-gradient(135deg, #0D4B2E, #1a6b45)"
                : "var(--muted)",
              color: selected ? "#fff" : "var(--text-muted)",
              boxShadow: selected ? "0 4px 20px rgba(13,75,46,0.25)" : "none",
            }}
          >
            {selected ? `Create goal: ${selected.emoji} ${selected.name}` : "Select a category"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Goal Detail Drawer ────────────────────────────────────────────────────────

function GoalDetailDrawer({
  goal,
  onClose,
  onToggleAutoSave,
  onOptimize,
}: {
  goal: Goal;
  onClose: () => void;
  onToggleAutoSave: (id: number) => void;
  onOptimize: (id: number) => void;
}) {
  const pct = Math.round((goal.saved / goal.target) * 100);
  const remaining = goal.target - goal.saved;
  const months = Math.ceil(remaining / goal.monthlyContribution);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl overflow-hidden"
        style={{
          maxWidth: 430,
          background: "var(--background)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <div className="px-5 pb-8">
          {/* Title */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: goal.bg }}>
                {(() => { const GI = goal.icon; return <GI className="w-5 h-5" style={{ color: goal.color }} />; })()}
              </div>
              <div>
                <p className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>
                  {goal.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Goal for {goal.deadline}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface-solid)" }}
            >
              <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* Progress */}
          <div
            className="rounded-2xl p-5 mb-4 flex items-center gap-5"
            style={{ background: "var(--surface-solid)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <div className="relative flex-shrink-0">
              <ProgressCircle pct={pct} color={goal.color} size={88} strokeWidth={8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold" style={{ color: goal.color, fontSize: "1rem" }}>
                  {pct}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono font-bold text-xl" style={{ color: "var(--text-primary)" }}>
                  ${goal.saved.toFixed(2)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  / ${goal.target}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Remaining{" "}
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  ${remaining.toFixed(2)}
                </span>
              </p>
              <div
                className="mt-2 px-2 py-1 rounded-full inline-flex items-center gap-1"
                style={{ background: `${goal.color}15` }}
              >
                <span className="text-xs font-semibold" style={{ color: goal.color }}>
                  ~{months} months left
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Contribution/mo", value: `$${goal.monthlyContribution}`, icon: TrendingUp, color: "#10B981" },
              { label: "Monthly Yield", value: `+$${(goal.saved * 0.004).toFixed(2)}`, icon: Sparkles, color: "#A3D977" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-2xl p-3.5"
                style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
              >
                <Icon className="w-4 h-4 mb-1.5" style={{ color }} />
                <div className="font-mono font-bold" style={{ color, fontSize: "1.1rem" }}>
                  {value}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Auto-save toggle */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between mb-4"
            style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5" style={{ color: goal.autoSave ? "#A3D977" : "var(--text-muted)" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Auto-save by Agent
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {goal.autoSave ? "Agent allocates automatically" : "Manual contribution"}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleAutoSave(goal.id)}
              className="w-12 h-7 rounded-full flex items-center px-1 transition-all duration-300"
              style={{
                background: goal.autoSave ? "#A3D977" : "var(--muted)",
                justifyContent: goal.autoSave ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow" />
            </motion.button>
          </div>

          {/* Optimize button */}
          {!goal.agentOptimized && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { onOptimize(goal.id); onClose(); }}
              className="w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(13,75,46,0.25)",
              }}
            >
              <Zap className="w-5 h-5" />
              Optimize with AI Agent
            </motion.button>
          )}
          {goal.agentOptimized && (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-2xl"
              style={{ background: "rgba(163,217,119,0.1)" }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
              <span className="text-sm font-semibold" style={{ color: "#A3D977" }}>
                Already optimized by AI Agent
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Goal Card ─────────────────────────────────────────────────────────────────

function GoalCard({ goal, index, onClick }: { goal: Goal; index: number; onClick: () => void }) {
  const pct = Math.round((goal.saved / goal.target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer"
      style={{
        background: "var(--surface-solid)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: goal.agentOptimized ? "1px solid rgba(163,217,119,0.2)" : "none",
      }}
    >
      <div className="flex items-center gap-4">
        {/* Progress circle */}
        <div className="relative flex-shrink-0">
          <ProgressCircle pct={pct} color={goal.color} size={64} strokeWidth={5} />
          <div className="absolute inset-0 flex items-center justify-center">
            {(() => { const GI = goal.icon; return <GI className="w-4.5 h-4.5" style={{ color: goal.color }} />; })()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {goal.name}
            </p>
            {goal.agentOptimized && (
              <span
                className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(163,217,119,0.12)" }}
              >
                <Bot className="w-2.5 h-2.5" style={{ color: "#A3D977" }} />
                <span style={{ fontSize: "9px", color: "#A3D977", fontWeight: 700 }}>IA</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs font-semibold" style={{ color: goal.color }}>
              ${goal.saved.toFixed(0)} / ${goal.target}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {pct}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full w-full" style={{ background: "var(--muted)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.07, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: goal.color }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              +${goal.monthlyContribution}/mo · {goal.deadline}
            </span>
            {goal.autoSave && (
              <span className="text-xs font-medium" style={{ color: "#A3D977" }}>
                Auto ✓
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
      </div>
    </motion.div>
  );
}

// ─── Summary Stats ─────────────────────────────────────────────────────────────

function SummaryHeader({ goals }: { goals: Goal[] }) {
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const pct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const monthlyYield = goals.filter((g) => g.autoSave).reduce((s, g) => s + g.saved * 0.004, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-5 rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0B3D25 0%, #0D4B2E 50%, #12593A 100%)",
        boxShadow: "0 8px 32px rgba(13,75,46,0.28)",
      }}
    >
      {/* BG decoration */}
      <div
        className="absolute top-0 right-0 rounded-full pointer-events-none"
        style={{
          width: 160,
          height: 160,
          background: "radial-gradient(circle, rgba(163,217,119,0.12) 0%, transparent 70%)",
          transform: "translate(30%,-30%)",
        }}
      />
      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Total Saved
          </span>
        </div>
        <div
          className="font-mono font-bold text-white mb-1"
          style={{ fontSize: "clamp(1.8rem, 9vw, 2.4rem)", letterSpacing: "-0.02em" }}
        >
          ${totalSaved.toFixed(2)}
        </div>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
          {goals.length > 0
            ? `of $${totalTarget.toFixed(0)} in ${goals.length} goals · ${pct}% completed`
            : "Create the first goal to start tracking savings with live wallet capital"}
        </p>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #A3D977, #6EC94F)" }}
          />
        </div>

        <div className="grid grid-cols-3" style={{ background: "rgba(0,0,0,0.18)", borderRadius: "0.75rem" }}>
          {[
            { label: "Active Goals", value: String(goals.length) },
            { label: "Auto-save", value: `${goals.filter((g) => g.autoSave).length} goals` },
            { label: "Yield/mo", value: `+$${monthlyYield.toFixed(2)}` },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-2 py-2.5 text-center"
              style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
            >
              <div className="font-mono font-bold" style={{ color: "#A3D977", fontSize: "0.9rem" }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function SavingsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { address } = useCeloWallet();
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [agentInsight, setAgentInsight] = useState(
    "Create the first goal and I will use only the productive share of the wallet to accelerate it.",
  );

  useEffect(() => {
    let active = true;
    apiGet<SavingsOverviewPayload>("/api/savings/goals", { address: address || "" })
      .then((payload) => {
        if (!active) return;
        setGoals(payload.goals.map(hydrateGoal));
        if (payload.insight) setAgentInsight(payload.insight);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [address]);

  const handleAddGoal = (name: string, emoji: string, target: number, color: string) => {
    const newGoal: Goal = {
      id: nextIdG(),
      name,
      emoji,
      target,
      saved: 0,
      monthlyContribution: Math.round(target / 12),
      color,
      bg: `${color}15`,
      deadline: "2027",
      autoSave: false,
      icon: Target,
      agentOptimized: false,
    };
    setGoals((prev) => [...prev, newGoal]);

    apiPost<{ goal: SavingsGoalPayload }>("/api/savings/goals", {
      address: address || "",
      name,
      emoji,
      target,
      color,
      bg: `${color}15`,
      autoSave: false,
      agentOptimized: false,
    }).catch(() => {});
  };

  const handleToggleAutoSave = (id: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, autoSave: !g.autoSave } : g)));
    const goal = goals.find((item) => item.id === id);
    if (!goal) return;
    apiPost<{ goal: SavingsGoalPayload }>(
      `/api/savings/goals/${id}`,
      { address: address || "", autoSave: !goal.autoSave },
      "PATCH",
    ).catch(() => {});
  };

  const handleOptimize = (id: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, agentOptimized: true, autoSave: true } : g)));
    apiPost<{ goal: SavingsGoalPayload }>(
      `/api/savings/goals/${id}`,
      { address: address || "", agentOptimized: true, autoSave: true },
      "PATCH",
    ).catch(() => {});
  };

  return (
    <div className="min-h-dvh pb-28 overflow-x-hidden" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="px-5 pt-14 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Target className="w-5 h-5" style={{ color: "#0D4B2E" }} />
            <h1 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.5rem" }}>
              Savings
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Goals optimized by AI Agent
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowAddModal(true)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0D4B2E, #1a6b45)",
            boxShadow: "0 3px 14px rgba(13,75,46,0.3)",
          }}
        >
          <Plus className="w-5 h-5" style={{ color: "#A3D977" }} />
        </motion.button>
      </header>

      {/* Summary */}
      <SummaryHeader goals={goals} />

      {/* AI Insight Banner */}
      <AgentInsightBanner onChat={() => navigate("/chat")} message={agentInsight} />

      {/* Goals list */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          My Goals
        </p>
        <div className="space-y-3">
          {goals.length > 0 ? goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onClick={() => setSelectedGoal(goal)}
            />
          )) : (
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--surface-solid)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No goals yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Start from the current wallet capital and create the first target when you are ready.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4"
          style={{
            background: isDark ? "rgba(163,217,119,0.05)" : "rgba(163,217,119,0.08)",
            border: "1px solid rgba(163,217,119,0.15)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" style={{ color: "#A3D977" }} />
            <span className="text-xs font-semibold" style={{ color: "#A3D977" }}>
              How the Agent helps your goals
            </span>
          </div>
          {[
            "Automatically allocates excess liquidity to each goal",
            "Invests in Celo protocols to generate yield while you save",
            "Rebalances priorities when your financial profile changes",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 mt-1.5">
              <span className="text-xs mt-0.5" style={{ color: "#A3D977" }}>▸</span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddGoalModal onClose={() => setShowAddModal(false)} onAdd={handleAddGoal} />
        )}
        {selectedGoal && (
          <GoalDetailDrawer
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onToggleAutoSave={(id) => {
              handleToggleAutoSave(id);
              setSelectedGoal((g) => g ? { ...g, autoSave: !g.autoSave } : g);
            }}
            onOptimize={(id) => {
              handleOptimize(id);
              setSelectedGoal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// util
let _gid = 200;
function nextIdG() {
  return ++_gid;
}
