
'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { useAudio } from '@/components/audio/AudioProvider'

export function MasterLight() {
  const [mounted, setMounted] = useState(false)
  const { activeMetadata, isPlaying } = useAudio()
  const activeBpm = activeMetadata?.bpm || null
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 100 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // 🧬 Master BPM Rhythmic Pulse Signal: Calculation from Metadata
  const pulseDuration = activeBpm ? 60 / activeBpm : 2; 

  useEffect(() => {
    setMounted(true)
    const handleMouseMoveWindow = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMoveWindow)
    return () => window.removeEventListener('mousemove', handleMouseMoveWindow)
  }, [mouseX, mouseY])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[10] overflow-hidden">
        {/* Dynamic Glow: Follows mouse + Pulses with BPM */}
        <motion.div 
            style={{ x, y }}
            animate={{
                scale: isPlaying ? [1, 1.15, 1] : [1, 1],
                opacity: isPlaying ? [0.08, 0.15, 0.08] : [0.05, 0.05]
            }}
            transition={{
                duration: pulseDuration,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="absolute -left-40 -top-40 w-80 h-80 bg-studio-neon rounded-full blur-[100px]"
        />

        {/* Global Ambient Breath Signal: BPM-locked opacity wave */}
        <motion.div 
            animate={{
                opacity: isPlaying ? [0.01, 0.03, 0.01] : [0, 0]
            }}
            transition={{
                duration: pulseDuration,
                repeat: Infinity,
                ease: "linear"
            }}
            className="absolute inset-0 bg-studio-neon/5"
        />
    </div>
  )
}

export function ScanlineOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-[0.03]">
             <div className="absolute inset-0 scanline-bg z-10" />
             <div className="absolute top-0 left-0 w-full h-[5px] bg-studio-neon/20 animate-scan-slow blur-[2px]" />
        </div>
    )
}
