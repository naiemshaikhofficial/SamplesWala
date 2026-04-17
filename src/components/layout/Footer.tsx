
'use client'

import { 
  Activity, Cpu, Headphones, Zap, 
  Terminal, ShieldCheck, Wifi, Layers, 
  HelpCircle, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TrustpilotWidget } from '../trustpilot/TrustpilotWidget'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block w-full bg-[#050505] border-t border-white/10 relative overflow-hidden font-mono z-30 select-none">
      
      {/* 🚀 DEEP_LINK_SEO_SILO (Sitemap Injection) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 p-8 md:p-16 border-b border-white/5 bg-black/20">
          <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon">Top Genres</h4>
              <nav className="flex flex-col gap-4">
                  {['Trap', 'Drill', 'Lo-Fi', 'EDM', 'Hip-Hop'].map(g => (
                      <Link key={g} href={`/sounds/genres/${g.toLowerCase()}`} className="text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">
                          {g} Samples
                      </Link>
                  ))}
              </nav>
          </div>
          <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-yellow">Free Assets</h4>
              <nav className="flex flex-col gap-4">
                  {['Drum Kits', 'Piano Loops', 'Vocals', '808s', 'Melodies'].map(f => (
                      <Link key={f} href="/free" className="text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">
                          Free {f}
                      </Link>
                  ))}
              </nav>
          </div>
          <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Production Tools</h4>
              <nav className="flex flex-col gap-4">
                  <Link href="/software" className="text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">Visualizer Studio</Link>
                  <Link href="/browse?filter=presets" className="text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">Serum Presets</Link>
                  <Link href="/browse?filter=bundles" className="text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">Sample Bundles</Link>
                  <Link href="/faq" className="text-[11px] font-bold text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">Usage Licensing</Link>
              </nav>
          </div>
          <div className="p-8 bg-studio-neon/5 border border-white/5 flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-widest leading-loose text-white/40 italic">
                  Samples Wala is the industry gold standard for <span className="text-white">Music Production Tools</span> and <span className="text-white">Royalty-Free Samples</span>. Dominate your DAW with precision-engineered sounds and cinematic software.
              </p>
          </div>
      </div>

      {/* ⭐ Trustpilot Review Collector */}
      <TrustpilotWidget />

      {/* 🧬 PRIMARY_DAW_CONSOLE_BAR */}
      <div className="flex flex-col md:flex-row items-stretch border-b border-white/5 bg-black/40">
        
        {/* CONSOLE_LOGOTYPE */}
        <div className="p-4 px-8 border-r border-white/5 flex items-center gap-6 bg-white/[0.01]">
            <Link href="/" className="group shrink-0">
                <Image 
                    src="/Logo.png" 
                    alt="Logo" 
                    width={100} 
                    height={30} 
                    className="h-6 w-auto object-contain brightness-90 group-hover:brightness-125 transition-all"
                />
            </Link>
            <div className="flex items-center gap-2 text-[7px] font-black uppercase text-white/10 italic tracking-widest pl-2 border-l border-white/5">
                <div className="h-1 w-1 bg-studio-neon rounded-full animate-pulse" /> SYSTEMS READY
            </div>
        </div>

        {/* HIGH_FIDELITY_SWITCHBOARD (Simple Website Labels) */}
        <div className="flex-1 flex overflow-x-auto no-scrollbar divide-x divide-white/5">
            {[
                { name: 'SOUNDS', href: '/browse' },
                { name: 'PACKS', href: '/browse' },
                { name: 'PRICING', href: '/subscription' },
                { name: 'LIBRARY', href: '/library' },
                { name: 'ACCOUNT', href: '/settings' },
                { name: 'HELP', href: '/faq' }
            ].map((link, i) => (
                <Link key={i} href={link.href} className="flex px-10 py-5 items-center justify-center whitespace-nowrap text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-studio-neon hover:bg-white/[0.02] active:bg-studio-neon/10 transition-all italic border-white/5 group">
                    {link.name} <ChevronRight size={10} className="ml-2 opacity-0 group-hover:opacity-30 group-hover:translate-x-1 transition-all" />
                </Link>
            ))}
        </div>

        {/* STUDIO STATS */}
        <div className="hidden lg:flex items-center px-10 gap-10 bg-white/[0.01] border-l border-white/5">
            <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black text-white/10 uppercase tracking-widest italic">SAMPLE QUALITY</span>
                <span className="text-[9px] font-black text-studio-neon uppercase italic tracking-[0.2em]">48.0k - 24BIT</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black text-white/10 uppercase tracking-widest italic">VERSION</span>
                <span className="text-[9px] font-black text-white/30 uppercase italic tracking-[0.2em]">V17.70.3</span>
            </div>
        </div>

      </div>

      {/* 🦾 STATUS_MONITOR_LINE */}
      <div className="px-8 py-3 bg-black/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/10 tracking-[0.4em] italic">
            © {currentYear} Samples Wala // PRO_PRODUCER_CONSOLE
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[8px] font-black uppercase text-white/10 italic tracking-widest">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/2 border border-white/5 rounded-xs">
                    <Headphones size={10} className="text-studio-neon" /> STUDIO SYNC
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-studio-neon/5 text-studio-neon rounded-xs border border-studio-neon/10 active_glow animate-pulse">
                    <Wifi size={10} /> ENGINE: SYNCHRONIZED
                </div>
            </div>
        </div>
      </div>
    </footer>
  )
}
