'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'

interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3
  style?: React.CSSProperties
}

export const SectionReveal = forwardRef<HTMLDivElement, SectionRevealProps>(
  ({ children, className = '', delay = 0, style }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const internalRef = useRef<HTMLDivElement>(null)

    // @ts-ignore
    useImperativeHandle(ref, () => internalRef.current)

    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => setIsVisible(entry.isIntersecting))
      }, { threshold: 0.1 })

      const { current } = internalRef
      if (current) observer.observe(current)

      return () => {
        if (current) observer.unobserve(current)
      }
    }, [])

    return (
      <motion.div
        ref={internalRef}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 30 }
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay * 0.2 }}
        className={`section-reveal ${className}`}
        style={{ ...style, position: 'relative' }}
      >
        {children}
      </motion.div>
    )
  }
)

SectionReveal.displayName = 'SectionReveal'
