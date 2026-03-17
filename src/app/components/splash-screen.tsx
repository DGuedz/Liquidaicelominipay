import { LiquidLogo } from "./LiquidLogo";
import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center" 
      style={{ backgroundColor: "#020408" }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <LiquidLogo size={180} variant="full" theme="dark" background="transparent" className="mb-8" animate={true} />
        </motion.div>
        
        <div className="h-1 w-[120px] overflow-hidden rounded-full" style={{ backgroundColor: "rgba(163,217,119,0.15)" }}>
          <div
            className="h-full w-1/2 rounded-full"
            style={{
              backgroundColor: "#35D07F",
              animation: "liquidai-splash-progress 1.5s linear infinite",
              boxShadow: "0 0 10px rgba(53,208,127,0.8)"
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
    </motion.div>
  );
}
