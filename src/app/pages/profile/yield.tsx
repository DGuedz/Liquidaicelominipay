import { ArrowLeft, Sparkles, Activity, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useCeloWallet } from "../../hooks/use-celo-wallet";
import { ensureWalletAuthSession } from "../../lib/wallet-auth";

const strategies = [
  { id: "conservative", name: "Inflation Shield", icon: Shield, desc: "Capital preservation. Only stablecoins.", apy: "3.2-4.2%", color: "#3B82F6" },
  { id: "balanced", name: "Balanced", icon: Activity, desc: "Morpho looping with safe thresholds.", apy: "5.8-9.0%", color: "#A3D977" },
  { id: "aggressive", name: "Utility Degen", icon: Zap, desc: "Max looping & arbitrage.", apy: "8-20%+", color: "#F59E0B" },
];

export function YieldStrategyPage() {
  const navigate = useNavigate();
  const { address, wrongNetwork, signWalletMessage } = useCeloWallet();
  const [profile, setProfile] = useState<any>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    if (!address || wrongNetwork) {
      setProfile(null);
      setLoadError("");
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        await ensureWalletAuthSession(address, signWalletMessage);
        const payload = await apiGet("/api/profile/settings", { address });
        if (!active) return;
        setProfile(payload);
        setLoadError("");
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load yield settings.");
      }
    })();

    return () => {
      active = false;
    };
  }, [address, signWalletMessage, wrongNetwork]);

  const toggleAutoRebalance = async () => {
    if (!profile) return;
    const newVal = !profile.yield.autoRebalance;
    const updated = { ...profile, yield: { ...profile.yield, autoRebalance: newVal } };
    setProfile(updated);
    try {
      if (!address) throw new Error("Wallet not connected.");
      await ensureWalletAuthSession(address, signWalletMessage);
      await apiPost("/api/profile/settings", { address, updates: { yield: { autoRebalance: newVal } } });
    } catch {
      setProfile(profile);
    }
  };

  const selectStrategy = async (id: string) => {
    if (!profile) return;
    const updated = { ...profile, yield: { ...profile.yield, strategyId: id } };
    setProfile(updated);
    try {
      if (!address) throw new Error("Wallet not connected.");
      await ensureWalletAuthSession(address, signWalletMessage);
      await apiPost("/api/profile/settings", { address, updates: { yield: { strategyId: id } } });
    } catch {
      setProfile(profile);
    }
  };

  if (loadError) return <div className="p-10 text-center text-red-400">{loadError}</div>;
  if (!profile) return <div className="p-10 text-center text-text-muted">Loading settings...</div>;

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-solid">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="font-bold text-text-primary text-xl">Yield Strategy</h1>
      </header>

      <div className="px-5 space-y-4">
        <div className="bg-surface-solid rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Risk Engine</p>
              <p className="text-xs text-text-muted">Define how the agent handles your capital</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 cursor-pointer" onClick={toggleAutoRebalance}>
            <div>
              <p className="text-sm font-medium text-text-primary">Auto-rebalance</p>
              <p className="text-xs text-text-muted mt-0.5">Agent moves funds automatically</p>
            </div>
            <div
              className="w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300"
              style={{
                background: profile.yield.autoRebalance ? "#A3D977" : "var(--muted)",
                justifyContent: profile.yield.autoRebalance ? "flex-end" : "flex-start",
              }}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-text-primary mb-3">Select Risk Profile</h2>
        
        <div className="space-y-3">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => selectStrategy(s.id)}
              className="w-full text-left bg-surface-solid rounded-2xl p-4 border-2 transition-all"
              style={{
                borderColor: profile.yield.strategyId === s.id ? s.color : "transparent",
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <p className="font-semibold text-text-primary">{s.name}</p>
                </div>
                <div className="px-2 py-1 rounded bg-background text-xs font-mono font-bold" style={{ color: s.color }}>
                  {s.apy}
                </div>
              </div>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
