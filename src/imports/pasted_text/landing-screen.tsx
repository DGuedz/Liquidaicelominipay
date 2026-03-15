'use client'

import { motion } from 'framer-motion'
import { NeonButton } from './ui/NeonButton'
import { Battery, Wifi, Signal } from 'lucide-react'
import { useConnect } from 'wagmi'
import { injected } from '@wagmi/core'
import Link from 'next/link'
import { GlassCard } from './ui/GlassCard'

export function LandingScreen() {
  const { connect } = useConnect()

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-between px-6 py-8 overflow-hidden bg-[#050A10]">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[150%] h-[40%] bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[150%] h-[40%] bg-primary-glow/10 blur-[120px] pointer-events-none" />

      {/* Top Status Bar (Mock for UI fidelity) */}
      <div className="w-full flex justify-between items-center text-white/90 text-[13px] font-medium z-10">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
          <Battery className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 max-w-sm mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-center w-full"
        >
          <h1 className="text-4xl font-bold text-primary tracking-wide mb-8 text-glow">Mentor AI</h1>
        </motion.div>

        {/* 3D Robot Image Area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
          className="relative w-full aspect-square max-w-[280px] flex items-center justify-center mb-8"
        >
          {/* Inner Glow Circle */}
          <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full animate-pulse" />
          
          {/* Robot Representation (Stylized until 3D asset is available) */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
             {/* Head */}
             <div className="w-48 h-32 bg-gradient-to-b from-primary/40 to-surfaceSolid rounded-[60px] border-t-2 border-primary/60 shadow-neon-strong flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                {/* Glass Visor */}
                <div className="w-40 h-20 bg-black/60 rounded-[40px] border border-primary/30 flex items-center justify-center gap-6 shadow-[inset_0_0_20px_rgba(0,229,255,0.2)]">
                  {/* Eyes */}
                  <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center shadow-neon">
                     <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center shadow-neon">
                     <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
                  </div>
                </div>
                {/* Antenna */}
                <div className="absolute top-0 w-2 h-4 bg-primary/80 rounded-b-full" />
             </div>
             {/* Body */}
             <div className="w-24 h-24 bg-gradient-to-b from-surfaceSolid to-primary/20 rounded-[30px] border border-primary/20 mt-2 shadow-neon relative flex justify-center">
                <div className="w-12 h-12 rounded-full border border-primary/40 mt-4 flex items-center justify-center">
                   <div className="w-6 h-6 rounded-full bg-primary/20 shadow-neon" />
                </div>
             </div>
             {/* Base/Legs */}
             <div className="flex gap-8 mt-2">
                <div className="w-8 h-12 bg-gradient-to-b from-primary/30 to-transparent rounded-t-xl" />
                <div className="w-8 h-12 bg-gradient-to-b from-primary/30 to-transparent rounded-t-xl" />
             </div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted font-light tracking-wide text-center"
        >
          Your Personal Growth Guide
        </motion.p>
      </main>

      {/* Swipe Button / Connect */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full max-w-sm mt-auto z-10 pb-4"
      >
        <button 
          onClick={() => connect({ connector: injected() })}
          className="w-full py-4 rounded-[30px] font-semibold text-[17px] text-[#050A10] bg-gradient-to-r from-primary to-primary-glow shadow-neon-strong transition-transform active:scale-[0.98] flex items-center justify-center"
        >
          Swipe to start
        </button>
      </motion.div>
      
      {/* Home Indicator (iOS style) */}
      <div className="w-32 h-1.5 bg-white/20 rounded-full mt-4" />
    </div>
  )
}
