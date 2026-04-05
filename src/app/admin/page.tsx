import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, Music, Users, ArrowUpRight, TrendingUp, PlusCircle, Settings, ShieldCheck } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 🛡️ SECURITY PROTOCOL: Check for admin status
  // We check the 'is_admin' field or email domain in a real scenario
  const isAdmin = user?.email?.includes('beatswala') || user?.email?.includes('naiem');
  if (!isAdmin) redirect('/')

  // 📡 AGGREGATE SYSTEM DATA
  const [
    { count: packsCount },
    { count: samplesCount },
    { data: recentPurchases }
  ] = await Promise.all([
    supabase.from('sample_packs').select('*', { count: 'exact', head: true }),
    supabase.from('samples').select('*', { count: 'exact', head: true }),
    supabase.from('purchases').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5)
  ])

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      
      {/* 📟 SIDEBAR NAVIGATION */}
      <aside className="w-80 border-r border-white/5 p-10 flex flex-col justify-between hidden lg:flex">
        <div>
            <div className="flex items-center gap-3 mb-20">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-black" />
                </div>
                <span className="font-black uppercase tracking-widest text-sm italic">WALA_CORE</span>
            </div>

            <nav className="space-y-4">
                <Link href="/admin" className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/10">
                    <LayoutDashboard className="h-4 w-4" /> DASHBOARD
                </Link>
                <Link href="/admin/packs" className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-all">
                    <Package className="h-4 w-4" /> COLLECTIONS
                </Link>
                <Link href="/admin/samples" className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-all">
                    <Music className="h-4 w-4" /> ARTIFACTS
                </Link>
                <Link href="/admin/customers" className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-all">
                    <Users className="h-4 w-4" /> CLIENTS
                </Link>
            </nav>
        </div>

        <div className="pt-10 border-t border-white/5">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div>
                    <div className="text-[10px] font-black uppercase text-white/40">Authorized Controller</div>
                    <div className="text-xs font-bold">{user?.email?.split('@')[0]}</div>
                </div>
             </div>
        </div>
      </aside>

      {/* 🚀 MAIN COMMAND CENTER */}
      <main className="flex-1 p-10 md:p-20 overflow-y-auto">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
                <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <div className="h-px w-8 bg-white/10" /> STABLE CONNECTION
                </div>
                <h1 className="text-6xl font-black uppercase tracking-tighter italic">Command Center</h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:invert transition-all">
                    <PlusCircle className="h-4 w-4" /> NEW ARTIFACT
                </button>
            </div>
        </header>

        {/* 📊 METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="p-10 border border-white/5 bg-white/[0.02] rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Package className="h-20 w-20" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 block italic">Collections</span>
                <div className="text-6xl font-black italic tracking-tighter mb-2">{packsCount || 0}</div>
                <div className="flex items-center gap-2 text-[#00FF00] text-[10px] font-bold">
                    <TrendingUp className="h-3 w-3" /> ACTIVE_SYNC
                </div>
            </div>

            <div className="p-10 border border-white/5 bg-white/[0.02] rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Music className="h-20 w-20" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 block italic">Samples</span>
                <div className="text-6xl font-black italic tracking-tighter mb-2">{samplesCount || 0}</div>
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    HQ Artifact Density
                </div>
            </div>

            <div className="p-10 border border-white/5 bg-white/[0.02] rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Users className="h-20 w-20" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 block italic">Revenue Events</span>
                <div className="text-6xl font-black italic tracking-tighter mb-2">{recentPurchases?.length || 0}</div>
                <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                    LATEST_STREAM_ACTIVE
                </div>
            </div>
        </div>

        {/* 📑 RECENT OPERATIONS */}
        <div className="border border-white/10 rounded-[3rem] overflow-hidden bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
            <div className="px-12 py-8 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Authorized Acquisitions</h2>
                <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.4em] italic">[ Realtime_Transmission ]</span>
            </div>
            
            <div className="divide-y divide-white/5">
                {recentPurchases?.map((purchase: any) => (
                    <div key={purchase.id} className="p-10 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                        <div className="flex items-center gap-8">
                             <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-white/20">
                                <ArrowUpRight className="h-5 w-5 text-white/20 group-hover:text-white group-hover:scale-110 transition-all" />
                             </div>
                             <div>
                                <div className="text-lg font-bold italic tracking-tighter">{purchase.item_name}</div>
                                <div className="text-[10px] font-black uppercase text-white/20 mt-1 tracking-widest leading-none">
                                    CLIENT_IDENT: {purchase.profiles?.full_name || 'ANONYMOUS_ARTIFACT'}
                                </div>
                             </div>
                        </div>
                        <div className="text-right">
                             <div className="text-xl font-black italic tracking-tighter text-[#00FF00]">+{purchase.amount_total > 0 ? `₹${purchase.amount_total}` : 'REDEEMED'}</div>
                             <div className="text-[9px] font-black uppercase text-white/10 mt-1 tracking-widest">
                                {new Date(purchase.created_at).toLocaleTimeString()}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>
    </div>
  )
}
