'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function SignalScan() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[15] overflow-hidden">
      {/* 🧬 GLOBAL SCAN LINE (Musician Precision) */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 2
        }}
        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20"
      />
      
      {/* 🧬 PULSING SIGNAL BORDER (Subtle Studio Feel) */}
      <motion.div 
        animate={{ 
            boxShadow: [
                "inset 0 0 0 1px rgba(255,255,255,0.02)", 
                "inset 0 0 0 1px rgba(255,255,255,0.05)", 
                "inset 0 0 0 1px rgba(255,255,255,0.02)"
            ]
        }}
        transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        className="absolute inset-0"
      />
    </div>
  )
}
