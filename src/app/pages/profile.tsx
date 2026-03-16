import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Bot,
  Star,
  Globe,
  Moon,
  Sun,
  User,
  Wallet,
  FileText,
  Info,
  Zap,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { SelfVerification, SelfVerifiedBadge } from "../components/self-verification";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { apiGet, DashboardPayload, SelfStatusPayload } from "../lib/api";

function shortAddress(address?: string | null) {
  if (!address) return "Wallet not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { address } = useCeloWallet();
  const [selfVerified, setSelfVerified] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    let alive = true;
    if (!address) {
      setSelfVerified(false);
      return () => {
        alive = false;
      };
    }

    apiGet<SelfStatusPayload>("/api/self/status", { address })
      .then((payload) => {
        if (!alive) return;
        setSelfVerified(Boolean(payload?.verified));
      })
      .catch(() => {
        if (!alive) return;
        setSelfVerified(false);
      });

    return () => {
      alive = false;
    };
  }, [address]);

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

  const activeProtocols = dashboard?.liquidityNetwork.connections.length ?? 0;
  const stats = [
    { label: "Active Days", value: dashboard ? "1" : "--" },
    { label: "Operations", value: String(dashboard?.summary.agentOpsToday ?? 0) },
    { label: "Current Yield", value: dashboard ? `$${dashboard.summary.monthlyYieldUsd.toFixed(2)}` : "--" },
  ];

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Personal Data",
          sub: address ? `${shortAddress(address)} · Main Wallet` : "Connect a wallet to continue",
          color: "#0D4B2E",
          bg: isDark ? "rgba(13,75,46,0.25)" : "#E8F5E9",
          route: "/profile/dados",
        },
        {
          icon: Wallet,
          label: "Connected Wallets",
          sub: dashboard
            ? `1 wallet · $${dashboard.summary.balanceUsd.toFixed(2)} total`
            : "No balance synced yet",
          color: "#3B82F6",
          bg: isDark ? "rgba(59,130,246,0.15)" : "#EFF6FF",
          route: "/profile/carteiras",
          status: "Celo",
          statusColor: "#3B82F6",
        },
        {
          icon: Bell,
          label: "Notifications",
          sub: `${dashboard?.summary.agentOpsToday ?? 0} agent events · Push active`,
          color: "#F59E0B",
          bg: isDark ? "rgba(245,158,11,0.15)" : "#FFFBEB",
          route: "/profile/notificacoes",
          badge: dashboard?.summary.agentOpsToday ? 1 : 0,
        },
      ],
    },
    {
      title: "AI Agent",
      items: [
        {
          icon: Shield,
          label: "Security Settings",
          sub: "Agent limits & permissions",
          color: "#3B82F6",
          bg: isDark ? "rgba(59,130,246,0.15)" : "#EFF6FF",
          route: "/profile/security",
          status: "3/3",
          statusColor: "#A3D977",
        },
        {
          icon: Globe,
          label: "Allowed Protocols",
          sub: "Aave, Mento, Moola, Ubeswap, PWN",
          color: "#8B5CF6",
          bg: isDark ? "rgba(139,92,246,0.15)" : "#F5F3FF",
          route: "/profile/protocols",
          status: "5 Active",
          statusColor: "#8B5CF6",
        },
        {
          icon: Sparkles,
          label: "Yield Strategy",
          sub: "Inflation Shield · Auto-mode active",
          color: "#3B82F6",
          bg: isDark ? "rgba(59,130,246,0.15)" : "#EFF6FF",
          route: "/profile/yield",
          status: "Active",
          statusColor: "#A3D977",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: isDark ? Sun : Moon,
          label: "Appearance",
          sub: isDark ? "Dark Mode active" : "Light Mode active",
          color: isDark ? "#A3D977" : "#6B7280",
          bg: isDark ? "rgba(163,217,119,0.12)" : "#F3F4F6",
          onPress: toggleTheme,
        },
        {
          icon: HelpCircle,
          label: "Support",
          sub: "FAQ · Status · Chat",
          color: "#3B82F6",
          bg: isDark ? "rgba(59,130,246,0.15)" : "#EFF6FF",
          route: "/profile/suporte",
        },
        {
          icon: Info,
          label: "About LiquidAI",
          sub: "v2.0.0 · Build Agents V2 · 2026",
          color: "#6B7280",
          bg: isDark ? "rgba(107,114,128,0.15)" : "#F3F4F6",
          route: "/profile/sobre",
        },
      ],
    },
  ];

  return (
    <div className="min-h-dvh bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <h1 className="font-bold text-text-primary" style={{ fontSize: "1.5rem" }}>
          Profile
        </h1>
      </header>

      {/* User Card */}
      <div className="px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-solid rounded-3xl p-5"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden"
                style={{ border: "3px solid #A3D977" }}
              >
                <div className="w-full h-full flex items-center justify-center bg-black/15 text-white font-mono text-sm">
                  {address ? shortAddress(address).slice(0, 4) : "LIQ"}
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#A3D977", border: "2px solid var(--surface-solid)" }}
              >
                <Star className="w-2.5 h-2.5" style={{ color: "#0D4B2E" }} />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-text-primary text-lg">{address ? shortAddress(address) : "LiquidAI User"}</h2>
              <p className="text-sm text-text-muted">
                {dashboard ? `$${dashboard.summary.balanceUsd.toFixed(2)} monitored on Celo Sepolia` : "Connect a wallet to sync"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: isDark ? "rgba(163,217,119,0.15)" : "#E8F5E9", color: "#A3D977" }}
                >
                  ✦ Synced
                </div>
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(163,217,119,0.15)", color: "#A3D977" }}
                >
                  Agent Active
                </div>
                {selfVerified && <SelfVerifiedBadge size="xs" />}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 rounded-2xl overflow-hidden"
            style={{ background: "var(--background)" }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-3"
                style={{ borderLeft: i > 0 ? "1px solid var(--border-light)" : "none" }}
              >
                <span className="font-mono font-bold text-lg text-text-primary">{s.value}</span>
                <span className="text-xs text-text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Self Identity Verification */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Identity · Anti-Sybil
        </p>
        <SelfVerification onVerified={() => setSelfVerified(true)} />
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, si) => (
        <div key={section.title} className="px-5 mb-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
            {section.title}
          </p>
          <div
            className="bg-surface-solid rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
          >
            {section.items.map(({ icon: Icon, label, sub, color, bg, onPress, route, badge, status, statusColor }: any, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: si * 0.1 + i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ backgroundColor: isDark ? "rgba(163,217,119,0.03)" : "rgba(13,75,46,0.02)" }}
                onClick={() => {
                  if (onPress) {
                    onPress();
                  } else if (route) {
                    navigate(route);
                  }
                }}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                style={{
                  borderBottom: i < section.items.length - 1 ? "1px solid var(--border-light)" : "none",
                  cursor: (onPress || route) ? "pointer" : "default",
                }}
              >
                {/* Icon with optional badge count */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  {badge != null && badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: "#EF4444", fontSize: "8px", fontWeight: 700, lineHeight: 1 }}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>

                {/* Label + subtitle */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm">{label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{sub}</p>
                </div>

                {/* Right side: toggle OR status chip + chevron */}
                {onPress ? (
                  <div
                    className="w-10 h-6 rounded-full flex items-center px-1 transition-all duration-300 flex-shrink-0"
                    style={{
                      background: isDark ? "#A3D977" : "#E5E7EB",
                      justifyContent: isDark ? "flex-end" : "flex-start",
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {status && (
                      <span
                        className="px-1.5 py-0.5 rounded-full font-semibold"
                        style={{
                          background: statusColor ? `${statusColor}18` : "rgba(163,217,119,0.12)",
                          color: statusColor ?? "#A3D977",
                          fontSize: "9px",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {status}
                      </span>
                    )}
                    <motion.div whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    </motion.div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      {/* Hackathon Badge */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(163,217,119,0.2)" }}
            >
              <Star className="w-5 h-5" style={{ color: "#A3D977" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                Build Agents for the Real World V2
              </p>
              <p className="text-xs text-white/60 mt-0.5">LiquidAI · Treasury OS · Build Agents V2 · 2026</p>
            </div>
          </div>

          {/* Karma AI PM button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/karma")}
            className="mt-3 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(163,217,119,0.12)" }}
          >
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#A3D977" }} />
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-white">AI Product Manager · Karma</p>
              <p className="text-xs text-white/50">Milestones · Progress · On-chain updates</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "#A3D977" }} />
          </motion.button>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-surface-solid text-destructive font-semibold"
          style={{
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid rgba(239,68,68,0.12)",
          }}
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </motion.button>
      </div>

    </div>
  );
}
