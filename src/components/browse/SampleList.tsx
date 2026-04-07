
'use client'

import React, { useState, useEffect } from 'react'
import { CheckSquare, Square, Play, Download, Zap, Database, Activity, Sparkles, Folder, Music } from 'lucide-react'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { BatchActions } from './BatchActions'
import { useNotify } from '@/components/ui/NotificationProvider'
import { unlockSampleBatch } from '@/app/browse/actions'

interface SampleListProps {
  samples: any[]
  unlockedSampleIds: Set<string>
}

export function SampleList({ samples, unlockedSampleIds }: SampleListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast, showConfirm } = useNotify()

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const handleBulkAction = async (action: 'unlock' | 'download') => {
    if (action === 'unlock') {
       const confirm = await showConfirm(`Are you sure you want to unlock ${selectedIds.length} samples?`)
       if (!confirm) return

       setIsProcessing(true)
       try {
           const result = await unlockSampleBatch(selectedIds)
           if (result.success) {
               showToast(`Successfully unlocked ${result.count} artifacts.`, 'success')
               clearSelection()
               window.location.reload() // Re-fetch all data to update UI
           } else {
               showToast(result.error || 'Acquisition terminal error.', 'error')
           }
       } catch (err) {
           showToast('Signal interruption.', 'error')
       } finally {
           setIsProcessing(false)
       }
    }
  }

  return (
    <>
      <div className="space-y-12">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/10">
                <Music size={12} className="text-studio-neon" /> Individual Sounds
            </div>
            {samples.length > 0 && (
                <button 
                  onClick={() => selectedIds.length === samples.length ? clearSelection() : setSelectedIds(samples.map(s => s.id))}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all underline underline-offset-8"
                >
                    {selectedIds.length === samples.length ? 'DESELECT_ALL' : 'SELECT_ALL_SOUNDS'}
                </button>
            )}
        </div>

        <div className="divide-y-2 divide-black border-2 border-black bg-[#111]">
            {samples.map((sample) => {
                const isSelected = selectedIds.includes(sample.id)
                const isUnlocked = unlockedSampleIds.has(sample.id)
                
                return (
                    <div 
                        key={sample.id} 
                        className={`group flex items-center gap-8 px-8 py-6 hover:bg-white/[0.02] transition-all ${isSelected ? 'bg-studio-neon/[0.03] border-l-4 border-studio-neon' : 'border-l-4 border-transparent'}`}
                    >
                        {/* 🕹️ Selection Signal */}
                        <button 
                            onClick={() => toggleSelect(sample.id)}
                            className={`shrink-0 h-4 w-4 border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-studio-neon border-studio-neon text-black' : 'border-white/10 hover:border-white/30 text-transparent'}`}
                        >
                            <Zap size={10} fill="currentColor" />
                        </button>

                        <div className="flex items-center gap-8 w-full">
                            <div className="flex items-center gap-8 w-1/3">
                                <PlayButton 
                                    id={sample.id} 
                                    name={sample.name} 
                                    packName={sample.sample_packs?.name} 
                                    coverUrl={sample.sample_packs?.cover_url}
                                    bpm={sample.bpm}
                                    audioKey={sample.key}
                                    isUnlocked={isUnlocked}
                                    creditCost={sample.credit_cost}
                                />
                                <div className="min-w-0">
                                    <h3 className="text-xs font-black uppercase tracking-widest truncate group-hover:text-studio-neon transition-colors cursor-pointer">
                                        {sample.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/20 tracking-widest italic mt-2">
                                        <span className="text-studio-neon">{sample.bpm || 'VAR'} BPM</span>
                                        <div className="w-1 h-1 rounded-full bg-white/20" />
                                        <span>{sample.key || 'C MIN'}</span>
                                        <div className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="truncate max-w-[120px]">{sample.sample_packs?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:flex items-center gap-8 flex-1 justify-center opacity-30">
                                 {/* Audio Visualizer Meta */}
                                <div className="flex gap-1">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="w-2 h-4 bg-white/5 group-hover:bg-studio-neon/20 transition-all" style={{ height: `${Math.random() * 20 + 2}px` }} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-12 justify-end w-1/4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-studio-neon">{sample.credit_cost || 1} CREDITS</span>
                                    {isUnlocked && <span className="text-[7px] font-black text-white/30 uppercase mt-1 italic tracking-widest">OWNED_ARTIFACT</span>}
                                </div>
                                <DownloadButton 
                                    sampleId={sample.id} 
                                    isUnlockedInitial={isUnlocked} 
                                    creditCost={sample.credit_cost} 
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      <BatchActions 
        selectedIds={selectedIds} 
        onClear={clearSelection} 
        onBulkAction={handleBulkAction}
        isProcessing={isProcessing}
      />
    </>
  )
}
