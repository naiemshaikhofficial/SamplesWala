
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Lock, CheckCircle2, X, ShoppingCart, Sparkles, Database } from 'lucide-react'

interface BatchActionsProps {
  selectedIds: string[]
  onClear: () => void
  onBulkAction: (action: 'unlock' | 'download') => void
  isProcessing?: boolean
}

export function BatchActions({ selectedIds, onClear, onBulkAction, isProcessing }: BatchActionsProps) {
  if (selectedIds.length === 0) return null

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-2xl bg-black border-2 border-studio-neon p-6 shadow-[0_0_50px_rgba(166,226,46,0.2)] rounded-none"
        >
             {/* 🧬 SCANLINE OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-studio-neon flex items-center justify-center text-black">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-studio-neon mb-1">
                            BATCH_COLLECTION_INTAKE
                        </h3>
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">
                            {selectedIds.length} ARTIFACTS STAGED FOR PROCESSING
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClear}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all"
                    >
                        ABORT_SELECTION
                    </button>
                    <button 
                        onClick={() => onBulkAction('unlock')}
                        disabled={isProcessing}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-studio-neon transition-all"
                    >
                         {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                         UNLOCK_SELECTION
                    </button>
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
  )
}
