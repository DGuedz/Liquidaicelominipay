import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ToastProvider } from "./components/toast-provider";
import { SplashScreen } from "./components/splash-screen";
import { useState, useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula tempo de inicialização do "Treasury OS"
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : (
        <div className="min-h-dvh bg-background">
          <RouterProvider router={router} />
        </div>
      )}
      <ToastProvider />
    </>
  );
}

export default App;
