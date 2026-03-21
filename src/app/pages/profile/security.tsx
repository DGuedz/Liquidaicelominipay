import { ArrowLeft, Shield, Lock, Fingerprint, Smartphone, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useCeloWallet } from "../../hooks/use-celo-wallet";
import { ensureWalletAuthSession } from "../../lib/wallet-auth";

export function SecurityPage() {
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
        setLoadError(error instanceof Error ? error.message : "Failed to load security settings.");
      }
    })();

    return () => {
      active = false;
    };
  }, [address, signWalletMessage, wrongNetwork]);

  const toggleApproval = async () => {
    if (!profile) return;
    const newVal = !profile.security.requireApproval;
    const updated = { ...profile, security: { ...profile.security, requireApproval: newVal } };
    setProfile(updated);
    try {
      if (!address) throw new Error("Wallet not connected.");
      await ensureWalletAuthSession(address, signWalletMessage);
      await apiPost("/api/profile/settings", { address, updates: { security: { requireApproval: newVal } } });
    } catch {
      setProfile(profile);
    }
  };

  const toggleBiometrics = async () => {
    if (!profile) return;
    const newVal = !profile.security.biometricsEnabled;
    const updated = { ...profile, security: { ...profile.security, biometricsEnabled: newVal } };
    setProfile(updated);
    try {
      if (!address) throw new Error("Wallet not connected.");
      await ensureWalletAuthSession(address, signWalletMessage);
      await apiPost("/api/profile/settings", { address, updates: { security: { biometricsEnabled: newVal } } });
    } catch {
      setProfile(profile);
    }
  };

  if (loadError) {
    return <div className="p-10 text-center text-red-400">{loadError}</div>;
  }
  if (!profile) return <div className="p-10 text-center text-text-muted">Loading settings...</div>;

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-solid">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="font-bold text-text-primary text-xl">Security Settings</h1>
      </header>

      <div className="px-5 space-y-4">
        <div className="bg-surface-solid rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Agent Permissions</p>
              <p className="text-xs text-text-muted">Strict controls for automated actions</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={toggleApproval}>
              <div>
                <p className="text-sm font-medium text-text-primary">Require approval for rebalance</p>
                <p className="text-xs text-text-muted mt-0.5">Agent will pause and ask before moving funds</p>
              </div>
              <div
                className="w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300"
                style={{
                  background: profile.security.requireApproval ? "#A3D977" : "var(--muted)",
                  justifyContent: profile.security.requireApproval ? "flex-end" : "flex-start",
                }}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Max transaction limit</p>
                <p className="text-xs text-text-muted mt-0.5">Auto-reject operations above this size</p>
              </div>
              <p className="font-mono text-sm text-text-primary font-medium">${profile.security.maxTransactionLimit}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-solid rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Authentication</p>
              <p className="text-xs text-text-muted">App access and biometrics</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-text-muted" />
                <p className="text-sm font-medium text-text-primary">Passcode</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#A3D977]" />
            </div>
            <div className="flex items-center justify-between cursor-pointer" onClick={toggleBiometrics}>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-text-muted" />
                <p className="text-sm font-medium text-text-primary">Face ID / Touch ID</p>
              </div>
              <div
                className="w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300"
                style={{
                  background: profile.security.biometricsEnabled ? "#A3D977" : "var(--muted)",
                  justifyContent: profile.security.biometricsEnabled ? "flex-end" : "flex-start",
                }}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
