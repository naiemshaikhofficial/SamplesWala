'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ForgeVisualizer({ isGenerating = false }: { isGenerating?: boolean }) {
  const [activeSignals, setActiveSignals] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const signals = [...Array(32)].map(() => 
        isGenerating ? (Math.random() * 80 + 20) : (Math.random() * 10 + 2)
      )
      setActiveSignals(signals)
    }, 80)
    return () => clearInterval(interval)
  }, [isGenerating])

  return (
    <div className="relative w-full h-48 bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 grid grid-cols-12 opacity-10 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="border-r border-zinc-500 h-full" />
        ))}
      </div>
      
      {/* Waveform View */}
      <div className="flex items-center gap-[2px] px-8 h-32 w-full justify-center">
        {activeSignals.map((val, i) => (
          <motion.div
            key={i}
            animate={{ 
                height: `${val}%`,
                backgroundColor: isGenerating ? '#ffffff' : '#52525b',
                opacity: isGenerating ? 1 : 0.3
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-[3px] rounded-full"
          />
        ))}
      </div>

      {/* Status Overlay */}
      {isGenerating && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            Signal Forging in Progress...
          </span>
        </div>
      )}

      {/* Scramble Text Background (Subtle) */}
      <div className="absolute top-4 right-4 text-[8px] font-mono text-zinc-800 select-none">
        METADATA_EXTRACT_0x{Math.random().toString(16).slice(2, 8).toUpperCase()}
      </div>
    </div>
  )
}

export function ForgeStatusBadge({ status }: { status: string }) {
    return (
        <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">System Status:</span>
            <span className="text-[10px] uppercase font-bold text-zinc-200">{status}</span>
        </div>
    )
}
