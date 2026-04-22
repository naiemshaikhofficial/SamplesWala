
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Play, Download, Music, Waves, ArrowLeft, Disc, Zap, Activity, 
  Sparkles, Layers, ShieldCheck, Share2 
} from 'lucide-react'
import { PlayButton } from '@/components/audio/PlayButton'
import { DownloadButton } from '@/components/audio/DownloadButton'
import { Waveform } from '@/components/audio/Waveform'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'
import { getVibeSuggestions } from '@/app/api/vibe/actions'
import { SampleList } from '@/components/audio/SampleList'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'

export const revalidate = 86400; // ⚡ CACHE: 24 HOURS (Static Sound Metadata)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const adminClient = getAdminClient()
    
    const { data: sample } = await adminClient
        .from('samples')
        .select('name, bpm, key, ai_genre, type, sample_packs(name)')
        .eq('id', id)
        .single()
    
    if (!sample) return { title: 'Sound Not Found | Samples Wala' }

    const packName = sample.sample_packs?.name || 'Studio Pack'
    const title = `${sample.name} | ${sample.bpm ? sample.bpm + ' BPM ' : ''}${sample.key ? sample.key : ''} ${sample.ai_genre} ${sample.type} | Samples Wala`
    const description = `Download the professional "${sample.name}" sound from ${packName}. High-quality 24-bit WAV, 100% royalty-free ${sample.ai_genre} ${sample.type} for music production. Preview now at Samples Wala.`

    return {
        title,
        description,
        keywords: [
            sample.name,
            `${sample.ai_genre} samples`,
            `${sample.type} sounds`,
            `${sample.bpm || ''} bpm`,
            `${sample.key || ''} key`,
            packName,
            'royalty free loops',
            'wav audio samples',
            'Indian music samples',
            'Bollywood sounds'
        ],
        openGraph: {
            title,
            description,
            type: 'music.song',
            url: `https://sampleswala.com/samples/${id}`,
            images: [
                { url: sample.sample_packs?.cover_url || '/og-image.jpg', width: 800, height: 800, alt: sample.name }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [sample.sample_packs?.cover_url || '/og-image.jpg']
        },
        alternates: {
            canonical: `https://sampleswala.com/samples/${id}`
        }
    }
}

export default async function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const adminClient = getAdminClient()

    // 🛰️ ARTIFACT_ACQUISITION
    const { data: sample } = await adminClient
        .from('samples')
        .select('*, sample_packs(name, slug, cover_url)')
        .eq('id', id)
        .single()

    if (!sample) notFound()

    // 🧬 SIGNAL_SYNTHESIS :: SECURE_PLAYBACK_BYPASS
    const driveId = getDriveFileId(sample.audio_url);
    const audioSignal = driveId ? generateAudioSignal(driveId, sample.name) : null;

    // 🧬 VIBE_SYNC: Get related sounds
    const rawRelated = await getVibeSuggestions(id, 8)
    
    // Inject signals into related sounds for batch optimization
    const relatedSounds = rawRelated.map((s: any) => ({
        ...s,
        signal: generateAudioSignal(getDriveFileId(s.audio_url), s.name)
    }))

    return (
        <div className="min-h-screen bg-studio-charcoal text-white pt-24 pb-32 relative overflow-hidden font-mono">
            {/* 📝 MUSIC_RECORDING_SCHEMA (JSON-LD) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MusicRecording",
                        "name": sample.name,
                        "duration": "PT0M10S",
                        "url": `https://sampleswala.com/samples/${id}`,
                        "image": sample.sample_packs?.cover_url,
                        "description": `${sample.name} - ${sample.bpm} BPM ${sample.key} ${sample.type} sound from the ${sample.sample_packs?.name} pack.`,
                        "genre": sample.ai_genre,
                        "inAlbum": {
                            "@type": "MusicAlbum",
                            "name": sample.sample_packs?.name
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "INR",
                            "availability": "https://schema.org/InStock",
                            "url": `https://sampleswala.com/samples/${id}`
                        }
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sampleswala.com/" },
                            { "@type": "ListItem", "position": 2, "name": "Browse", "item": "https://sampleswala.com/browse" },
                            { "@type": "ListItem", "position": 3, "name": (sample.sample_packs?.name || 'Pack').toUpperCase(), "item": `https://sampleswala.com/packs/${sample.sample_packs?.slug}` },
                            { "@type": "ListItem", "position": 4, "name": sample.name, "item": `https://sampleswala.com/samples/${id}` }
                        ]
                    })
                }}
            />
            <MasterLight />
            <ScanlineOverlay />

            <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                
                {/* 🧭 NAVIGATION */}
                <div className="mb-12">
                    <Breadcrumbs 
                        items={[
                            { label: 'BROWSE', href: '/browse' },
                            { label: (sample.sample_packs?.name || 'PACK').toUpperCase(), href: `/packs/${sample.sample_packs?.slug}` },
                            { label: sample.name.toUpperCase(), href: `/samples/${id}`, active: true }
                        ]} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    
                    {/* ⬅️ ARTIFACT_VISUAL (Left) */}
                    <div className="lg:col-span-5">
                        <div className="relative aspect-square bg-black border-4 border-black group overflow-hidden shadow-2xl">
                             <img 
                                src={sample.sample_packs?.cover_url || '/placeholder.jpg'} 
                                alt={sample.name} 
                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-700" 
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            
                            {/* Central Play Trigger */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <PlayButton 
                                    id={id}
                                    url={sample.audio_url}
                                    name={sample.name}
                                    packName={sample.sample_packs?.name}
                                    coverUrl={sample.sample_packs?.cover_url}
                                    bpm={sample.bpm}
                                    audioKey={sample.key}
                                    isUnlocked={false} // Will be checked in client
                                    creditCost={sample.credit_cost}
                                    signal={audioSignal}
                                    size="xl"
                                />
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon">Studio Sound</p>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{sample.name}</h2>
                                </div>
                                <div className="p-3 bg-black border border-white/10 text-studio-neon">
                                    <Waves size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ➡️ ARTIFACT_DATA (Right) */}
                    <div className="lg:col-span-7 flex flex-col gap-12">
                        
                        <div>
                            <div className="flex gap-3 mb-6">
                                <span className="px-3 py-1 bg-studio-neon/10 border border-studio-neon/20 text-studio-neon text-[8px] font-black uppercase tracking-[0.2em]">{sample.type}</span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-[8px] font-black uppercase tracking-[0.2em]">High Fidelity</span>
                            </div>
                            <h1 className="text-6xl lg:text-[7rem] font-black uppercase italic tracking-tighter text-white leading-[0.8] mb-8">
                                {sample.name}
                            </h1>
                            <p className="text-lg text-white/40 font-medium leading-relaxed max-w-xl italic">
                                Professional grade {sample.ai_genre || 'music'} {sample.type} sound. optimized for high-performance studio environments. Compatible with all major DAWs.
                            </p>
                        </div>

                        {/* Stats Matrix */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-black border border-white/5 space-y-1">
                                <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">BPM</span>
                                <p className="text-xl font-black text-white italic">{sample.bpm || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-black border border-white/5 space-y-1">
                                <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">KEY</span>
                                <p className="text-xl font-black text-white italic">{sample.key || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-black border border-white/5 space-y-1">
                                <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">COST</span>
                                <p className="text-xl font-black text-studio-neon italic">{sample.credit_cost} CR</p>
                            </div>
                            <div className="p-4 bg-black border border-white/5 space-y-1">
                                <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">FORMAT</span>
                                <p className="text-xl font-black text-white italic">WAV</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                            <DownloadButton 
                                sampleId={id}
                                creditCost={sample.credit_cost}
                                variant="neon"
                            />
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `${sample.name} Sample`,
                                            text: `Check out this ${sample.bpm} BPM ${sample.key} ${sample.type} on Samples Wala!`,
                                            url: window.location.href
                                        }).catch(() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Link copied to clipboard!");
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied to clipboard!");
                                    }
                                }}
                                className="h-14 w-14 flex items-center justify-center bg-black border border-white/5 text-white/40 hover:text-studio-neon transition-all"
                                title="Share Artifact"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* 🌀 RELATED_SIGNALS (Vibe Matching) */}
                <div className="mt-40">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="h-px flex-1 bg-white/5" />
                        <h2 className="text-2xl font-black uppercase italic tracking-[0.3em] text-white/20">More Like This</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <SampleList 
                        samples={relatedSounds} 
                        packName="Related Sounds"
                    />
                </div>

            </div>
        </div>
    )
}
