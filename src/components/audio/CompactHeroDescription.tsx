'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function CompactHeroDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!description) return null

  return (
    <div className="mt-4 space-y-2">
      <div className={`text-[11px] font-bold text-white/40 leading-relaxed transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[1.6em] opacity-80'}`}>
        <p className={isExpanded ? 'whitespace-pre-wrap' : 'truncate'}>
          {description}
        </p>
      </div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-[9px] font-black text-studio-neon uppercase tracking-widest hover:text-white transition-colors"
      >
        {isExpanded ? (
          <>SHOW LESS <ChevronUp size={10} /></>
        ) : (
          <>VIEW MORE <ChevronDown size={10} /></>
        )}
      </button>
    </div>
  )
}
