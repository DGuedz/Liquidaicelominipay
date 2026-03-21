import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, HelpCircle, MessageSquare, ChevronDown, ChevronUp,
  Send, ExternalLink, Zap, Shield, DollarSign, RotateCcw, CheckCircle2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";

const FAQS = [
  {
    q: "How does the agent move my money without permission?",
    a: "The agent operates within the limits you set (risk profile + transaction limit). It never withdraws to external wallets — only reallocates between authorized DeFi protocols within the vault.",
    icon: Shield,
    color: "#3B82F6",
  },
  {
    q: "What happens if a DeFi protocol is hacked?",
    a: "The agent monitors security alerts 24/7 and automatically exits flagged protocols. We use only audited protocols. Your capital is never concentrated in a single protocol — diversification is automatic.",
    icon: HelpCircle,
    color: "#EF4444",
  },
  {
    q: "When is yield credited to my account?",
    a: "Yield is accrued continuously (per block). The agent consolidates and displays it daily at 08:00. You can withdraw accrued yield at any time without affecting the principal.",
    icon: DollarSign,
    color: "#A3D977",
  },
  {
    q: "How does PIX work with USDm?",
    a: "Via Mento V3: USDm → BRLm (on-chain conversion) → Transfero/Bipa converts to BRL and sends via PIX. The process takes 30 seconds to 2 minutes. Total fee: ~0.5% vs ~1.5% traditional exchange.",
    icon: RotateCcw,
    color: "#10B981",
  },
  {
    q: "Is my money mine? What if LiquidAI closes?",
    a: "100% yes. Your funds are in decentralized DeFi protocols — LiquidAI is just the management interface. You can access your funds directly via MiniPay or any Celo wallet even without the app.",
    icon: Zap,
    color: "#8B5CF6",
  },
];

const QUICK_LINKS = [
  { label: "Technical Documentation", url: "#" },
  { label: "Security Audits", url: "#" },
  { label: "System Status", url: "#" },
  { label: "Discord · Community", url: "#" },
];

export function ProfileSuportePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [supportIssue, setSupportIssue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const issue = String(params.get("issue") || "").trim().toLowerCase();
    const walletAddress = String(params.get("address") || "").trim();
    const at = String(params.get("at") || "").trim();
    if (issue !== "self-timeout") return;

    setSupportIssue("self-timeout");
    const incidentText = [
      "[Self Timeout Incident]",
      walletAddress ? `Wallet: ${walletAddress}` : "Wallet: not provided",
      at ? `Occurred at: ${at}` : `Occurred at: ${new Date().toISOString()}`,
      "Description: Self verification timed out during onboarding.",
      "Action requested: Please assist with verification recovery.",
    ].join("\n");
    setMessage(incidentText);
  }, [location.search]);

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
          <h1 className="font-bold text-text-primary">Support</h1>
          <p className="text-xs text-text-muted">Help Center · LiquidAI</p>
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
            <p className="text-sm font-semibold" style={{ color: "#A3D977" }}>All systems operational</p>
            <p className="text-xs text-text-muted mt-0.5">Agent online · Protocols OK · PIX Online</p>
          </div>
        </motion.div>
      </div>

      {supportIssue === "self-timeout" && (
        <div className="px-5 mb-5">
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "#F59E0B" }}>
              Self timeout incident received
            </p>
            <p className="text-xs mt-1 text-text-muted">
              We prefilled your message with context. Review and send to Support.
            </p>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="px-5 mb-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Frequently Asked Questions
        </p>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={false}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface-solid)" }}
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${faq.color}15`, color: faq.color }}
                  >
                    <faq.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-text-primary pr-2 leading-tight">
                    {faq.q}
                  </span>
                </div>
                {expanded === i ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </button>
              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 pl-[3.25rem]"
                  >
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-5 mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Useful Links
        </p>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_LINKS.map((link, i) => (
            <a
              key={i}
              href={link.url}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "var(--surface-solid)" }}
            >
              <span className="text-sm font-medium text-text-primary">{link.label}</span>
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </a>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="px-5 pb-10">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          Contact Us
        </p>
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface-solid)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Send a message</p>
              <p className="text-xs text-text-muted">We usually reply in under 2h</p>
            </div>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or suggestion..."
            className="w-full h-24 bg-background rounded-xl p-3 text-sm text-text-primary resize-none outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-muted/50"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sent}
            className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: sent ? "#10B981" : "var(--primary-solid)",
              color: sent ? "#fff" : "var(--primary-foreground)",
              opacity: !message.trim() && !sent ? 0.5 : 1
            }}
          >
            {sent ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Sent!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
