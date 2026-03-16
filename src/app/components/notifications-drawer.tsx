import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Bell,
  Activity,
  Shield,
  CheckCircle2,
  Zap,
} from "lucide-react";

// ─── Notification Data ─────────────────────────────────────────────────────────

interface Notification {
  id: number;
  type: "yield" | "rebalance" | "alert" | "tip" | "success" | "protect";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "success",
    title: "Wallet synced",
    body: "Notifications will appear here after the first real agent action.",
    time: "Now",
    read: true,
    icon: Shield,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
  },
];

// ─── Single Notification Item ──────────────────────────────────────────────────

function NotifItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: number) => void;
}) {
  const Icon = notif.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onRead(notif.id)}
      className="flex items-start gap-3 px-5 py-4 relative cursor-pointer"
      style={{
        borderBottom: "1px solid var(--border-light)",
        background: notif.read ? "transparent" : "rgba(163,217,119,0.04)",
      }}
      whileTap={{ backgroundColor: "rgba(163,217,119,0.06)" }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div
          className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full"
          style={{ background: "#A3D977" }}
        />
      )}

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: notif.bg }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: notif.color }} />
      </div>

      <div className="flex-1 min-w-0 pr-5">
        <div
          className="text-sm leading-snug"
          style={{
            color: "var(--text-primary)",
            fontWeight: notif.read ? 400 : 600,
          }}
        >
          {notif.title}
        </div>
        <div
          className="text-xs mt-1 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {notif.body}
        </div>
        <div
          className="text-xs mt-1.5 font-medium"
          style={{ color: notif.color }}
        >
          {notif.time}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Notifications Drawer ──────────────────────────────────────────────────────

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  items?: Notification[];
}

export function NotificationsDrawer({ open, onClose, items }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>(items?.length ? items : INITIAL_NOTIFICATIONS);

  useEffect(() => {
    setNotifications(items?.length ? items : INITIAL_NOTIFICATIONS);
  }, [items]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto rounded-t-3xl overflow-hidden"
            style={{
              maxWidth: 430,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--background)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              maxHeight: "82dvh",
            }}
          >
            {/* Handle */}
            <div className="flex items-center justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "var(--border)" }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--border-light)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                  style={{ background: "rgba(163,217,119,0.12)" }}
                >
                  <Bell className="w-4 h-4" style={{ color: "#A3D977" }} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: "#EF4444", fontSize: "9px", fontWeight: 700 }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Notificações
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {unreadCount > 0
                      ? `${unreadCount} não lidas`
                      : "Todas lidas"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(163,217,119,0.12)",
                      color: "#A3D977",
                    }}
                  >
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "var(--surface-solid)" }}
                >
                  <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
            </div>

            {/* Agent live status */}
            <div
              className="mx-5 my-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
              style={{
                background: "rgba(163,217,119,0.08)",
                border: "1px solid rgba(163,217,119,0.2)",
              }}
            >
              <Activity className="w-4 h-4" style={{ color: "#A3D977" }} />
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: "#A3D977" }}>
                  Agente Online · Monitorando 3 protocolos
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Última ação: Rebalance automático às 03:00
                </p>
              </div>
              <span
                className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                style={{ background: "#A3D977" }}
              />
            </div>

            {/* Notification List */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(82dvh - 180px)" }}
            >
              {notifications.map((n) => (
                <NotifItem key={n.id} notif={n} onRead={markRead} />
              ))}

              {/* Footer */}
              <div className="px-5 py-4 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Mostrando {notifications.length} notificações · Atualizado agora
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Bell button with badge (re-usable) ───────────────────────────────────────

export function BellButton({
  onClick,
  unread = 3,
}: {
  onClick: () => void;
  unread?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 rounded-full flex items-center justify-center"
      style={{ background: "var(--surface-solid)", boxShadow: "0 1px 6px rgba(0,0,0,0.12)" }}
    >
      <Bell className="w-4.5 h-4.5" style={{ color: "var(--text-secondary)" }} />
      {unread > 0 && (
        <span
          className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full flex items-center justify-center"
          style={{ background: "#EF4444", border: "1.5px solid var(--background)" }}
        />
      )}
    </button>
  );
}
