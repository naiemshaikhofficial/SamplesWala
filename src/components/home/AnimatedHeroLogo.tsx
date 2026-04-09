'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function AnimatedHeroLogo() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ 
        duration: 1.5, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2 
      }}
      className="relative mb-6 transform-gpu"
    >
      <motion.div
        animate={{ 
            y: [2, -2, 2],
            rotate: [0.5, -0.5, 0.5]
        }}
        transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        className="relative z-10"
      >
        <Image 
          src="/Logo.png" 
          alt="SAMPLES WALA Logo" 
          width={800} 
          height={200} 
          style={{ height: 'auto' }}
          className="w-full max-w-3xl h-auto object-contain brightness-150 mx-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_80px_rgba(166,226,46,0.4)] transition-all duration-1000 select-none pointer-events-none"
          priority
        />
        
        {/* 🧬 CONSOLE_SIG_AURA */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[100px] bg-white opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
      </motion.div>
      
      {/* 🎰 ANALOG SIGNAL PULSE (Subtle) */}
      <motion.div 
        animate={{ 
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.05, 1]
        }}
        transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "linear" 
        }}
        className="absolute inset-0 border-y border-white/5 -z-10 scale-y-[1.5]" 
      />
    </motion.div>
  )
}
