'use client'

import { useAccount, useConnect } from 'wagmi'
import { injected } from '@wagmi/core'
import { AgentStatusCard } from './AgentStatusCard'
import { OptimizationCard } from './OptimizationCard'
import { CashflowMap } from './CashflowMap'
import { Loader2, Wallet, Bot, Check, Home, LayoutDashboard, BarChart2, PlusCircle } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { NeonButton } from './ui/NeonButton'

export function Dashboard() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect } = useConnect()

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#050A10]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted">Connecting to MiniPay...</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center px-6 bg-[#050A10]">
        <GlassCard className="w-full max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect Wallet</h1>
          <p className="text-muted mb-8 max-w-sm text-sm">
            Access your Mentor AI dashboard.
          </p>
          <NeonButton onClick={() => connect({ connector: injected() })}>
            Connect
          </NeonButton>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#050A10] text-white pb-24 font-sans relative">
      {/* Background glow */}
      <div className="fixed top-0 left-0 w-full h-64 bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="px-6 pt-12 relative z-10">
        <h1 className="text-3xl font-bold text-primary tracking-wide mb-6">Dashboard</h1>
        
        {/* Treasury Cards */}
        <h2 className="text-sm font-semibold text-white/90 mb-3">Treasury Cards</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="text-[13px] text-muted mb-1 font-medium">Live Cash</p>
            <p className="text-lg font-bold text-primary tracking-tight">$cUSD</p>
            <p className="text-[11px] text-muted/80 mt-1">cUSD balance</p>
          </div>
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="text-[13px] text-muted mb-1 font-medium">Productive Capital</p>
            <p className="text-lg font-bold text-primary-glow tracking-tight">$1.22M</p>
            <p className="text-[11px] text-muted/80 mt-1">active yield bearing balance</p>
          </div>
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="text-[13px] text-muted mb-1 font-medium">Receivables</p>
            <p className="text-lg font-bold text-primary tracking-tight">$38.83B</p>
            <p className="text-[11px] text-muted/80 mt-1">APY balance</p>
          </div>
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="text-[13px] text-muted mb-1 font-medium">Yield of the month</p>
            <p className="text-lg font-bold text-primary-glow tracking-tight">+1.37%</p>
            <p className="text-[11px] text-muted/80 mt-1">APY estimated</p>
          </div>
        </div>

        {/* Agent Status (Functional) */}
        <AgentStatusCard />

        {/* Optimization (Functional) */}
        <OptimizationCard />

        {/* Cashflow (Functional) */}
        <div className="mt-6">
           <CashflowMap />
        </div>

        {/* Online Now Mock (Visual Only) */}
        <div className="flex justify-between items-center mb-5 mt-8">
          <h2 className="text-[15px] font-semibold text-white/90 tracking-wide">Online Now</h2>
          <span className="bg-[#111827] text-primary text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-[0_0_10px_rgba(0,229,255,0.1)]">18</span>
        </div>
        <div className="flex justify-between mb-8 px-1">
          {['Jos', 'Eva', 'Milley', 'Amara'].map((name, i) => (
             <div key={name} className="flex flex-col items-center gap-2.5">
               <div className={`w-[60px] h-[60px] rounded-full border-[2.5px] p-0.5 overflow-hidden ${i < 2 ? 'border-primary shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'border-white/10'}`}>
                 <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-full" />
               </div>
               <span className="text-[12px] text-muted font-medium">{name}</span>
             </div>
          ))}
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-[#080C14]/80 backdrop-blur-2xl border-t border-white/5 px-8 py-5 flex justify-between items-center z-50">
        <div className="flex flex-col items-center gap-1.5 text-muted hover:text-white transition-colors cursor-pointer">
          <Home className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="text-[10px] font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-primary cursor-pointer">
          <LayoutDashboard className="w-[22px] h-[22px] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" strokeWidth={2} />
          <span className="text-[10px] font-medium">Dashboard</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-muted hover:text-white transition-colors cursor-pointer">
          <BarChart2 className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="text-[10px] font-medium">Estatísticas</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-muted hover:text-white transition-colors cursor-pointer">
          <PlusCircle className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="text-[10px] font-medium">Mais</span>
        </div>
      </div>
    </div>
  )
}
