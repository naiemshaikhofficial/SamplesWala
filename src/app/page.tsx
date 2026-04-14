import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from "next/link";
import { 
  ShieldCheck, Activity, Zap, AudioLines, ArrowRight,
  Database, Cpu, Globe, BarChart3
} from "lucide-react";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FreshSounds } from "@/components/home/FreshSounds";
import { TopSounds } from "@/components/home/TopSounds";
import { AdaptiveHero } from "@/components/home/AdaptiveHero";
import { SoftwareSpotlight } from "@/components/home/SoftwareSpotlight";
import { getTopPopularSounds } from "@/lib/supabase/admin";
import { FAQSection } from "@/components/seo/FAQSection";
import { Suspense } from 'react'

export const revalidate = 3600;

export const metadata = {
  title: 'Samples Wala - Pro Global & Indian Sample Packs [Splice Alternative]',
  description: 'The elite destination for high-quality Global & Indian samples. 100% royalty-free Trap, Drill, Hip-Hop, and Bollywood loops. Industry-standard WAV sounds for producers worldwide on FL Studio & Ableton.',
  keywords: [
    'sample packs', 'trap samples', 'drill loops', 'hip hop sounds', 'edm samples',
    'indian samples', 'bollywood sample packs', 'royalty free loops', 
    'wav samples', 'music production', 'fl studio packs', 'sampleswala', 
    'splice alternative', 'looperman alternative', 'cymatics style loops', 'landr samples'
  ],
  alternates: {
    canonical: 'https://sampleswala.com'
  }
}

// 🧬 NUCLEAR_SEO: Home Page Identity Payloads
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SamplesWala",
  "url": "https://sampleswala.com",
  "logo": "https://imagizer.imageshack.com/img924/3983/vzoEZd.png",
  "sameAs": [
    "https://youtube.com/@SamplesWala"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@sampleswala.com",
    "contactType": "customer support"
  }
}

const searchboxSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://sampleswala.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://sampleswala.com/browse?query={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}

async function NewArrivalsSection() {
  const adminClient = getAdminClient()
  let { data: latestPacks } = await adminClient
    .from('sample_packs')
    .select('id, name, slug, price_inr, cover_url, categories(name), samples(bpm, key)')
    .order('created_at', { ascending: false })
    .limit(12)

  // Fallback check
  if (!latestPacks || latestPacks.length === 0) {
    const { data: fallbackScan } = await adminClient
      .from('sample_packs')
      .select('id, name, slug, price_inr, cover_url, samples(bpm, key)')
      .order('created_at', { ascending: false })
      .limit(12)
    latestPacks = fallbackScan as any;
  }

  return <NewArrivals packs={latestPacks || []} />
}

async function FreshSoundsSection() {
  const adminClient = getAdminClient()
  let { data: freshSounds } = await adminClient
    .from('samples')
    .select('id, name, audio_url, bpm, key, credit_cost, sample_packs(name, slug, cover_url)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!freshSounds || freshSounds.length === 0) {
    const { data: rawFresh } = await adminClient.from('samples').select('*').order('created_at', { ascending: false }).limit(12)
    freshSounds = rawFresh as any;
  }

  return <FreshSounds samples={freshSounds || []} />
}

async function TopChartsSection() {
  const topSamples = await getTopPopularSounds(20)
  return <TopSounds samples={topSamples || []} />
}

async function SoftwareSection() {
  const adminClient = getAdminClient()
  const { data: products } = await adminClient
    .from('software_products')
    .select('id, name, slug, description, price_inr, cover_url, current_version')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(2)

  return <SoftwareSpotlight products={products || []} />
}

export default function Home() {

  return (
    <main className="min-h-screen bg-black text-white selection:bg-studio-neon selection:text-black overflow-x-hidden font-mono relative w-full overflow-y-auto custom-scrollbar">
        {/* 🧬 NUCLEAR_SEO: Brand & Search Payloads */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchboxSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Why is SamplesWala a better Splice alternative for Indian music?",
                "acceptedAnswer": { "@type": "Answer", "text": "SamplesWala focuses specifically on authentic Indian sounds and Bollywood style samples that global platforms like Splice often lack. All our sounds are 100% royalty-free and curated by veteran Indian producers." }
              },
              {
                "@type": "Question",
                "name": "Does SamplesWala offer free loops like LooperMan?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, SamplesWala has a dedicated free sounds section. While sites like LooperMan are community-driven, SamplesWala offers studio-quality, professionally mastered samples that are ready for commercial hits." }
              }
            ]
          }) }}
        />
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 footer-grid hidden md:block" />
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-black/20 to-black h-full w-full" />

        <div className="relative z-10">
          <Suspense fallback={null}>
              <AdaptiveHero />
          </Suspense>
        </div>

        {/* ⚡ SIGNAL FLOW: NEW ARRIVALS */}
        <section className="relative z-20 border-y-4 border-white/5 bg-studio-charcoal">
            <div className="px-4 md:px-20 py-16 md:py-24 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-10 md:mb-16">
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-studio-neon animate-pulse" />
                        <div className="w-2.5 h-2.5 rounded-full bg-studio-neon/20" />
                    </div>
                    <span className="text-[11px] md:text-sm font-black uppercase tracking-[0.4em] text-studio-neon">NEW RELEASES</span>
                </div>
                
                <Suspense fallback={null}>
                    <NewArrivalsSection />
                </Suspense>
            </div>
        </section>

        {/* 🧬 GENRE_MATRIX: GLOBAL_SIGNAL_BROADCAST */}
        <section className="relative z-20 py-20 bg-black border-b-4 border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-20">
                <div className="flex items-center justify-between mb-16 px-4 border-l-4 border-studio-neon">
                   <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Browse By Genre</h2>
                   <Link href="/browse" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-studio-neon transition-colors">See All</Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                    {[
                        { name: 'Hard Trap', color: 'bg-spider-red', slug: 'trap' },
                        { name: 'UK / NY Drill', color: 'bg-studio-grey', slug: 'drill' },
                        { name: 'Indian Fusion', color: 'bg-orange-500', slug: 'indian' },
                        { name: 'Hip-Hop / Boombap', color: 'bg-studio-yellow', slug: 'hip-hop' },
                        { name: 'Tech House', color: 'bg-studio-neon', slug: 'techno' },
                        { name: 'Afrobeat', color: 'bg-green-500', slug: 'afrobeat' },
                        { name: 'Astro-Pop', color: 'bg-purple-500', slug: 'pop' },
                        { name: 'Phonk', color: 'bg-pink-600', slug: 'phonk' }
                    ].map((genre) => (
                        <Link 
                            key={genre.name} 
                            href={`/browse?category=${genre.slug}`}
                            className="group relative h-32 md:h-48 overflow-hidden border-2 border-white/5 hover:border-white/20 transition-all studio-panel"
                        >
                            <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity ${genre.color}`} />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-8xl font-black absolute top-0 -left-4 text-white/[0.03] italic group-hover:text-white/[0.05] transition-all">
                                    {genre.name.split(' ')[0]}
                                </span>
                                <h3 className="text-sm md:text-xl font-black uppercase tracking-tighter italic z-10">{genre.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* 📡 LIVE CHANNEL RACK: FRESH SOUNDS */}
        <section id="fresh-sounds" className="relative z-20 py-20 md:py-32 bg-black border-b-4 border-white/5">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={null}>
                <FreshSoundsSection />
              </Suspense>
            </div>
        </section>

        {/* 🛠️ SOFTWARE SPOTLIGHT */}
        <Suspense fallback={null}>
            <SoftwareSection />
        </Suspense>

        {/* 🎚️ MIXER MATRIX (FX RACK) - FORCED ROW ON MOBILE */}
        <section className="relative z-20 border-b-4 border-white/5 bg-studio-charcoal overflow-hidden">
            <div className="grid grid-cols-3 divide-x-2 md:divide-x-4 divide-black">
                {/* EQ MODULE */}
                <div className="p-3 md:p-12 group">
                    <div className="flex items-center gap-2 mb-4 md:mb-12">
                        <BarChart3 className="w-3 h-3 md:w-5 md:h-5 text-studio-neon" />
                        <h3 className="text-[6px] md:text-xs font-black uppercase tracking-widest hidden xs:block">EQUALIZER</h3>
                    </div>
                    
                    <div className="space-y-2 md:space-y-6">
                        {[85, 40, 65, 90, 30].map((val, i) => (
                            <div key={i} className="space-y-1">
                                <div className="h-3 md:h-2 bg-black border border-white/5 relative overflow-hidden">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-studio-neon/70 group-hover:bg-studio-neon transition-all duration-500" 
                                        style={{ width: `${val}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMPRESSOR MODULE */}
                <div className="p-3 md:p-12 md:bg-black/10 flex flex-col items-center group">
                    <div className="w-full flex items-center gap-2 mb-4 md:mb-12">
                        <Zap className="w-3 h-3 md:w-5 md:h-5 text-studio-yellow" />
                        <h3 className="text-[6px] md:text-xs font-black uppercase tracking-widest hidden xs:block">DYNAMICS</h3>
                    </div>
                    
                    <div className="relative w-12 h-12 md:w-64 md:h-64 rounded-full border-2 md:border-8 border-black shadow-2xl flex items-center justify-center bg-[#181818]">
                        <div className="absolute inset-1 border border-white/5 rounded-full" />
                        <div className="w-0.5 md:w-2 h-6 md:h-32 bg-gradient-to-t from-transparent via-spider-red to-spider-red origin-bottom -rotate-45 transform transition-transform group-hover:rotate-[150deg] duration-[2s]" />
                    </div>
                </div>

                {/* LIMITER MODULE */}
                <div className="p-3 md:p-12 hover:bg-black/10 transition-colors group">
                    <div className="flex items-center justify-between mb-4 md:mb-12">
                        <div className="flex items-center gap-2">
                            <AudioLines className="w-3 h-3 md:w-5 md:h-5 text-spider-red" />
                            <h3 className="text-[6px] md:text-xs font-black uppercase tracking-widest hidden xs:block">VOLUME LIMITER</h3>
                        </div>
                    </div>
                    
                    <div className="h-12 md:h-48 border border-black bg-black flex items-end gap-[1px] md:gap-1 p-1 md:p-4 overflow-hidden relative">
                        {[...Array(8)].map((_, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-spider-red/40 group-hover:bg-spider-red transition-all" 
                                style={{ 
                                    height: `${30 + Math.random() * 70}%`
                                }} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* 🏆 TOP CHARTS */}
        <section className="relative z-20 py-20 md:py-32 bg-black border-b-4 border-white/5">
            <div className="absolute top-20 left-10 text-[6rem] md:text-[12rem] font-black text-white/[0.03] pointer-events-none italic uppercase">
                Trending
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-20 relative">
                <Suspense fallback={null}>
                  <TopChartsSection />
                </Suspense>
            </div>
        </section>

        {/* 🛡️ PRO STATUS */}
        <section className="relative z-20 grid grid-cols-1 md:grid-cols-2 bg-studio-charcoal">
            <div className="p-12 md:p-24 border-b-4 md:border-b-0 md:border-r-4 border-black hover:bg-studio-neon hover:text-black transition-all group overflow-hidden cursor-pointer">
                <ShieldCheck className="h-12 w-12 md:h-20 md:w-20 mb-8 text-studio-neon group-hover:text-black transition-colors" />
                <h4 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic mb-8 group-hover:text-black">Royalty<br/>Free</h4>
                <p className="text-lg md:text-2xl font-bold opacity-40 group-hover:opacity-100 max-w-sm">Every sound from our cloud is 100% royalty-free for commercial use.</p>
            </div>
            <div className="p-12 md:p-24 hover:bg-studio-yellow hover:text-black transition-all group overflow-hidden cursor-pointer">
                <Globe className="h-12 w-12 md:h-20 md:w-20 mb-8 text-studio-yellow group-hover:text-black transition-colors" />
                <h4 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic mb-8 group-hover:text-black">Studio<br/>Grade</h4>
                <p className="text-lg md:text-2xl font-bold opacity-40 group-hover:opacity-100 max-w-sm">The digital gold standard used by world-class music producers.</p>
            </div>
        </section>

        {/* ❓ FAQ_PROTOCOL: DEEP_SEARCH_REAL_ESTATE */}
        <FAQSection 
            items={[
                { 
                    q: "Are these samples royalty-free?", 
                    a: "Yes, 100%. Every pack and individual sound on SamplesWala is cleared for commercial use. You can use them in your tracks and sell them on Spotify, Apple Music, and more without any legal issues." 
                },
                { 
                    q: "What format are the sounds in?", 
                    a: "All sounds are delivered in high-fidelity 24-bit WAV format, ensuring compatibility with FL Studio, Ableton Live, Logic Pro, and all major DAWs." 
                },
                { 
                    q: "How do I download my purchases?", 
                    a: "Once you unlock a sample or pack, it appears instantly in your Library. You can download them directly as ZIP files or individual WAVs." 
                },
                {
                    q: "Can I use these for Type Beats on YouTube?",
                    a: "Absolutely. Our licenses cover everything from YouTube videos to major label releases. No attribution required, though it is appreciated."
                },
                {
                    q: "Do you offer sound design for specific genres?",
                    a: "Yes, we specialize in Trap, Drill, EDM, Lo-Fi, and Hip-Hop. Our sound designers are industry veterans who have worked on top-charting records."
                }
            ]}
        />

        {/* 📟 STATUS FOOTER */}
        <footer className="relative z-20 pt-20 pb-32 md:py-16 px-6 bg-black border-t-8 border-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex gap-10 items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-studio-neon animate-pulse" />
                            <span className="text-xs font-bold text-studio-neon">ALL SYSTEMS OPERATIONAL</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/license" className="hover:text-white transition-colors">License</Link>
                </div>
            </div>
        </footer>

    </main>
  );
}
