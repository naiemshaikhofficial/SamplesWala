'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function AnimatedHeroLogo() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 1.2, 
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for premium feel
        delay: 0.2 
      }}
      className="relative mb-6 transform-gpu"
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
        transition={{ duration: 0.4 }}
        className="relative z-10 cursor-pointer"
      >
        <Image 
          src="/Logo.png" 
          alt="SAMPLES WALA Logo" 
          width={800} 
          height={200} 
          style={{ height: 'auto' }}
          className="w-full max-w-3xl h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          priority
        />
      </motion.div>
      
      {/* 🎰 SUBTLE GLOW EFFECT */}
      <div className="absolute inset-0 bg-white/5 blur-[100px] -z-10 rounded-full scale-75" />
    </motion.div>
  )
}
