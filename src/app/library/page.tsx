import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Disc, Music, Download, Play, Activity, ArrowLeft, Search } from 'lucide-react'
import { PlayButton } from '@/components/audio/PlayButton'
import { Waveform } from '@/components/audio/Waveform'
import { DownloadButton } from '@/components/audio/DownloadButton'

export default async function LibraryPage({ searchParams }: { searchParams: { q?: string; sort?: string } }) {
    const params = await (searchParams as any)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // 💿 Fetch All Unlocked Samples
    let query = supabase
        .from('unlocked_samples')
        .select(`
            sample_id,
            samples (
                *,
                sample_packs (
                    name,
                    cover_url
                )
            )
        `)
        .eq('user_id', user.id)

    const { data: unlockedData } = await query

    let samples = unlockedData?.map(item => item.samples).filter(Boolean) || []

    // 🕵️‍♂️ CLIENT-SIDE FILTERING (Since it's a personal archive)
    if (params.q) {
        const term = params.q.toLowerCase()
        samples = samples.filter((s: any) => 
            s.name?.toLowerCase().includes(term) || 
            s.sample_packs?.name?.toLowerCase().includes(term)
        )
    }

    // 🎚️ SORTING LOGIC
    if (params.sort === 'name') {
        samples.sort((a: any, b: any) => a.name.localeCompare(b.name))
    } else if (params.sort === 'bpm') {
        samples.sort((a: any, b: any) => (b.bpm || 0) - (a.bpm || 0))
    } else {
        // Default to newest (based on ID or created_at if available)
        samples.reverse() 
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black lg:pl-20">
            {/* 🎰 THE LIBRARY HEADER */}
            <header className="border-b border-white/10 px-6 md:px-20 py-16 bg-black">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="max-w-2xl">
                        <Link href="/browse" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white mb-8 flex items-center gap-2 group transition-all">
                            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                            Return to The Vault
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 block">Personal Archive</span>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 italic">My Sounds</h1>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                             Artifact count: {samples.length} — {params.q ? `Filter active: "${params.q}"` : 'Global Collection'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full max-w-sm">
                         <form action="/library" className="relative group w-full">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-all" />
                            <input 
                                name="q"
                                defaultValue={params.q}
                                placeholder="QUERY ARCHIVE..." 
                                className="w-full bg-transparent border-b border-white/20 h-12 text-sm font-black uppercase tracking-widest focus:border-white transition-all outline-none"
                            />
                        </form>
                        <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-white/20">
                            <span className="text-white/10">Sort by:</span>
                            <Link href="/library" className={!params.sort ? 'text-white' : 'hover:text-white'}>Newest</Link>
                            <Link href="/library?sort=name" className={params.sort === 'name' ? 'text-white' : 'hover:text-white'}>A-Z</Link>
                            <Link href="/library?sort=bpm" className={params.sort === 'bpm' ? 'text-white' : 'hover:text-white'}>BPM</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="bg-[#050505] min-h-[60vh]">
                {samples.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {samples.map((sample: any) => (
                            <div key={sample.id} className="group grid grid-cols-12 gap-8 px-6 md:px-20 py-12 items-center hover:bg-white transition-all">
                                <div className="col-span-1">
                                    <PlayButton 
                                        id={sample.id} 
                                        url={sample.audio_url} 
                                        name={sample.name}
                                        packName={sample.sample_packs?.name}
                                        coverUrl={sample.sample_packs?.cover_url}
                                    />
                                </div>
                                <div className="col-span-4 translate-x-4">
                                     <div className="font-black text-2xl tracking-tighter uppercase group-hover:text-black transition-all truncate leading-none">
                                        {sample.name}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-2 group-hover:text-black/40">
                                        {sample.sample_packs?.name}
                                    </div>
                                </div>
                                <div className="hidden md:col-span-2 md:flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest group-hover:text-black">
                                    <span>{sample.bpm || '--'} BPM</span>
                                    <span className="opacity-40">{sample.key || '--'}</span>
                                </div>
                                <div className="col-span-4 md:col-span-3 px-6">
                                     <div className="h-10 flex items-center justify-center group-hover:invert transition-all">
                                        <Waveform id={sample.id} active={true} />
                                    </div>
                                </div>
                                <div className="col-span-1 text-right">
                                    <DownloadButton 
                                        sampleId={sample.id} 
                                        isUnlockedInitial={true} 
                                        creditCost={sample.credit_cost}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-white/10 grayscale">
                        <Music className="h-32 w-32 mb-8 animate-pulse" />
                        <p className="text-xl font-black uppercase tracking-widest italic">No Secured Artifacts</p>
                        <Link href="/browse" className="mt-8 px-12 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:invert transition-all">Explore The Vault</Link>
                    </div>
                )}
            </main>

            {/* 🌬️ DEVANAGARI MARQUEE */}
            <div className="py-24 overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none border-t border-white/5 bg-black">
                <div className="text-[10rem] font-bold text-white uppercase inline-block animate-marquee italic">
                    मेरा संग्रह मेरा संग्रह मेरा संग्रह मेरा संग्रह मेरा संग्रह
                </div>
            </div>
        </div>
    )
}
