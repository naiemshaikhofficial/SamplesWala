
'use client'

import { 
  FileAudio, Package, Headphones, Disc, Bookmark, 
  Search, ShieldCheck, Activity, Cpu, ArrowLeft, 
  Trash2, DownloadCloud, Zap, Cloud
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LibraryPage() {
    const [vaultItems, setVaultItems] = useState<any[]>([])
    const [stats, setStats] = useState({ sounds: 0, packs: 0 })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchLibrary() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return setLoading(false)

            // 1. Fetch Vault Items
            const { data: items, error } = await supabase
                .from('user_vault')
                .select('*')
                .eq('user_id', user.id)
                .order('added_at', { ascending: false })

            if (error || !items) {
                setLoading(false)
                return
            }

            // 2. Resolve Names (Join Logic)
            const sampleIds = items.filter(v => v.item_type === 'sample').map(v => v.item_id)
            const packIds = items.filter(v => v.item_type === 'pack').map(v => v.item_id)

            const [ { data: samples }, { data: packs } ] = await Promise.all([
                supabase.from('samples').select('id, name, audio_url').in('id', sampleIds),
                supabase.from('sample_packs').select('id, name, cover_url').in('id', packIds)
            ])

            const enriched = items.map(v => ({
                ...v,
                display_name: v.item_type === 'sample' 
                    ? samples?.find(s => s.id === v.item_id)?.name || 'Unknown Sample'
                    : packs?.find(p => p.id === v.item_id)?.name || 'Unknown Pack',
                cover: v.item_type === 'sample' ? null : packs?.find(p => p.id === v.item_id)?.cover_url
            }))

            setVaultItems(enriched)
            setStats({
                sounds: items.filter(v => v.item_type === 'sample').length,
                packs: items.filter(v => v.item_type === 'pack').length
            })
            setLoading(false)
        }
        fetchLibrary()
    }, [supabase])

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Activity className="animate-spin text-studio-neon" />
        </div>
    )

    return (
        <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
            {/* 🧬 BACKGROUND_GRID */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
            />

            <div className="w-full px-8 md:px-12 relative z-10 max-w-[1920px]">
                
                {/* 🕹️ TOP_NAVIGATION_SIGNAL */}
                <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <Link href="/browse" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-studio-neon transition-colors mb-6 group italic">
                            <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" /> BACK TO BROWSE
                        </Link>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-2 w-1 bg-studio-neon shadow-[0_0_10px_rgba(180,255,0,0.5)]" />
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                                MY <span className="text-white/10 italic">LIBRARY</span>
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                            <div className="flex items-center gap-2">
                                <Headphones size={12} className="text-studio-neon" /> {stats.sounds} SOUNDS COLLECTED
                            </div>
                            <div className="flex items-center gap-2">
                                <Disc size={12} className="text-studio-neon" /> {stats.packs} PACKS LOADED
                            </div>
                        </div>
                    </div>

                    {/* 📡 STATUS_HUB */}
                    <div className="flex items-center p-4 bg-black/40 border border-white/5 rounded-sm gap-6 min-w-[240px]">
                        <div className="w-10 h-10 bg-studio-neon/10 border border-studio-neon/20 flex items-center justify-center text-studio-neon animate-pulse">
                            <Cloud size={18} />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block italic mb-1">CONNECTION</span>
                            <p className="text-[10px] font-black text-studio-neon uppercase tracking-widest italic">
                                CLOUD SYNC ACTIVE
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🗄️ VAULT_CONTENT */}
                {vaultItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vaultItems.map((item) => (
                            <div key={item.id} className="p-6 bg-black/40 border border-white/5 group hover:border-studio-neon transition-all flex items-center justify-between shadow-2xl">
                                <div className="flex items-center gap-6 overflow-hidden">
                                    <div className="h-16 w-16 bg-studio-grey flex-shrink-0 relative overflow-hidden border border-white/10">
                                        {item.cover ? (
                                            <img src={item.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10 group-hover:text-studio-neon transition-colors">
                                                {item.item_type === 'sample' ? <FileAudio size={24} /> : <Package size={24} />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white/60 group-hover:text-white truncate">
                                            {item.display_name}
                                        </h3>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/10 italic">
                                            {item.item_type.toUpperCase()} // UNLOCKED: {new Date(item.added_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/5 text-white/20 hover:bg-studio-neon hover:text-black hover:border-studio-neon transition-all">
                                        <DownloadCloud size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-black/30 border-2 border-dashed border-white/5 rounded-lg flex flex-center items-center justify-center p-12 text-center group hover:border-white/10 transition-colors">
                        <div className="max-w-md space-y-8">
                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 group-hover:text-studio-neon group-hover:border-studio-neon/30 transition-all duration-500 scale-110">
                                <DownloadCloud size={32} />
                            </div>
                            
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">
                                    Your library is empty
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 leading-relaxed max-w-xs mx-auto italic">
                                    START EXPLORING OUR SOUND CATALOG TO LOAD YOUR LIBRARY.
                                </p>
                            </div>

                            <Link href="/browse" className="inline-flex items-center gap-4 px-8 py-4 bg-studio-neon text-black text-[10px] font-black uppercase tracking-[0.3em] italic rounded-sm hover:translate-y-[-2px] hover:shadow-[0_10px_40px_rgba(180,255,0,0.2)] transition-all">
                                STARTS EXPLORING <ArrowLeft size={12} className="rotate-180" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* 🔗 QUICK_ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/5">
                    {[
                        { title: 'My Sounds', desc: 'All your single sound downloads', icon: <Headphones /> },
                        { title: 'Bundles', desc: 'Complete pack collections', icon: <Package /> },
                        { title: 'Wishlist', desc: 'Your saved sounds', icon: <Bookmark /> }
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/2 border border-white/5 rounded-sm hover:border-studio-neon/30 transition-all cursor-pointer group">
                            <div className="text-white/20 group-hover:text-studio-neon transition-colors mb-4 scale-75 origin-left">{item.icon}</div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-2 italic">{item.title}</h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
