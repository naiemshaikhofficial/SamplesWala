'use client'

import { Play, Pause, Waves, Zap, Box, Lock, Music2, Timer, Layers, Download, CreditCard } from 'lucide-react'
import { useAudio } from './AudioProvider'
import { PlayButton } from './PlayButton'
import { Waveform } from './Waveform'
import { DownloadButton } from './DownloadButton'
import Link from 'next/link'

interface SampleListProps {
    samples: any[]
    packName: string
    coverUrl: string | null
    unlockedSampleIds?: Set<string>
    isFullPackUnlocked?: boolean
}

export function SampleList({ samples, packName, coverUrl, unlockedSampleIds = new Set(), isFullPackUnlocked = false }: SampleListProps) {
    const { activeId, isPlaying, pause } = useAudio()

    return (
        <div className="w-full space-y-2">
            {/* 🛰️ HEADER_RACK (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 items-center gap-4 px-10 py-4 border-b-2 border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Signal_Name / Metadata</div>
                <div className="col-span-1 text-center">BPM</div>
                <div className="col-span-1 text-center">Key</div>
                <div className="col-span-4 text-center">Visualizer</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* 🧬 SIGNAL_MATRIX_ROWS */}
            <div className="space-y-[1px] bg-white/5 border border-white/5 rounded-sm overflow-hidden">
                {samples.map((sample, index) => {
                    const isActive = activeId === sample.id;
                    const isUnlocked = isFullPackUnlocked || unlockedSampleIds.has(sample.id);

                    return (
                        <div 
                            key={sample.id} 
                            className={`group grid grid-cols-12 items-center gap-2 md:gap-4 px-3 md:px-10 py-3.5 md:py-5 transition-all relative overflow-hidden ${isActive ? 'bg-studio-neon/10' : 'bg-black hover:bg-white/[0.03]'}`}
                        >
                            {/* Visual Glow for Active Track */}
                            {isActive && (
                                <div className="absolute inset-y-0 left-0 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                            )}

                            {/* 🎹 PLAY_NODE (Col 2 Mobile, 1 Desktop) */}
                            <div className="col-span-2 md:col-span-1 flex items-center justify-start">
                                <PlayButton 
                                    id={sample.id} 
                                    name={sample.name} 
                                    packName={packName}
                                    coverUrl={coverUrl}
                                    bpm={sample.metadata?.bpm}
                                    audioKey={sample.metadata?.key}
                                    isUnlocked={isUnlocked}
                                />
                            </div>

                            {/* 🧬 METADATA_CLUSTER (Col 7 Mobile, 4 Desktop) */}
                            <div className="col-span-7 md:col-span-4 flex flex-col gap-1 overflow-hidden">
                                <span className={`text-[11px] md:text-sm font-bold uppercase tracking-tight truncate ${isActive ? 'text-studio-neon' : 'text-white'}`}>
                                    {sample.name}
                                </span>
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30 italic">
                                    <span className="truncate">{sample.metadata?.type || 'Loop'}</span>
                                    <span className="text-white/10 hidden sm:inline">|</span>
                                    <span className="hidden sm:inline opacity-60">ID:{sample.id.split('-')[0]}</span>
                                </div>
                            </div>

                            {/* ⏱️ SPECS (Hidden on small, md only) */}
                            <div className="hidden md:flex col-span-1 items-center justify-center">
                                <span className="text-[11px] font-black text-white/60 tabular-nums">
                                    {sample.metadata?.bpm || '--'}
                                </span>
                            </div>
                            <div className="hidden md:flex col-span-1 items-center justify-center">
                                <span className="text-[11px] font-black text-studio-yellow">
                                    {sample.metadata?.key || '--'}
                                </span>
                            </div>

                            {/* 📈 WAVEFORM (Desktop/Wide Tablet) */}
                            <div className="hidden lg:block col-span-4 px-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                <Waveform id={sample.id} active={isActive} />
                            </div>

                            {/* 💎 ACQUISITION_NODE (Col 3 Mobile, 1 Desktop) */}
                            <div className="col-span-3 lg:col-span-1 flex items-center justify-end">
                                <DownloadButton 
                                    sampleId={sample.id}
                                    isUnlockedInitial={isUnlocked}
                                    creditCost={1}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
