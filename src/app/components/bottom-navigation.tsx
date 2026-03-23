import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { useTheme } from "../hooks/useTheme";
import {
  HomeIcon,
  AnalyticsIcon,
  AgentIcon,
  SavingsIcon,
  ProfileIcon,
} from "./icons";

interface NavItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: AnalyticsIcon, label: "Analytics", path: "/analytics" },
  { icon: AgentIcon, label: "Agent", path: "/agent" },
  { icon: SavingsIcon, label: "Savings", path: "/savings" },
  { icon: ProfileIcon, label: "Profile", path: "/profile" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const navBg = isDark
    ? "rgba(6,13,8,0.96)"
    : "rgba(255,255,255,0.96)";

  const navBorder = isDark
    ? "1px solid rgba(163,217,119,0.1)"
    : "1px solid rgba(13,75,46,0.08)";

  return (
    <nav
      className="w-full z-50 shrink-0"
      style={{
        background: navBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: navBorder,
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Matches root-layout max-width */}
      <div className="flex items-center justify-around mx-auto px-4 py-3" style={{ maxWidth: 430 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === "/home" && location.pathname === "/dashboard");
          const activeColor = "#A3D977";
          const inactiveColor = isDark ? "#3D5C44" : "#9CA3AF";
          const activeBg = isDark
            ? "rgba(163,217,119,0.12)"
            : "rgba(13,75,46,0.1)";

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-2 w-6 h-1 rounded-full"
                  style={{ background: activeColor }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{ background: isActive ? activeBg : "transparent" }}
              >
                <Icon
                  className="w-5 h-5 transition-all duration-200"
                  style={{ color: isActive ? activeColor : inactiveColor }}
                />
              </div>
              <span
                className="text-xs transition-all duration-200"
                style={{
                  color: isActive ? activeColor : inactiveColor,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
