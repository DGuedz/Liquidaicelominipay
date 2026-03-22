import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import {
  CELO_CHAIN_ID,
  WALLETCONNECT_PROJECT_ID,
  clearWalletConnectorPersistence,
  isWalletResetOverride,
  readPreferredAccounts,
  requestPreferredAccounts,
  resolveWalletMode,
  setWalletResetOverride,
  subscribePreferredProviderEvents,
} from "../lib/celo-wallet";
import {
  assertTrustedOrigin,
  getRuntimeWalletSecurityPolicy,
  isAllowedConnector,
} from "../security/walletValidator";
import { truncateAddress } from "../utils/formatters";

const PREFERRED_CONNECTOR_KEY = "liquidai.preferred-connector";

function isWalletConnectConnector(connector: any) {
  const id = String(connector?.id || "").toLowerCase();
  const type = String(connector?.type || "").toLowerCase();
  return type === "walletconnect" || id.includes("walletconnect");
}

function readPreferredConnectorId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PREFERRED_CONNECTOR_KEY) || "";
}

function writePreferredConnectorId(connectorId: string) {
  if (typeof window === "undefined") return;
  if (!connectorId) {
    window.localStorage.removeItem(PREFERRED_CONNECTOR_KEY);
    return;
  }
  window.localStorage.setItem(PREFERRED_CONNECTOR_KEY, connectorId);
}

export type WalletConnectorDiagnostic = {
  id: string;
  name: string;
  type: string;
  available: boolean;
  allowed: boolean;
  status: "ready" | "blocked" | "missing";
  reason: string;
  isPrimary: boolean;
};

export function useCeloWallet() {
  const { address, chainId, isConnected, connector } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    switchChainAsync,
    isPending: isSwitchingChain,
    error: switchChainError,
  } = useSwitchChain();
  const {
    signMessageAsync,
    isPending: isSigningMessage,
    error: signMessageError,
  } = useSignMessage();
  const walletResetOverride = isWalletResetOverride();
  const effectiveIsConnected = isConnected && !walletResetOverride;
  const effectiveAddress = walletResetOverride ? undefined : address;
  const effectiveChainId = walletResetOverride ? undefined : chainId;
  const effectiveWrongNetwork = effectiveIsConnected && effectiveChainId !== CELO_CHAIN_ID;
  const connectInFlightRef = useRef(false);
  const pendingWalletApprovalRef = useRef(false);
  const miniPayAutoConnectAttemptedRef = useRef(false);
  const [connectorDiagnostics, setConnectorDiagnostics] = useState<WalletConnectorDiagnostic[]>([]);
  const [lastBlockedConnector, setLastBlockedConnector] = useState<{
    id: string;
    name: string;
    reason: string;
  } | null>(null);
  const walletConnectEnabled = Boolean(WALLETCONNECT_PROJECT_ID);
  const walletSecurityPolicy = useMemo(
    () => getRuntimeWalletSecurityPolicy(CELO_CHAIN_ID),
    [],
  );
  const walletSupportLabelPt = walletConnectEnabled
    ? "MiniPay, MetaMask, Rabby, Trust, Coinbase Wallet ou WalletConnect"
    : "MiniPay, MetaMask, Rabby, Trust ou Coinbase Wallet";
  const walletSupportLabelEn = walletConnectEnabled
    ? "MiniPay, MetaMask, Rabby, Trust, Coinbase Wallet, or WalletConnect"
    : "MiniPay, MetaMask, Rabby, Trust, or Coinbase Wallet";

  const { data: nativeBalance } = useBalance({
    address: effectiveAddress,
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: Boolean(effectiveAddress) && effectiveIsConnected,
    },
  });

  const supportedConnectors = useMemo(
    () =>
      connectors.filter((item: any) => {
        const name = String(item.name || "").toLowerCase();
        const id = String(item.id || "").toLowerCase();
        const type = String(item.type || "").toLowerCase();
        return (
          type === "injected"
          || type === "walletconnect"
          || id.includes("walletconnect")
          || id.includes("coinbase")
          || name.includes("coinbase")
          || id.includes("meta")
          || id.includes("minipay")
          || id.includes("rabby")
          || id.includes("trust")
          || name.includes("metamask")
          || name.includes("minipay")
          || name.includes("rabby")
          || name.includes("trust")
        );
      }),
    [connectors],
  );

  const primaryConnector = useMemo(() => {
    if (!supportedConnectors.length) return null;
    const preferredConnectorId = readPreferredConnectorId().toLowerCase();
    if (preferredConnectorId) {
      const preferred = supportedConnectors.find((item: any) => item.id.toLowerCase() === preferredConnectorId);
      if (preferred) return preferred;
    }

    if (resolveWalletMode() === "minipay") {
      return (
        supportedConnectors.find((item: any) => item.name.toLowerCase().includes("minipay"))
        ?? supportedConnectors.find((item: any) => item.type === "injected")
        ?? supportedConnectors[0]
      );
    }

    return (
      supportedConnectors.find((item: any) => item.id.toLowerCase().includes("meta") || item.name.toLowerCase().includes("metamask"))
      ?? supportedConnectors.find((item: any) => item.id.toLowerCase().includes("rabby") || item.name.toLowerCase().includes("rabby"))
      ?? supportedConnectors.find((item: any) => item.id.toLowerCase().includes("coinbase") || item.name.toLowerCase().includes("coinbase"))
      ?? supportedConnectors.find((item: any) => item.id.toLowerCase().includes("walletconnect") || item.type?.toLowerCase() === "walletconnect")
      ?? supportedConnectors.find((item: any) => item.id.toLowerCase().includes("trust") || item.name.toLowerCase().includes("trust"))
      ?? supportedConnectors.find((item: any) => item.type === "injected")
      ?? supportedConnectors[0]
    );
  }, [supportedConnectors]);

  const walletMode = useMemo(
    () => resolveWalletMode(primaryConnector?.id),
    [primaryConnector?.id],
  );
  const isMiniPay = walletMode === "minipay";

  const connectorOptions = useMemo(
    () => {
      const unique = new Map<string, { id: string; name: string; type: string }>();
      for (const item of supportedConnectors) {
        const key = item.name.trim().toLowerCase();
        const existing = unique.get(key);
        const normalized = {
          id: item.id,
          name: item.name,
          type: item.type,
        };
        if (!existing) {
          unique.set(key, normalized);
          continue;
        }
        const isExistingMeta = existing.id.toLowerCase().includes("meta");
        const isCurrentMeta = normalized.id.toLowerCase().includes("meta");
        // Prefer the dedicated MetaMask connector over generic injected.
        if (!isExistingMeta && isCurrentMeta) {
          unique.set(key, normalized);
        }
      }
      return Array.from(unique.values());
    },
    [supportedConnectors],
  );

  const isConnectorAvailable = useCallback(
    async (candidate: any) => {
      if (!candidate) return false;
      if (isWalletConnectConnector(candidate)) return walletConnectEnabled;

      try {
        const provider = await (candidate as { getProvider?: () => Promise<unknown> | unknown }).getProvider?.();
        return Boolean(provider);
      } catch {
        return false;
      }
    },
    [walletConnectEnabled],
  );

  const resolveUsableConnector = useCallback(
    async (requestedConnectorId?: string) => {
      if (requestedConnectorId) {
        const requestedConnector = supportedConnectors.find((item: any) => item.id === requestedConnectorId);
        if (!requestedConnector) return null;
        return (await isConnectorAvailable(requestedConnector)) ? requestedConnector : null;
      }

      const ordered: any[] = [];
      const pushUnique = (item: any) => {
        if (!item) return;
        if (ordered.some((existing) => existing.id === item.id)) return;
        ordered.push(item);
      };

      pushUnique(primaryConnector);
      supportedConnectors.forEach((item) => pushUnique(item));

      for (const connectorItem of ordered) {
        if (await isConnectorAvailable(connectorItem)) {
          return connectorItem;
        }
      }

      return null;
    },
    [isConnectorAvailable, primaryConnector, supportedConnectors],
  );

  useEffect(() => {
    let cancelled = false;

    const refreshDiagnostics = async () => {
      const nextRows = await Promise.all(
        supportedConnectors.map(async (item: any) => {
          const connectorId = String(item?.id || "unknown");
          const connectorName = String(item?.name || "Unnamed Wallet");
          const connectorType = String(item?.type || "unknown");
          const isWalletConnect = isWalletConnectConnector(item);
          const allowed = isAllowedConnector(item, walletSecurityPolicy.allowedConnectorPatterns);

          let available = false;
          let unavailableReason = "";

          if (isWalletConnect) {
            available = walletConnectEnabled;
            if (!walletConnectEnabled) {
              unavailableReason = "WalletConnect disabled: configure VITE_WALLETCONNECT_PROJECT_ID.";
            }
          } else {
            try {
              const provider = await (item as { getProvider?: () => Promise<unknown> | unknown }).getProvider?.();
              available = Boolean(provider);
              if (!available) {
                unavailableReason = "Provider not detected in this browser context.";
              }
            } catch (error) {
              available = false;
              unavailableReason = error instanceof Error
                ? error.message
                : "Provider is unavailable.";
            }
          }

          let status: WalletConnectorDiagnostic["status"] = "ready";
          let reason = "";

          if (!allowed) {
            status = "blocked";
            reason = "Blocked by wallet allow-list policy.";
          } else if (!available) {
            status = "missing";
            reason = unavailableReason || "Provider unavailable.";
          }

          return {
            id: connectorId,
            name: connectorName,
            type: connectorType,
            available,
            allowed,
            status,
            reason,
            isPrimary: connectorId === String(primaryConnector?.id || ""),
          } as WalletConnectorDiagnostic;
        }),
      );

      if (cancelled) return;
      setConnectorDiagnostics(nextRows);
    };

    void refreshDiagnostics();

    return () => {
      cancelled = true;
    };
  }, [primaryConnector?.id, supportedConnectors, walletConnectEnabled, walletSecurityPolicy.allowedConnectorPatterns]);

  const requestConnectorAccounts = useCallback(
    async (connectorId: string, method: "eth_accounts" | "eth_requestAccounts") => {
      const selectedConnector = supportedConnectors.find((item: any) => item.id === connectorId) ?? primaryConnector;
      if (!selectedConnector) return [];

      const provider = await (selectedConnector as { getProvider?: () => Promise<unknown> | unknown }).getProvider?.();
      const requestProvider = provider as
        | { request?: (args: { method: string; params?: unknown[] | object }) => Promise<unknown> }
        | undefined;

      if (requestProvider?.request) {
        const result = await requestProvider.request({ method });
        return Array.isArray(result) ? result.filter((value): value is string => typeof value === "string") : [];
      }

      if (method === "eth_accounts") {
        return readPreferredAccounts(selectedConnector.id);
      }
      return requestPreferredAccounts(selectedConnector.id);
    },
    [primaryConnector, supportedConnectors],
  );

  const finalizeProviderConnection = useCallback(async () => {
    if (!primaryConnector || connectInFlightRef.current || effectiveIsConnected) return;

    const hydratedAccounts = await requestConnectorAccounts(primaryConnector.id, "eth_accounts").catch(() => []);
    if (!hydratedAccounts.length) return;

    try {
      setWalletResetOverride(false);
      await connectAsync({
        connector: primaryConnector,
        chainId: CELO_CHAIN_ID,
      });
      pendingWalletApprovalRef.current = false;
    } catch (error) {
      console.warn("Provider resync failed:", error);
    }
  }, [connectAsync, effectiveIsConnected, primaryConnector, requestConnectorAccounts]);

  useEffect(() => {
    if (walletMode !== "minipay") return;
    if (!primaryConnector || effectiveIsConnected || walletResetOverride || connectInFlightRef.current || isConnecting) return;
    if (miniPayAutoConnectAttemptedRef.current) return;

    miniPayAutoConnectAttemptedRef.current = true;
    pendingWalletApprovalRef.current = true;

    (async () => {
      try {
        const existingAccounts = await requestConnectorAccounts(primaryConnector.id, "eth_accounts").catch(() => []);
        const authorizedAccounts = existingAccounts.length
          ? existingAccounts
          : await requestConnectorAccounts(primaryConnector.id, "eth_requestAccounts").catch(() => []);
        if (!authorizedAccounts.length) {
          pendingWalletApprovalRef.current = false;
          return;
        }
        setWalletResetOverride(false);
        await connectAsync({
          connector: primaryConnector,
          chainId: CELO_CHAIN_ID,
        });
      } catch {
        pendingWalletApprovalRef.current = false;
      }
    })();
  }, [
    connectAsync,
    effectiveIsConnected,
    isConnecting,
    primaryConnector,
    walletMode,
    walletResetOverride,
  ]);

  useEffect(() => {
    const unsubscribeProvider = subscribePreferredProviderEvents({
      onAccountsChanged(accounts) {
        if (!accounts.length) {
          pendingWalletApprovalRef.current = false;
          return;
        }
        void finalizeProviderConnection();
      },
      onConnect() {
        void finalizeProviderConnection();
      },
      onDisconnect() {
        pendingWalletApprovalRef.current = false;
      },
    });

    const handleFocus = () => {
      if (walletMode !== "minipay" && !pendingWalletApprovalRef.current) return;
      if (!pendingWalletApprovalRef.current && effectiveIsConnected) return;
      void finalizeProviderConnection();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubscribeProvider();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [effectiveIsConnected, finalizeProviderConnection, walletMode]);

  const connectWallet = async (connectorId?: string) => {
    if (connectInFlightRef.current) {
      throw new Error("Há uma solicitação de conexão em andamento. Aguarde ou verifique sua carteira.");
    }

    connectInFlightRef.current = true;
    setWalletResetOverride(false);

    try {
      const selectedConnector = await resolveUsableConnector(connectorId);
      if (!selectedConnector) {
        if (connectorId) {
          const selectedOption = connectorOptions.find((item) => item.id === connectorId);
          const selectedDiagnostic = connectorDiagnostics.find((item) => item.id === connectorId);
          const selectedName = selectedOption?.name || selectedDiagnostic?.name || connectorId;
          if (selectedDiagnostic?.status === "blocked") {
            setLastBlockedConnector({
              id: connectorId,
              name: selectedName,
              reason: selectedDiagnostic.reason || "Blocked by wallet allow-list policy.",
            });
            throw new Error(`Connector "${selectedName}" blocked. ${selectedDiagnostic.reason || "Use an allow-listed wallet provider."}`);
          }
          if (selectedDiagnostic?.status === "missing") {
            setLastBlockedConnector(null);
            throw new Error(`Connector "${selectedName}" is unavailable. ${selectedDiagnostic.reason || "Open this wallet and try again."}`);
          }
          setLastBlockedConnector(null);
          throw new Error(`Connector "${selectedName}" was not detected in this browser context.`);
        }

        setLastBlockedConnector(null);
        throw new Error(
          walletConnectEnabled
            ? "Nenhuma carteira EVM pronta para conexão foi detectada. Abra MiniPay/MetaMask/Rabby/Trust/Coinbase ou use WalletConnect."
            : "Nenhuma carteira EVM pronta para conexão foi detectada. WalletConnect está desativado: configure VITE_WALLETCONNECT_PROJECT_ID.",
        );
      }

      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      try {
        assertTrustedOrigin(hostname, walletSecurityPolicy.allowedHosts);
      } catch (error) {
        setLastBlockedConnector({
          id: String(selectedConnector.id || "unknown"),
          name: String(selectedConnector.name || "Unknown Wallet"),
          reason: error instanceof Error ? error.message : "Blocked by trusted-origin policy.",
        });
        throw error;
      }
      if (!isAllowedConnector(selectedConnector, walletSecurityPolicy.allowedConnectorPatterns)) {
        setLastBlockedConnector({
          id: String(selectedConnector.id || "unknown"),
          name: String(selectedConnector.name || "Unknown Wallet"),
          reason: "Blocked by wallet allow-list policy.",
        });
        throw new Error(
          `Blocked connector "${selectedConnector.name || selectedConnector.id || "unknown"}". Use an allow-listed wallet provider.`,
        );
      }

      setLastBlockedConnector(null);
      writePreferredConnectorId(selectedConnector.id);
      pendingWalletApprovalRef.current = true;
      const session = await connectAsync({
        connector: selectedConnector,
        chainId: CELO_CHAIN_ID,
      });
      pendingWalletApprovalRef.current = false;
      return session;
    } catch (error: unknown) {
      pendingWalletApprovalRef.current = false;
      
      const providerError = error as {
        message?: string;
        code?: number;
        cause?: { message?: string; code?: number };
      };
      const errorCode = providerError?.code ?? providerError?.cause?.code;
      const message = providerError?.message || providerError?.cause?.message || String(error);
      
      const rejected = /user rejected|rejected the request|user denied/i.test(message);
      const pendingRequest =
        errorCode === -32002 ||
        /requested resource not available|already pending|wallet_requestPermissions|request of type .* already pending/i.test(message);

      if (rejected) {
        throw new Error("Conexão cancelada. Aprove a solicitação na carteira para continuar.");
      }

      if (pendingRequest) {
        throw new Error("Há uma solicitação pendente. Abra a extensão da carteira (ex: MetaMask), aprove ou rejeite o pedido pendente e tente novamente.");
      }

      throw error;
    } finally {
      connectInFlightRef.current = false;
    }
  };

  const switchToCelo = async () => {
    return switchChainAsync({ chainId: CELO_CHAIN_ID });
  };

  const signWalletMessage = async (message: string) => {
    return signMessageAsync({ message });
  };

  const disconnectWallet = async () => {
    pendingWalletApprovalRef.current = false;
    writePreferredConnectorId("");
    setWalletResetOverride(true);
    clearWalletConnectorPersistence();
    
    // Force-clear stale SIWE token so the next wallet always signs a fresh session.
    try {
      const { clearApiAuthToken } = await import("../lib/api");
      clearApiAuthToken();
    } catch (e) {
      // ignore
    }

    try {
      disconnect();
    } catch (error) {
      console.warn("Disconnect failed:", error);
    }
  };

  const nativeBalanceFormatted = nativeBalance
    ? `${Number.parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(3)} ${nativeBalance.symbol || "CELO"}`
    : "--";

  return {
    address: effectiveAddress,
    chainId: effectiveChainId,
    isConnected: effectiveIsConnected,
    connectorName: connector?.name || "Carteira",
    shortAddress: effectiveAddress ? truncateAddress(effectiveAddress, 6, 4) : "",
    nativeBalanceFormatted,
    isMiniPay,
    walletMode,
    walletConnectEnabled,
    walletSupportLabelPt,
    walletSupportLabelEn,
    hasConnector: Boolean(primaryConnector),
    connectorOptions,
    connectorDiagnostics,
    lastBlockedConnector,
    wrongNetwork: effectiveWrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectErrorMessage: connectError?.message || "",
    switchErrorMessage: switchChainError?.message || "",
    signErrorMessage: signMessageError?.message || "",
    connectWallet,
    switchToCelo,
    signWalletMessage,
    disconnectWallet,
  };
}
