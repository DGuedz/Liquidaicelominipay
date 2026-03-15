import { Outlet } from "react-router";
import { ThemeProvider } from "../hooks/useTheme";

export function RootLayout() {
  return (
    <ThemeProvider>
      {/* Full-screen shell — fills background outside phone column on desktop */}
      <div
        className="min-h-dvh"
        style={{ background: "var(--background)", transition: "background 0.3s ease" }}
      >
        {/* Phone column — mobile: full width · desktop: 430px centered */}
        <div
          className="relative mx-auto min-h-dvh"
          style={{ maxWidth: 430 }}
        >
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
}