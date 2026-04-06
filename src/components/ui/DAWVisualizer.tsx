'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function DAWVisualizer({ color = "#a6e22e", bars = 12, height = 20, className = "" }) {
  const [activeBars, setActiveBars] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newBars = [...Array(bars)].map(() => Math.random() * 100)
      setActiveBars(newBars)
    }, 120)
    return () => clearInterval(interval)
  }, [bars])

  return (
    <div className={`flex items-end gap-0.5 ${className}`} style={{ height: `${height}px` }}>
      {activeBars.map((val, i) => (
        <motion.div
          key={i}
          animate={{ height: `${val}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-1 rounded-t-[1px]"
          style={{ backgroundColor: color, opacity: val / 100 + 0.1 }}
        />
      ))}
    </div>
  )
}

export function SignalMeter({ className = "" }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-0.5 h-1">
                    {[...Array(20)].map((_, j) => (
                        <div 
                            key={j} 
                            className={`w-1 h-full animate-pulse`} 
                            style={{ 
                                backgroundColor: j > 15 ? '#ff4b4b' : j > 10 ? '#ffd333' : '#a6e22e',
                                opacity: (i + j) % 3 === 0 ? 0.8 : 0.1,
                                animationDelay: `${(i * 0.1) + (j * 0.05)}s`
                            }} 
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
