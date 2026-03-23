import { ArrowLeft, Globe } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useCeloWallet } from "../../hooks/use-celo-wallet";
import { ensureWalletAuthSession } from "../../lib/wallet-auth";

const protocolMeta: Record<string, { name: string; desc: string; apy: string; color: string }> = {
  aave: { name: "Aave v3", desc: "Lending market", apy: "4.8%", color: "#06B6D4" },
  mento: { name: "Mento", desc: "Stable AMM", apy: "3.8%", color: "#10B981" },
  moola: { name: "Moola Market (Legacy)", desc: "Legacy lending market", apy: "5.2%", color: "#8B5CF6" },
  ubeswap: { name: "Ubeswap", desc: "DEX liquidity", apy: "8.2%", color: "#F59E0B" },
  pwn: { name: "PWN", desc: "RWA Credit", apy: "11.4%", color: "#EF4444" },
  morpho: { name: "Morpho", desc: "Institutional Looping", apy: "9.1%", color: "#3B82F6" },
};

export function ProtocolsPage() {
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
        setLoadError(error instanceof Error ? error.message : "Failed to load protocol settings.");
      }
    })();

    return () => {
      active = false;
    };
  }, [address, signWalletMessage, wrongNetwork]);

  const toggleProtocol = async (key: string) => {
    if (!profile) return;
    const newVal = !profile.protocols[key];
    const updated = { ...profile, protocols: { ...profile.protocols, [key]: newVal } };
    setProfile(updated);
    try {
      if (!address) throw new Error("Wallet not connected.");
      await ensureWalletAuthSession(address, signWalletMessage);
      await apiPost("/api/profile/settings", { address, updates: { protocols: { [key]: newVal } } });
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
        <h1 className="font-bold text-text-primary text-xl">Allowed Protocols</h1>
      </header>

      <div className="px-5 space-y-4">
        <div className="bg-surface-solid rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Defi Whitelist</p>
              <p className="text-xs text-text-muted">Agent can only route funds to these dApps</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(protocolMeta).map(([key, meta]) => (
            <div
              key={key}
              className="bg-surface-solid rounded-2xl p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleProtocol(key)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                <div>
                  <p className="font-medium text-text-primary text-sm">{meta.name}</p>
                  <p className="text-xs text-text-muted">{meta.desc} · {meta.apy} APY</p>
                </div>
              </div>
              <div
                className="w-10 h-6 rounded-full flex items-center px-1 transition-all duration-300"
                style={{
                  background: profile.protocols[key] ? "#A3D977" : "var(--muted)",
                  justifyContent: profile.protocols[key] ? "flex-end" : "flex-start",
                }}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
