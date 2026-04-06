'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Layers, Play, Pause, Music, Zap, Download } from 'lucide-react'
import { PlayButton } from './PlayButton'
import { DownloadButton } from './DownloadButton'
import { Waveform } from './Waveform'
import { useAudio } from './AudioProvider'

type Sample = {
    id: string
    name: string
    audio_url: string
    bpm?: number | null
    key?: string | null
    credit_cost?: number
}

type SampleListProps = {
    samples: Sample[]
    packName: string
    coverUrl?: string | null
    unlockedSampleIds: Set<string>
    isFullPackUnlocked: boolean
}

export function SampleList({ samples, packName, coverUrl, unlockedSampleIds, isFullPackUnlocked }: SampleListProps) {
    const [filter, setFilter] = useState<'all' | 'loops' | 'oneshots'>('all')
    const { setPlaylist, activeId } = useAudio()

    // 🧬 SPLICE-STYLE CATEGORIZATION
    const filteredSamples = useMemo(() => {
        if (filter === 'all') return samples
        if (filter === 'loops') return samples.filter(s => s.bpm)
        if (filter === 'oneshots') return samples.filter(s => !s.bpm)
        return samples
    }, [samples, filter])

    // 📡 SIGNAL_SYNC (Keep playlist updated for Next/Prev)
    useEffect(() => {
        const playlistData = filteredSamples.map(s => ({
            id: s.id,
            url: s.audio_url,
            name: s.name,
            packName: packName,
            coverUrl: coverUrl,
            bpm: s.bpm,
            audioKey: s.key,
            isUnlocked: unlockedSampleIds.has(s.id) || isFullPackUnlocked
        }))
        setPlaylist(playlistData)
    }, [filteredSamples, packName, coverUrl, unlockedSampleIds, isFullPackUnlocked, setPlaylist])

    return (
        <div className="space-y-8">
            {/* 🎛️ SIGNAL_FILTER_BAR */}
            <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/5 self-start rounded-sm">
                {[
                    { id: 'all', label: 'All Artifacts', count: samples.length },
                    { id: 'loops', label: 'Loops', count: samples.filter(s => s.bpm).length },
                    { id: 'oneshots', label: 'One-shots', count: samples.filter(s => !s.bpm).length }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setFilter(t.id as any)}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${filter === t.id ? 'bg-white text-black' : 'text-white/20 hover:text-white/40'}`}
                    >
                        {t.label}
                        <span className={`text-[8px] opacity-40 ${filter === t.id ? 'text-black/60' : ''}`}>({t.count})</span>
                    </button>
                ))}
            </div>

            <div className="bg-black/60 studio-panel border-2 border-white/5 overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-10 py-5 border-b-2 border-black text-[9px] uppercase font-black tracking-widest text-white/20 bg-studio-grey/40">
                    <div className="col-span-1 text-center">STS</div>
                    <div className="col-span-4 text-white/40 italic">Signature Artifact</div>
                    <div className="col-span-1 text-center">BPM</div>
                    <div className="col-span-1 text-center">Key</div>
                    <div className="col-span-4 text-center">Spectral Data</div>
                    <div className="col-span-1 text-right">Access</div>
                </div>

                <div className="divide-y divide-black">
                    {filteredSamples.map((sample, idx) => {
                        const isUnlocked = unlockedSampleIds.has(sample.id) || isFullPackUnlocked
                        const isActive = activeId === sample.id
                        
                        return (
                            <div 
                                key={sample.id} 
                                className={`group flex flex-col md:grid md:grid-cols-12 gap-4 px-10 py-4 items-center transition-all border-b border-white/5 md:border-none ${isActive ? 'bg-studio-neon/5' : 'hover:bg-white/[0.03]'}`}
                            >
                                <div className="w-full md:col-span-1 flex items-center justify-between md:justify-center">
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
                                
                                <div className="w-full md:col-span-4 flex flex-col">
                                    <span className={`text-[15px] font-black uppercase transition-colors truncate ${isActive ? 'text-studio-neon' : 'text-white/80 group-hover:text-studio-neon'}`}>
                                        {sample.name}
                                    </span>
                                    <span className="text-[8px] font-bold uppercase text-white/10 tracking-[0.3em] mt-1 italic">
                                        TRACK_00{idx+1} // {sample.bpm ? 'LOOP' : 'FX'}
                                    </span>
                                </div>
                                
                                <div className="hidden md:block col-span-1 text-center font-black text-[12px] text-white/30 italic">
                                    {sample.bpm || <span className="opacity-10">-</span>}
                                </div>
                                <div className="hidden md:block col-span-1 text-center font-black text-[12px] text-studio-neon tracking-tighter italic">
                                    {sample.key || <span className="opacity-10 opacity-10 text-white/30">-</span>}
                                </div>
                                
                                <div className="w-full md:col-span-4">
                                    <Waveform id={sample.id} active={true} />
                                </div>
                                
                                <div className="w-full md:col-span-1 flex justify-end">
                                    <DownloadButton 
                                        sampleId={sample.id} 
                                        isUnlockedInitial={isUnlocked} 
                                        creditCost={sample.credit_cost}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredSamples.length === 0 && (
                    <div className="p-32 text-center text-[11px] font-black uppercase tracking-[0.5em] text-white/10 italic">
                        NO_ARTIFACTS_FOUND_IN_SELECTED_CHANNEL.
                    </div>
                )}
            </div>
        </div>
    )
}
