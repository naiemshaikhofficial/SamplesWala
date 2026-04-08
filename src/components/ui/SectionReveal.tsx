'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

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
      // 📱 SAFETY: Force visibility on mobile to prevent clipping
      const checkMobile = () => {
        if (window.innerWidth < 768) {
            setIsVisible(true)
        }
      }
      
      checkMobile()

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            // Keep it visible once it has intersected
            if (entry.isIntersecting) setIsVisible(true)
        })
      }, { threshold: 0.1 })

      const { current } = internalRef
      if (current) observer.observe(current)

      return () => {
        if (current) observer.unobserve(current)
      }
    }, [])

    return (
      <div
        ref={internalRef}
        className={`section-reveal ${isVisible ? 'active' : ''} reveal-delay-${delay} ${className}`}
        style={style}
      >
        {children}
      </div>
    )
  }
)

SectionReveal.displayName = 'SectionReveal'
