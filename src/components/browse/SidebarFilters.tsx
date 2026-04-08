'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
    Filter, SlidersHorizontal, Music2, Timer, Key, 
    X, ChevronRight, Zap, Radio, Boxes, Layers, 
    Search, Mic2, Activity, Terminal
} from 'lucide-react'

interface SidebarFiltersProps {
    categories: any[]
}

export function SidebarFilters({ categories }: SidebarFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    
    const [q, setQ] = useState(searchParams.get('q') || '')
    const [category, setCategory] = useState(searchParams.get('category') || 'all')
    const [type, setType] = useState(searchParams.get('type') || 'all')
    const [bpmRange, setBpmRange] = useState({ 
        min: searchParams.get('bpm_min') || '', 
        max: searchParams.get('bpm_max') || '' 
    })
    const [key, setKey] = useState(searchParams.get('key') || 'all')

    const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    const applyFilters = () => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (category !== 'all') params.set('category', category)
        if (type !== 'all') params.set('type', type)
        if (bpmRange.min) params.set('bpm_min', bpmRange.min)
        if (bpmRange.max) params.set('bpm_max', bpmRange.max)
        if (key !== 'all') params.set('key', key)
        
        router.push(`/browse?${params.toString()}`)
        setIsMobileOpen(false)
    }

    const clearFilters = () => {
        setQ('')
        setCategory('all')
        setType('all')
        setBpmRange({ min: '', max: '' })
        setKey('all')
        router.push('/browse')
        setIsMobileOpen(false)
    }

    return (
        <>
            {/* 🛠️ MOBILE_FILTER_TRIGGER (Always available in content flow) */}
            <div className="lg:hidden mb-10 sticky top-28 z-[100] px-4">
                <button 
                    onClick={() => setIsMobileOpen(true)}
                    className="w-full h-14 bg-black border-2 border-studio-neon/30 text-white flex items-center justify-between px-6 font-black uppercase text-[10px] tracking-[0.3em] hover:border-studio-neon transition-all shadow-[0_15px_40px_rgba(0,0,0,0.5)] active:scale-95"
                >
                    <div className="flex items-center gap-4">
                        <SlidersHorizontal size={16} className="text-studio-neon" />
                        <span>Filter_Signals</span>
                    </div>
                    <ChevronRight size={16} className="text-white/20" />
                </button>
            </div>

            {/* 🧬 MOBILE_FILTER_MODAL */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[600] flex flex-col bg-studio-charcoal">
                    <div className="flex items-center justify-between p-6 border-b-4 border-black bg-studio-grey">
                        <div className="flex items-center gap-4">
                            <Terminal className="text-studio-neon h-5 w-5" />
                            <h2 className="text-xl font-black uppercase tracking-widest italic">Signal_Matrix</h2>
                        </div>
                        <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-black border border-white/10 text-white/40">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-12 bg-studio-charcoal step-grid">
                        <FilterContent 
                            categories={categories}
                            category={category} setCategory={setCategory}
                            type={type} setType={setType}
                            bpmRange={bpmRange} setBpmRange={setBpmRange}
                            keyParam={key} setKey={setKey}
                            musicalKeys={musicalKeys}
                        />
                    </div>

                    <div className="p-6 bg-studio-grey border-t-8 border-black grid grid-cols-2 gap-4">
                        <button onClick={clearFilters} className="h-14 bg-black border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">RESET</button>
                        <button onClick={applyFilters} className="h-14 bg-studio-neon text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(166,226,46,0.3)]">ENGAGE_FILTER</button>
                    </div>
                </div>
            )}

            {/* 🖥️ DESKTOP_SIDEBAR (Col 1-3) */}
            <aside className="hidden lg:block space-y-12 pr-6">
                <div className="bg-[#111] border-2 border-white/5 p-8 rounded-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Activity size={80} />
                    </div>
                    <FilterContent 
                        categories={categories}
                        category={category} setCategory={setCategory}
                        type={type} setType={setType}
                        bpmRange={bpmRange} setBpmRange={setBpmRange}
                        keyParam={key} setKey={setKey}
                        musicalKeys={musicalKeys}
                    />
                    <div className="grid grid-cols-1 gap-4 mt-12">
                         <button onClick={applyFilters} className="h-14 bg-studio-neon text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(166,226,46,0.2)] hover:scale-105 transition-all">ENGAGE_SEARCH</button>
                         <button onClick={clearFilters} className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Clear_Archive_Mask</button>
                    </div>
                </div>
            </aside>
        </>
    )
}

function FilterContent({ 
    categories, category, setCategory, type, setType, bpmRange, setBpmRange, keyParam, setKey, musicalKeys 
}: any) {
    return (
        <div className="space-y-12">
            {/* Logic Type */}
            <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon flex items-center gap-3">
                    <Music2 size={12} /> Signal_Origin
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {['all', 'loop', 'one-shot'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setType(t)}
                            className={`h-11 border transition-all text-[9px] font-black uppercase tracking-widest ${type === t ? 'bg-studio-neon text-black border-studio-neon' : 'bg-black border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Signal Category */}
            <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon flex items-center gap-3">
                    <Boxes size={12} /> Logic_Category
                </label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 bg-black border-2 border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest px-4 focus:border-studio-neon focus:ring-0 outline-none"
                >
                    <option value="all">ALL_CATEGORIES</option>
                    {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Harmonic Key */}
            <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon flex items-center gap-3">
                    <Key size={12} /> Frequency_Root
                </label>
                <div className="grid grid-cols-4 gap-2">
                    <button 
                        onClick={() => setKey('all')}
                        className={`col-span-4 h-11 border transition-all text-[9px] font-black uppercase tracking-widest ${keyParam === 'all' ? 'bg-studio-neon text-black border-studio-neon' : 'bg-black border-white/5 text-white/40'}`}
                    >
                        ALL_FREQUENCIES
                    </button>
                    {musicalKeys.map((k: string) => (
                        <button 
                            key={k}
                            onClick={() => setKey(k)}
                            className={`h-10 border transition-all text-[9px] font-black uppercase tracking-widest ${keyParam === k ? 'bg-studio-neon text-black border-studio-neon' : 'bg-black border-white/5 text-white/40 hover:border-white/20'}`}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tempo Specs */}
            <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon flex items-center gap-3">
                    <Timer size={12} /> Tempo_Clock
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">MIN_BPM</span>
                        <input 
                            type="number"
                            value={bpmRange.min}
                            onChange={(e) => setBpmRange({...bpmRange, min: e.target.value})}
                            placeholder="0"
                            className="w-full h-11 bg-black border border-white/10 text-white px-4 text-[11px] font-black outline-none focus:border-studio-neon"
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="text-[6px] font-black text-white/20 uppercase tracking-widest">MAX_BPM</span>
                        <input 
                            type="number"
                            value={bpmRange.max}
                            onChange={(e) => setBpmRange({...bpmRange, max: e.target.value})}
                            placeholder="999"
                            className="w-full h-11 bg-black border border-white/10 text-white px-4 text-[11px] font-black outline-none focus:border-studio-neon"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
