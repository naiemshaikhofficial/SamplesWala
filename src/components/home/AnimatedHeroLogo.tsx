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
          className="w-full max-w-3xl h-auto object-contain brightness-110"
          priority
        />
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
