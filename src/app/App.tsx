import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ToastProvider } from "./components/toast-provider";
import { queryClient, wagmiConfig } from "./lib/celo-wallet";
import { SplashScreen } from "./components/splash-screen";
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula tempo de inicialização do "Treasury OS"
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {loading ? (
          <SplashScreen />
        ) : (
          <div className="min-h-dvh bg-gray-100 flex justify-center">
            <div
              className="w-full relative bg-background"
              style={{ maxWidth: "430px", minHeight: "100dvh" }}
            >
              <RouterProvider router={router} />
            </div>
          </div>
        )}
        <ToastProvider />
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
