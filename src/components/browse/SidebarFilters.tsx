'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Layers, Activity, Keyboard, Timer, X } from 'lucide-react'

type Category = { id: string, name: string }

export function SidebarFilters({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // 🧬 Filter State Architecture
    const [bpmMin, setBpmMin] = useState(searchParams.get('bpm_min') || '')
    const [bpmMax, setBpmMax] = useState(searchParams.get('bpm_max') || '')
    
    const currentCategory = searchParams.get('category')
    const currentType = searchParams.get('type')
    const currentKey = searchParams.get('key')
    const currentQuery = searchParams.get('q')

    const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // 📡 SIGNAL_ROUTING: Update URL when filters change (debounced for logic)
    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, val]) => {
            if (val === null || val === '') params.delete(key)
            else params.set(key, val)
        })
        router.push(`/browse?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push('/browse')
        setBpmMin('')
        setBpmMax('')
    }

    return (
        <aside className="w-full md:w-80 border-r-2 border-black bg-[#0d0d0d] p-8 space-y-12 shrink-0">
            
            {/* Header Signal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Diagnostic_Filters</span>
                {(currentCategory || currentType || currentKey || bpmMin || bpmMax) && (
                    <button onClick={clearFilters} className="text-studio-neon hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Instruments Filter */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <Layers size={12} className="text-studio-neon" /> Instrument_ID
                </div>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    <Link href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: '' }).toString()}`} className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest transition-all ${!currentCategory ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5'}`}>[ ALL_INSTRUMENTS ]</Link>
                    {categories?.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat.id }).toString()}`}
                            className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest transition-all ${currentCategory === cat.id ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5'}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <Activity size={12} className="text-studio-neon" /> Sample_Format
                </div>
                <div className="flex flex-col gap-1">
                    {['Loops', 'Oneshots'].map((type) => {
                        const typeVal = type.toLowerCase();
                        const isActive = currentType === typeVal;
                        return (
                            <Link 
                                key={type}
                                href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), type: typeVal }).toString()}`}
                                className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest transition-all ${isActive ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5'}`}
                            >
                                {type}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Musical Key Filter */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <Keyboard size={12} className="text-studio-neon" /> Signature_Key
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {musicalKeys.map((k) => (
                        <Link 
                            key={k}
                            href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), key: k }).toString()}`}
                            className={`h-10 flex items-center justify-center text-[10px] border border-white/5 font-black transition-all ${currentKey === k ? 'bg-studio-neon text-black' : 'text-white/30 hover:bg-white/5'}`}
                        >
                            {k}
                        </Link>
                    ))}
                </div>
            </div>

            {/* BPM Range Indicator */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <Timer size={12} className="text-studio-neon" /> Tempo_Bounds
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        value={bpmMin}
                        onChange={(e) => setBpmMin(e.target.value)}
                        onBlur={() => updateFilters({ bpm_min: bpmMin })}
                        placeholder="MIN" 
                        className="w-full bg-black border-2 border-white/5 p-3 text-[10px] font-black text-white focus:border-studio-neon focus:outline-none transition-all placeholder:text-white/10"
                    />
                    <span className="opacity-20">-</span>
                    <input 
                        type="number" 
                        value={bpmMax}
                        onChange={(e) => setBpmMax(e.target.value)}
                        onBlur={() => updateFilters({ bpm_max: bpmMax })}
                        placeholder="MAX" 
                        className="w-full bg-black border-2 border-white/5 p-3 text-[10px] font-black text-white focus:border-studio-neon focus:outline-none transition-all placeholder:text-white/10"
                    />
                </div>
            </div>

            {/* Diagnostic Details */}
            <div className="pt-12 border-t border-white/5">
                <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
                    <div className="text-[7px] font-black text-white/10 uppercase tracking-[0.2em] mb-2">TELEMETRY_NODE</div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                        <span className="text-white/20">LATENCY</span>
                        <span className="text-studio-neon">0.02ms</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
