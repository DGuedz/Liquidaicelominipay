import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { ThemeProvider } from "../hooks/useTheme";

export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      {/* Full-screen shell */}
      <div
        className="min-h-dvh relative"
        style={{ background: "var(--background)", transition: "background 0.3s ease" }}
      >
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
