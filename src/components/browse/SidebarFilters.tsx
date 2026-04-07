'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Layers, Activity, Keyboard, Timer, X, Sparkles, ShieldCheck, UserCheck } from 'lucide-react'

type Category = { id: string, name: string }

const musicalKeys = [
    'A', 'Am', 'A#', 'A#m', 'B', 'Bm', 'C', 'Cm', 'C#', 'C#m', 
    'D', 'Dm', 'D#', 'D#m', 'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm', 'G#', 'G#m'
]

const genres = [
    'Bollywood', 'Bhangra', 'Desi Hip Hop', 'Indian Classical', 'Sufi', 
    'Ghazal', 'Qawwali', 'South Indian', 'Haryanvi', 'Punjabi Pop',
    'Trap', 'Hip Hop', 'Drill', 'RnB', 'Lo-Fi', 'Pop', 'Cinematic', 
    '8Bit', 'Acid', 'Acoustic', 'Afrobeat', 'Ambient', 'Big Room'
]

const popularTags = ['Guitar', 'Bells', 'Synth', 'Bass', 'Vocal', 'Flute', 'Piano', 'Drum Kit', 'FX']

export function SidebarFilters({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const currentCategory = searchParams.get('category')
    const currentType = searchParams.get('type')
    const currentKey = searchParams.get('key')
    const currentTag = searchParams.get('tag')
    
    // 🧬 Filter Settings
    const [bpmMin, setBpmMin] = useState(searchParams.get('bpm_min') || '')
    const [bpmMax, setBpmMax] = useState(searchParams.get('bpm_max') || '')
    
    const currentQuery = searchParams.get('q')

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

    // GENRE SECTION
    const GenreSection = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                <Sparkles size={14} className="text-studio-neon" /> GENRE
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {genres.map((genre) => {
                    const genreVal = genre.toLowerCase();
                    const isActive = searchParams.get('genre') === genreVal;
                    return (
                        <Link 
                            key={genre}
                            href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), genre: genreVal }).toString()}`}
                            className={`px-3 py-2.5 text-[9px] uppercase font-black tracking-widest transition-all border text-center ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                        >
                            {genre}
                        </Link>
                    )
                })}
            </div>
        </div>
    )

    // TAGS SECTION
    const TagSection = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                <Activity size={14} className="text-studio-neon" /> POPULAR TAGS
            </div>
            <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => {
                    const isActive = currentTag === tag.toLowerCase();
                    return (
                        <Link 
                            key={tag}
                            href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), tag: tag.toLowerCase() }).toString()}`}
                            className={`px-3 py-1.5 text-[9px] uppercase font-black tracking-widest border transition-all ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                        >
                            #{tag}
                        </Link>
                    )
                })}
            </div>
        </div>
    )

    // INSTRUMENT SECTION
    const InstrumentSection = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                <Layers size={14} className="text-studio-neon" /> INSTRUMENT
            </div>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                <Link href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: '' }).toString()}`} className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest transition-all ${!currentCategory ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5 border border-white/10'}`}>ALL INSTRUMENTS</Link>
                {categories?.map((cat) => (
                    <Link 
                        key={cat.id} 
                        href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat.id }).toString()}`}
                        className={`px-4 py-2.5 text-[10px] uppercase font-black tracking-widest transition-all border border-transparent ${currentCategory === cat.id ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5 border-white/10'}`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </div>
    )

    // KEY SECTION
    const KeySection = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                <Keyboard size={14} className="text-studio-neon" /> MUSICAL KEY
            </div>
            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {musicalKeys.map((k) => (
                    <Link 
                        key={k}
                        href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), key: k }).toString()}`}
                        className={`h-9 flex items-center justify-center text-[9px] border font-black transition-all ${currentKey === k ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/30 border-white/10 hover:bg-white/5'}`}
                    >
                        {k}
                    </Link>
                ))}
            </div>
        </div>
    )

    return (
        <aside className="w-full md:w-80 border-r-2 border-black bg-[#0d0d0d] p-8 space-y-12 shrink-0">
            
            {/* Filters Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">FILTERS</span>
                {(currentCategory || currentType || currentKey || bpmMin || bpmMax) && (
                    <button onClick={clearFilters} className="text-studio-neon hover:text-white transition-colors text-[10px] font-bold">
                        CLEAR
                    </button>
                )}
            </div>

            <GenreSection />
            <TagSection />
            <InstrumentSection />

            {/* Format Type */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Activity size={14} className="text-studio-neon" /> FORMAT
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {['Loops', 'Oneshots'].map((type) => {
                        const typeVal = type.toLowerCase();
                        const isActive = currentType === typeVal;
                        return (
                            <Link 
                                key={type}
                                href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), type: typeVal }).toString()}`}
                                className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest text-center transition-all border ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                {type}
                            </Link>
                        )
                    })}
                </div>
            </div>

            <KeySection />

            {/* Time Signature */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Activity size={14} className="text-studio-neon" /> TIME SIG
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                    {['4/4', '3/4', '6/8'].map((sig) => {
                        const isActive = searchParams.get('time_sig') === sig;
                        return (
                            <Link 
                                key={sig}
                                href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), time_sig: sig }).toString()}`}
                                className={`px-3 py-2.5 text-[9px] uppercase font-bold tracking-widest transition-all border text-center ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                {sig}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Producer Search */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <UserCheck size={14} className="text-studio-neon" /> BY DESIGNER
                </div>
                <input 
                    type="text" 
                    value={searchParams.get('producer') || ''}
                    onChange={(e) => updateFilters({ producer: e.target.value })}
                    placeholder="NAME..." 
                    className="w-full bg-black border border-white/10 p-3 text-[11px] font-black text-white focus:border-studio-neon focus:outline-none transition-all placeholder:text-white/10 uppercase"
                />
            </div>

            {/* Tempo & BPM */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Timer size={14} className="text-studio-neon" /> BPM
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input 
                        type="number" 
                        value={bpmMin}
                        onChange={(e) => setBpmMin(e.target.value)}
                        onBlur={() => updateFilters({ bpm_min: bpmMin })}
                        placeholder="MIN" 
                        className="w-full bg-black border border-white/10 p-3 text-[11px] font-black text-white focus:border-studio-neon focus:outline-none transition-all placeholder:text-white/10"
                    />
                    <input 
                        type="number" 
                        value={bpmMax}
                        onChange={(e) => setBpmMax(e.target.value)}
                        onBlur={() => updateFilters({ bpm_max: bpmMax })}
                        placeholder="MAX" 
                        className="w-full bg-black border border-white/10 p-3 text-[11px] font-black text-white focus:border-studio-neon focus:outline-none transition-all placeholder:text-white/10"
                    />
                </div>
            </div>

            {/* Suggested for you */}
            <div className="pt-8 border-t-2 border-black space-y-6">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-studio-neon italic animate-pulse">
                    <Activity size={14} /> AI Suggested
                </div>
                
                <div className="p-5 bg-black/60 border border-white/5 space-y-5 rounded-sm shadow-[0_0_30px_rgba(0,255,157,0.03)]">
                    {/* Vibe (Calculated) */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                            <span>Vibe</span>
                            <span className="text-studio-neon">84.2%</span>
                        </div>
                        <div className="h-1 bg-white/5 w-full flex">
                            <div className="h-full bg-studio-neon shadow-[0_0_10px_rgba(0,255,157,0.5)] w-[84%] transition-all duration-[3000ms]"></div>
                        </div>
                    </div>

                    {/* Complexity */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                            <span>Complexity</span>
                            <span className="text-white/60">MEDIUM HIGH</span>
                        </div>
                        <div className="h-1 bg-white/5 w-full flex gap-1">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className={`h-full flex-1 ${i <= 6 ? 'bg-white/20' : 'bg-white/5'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Suggested sounds */}
                    <div className="pt-2 border-t border-white/5 space-y-3">
                        <div className="text-[7px] font-black text-studio-neon/40 uppercase tracking-[0.2em]">Suggested for you</div>
                        <div className="text-[9px] font-bold text-white/60 lowercase italic leading-relaxed">
                            "Our AI found some great {currentTag || 'melodic'} sounds matching your style."
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-[8px] font-black text-white/10 uppercase tracking-widest">
                        <ShieldCheck size={10} /> Secure Storage
                    </div>
                    <div className="text-[8px] font-black text-studio-neon/20 uppercase tracking-widest animate-pulse">
                        Scanning...
                    </div>
                </div>
            </div>

            {/* Sort & Limit */}
            <div className="grid grid-cols-2 gap-4 pb-12">
                <div className="space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">SORT BY</span>
                    <select 
                        value={searchParams.get('sort') || 'newest'}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        className="w-full bg-black border border-white/10 p-2 text-[9px] font-black text-white/60 focus:text-studio-neon focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="bpm">BPM</option>
                        <option value="key">Key</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 italic">SHOW</span>
                    <select 
                        value={searchParams.get('limit') || '25'}
                        onChange={(e) => updateFilters({ limit: e.target.value })}
                        className="w-full bg-black border border-white/10 p-2 text-[9px] font-black text-white/60 focus:text-studio-neon focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="10">10 sounds</option>
                        <option value="25">25 sounds</option>
                        <option value="50">50 sounds</option>
                    </select>
                </div>
            </div>

            {/* Reset Filters */}
            <div className="pt-12 border-t-2 border-black space-y-4">
                <button 
                  onClick={clearFilters}
                  className="w-full py-4 bg-red-950/20 border-2 border-black text-red-500 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-red-500 hover:text-white transition-all italic flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(255,0,0,0.05)]"
                >
                    <X size={16} /> Reset Filters
                </button>
                <div className="p-6 bg-black/40 border-2 border-black">
                    <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Status</div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/10">
                            <span className="flex items-center gap-2"><Activity size={8} className="text-studio-neon" /> Connection</span>
                            <span className="text-studio-neon italic">Active</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/10">
                            <span className="flex items-center gap-2"><ShieldCheck size={8} className="text-studio-neon" /> Protection</span>
                            <span className="text-studio-neon italic">Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
