'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps {
  children: React.ReactNode[]
  title?: string
  className?: string
}

export function Carousel({ children, title, className = "" }: CarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [children])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      const scrollAmount = direction === 'left' ? -clientWidth / 1.2 : clientWidth / 1.2
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* 🧬 MECHANICAL NAVIGATION BUTTONS */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 h-16 w-10 bg-black/80 border border-white/10 flex items-center justify-center text-studio-neon hover:bg-studio-neon hover:text-black transition-all"
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 h-16 w-10 bg-black/80 border border-white/10 flex items-center justify-center text-studio-neon hover:bg-studio-neon hover:text-black transition-all"
          >
            <ChevronRight size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-8 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children.map((child, i) => (
          <div key={i} className="shrink-0 w-[85vw] sm:w-[50vw] md:w-[40vw] lg:w-[25vw]">
            {child}
          </div>
        ))}
      </div>

      {/* 🧬 STATUS PAGE INDICATORS (The 1, 2, 3 User Mentioned) */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(children.length / 4) }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1 transition-all duration-500 ${i === 0 ? 'w-8 bg-studio-neon' : 'w-4 bg-white/10'}`} 
          />
        ))}
      </div>
    </div>
  )
}
