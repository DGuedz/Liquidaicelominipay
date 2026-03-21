import * as React from "react";
import { Bot, Zap } from "lucide-react";

interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell = ({ children }: LayoutShellProps) => {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans antialiased selection:bg-cyan selection:text-black">
      {/* Invisible DeFi Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-glass border-b border-border-subtle">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan" />
            </div>
            <span className="font-semibold tracking-tight">LiquidAI</span>
          </div>
          
          {/* Status Indicator (No "Connect Wallet" button) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald/10 border border-emerald/20">
            <Zap className="w-3 h-3 text-emerald fill-emerald" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald">Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area (Mobile constrained) */}
      <main className="max-w-md mx-auto w-full pb-20">
        {children}
      </main>
    </div>
  );
};
