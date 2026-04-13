'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Layers, Play, Pause, Music, Zap, Download } from 'lucide-react'
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
}

type SampleListProps = {
    samples: Sample[]
    packName: string
    coverUrl?: string | null
    packId?: string
    totalCount?: number
    loopsCount?: number
    oneShotsCount?: number
}

export function SampleList({ samples, packName, coverUrl, packId, totalCount, loopsCount, oneShotsCount }: SampleListProps) {
    const { unlockedIds, isLoading } = useVault()
    const [filter, setFilter] = useState<'all' | 'loops' | 'oneshots'>('all')
    const { setPlaylist, activeId } = useAudio()

    // 🧬 SPLICE-STYLE CATEGORIZATION
    const filteredSamples = useMemo(() => {
        if (filter === 'all') return samples
        if (filter === 'loops') return samples.filter(s => s.bpm)
        if (filter === 'oneshots') return samples.filter(s => !s.bpm)
        return samples
    }, [samples, filter])

    // 🧬 MEMOIZED_PLAYLIST_GENERATOR
    const playlistData = useMemo(() => {
        return filteredSamples.map(s => {
            const isUnlocked = unlockedIds.has(s.id) || (packId ? unlockedIds.has(packId) : false)
            return {
                id: s.id,
                url: s.audio_url,
                name: s.name,
                packName: packName,
                coverUrl: coverUrl,
                bpm: s.bpm,
                audioKey: s.key,
                isUnlocked: isUnlocked
            }
        })
    }, [filteredSamples, packName, coverUrl, unlockedIds, packId])

    useEffect(() => {
        setPlaylist(playlistData)
    }, [playlistData, setPlaylist])

    return (
        <div className="space-y-6 md:space-y-8 w-full">
            {/* 🎛️ SIGNAL_FILTER_BAR (Full-Width Balance) */}
            <div className="w-full flex items-center p-1 bg-black/40 border border-white/5 rounded-sm">
                {[
                    { id: 'all', label: 'All', count: typeof totalCount !== 'undefined' ? totalCount : samples.length },
                    { id: 'loops', label: 'Loops', count: typeof loopsCount !== 'undefined' ? loopsCount : samples.filter(s => s.bpm).length },
                    { id: 'oneshots', label: '1-shots', count: typeof oneShotsCount !== 'undefined' ? oneShotsCount : samples.filter(s => !s.bpm).length }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setFilter(t.id as any)}
                        className={`flex-1 min-w-0 py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 md:gap-3 whitespace-nowrap ${filter === t.id ? 'bg-white text-black' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <span className="truncate">{t.label}</span>
                        <span className={`text-[8px] opacity-40 ${filter === t.id ? 'text-black/60' : ''}`}>({t.count})</span>
                    </button>
                ))}
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

                <div className="divide-y divide-black">
                    {filteredSamples.map((sample, idx) => {
                        const isUnlocked = unlockedIds.has(sample.id) || (packId ? unlockedIds.has(packId) : false)
                        const isActive = activeId === sample.id
                        
                        return (
                            <div 
                                key={sample.id} 
                                className={`group flex items-center justify-between gap-3 px-4 md:px-10 py-4 transition-all border-b border-white/5 md:border-none ${isActive ? 'bg-studio-neon/5' : 'hover:bg-white/[0.03]'}`}
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
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col min-w-0">
                                        <Link href={`/samples/${sample.id}`}>
                                            <span className={`text-[13px] md:text-[15px] font-black uppercase transition-colors truncate ${isActive ? 'text-studio-neon' : 'text-white/80 group-hover:text-studio-neon'}`}>
                                                {sample.name}
                                            </span>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-0.5">
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

                                            <span className="hidden md:inline-block text-[8px] font-bold uppercase text-white/10 tracking-[0.2em] italic">
                                                ID: {sample.id.slice(0, 4)}
                                            </span>
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

                {filteredSamples.length === 0 && (
                    <div className="p-32 text-center text-[11px] font-black uppercase tracking-[0.5em] text-white/10 italic">
                        No sounds found.
                    </div>
                )}
            </div>
        </div>
    )
}
