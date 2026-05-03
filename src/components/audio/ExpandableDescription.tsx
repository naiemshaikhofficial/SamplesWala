'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableDescriptionProps {
    description: string
    summary?: string
}

export function ExpandableDescription({ description, summary }: ExpandableDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    
    // If description is short, don't show "View More"
    const isLong = description.length > 200

    return (
        <div className="p-6 bg-studio-grey/30 border border-white/5 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Product Description</span>
                {isLong && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[10px] font-black text-studio-neon uppercase tracking-tighter flex items-center gap-1 hover:brightness-110 transition-all"
                    >
                        {isExpanded ? (
                            <>VIEW LESS <ChevronUp size={12} /></>
                        ) : (
                            <>VIEW MORE <ChevronDown size={12} /></>
                        )}
                    </button>
                )}
            </div>

            <div className={`relative transition-all duration-700 ease-in-out overflow-hidden ${!isExpanded && isLong ? 'max-h-24' : 'max-h-[5000px]'}`}>
                <p className="text-[11px] text-white/40 leading-relaxed font-bold italic whitespace-pre-wrap">
                    {description}
                </p>
                
                {!isExpanded && isLong && (
                    <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                )}

                {isExpanded && isLong && (
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="mt-4 text-[10px] font-black text-white/20 uppercase tracking-tighter flex items-center gap-1 hover:text-studio-neon transition-all"
                    >
                        SHOW LESS <ChevronUp size={12} />
                    </button>
                )}
            </div>

            {summary && (
                <div className="pt-4 border-t border-white/5">
                    <span className="text-[8px] font-black text-studio-neon uppercase tracking-widest block mb-1">BUNDLE CONTENTS</span>
                    <p className="text-[9px] font-black text-white/60 uppercase">{summary}</p>
                </div>
            )}
        </div>
    )
}
