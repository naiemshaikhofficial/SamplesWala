'use client'

import { useEffect, useRef } from 'react'

export function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If Trustpilot is already loaded, we need to manually trigger the widget production
    if ((window as any).Trustpilot) {
      (window as any).Trustpilot.loadFromElement(ref.current)
    }
  }, [])

  return (
    <div className="w-full flex justify-center py-8 bg-black/40 border-b border-white/5">
      <div 
        ref={ref}
        className="trustpilot-widget" 
        data-locale="en-US" 
        data-template-id="56278e9abfbbba0bdcd568bc" 
        data-businessunit-id="69de81c9756cf3ddd0de99d0" 
        data-style-height="52px" 
        data-style-width="100%" 
        data-token="b8f7dba9-c2a1-416a-9993-96be8d993048"
      >
        <a href="https://www.trustpilot.com/review/sampleswala.com" target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </div>
  )
}
