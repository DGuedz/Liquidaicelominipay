import { LiquidLogo } from "./LiquidLogo";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <LiquidLogo size={80} variant="full" theme="auto" background="auto" className="mb-8" />
        <div className="h-1 w-[120px] overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full w-1/2 rounded-full bg-primary"
            style={{
              animation: "liquidai-splash-progress 1.5s linear infinite",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes liquidai-splash-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
