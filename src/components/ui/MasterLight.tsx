'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export function MasterLight() {
  const [mounted, setMounted] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 100 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  if (!mounted) return null

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-[10] overflow-hidden"
      style={{
        background: `radial-gradient(circle 400px at ${x.get()}px ${y.get()}px, rgba(166, 226, 46, 0.03), transparent 70%)`
      }}
    >
        {/* Subtle Tracking Dot */}
        <motion.div 
            style={{ x, y }}
            className="absolute -left-20 -top-20 w-40 h-40 bg-studio-neon opacity-[0.05] rounded-full blur-[60px]"
        />
    </motion.div>
  )
}

export function ScanlineOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-[0.03]">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
             <div className="absolute top-0 left-0 w-full h-[5px] bg-studio-neon/20 animate-scan-slow blur-[2px]" />
        </div>
    )
}
