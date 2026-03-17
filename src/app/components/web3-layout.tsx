import { Outlet } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { queryClient, wagmiConfig } from "../lib/celo-wallet";

export function Web3Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <Outlet />
      </WagmiProvider>
    </QueryClientProvider>
  );
}
