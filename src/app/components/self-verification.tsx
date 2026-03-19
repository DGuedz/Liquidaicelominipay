import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, CheckCircle2, ExternalLink, Fingerprint, X, Zap, RotateCcw } from "lucide-react";
import { CELO_CHAIN_ID } from "../lib/celo-wallet";
import { apiGet, apiPost, SelfPollPayload, SelfRegistrationPayload, SelfStatusPayload } from "../lib/api";
import { ensureWalletAuthSession } from "../lib/wallet-auth";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { useTheme } from "../hooks/useTheme";
import QRCode from "qrcode";

type VerifyState = "idle" | "scanning" | "proving" | "done";

const ZK_STEPS = [
  "Preparing secure verification session...",
  "Creating zero-knowledge proof...",
  "Validating uniqueness without exposing data...",
  "Identity confirmed",
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function QRDecoration() {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,0,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0,0,1,1,0,0,0,1,0,1,0,0,1],
    [1,1,0,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1],
    [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,1,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,0,0,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,0,1,0,0,1,1,0],
  ];
  const size = 6;

  return (
    <svg viewBox={`0 0 ${cells[0].length * size} ${cells.length * size}`} className="w-full h-full">
      {cells.map((row, rowIndex) =>
        row.map((cell, cellIndex) =>
          cell ? (
            <rect
              key={`${rowIndex}-${cellIndex}`}
              x={cellIndex * size}
              y={rowIndex * size}
              width={size - 0.5}
              height={size - 0.5}
              rx="0.8"
              fill="currentColor"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

interface SelfVerificationProps {
  onVerified?: (status: SelfStatusPayload) => void;
}

export function SelfVerification({ onVerified }: SelfVerificationProps) {
  const { isDark } = useTheme();
  const {
    address,
    isConnected,
    isMiniPay,
    hasConnector,
    wrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectWallet,
    switchToCelo,
    signWalletMessage,
  } = useCeloWallet();
  const [state, setState] = useState<VerifyState>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [showQr, setShowQr] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [inlineSuccess, setInlineSuccess] = useState("");
  const [selfActionUrl, setSelfActionUrl] = useState("");
  const [selfQrDataUrl, setSelfQrDataUrl] = useState("");
  const [status, setStatus] = useState<SelfStatusPayload | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const isVerified = Boolean(status?.verified);

  const clearTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const refreshStatus = async (targetAddress = address) => {
    if (!targetAddress) {
      setStatus(null);
      return null;
    }

    const payload = await apiGet<SelfStatusPayload>("/api/self/status", {
      address: targetAddress,
    });
    setStatus(payload);
    return payload;
  };

  useEffect(() => {
    void refreshStatus();
    return () => clearTimers();
  }, [address]);

  useEffect(() => {
    if (!isVerified || !status) return;
    setState("done");
    onVerified?.(status);
  }, [isVerified, onVerified, status]);

  const handleStartScan = async () => {
    setInlineError("");
    setInlineSuccess("");
    setSelfActionUrl("");
    setSelfQrDataUrl("");
    clearTimers();

    if (!hasConnector) {
      setInlineError("No wallet detected. Open in MiniPay or MetaMask and try again.");
      return;
    }

    const formatSelfError = (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to verify with Self.";
      if (/invalididentitycommitmentroot/i.test(message)) {
        return "Self proof failed (Identity root desatualizado). No app Self: Manage ID -> refresh/reconnect o passport e tente novamente.";
      }
      return message;
    };

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
        throw new Error("Wallet address unavailable for Self verification.");
      }

      await ensureWalletAuthSession(walletAddress, signWalletMessage);

      const session = await apiPost<SelfRegistrationPayload>("/api/self/start-registration", {
        address: walletAddress,
      });

      if (!session.sessionToken) {
        throw new Error("Self registration session missing token.");
      }

      const deepLink = session.deepLink || session.qrData || "";
      if (!deepLink) {
        throw new Error("Self registration did not return a deep link or QR payload.");
      }

      const openSelfAction = (url: string) => {
        if (!url) return false;
        if (isMiniPay) {
          window.location.href = url;
          return true;
        }
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        return Boolean(popup);
      };

      setInlineSuccess("Aguardando confirmação no app Self...");
      setSelfActionUrl(deepLink);
      const qrImage = await QRCode.toDataURL(session.qrData || session.deepLink, { width: 220, margin: 1 });
      setSelfQrDataUrl(qrImage);

      const opened = openSelfAction(deepLink);
      if (!opened) {
        setInlineSuccess("Abra o Self manualmente no botao abaixo para continuar.");
      }

      setState("scanning");
      setShowQr(true);

      let verified = false;
      let attempts = 0;
      const isTerminalSelfError = (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error ?? "");
        return /invalididentitycommitmentroot|session not found|expired|registration failed|self api error:\s*400/i.test(
          message,
        );
      };
      while (!verified && attempts < 36) { // 36 * 5s = 180 seconds (3 minutes)
        attempts += 1;
        await sleep(5000);
        try {
          const pollResult = await apiGet<SelfPollPayload>("/api/self/poll-registration", {
            address: walletAddress,
            sessionToken: session.sessionToken,
          });
          if (pollResult.verified) {
            verified = true;
            break;
          }
        } catch (pollError) {
          if (isTerminalSelfError(pollError)) {
            throw pollError instanceof Error ? pollError : new Error(String(pollError));
          }
          console.warn("Self poll failed, retrying:", pollError);
        }
      }

      setShowQr(false);

      if (!verified) {
        throw new Error("Tempo limite da verificacao Self. Tente novamente.");
      }

      setState("proving");
      for (let idx = 0; idx < ZK_STEPS.length; idx += 1) {
        setStepIdx(idx);
        await sleep(800);
      }

      const nextStatus = await refreshStatus(walletAddress);
      if (nextStatus) {
        setStatus(nextStatus);
      }
      setState("done");
    } catch (error) {
      setState("idle");
      setShowQr(false);
      setInlineError(formatSelfError(error));
    }
  };

  const handleReset = async () => {
    if (!address) return;
    setInlineError("");
    try {
      await ensureWalletAuthSession(address, signWalletMessage);
      const nextStatus = await apiPost<SelfStatusPayload>("/api/self/reset", { address });
      setStatus(nextStatus);
      setState("idle");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to reset Self status.");
    }
  };

  if (isVerified && status) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #071A0E 0%, #0F2D1A 100%)"
            : "linear-gradient(135deg, #E8F5E9 0%, #F0FAF0 100%)",
          border: "1px solid rgba(163,217,119,0.35)",
          boxShadow: "0 4px 20px rgba(13,75,46,0.15)",
        }}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(163,217,119,0.18)" }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: "#A3D977" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Identity verified
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {status.provider} · {status.mode} mode
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(163,217,119,0.2)", color: "#A3D977" }}
            >
              ✓ Self
            </div>
          </div>

          <div
            className="rounded-xl px-3 py-2.5 mb-3"
            style={{ background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              Proof reference
            </p>
            <p
              className="font-mono text-xs break-all"
              style={{ color: isDark ? "#A3D977" : "#0D4B2E", fontSize: "10px" }}
            >
              {status.proofRef || "Self verification recorded"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span>Backend-owned verification state. No localStorage bypass.</span>
            </div>
            {status.mode === "mock" && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (showQr) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-solid)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4 flex flex-col items-center">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Open the Self flow
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Scan this real verification QR in the Self app to continue.
          </p>
          {selfQrDataUrl ? (
            <img src={selfQrDataUrl} alt="Self verification QR" className="w-44 h-44 rounded-2xl bg-white p-2 mb-4" />
          ) : null}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-3 h-3" style={{ color: "#A3D977" }} />
            </motion.div>
            Waiting for secure verification handoff...
          </div>
        </div>
      </motion.div>
    );
  }

  if (state === "proving") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-solid)",
          border: "1px solid rgba(163,217,119,0.25)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4 flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(163,217,119,0.12)" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Fingerprint className="w-7 h-7" style={{ color: "#A3D977" }} />
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Validating Self proof
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {ZK_STEPS[stepIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            {ZK_STEPS.map((_, index) => (
              <motion.div
                key={index}
                animate={{ scale: index === stepIdx ? 1.3 : 1 }}
                className="rounded-full"
                style={{
                  width: index === stepIdx ? 8 : 5,
                  height: index === stepIdx ? 8 : 5,
                  background: index <= stepIdx ? "#A3D977" : (isDark ? "#1E3A28" : "#D1D5DB"),
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-solid)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? "rgba(59,130,246,0.15)" : "#EFF6FF" }}
          >
            <Fingerprint className="w-5 h-5" style={{ color: "#3B82F6" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Verify identity
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Powered by{" "}
              <a
                href="https://app.ai.self.xyz/documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#3B82F6" }}
              >
                Self Protocol
              </a>{" "}
              · backend-gated anti-Sybil
            </p>
          </div>
          <a href="https://app.ai.self.xyz/documentation" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          </a>
        </div>

        {[
          { icon: "🔒", text: "Verification state lives on the backend, not only in the browser." },
          { icon: "🛡️", text: "Agent authorization can be blocked until Self verification exists." },
          { icon: "🌐", text: `Current mode: ${status?.mode || "agent"}.` },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-2.5 mb-2.5">
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {item.text}
            </p>
          </div>
        ))}

        {wrongNetwork && (
          <div
            className="rounded-xl px-3 py-2.5 mt-3"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#F59E0B",
            }}
          >
            <p className="text-xs font-semibold">Switch to Celo Sepolia first.</p>
          </div>
        )}

        {inlineError && (
          <div
            className="rounded-xl px-3 py-2.5 mt-3"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#EF4444",
            }}
          >
            <p className="text-xs">{inlineError}</p>
          </div>
        )}

        {inlineSuccess && (
          <div
            className="rounded-xl px-3 py-2.5 mt-3"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.22)",
              color: "#10B981",
            }}
          >
            <p className="text-xs">{inlineSuccess}</p>
          </div>
        )}

        {selfActionUrl && (
          <a
            href={selfActionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 py-2 rounded-xl text-center text-xs font-semibold"
            style={{
              color: "#3B82F6",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.24)",
            }}
          >
            Open Self manually
          </a>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStartScan}
          disabled={isConnecting || isSwitchingChain || isSigningMessage}
          className="w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-semibold"
          style={{
            background: wrongNetwork
              ? "rgba(245,158,11,0.15)"
              : "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
            color: wrongNetwork ? "#F59E0B" : "#FFFFFF",
            boxShadow: wrongNetwork ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
            opacity: isConnecting || isSwitchingChain || isSigningMessage ? 0.75 : 1,
          }}
        >
          <Fingerprint className="w-4 h-4" />
          {isConnecting
            ? "Connecting wallet..."
            : isSwitchingChain
              ? "Switching network..."
              : isSigningMessage
                ? "Authorizing session..."
                : !isConnected
                  ? "Connect wallet to verify"
                  : wrongNetwork
                    ? "Switch to Celo Sepolia"
                    : "Verify with Self"}
        </motion.button>
      </div>
    </div>
  );
}

export function SelfVerifiedBadge({ size = "sm" }: { size?: "xs" | "sm" }) {
  if (size === "xs") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB" }}
      >
        <Shield className="w-2.5 h-2.5" />
        Self ID
      </span>
    );
  }
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: "rgba(37,99,235,0.1)",
        border: "1px solid rgba(37,99,235,0.25)",
      }}
    >
      <Shield className="w-3 h-3" style={{ color: "#2563EB" }} />
      <span className="text-xs font-semibold" style={{ color: "#2563EB" }}>
        Self Verified
      </span>
    </div>
  );
}
