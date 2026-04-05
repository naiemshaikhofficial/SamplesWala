import { createClient } from '@/lib/supabase/server'
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Zap, Disc, Globe, Music, Share2, Search, Activity } from "lucide-react";
import { NewArrivals } from "@/components/home/NewArrivals";
import { TopSounds } from "@/components/home/TopSounds";
import { AdaptiveHero } from "@/components/home/AdaptiveHero";
import { getTopPopularSounds } from "@/lib/supabase/admin";

export default async function Home() {
  const supabase = await createClient()
  
  // 📀 Fetch Latest Packs
  const { data: latestPacks } = await supabase
    .from('sample_packs')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    .limit(4)

  // 💿 AUTOMATIC POPULARITY ENGINE (No Manual SQL Needed)
  const topSamples = await getTopPopularSounds(10)

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
        {/* 🏆 THE ADAPTIVE HERO (Vibe-Powered) */}
        <AdaptiveHero />

        {/* 💿 NEW ARRIVALS (Parallax Section) */}
        <NewArrivals packs={latestPacks || []} />

        {/* 🎚️ TOP SINGULAR SOUNDS (Sound Rack) */}
        <TopSounds 
            samples={topSamples || []} 
            unlockedSampleIds={Array.from(unlockedSampleIds)}
        />


        {/* 🛡️ BRUTALIST STATUS BAR */}
        <div className="flex flex-col md:flex-row border-y border-white/10">
            <div className="flex-1 p-8 md:p-20 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white hover:text-black transition-colors group text-center md:text-left">
                <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 mb-6 md:mb-8 mx-auto md:mx-0" />
                <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4">Certified Samples</h4>
                <p className="text-sm font-medium opacity-60 group-hover:opacity-100 px-4 md:px-0">Every Artifact is 100% royalty-free and production-ready.</p>
            </div>
            <div className="flex-1 p-8 md:p-20 hover:bg-white hover:text-black transition-colors group text-center md:text-left">
                <Disc className="h-10 w-10 md:h-12 md:w-12 mb-6 md:mb-8 mx-auto md:mx-0" />
                <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4">Global Access</h4>
                <p className="text-sm font-medium opacity-60 group-hover:opacity-100 px-4 md:px-0">Used by world-class producers from Mumbai to London.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
