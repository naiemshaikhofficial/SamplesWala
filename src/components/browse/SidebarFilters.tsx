'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
    Layers, Activity, Keyboard, Timer, X, Sparkles, ArrowRight,
    Filter as FilterIcon, SlidersHorizontal, ChevronDown,
    ShieldCheck, UserCheck, Search, Disc, Settings2, Mic2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    const currentGenre = searchParams.get('genre')
    
    // 🧬 Filter Settings
    const [bpmMin, setBpmMin] = useState(searchParams.get('bpm_min') || '')
    const [bpmMax, setBpmMax] = useState(searchParams.get('bpm_max') || '')
    const [isMobileOpen, setIsMobileOpen] = useState(false)

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
        setIsMobileOpen(false)
    }

    // 🎹 KEY SIGNATURE TERMINAL
    const KeySelector = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-l-2 border-studio-neon pl-3">
                KEY SIGNATURE
            </div>
            <div className="grid grid-cols-4 gap-1">
                {musicalKeys.map(key => (
                    <button
                        key={key}
                        onClick={() => updateFilters({ key: currentKey === key ? null : key })}
                        className={`py-3 text-[10px] font-bold border transition-all ${
                            currentKey === key 
                            ? 'bg-studio-neon text-black border-studio-neon shadow-[0_0_10px_rgba(166,226,46,0.2)]' 
                            : 'bg-black/40 text-white/40 border-white/5 hover:border-white/20'
                        }`}
                    >
                        {key}
                    </button>
                ))}
            </div>
        </div>
    )

    // 🎭 STYLE & GENRE MATRIX
    const GenreSelector = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-l-2 border-studio-neon pl-3">
                STUDIO STYLE
            </div>
            <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                    <button
                        key={genre}
                        onClick={() => updateFilters({ genre: currentGenre === genre ? null : genre })}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                            currentGenre === genre 
                            ? 'bg-white text-black border-white' 
                            : 'bg-black/60 text-white/30 border-white/5 hover:border-white/20'
                        }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>
    )

    // 🏎️ BPM RANGE INPUTS
    const BPMControls = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-l-2 border-studio-neon pl-3">
                BPM THRESHOLD
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="MIN" 
                    value={bpmMin}
                    onChange={(e) => setBpmMin(e.target.value)}
                    className="w-full bg-black/80 border border-white/5 p-3 text-[10px] font-black focus:border-studio-neon outline-none"
                />
                <div className="w-4 h-[2px] bg-white/10" />
                <input 
                    type="number" 
                    placeholder="MAX" 
                    value={bpmMax}
                    onChange={(e) => setBpmMax(e.target.value)}
                    className="w-full bg-black/80 border border-white/5 p-3 text-[10px] font-black focus:border-studio-neon outline-none"
                />
                <button 
                   onClick={() => updateFilters({ bpm_min: bpmMin, bpm_max: bpmMax })}
                   className="bg-studio-neon text-black p-3"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
    const FilterSections = () => (
        <div className="space-y-12 pb-24 md:pb-0">
            {/* KEY SIGNATURE */}
            <KeySelector />

            {/* GENRE */}
            <GenreSelector />

            {/* BPM */}
            <BPMControls />
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Sparkles size={14} className="text-studio-neon" /> GENRE
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {genres.map((genre) => {
                        const genreVal = genre.toLowerCase();
                        const isActive = currentGenre === genreVal;
                        return (
                            <Link 
                                key={genre}
                                href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), genre: genreVal }).toString()}`}
                                onClick={() => setIsMobileOpen(false)}
                                className={`px-3 py-2.5 text-[9px] uppercase font-black tracking-widest transition-all border text-center ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                {genre}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* TAGS */}
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
                                onClick={() => setIsMobileOpen(false)}
                                className={`px-3 py-1.5 text-[9px] uppercase font-black tracking-widest border transition-all ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                #{tag}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* INSTRUMENT */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Layers size={14} className="text-studio-neon" /> INSTRUMENT
                </div>
                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                    <Link 
                        href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: '' }).toString()}`} 
                        onClick={() => setIsMobileOpen(false)}
                        className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest transition-all ${!currentCategory ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5 border border-white/10'}`}
                    >
                        ALL INSTRUMENTS
                    </Link>
                    {categories?.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat.id }).toString()}`}
                            onClick={() => setIsMobileOpen(false)}
                            className={`px-4 py-2.5 text-[10px] uppercase font-black tracking-widest transition-all border border-transparent ${currentCategory === cat.id ? 'bg-studio-neon text-black' : 'text-white/40 hover:bg-white/5 border-white/10'}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* KEY */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Keyboard size={14} className="text-studio-neon" /> MUSICAL KEY
                </div>
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {musicalKeys.map((k) => (
                        <Link 
                            key={k}
                            href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), key: k }).toString()}`}
                            onClick={() => setIsMobileOpen(false)}
                            className={`h-9 flex items-center justify-center text-[9px] border font-black transition-all ${currentKey === k ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/30 border-white/10 hover:bg-white/5'}`}
                        >
                            {k}
                        </Link>
                    ))}
                </div>
            </div>

            {/* FORMAT */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Activity size={14} className="text-studio-neon" /> FORMAT
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {['Loops', 'Oneshots', 'Presets'].map((type) => {
                        const typeVal = type.toLowerCase();
                        const isActive = currentType === typeVal;
                        return (
                            <Link 
                                key={type}
                                href={`/browse?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), type: typeVal }).toString()}`}
                                onClick={() => setIsMobileOpen(false)}
                                className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest text-center transition-all border ${isActive ? 'bg-studio-neon text-black border-studio-neon' : 'text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                {type}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* BPM */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                    <Timer size={14} className="text-studio-neon" /> BPM RANGE
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

            {/* SORT & LIMIT */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* RESET */}
            <div className="pt-8 border-t border-white/5">
                 <button 
                  onClick={clearFilters}
                  className="w-full py-4 bg-red-950/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-red-500 hover:text-white transition-all italic flex items-center justify-center gap-4"
                >
                    <X size={16} /> Reset Filters
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* 🛠️ MOBILE_FILTER_TOGGLE (Now Inline, not fixed) */}
            <div className="md:hidden px-8 py-6 bg-[#080808] border-b border-white/5">
                <button 
                    onClick={() => setIsMobileOpen(true)}
                    className="w-full h-14 bg-black border-2 border-white/10 text-white flex items-center justify-between px-6 font-black uppercase text-[10px] tracking-widest hover:border-studio-neon group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <SlidersHorizontal size={14} className="text-studio-neon group-hover:scale-110 transition-transform" />
                        <span>Filter Sounds</span>
                    </div>
                    {(currentCategory || currentType || currentKey || currentGenre) && (
                        <div className="h-2 w-2 bg-studio-neon rounded-full animate-pulse" />
                    )}
                </button>
            </div>

            {/* 📱 MOBILE_DRAWER_OVERLAY */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-[200] lg:hidden">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                        />
                        
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="absolute bottom-0 left-0 right-0 h-[90vh] bg-studio-grey border-t-2 border-studio-neon p-8 overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-10 sticky top-0 bg-studio-grey z-10 pb-4 border-b border-white/5">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">FILTERS</h3>
                                <button onClick={() => setIsMobileOpen(false)} className="h-10 w-10 border border-white/10 flex items-center justify-center hover:bg-studio-neon hover:text-black transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <FilterSections />
                            
                            <div className="fixed bottom-0 left-0 right-0 py-6 px-8 bg-studio-grey border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] z-20">
                                <button 
                                    onClick={() => setIsMobileOpen(false)}
                                    className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-studio-neon transition-all"
                                >
                                    APPLY FILTERS
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🖥️ DESKTOP_SIDEBAR */}
            <aside className="hidden md:block w-80 border-r-2 border-black bg-[#0d0d0d] shrink-0 h-full relative">
                <div className="sticky top-[160px] p-8 z-30">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic text-simple">FILTERS</span>
                        {(currentCategory || currentType || currentKey || currentGenre) && (
                            <button onClick={clearFilters} className="text-studio-neon hover:text-white transition-colors text-[10px] font-bold">
                                CLEAR
                            </button>
                        )}
                    </div>
                    <FilterSections />
                </div>
            </aside>
        </>
    )
}
