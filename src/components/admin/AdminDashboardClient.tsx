'use client'

import { useRouter } from 'next/navigation'
import { 
  createPackAction, editPackAction, deletePackAction,
  addSoundAction, editSoundAction, deleteSoundAction,
  updateCreditsAction, assignSubscriptionAction,
  getSamplesToProcessAction, processAiSignalAction, getPackSamplesAction,
  getAllUsersAction, getUserVaultAction, terminateSubscriptionAction, 
  toggleBanUserAction, deleteUserAction, getUserTransactionsAction
} from '@/app/admin/actions'
import Link from 'next/link'
import { 
  LayoutDashboard, Package, Music, Users, ArrowUpRight, TrendingUp, 
  PlusCircle, ShieldCheck, Zap, Activity, HardDrive, Cpu, 
  Terminal, Settings, Search, Disc, SlidersHorizontal, Lock, CheckCircle2, Loader2, Key,
  ChevronLeft, Volume1, Volume2, ShieldAlert, Trash2, Ban, Unlock, RefreshCw
} from 'lucide-react'
import { PlayButton } from '@/components/audio/PlayButton'
import { useState, useEffect } from 'react'

export default function AdminDashboardClient({ 
    packsCount, samplesCount, unprocessedAiCount, recentPurchases, 
    allPacks, allCustomers, aiLogs, userEmail, isAdminFromDb
}: { 
    packsCount: number, samplesCount: number, unprocessedAiCount: number, recentPurchases: any[], 
    allPacks: any[], allCustomers: any[], aiLogs: any[], userEmail: string, isAdminFromDb: boolean
}) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD')
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, status: 'IDLE' })
  const [users, setUsers] = useState<any[]>(allCustomers || [])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedUserVault, setSelectedUserVault] = useState<any[] | null>(null)
  const [selectedUserTransactions, setSelectedUserTransactions] = useState<any[] | null>(null)
  const [userModalTab, setUserModalTab] = useState<'VAULT' | 'FINANCE' | 'SUBSCRIPTION'>('VAULT')
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // 🧪 REALTIME_SIMULATOR: Just for visual flair
  const [cpuUsage, setCpuUsage] = useState(12)
  useEffect(() => {
    const interval = setInterval(() => {
        setCpuUsage(prev => Math.min(99, Math.max(5, prev + (Math.random() > 0.5 ? 5 : -5))))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleScanAi = async (isForce: boolean = false) => {
    const msg = isForce 
        ? 'PROTOCOL_INIT :: Force Re-scanning ALL sounds in database? This will overwrite existing metadata.'
        : 'PROTOCOL_INIT :: Confirm Autonomous AI Scan for all unprocessed sounds?'
    
    if (!confirm(msg)) return
    
    setIsScanning(true)
    const countToScan = isForce ? samplesCount : unprocessedAiCount
    setScanProgress({ current: 0, total: countToScan, status: 'INITIALIZING' })

    try {
        const samplesToProcess = await getSamplesToProcessAction(isForce)

        if (!samplesToProcess || samplesToProcess.length === 0) {
            setScanProgress({ current: 0, total: 0, status: 'COMPLETED' })
            setIsScanning(false)
            return
        }

        setScanProgress(prev => ({ ...prev, total: samplesToProcess.length, status: 'PROCESSING_SIGNAL' }))

        let completed = 0;
        for (const sample of samplesToProcess) {
            try {
                await processAiSignalAction(sample.id)
                completed++
                setScanProgress(prev => ({ ...prev, current: completed }))
            } catch (err) {
                console.error(`SCAN_ERROR at Sample ${sample.id} ::`, err)
            }
        }

        setScanProgress(prev => ({ ...prev, status: 'SYNC_COMPLETE' }))
        router.refresh()
        setTimeout(() => setIsScanning(false), 3000)

    } catch (e: any) {
        alert(`CRITICAL_FAILURE :: ${e.message}`)
        setIsScanning(false)
    }
  }

  const [selectedPack, setSelectedPack] = useState<any>(null)
  const [packSamples, setPackSamples] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [creditChange, setCreditChange] = useState(0)
  const [showNewPackModal, setShowNewPackModal] = useState(false)
  const [showNewSoundModal, setShowNewSoundModal] = useState(false)
  const [editingPack, setEditingPack] = useState<any>(null)
  const [editingSound, setEditingSound] = useState<any>(null)
  const [sampleSearchQuery, setSampleSearchQuery] = useState('')

  const [newPack, setNewPack] = useState({ name: '', description: '', price_inr: 0, price_usd: 0, cover_url: '', slug: '', specifications: '' })
  const [newSound, setNewSound] = useState({ 
    name: '', 
    audio_url: '', 
    download_url: '', 
    pack_id: '', 
    ai_genre: 'Indian Classical / Bollywood', 
    bpm: 120, 
    key: '', 
    key_type: 'None',
    credit_cost: 1,
    type: 'loop' 
  })

  // 📡 FETCH PACK SAMPLES
  useEffect(() => {
    if (selectedPack) {
        fetchPackSamples(selectedPack.id)
    }
  }, [selectedPack])

  const fetchPackSamples = async (packId: string) => {
    try {
        const data = await getPackSamplesAction(packId)
        setPackSamples(data || [])
    } catch (err: any) {
        console.error('FETCH_ERROR ::', err.message)
    }
  }

  const handleDeletePack = async (packId: string) => {
    if (!confirm('DELETE_CONFIRM :: Remove pack and ALL its sounds permanently?')) return
    setIsSubmitting(true)
    try {
        await deletePackAction(packId)
        router.refresh()
        alert('SUCCESS :: Pack removed from grid.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleDeleteSound = async (soundId: string) => {
    if (!confirm('DELETE_CONFIRM :: Erase sound artifact?')) return
    setIsSubmitting(true)
    try {
        await deleteSoundAction(soundId)
        if (selectedPack) fetchPackSamples(selectedPack.id)
        router.refresh()
        alert('SUCCESS :: Sound signal terminated.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleEditPack = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
        const { id, created_at, ...updateData } = editingPack // Sanitization
        
        // Convert comma string to array if it's a string
        if (typeof updateData.specifications === 'string') {
            updateData.specifications = updateData.specifications.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        }

        await editPackAction(id, updateData)
        setEditingPack(null)
        router.refresh()
        alert('SUCCESS :: Catalog metadata calibrated.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleEditSound = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
        const { id, created_at, key_type, ...updateData } = editingSound // Sanitization: Remove virtual fields
        await editSoundAction(id, updateData)
        setEditingSound(null)
        if (selectedPack) fetchPackSamples(selectedPack.id)
        router.refresh()
        alert('SUCCESS :: Sound artifact calibrated.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
        const payload = { ...newPack }
        if (payload.specifications) {
            (payload as any).specifications = payload.specifications.split(',').map(s => s.trim()).filter(s => s.length > 0)
        } else {
            (payload as any).specifications = []
        }
        await createPackAction(payload as any)
        setShowNewPackModal(false)
        router.refresh()
        alert('SUCCESS :: Pack registered in database.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleAddSound = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const keyBase = newSound.key.trim()
    const finalKey = keyBase 
        ? (newSound.key_type !== 'None' ? `${keyBase} ${newSound.key_type}` : keyBase) 
        : null

    try {
        const { key_type, ...cleanPayload } = newSound // Strip invalid columns
        const payload = { 
            ...cleanPayload, 
            key: finalKey, 
            pack_id: selectedPack?.id || newSound.pack_id 
        }
        await addSoundAction(payload)
        setShowNewSoundModal(false)
        if (selectedPack) fetchPackSamples(selectedPack.id)
        router.refresh()
        alert('SUCCESS :: Sound artifact synced to pack.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleRefreshUsers = async () => {
    setIsRefreshingUsers(true)
    try {
        const data = await getAllUsersAction()
        setUsers(data)
    } catch (err: any) {
        alert(`FETCH_ERROR :: ${err.message}`)
    } finally {
        setIsRefreshingUsers(false)
    }
  }

  const handleShowVault = async (user: any) => {
    try {
        const [vault, transactions] = await Promise.all([
            getUserVaultAction(user.id),
            getUserTransactionsAction(user.id)
        ])
        setSelectedUser(user)
        setSelectedUserVault(vault)
        setSelectedUserTransactions(transactions)
        setUserModalTab('VAULT')
    } catch (err: any) {
        alert(`FETCH_ERROR :: ${err.message}`)
    }
  }

  const handleTerminateSub = async (userId: string) => {
    if (!confirm('TERMINATION_CONFIRM :: End user subscription immediately?')) return
    try {
        await terminateSubscriptionAction(userId)
        handleRefreshUsers()
        alert('SUCCESS :: Frequency terminated.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    }
  }

  const handleToggleBan = async (userId: string, currentBanStatus: boolean) => {
    const msg = currentBanStatus ? 'RESTORE_NODE :: Unban user and restore access?' : 'TERMINAL_LOCKUP :: Ban user from platform?'
    if (!confirm(msg)) return
    try {
        await toggleBanUserAction(userId, !currentBanStatus)
        handleRefreshUsers()
        alert('SUCCESS :: Access matrix updated.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('☢️ NUCLEAR_DELETE :: Permanently wipe user from entire registry? This cannot be undone.')) return
    try {
        await deleteUserAction(userId)
        handleRefreshUsers()
        alert('SUCCESS :: User node erased.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    }
  }

  const handleUpdateCredits = async (userId: string) => {
    if (creditChange === 0) return
    setIsSubmitting(true)
    try {
        await updateCreditsAction(userId, creditChange)
        router.refresh()
        setEditingUser(null)
        setCreditChange(0)
        alert('SUCCESS :: User resonance calibrated.')
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleAssignSubscription = async (userId: string, planId: string) => {
    setIsSubmitting(true)
    try {
        await assignSubscriptionAction(userId, planId)
        router.refresh()
        setEditingUser(null)
        alert(`SUCCESS :: USER_NODE_ACTIVE :: [${planId}] calibrated.`)
    } catch (err: any) {
        alert(`NODE_ERROR :: ${err.message}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const isAuthorized = isAdminFromDb || userEmail?.includes('naiem') || userEmail?.includes('sampleswala') || userEmail?.includes('beatswala');

  if (!isAuthorized) {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center space-y-8 font-mono">
            <Lock className="w-20 h-20 text-spider-red animate-pulse" />
            <div className="text-center">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Access_Denied</h2>
                <p className="text-white/20 text-[10px] tracking-[0.5em] font-black italic">WALA_CORE :: UNAUTHORIZED_IDENTIFIED</p>
            </div>
            <Link href="/" className="px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:invert transition-all">
                Return to Surface
            </Link>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex selection:bg-studio-neon selection:text-black">
      
      {/* 📟 USER COMMAND CONSOLE (CREDIT/SUB) */}
      {editingUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-studio-grey w-full max-w-lg border-x-8 border-studio-yellow p-12 relative shadow-[0_0_100px_rgba(255,204,0,0.1)]">
                <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-white/20 hover:text-white"><Zap size={20}/></button>
                <div className="text-[10px] font-black text-studio-yellow uppercase tracking-widest mb-4">Command :: User_{editingUser.id.slice(0, 8)}</div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-12 truncate">{editingUser.full_name || 'Anonymous User'}</h2>
                
                <div className="space-y-12">
                    <div className="space-y-6">
                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Credit Resonator</span>
                        <div className="flex gap-4">
                            <input 
                                type="number" 
                                value={creditChange} 
                                onChange={e => setCreditChange(Number(e.target.value))}
                                className="flex-1 bg-black border border-white/10 p-5 font-black text-studio-neon text-xl focus:border-studio-neon outline-none transition-all"
                                placeholder="0"
                            />
                            <button 
                                onClick={() => handleUpdateCredits(editingUser.id)}
                                disabled={isSubmitting}
                                className="px-8 py-5 bg-studio-neon text-black font-black uppercase text-[10px] tracking-widest hover:invert transition-all disabled:opacity-50"
                            >Sync</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Subscription Node Override</span>
                        <div className="grid grid-cols-1 gap-2">
                            {['essential', 'pro', 'elite'].map(plan => (
                                <button 
                                    key={plan}
                                    onClick={() => handleAssignSubscription(editingUser.id, plan)}
                                    disabled={isSubmitting}
                                    className="w-full py-4 border border-white/10 hover:border-studio-yellow hover:bg-studio-yellow/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-studio-yellow transition-all flex items-center justify-between px-8 group"
                                >
                                    <span>{plan}_plan</span>
                                    <div className="h-2 w-2 bg-studio-yellow opacity-0 group-hover:opacity-100 shadow-[0_0_10px_#ffcc00] transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 📟 NEW PACK MODAL */}
      {showNewPackModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-studio-grey w-full max-w-xl border-8 border-black p-10 relative">
                <button onClick={() => setShowNewPackModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white"><Zap size={20}/></button>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-10 text-studio-neon">Create New Pack</h2>
                <form onSubmit={handleCreatePack} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Pack Name</label>
                        <input required value={newPack.name} onChange={e => setNewPack({ ...newPack, name: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Description</label>
                        <textarea required value={newPack.description} onChange={e => setNewPack({ ...newPack, description: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all h-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Price (INR)</label>
                            <input required type="number" value={newPack.price_inr} onChange={e => setNewPack({ ...newPack, price_inr: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Price (USD)</label>
                            <input required type="number" value={newPack.price_usd} onChange={e => setNewPack({ ...newPack, price_usd: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Slug (URL)</label>
                            <input required value={newPack.slug} onChange={e => setNewPack({ ...newPack, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" placeholder="e.g. bollywood-master" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Cover URL</label>
                            <input required value={newPack.cover_url} onChange={e => setNewPack({ ...newPack, cover_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Specifications (Comma Separated)</label>
                        <input value={newPack.specifications} onChange={e => setNewPack({ ...newPack, specifications: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" placeholder="MIDI, Stems, 24-bit WAV, etc." />
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-widest hover:invert transition-all disabled:opacity-50">
                        {isSubmitting ? 'SAVING...' : 'CREATE PACK'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* 📟 ADD SOUND MODAL */}
      {showNewSoundModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-studio-grey w-full max-w-3xl border-8 border-black p-10 relative">
                <button onClick={() => setShowNewSoundModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white"><Zap size={20}/></button>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-10 text-studio-neon">Add New Sound</h2>
                <form onSubmit={handleAddSound} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Target Pack</label>
                            <select required value={newSound.pack_id} onChange={e => setNewSound({ ...newSound, pack_id: e.target.value })} className="w-full studio-select">
                                <option value="">SELECT_PACK</option>
                                {allPacks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Sample Name</label>
                            <input required value={newSound.name} onChange={e => setNewSound({ ...newSound, name: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">MP3 Preview URL (Stream)</label>
                            <input required value={newSound.audio_url} onChange={e => setNewSound({ ...newSound, audio_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all placeholder:text-white/5" placeholder="https://drive.google.com/..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Master File URL (HQ Download)</label>
                            <input required value={newSound.download_url} onChange={e => setNewSound({ ...newSound, download_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all placeholder:text-white/5" placeholder="https://drive.google.com/..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Regional Genre</label>
                            <select required value={newSound.ai_genre} onChange={e => setNewSound({ ...newSound, ai_genre: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-[10px] focus:border-studio-neon outline-none transition-all text-white">
                                <option>Indian Classical / Bollywood</option>
                                <option>Tapori / Street Style</option>
                                <option>South Indian / Folk</option>
                                <option>Synth / Electronics</option>
                                <option>Percussive Instrument</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Signal Type</label>
                            <select required value={newSound.type} onChange={e => setNewSound({ ...newSound, type: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-[10px] focus:border-studio-neon outline-none transition-all text-white">
                                <option value="loop">Loop / Phrase</option>
                                <option value="oneshot">One-shot / Hit</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">BPM</label>
                            <input required type="number" value={newSound.bpm} onChange={e => setNewSound({ ...newSound, bpm: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Key Management (Optional)</label>
                            <div className="flex gap-2">
                                <input 
                                    value={newSound.key} 
                                    onChange={e => setNewSound({ ...newSound, key: e.target.value.toUpperCase() })} 
                                    className="flex-[2] bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" 
                                    placeholder="ROOT (E.G. C#)" 
                                />
                                <select 
                                    value={newSound.key_type} 
                                    onChange={e => setNewSound({ ...newSound, key_type: e.target.value })} 
                                    className="flex-1 studio-select"
                                >
                                    <option>None</option>
                                    <option>Major</option>
                                    <option>Minor</option>
                                </select>
                            </div>
                            <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Select 'NONE' for percussive or atonal signals.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Credit Resonance</label>
                            <input required type="number" value={newSound.credit_cost} onChange={e => setNewSound({ ...newSound, credit_cost: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-widest hover:invert transition-all disabled:opacity-50">
                        {isSubmitting ? 'ADDING...' : 'ADD SOUND'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* 📟 EDIT PACK MODAL */}
      {editingPack && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-studio-grey w-full max-w-xl border-8 border-black p-10 relative">
                <button onClick={() => setEditingPack(null)} className="absolute top-4 right-4 text-white/20 hover:text-white"><Zap size={20}/></button>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-10 text-studio-neon">Edit Pack</h2>
                <form onSubmit={handleEditPack} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Pack Name</label>
                        <input required value={editingPack.name} onChange={e => setEditingPack({ ...editingPack, name: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Description</label>
                        <textarea required value={editingPack.description} onChange={e => setEditingPack({ ...editingPack, description: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all h-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Price (INR)</label>
                            <input required type="number" value={editingPack.price_inr} onChange={e => setEditingPack({ ...editingPack, price_inr: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Price (USD)</label>
                            <input required type="number" value={editingPack.price_usd} onChange={e => setEditingPack({ ...editingPack, price_usd: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Slug (URL)</label>
                            <input required value={editingPack.slug} onChange={e => setEditingPack({ ...editingPack, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Cover URL</label>
                            <input required value={editingPack.cover_url} onChange={e => setEditingPack({ ...editingPack, cover_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Specifications (Comma Separated)</label>
                        <input value={Array.isArray(editingPack.specifications) ? editingPack.specifications.join(', ') : editingPack.specifications} onChange={e => setEditingPack({ ...editingPack, specifications: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" placeholder="MIDI, Stems, 24-bit WAV, etc." />
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-widest hover:invert transition-all disabled:opacity-50">
                        {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    <button type="button" onClick={() => setEditingPack(null)} className="w-full py-4 border border-white/10 text-white/20 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancel</button>
                </form>
            </div>
        </div>
      )}

      {/* 📟 EDIT SOUND MODAL */}
      {editingSound && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-studio-grey w-full max-w-3xl border-8 border-black p-10 relative">
                <button onClick={() => setEditingSound(null)} className="absolute top-4 right-4 text-white/20 hover:text-white"><Zap size={20}/></button>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-10 text-studio-neon">Edit Sound</h2>
                <form onSubmit={handleEditSound} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Sample Name</label>
                            <input required value={editingSound.name} onChange={e => setEditingSound({ ...editingSound, name: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">HQ Stems URL (Main)</label>
                            <input required value={editingSound.download_url} onChange={e => setEditingSound({ ...editingSound, download_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">MP3 Preview URL (Stream)</label>
                            <input required value={editingSound.audio_url} onChange={e => setEditingSound({ ...editingSound, audio_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Master File URL (HQ Download)</label>
                            <input required value={editingSound.download_url} onChange={e => setEditingSound({ ...editingSound, download_url: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Regional Genre</label>
                            <select required value={editingSound.ai_genre} onChange={e => setEditingSound({ ...editingSound, ai_genre: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-[10px] focus:border-studio-neon outline-none transition-all text-white">
                                <option>Indian Classical / Bollywood</option>
                                <option>Tapori / Street Style</option>
                                <option>South Indian / Folk</option>
                                <option>Synth / Electronics</option>
                                <option>Percussive Instrument</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Type</label>
                            <select required value={editingSound.type} onChange={e => setEditingSound({ ...editingSound, type: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-[10px] focus:border-studio-neon outline-none transition-all text-white">
                                <option value="loop">Loop</option>
                                <option value="oneshot">Oneshot</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Key</label>
                            <input required value={editingSound.key || ''} onChange={e => setEditingSound({ ...editingSound, key: e.target.value })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">BPM</label>
                            <input required type="number" value={editingSound.bpm} onChange={e => setEditingSound({ ...editingSound, bpm: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest">Credits</label>
                            <input required type="number" value={editingSound.credit_cost} onChange={e => setEditingSound({ ...editingSound, credit_cost: Number(e.target.value) })} className="w-full bg-black border border-white/10 p-5 font-black uppercase text-xs focus:border-studio-neon outline-none transition-all" />
                        </div>
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-widest hover:invert transition-all disabled:opacity-50">
                        {isSubmitting ? 'UPDATING...' : 'SAVE CHANGES'}
                    </button>
                    <button type="button" onClick={() => setEditingSound(null)} className="w-full py-4 border border-white/10 text-white/20 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Cancel</button>
                </form>
            </div>
        </div>
      )}

      {/* 📟 STUDIO_SIDE_RACK */}
      <aside className="w-80 border-r-8 border-black bg-studio-grey p-8 flex flex-col justify-between hidden lg:flex sticky top-0 h-screen z-[100]">
        <div>
            <Link href="/" className="flex items-center gap-4 mb-20 group">
                <div className="h-12 w-12 bg-black border-2 border-white/10 group-hover:border-studio-neon transition-all flex items-center justify-center rotate-45 group-hover:rotate-0">
                    <ShieldCheck className="h-6 w-6 text-studio-neon -rotate-45 group-hover:rotate-0 transition-all" />
                </div>
                <div>
                    <span className="font-black uppercase tracking-widest text-sm italic">SAMPLES_WALA</span>
                    <span className="text-[7px] font-bold uppercase text-white/20 tracking-widest mt-1">Admin Control Panel</span>
                </div>
            </Link>

            <nav className="space-y-2">
                {[
                    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
                    { id: 'PACKS', icon: Package, label: 'Packs' },
                    { id: 'USERS', icon: Users, label: 'Customers' },
                    { id: 'LOGS', icon: Terminal, label: 'System Logs' },
                    { id: 'SETTINGS', icon: Settings, label: 'Settings' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-6 px-8 py-5 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all border-l-4 ${activeTab === item.id ? 'bg-black text-studio-neon border-studio-neon' : 'text-white/20 hover:text-white/60 border-transparent hover:bg-black/40'}`}
                    >
                        <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-studio-neon' : 'text-white/10'}`} /> {item.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="space-y-8">
             <div className="p-6 bg-black/40 border border-white/5 rounded-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">Server Load</span>
                    <span className="text-[10px] font-black text-studio-neon italic">{cpuUsage}%</span>
                </div>
                <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-studio-neon shadow-[0_0_10px_#a6e22e] transition-all duration-1000" style={{ width: `${cpuUsage}%` }} />
                </div>
             </div>

             <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 group cursor-pointer hover:border-studio-neon transition-all">
                <div className="h-10 w-10 bg-black flex items-center justify-center border border-white/10 group-hover:border-studio-neon">
                   <Users className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[8px] font-black uppercase text-white/20 truncate">Admin Email</div>
                    <div className="text-[11px] font-black italic tracking-tighter truncate leading-tight">{userEmail}</div>
                </div>
             </div>
        </div>
      </aside>

      {/* 🚀 COMMAND CENTER MAIN DISPLAY */}
      <main className="flex-1 p-10 md:p-16 overflow-y-auto bg-studio-charcoal/40 step-grid relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-studio-neon opacity-10" />
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 relative z-10">
            <div>
                <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
                    <Activity className="h-3 w-3 text-studio-neon animate-pulse" /> ADMIN / {activeTab}
                </div>
                <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none border-l-8 border-studio-yellow pl-10">Admin<br/><span className="text-studio-neon">_{activeTab}</span></h1>
            </div>

            <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex flex-col items-end gap-2 w-full">
                        {isScanning && (
                            <div className="text-[9px] font-bold text-studio-neon uppercase tracking-widest animate-pulse mb-2">
                                {scanProgress.status} :: {scanProgress.current}/{scanProgress.total} 
                                ({Math.round((scanProgress.current / scanProgress.total) * 100)}%)
                            </div>
                        )}
                        <button 
                        onClick={() => handleScanAi(false)}
                        disabled={isScanning}
                        className={`w-full px-12 py-5 border-2 border-studio-neon text-studio-neon font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all relative overflow-hidden ${isScanning ? 'opacity-100 bg-studio-neon/10' : 'hover:bg-studio-neon hover:text-black shadow-[0_0_30px_rgba(166,226,46,0.1)]'}`}
                        >
                            {isScanning ? (
                                <Loader2 className="h-4 w-4 animate-spin text-studio-neon" />
                            ) : (
                                <Zap className="h-4 w-4" />
                            )}
                            {isScanning ? 'Scan Active' : 'Start AI Scan'}
                            {isScanning && (
                                <div className="absolute bottom-0 left-0 h-1 bg-studio-neon transition-all duration-500" style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }} />
                            )}
                        </button>
                    </div>
                    {!isScanning && (
                        <button 
                            onClick={() => handleScanAi(true)}
                            className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-studio-neon transition-all flex items-center gap-2 group"
                        >
                            <SlidersHorizontal size={10} className="group-hover:rotate-180 transition-transform duration-500" /> Force Re-scan All
                        </button>
                    )}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowNewSoundModal(true)} className="px-12 py-5 bg-studio-neon text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:-translate-y-2 transition-all shadow-2xl">
                        <PlusCircle className="h-4 w-4" /> Add Sound
                    </button>
                    <button onClick={() => setShowNewPackModal(true)} className="px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:-translate-y-2 transition-all shadow-2xl border-r-8 border-studio-yellow">
                        <PlusCircle className="h-4 w-4" /> New Pack
                    </button>
                </div>
            </div>
        </header>

        {/* 📟 CONDITIONAL TABS CONTENT */}
        {activeTab === 'DASHBOARD' && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 relative z-10">
                    {[
                        { label: 'Packs', value: packsCount, icon: Package, color: 'text-white' },
                        { label: 'Sounds', value: samplesCount, icon: Music, color: 'text-white' },
                        { label: 'AI Processing', value: unprocessedAiCount, icon: Activity, color: unprocessedAiCount > 0 ? (isScanning ? 'text-studio-yellow animate-pulse' : 'text-studio-neon') : 'text-white/20', accent: true },
                        { label: 'Total Sales', value: recentPurchases?.length, icon: TrendingUp, color: 'text-[#00FF00]' }
                    ].map((stat, i) => (
                        <div key={i} className={`p-10 border border-white/5 bg-black/40 group hover:border-studio-neon transition-all relative overflow-hidden ${stat.accent ? 'border-studio-neon/20' : ''}`}>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                <stat.icon className="h-32 w-32" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-10 block italic">{stat.label}</span>
                            <div className={`text-6xl font-black italic tracking-tighter mb-4 ${stat.color}`}>{stat.value || 0}</div>
                            <div className="flex items-center gap-3">
                                <div className="h-0.5 w-6 bg-white/10 group-hover:bg-studio-neon transition-all" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Active Feed</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black/60 border border-white/10 relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    <div className="px-12 py-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-studio-grey/40">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 group cursor-pointer hover:text-studio-neon transition-all flex items-center gap-4">
                                <Disc className="w-6 h-6 animate-spin-slow opacity-20" /> Recent Sales
                            </h2>
                            <span className="text-[9px] font-black uppercase text-white/20 tracking-widest italic">Live :: New Purchases</span>
                        </div>
                        <div className="flex gap-2 p-1 bg-black/40 border border-white/5 self-start md:self-center">
                            <button className="px-6 py-2 text-[9px] font-black uppercase bg-white text-black">SUCCESS</button>
                            <button className="px-6 py-2 text-[9px] font-black uppercase text-white/20 hover:text-white transition-all">PENDING</button>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-black">
                        {recentPurchases?.length > 0 ? recentPurchases.map((purchase: any) => (
                            <div key={purchase.id} className="p-12 flex flex-col md:grid md:grid-cols-12 gap-8 items-center hover:bg-white/[0.03] transition-all group border-b border-black">
                                <div className="md:col-span-8 flex items-center gap-10">
                                     <div className="h-16 w-16 bg-studio-grey border border-white/10 flex items-center justify-center group-hover:border-studio-neon transition-all shrink-0">
                                        <ArrowUpRight className="h-6 w-6 text-white/20 group-hover:text-studio-neon group-hover:scale-110 transition-all" />
                                     </div>
                                     <div className="min-w-0">
                                        <Link href="#" className="text-2xl font-black italic tracking-tighter truncate block hover:text-studio-neon transition-all underline decoration-white/10 underline-offset-8 decoration-2">{purchase.item_name}</Link>
                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="h-3 w-3 rounded-full bg-studio-neon/20 border border-studio-neon animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-white/30 tracking-widest leading-none truncate">
                                                User: {purchase.profiles?.full_name || 'Anonymous User'} // REF: {purchase.id.slice(0, 8)}
                                            </span>
                                        </div>
                                     </div>
                                </div>
                                <div className="md:col-span-4 w-full md:text-right flex md:flex-col justify-between items-center md:items-end gap-2">
                                     <div className="text-3xl font-black italic tracking-tighter text-[#00FF00] bg-black/40 px-6 py-2 border-r-4 border-[#00FF00] shadow-[10px_0_20px_rgba(0,255,0,0.05)]">
                                        +{purchase.amount_total > 0 ? `₹${purchase.amount_total}` : 'FREE_SYNC'}
                                     </div>
                                     <div className="text-[10px] font-black uppercase text-white/10 mt-3 tracking-[0.4em] italic flex items-center gap-3">
                                        <Activity size={10} className="text-white/20" /> {new Date(purchase.created_at).toLocaleTimeString()} :: GMT_SYNC
                                     </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-32 text-center">
                                <SlidersHorizontal className="w-20 h-20 text-white/5 mx-auto mb-8" />
                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-white/10 italic">No activity detected</div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

        {/* 📦 PACKS TAB */}
        {activeTab === 'PACKS' && (
            <div className="space-y-12">
                {selectedPack ? (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div className="flex items-center gap-8">
                                <button 
                                    onClick={() => setSelectedPack(null)}
                                    className="h-16 w-16 bg-black border border-white/10 flex items-center justify-center hover:border-studio-neon transition-all"
                                >
                                    <ChevronLeft className="text-studio-neon" />
                                </button>
                                <div>
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">{selectedPack.name}</h2>
                                    <span className="text-[9px] font-black uppercase text-white/20 tracking-widest italic">Pack ID :: {selectedPack.id}</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 items-center flex-1 max-w-2xl bg-black/40 p-4 border border-white/5 rounded-sm">
                                <div className="relative w-full group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-studio-neon transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="SEARCH_SIGNAL_ID_OR_NAME..."
                                        value={sampleSearchQuery}
                                        onChange={(e) => setSampleSearchQuery(e.target.value)}
                                        className="w-full bg-black border border-white/10 px-16 py-4 font-black uppercase text-[10px] tracking-widest focus:border-studio-neon outline-none transition-all focus:shadow-[0_0_20px_rgba(166,226,46,0.05)]"
                                    />
                                </div>
                                <button 
                                    onClick={() => setShowNewSoundModal(true)}
                                    className="w-full md:w-auto px-10 py-4 bg-studio-neon text-black font-black uppercase text-[10px] tracking-widest hover:invert transition-all flex items-center justify-center gap-4 shrink-0 shadow-lg"
                                >
                                    <PlusCircle size={16} /> Add New Sound
                                </button>
                            </div>
                        </div>

                        {/* Search Feedback */}
                        {sampleSearchQuery && (
                            <div className="mb-6 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-studio-neon animate-pulse">
                                <Activity size={12} /> Filtering: {sampleSearchQuery}
                            </div>
                        )}

                        <div className="bg-black/60 border border-white/10 overflow-hidden shadow-2xl relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Sound Name</th>
                                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center">BPM</th>
                                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center">Key</th>
                                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center">Credits</th>
                                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center">Signal Check</th>
                                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {packSamples
                                        .filter(s => s.name.toLowerCase().includes(sampleSearchQuery.toLowerCase()) || s.id.toLowerCase().includes(sampleSearchQuery.toLowerCase()))
                                        .map((sound) => (
                                        <tr key={sound.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-8">
                                                <div className="text-sm font-black italic tracking-tight">{sound.name}</div>
                                                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">ID: {sound.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="p-8 text-center">
                                                <span className="text-sm font-black italic text-studio-neon">{sound.bpm || '--'}</span>
                                            </td>
                                            <td className="p-8 text-center text-[10px] font-black uppercase tracking-widest italic text-white/60">
                                                {sound.key || 'N/A'}
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Key className="h-3 w-3 text-studio-yellow" />
                                                    <span className="text-lg font-black italic tracking-tighter text-studio-yellow">{sound.credit_cost || 1}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center justify-center gap-6">
                                                    {/* 🌊 PREVIEW_NODE (LQ) */}
                                                    <div className="flex flex-col items-center gap-2 group">
                                                        {sound.audio_url ? (
                                                            <PlayButton 
                                                                id={sound.id + '_lq'} 
                                                                url={sound.audio_url} 
                                                                name={`${sound.name} [LQ_PREVIEW]`} 
                                                                packName={selectedPack.name}
                                                                bpm={sound.bpm}
                                                                audioKey={sound.key}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/10">
                                                                <Lock size={12} />
                                                            </div>
                                                        )}
                                                        <span className="text-[7px] font-black tracking-widest text-white/20 group-hover:text-studio-neon uppercase transition-colors">Low-Q</span>
                                                    </div>

                                                    {/* 💎 ORIGINAL_NODE (HQ) */}
                                                    <div className="flex flex-col items-center gap-2 group">
                                                        {sound.download_url ? (
                                                            <PlayButton 
                                                                id={sound.id + '_hq'} 
                                                                url={sound.download_url} 
                                                                name={`${sound.name} [HQ_MASTER]`} 
                                                                packName={selectedPack.name}
                                                                bpm={sound.bpm}
                                                                audioKey={sound.key}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/10">
                                                                <Lock size={12} />
                                                            </div>
                                                        )}
                                                        <span className="text-[7px] font-black tracking-widest text-white/20 group-hover:text-[#00FF00] uppercase transition-colors">Master</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8 text-right flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingSound(sound)}
                                                    className="p-3 bg-white/5 border border-white/10 hover:bg-studio-neon hover:text-black transition-all"
                                                >
                                                    <Settings size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteSound(sound.id)}
                                                    className="p-3 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Terminal size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allPacks.map((pack) => (
                            <div 
                                key={pack.id} 
                                onClick={() => setSelectedPack(pack)}
                                className="bg-black/40 border border-white/5 p-8 flex flex-col group hover:border-studio-neon transition-all relative overflow-hidden group cursor-pointer"
                            >
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                    {pack.cover_url ? (
                                        <img src={pack.cover_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-studio-grey" />
                                    )}
                                </div>
                                <div className="flex justify-between items-start mb-10 relative z-10 pointer-events-none">
                                    <div className="h-16 w-16 bg-black border border-white/10 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform overflow-hidden">
                                        {pack.cover_url ? (
                                            <img src={pack.cover_url} alt={pack.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="h-8 w-8 text-white/20 group-hover:text-studio-neon" />
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest block">Price</span>
                                        <span className="text-xl font-black italic tracking-tighter text-studio-neon">₹{pack.price_inr || 0}</span>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2 truncate relative z-10 pointer-events-none">{pack.name}</h3>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-10 line-clamp-2 relative z-10 pointer-events-none">{pack.description}</p>
                                
                                <div className="flex gap-2 mt-auto relative z-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingPack(pack); }}
                                        className="flex-1 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-studio-neon transition-all"
                                    >Edit</button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeletePack(pack.id); }}
                                        className="px-5 py-3 bg-black/40 border border-white/10 text-white/20 hover:text-red-500 hover:border-red-500 transition-all"
                                    ><Terminal size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* 👥 CUSTOMERS TAB */}
        {activeTab === 'USERS' && (
            <div className="bg-black/60 border border-white/10 overflow-hidden relative z-10 shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">ID</th>
                            <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Customer</th>
                            <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center">Plan</th>
                            <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center">Credits</th>
                            <th className="p-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {allCustomers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-8 font-mono text-[9px] text-white/10">{user.id.slice(0, 8)}...</td>
                                <td className="p-8">
                                    <div className="text-sm font-black italic tracking-tight">{user.full_name || 'Anonymous User'}</div>
                                    <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none mt-1">{user.id === editingUser?.id ? 'SYNCING...' : 'Node_Active'}</div>
                                </td>
                                <td className="p-8 text-center">
                                    <span className="px-5 py-1.5 bg-black border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 rounded-full group-hover:border-studio-yellow group-hover:text-studio-yellow transition-all">
                                        {user.user_accounts?.[0]?.subscription_tier || 'Free'}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center justify-center gap-3">
                                        <Key className="h-3 w-3 text-studio-neon" />
                                        <span className="text-lg font-black italic tracking-tighter text-studio-neon">{user.user_accounts?.[0]?.credits || 0}</span>
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <button 
                                        onClick={() => setEditingUser(user)}
                                        className="px-6 py-2 bg-white text-black border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-studio-neon transition-all shadow-lg"
                                    >Admin Console</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* 📡 SYSTEM LOGS TAB */}
        {activeTab === 'LOGS' && (
            <div className="space-y-4">
                {aiLogs.map((log) => (
                    <div key={log.id} className="bg-black/40 border-l-4 border-white/5 p-8 flex items-center justify-between group hover:border-studio-neon transition-all">
                        <div className="flex items-center gap-10">
                            <div className="p-4 bg-black border border-white/10 group-hover:border-studio-neon transition-all">
                                <Activity className={`h-4 w-4 ${log.analysis_phase === 'FAILURE' ? 'text-red-500' : 'text-studio-neon'}`} />
                            </div>
                            <div>
                                <div className="text-xl font-black italic tracking-tighter uppercase">{log.analysis_phase}</div>
                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-4">
                                    <span>Sample: {log.samples?.name || 'Unknown'}</span>
                                    <span className="h-1 w-1 bg-white/20 rounded-full" />
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1 italic">Status</div>
                            <div className={`text-[10px] font-black uppercase tracking-widest ${log.analysis_phase === 'FAILURE' ? 'text-red-500' : 'text-studio-neon'}`}>
                                {log.result_data?.status || 'DONE'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* 👥 CUSTOMERS TAB */}
        {activeTab === 'USERS' && (
            <div className="space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/10 group-focus-within:text-studio-neon transition-colors" />
                        <input 
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            placeholder="SEARCH_USER_SIGNAL_ID_OR_EMAIL..." 
                            className="w-full bg-black/40 border-2 border-white/5 p-6 pl-16 font-black uppercase tracking-widest text-xs focus:border-studio-neon outline-none transition-all placeholder:text-white/5" 
                        />
                    </div>
                    <button 
                        onClick={handleRefreshUsers}
                        disabled={isRefreshingUsers}
                        className="px-10 py-6 border-2 border-white/10 text-white/40 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:border-studio-neon hover:text-studio-neon transition-all hover:-rotate-1"
                    >
                        {isRefreshingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Refresh Registry
                    </button>
                </div>

                <div className="bg-black/60 border border-white/10 overflow-hidden shadow-2xl">
                    <div className="hidden md:grid grid-cols-12 gap-6 px-12 py-6 bg-studio-grey/40 border-b border-black text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">
                        <div className="col-span-3">User Registry ID / Email</div>
                        <div className="col-span-2 text-center">Plan Status</div>
                        <div className="col-span-1 text-center">Credits</div>
                        <div className="col-span-2 text-center">Last Pulse</div>
                        <div className="col-span-4 text-right">Access Controls</div>
                    </div>

                    <div className="divide-y divide-black">
                        {users.filter(u => u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())).map((user) => (
                            <div key={user.id} className={`p-12 flex flex-col md:grid md:grid-cols-12 gap-8 items-center hover:bg-white/[0.03] transition-all group ${user.is_banned ? 'opacity-40 border-l-4 border-spider-red' : ''}`}>
                                <div className="md:col-span-3 flex items-center gap-6 min-w-0">
                                    <div className={`h-12 w-12 flex items-center justify-center border-2 transition-all ${user.is_banned ? 'border-spider-red bg-spider-red/10 overflow-hidden' : 'border-white/10 group-hover:border-studio-neon bg-black'}`}>
                                        {user.is_banned ? <Ban className="h-5 w-5 text-spider-red scale-150 rotate-12" /> : <Users className="h-5 w-5 text-white/20 group-hover:text-studio-neon" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xl font-black italic tracking-tighter truncate group-hover:text-studio-neon transition-all leading-tight">
                                            {user.full_name}
                                        </div>
                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 truncate">
                                            {user.email}
                                        </div>
                                        <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-1">
                                            ID: {user.id?.slice(0, 8) || 'LOST'}
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 text-center flex flex-col items-center gap-2">
                                    <span className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border ${user.subscription_status === 'active' ? 'bg-studio-neon/10 border-studio-neon text-studio-neon' : 'bg-white/5 border-white/5 text-white/20'}`}>
                                        {user.subscription_status || 'INACTIVE'}
                                    </span>
                                    {user.subscription_status === 'active' && (
                                        <div className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em] italic bg-black px-2 py-0.5 border border-white/5">
                                            {user.subscription_tier}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-1 text-center font-black text-2xl italic tracking-tighter text-studio-neon">
                                    {user.credits || 0}
                                </div>
                                <div className="md:col-span-2 text-center">
                                    <div className="text-[9px] font-black uppercase text-white/40 mb-1">{user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'N/A'}</div>
                                    <div className="text-[7px] font-bold text-white/10 tracking-widest uppercase italic">{user.last_sign_in ? new Date(user.last_sign_in).toLocaleTimeString() : 'SIGNAL_LOST'}</div>
                                </div>
                                <div className="md:col-span-4 flex items-center justify-end gap-3 flex-wrap">
                                    <button onClick={() => handleShowVault(user)} className="h-10 px-6 bg-black border border-white/10 hover:border-studio-neon text-[8px] font-black uppercase tracking-widest hover:text-studio-neon transition-all group/btn flex items-center gap-2">
                                        <Disc className="w-3 h-3 group-hover/btn:animate-spin" /> Vault
                                    </button>
                                    <button onClick={() => handleToggleBan(user.id, !!user.is_banned)} className={`h-10 px-6 border ${user.is_banned ? 'bg-studio-neon text-black border-studio-neon' : 'bg-black border-white/10 text-white/20 hover:border-spider-red hover:text-spider-red'} text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2`}>
                                        {user.is_banned ? <Unlock className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                        {user.is_banned ? 'Unban' : 'Ban'}
                                    </button>
                                    <button onClick={() => handleTerminateSub(user.id)} className="h-10 px-6 bg-black border border-white/10 hover:border-spider-red text-white/20 hover:text-spider-red text-[8px] font-black uppercase tracking-widest transition-all group/btn flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> Kill_Sub
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-3 bg-white/5 border border-white/5 text-white/10 hover:bg-spider-red hover:text-black hover:border-spider-red transition-all group/btn">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ⚙️ SETTINGS TAB */}
        {activeTab === 'SETTINGS' && (
            <div className="max-w-3xl space-y-12">
                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                        <ShieldCheck className="text-studio-neon" /> Platform Security
                    </h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-10 bg-black/40 border border-white/5 space-y-4">
                            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Maintenance Mode</span>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black italic tracking-tighter">System Offline</span>
                                <div className="w-12 h-6 bg-white/5 border border-white/10 relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white/20" />
                                </div>
                            </div>
                        </div>
                        <div className="p-10 bg-black/40 border border-white/5 space-y-4">
                            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Public Deposits</span>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black italic tracking-tighter text-studio-neon">Active Payment Node</span>
                                <div className="w-12 h-6 bg-studio-neon/20 border border-studio-neon relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-studio-neon shadow-[0_0_10px_#a6e22e]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                        <Settings className="text-studio-neon" /> Global Rates
                    </h2>
                    <div className="p-10 bg-black/40 border border-white/5 space-y-10">
                        <div className="flex justify-between items-center bg-black p-6 border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Base Credit Rate</span>
                            <span className="text-2xl font-black italic text-studio-neon">₹1.00 / 1 Token</span>
                        </div>
                        <button className="w-full py-5 bg-white text-black font-black uppercase text-[11px] tracking-[0.3em] hover:bg-studio-neon transition-all">Update System Parameters</button>
                    </div>
                </div>
            </div>
        )}

        {/* 📀 SYSTEM_STATUS_FOOTER (Decor) */}
        <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-10 opacity-20 relative z-10">
            <div className="flex items-center gap-8">
                <div className="flex gap-1 h-4 items-end">
                    {[3, 7, 5, 9, 4, 8, 2, 6].map((h, i) => <div key={i} className="w-1 bg-studio-neon animate-peak" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }} />)}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Station Status :: Secure</span>
            </div>
            <div className="flex items-center gap-10 text-[8px] font-black uppercase tracking-widest">
                <span>Database: {isAdminFromDb ? 'Direct' : 'Restricted'}</span>
                <span className="text-studio-neon">Admin: {userEmail.split('@')[0]}</span>
                <span>Security: v5.2.0</span>
            </div>
        </div>

      </main>

      {/* 📟 USER_OVERSIGHT_MODAL (VAULT + TRANSACTIONS + SUBSCRIPTION) */}
      {(selectedUserVault || selectedUserTransactions) && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <div className="bg-studio-grey w-full max-w-5xl border-8 border-black p-12 relative overflow-hidden">
                {/* 🧬 DECOR SIGNAL */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Disc className="h-64 w-64 animate-spin-slow" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-12">
                        <div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-studio-neon mb-4">
                                <Activity className="h-3 w-3 animate-pulse" /> TARGET_OVERSIGHT :: {userModalTab}
                            </div>
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Account<br/><span className="text-studio-neon">_Diagnostic</span></h2>
                        </div>
                        <div className="flex flex-col items-end gap-6 text-right">
                            <button onClick={() => { setSelectedUser(null); setSelectedUserVault(null); setSelectedUserTransactions(null); }} className="h-16 w-16 bg-black border-2 border-white/10 flex items-center justify-center hover:border-studio-neon transition-all hover:rotate-90">
                                <Zap className="text-white/40" />
                            </button>
                            <div className="flex gap-2 p-1 bg-black/40 border border-white/5">
                                <button onClick={() => setUserModalTab('VAULT')} className={`px-8 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${userModalTab === 'VAULT' ? 'bg-studio-neon text-black' : 'text-white/20 hover:text-white'}`}>Artifact Vault</button>
                                <button onClick={() => setUserModalTab('FINANCE')} className={`px-8 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${userModalTab === 'FINANCE' ? 'bg-studio-neon text-black' : 'text-white/20 hover:text-white'}`}>Financial Registry</button>
                                <button onClick={() => setUserModalTab('SUBSCRIPTION')} className={`px-8 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${userModalTab === 'SUBSCRIPTION' ? 'bg-studio-neon text-black' : 'text-white/20 hover:text-white'}`}>Subscription Hub</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-h-[45vh] overflow-y-auto studio-panel bg-black/40 border border-white/5 custom-scrollbar min-h-[400px]">
                        {userModalTab === 'VAULT' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-12 gap-6 px-10 py-5 bg-studio-grey border-b border-black text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic sticky top-0 z-20">
                                    <div className="col-span-8">Artifact Name / Signal ID</div>
                                    <div className="col-span-2 text-center">Type</div>
                                    <div className="col-span-2 text-right">Unlocked</div>
                                </div>
                                <div className="divide-y divide-black">
                                    {selectedUserVault?.length ? selectedUserVault.map((item, i) => (
                                        <div key={i} className="px-10 py-6 grid grid-cols-12 gap-6 items-center hover:bg-white/5 transition-all group">
                                            <div className="col-span-8 flex items-center gap-6">
                                                <div className="h-3 w-3 bg-studio-neon/20 border border-studio-neon/40 shadow-[0_0_5px_#a6e22e/20] rounded-full group-hover:scale-125 transition-transform" />
                                                <div className="min-w-0">
                                                    <div className="text-2xl font-black uppercase italic tracking-tighter truncate leading-none group-hover:text-studio-neon transition-all">{item.name}</div>
                                                    <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-2">ID: {item.item_id?.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center text-[8px] font-black uppercase text-white/40">{item.item_type}</div>
                                            <div className="col-span-2 text-right text-[10px] font-black uppercase text-white/20 italic">{new Date(item.added_at).toLocaleDateString()}</div>
                                        </div>
                                    )) : <div className="p-32 text-center text-[11px] font-black uppercase tracking-widest text-white/10 italic">VAULT_EMPTY :: NO_SIGNALS_DETECTED</div>}
                                </div>
                            </div>
                        )}

                        {userModalTab === 'FINANCE' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="grid grid-cols-12 gap-6 px-10 py-5 bg-studio-grey border-b border-black text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic sticky top-0 z-20">
                                    <div className="col-span-6">Order ID / Payment Node</div>
                                    <div className="col-span-2 text-center">Amount</div>
                                    <div className="col-span-2 text-center">Credits</div>
                                    <div className="col-span-2 text-right">Timestamp</div>
                                </div>
                                <div className="divide-y divide-black">
                                    {selectedUserTransactions?.length ? selectedUserTransactions.map((tx, i) => (
                                        <div key={i} className="px-10 py-6 grid grid-cols-12 gap-6 items-center hover:bg-white/5 transition-all group">
                                            <div className="col-span-6">
                                                <div className="text-xl font-black uppercase italic tracking-tighter text-white/60 group-hover:text-studio-neon transition-all">{tx.order_id || 'RENEWAL'}</div>
                                                <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-1">PAY_ID: {tx.payment_id?.slice(0, 12)}...</div>
                                            </div>
                                            <div className="col-span-2 text-center text-2xl font-black italic tracking-tighter text-white">₹{tx.amount_inr}</div>
                                            <div className="col-span-2 text-center"><span className="px-4 py-1.5 bg-studio-neon/10 border border-studio-neon text-studio-neon text-[9px] font-black tracking-widest leading-none">+{tx.credits_awarded} CR</span></div>
                                            <div className="col-span-2 text-right text-[10px] font-black uppercase text-white/20 italic">{new Date(tx.created_at).toLocaleDateString()}</div>
                                        </div>
                                    )) : <div className="p-32 text-center text-[11px] font-black uppercase tracking-widest text-white/10 italic">REGISTRY_EMPTY :: NO_DEPOSITS_DETECTED</div>}
                                </div>
                            </div>
                        )}

                        {userModalTab === 'SUBSCRIPTION' && (
                            <div className="p-20 space-y-12 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="p-10 bg-black/40 border border-white/5 space-y-6 group hover:border-studio-neon transition-all">
                                        <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Active Plan Node</span>
                                        <div className="flex flex-col gap-4">
                                            <div className="text-5xl font-black italic tracking-tighter text-studio-neon uppercase leading-none">{selectedUser?.subscription_tier || 'NO_TIER'}</div>
                                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest truncate italic">Registry Email: {selectedUser?.email}</div>
                                        </div>
                                        <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                            <div className="h-10 w-10 bg-studio-neon flex items-center justify-center font-black text-black italic">!</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest">Yield: {selectedUser?.subscription_credits || 0} CR / MONTH</div>
                                        </div>
                                    </div>

                                    <div className="p-10 bg-black/40 border-2 border-dashed border-white/10 space-y-6">
                                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest flex items-center gap-4"><RefreshCw className="h-3 w-3 animate-spin-slow" /> Next Billing Pulse</span>
                                        <div className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">{selectedUser?.next_billing ? new Date(selectedUser.next_billing).toLocaleDateString() : 'NO_CYCLE'}</div>
                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className={`text-[8px] font-black uppercase tracking-widest ${selectedUser?.subscription_status === 'ACTIVE' ? 'text-studio-neon' : 'text-spider-red'}`}>Status: {selectedUser?.subscription_status}</div>
                                            <div className="text-[10px] font-black text-white/20 italic transition-all cursor-help">NODE: {selectedUser?.razorpay_subscription_id?.slice(0, 10) || 'DIRECT_LINK'}...</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-12 bg-spider-red/5 border border-spider-red/20 space-y-6">
                                     <div className="flex items-center gap-4 text-spider-red"><Lock className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Dangerous Node Suppression</span></div>
                                     <p className="text-[10px] font-medium text-white/40 leading-relaxed max-w-xl italic lowercase">Terminating this node will instantly revoke high-bandwidth artifact access. User credits will be preserved but cycles will halt immediately.</p>
                                     <button onClick={() => handleTerminateSub(selectedUser?.id)} className="px-12 py-5 border-2 border-spider-red text-spider-red font-black uppercase text-[10px] tracking-widest hover:bg-spider-red hover:text-black transition-all">Terminate Node Lifecycle</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 flex justify-between items-center bg-black p-8 border border-white/5">
                        <div className="flex gap-20">
                            <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Total Unlocks</span><span className="text-4xl font-black italic tracking-tighter text-studio-neon leading-none">{selectedUserVault?.length || 0}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Lifetime Deposits</span><span className="text-4xl font-black italic tracking-tighter text-studio-neon leading-none text-white">₹{selectedUserTransactions?.reduce((acc, curr) => acc + (curr.amount_inr || 0), 0) || 0}</span></div>
                        </div>
                        <button onClick={() => { setSelectedUser(null); setSelectedUserVault(null); setSelectedUserTransactions(null); }} className="px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.4em] hover:bg-studio-neon transition-all">Exit Diagnostic</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
