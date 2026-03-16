import { useMemo } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import { CELO_CHAIN_ID, isMiniPayEnvironment, requestPreferredAccounts } from "../lib/celo-wallet";
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

  const { data: nativeBalance } = useBalance({
    address,
    chainId: CELO_CHAIN_ID,
    query: {
      enabled: Boolean(address) && isConnected,
    },
  });

  const wrongNetwork = isConnected && chainId !== CELO_CHAIN_ID;
  const isMiniPay = isMiniPayEnvironment();

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
      connectors.find((item) => item.name.toLowerCase().includes("metamask") || item.id.toLowerCase().includes("meta"))
      ?? connectors.find((item) => item.type === "injected")
      ?? connectors[0]
    );
  }, [connectors, isMiniPay]);

  const connectWallet = async () => {
    if (!primaryConnector) {
      throw new Error("Nenhuma carteira detectada. Abra no MiniPay ou MetaMask.");
    }

    const runConnect = () =>
      connectAsync({
        connector: primaryConnector,
        chainId: CELO_CHAIN_ID,
      });

    try {
      const session = await runConnect();
      if (session.accounts?.length) return session;
      const requestedAccounts = await requestPreferredAccounts();
      if (!requestedAccounts.length) {
        throw new Error("Nenhuma conta foi selecionada na carteira.");
      }
      return runConnect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const needsExplicitAccountRequest =
        /wallet must has at least one account|at least one account|no account|accounts/i.test(message);
      const rejected =
        /user rejected|rejected the request|user denied/i.test(message);

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

      throw error;
    }
  };

  const switchToCelo = async () => {
    return switchChainAsync({ chainId: CELO_CHAIN_ID });
  };

  const signWalletMessage = async (message: string) => {
    return signMessageAsync({ message });
  };

  const nativeBalanceFormatted = nativeBalance
    ? `${Number.parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(3)} ${nativeBalance.symbol || "CELO"}`
    : "--";

  return {
    address,
    chainId,
    isConnected,
    connectorName: connector?.name || "Carteira",
    shortAddress: address ? truncateAddress(address, 6, 4) : "",
    nativeBalanceFormatted,
    isMiniPay,
    hasConnector: Boolean(primaryConnector),
    wrongNetwork,
    isConnecting,
    isSwitchingChain,
    isSigningMessage,
    connectErrorMessage: connectError?.message || "",
    switchErrorMessage: switchChainError?.message || "",
    signErrorMessage: signMessageError?.message || "",
    connectWallet,
    switchToCelo,
    signWalletMessage,
    disconnectWallet: disconnect,
  };
}
