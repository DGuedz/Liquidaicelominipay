import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, TrendingUp, RotateCcw, Shield, Zap, Bell, DollarSign, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { apiGet, DashboardPayload } from "../lib/api";

const NOTIF_CHANNELS = [
  { id: "push", label: "Push (browser)", sub: "Instant mobile alerts", enabled: true },
  { id: "email", label: "Email summary", sub: "Daily summary after the first sync", enabled: true },
  { id: "sms", label: "Critical SMS", sub: "Security alerts only", enabled: false },
];

const NOTIF_TYPES = [
  {
    id: "yield",
    icon: DollarSign,
    label: "Yield Captured",
    sub: "When agent captures yield",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.1)",
    enabled: true,
  },
  {
    id: "rebalance",
    icon: RotateCcw,
    label: "Rebalancing",
    sub: "Automatic reallocation alerts",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    enabled: true,
  },
  {
    id: "opportunity",
    icon: TrendingUp,
    label: "Opportunity Detected",
    sub: "New pools with higher APY",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    enabled: true,
  },
  {
    id: "protect",
    icon: Shield,
    label: "Forex Protection",
    sub: "Sharp BRL/USD movements",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    enabled: true,
  },
  {
    id: "agent",
    icon: Zap,
    label: "Agent Actions",
    sub: "Every autonomous transaction",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    enabled: false,
  },
  {
    id: "security",
    icon: AlertTriangle,
    label: "Security Alerts",
    sub: "Login, 2FA and suspicious activity",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    enabled: true,
  },
];

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
      style={{
        background: enabled ? color : "var(--muted)",
        justifyContent: enabled ? "flex-end" : "flex-start",
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

export function ProfileNotificacoesPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { address } = useCeloWallet();
  const [channels, setChannels] = useState(NOTIF_CHANNELS);
  const [types, setTypes] = useState(NOTIF_TYPES);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [quietEnabled, setQuietEnabled] = useState(true);
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

  const toggleChannel = (id: string) =>
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));

  const toggleType = (id: string) =>
    setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));

  const activeCount = types.filter((t) => t.enabled).length;

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
          <h1 className="font-bold text-text-primary">Notifications</h1>
          <p className="text-xs text-text-muted">{activeCount} of {types.length} types active</p>
        </div>
      </header>

      {/* Summary badge */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(163,217,119,0.08)", border: "1px solid rgba(163,217,119,0.2)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(163,217,119,0.15)" }}
          >
            <Bell className="w-5 h-5" style={{ color: "#A3D977" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#A3D977" }}>
              {dashboard?.summary.agentOpsToday ? "Agent events available" : "No unread notifications"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {dashboard?.agentEvents?.[0] || "Notifications will appear after the first agent action."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Channels */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Delivery Channels
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {channels.map((ch, i) => (
            <div
              key={ch.id}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < channels.length - 1 ? "1px solid var(--border-light)" : "none" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{ch.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{ch.sub}</p>
              </div>
              <Toggle enabled={ch.enabled} onToggle={() => toggleChannel(ch.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Types */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Notification Types
        </p>
        <div
          className="bg-surface-solid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {types.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < types.length - 1 ? "1px solid var(--border-light)" : "none" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.enabled ? t.bg : "var(--muted)" }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: t.enabled ? t.color : "var(--text-muted)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{t.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t.sub}</p>
                </div>
                <Toggle enabled={t.enabled} onToggle={() => toggleType(t.id)} color={t.color} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quiet hours */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Quiet Hours
        </p>
        <div
          className="bg-surface-solid rounded-2xl p-4"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Mute notifications</p>
              <p className="text-xs text-text-muted mt-0.5">
                From {quietStart} to {quietEnd}
              </p>
            </div>
            <Toggle enabled={quietEnabled} onToggle={() => setQuietEnabled((v) => !v)} />
          </div>
          {quietEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex gap-3"
            >
              <div className="flex-1">
                <p className="text-xs text-text-muted mb-1">Start</p>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full text-sm font-mono rounded-xl px-3 py-2.5 outline-none"
                  style={{
                    background: "var(--muted)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-muted mb-1">End</p>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full text-sm font-mono rounded-xl px-3 py-2.5 outline-none"
                  style={{
                    background: "var(--muted)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>
        <p className="text-xs text-center text-text-muted mt-2 px-2">
          Critical security alerts are always delivered immediately.
        </p>
      </div>
    </div>
  );
}
