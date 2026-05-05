'use client'
import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ListFilter, X, Loader2, Lock, Sparkles } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { PlayButton } from './PlayButton'
import { DownloadButton } from './DownloadButton'
import { Waveform } from './Waveform'
import { useAudio } from './AudioProvider'
import { useVault } from '@/components/VaultProvider'

type Sample = {
    id: string
    name: string
    audio_url?: string
    bpm?: number | null
    key?: string | null
    credit_cost?: number
    signal?: string | null
    type?: string
}

type SampleListProps = {
    samples: Sample[]
    packName: string
    coverUrl?: string | null
    packId?: string
    totalCount?: number
    loopsCount?: number
    melodiesCount?: number
    oneShotsCount?: number
    presetsCount?: number
    isSubscribed?: boolean
}

export function SampleList({ 
    samples, 
    packName, 
    coverUrl, 
    packId, 
    totalCount, 
    loopsCount, 
    melodiesCount,
    oneShotsCount, 
    presetsCount, 
    isSubscribed = false 
}: SampleListProps) {
    const { unlockedIds } = useVault()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    
    const initialType = (searchParams.get('type') as any) || 'all'
    const [filter, setFilter] = useState<'all' | 'melodies' | 'loops' | 'oneshots' | 'presets'>(initialType)
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [sortBy, setSortBy] = useState<any>(searchParams.get('sort') || 'newest')
    const { setPlaylist, activeId } = useAudio()

    // 🧬 GLOBAL_URL_SYNC_BRIDGE: Handle Search & Sort Globally (Optimized)
    useEffect(() => {
        const currentSearch = searchParams.get('search') || ''
        const currentSort = searchParams.get('sort') || 'newest'
        const currentType = searchParams.get('type') || 'all'

        // 🛑 GUARD: Only sync if state actually differs from URL
        if (searchQuery === currentSearch && sortBy === currentSort && filter === currentType) return

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            
            if (searchQuery) {
                params.set('search', searchQuery)
                params.set('page', '1') 
            } else params.delete('search')

            if (sortBy && sortBy !== 'newest') params.set('sort', sortBy)
            else params.delete('sort')

            if (filter && filter !== 'all') {
                params.set('type', filter)
                params.set('page', '1')
            } else params.delete('type')

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false })
            })
        }, searchQuery ? 500 : 0)

        return () => clearTimeout(timer)
    }, [searchQuery, sortBy, filter, pathname, router, searchParams])

    // 🧬 PROCESSED_SAMPLES: Now driven by server-side fetch for accuracy
    const processedSamples = samples;

    // 🧬 PLAYLIST_SYNC
    const playlistData = useMemo(() => {
        return processedSamples.map(s => ({
            id: s.id,
            url: s.audio_url,
            name: s.name,
            packName,
            coverUrl,
            bpm: s.bpm,
            audioKey: s.key,
            isUnlocked: unlockedIds.has(s.id) || (packId ? unlockedIds.has(packId) : false),
            signal: s.signal // 🛰️ PASS_SIGNAL_TO_PLAYLIST
        }))
    }, [processedSamples, packName, coverUrl, unlockedIds, packId])

    useEffect(() => {
        setPlaylist(playlistData)
    }, [playlistData, setPlaylist])

    return (
        <div className="space-y-6 md:space-y-8 w-full">
            {/* 🎛️ STUDIO CONTROL RACK */}
            <div className="flex flex-col xl:flex-row gap-4 w-full">
                {/* 🔎 SEARCH BAR */}
                <div className="flex-1 relative group">
                    {!isSubscribed ? (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-between px-4 border border-white/5 rounded-sm cursor-not-allowed group">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded bg-studio-neon/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-studio-neon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-studio-neon/80">Search Locked</span>
                            </div>
                            <Link 
                                href="/subscription" 
                                className="text-[8px] font-black bg-studio-neon text-black px-2 py-1 rounded-xs hover:bg-white transition-colors"
                            >
                                UPGRADE
                            </Link>
                        </div>
                    ) : null}
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-studio-neon transition-colors">
                        {isPending ? <Loader2 size={14} className="animate-spin text-studio-neon" /> : <Search size={14} />}
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isSubscribed ? "SEARCH SOUNDS..." : "SEARCH LOCKED (PRO ONLY)"}
                        disabled={!isSubscribed}
                        className="w-full h-12 bg-black/40 border border-white/5 focus:border-studio-neon/40 focus:bg-black/60 outline-none px-12 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/10 transition-all rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {searchQuery && isSubscribed && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    {/* 🧬 TYPE FILTERS */}
                    <div className="relative flex bg-black/40 border border-white/5 rounded-sm p-1 md:min-w-[550px] overflow-x-auto no-scrollbar">
                        {!isSubscribed ? (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center cursor-not-allowed">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-studio-neon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-studio-neon/80">LOCKED</span>
                                </div>
                            </div>
                        ) : null}
                        {[
                            { id: 'all', label: 'All', count: totalCount },
                            { id: 'melodies', label: 'Melodies', count: melodiesCount },
                            { id: 'loops', label: 'Loops', count: loopsCount },
                            { id: 'oneshots', label: 'One-shots', count: oneShotsCount },
                            { id: 'presets', label: 'Presets', count: presetsCount }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => isSubscribed && setFilter(t.id as any)}
                                disabled={!isSubscribed}
                                className={`flex-1 py-2 px-2 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === t.id ? 'bg-white text-black' : 'text-white/20 hover:text-white/40'} disabled:opacity-20`}
                            >
                                {t.label} <span className="text-[7px] opacity-40 ml-1">({t.count || 0})</span>
                            </button>
                        ))}
                    </div>

                    {/* 🎚️ SORT MODULE */}
                    <div className="relative group min-w-[180px]">
                        {!isSubscribed ? (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center border border-white/5 rounded-sm cursor-not-allowed">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-studio-neon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-studio-neon/80">LOCKED</span>
                                </div>
                            </div>
                        ) : null}
                        <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 group-hover:text-studio-neon pointer-events-none" />
                        <select 
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value)}
                            disabled={!isSubscribed}
                            className="w-full h-12 bg-black/40 border border-white/5 hover:border-white/10 focus:border-studio-neon/40 outline-none pl-11 pr-8 appearance-none text-[9px] font-black uppercase tracking-widest text-white/60 cursor-pointer rounded-sm disabled:opacity-20"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Latest First</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="bpm-high">BPM (150-70)</option>
                            <option value="bpm-low">BPM (70-150)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="bg-black/60 studio-panel border-2 border-white/5 overflow-hidden w-full">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-10 py-5 border-b-2 border-black text-[9px] uppercase font-black tracking-widest text-white/20 bg-studio-grey/40">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-4 text-white/40 italic">Sound Name</div>
                    <div className="col-span-1 text-center">BPM</div>
                    <div className="col-span-1 text-center">Key</div>
                    <div className="col-span-4 text-center">Waveform</div>
                    <div className="col-span-1 text-right">Download</div>
                </div>

                <div className="divide-y divide-white/5">
                    {processedSamples.map((sample, idx) => {
                        const isUnlocked = unlockedIds.has(sample.id) || (packId ? unlockedIds.has(packId) : false)
                        const isActive = activeId === sample.id
                        
                        return (
                            <div 
                                key={sample.id} 
                                className={`group flex items-center justify-between gap-3 px-4 md:px-10 py-4 transition-all border-b border-white/5 md:border-none ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                {/* LEFT: PLAY + INFO */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="shrink-0 scale-90 md:scale-100">
                                        <PlayButton 
                                            id={sample.id} 
                                            url={sample.audio_url} 
                                            name={sample.name}
                                            packName={packName}
                                            coverUrl={coverUrl}
                                            bpm={sample.bpm}
                                            audioKey={sample.key}
                                            isUnlocked={isUnlocked}
                                            creditCost={sample.credit_cost}
                                            signal={sample.signal}
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col min-w-0">
                                        <Link href={`/samples/${sample.id}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[13px] md:text-[15px] font-black uppercase transition-colors truncate ${isActive ? 'text-studio-neon' : 'text-white/80 group-hover:text-studio-neon'}`}>
                                                    {sample.name}
                                                </span>
                                                {!isSubscribed && sample.credit_cost && sample.credit_cost > 0 ? (
                                                    <div className="flex items-center gap-1 bg-studio-neon/10 px-1 rounded-xs border border-studio-neon/20">
                                                        <Lock size={8} className="text-studio-neon" />
                                                        <span className="text-[7px] font-black text-studio-neon">PRO</span>
                                                    </div>
                                                ) : !isSubscribed && (sample.credit_cost === 0) ? (
                                                    <div className="flex items-center gap-1 bg-white/10 px-1 rounded-xs border border-white/20">
                                                        <span className="text-[7px] font-black text-white/60">FREE</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {sample.type === 'preset' ? (
                                                <span className="text-[9px] font-black text-studio-yellow uppercase tracking-tighter italic">Preset artifact</span>
                                            ) : (
                                                <>
                                                    {sample.bpm && (
                                                        <Link 
                                                            href={`/browse?bpm_min=${sample.bpm}&bpm_max=${sample.bpm}`}
                                                            className="text-[9px] font-black text-studio-neon/50 uppercase tracking-tighter hover:text-studio-neon transition-colors"
                                                        >
                                                            {sample.bpm} BPM
                                                        </Link>
                                                    )}
                                                    {sample.key && (
                                                        <Link 
                                                            href={`/browse?key=${encodeURIComponent(sample.key)}`}
                                                            className="text-[9px] font-black text-studio-neon/50 uppercase tracking-tighter hover:text-studio-neon transition-colors"
                                                        >
                                                            {sample.bpm ? `// ${sample.key}` : sample.key}
                                                        </Link>
                                                    )}
                                                    {!sample.bpm && !sample.key && (
                                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter italic">One-Shot</span>
                                                    )}
                                                </>
                                            )}


                                        </div>
                                    </div>

                                    {/* 📝 AUDIO_OBJECT_SCHEMA (JSON-LD) for SEO */}
                                    <script
                                        type="application/ld+json"
                                        dangerouslySetInnerHTML={{
                                            __html: JSON.stringify({
                                                "@context": "https://schema.org/",
                                                "@type": "AudioObject",
                                                "name": `${sample.name} - ${sample.bpm ? sample.bpm + ' BPM' : ''} ${sample.key ? sample.key : ''}`,
                                                "contentUrl": sample.audio_url,
                                                "description": `Download ${sample.name} royalty-free sample from the ${packName} collection. Optimized for modern music production. High-quality 24-bit WAV.`,
                                                "encodingFormat": "audio/wav",
                                                "bitrate": "1411kbps",
                                                "isAccessibleForFree": "False",
                                                "genre": packName.split(' ')[0],
                                                "thumbnailUrl": coverUrl,
                                                "keywords": `${packName}, ${sample.bpm || ''} bpm, ${sample.key || ''}, royalty free samples, music loops`,
                                                "about": {
                                                    "@type": "Thing",
                                                    "name": packName
                                                }
                                            })
                                        }}
                                    />
                                </div>
                                
                                {/* CENTER: WAVEFORM (DESKTOP) */}
                                <div className="hidden md:block flex-1 max-w-md px-10">
                                    <Waveform id={sample.id} active={true} />
                                </div>
                                
                                {/* RIGHT: ACTIONS */}
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="hidden md:flex flex-col items-center gap-1 opacity-20">
                                        <Link href={`/browse?bpm_min=${sample.bpm}&bpm_max=${sample.bpm}`} className="hover:text-studio-neon transition-colors">
                                            <span className="text-[10px] font-black">{sample.bpm || '-'}</span>
                                        </Link>
                                        <span className="text-[6px] font-black tracking-widest">BPM</span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-center gap-1 text-studio-neon/40">
                                        <Link href={`/browse?key=${encodeURIComponent(sample.key || '')}`} className="hover:text-studio-neon transition-colors">
                                            <span className="text-[10px] font-black">{sample.key || '-'}</span>
                                        </Link>
                                        <span className="text-[6px] font-black tracking-widest uppercase">Key</span>
                                    </div>
                                    <div className="scale-90 md:scale-100 origin-right">
                                        <DownloadButton 
                                            sampleId={sample.id} 
                                            creditCost={sample.credit_cost}
                                            packId={packId}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {processedSamples.length === 0 && (
                    <div className="p-40 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center animate-pulse">
                            <Sparkles className="h-6 w-6 text-white/10" />
                        </div>
                        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 italic">
                            No sounds found in this category.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
