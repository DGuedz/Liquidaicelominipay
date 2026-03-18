import { useCallback, useEffect, useMemo, useRef } from "react";
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
  clearWalletConnectorPersistence,
  isWalletResetOverride,
  readPreferredAccounts,
  requestPreferredAccounts,
  resolveWalletMode,
  setWalletResetOverride,
  subscribePreferredProviderEvents,
} from "../lib/celo-wallet";
import { truncateAddress } from "../utils/formatters";

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

  const { data: nativeBalance } = useBalance({
    address: effectiveAddress,
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: Boolean(effectiveAddress) && effectiveIsConnected,
    },
  });

  const supportedConnectors = useMemo(
    () =>
      connectors.filter((item) => {
        const name = item.name.toLowerCase();
        const id = item.id.toLowerCase();
        return (
          item.type === "injected"
          || id.includes("meta")
          || id.includes("minipay")
          || name.includes("metamask")
          || name.includes("minipay")
        );
      }),
    [connectors],
  );

  const primaryConnector = useMemo(() => {
    if (!supportedConnectors.length) return null;

    if (resolveWalletMode() === "minipay") {
      return (
        supportedConnectors.find((item) => item.name.toLowerCase().includes("minipay"))
        ?? supportedConnectors.find((item) => item.type === "injected")
        ?? supportedConnectors[0]
      );
    }

    return (
      supportedConnectors.find((item) => item.id.toLowerCase().includes("meta") || item.name.toLowerCase().includes("metamask"))
      ?? supportedConnectors.find((item) => item.type === "injected")
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

  const requestConnectorAccounts = useCallback(
    async (connectorId: string, method: "eth_accounts" | "eth_requestAccounts") => {
      const selectedConnector = supportedConnectors.find((item) => item.id === connectorId) ?? primaryConnector;
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
      throw new Error("Há uma solicitação pendente na carteira. Abra a MetaMask ou MiniPay e conclua a aprovação antes de tentar novamente.");
    }

    connectInFlightRef.current = true;
    setWalletResetOverride(false);

    const selectedConnector =
      (connectorId
        ? supportedConnectors.find((item) => item.id === connectorId)
        : null) ?? primaryConnector;

    if (!selectedConnector) {
      connectInFlightRef.current = false;
      throw new Error("Nenhuma carteira detectada. Abra no MiniPay ou MetaMask.");
    }

    const runConnect = () =>
      connectAsync({
        connector: selectedConnector,
        chainId: CELO_CHAIN_ID,
      });

    try {
      pendingWalletApprovalRef.current = true;
      const requestedAccounts = await requestConnectorAccounts(selectedConnector.id, "eth_requestAccounts").catch((error) => {
        const providerError = error as {
          message?: string;
          code?: number;
          cause?: { message?: string; code?: number };
        };
        const errorCode = providerError?.code ?? providerError?.cause?.code;
        const message = providerError?.message || providerError?.cause?.message || String(error);
        const pendingRequest =
          errorCode === -32002
          || /requested resource not available|already pending|wallet_requestPermissions|request of type .* already pending/i.test(message);
        const rejected =
          /user rejected|rejected the request|user denied/i.test(message);

        if (pendingRequest) {
          throw new Error("Há uma solicitação pendente na carteira. Abra a MetaMask ou MiniPay e conclua ou rejeite a janela pendente.");
        }

        if (rejected) {
          pendingWalletApprovalRef.current = false;
          throw new Error("Conexão cancelada na carteira. Aprove a solicitação para continuar.");
        }

        throw error;
      });

      if (!requestedAccounts.length) {
        const hydratedAccounts = await requestConnectorAccounts(selectedConnector.id, "eth_accounts").catch(() => []);
        if (!hydratedAccounts.length) {
          pendingWalletApprovalRef.current = false;
          throw new Error("Selecione uma conta na carteira e aprove a conexão para continuar.");
        }
      }

      const session = await runConnect();
      if (session.accounts?.length) {
        pendingWalletApprovalRef.current = false;
        return session;
      }
      const hydratedAccounts = await requestConnectorAccounts(selectedConnector.id, "eth_accounts");
      if (!hydratedAccounts.length) {
        pendingWalletApprovalRef.current = false;
        throw new Error("Nenhuma conta foi selecionada na carteira.");
      }
      pendingWalletApprovalRef.current = false;
      return runConnect();
    } catch (error) {
      const providerError = error as {
        message?: string;
        code?: number;
        cause?: { message?: string; code?: number };
      };
      const errorCode = providerError?.code ?? providerError?.cause?.code;
      const message = providerError?.message || providerError?.cause?.message || String(error);
      const needsExplicitAccountRequest =
        /wallet must has at least one account|at least one account|no account|accounts/i.test(message);
      const rejected =
        /user rejected|rejected the request|user denied/i.test(message);
      const pendingRequest =
        errorCode === -32002
        || /requested resource not available|already pending|wallet_requestPermissions|request of type .* already pending/i.test(message);

      if (needsExplicitAccountRequest) {
        const requestedAccounts = await requestConnectorAccounts(selectedConnector.id, "eth_requestAccounts").catch(() => []);
        if (requestedAccounts.length > 0) {
          pendingWalletApprovalRef.current = false;
          return runConnect();
        }
        pendingWalletApprovalRef.current = false;
        throw new Error("Selecione uma conta na carteira e aprove a conexão para continuar.");
      }

      if (rejected) {
        pendingWalletApprovalRef.current = false;
        throw new Error("Conexão cancelada na carteira. Aprove a solicitação para continuar.");
      }

      if (pendingRequest) {
        throw new Error("Há uma solicitação pendente na carteira. Abra a MetaMask ou MiniPay, conclua ou rejeite a janela pendente e tente novamente.");
      }

      pendingWalletApprovalRef.current = false;
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
    setWalletResetOverride(true);
    clearWalletConnectorPersistence();

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
    hasConnector: Boolean(primaryConnector),
    connectorOptions,
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
