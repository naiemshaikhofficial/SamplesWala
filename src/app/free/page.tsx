
import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFilteredSamples } from '@/app/browse/actions'
import Link from 'next/link'
import { Gift, Zap, ArrowRight, Music, Download } from 'lucide-react'
import { SampleList } from '@/components/audio/SampleList'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Free Samples & Loops Download | 100% Royalty Free | SamplesWala',
  description: 'Download 100% free music samples, loops, and drum kits. Premium quality royalty-free sounds for Trap, EDM, and Lo-Fi. No credit card required.',
  keywords: ['free samples', 'free loops', 'free drum kits', 'fl studio free samples', 'royalty free free loops'],
}

export default async function FreeSamplesPage() {
  const adminClient = getAdminClient()
  
  // Fetch samples with 0 credit cost
  const { data: freeSamples } = await adminClient
    .from('samples')
    .select('*, sample_packs(name, cover_url)')
    .eq('credit_cost', 0)
    .limit(20)

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-12 min-h-screen font-mono text-white">
      <Breadcrumbs 
        items={[
          { label: 'BROWSE', href: '/browse' },
          { label: 'FREE_SAMPLES', href: '/free', active: true }
        ]} 
      />

      <header className="mb-24 mt-12 relative overflow-hidden p-12 bg-studio-charcoal border-4 border-studio-yellow shadow-[0_0_50px_rgba(234,179,8,0.1)]">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Gift size={300} className="text-studio-yellow" />
        </div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1 bg-black border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-studio-yellow italic flex items-center gap-2">
                    <Zap size={14} className="fill-studio-yellow" /> NO_COST_PROTOCOL :: FREE_ASSETS
                </span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none mb-8">
                FREE <span className="text-studio-yellow">SAMPLES</span>
            </h1>
            <p className="text-xl md:text-3xl text-white/60 max-w-3xl font-bold italic leading-tight">
                High-fidelity, pro-grade sounds at zero credit cost. Build your library with our curated selection of royalty-free freebies.
            </p>
        </div>
      </header>

      <section className="mb-32">
          <div className="flex items-center justify-between border-b-4 border-black pb-8 mb-12">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white/40">
                  <Music className="h-6 w-6 text-studio-yellow" /> Zero-Credit Inventory
              </h2>
          </div>

          {freeSamples && freeSamples.length > 0 ? (
              <SampleList 
                  samples={freeSamples} 
                  packName="Free Collection" 
                  coverUrl={null} 
              />
          ) : (
              <div className="py-40 border-4 border-dashed border-white/5 text-center bg-black/20">
                  <Gift size={64} className="mx-auto mb-8 text-white/10" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-white/20 italic">Scanning for free frequencies...</h3>
                  <p className="text-white/10 mt-4 uppercase text-[10px] tracking-widest">Check back soon for new free drops</p>
              </div>
          )}
      </section>

      {/* 🛡️ Trust Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
              { title: "Commercial Ready", desc: "Use these in your commercial tracks without paying royalties." },
              { title: "Instant Download", desc: "No credit cards, no surveys. Just one click to grab the WAV." },
              { title: "Studio Fidelity", desc: "Same 24-bit quality as our premium artifact packs." }
          ].map((item, i) => (
              <div key={i} className="p-8 border-2 border-white/5 bg-studio-grey/20 hover:border-studio-yellow/40 transition-all">
                  <h4 className="text-lg font-black uppercase tracking-widest text-studio-yellow mb-4 underline decoration-4 underline-offset-8 decoration-black">{item.title}</h4>
                  <p className="text-sm text-white/40 font-bold italic">{item.desc}</p>
              </div>
          ))}
      </section>

      <div className="py-24 border-t-4 border-black flex flex-col items-center">
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-12 text-center">
                Want More <span className="text-studio-neon">Premium</span> Power?
            </h3>
            <Link href="/browse" className="group flex items-center gap-6 px-12 py-6 bg-studio-neon text-black font-black uppercase tracking-[0.4em] italic hover:scale-105 transition-all">
                Explore Full Library <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
      </div>
    </div>
  )
}
