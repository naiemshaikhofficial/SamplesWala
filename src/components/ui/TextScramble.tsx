'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'

interface TextScrambleProps {
  text: string
  autostart?: boolean
  duration?: number
  delay?: number
  className?: string
  as?: React.ElementType
}

export function TextScramble({
  text,
  autostart = true,
  duration = 800,
  delay = 0,
  className = '',
  as: Component = 'span'
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text)
  const isAnimating = useRef(false)
  const frameId = useRef<number | null>(null)

  const scramble = useCallback(() => {
    if (isAnimating.current) return
    isAnimating.current = true

    let start: number | null = null
    const originalText = text

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)

      const scrambled = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '/' || char === '—') return char
          if (progress > (index / originalText.length) * 0.8) return char
          return glyphs[Math.floor(Math.random() * glyphs.length)]
        })
        .join('')

      setDisplayText(scrambled)

      if (progress < 1) {
        frameId.current = requestAnimationFrame(animate)
      } else {
        setDisplayText(originalText)
        isAnimating.current = false
      }
    }

    frameId.current = requestAnimationFrame(animate)
  }, [text, duration])

  useEffect(() => {
    if (autostart) {
      const timeout = setTimeout(scramble, delay)
      return () => {
        clearTimeout(timeout)
        if (frameId.current) cancelAnimationFrame(frameId.current)
      }
    }
  }, [autostart, delay, scramble])

  return (
    <Component 
      className={className}
      onMouseEnter={() => !isAnimating.current && scramble()}
    >
      {displayText}
    </Component>
  )
}
