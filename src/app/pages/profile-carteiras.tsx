import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { CELO_CHAIN_ID } from "../lib/celo-wallet";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import {
  apiPost,
  AuthChallengePayload,
  AuthSessionPayload,
  clearApiAuthToken,
  setApiAuthToken,
} from "../lib/api";
import { truncateAddress } from "../utils/formatters";

type WalletCard = {
  id: string;
  name: string;
  address: string;
  balance: string;
  network: string;
  color: string;
  bg: string;
  active: boolean;
  type: string;
  removable?: boolean;
};

export function ProfileCarteirasPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>("connected");
  const [copied, setCopied] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState("");
  const {
    address,
    shortAddress,
    connectorName,
    nativeBalanceFormatted,
    isConnected,
    hasConnector,
    wrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectWallet,
    switchToCelo,
    signWalletMessage,
    disconnectWallet,
  } = useCeloWallet();

  const wallets = useMemo(() => {
    const connectedWallet: WalletCard[] = isConnected && address
      ? [
          {
            id: "connected",
            name: `${connectorName} Main`,
            address,
            balance: wrongNetwork ? "Wrong Network" : nativeBalanceFormatted,
            network: wrongNetwork ? "Switch to Celo" : "Celo",
            color: wrongNetwork ? "#F59E0B" : "#A3D977",
            bg: wrongNetwork ? "rgba(245,158,11,0.12)" : "rgba(163,217,119,0.1)",
            active: !wrongNetwork,
            type: connectorName,
          },
        ]
      : [];

    return connectedWallet;
  }, [address, connectorName, isConnected, nativeBalanceFormatted, wrongNetwork]);

  const handleCopy = (id: string, walletAddress: string) => {
    navigator.clipboard.writeText(walletAddress).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConnect = async () => {
    setInlineError("");
    if (!hasConnector) {
      setInlineError("No wallet detected. Open in MiniPay or MetaMask and try again.");
      return;
    }
    try {
      const session = await connectWallet();
      if (session.chainId !== CELO_CHAIN_ID) {
        await switchToCelo();
      }

      const connectedAddress = session.accounts?.[0] || address;
      if (connectedAddress) {
        const challenge = await apiPost<AuthChallengePayload>("/api/auth/challenge", {
          address: connectedAddress,
        });
        const signature = await signWalletMessage(challenge.message);
        const authSession = await apiPost<AuthSessionPayload>("/api/auth/verify", {
          address: connectedAddress,
          nonce: challenge.nonce,
          signature,
        });
        setApiAuthToken(authSession.token);
      }

      setExpanded("connected");
    } catch (error) {
      clearApiAuthToken();
      setInlineError(error instanceof Error ? error.message : "Failed to connect wallet.");
    }
  };

  const handleSwitchNetwork = async () => {
    setInlineError("");
    try {
      await switchToCelo();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to switch to Celo network.");
    }
  };

  const handleDisconnect = () => {
    clearApiAuthToken();
    disconnectWallet();
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--surface-solid)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <div>
          <h1 className="font-bold text-text-primary">Connected Wallets</h1>
          <p className="text-xs text-text-muted">{wallets.length} wallets · Celo Network</p>
        </div>
      </header>

      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "linear-gradient(135deg, #0D4B2E, #1a6b45)",
            boxShadow: "0 4px 20px rgba(13,75,46,0.25)",
          }}
        >
          <p className="text-xs text-white/50 mb-1">On-chain Balance (Celo)</p>
          <p className="text-3xl font-mono font-bold text-white">
            {isConnected ? nativeBalanceFormatted : "--"}
          </p>
          <p className="text-xs mt-1" style={{ color: "#A3D977" }}>
            {isConnected
              ? `${shortAddress} · ${wrongNetwork ? "Wrong Network" : "Connected"}`
              : "No wallet connected"}
          </p>
        </motion.div>

        <div className="mb-5">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting || isSwitchingChain || isSigningMessage}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                opacity: isConnecting || isSigningMessage ? 0.7 : 1,
              }}
            >
              <Wallet className="w-4 h-4" />
              {isConnecting
                ? "Connecting..."
                : isSigningMessage
                  ? "Signing session..."
                  : "Connect real wallet"}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingChain || !wrongNetwork}
                className="w-full py-3 rounded-xl text-xs font-semibold"
                style={{
                  background: wrongNetwork ? "rgba(245,158,11,0.15)" : "var(--surface-solid)",
                  color: wrongNetwork ? "#F59E0B" : "var(--text-muted)",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                {isSwitchingChain ? "Switching..." : "Switch to Celo"}
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full py-3 rounded-xl text-xs font-semibold"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.22)",
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {inlineError && (
          <div
            className="rounded-xl px-3 py-2 text-xs mb-4"
            style={{
              color: "#EF4444",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {inlineError}
          </div>
        )}

        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
          My Wallets
        </p>

        <div className="space-y-3">
          {wallets.map((wallet, i) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface-solid rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                border: wallet.active ? "1px solid rgba(163,217,119,0.25)" : "1px solid transparent",
              }}
            >
              <button
                onClick={() => setExpanded(expanded === wallet.id ? null : wallet.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: wallet.bg }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: wallet.color }}
                  >
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>$</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{wallet.name}</p>
                    {wallet.active && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(163,217,119,0.12)", color: "#A3D977", fontSize: "9px" }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">
                    {truncateAddress(wallet.address, 6, 4)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                    {wallet.balance}
                  </p>
                  <p className="text-xs text-text-muted">{wallet.network}</p>
                </div>
                {expanded === wallet.id
                  ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />}
              </button>

              <AnimatePresence>
                {expanded === wallet.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderTop: "1px solid var(--border-light)" }}
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs text-text-muted mb-1">Full address</p>
                      <div
                        className="flex items-center gap-2 p-2.5 rounded-xl"
                        style={{ background: "var(--muted)" }}
                      >
                        <p className="text-xs font-mono flex-1 text-text-secondary truncate">{wallet.address}</p>
                        <button onClick={() => handleCopy(wallet.id, wallet.address)} className="flex-shrink-0">
                          {copied === wallet.id
                            ? <CheckCircle2 className="w-4 h-4" style={{ color: "#A3D977" }} />
                            : <Copy className="w-4 h-4 text-text-muted" />}
                        </button>
                        <a
                          href={`https://celoscan.io/address/${wallet.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4 text-text-muted" />
                        </a>
                      </div>
                      {wallet.removable && (
                        <button
                          className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#EF4444",
                            border: "1px solid rgba(239,68,68,0.15)",
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
                          Remove wallet
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          disabled={isConnected || isConnecting}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{
            background: "var(--surface-solid)",
            border: "1.5px dashed rgba(163,217,119,0.35)",
            color: "#A3D977",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            opacity: isConnected ? 0.6 : 1,
          }}
        >
          <Plus className="w-4 h-4" />
          {isConnected ? "Main wallet connected" : "Connect New Wallet"}
        </motion.button>
        <p className="text-center text-xs text-text-muted mt-3">
          Compatible with MiniPay and injected EVM providers
        </p>
      </div>
    </div>
  );
}
