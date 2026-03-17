import { useMemo, useRef } from "react";
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
  isMiniPayEnvironment,
  isPreferredWalletUnlocked,
  isWalletResetOverride,
  readPreferredAccounts,
  requestPreferredAccounts,
  setWalletResetOverride,
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
  const isMiniPay = isMiniPayEnvironment();
  const walletResetOverride = isWalletResetOverride();
  const effectiveIsConnected = isConnected && !walletResetOverride;
  const effectiveAddress = walletResetOverride ? undefined : address;
  const effectiveChainId = walletResetOverride ? undefined : chainId;
  const effectiveWrongNetwork = effectiveIsConnected && effectiveChainId !== CELO_CHAIN_ID;
  const connectInFlightRef = useRef(false);

  const { data: nativeBalance } = useBalance({
    address: effectiveAddress,
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: Boolean(effectiveAddress) && effectiveIsConnected,
    },
  });

  const primaryConnector = useMemo(() => {
    if (!connectors.length) return null;

    if (isMiniPay) {
      return (
        connectors.find((item) => item.name.toLowerCase().includes("minipay"))
        ?? connectors.find((item) => item.type === "injected")
        ?? connectors[0]
      );
    }

    return (
      connectors.find((item) => item.type === "injected")
      ?? connectors.find((item) => item.name.toLowerCase().includes("metamask") || item.id.toLowerCase().includes("meta"))
      ?? connectors[0]
    );
  }, [connectors, isMiniPay]);

  const connectWallet = async () => {
    if (connectInFlightRef.current) {
      throw new Error("Há uma solicitação pendente na carteira. Abra a MetaMask ou MiniPay e conclua a aprovação antes de tentar novamente.");
    }

    connectInFlightRef.current = true;
    setWalletResetOverride(false);

    if (!primaryConnector) {
      connectInFlightRef.current = false;
      throw new Error("Nenhuma carteira detectada. Abra no MiniPay ou MetaMask.");
    }

    const runConnect = () =>
      connectAsync({
        connector: primaryConnector,
        chainId: CELO_CHAIN_ID,
      });

    try {
      const walletUnlocked = await isPreferredWalletUnlocked();
      if (!walletUnlocked) {
        throw new Error("Desbloqueie a MetaMask para continuar.");
      }

      const existingAccounts = await readPreferredAccounts().catch(() => []);
      if (!existingAccounts.length) {
        const requestedAccounts = await requestPreferredAccounts().catch((error) => {
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
            throw new Error(walletUnlocked
              ? "Há uma solicitação pendente na carteira. Abra a MetaMask ou MiniPay e conclua ou rejeite a janela pendente."
              : "Desbloqueie a MetaMask para continuar.");
          }

          if (rejected) {
            throw new Error("Conexão cancelada na carteira. Aprove a solicitação para continuar.");
          }

          throw error;
        });

        if (!requestedAccounts.length) {
          throw new Error("Selecione uma conta na carteira e aprove a conexão para continuar.");
        }
      }

      const session = await runConnect();
      if (session.accounts?.length) return session;
      const requestedAccounts = await readPreferredAccounts();
      if (!requestedAccounts.length) {
        throw new Error("Nenhuma conta foi selecionada na carteira.");
      }
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
        const requestedAccounts = await requestPreferredAccounts().catch(() => []);
        if (requestedAccounts.length > 0) {
          return runConnect();
        }
        throw new Error("Selecione uma conta na carteira e aprove a conexão para continuar.");
      }

      if (rejected) {
        throw new Error("Conexão cancelada na carteira. Aprove a solicitação para continuar.");
      }

      if (pendingRequest) {
        throw new Error("Há uma solicitação pendente na carteira. Abra a MetaMask ou MiniPay, conclua ou rejeite a janela pendente e tente novamente.");
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
    hasConnector: Boolean(primaryConnector),
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
