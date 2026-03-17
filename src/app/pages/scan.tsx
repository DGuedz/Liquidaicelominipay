import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scan, X, QrCode, Copy, Share2, Zap, Download, Check } from "lucide-react";
import { useNavigate } from "react-router";
import QRCode from "qrcode";
import { getAddress, isAddress } from "viem";
import { useCeloWallet } from "../hooks/use-celo-wallet";
import { CELO_CHAIN } from "../lib/celo-wallet";

function QRCodeImage({ data, size = 200 }: { data: string; size?: number }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: "#0D4B2E",
        light: "#FFFFFF",
      },
    })
      .then((nextSrc) => {
        if (active) setSrc(nextSrc);
      })
      .catch(() => {
        if (active) setSrc("");
      });

    return () => {
      active = false;
    };
  }, [data, size]);

  return src ? (
    <img
      src={src}
      alt="Wallet receive QR code"
      width={size}
      height={size}
      className="rounded-2xl"
    />
  ) : (
    <div
      className="rounded-2xl flex items-center justify-center text-xs font-semibold"
      style={{ width: size, height: size, background: "#FFFFFF", color: "#0D4B2E" }}
    >
      Generating QR...
    </div>
  );
}

// ─── Scanner Frame ─────────────────────────────────────────────────────────────
function ScannerFrame() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative mb-6 mt-4"
    >
      <div
        className="w-64 h-64 rounded-3xl overflow-hidden flex items-center justify-center relative"
        style={{ background: "#0D0D0D" }}
      >
        {/* Animated scan line */}
        <motion.div
          animate={{ y: [-88, 88, -88] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 right-4 h-0.5 rounded-full z-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(163,217,119,0.9), transparent)",
            boxShadow: "0 0 8px rgba(163,217,119,0.6)",
          }}
        />

        {/* Corner markers */}
        {[
          "top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-xl",
          "top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-xl",
          "bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-xl",
          "bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-xl",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-8 h-8 ${cls}`}
            style={{ borderColor: "#A3D977" }}
          />
        ))}

        {/* Mock QR preview (blurred) */}
        <div className="opacity-20">
          <QRCodeImage data="demo" size={160} />
        </div>

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-6 h-0.5 rounded-full"
            style={{ background: "rgba(163,217,119,0.5)" }}
          />
          <div
            className="absolute w-0.5 h-6 rounded-full"
            style={{ background: "rgba(163,217,119,0.5)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── My QR Code ───────────────────────────────────────────────────────────────
function MyQRCode() {
  const [copied, setCopied] = useState(false);
  const { address } = useCeloWallet();
  const fullAddress = useMemo(() => {
    if (!address || !isAddress(address)) return "";
    return getAddress(address);
  }, [address]);
  const shortAddress = useMemo(() => {
    if (!fullAddress) return "Connect wallet to receive";
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  }, [fullAddress]);
  const networkLabel = `${CELO_CHAIN.name} · Wallet address`;

  const handleCopy = () => {
    if (!fullAddress) return;
    navigator.clipboard.writeText(fullAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {/* QR Card */}
      <div
        className="rounded-3xl p-5 mb-5 flex flex-col items-center"
        style={{
          background: "var(--surface-solid)",
          boxShadow: "0 4px 24px rgba(13,75,46,0.12)",
          border: "1px solid var(--border-light)",
        }}
      >
        {/* Amount pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold"
          style={{ background: "rgba(163,217,119,0.15)", color: "#A3D977" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Receiving on {CELO_CHAIN.name}
        </div>

        {fullAddress ? (
          <QRCodeImage data={fullAddress} size={200} />
        ) : (
          <div
            className="w-[200px] h-[200px] rounded-2xl flex flex-col items-center justify-center text-center px-6"
            style={{ background: "#FFFFFF", color: "#0D4B2E" }}
          >
            <p className="text-sm font-semibold">Wallet not connected</p>
            <p className="text-xs mt-2">Connect your wallet to generate a valid receive QR code.</p>
          </div>
        )}

        {/* Address */}
        <div className="mt-4 text-center">
          <p className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
            {shortAddress}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {networkLabel}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleCopy}
          disabled={!fullAddress}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold"
          style={{
            background: copied ? "rgba(163,217,119,0.15)" : "var(--surface-solid)",
            color: copied ? "#A3D977" : !fullAddress ? "var(--text-muted)" : "var(--text-secondary)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
            opacity: fullAddress ? 1 : 0.6,
          }}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold"
          style={{
            background: "var(--surface-solid)",
            color: "var(--text-secondary)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          }}
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-2 px-4 py-3 rounded-full font-semibold"
          style={{
            background: "var(--surface-solid)",
            color: "var(--text-secondary)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          }}
        >
          <Download className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Amount input */}
      <div
        className="w-full rounded-2xl p-4"
        style={{
          background: "var(--surface-solid)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Specific amount (optional)
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ background: "var(--background)", border: "1.5px solid var(--border)" }}
        >
          <span className="font-mono text-lg font-bold" style={{ color: "var(--text-muted)" }}>
            $
          </span>
          <input
            type="number"
            placeholder="0.00"
            className="flex-1 bg-transparent font-mono text-lg outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            cUSD
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          This QR encodes your full wallet address for wallet-compatible receive flows.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Scan Page ────────────────────────────────────────────────────────────

export function ScanPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"scan" | "qr">("scan");
  const [simulating, setSimulating] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScanActivate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setScanned(true);
    }, 2200);
  };

  return (
    <div className="min-h-dvh bg-background pb-28 overflow-x-hidden">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center relative">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface-solid flex items-center justify-center absolute left-5"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
        <span
          className="font-bold mx-auto"
          style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}
        >
          {tab === "scan" ? "Scan QR Code" : "My QR Code"}
        </span>
      </header>

      {/* Tab Switcher */}
      <div className="px-5 mb-5">
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{
            background: "var(--surface-solid)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {[
            { id: "scan" as const, label: "Scan", icon: Scan },
            { id: "qr" as const, label: "My QR Code", icon: QrCode },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: tab === id ? "#0D4B2E" : "transparent",
                color: tab === id ? "#FFFFFF" : "var(--text-muted)",
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          {tab === "scan" ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              {scanned ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <div className="flex flex-col items-center mb-5">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                      style={{ background: "rgba(163,217,119,0.15)" }}
                    >
                      <Zap className="w-10 h-10" style={{ color: "#A3D977" }} />
                    </div>
                    <p
                      className="font-bold text-lg"
                      style={{ color: "var(--text-primary)" }}
                    >
                      QR Code Detected!
                    </p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      Recipient: Maria Silva
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-4 mb-4"
                    style={{
                      background: "var(--surface-solid)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    {[
                      { label: "To", value: "Maria Silva" },
                      { label: "Account", value: "4323 7453 6932" },
                      { label: "Network", value: CELO_CHAIN.name },
                    ].map((r) => (
                      <div
                        key={r.label}
                        className="flex justify-between py-2.5"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                      >
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                          {r.label}
                        </span>
                        <span
                          className="text-sm font-mono font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/transfer")}
                      className="flex-1 py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #0D4B2E, #1a6b45)",
                        boxShadow: "0 4px 20px rgba(13,75,46,0.3)",
                      }}
                    >
                      Proceed
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setScanned(false)}
                      className="px-4 py-4 rounded-full font-semibold"
                      style={{
                        background: "var(--surface-solid)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <ScannerFrame />

                  <p className="text-sm text-center mb-6" style={{ color: "var(--text-muted)" }}>
                    {simulating
                      ? "Analyzing QR Code..."
                      : "Point at the recipient's QR Code"}
                  </p>

                  {/* Quick presets */}
                  {!simulating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="w-full mb-4"
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Recent
                      </p>
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "var(--surface-solid)",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        }}
                      >
                        {[
                          { name: "Maria Silva", sub: "Recent contact · no synced transfer yet" },
                          { name: "Carlos Lima", sub: "Saved recipient" },
                        ].map((c, i) => (
                          <div
                            key={c.name}
                            className="flex items-center gap-3 px-4 py-3"
                            style={{
                              borderBottom:
                                i === 0 ? "1px solid var(--border-light)" : "none",
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: i === 0 ? "#0D4B2E" : "#3B82F6" }}
                            >
                              {c.name.split(" ").map((w) => w[0]).join("")}
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {c.name}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {c.sub}
                              </p>
                            </div>
                            <QrCode className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {simulating && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm font-semibold" style={{ color: "#A3D977" }}>
                        Processing...
                      </span>
                    </motion.div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleScanActivate}
                    disabled={simulating}
                    className="w-full rounded-full py-4 font-semibold text-white flex items-center justify-center gap-2"
                    style={{
                      background: simulating
                        ? "rgba(13,75,46,0.5)"
                        : "linear-gradient(135deg, #0D4B2E 0%, #1a6b45 100%)",
                      boxShadow: simulating ? "none" : "0 4px 20px rgba(13,75,46,0.25)",
                    }}
                  >
                    {simulating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5" />
                        Activate Camera
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MyQRCode />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
