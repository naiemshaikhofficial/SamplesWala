'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Package, Music, Users, ArrowUpRight, TrendingUp, 
  PlusCircle, ShieldCheck, Zap, Activity, HardDrive, Cpu, 
  Terminal, Settings, Search, Disc, SlidersHorizontal, Lock, CheckCircle2, Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AdminDashboardClient({ 
    packsCount, samplesCount, unprocessedAiCount, recentPurchases, userEmail, isAdminFromDb
}: { 
    packsCount: number, samplesCount: number, unprocessedAiCount: number, recentPurchases: any[], userEmail: string, isAdminFromDb: boolean
}) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState('DASHBOARD')
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, status: 'IDLE' })

  // 🧪 REALTIME_SIMULATOR: Just for visual flair
  const [cpuUsage, setCpuUsage] = useState(12)
  useEffect(() => {
    const interval = setInterval(() => {
        setCpuUsage(prev => Math.min(99, Math.max(5, prev + (Math.random() > 0.5 ? 5 : -5))))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleScanAi = async () => {
    if (!confirm('PROTOCOL_INIT :: Confirm Autonomous AI Scan for all unprocessed sounds?')) return
    
    setIsScanning(true)
    setScanProgress({ current: 0, total: unprocessedAiCount, status: 'INITIALIZING' })

    try {
        // 1. Fetch the list of unprocessed sample IDs
        const resList = await fetch('/api/ai/get-unprocessed')
        const { data: unprocessedIds } = await resList.json()

        if (!unprocessedIds || unprocessedIds.length === 0) {
            setScanProgress({ current: 0, total: 0, status: 'COMPLETED' })
            setIsScanning(false)
            return
        }

        setScanProgress(prev => ({ ...prev, total: unprocessedIds.length, status: 'PROCESSING_SIGNAL' }))

        // 2. Sequential Processing Loop
        let completed = 0;
        for (const sample of unprocessedIds) {
            try {
                const res = await fetch('/api/ai/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sampleId: sample.id })
                })
                
                if (!res.ok) {
                    const errData = await res.json()
                    throw new Error(errData.error || 'CHUNK_FAILURE')
                }

                completed++
                setScanProgress(prev => ({ ...prev, current: completed }))
            } catch (err) {
                console.error(`SCAN_ERROR at Sample ${sample.id} ::`, err)
                // Continue scanning others even if one fails
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

  // 🛡️ SECURITY OVERLAY
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
      
      {/* 📟 STUDIO_SIDE_RACK */}
      <aside className="w-80 border-r-8 border-black bg-studio-grey p-8 flex flex-col justify-between hidden lg:flex sticky top-0 h-screen z-[100]">
        <div>
            <div className="flex items-center gap-4 mb-20 group">
                <div className="h-12 w-12 bg-black border-2 border-white/10 group-hover:border-studio-neon transition-all flex items-center justify-center rotate-45 group-hover:rotate-0">
                    <ShieldCheck className="h-6 w-6 text-studio-neon -rotate-45 group-hover:rotate-0 transition-all" />
                </div>
                <div>
                    <span className="font-black uppercase tracking-widest text-sm italic">SAMPLES_WALA</span>
                    <span className="text-[7px] font-bold uppercase text-white/20 tracking-widest mt-1">V5.2_PRODUCTION_SYSTEM</span>
                </div>
            </div>

            <nav className="space-y-2">
                {[
                    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'DASHBOARD', href: '/admin' },
                    { id: 'PACKS', icon: Package, label: 'SAMPLE PACKS', href: '/admin' },
                    { id: 'SAMPLES', icon: Music, label: 'SOUNDS', href: '/admin' },
                    { id: 'USERS', icon: Users, label: 'CUSTOMERS', href: '/admin' },
                    { id: 'LOGS', icon: Terminal, label: 'SYSTEM LOGS', href: '/admin' },
                    { id: 'SETTINGS', icon: Settings, label: 'SETTINGS', href: '/admin' }
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
             {/* 🧬 SYSTEM LOAD VUE */}
             <div className="p-6 bg-black/40 border border-white/5 rounded-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">CPU_RESERVE</span>
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
                    <div className="text-[8px] font-black uppercase text-white/20 truncate">Authorized_ID</div>
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
                    <Activity className="h-3 w-3 text-studio-neon animate-pulse" /> STABLE_NODE_LINKED
                </div>
                <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none border-l-8 border-studio-yellow pl-10">Admin<br/><span className="text-studio-neon">_Control</span></h1>
            </div>

            <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-end gap-2">
                    {isScanning && (
                        <div className="text-[9px] font-bold text-studio-neon uppercase tracking-widest animate-pulse mb-2">
                            {scanProgress.status} :: {scanProgress.current}/{scanProgress.total} 
                            ({Math.round((scanProgress.current / scanProgress.total) * 100)}%)
                            {scanProgress.total > 0 && ` ~ Est ${Math.max(0, (scanProgress.total - scanProgress.current) * 1.5)}s remaining`}
                        </div>
                    )}
                    <button 
                    onClick={handleScanAi}
                    disabled={isScanning}
                    className={`px-12 py-5 border-2 border-studio-neon text-studio-neon font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 transition-all relative overflow-hidden ${isScanning ? 'opacity-100 bg-studio-neon/10' : 'hover:bg-studio-neon hover:text-black shadow-[0_0_30px_rgba(166,226,46,0.1)]'}`}
                    >
                        {isScanning ? (
                            <Loader2 className="h-4 w-4 animate-spin text-studio-neon" />
                        ) : (
                            <Zap className="h-4 w-4" />
                        )}
                        {isScanning ? 'SCAN_ACTIVE' : 'START AI_SCAN'}
                        
                        {/* 📊 PROGRESS BAR (Inside Button) */}
                        {isScanning && (
                            <div className="absolute bottom-0 left-0 h-1 bg-studio-neon transition-all duration-500" style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }} />
                        )}
                    </button>
                </div>
                <button className="px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:-translate-y-2 transition-all shadow-2xl border-r-8 border-studio-yellow">
                    <PlusCircle className="h-4 w-4" /> NEW_SOUND
                </button>
            </div>
        </header>

        {/* 📊 TELEMETRY DATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 relative z-10">
            {[
                { label: 'Sample Packs', value: packsCount, icon: Package, color: 'text-white' },
                { label: 'Total Sounds', value: samplesCount, icon: Music, color: 'text-white' },
                { label: 'AI Processing', value: unprocessedAiCount, icon: Activity, color: unprocessedAiCount > 0 ? (isScanning ? 'text-studio-yellow animate-pulse' : 'text-studio-neon') : 'text-white/20', accent: true },
                { label: 'Total Sales', value: recentPurchases?.length, icon: TrendingUp, color: 'text-[#00FF00]' }
            ].map((stat, i) => (
                <div key={i} className={`p-10 border border-white/5 bg-black/40 backdrop-blur-3xl group hover:border-studio-neon transition-all relative overflow-hidden ${stat.accent ? 'border-studio-neon/20' : ''}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <stat.icon className="h-32 w-32" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-10 block italic">{stat.label}</span>
                    <div className={`text-6xl font-black italic tracking-tighter mb-4 ${stat.color}`}>{stat.value || 0}</div>
                    <div className="flex items-center gap-3">
                        <div className="h-0.5 w-6 bg-white/10 group-hover:bg-studio-neon transition-all" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">ACTIVE_FEED</span>
                    </div>
                </div>
            ))}
        </div>

        {/* 📑 RECENT OPERATIONS DISPLAY */}
        <div className="bg-black/60 border border-white/10 relative z-10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            <div className="px-12 py-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-studio-grey/40">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 group cursor-pointer hover:text-studio-neon transition-all flex items-center gap-4">
                        <Disc className="w-6 h-6 animate-spin-slow opacity-20" /> RECENT_SALES
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
                                        ID: {purchase.profiles?.full_name || 'SYSTEM_GUEST'} // REF: {purchase.id.slice(0, 8)}
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
                        <div className="text-[11px] font-black uppercase tracking-[0.6em] text-white/10 italic">NO_ACQUISITION_CYCLES_DETECTED</div>
                    </div>
                )}
            </div>

            <div className="p-10 bg-black/40 border-t border-white/5 text-center">
                <button className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-studio-neon transition-all hover:tracking-[0.5em] duration-700">
                    - View_Full_Diagnostic_Archive -
                </button>
            </div>
        </div>

        {/* 📀 SYSTEM_STATUS_FOOTER (Decor) */}
        <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-10 opacity-20">
            <div className="flex items-center gap-8">
                <div className="flex gap-1 h-4 items-end">
                    {[3, 7, 5, 9, 4, 8, 2, 6].map((h, i) => <div key={i} className="w-1 bg-studio-neon animate-peak" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }} />)}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Website Status :: Online</span>
            </div>
            <div className="flex items-center gap-10 text-[8px] font-black uppercase tracking-widest">
                <span>Database: Connected</span>
                <span className="text-studio-neon">Speed: fast</span>
                <span>Security: active</span>
            </div>
        </div>

      </main>
    </div>
  )
}
