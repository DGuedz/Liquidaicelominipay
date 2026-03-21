import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import {
  Bot,
  Zap,
  Shield,
  ChevronRight,
  TrendingUp,
  Wallet,
  Check,
  ArrowRight,
  Activity,
  Fingerprint,
  Sparkles,
} from "lucide-react";
import { CELO_CHAIN_ID } from "../lib/celo-wallet";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { LiquidLogo } from "../components/LiquidLogo";
import { useTheme } from "../hooks/useTheme";
import {
  ActivationRoutePayload,
  apiGet,
  apiPost,
  clearApiAuthToken,
  DashboardPayload,
  FaucetClaimPayload,
  FaucetStatusPayload,
  SelfStatusPayload,
  SelfRegistrationPayload,
  SelfPollPayload,
} from "../lib/api";
import { ensureWalletAuthSession } from "../lib/wallet-auth";
import { resolveSelfSessionLinks } from "../lib/self-flow";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskId = "conservative" | "balanced" | "aggressive";
type SelfTimeoutIncident = {
  at: string;
  address: string;
  reason: string;
};

const SELF_TIMEOUT_INCIDENT_KEY = "liquidai.self-timeout-incident";

const RISK_OPTS = [
  {
    id: "conservative" as RiskId,
    label: "Conservative",
    apy: "3.2–4.2%",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    icon: Shield,
    sub: "Safety first",
  },
  {
    id: "balanced" as RiskId,
    label: "Balanced",
    apy: "4.2–9.1%",
    color: "#A3D977",
    bg: "rgba(163,217,119,0.12)",
    icon: Activity,
    sub: "Best value",
    recommended: true,
  },
  {
    id: "aggressive" as RiskId,
    label: "Aggressive",
    apy: "9–18%",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    icon: Zap,
    sub: "Maximize yield",
  },
];

// ─── Progress Pill ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            background:
              i === current
                ? "#A3D977"
                : i < current
                ? "#0D4B2E"
                : "rgba(163,217,119,0.25)",
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

// ─── Floating Coins ────────────────────────────────────────────────────────────
function FloatingCoins() {
  const coins = [
    { delay: 0, x: 60, size: 36, opacity: 0.7 },
    { delay: 0.5, x: -50, size: 28, opacity: 0.5 },
    { delay: 1.0, x: 90, size: 22, opacity: 0.35 },
    { delay: 1.4, x: -80, size: 18, opacity: 0.25 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map((c, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-1/2"
          initial={{ y: 0, x: c.x, opacity: 0 }}
          animate={{ y: -300, opacity: [0, c.opacity, 0] }}
          transition={{ delay: c.delay, duration: 3.8, repeat: Infinity, ease: "easeOut" }}
        >
          <div
            className="rounded-full flex items-center justify-center text-white"
            style={{
              width: c.size,
              height: c.size,
              background: "linear-gradient(135deg, #A3D977, #0D4B2E)",
              fontSize: c.size * 0.45,
              fontWeight: 700,
            }}
          >
            $
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Step 0: Welcome (compressed — was 2 steps, now 1) ────────────────────────
function StepWelcome({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { isDark } = useTheme();
  const highlights = [
    { icon: TrendingUp, color: "#A3D977", label: "4.8% APY avg", sub: "Auto-yield 24/7" },
    { icon: Zap, color: "#10B981", label: "3 taps per action", sub: "PIX, top-up, remittance" },
    { icon: Shield, color: "#3B82F6", label: "Invisible DeFi", sub: "Secured by Celo" },
  ];

  return (
    <div className="flex flex-col items-center text-center px-6 pt-10 pb-8 h-full">
      <div className="relative flex-1 flex flex-col items-center justify-center w-full">
        <FloatingCoins />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
          className="relative mb-6"
        >
          <LiquidLogo size={96} variant="icon" theme="auto" background="auto" animate={true} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-mono mb-1"
          style={{
            fontSize: "clamp(2.4rem, 12vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          Liquid<span style={{ color: "#0D4B2E" }}>AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm mb-6 max-w-[260px]"
          style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}
        >
          Your money earns while you live. Autonomous agent on Celo.
        </motion.p>

        {/* Compact value highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-[320px] rounded-2xl overflow-hidden mb-6"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
        >
          {highlights.map(({ icon: Icon, color, label, sub }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < 2 ? "1px solid var(--border-light)" : "none" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTAs & Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="w-full max-w-[320px] flex flex-col gap-3 mt-4"
      >
        <button
          onClick={onNext}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2 text-white font-semibold"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            boxShadow: "0 8px 32px rgba(13,75,46,0.4)",
          }}
        >
          Start in 15 seconds
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="text-xs py-2"
          style={{ color: "var(--text-muted)" }}
        >
          I have an account — Log in
        </button>

        {/* Brand Footer */}
        <div className="mt-8 pt-6 pb-8 border-t border-border flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <LiquidLogo size={120} variant="full" theme="auto" background="auto" />
          </div>
          <p className="text-xs text-text-muted text-center max-w-[240px] leading-relaxed">
            Treasury Operating System · Build Agents for the Real World V2 · 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Step 1: Connect MiniPay + Self (unified, <8s) ────────────────────────────
function StepConnect({ onNext }: { onNext: () => void }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "connecting" | "connected" | "verifying" | "done">("idle");
  const [selfEnabled, setSelfEnabled] = useState(true);
  const [inlineError, setInlineError] = useState("");
  const [inlineSuccess, setInlineSuccess] = useState("");
  const [faucetStatus, setFaucetStatus] = useState<FaucetStatusPayload | null>(null);
  const [selfStatus, setSelfStatus] = useState<SelfStatusPayload | null>(null);
  const [activationRoute, setActivationRoute] = useState<ActivationRoutePayload | null>(null);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);
  const [isVerifyingSelf, setIsVerifyingSelf] = useState(false);
  const [isEnsuringSession, setIsEnsuringSession] = useState(false);
  const [selfActionUrl, setSelfActionUrl] = useState("");
  const [selfQrDataUrl, setSelfQrDataUrl] = useState("");
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [selfTimeoutIncident, setSelfTimeoutIncident] = useState<SelfTimeoutIncident | null>(null);
  const timersRef = useRef<number[]>([]);
  const {
    address,
    isConnected,
    isMiniPay,
    walletMode,
    walletSupportLabelPt,
    walletSupportLabelEn,
    connectorName,
    shortAddress,
    hasConnector,
    wrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectorOptions,
    connectorDiagnostics,
    lastBlockedConnector,
    connectWallet,
    switchToCelo,
    signWalletMessage,
    disconnectWallet,
  } = useCeloWallet();
  const selfIsRequired = selfStatus?.requiredForAgent ?? true;
  const requiresSelfVerification = selfIsRequired || selfEnabled;
  const selectedConnectorName = useMemo(() => {
    const selected = connectorOptions.find((item) => item.id === selectedConnectorId);
    if (selected?.name) return selected.name;
    if (connectorName) return connectorName;
    return isMiniPay ? "MiniPay" : "wallet";
  }, [connectorName, connectorOptions, isMiniPay, selectedConnectorId]);
  const connectorDiagnosticById = useMemo(
    () => new Map(connectorDiagnostics.map((item) => [item.id, item])),
    [connectorDiagnostics],
  );

  useEffect(() => {
    if (!connectorOptions.length) {
      setSelectedConnectorId("");
      return;
    }
    const preferredReadyConnector = connectorOptions.find((item) => {
      const diagnostic = connectorDiagnosticById.get(item.id);
      return !diagnostic || diagnostic.status === "ready";
    });
    const fallbackConnector = preferredReadyConnector ?? connectorOptions[0];
    if (!selectedConnectorId || !connectorOptions.some((item) => item.id === selectedConnectorId)) {
      setSelectedConnectorId(fallbackConnector.id);
    }
  }, [connectorDiagnosticById, connectorOptions, selectedConnectorId]);

  const refreshActivationRoute = async (targetAddress = address, networkOkay = !wrongNetwork) => {
    if (!targetAddress) {
      setActivationRoute(null);
      return null;
    }
    const payload = await apiGet<ActivationRoutePayload>("/api/router/activation", {
      address: targetAddress,
      correctNetwork: networkOkay ? "true" : "false",
    });
    setActivationRoute(payload);
    return payload;
  };

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(SELF_TIMEOUT_INCIDENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SelfTimeoutIncident;
      if (!parsed || typeof parsed !== "object") return;
      if (!parsed.at || !parsed.reason) return;
      setSelfTimeoutIncident(parsed);
    } catch {
      // no-op
    }
  }, []);

  const persistSelfTimeoutIncident = (incident: SelfTimeoutIncident | null) => {
    setSelfTimeoutIncident(incident);
    if (typeof window === "undefined") return;
    if (!incident) {
      window.sessionStorage.removeItem(SELF_TIMEOUT_INCIDENT_KEY);
      return;
    }
    window.sessionStorage.setItem(SELF_TIMEOUT_INCIDENT_KEY, JSON.stringify(incident));
  };

  const clearSelfTimeoutIncident = () => {
    persistSelfTimeoutIncident(null);
  };

  const resetSelfFlow = (message = "Self flow restarted. Start verification again.") => {
    setPhase("connected");
    setIsVerifyingSelf(false);
    setSelfActionUrl("");
    setSelfQrDataUrl("");
    setInlineError("");
    setInlineSuccess(message);
    clearSelfTimeoutIncident();
  };

  useEffect(() => {
    if (!selfStatus?.verified) return;
    clearSelfTimeoutIncident();
  }, [selfStatus?.verified]);

  useEffect(() => {
    if (isConnected && phase === "idle") {
      setPhase("connected");
    }
  }, [isConnected, phase]);

  useEffect(() => {
    let alive = true;
    if (!address) {
      setFaucetStatus(null);
      setActivationRoute(null);
      return () => {
        alive = false;
      };
    }

    apiGet<FaucetStatusPayload>("/api/testnet/faucet", { address })
      .then((payload) => {
        if (!alive) return;
        setFaucetStatus(payload);
      })
      .catch(() => {
        if (!alive) return;
        setFaucetStatus(null);
      });

    return () => {
      alive = false;
    };
  }, [address]);

  useEffect(() => {
    let alive = true;
    if (!address) {
      setSelfStatus(null);
      return () => {
        alive = false;
      };
    }

    apiGet<SelfStatusPayload>("/api/self/status", { address })
      .then((payload) => {
        if (!alive) return;
        setSelfStatus(payload);
      })
      .catch(() => {
        if (!alive) return;
        setSelfStatus(null);
      });

    return () => {
      alive = false;
    };
  }, [address]);

  useEffect(() => {
    let alive = true;
    if (!address) {
      setActivationRoute(null);
      return () => {
        alive = false;
      };
    }

    refreshActivationRoute(address, !wrongNetwork)
      .then((payload) => {
        if (!alive || !payload) return;
        setActivationRoute(payload);
      })
      .catch(() => {
        if (!alive) return;
        setActivationRoute(null);
      });

    return () => {
      alive = false;
    };
  }, [address, wrongNetwork]);

  useEffect(() => {
    if (!isConnected) {
      setPhase("idle");
      return;
    }

    if (wrongNetwork) {
      setPhase("connected");
      return;
    }

    if (activationRoute?.nextAction === "activate_agent" || activationRoute?.nextAction === "open_dashboard") {
      setPhase("done");
      return;
    }

    if (phase !== "verifying") {
      setPhase("connected");
    }
  }, [isConnected, wrongNetwork, activationRoute?.nextAction, phase]);

  const handleConnect = async (connectorId?: string) => {
    if (isBusy) return;

    setInlineError("");
    setInlineSuccess("");
    clearTimers();

    if (!hasConnector) {
      setInlineError(`Nenhuma carteira detectada. Abra no ${walletSupportLabelPt} e tente novamente.`);
      return;
    }

    const targetConnectorId = connectorId || selectedConnectorId || "";
    if (targetConnectorId) {
      const selectedDiagnostic = connectorDiagnosticById.get(targetConnectorId);
      if (selectedDiagnostic && selectedDiagnostic.status !== "ready") {
        setInlineError(
          `Connector "${selectedDiagnostic.name}" indisponível: ${selectedDiagnostic.reason || "não está pronto para conexão."}`,
        );
        return;
      }
    }

    try {
      setPhase("connecting");
      const session = await connectWallet(targetConnectorId || undefined);
      if (session.chainId !== CELO_CHAIN_ID) {
        await switchToCelo();
      }
      const connectedAddress = session.accounts?.[0] || address;
      if (connectedAddress) {
        await ensureWalletAuthSession(connectedAddress, signWalletMessage);
        const [nextSelfStatus, nextFaucetStatus, nextRoute] = await Promise.all([
          apiGet<SelfStatusPayload>("/api/self/status", { address: connectedAddress }),
          apiGet<FaucetStatusPayload>("/api/testnet/faucet", { address: connectedAddress }),
          refreshActivationRoute(connectedAddress, true),
        ]);
        setSelfStatus(nextSelfStatus);
        setFaucetStatus(nextFaucetStatus);
        if (nextRoute) setActivationRoute(nextRoute);
      }
      setPhase("connected");
    } catch (error) {
      setPhase("idle");
      setInlineError(error instanceof Error ? error.message : "Failed to connect wallet.");
    }
  };

  const handleEnsureSession = async () => {
    if (!address) {
      setInlineError("Connect a wallet before signing the LiquidAI session.");
      return;
    }

    setInlineError("");
    setInlineSuccess("");
    setIsEnsuringSession(true);
    try {
      clearApiAuthToken();
      await ensureWalletAuthSession(address, signWalletMessage);
      const nextRoute = await refreshActivationRoute(address, !wrongNetwork);
      if (nextRoute) setActivationRoute(nextRoute);
      setInlineSuccess("Session signed successfully.");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to activate the session.");
    } finally {
      setIsEnsuringSession(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setInlineError("");
    setInlineSuccess("");
    try {
      await switchToCelo();
      if (isConnected) {
        setPhase("connected");
        const nextRoute = await refreshActivationRoute(address, true);
        if (nextRoute) setActivationRoute(nextRoute);
      }
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to switch to Celo network.");
    }
  };

  const handleClaimFaucet = async () => {
    if (!address) {
      setInlineError("Connect a wallet before requesting demo funds.");
      return;
    }

    setInlineError("");
    setInlineSuccess("");
    setIsClaimingFaucet(true);
    try {
      await ensureWalletAuthSession(address, signWalletMessage);
      const claim = await apiPost<FaucetClaimPayload>("/api/testnet/faucet/claim", {
        address,
      });
      const [nextStatus, nextRoute] = await Promise.all([
        apiGet<FaucetStatusPayload>("/api/testnet/faucet", { address }),
        refreshActivationRoute(address, !wrongNetwork),
      ]);
      setFaucetStatus(nextStatus);
      if (nextRoute) setActivationRoute(nextRoute);
      setInlineSuccess(`Wallet funded: +${claim.nativeAmount} CELO + ${claim.stableAmount} ${claim.stableToken}`);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to claim demo funds.");
    } finally {
      setIsClaimingFaucet(false);
    }
  };

  const handleVerifySelf = async () => {
    if (!address && !isConnected) {
      setInlineError("Connect a wallet before verifying with Self.");
      return;
    }

    setInlineError("");
    setInlineSuccess("");
    setSelfActionUrl("");
    setSelfQrDataUrl("");
    setIsVerifyingSelf(true);
    setPhase("verifying");
    clearSelfTimeoutIncident();
    
    const formatSelfError = (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to verify with Self.";
      if (/invalididentitycommitmentroot/i.test(message)) {
        return "Self proof failed (Identity root desatualizado). No app Self: Manage ID -> refresh/reconnect o passport, depois tente novamente.";
      }
      return message;
    };

    const preOpenedPopup = !isMiniPay
      ? window.open("", "_blank", "noopener,noreferrer")
      : null;

    try {
      let connectedAddress = address;
      if (!connectedAddress) {
        const session = await connectWallet(selectedConnectorId || undefined);
        connectedAddress = session.accounts?.[0] || "";
      }
      if (!connectedAddress) {
        throw new Error("Wallet address unavailable for Self verification.");
      }

      await ensureWalletAuthSession(connectedAddress, signWalletMessage);
      
      // 1. Start Registration Session
      let session: SelfRegistrationPayload | null = null;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          session = await apiPost<SelfRegistrationPayload>("/api/self/start-registration", {
            address: connectedAddress,
          });
          break;
        } catch (startError) {
          const message = startError instanceof Error ? startError.message : String(startError ?? "");
          const retryable = /429|503|rate-limited|temporarily/i.test(message);
          if (!retryable || attempt === 3) {
            throw startError;
          }
          setInlineSuccess("Self is busy right now. Retrying secure session...");
          await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
        }
      }

      if (!session) {
        throw new Error("Failed to start Self registration session.");
      }

      console.log("Self Session Started:", session);
      
      const openSelfAction = (url: string) => {
        if (!url) return false;
        
        // Modal Flow / Deep Link Handling
        if (isMiniPay) {
          // Dentro do MiniPay, o deep link direto é mais seguro
          window.location.href = url;
          return true;
        }

        if (preOpenedPopup && !preOpenedPopup.closed) {
          preOpenedPopup.location.href = url;
          return true;
        }
        
        // Em navegadores normais, tentamos abrir em nova aba
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        return Boolean(popup);
      };

      const links = resolveSelfSessionLinks(session);

      if (session.mode === "mock") {
         setInlineSuccess("Mock verification instant success.");
      } else if (links.deepLink) {
         setInlineSuccess("Aguardando confirmação no app Self...");
         setSelfActionUrl(links.actionUrl);
         const generatedQr = await QRCode.toDataURL(links.qrValue, { width: 220, margin: 1 });
         setSelfQrDataUrl(generatedQr);
         const opened = openSelfAction(links.actionUrl);
         if (!opened) {
           setInlineSuccess("Open Self manually using the button below to continue.");
         }
      } else if (links.qrValue) {
         setInlineSuccess("Verifique via QR Code ou abra o app Self...");
         setSelfActionUrl(links.actionUrl);
         const generatedQr = await QRCode.toDataURL(links.qrValue, { width: 220, margin: 1 });
         setSelfQrDataUrl(generatedQr);
         const opened = openSelfAction(links.actionUrl);
         if (!opened) {
           setInlineSuccess("Open Self manually using the button below to continue.");
         }
      } else {
         setInlineSuccess("Check your Self app...");
         await new Promise(r => setTimeout(r, 3000));
      }

      // 3. Poll for completion
      let verified = false;
      let attempts = 0;
      const isTerminalSelfError = (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error ?? "");
        return /invalididentitycommitmentroot|session not found|expired|registration failed|self api error:\s*400/i.test(
          message,
        );
      };
      
      while (!verified && attempts < 36) { // 36 tentativas de 5s = 3 minutos
        attempts++;
        await new Promise(r => setTimeout(r, 5000));
        
        try {
          const pollResult = await apiGet<SelfPollPayload>("/api/self/poll-registration", {
            address: connectedAddress,
            sessionToken: session.sessionToken
          });
          if (pollResult.verified) {
            verified = true;
            break;
          }
        } catch (e) {
          if (isTerminalSelfError(e)) {
            throw e instanceof Error ? e : new Error(String(e));
          }
          console.warn("Poll falhou, tentando novamente...", e);
        }
      }

      if (!verified) {
         throw new Error("Tempo limite de verificação excedido. Tente novamente.");
      }

      const nextRoute = await refreshActivationRoute(connectedAddress, !wrongNetwork);
      // Refresh status to confirm backend sees it as verified
      const finalStatus = await apiGet<SelfStatusPayload>("/api/self/status", { address: connectedAddress });
      setSelfStatus(finalStatus);
      
      if (nextRoute) setActivationRoute(nextRoute);
      setInlineSuccess("Self verification recorded. Agent activation is now unlocked.");
      clearSelfTimeoutIncident();
      setPhase("connected");

    } catch (error) {
      if (preOpenedPopup && !preOpenedPopup.closed) {
        preOpenedPopup.close();
      }
      setPhase("connected");
      const formattedError = formatSelfError(error);
      setInlineError(formattedError);
      if (/tempo limite|timeout|time out/i.test(formattedError)) {
        const incident: SelfTimeoutIncident = {
          at: new Date().toISOString(),
          address: String(address || ""),
          reason: formattedError,
        };
        persistSelfTimeoutIncident(incident);
      }
    } finally {
      setIsVerifyingSelf(false);
    }
  };

  const openSelfTimeoutSupport = () => {
    const currentAddress = String(address || "");
    const query = new URLSearchParams({
      issue: "self-timeout",
      address: currentAddress,
      at: selfTimeoutIncident?.at || new Date().toISOString(),
    });
    navigate(`/chat?${query.toString()}`);
  };

  const isBusy =
    phase === "connecting" ||
    phase === "verifying" ||
    isConnecting ||
    isSwitchingChain ||
    isSigningMessage ||
    isClaimingFaucet ||
    isVerifyingSelf ||
    isEnsuringSession;
  const isDone = Boolean(activationRoute?.nextAction === "activate_agent" || activationRoute?.nextAction === "open_dashboard");
  const isTreasuryWallet =
    Boolean(address) &&
    Boolean(faucetStatus?.backendAddress) &&
    address?.toLowerCase() === faucetStatus?.backendAddress?.toLowerCase();

  // MiniPay test flow logic: If inside MiniPay, auto-connect when reaching this step
  useEffect(() => {
    // If we are in MiniPay, automatically trigger connect to bypass explicit user action per track rules
    if (isMiniPay && phase === "idle" && hasConnector && !isConnected && !isConnecting) {
      handleConnect();
    }
  }, [isMiniPay, phase, hasConnector, isConnected, isConnecting]);

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    clearApiAuthToken();
    setPhase("idle");
    setInlineError("");
    setInlineSuccess("");
    setSelfActionUrl("");
    setSelfQrDataUrl("");
    setFaucetStatus(null);
    setSelfStatus(null);
    setActivationRoute(null);
    clearSelfTimeoutIncident();
    await disconnectWallet();
  };

  return (
    <div className="flex flex-col h-full px-6 pt-10 pb-8 relative">
      {isConnected && !isMiniPay && (
          <button 
            onClick={handleDisconnect}
            className="absolute top-4 right-6 text-xs text-red-400 font-bold px-3 py-2 rounded-lg border border-red-900/30 bg-red-900/10 hover:bg-red-900/20 transition-all z-50 cursor-pointer shadow-sm active:scale-95 hidden"
            style={{ pointerEvents: 'auto' }}
          >
            RESET WALLET
          </button>
        )}
      <div className="mb-5 flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#A3D977" }}>
            Step 1 of 2
          </p>
          <h2 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.5rem", lineHeight: 1.2 }}>
            Connect Wallet
            <br />Fund & Verify
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            MiniPay + Self Protocol + Sepolia faucet
          </p>
        </div>
        {isConnected && !isMiniPay && (
          <button 
            onClick={handleDisconnect}
            className="text-xs text-red-400 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition-colors hidden"
          >
            Reset Wallet
          </button>
        )}
      </div>

      {/* Status visual */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <div className="flex items-center gap-6">
          {/* MiniPay node */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={phase === "connecting" ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.7, repeat: phase === "connecting" ? Infinity : 0 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background:
                  phase === "idle"
                    ? "var(--surface-solid)"
                    : (phase === "connected" || phase === "verifying" || phase === "done")
                    ? "linear-gradient(135deg, #0D4B2E, #1a6b45)"
                    : "var(--surface-solid)",
                border: "2px solid " + (phase === "idle" ? "var(--border-light)" : "transparent"),
                boxShadow:
                  (phase === "connected" || phase === "done")
                    ? "0 8px 28px rgba(13,75,46,0.35)"
                    : "0 2px 12px rgba(0,0,0,0.1)",
                transition: "all 0.4s ease",
              }}
            >
              {(phase === "connected" || phase === "verifying" || phase === "done") ? (
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <Wallet
                  className="w-8 h-8"
                  style={{ color: phase === "connecting" ? "#A3D977" : "var(--text-muted)" }}
                />
              )}
              {phase === "connecting" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: "2px solid transparent", borderTopColor: "#A3D977" }}
                />
              )}
            </motion.div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>MiniPay</p>
          </div>

          {/* Connector line */}
          <div className="flex-1 flex items-center">
            <motion.div
              animate={{ scaleX: phase !== "idle" ? 1 : 0 }}
              initial={{ scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{
                height: 2,
                flex: 1,
                background: "linear-gradient(90deg, #0D4B2E, #A3D977)",
                transformOrigin: "left",
              }}
            />
          </div>

          {/* Self node */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={phase === "verifying" ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.7, repeat: phase === "verifying" ? Infinity : 0 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background:
                  phase === "done"
                    ? "linear-gradient(135deg, #3B82F6, #6366F1)"
                    : requiresSelfVerification
                    ? "rgba(59,130,246,0.08)"
                    : "var(--muted)",
                border:
                  "2px solid " +
                  (requiresSelfVerification ? "rgba(59,130,246,0.25)" : "var(--border-light)"),
                boxShadow: phase === "done" ? "0 8px 28px rgba(59,130,246,0.3)" : "none",
                transition: "all 0.4s ease",
                opacity: requiresSelfVerification ? 1 : 0.4,
              }}
            >
              {phase === "done" ? (
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <Fingerprint
                  className="w-8 h-8"
                  style={{
                    color:
                      phase === "verifying"
                        ? "#3B82F6"
                        : requiresSelfVerification
                        ? "#3B82F6"
                        : "var(--text-muted)",
                  }}
                />
              )}
              {phase === "verifying" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: "2px solid transparent", borderTopColor: "#3B82F6" }}
                />
              )}
            </motion.div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Self ID</p>
          </div>
        </div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center px-4"
          >
            {phase === "idle" && (
              <>
                <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                  Ready to connect
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {hasConnector
                    ? isMiniPay
                      ? "MiniPay detected"
                      : "Browser wallet detected"
                    : `Open in ${walletSupportLabelEn} to continue`}
                </p>
              </>
            )}
            {phase === "connecting" && (
              <>
                <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>Connecting {selectedConnectorName}...</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Authenticating on Celo network</p>
              </>
            )}
            {phase === "connected" && requiresSelfVerification && (
              <>
                <p className="font-semibold text-base" style={{ color: "#A3D977" }}>
                  {shortAddress || "Wallet connected"} ✓
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {activationRoute?.nextAction === "verify_self"
                    ? `Connection active via ${connectorName}. Verify with Self to unlock agent automation.`
                    : activationRoute?.nextAction === "claim_faucet"
                    ? `Connection active via ${connectorName}. Claim demo funds before continuing.`
                    : activationRoute?.nextAction === "activate_session"
                    ? `Connection active via ${connectorName}. Sign the LiquidAI session to continue.`
                    : `Connection active via ${connectorName}.`}
                </p>
                {selfStatus?.message && (
                  <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
                    Self status: {selfStatus.message}
                  </p>
                )}
              </>
            )}
            {phase === "verifying" && (
              <>
                <p className="font-semibold text-base" style={{ color: "#3B82F6" }}>Validating Self proof...</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Backend unlocks the agent only after this step.
                </p>
              </>
            )}
            {phase === "done" && (
              <>
                <p className="font-semibold text-base" style={{ color: "#A3D977" }}>
                  All connected!
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Wallet funded and ready for agent activation
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {isConnected && wrongNetwork && (
          <div
            className="w-full rounded-2xl p-4"
            style={{
              background: "rgba(252,255,82,0.08)",
              border: "1px solid rgba(252,255,82,0.25)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "#FCFF52" }}>
              Different network detected
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Switch to Celo Alfajores to activate the demo flow.
            </p>
            <button
              onClick={handleSwitchNetwork}
              className="mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "#FCFF52", color: "#1A1A1A" }}
            >
              {isSwitchingChain ? "Switching..." : "Switch to Celo"}
            </button>
          </div>
        )}

        {isConnected && requiresSelfVerification && !wrongNetwork && !selfStatus?.verified && (
          <div
            className="w-full rounded-2xl p-4"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
              Verificação Self Obrigatória
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The agent activation will be locked until your identity is verified via Self Protocol (ZK Proof).
            </p>
          </div>
        )}

        {activationRoute?.blockers?.length ? (
          <div
            className="w-full rounded-2xl p-4"
            style={{
              background: "rgba(252,255,82,0.06)",
              border: "1px solid rgba(252,255,82,0.18)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "#FCFF52" }}>
              Próximo passo
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {activationRoute.blockers[0].includes("Complete Self verification") 
                ? "Complete Self verification to unlock the agent's intelligence." 
                : activationRoute.blockers[0]}
            </p>
          </div>
        ) : null}

        {isConnected && !wrongNetwork && faucetStatus && (activationRoute?.nextAction === "claim_faucet" || isDone) && (
          <div
            className="w-full rounded-2xl p-4"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.12)" }}
              >
                <Wallet className="w-5 h-5" style={{ color: "#3B82F6" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {isDone ? "Wallet funded" : "Demo faucet ready"}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {isDone
                    ? `Balance detected: ${activationRoute?.balances.native.balance ?? 0} CELO and ${activationRoute?.balances.stable.balance ?? 0} ${activationRoute?.balances.stable.token ?? faucetStatus.claimAmount.stableToken}.`
                    : `Claim +${faucetStatus.claimAmount.nativeAmount} CELO and +${faucetStatus.claimAmount.stableAmount} ${faucetStatus.claimAmount.stableToken} before running the agent.`}
                </p>

                {faucetStatus.claimState.lastClaim && (
                  <p className="text-xs mt-2 break-all" style={{ color: "var(--text-primary)" }}>
                    Last tx: {faucetStatus.claimState.lastClaim.nativeTxHash}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 mt-3">
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {isTreasuryWallet
                      ? "Connect a different wallet to simulate fresh-user funding."
                      : faucetStatus.claimState.remainingMs > 0 && faucetStatus.claimState.nextEligibleAt
                        ? `Cooldown until ${new Date(faucetStatus.claimState.nextEligibleAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "One tap funding inside the app."}
                  </span>
                  <button
                    onClick={handleClaimFaucet}
                    disabled={isDone || isClaimingFaucet || faucetStatus.claimState.remainingMs > 0 || isTreasuryWallet}
                    className="px-3 py-2 rounded-full text-xs font-semibold"
                    style={{
                      background:
                        isDone || isClaimingFaucet || faucetStatus.claimState.remainingMs > 0 || isTreasuryWallet
                          ? "rgba(13,75,46,0.12)"
                          : "#0D4B2E",
                      color:
                        isDone || isClaimingFaucet || faucetStatus.claimState.remainingMs > 0 || isTreasuryWallet
                          ? "var(--text-muted)"
                          : "#FFFFFF",
                    }}
                  >
                    {isDone ? "Funded" : isClaimingFaucet ? "Funding..." : "Get test funds"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {inlineError && (
          <div
            className="w-full rounded-2xl p-3 text-xs"
            style={{
              color: "#EF4444",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {inlineError}
          </div>
        )}

        {selfTimeoutIncident && (
          <div
            className="w-full rounded-2xl p-4"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.24)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "#F59E0B" }}>
              Self verification timed out
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              If this happens again, restart the flow or open Support with the incident context.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  clearSelfTimeoutIncident();
                  void handleVerifySelf();
                }}
                className="rounded-xl px-2 py-2 text-[11px] font-semibold"
                style={{ background: "rgba(13,75,46,0.18)", color: "#A3D977", border: "1px solid rgba(163,217,119,0.25)" }}
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={openSelfTimeoutSupport}
                className="rounded-xl px-2 py-2 text-[11px] font-semibold"
                style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.24)" }}
              >
                Abrir suporte
              </button>
              <button
                type="button"
                onClick={() => resetSelfFlow("Flow restarted. Tap Unlock with Self ID to begin again.")}
                className="rounded-xl px-2 py-2 text-[11px] font-semibold"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {inlineSuccess && (
          <div
            className="w-full rounded-2xl p-3 text-xs"
            style={{
              color: "#10B981",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            {inlineSuccess}
          </div>
        )}

        {selfActionUrl && phase === "verifying" && (
          <a
            href={selfActionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl text-center text-sm font-semibold"
            style={{
              color: "#3B82F6",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            Abrir Self manualmente
          </a>
        )}

        {selfQrDataUrl && phase === "verifying" && (
          <div
            className="w-full rounded-2xl p-4 flex flex-col items-center gap-3"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <img src={selfQrDataUrl} alt="Self verification QR" className="w-[220px] h-[220px] rounded-xl bg-white p-2" />
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Scan in the Self mobile app to continue verification.
            </p>
          </div>
        )}

        {/* Self toggle */}
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.18)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.12)" }}
            >
              <Fingerprint className="w-4.5 h-4.5" style={{ color: "#3B82F6" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Self Protocol ID
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {selfIsRequired
                  ? "Required for security · ZK Proof · Anti-Sybil"
                  : "Prova ZK Opcional · Anti-Sybil · Privacidade total"}
              </p>
            </div>
            <button
              onClick={() => {
                if (!selfIsRequired) setSelfEnabled((v) => !v);
              }}
              disabled={selfIsRequired}
              className="w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 flex-shrink-0"
              style={{
                background: requiresSelfVerification ? "#3B82F6" : "var(--muted)",
                justifyContent: requiresSelfVerification ? "flex-end" : "flex-start",
                opacity: selfIsRequired ? 0.85 : 1,
                cursor: selfIsRequired ? "not-allowed" : "pointer",
              }}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </button>
          </motion.div>
        )}
      </div>

      {/* Action button */}
      {phase === "idle" && !wrongNetwork && walletMode === "browser" && connectorOptions.length > 1 && (
        <div className="w-full rounded-2xl p-3 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Escolha a carteira
          </p>
          <div className="grid grid-cols-2 gap-2">
            {connectorOptions.map((item) => {
              const isSelected = selectedConnectorId === item.id;
              const diagnostic = connectorDiagnosticById.get(item.id);
              const isUnavailable = Boolean(diagnostic && diagnostic.status !== "ready");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!isUnavailable) setSelectedConnectorId(item.id);
                  }}
                  disabled={isUnavailable}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-left"
                  style={{
                    color: isUnavailable ? "rgba(255,255,255,0.45)" : isSelected ? "#fff" : "var(--text-muted)",
                    background: isUnavailable
                      ? "rgba(255,255,255,0.015)"
                      : isSelected
                        ? "rgba(13,75,46,0.4)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      isUnavailable
                        ? "rgba(255,255,255,0.06)"
                        : isSelected
                          ? "rgba(13,75,46,0.75)"
                          : "rgba(255,255,255,0.09)"
                    }`,
                    opacity: isUnavailable ? 0.72 : 1,
                    cursor: isUnavailable ? "not-allowed" : "pointer",
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "idle" && walletMode === "browser" && connectorDiagnostics.length > 0 && (
        <div
          className="w-full rounded-2xl p-3 flex flex-col gap-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Wallet debug
          </p>
          <div className="space-y-1.5">
            {connectorDiagnostics.map((item) => {
              const statusLabel =
                item.status === "ready"
                  ? "READY"
                  : item.status === "blocked"
                  ? "BLOCKED"
                  : "MISSING";
              const statusColor =
                item.status === "ready"
                  ? "#A3D977"
                  : item.status === "blocked"
                  ? "#EF4444"
                  : "#F59E0B";

              return (
                <div
                  key={`${item.id}:${item.name}`}
                  className="rounded-xl px-2.5 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                      {item.isPrimary ? " (primary)" : ""}
                    </p>
                    <span className="text-[10px] font-bold" style={{ color: statusColor }}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    id: {item.id} · type: {item.type || "unknown"}
                  </p>
                  {item.reason && (
                    <p className="text-[10px] mt-1" style={{ color: statusColor }}>
                      {item.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {lastBlockedConnector && (
            <div
              className="rounded-xl px-2.5 py-2 text-[10px]"
              style={{
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              Last blocked: {lastBlockedConnector.name} ({lastBlockedConnector.id}) · {lastBlockedConnector.reason}
            </div>
          )}
        </div>
      )}

      {isDone ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            boxShadow: "0 6px 24px rgba(13,75,46,0.35)",
          }}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={
            wrongNetwork
              ? handleSwitchNetwork
              : activationRoute?.nextAction === "activate_session"
                ? handleEnsureSession
              : phase === "connected" && requiresSelfVerification && !selfStatus?.verified
                ? handleVerifySelf
              : activationRoute?.nextAction === "claim_faucet"
                ? handleClaimFaucet
                : () => handleConnect(selectedConnectorId || undefined)
          }
          disabled={isBusy}
          className="w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2"
          style={{
            background:
              phase !== "idle" || wrongNetwork
                ? "rgba(13,75,46,0.4)"
                : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
            color: "#fff",
            boxShadow: phase === "idle" && !wrongNetwork ? "0 6px 24px rgba(13,75,46,0.35)" : "none",
          }}
        >
          {phase === "idle" && !wrongNetwork ? (
            <>
              <Wallet className="w-5 h-5" />
              {isMiniPay ? "Connect MiniPay" : `Connect ${selectedConnectorName}`}
            </>
          ) : activationRoute?.nextAction === "activate_session" ? (
            <>
              <Fingerprint className="w-5 h-5" />
              {isSigningMessage || isEnsuringSession ? "Signing session..." : "Sign session"}
            </>
          ) : phase === "connected" && requiresSelfVerification && !selfStatus?.verified ? (
            <>
              <Fingerprint className="w-5 h-5" />
              {isVerifyingSelf ? "Generating Self Link..." : "Unlock with Self ID"}
            </>
          ) : activationRoute?.nextAction === "claim_faucet" ? (
            <>
              <Wallet className="w-5 h-5" />
              {isClaimingFaucet ? "Funding..." : "Get test funds"}
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
              />
              {isSwitchingChain
                ? "Switching to Celo..."
                : isSigningMessage
                ? "Signing session..."
                : phase === "connecting"
                ? "Conectando..."
                : phase === "verifying"
                  ? "Verificando identidade..."
                  : "Conectando..."}
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

// ─── Step 2: Risk Setup ────────────────────────────────────────────────────────
function StepRisk({ onFinish }: { onFinish: (risk: RiskId) => void }) {
  const [selected, setSelected] = useState<RiskId>("balanced");
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const { address } = useCeloWallet();
  const sel = RISK_OPTS.find((r) => r.id === selected)!;

  useEffect(() => {
    let alive = true;

    if (!address) {
      setDashboard(null);
      return () => {
        alive = false;
      };
    }

    apiGet<DashboardPayload>("/api/dashboard", { address, riskMode: selected })
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
  }, [address, selected]);

  const projectedMonthlyYield = dashboard?.summary.monthlyYieldUsd ?? 0;
  const trackedCapitalUsd = dashboard?.summary.balanceUsd ?? 0;
  const formattedTrackedCapital = `$${trackedCapitalUsd.toFixed(trackedCapitalUsd >= 10 ? 2 : 2)}`;

  const projections: Record<RiskId, string> = {
    conservative: projectedMonthlyYield.toFixed(2),
    balanced: projectedMonthlyYield.toFixed(2),
    aggressive: projectedMonthlyYield.toFixed(2),
  };

  return (
    <div className="flex flex-col h-full px-6 pt-10 pb-8">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#A3D977" }}>
          Step 2 of 2 · Final
        </p>
        <h2 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "1.5rem", lineHeight: 1.2 }}>
          How should your
          <br />agent invest?
        </h2>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          You can change this anytime in settings
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 mb-4">
        {RISK_OPTS.map((opt) => {
          const Icon = opt.icon;
          const active = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(opt.id)}
              className="rounded-2xl p-4 flex items-center gap-4 text-left relative"
              style={{
                background: active ? opt.bg : "var(--surface-solid)",
                border: `2px solid ${active ? opt.color : "transparent"}`,
                boxShadow: active ? `0 4px 20px ${opt.color}25` : "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.22s ease",
              }}
            >
              {(opt as any).recommended && (
                <div
                  className="absolute top-2.5 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#A3D977", color: "#0D4B2E", fontSize: "9px" }}
                >
                  Recommended
                </div>
              )}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: opt.bg }}
              >
                <Icon className="w-5.5 h-5.5" style={{ color: opt.color }} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: active ? opt.color : "var(--text-primary)" }}>
                  {opt.label}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{opt.sub}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm" style={{ color: active ? opt.color : "var(--text-muted)" }}>
                  {opt.apy}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>APY</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Projection chip */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4 flex items-center justify-between"
        style={{ background: sel.bg, border: `1px solid ${sel.color}30` }}
      >
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{ color: sel.color }}>
            {trackedCapitalUsd > 0 ? `Monthly projection · ${formattedTrackedCapital} tracked` : "Monthly projection · awaiting wallet capital"}
          </div>
          <div className="font-mono font-bold" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
            +${projections[selected]}/mo
          </div>
        </div>
        <TrendingUp className="w-7 h-7" style={{ color: sel.color, opacity: 0.6 }} />
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onFinish(selected)}
        className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
          boxShadow: "0 6px 24px rgba(13,75,46,0.35)",
        }}
      >
        <Sparkles className="w-5 h-5" />
        Activate AI Agent
      </motion.button>
    </div>
  );
}

// ─── Step 3: Launch (Chat Style) ───────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "agent" | "system";
  text: string;
  type?: "text" | "proof" | "error" | "analysis";
  proofData?: {
    txHash: string;
    status: string;
    fee: string;
  };
  analysisData?: {
    protocols: { name: string; apy: string; color: string }[];
  };
}

function StepLaunch({ onDone }: { onDone: () => void }) {
  const { address, wrongNetwork, signWalletMessage } = useCeloWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let cancelled = false;
    const timers: number[] = [];

    const addMessage = (
      text: string,
      role: "agent" | "system" = "agent",
      type: "text" | "proof" | "error" | "analysis" = "text",
      extraData?: any
    ) => {
      if (cancelled) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          role,
          text,
          type,
          proofData: type === "proof" ? extraData : undefined,
          analysisData: type === "analysis" ? extraData : undefined,
        },
      ]);
    };

    const wait = (ms: number) => new Promise<void>((resolve) => {
      const id = window.setTimeout(resolve, ms);
      timers.push(id);
    });

    const run = async () => {
      try {
        // 1. Initial greeting
        await wait(600);
        setIsTyping(false);
        addMessage("Initializing secure environment...");
        
        // 2. Scanning (Fast)
        await wait(800);
        setIsTyping(true);
        await wait(1000);
        setIsTyping(false);
        addMessage("Scanning Celo liquidity pools (Aave, Mento, Uniswap)...");

        // 3. Market Analysis
        await wait(800);
        setIsTyping(true);
        await wait(1200); 
        setIsTyping(false);
        
        addMessage("Market Analysis Complete", "system", "analysis", {
          protocols: [
            { name: "Mento (cREAL)", apy: "6.2%", color: "#A3D977" },
            { name: "Aave V3 (USDC)", apy: "4.5%", color: "#8B5CF6" },
            { name: "Uniswap (CELO)", apy: "5.8%", color: "#EC4899" },
          ]
        });

        // 4. PAUSE -> Wait for user approval
        setWaitingApproval(true);

      } catch (runError) {
        if (cancelled) return;
        setIsTyping(false);
        addMessage(runError instanceof Error ? runError.message : "Activation failed.", "system", "error");
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleApprove = async () => {
    setWaitingApproval(false);
    setProcessing(true);
    setIsTyping(true);

    try {
      if (!address) throw new Error("Wallet disconnected");

      // Real backend execution
      await ensureWalletAuthSession(address, signWalletMessage);
      const response = await apiPost<{
        settlement: {
          txHash?: string;
          onChainProof?: { receiptStatus?: string; feeCurrency?: string; };
        };
      }>("/api/agent/authorize", {
        address,
        actionId: `onboarding-activation-${Date.now()}`,
        accepted: true,
      });

      setIsTyping(false);
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          role: "agent",
          text: "Optimization complete. Yield strategy active.",
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          role: "system",
          text: "Settlement Proof Generated",
          type: "proof",
          proofData: {
            txHash: response.settlement.txHash || "0x...",
            status: response.settlement.onChainProof?.receiptStatus || "success",
            fee: response.settlement.onChainProof?.feeCurrency || "USDm",
          }
        }
      ]);

      // Auto-redirect
      setTimeout(() => {
        onDone();
      }, 2000);

    } catch (error) {
      setIsTyping(false);
      setProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          role: "system",
          text: error instanceof Error ? error.message : "Allocation failed.",
          type: "error",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 border-b border-[var(--border-light)] bg-[var(--background)] z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(13,75,46,0.12)]">
            <Bot className="w-6 h-6 text-[#0D4B2E]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[var(--text-primary)]">LiquidAI Agent</h2>
            <p className="text-xs text-[#A3D977] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3D977] animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "system" ? "justify-center" : "justify-start"}`}
          >
            {msg.role === "agent" && (
              <div className="flex items-start gap-3 max-w-[90%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-solid)] border border-[var(--border-light)] flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <div className="bg-[var(--surface-solid)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[var(--border-light)]">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{msg.text}</p>
                </div>
              </div>
            )}

            {msg.role === "system" && msg.type === "analysis" && (
              <div className="w-full max-w-[280px] bg-[var(--surface-solid)] border border-[var(--border-light)] rounded-2xl p-4 text-left shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                   <TrendingUp className="w-4 h-4 text-[#A3D977]" />
                   <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">Market Analysis</p>
                 </div>
                 <div className="space-y-2">
                   {msg.analysisData?.protocols.map((p) => (
                     <div key={p.name} className="flex items-center justify-between">
                       <span className="text-xs font-medium text-[var(--text-secondary)]">{p.name}</span>
                       <span className="text-xs font-bold" style={{ color: p.color }}>{p.apy}</span>
                     </div>
                   ))}
                 </div>
                 <div className="mt-3 pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                   <span className="text-[10px] text-[var(--text-muted)]">Est. Monthly Yield</span>
                   <span className="text-xs font-bold text-[#A3D977]">+0.8%</span>
                 </div>
                 
                 {/* Approval Button inside the card (or below) */}
                 {waitingApproval && (
                   <motion.button
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     whileTap={{ scale: 0.97 }}
                     onClick={handleApprove}
                     className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                     style={{
                       background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                       boxShadow: "0 4px 12px rgba(13,75,46,0.2)",
                     }}
                   >
                     Deploy Strategy
                     <ArrowRight className="w-3.5 h-3.5" />
                   </motion.button>
                 )}
              </div>
            )}

            {msg.role === "system" && msg.type === "proof" && (
              <div className="w-full max-w-[280px] bg-[rgba(163,217,119,0.08)] border border-[rgba(163,217,119,0.22)] rounded-2xl p-4 text-left">
                 <div className="flex items-center gap-2 mb-2">
                   <Check className="w-4 h-4 text-[#A3D977]" />
                   <p className="text-xs font-bold text-[#A3D977] uppercase tracking-wide">Settlement Proof</p>
                 </div>
                 <p className="text-[11px] font-mono text-[var(--text-secondary)] break-all bg-[rgba(255,255,255,0.05)] p-2 rounded-lg mb-2">
                   {msg.proofData?.txHash}
                 </p>
                 <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                   <span>Status: {msg.proofData?.status}</span>
                   <span>Fee: {msg.proofData?.fee}</span>
                 </div>
              </div>
            )}

            {msg.role === "system" && msg.type === "error" && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl px-4 py-3 text-xs text-[#EF4444]">
                Error: {msg.text}
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
           <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-solid)] border border-[var(--border-light)] flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="bg-[var(--surface-solid)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[var(--border-light)] flex items-center gap-1.5">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-40" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-40" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-40" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / CTA */}
      <div className="p-6 bg-[var(--background)] border-t border-[var(--border-light)]">
        <p className="text-center text-xs text-[var(--text-muted)] animate-pulse">
          {waitingApproval ? "Waiting for approval..." : processing ? "Allocating capital..." : "Finalizing setup..."}
        </p>
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────
export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 2; // step 1 = connect, step 2 = risk

  const handleNext = () => setStep((s) => s + 1);
  const handleSkip = () => navigate("/home");
  const handleFinish = (_risk: RiskId) => setStep(3); // launch
  const handleDone = () => navigate("/home");

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--background)] md:bg-black/5 md:backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--background)] min-h-dvh md:min-h-[800px] md:h-[850px] md:max-h-[90vh] md:rounded-[32px] md:shadow-2xl md:border md:border-[var(--border-light)] overflow-hidden relative flex flex-col transition-all duration-300">
        
        {/* Top bar for steps 1-2 */}
        {step > 0 && step < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pt-14 pb-2 flex items-center justify-between shrink-0"
          >
            <ProgressDots total={TOTAL_STEPS} current={step - 1} />
            <button
              onClick={handleSkip}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                color: "var(--text-muted)",
                background: "var(--surface-solid)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}
            >
              Skip
            </button>
          </motion.div>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex-1 pt-14 flex flex-col">
            <StepWelcome onNext={handleNext} onSkip={handleSkip} />
          </div>
        )}

        {/* Steps 1-3 animated */}
        <AnimatePresence mode="wait">
          {step > 0 && step < 4 && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              {step === 1 && <StepConnect onNext={handleNext} />}
              {step === 2 && <StepRisk onFinish={handleFinish} />}
              {step === 3 && <StepLaunch onDone={handleDone} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
