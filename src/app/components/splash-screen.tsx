import { motion } from "motion/react";
import { LiquidLogo } from "./LiquidLogo";

export function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center">
        <LiquidLogo size={80} variant="full" theme="auto" background="auto" className="mb-8" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-1 rounded-full bg-primary/20 overflow-hidden"
        >
          <motion.div 
            className="h-full bg-primary"
            animate={{ x: [-120, 120] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
