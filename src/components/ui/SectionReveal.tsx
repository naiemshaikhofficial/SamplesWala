'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3
}

export const SectionReveal = forwardRef<HTMLDivElement, SectionRevealProps>(
  ({ children, className = '', delay = 0 }, ref) => {
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
      <div
        ref={internalRef}
        className={`section-reveal ${isVisible ? 'active' : ''} reveal-delay-${delay} ${className}`}
      >
        {children}
      </div>
    )
  }
)

SectionReveal.displayName = 'SectionReveal'
