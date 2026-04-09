
'use client'

import { 
  Activity, Cpu, Headphones, Zap, 
  Terminal, ShieldCheck, Wifi, Layers, 
  HelpCircle, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block w-full bg-[#050505] border-t border-white/10 relative overflow-hidden font-mono z-30 select-none">
      
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
                <div className="h-1 w-1 bg-studio-neon rounded-full animate-pulse" /> ENGINE_LOCKED
            </div>
        </div>

        {/* HIGH_FIDELITY_SWITCHBOARD (Simple Website Labels) */}
        <div className="flex-1 flex overflow-x-auto no-scrollbar divide-x divide-white/5">
            {[
                { name: 'SOUNDS', href: '/browse' },
                { name: 'PACKS', href: '/browse' },
                { name: 'PRICING', href: '/pricing' },
                { name: 'LIBRARY', href: '/library' },
                { name: 'ACCOUNT', href: '/settings' },
                { name: 'HELP', href: '/faq' }
            ].map((link, i) => (
                <Link key={i} href={link.href} className="flex px-10 py-5 items-center justify-center whitespace-nowrap text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-studio-neon hover:bg-white/[0.02] active:bg-studio-neon/10 transition-all italic border-white/5 group">
                    {link.name} <ChevronRight size={10} className="ml-2 opacity-0 group-hover:opacity-30 group-hover:translate-x-1 transition-all" />
                </Link>
            ))}
        </div>

        {/* TELEMETRY_RACK */}
        <div className="hidden lg:flex items-center px-10 gap-10 bg-white/[0.01] border-l border-white/5">
            <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black text-white/10 uppercase tracking-widest italic">SAMPLING_HQ</span>
                <span className="text-[9px] font-black text-studio-neon uppercase italic tracking-[0.2em]">48.0k - 24BIT</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black text-white/10 uppercase tracking-widest italic">CONSOLE</span>
                <span className="text-[9px] font-black text-white/30 uppercase italic tracking-[0.2em]">V17.70.3</span>
            </div>
        </div>

      </div>

      {/* 🦾 STATUS_MONITOR_LINE */}
      <div className="px-8 py-3 bg-black/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/10 tracking-[0.4em] italic">
            © {currentYear} SAMPLES WALA // PRO_PRODUCER_CONSOLE
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[8px] font-black uppercase text-white/10 italic tracking-widest">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/2 border border-white/5 rounded-xs">
                    <Headphones size={10} className="text-studio-neon" /> STUDIO_SYNC
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
