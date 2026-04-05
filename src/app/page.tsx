import { createClient } from '@/lib/supabase/server'
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Zap, Disc, Globe, Music, Share2, Search, Activity } from "lucide-react";
import { NewArrivals } from "@/components/home/NewArrivals";
import { HeroSearch } from "@/components/home/HeroSearch";
import { TopSounds } from "@/components/home/TopSounds";

export default async function Home() {
  const supabase = await createClient()
  
  // 📀 Fetch Latest Packs
  const { data: latestPacks } = await supabase
    .from('sample_packs')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    .limit(4)

  // 💿 Fetch Top Samples
  const { data: topSamples } = await supabase
    .from('samples')
    .select('*, sample_packs(name, cover_url, slug)')
    .limit(10)

  const { data: { user } } = await supabase.auth.getUser()
  let unlockedSampleIds: Set<string> = new Set()
  if (user) {
    const { data: unlocks } = await supabase.from('unlocked_samples').select('sample_id').eq('user_id', user.id)
    if (unlocks) {
      unlockedSampleIds = new Set(unlocks.map(u => u.sample_id))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* 🎰 THE FILM GRAIN OVERLAY */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay bw-grid"></div>
      
      {/* 🎰 THE MUMBAI SIDEBAR (Vertical Wala) */}
      <div className="fixed left-0 top-0 h-screen w-20 border-r border-white/10 hidden lg:flex flex-col items-center py-12 z-50 mix-blend-difference bg-black">
        <span className="[writing-mode:vertical-rl] text-[10px] font-black uppercase tracking-[0.6em] text-white/40 rotate-180 mb-20 whitespace-nowrap">
            SAMPLES WALA — मुम्बई — EST. 2024
        </span>
        <div className="mt-auto flex flex-col gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <Link href="#"><Globe className="h-4 w-4" /></Link>
            <Link href="#"><Music className="h-4 w-4" /></Link>
            <Link href="#"><Share2 className="h-4 w-4" /></Link>
        </div>
      </div>

      <div className="lg:pl-20">
        {/* 🏆 THE CINEMATIC HERO (A.R. Rahman Aesthetic) */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-20 relative overflow-hidden">
            <div className="absolute inset-0 z-0 grayscale pointer-events-none">
                <Image 
                    src="/indian_studio.png" 
                    alt="Mumbai Studio" 
                    fill 
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* 🌬️ DEVANAGARI MARQUEE */}
            <div className="absolute top-1/2 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.03] pointer-events-none z-0 -translate-y-1/2">
                <div className="text-[20rem] font-bold text-white uppercase inline-block animate-marquee italic">
                    सैंपल्स वाला सैंपल्स वाला सैंपल्स वाला सैंपल्स वाला
                </div>
            </div>

            <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-12 block">
                    MODERN HERITAGE / मुम्बई साउंड
                </span>
                
                <div className="relative mb-12 transform-gpu">
                     <h1 className="bw-text-giant leading-none tracking-tighter relative group hover:italic transition-all duration-700">
                        SAMPLES<br />WALA
                    </h1>
                </div>

                <p className="max-w-2xl text-xl md:text-3xl font-medium tracking-tight leading-snug mb-16 opacity-60">
                    Crafting the future of Indian music. Cinematic, high-contrast, and 
                    profoundly local. Premium sounds for the high-end producer.
                </p>
                
                <HeroSearch />

                <Link href="/browse" className="mt-16 group flex items-center gap-6 px-16 py-8 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all border border-white/10 shrink-0">
                    EXPLORE ALL COLLECTIONS <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
        </section>

        {/* 💿 NEW ARRIVALS (Parallax Section) */}
        <NewArrivals packs={latestPacks || []} />

        {/* 🎚️ TOP SINGULAR SOUNDS (Sound Rack) */}
        <TopSounds 
            samples={topSamples || []} 
            unlockedSampleIds={Array.from(unlockedSampleIds)}
        />

        {/* 💿 B&W FEATURED GRID (The Bollywood Vault) */}
        <section className="px-6 md:px-20 py-48 border-t border-white/10 bg-[#080808]">
            <div className="flex items-end justify-between mb-32">
                <div className="max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-8 block">नया संगीत</span>
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-4">THE<br />LEGACY</h2>
                </div>
                <Link href="/browse" className="mb-4 text-xs font-black uppercase tracking-widest border-b-2 border-white pb-4 hover:opacity-50 transition-all">
                    All Collections
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/10 border border-white/10 overflow-hidden">
                {[1,2,3,4].map((i) => (
                    <div key={i} className="group bg-black p-10 hover:bg-white transition-all cursor-pointer">
                        <div className="aspect-[4/5] bg-white/5 mb-10 relative overflow-hidden bw-stark-border group-hover:border-black/20 transition-all">
                            <div className="absolute inset-0 flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all">
                                <Disc className="h-24 w-24 text-white/5 group-hover:text-black/5" />
                                <span className="absolute top-4 right-4 text-[10px] font-black group-hover:text-black">ध्वनि {i}</span>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-16 group-hover:text-black leading-none">Bollywood<br />Artifact 0{i}</h3>
                        <div className="flex items-center justify-between group-hover:text-black pt-10 border-t border-white/10 group-hover:border-black/10">
                            <span className="text-xs font-black uppercase tracking-widest">₹1,499</span>
                            <Zap className="h-4 w-4" />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 🛡️ BRUTALIST STATUS BAR */}
        <div className="flex flex-col md:flex-row border-y border-white/10">
            <div className="flex-1 p-20 border-r border-white/10 hover:bg-white hover:text-black transition-colors group">
                <ShieldCheck className="h-12 w-12 mb-8" />
                <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">Certified Samples</h4>
                <p className="text-sm font-medium opacity-60 group-hover:opacity-100">Every Artifact is 100% royalty-free and production-ready.</p>
            </div>
            <div className="flex-1 p-20 hover:bg-white hover:text-black transition-colors group">
                <Disc className="h-12 w-12 mb-8" />
                <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">Global Access</h4>
                <p className="text-sm font-medium opacity-60 group-hover:opacity-100">Used by world-class producers from Mumbai to London.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
