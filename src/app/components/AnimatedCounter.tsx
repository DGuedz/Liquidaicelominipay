import { motion, useAnimationFrame } from "motion/react";
import { useState, useRef } from "react";

export function AnimatedCounter() {
  const [cents, setCents] = useState(60);
  const lastTimeRef = useRef(0);

  // Incrementa 1 centavo a cada ~300ms para criar a ilusão de rendimento contínuo (Yield farming)
  useAnimationFrame((time) => {
    if (time - lastTimeRef.current > 300) {
      setCents((prev) => (prev >= 99 ? 0 : prev + 1));
      lastTimeRef.current = time;
    }
  });

  return (
    <motion.span
      className="text-base font-mono font-bold text-[#A3D977] inline-block min-w-[2ch]"
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {cents.toString().padStart(2, "0")}
    </motion.span>
  );
}