'use client'

import { 
  Activity, Cpu, Headphones, Zap, 
  Terminal, ShieldCheck, Wifi, Layers, 
  HelpCircle, ChevronRight, Globe, Lock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TrustpilotWidget } from '../trustpilot/TrustpilotWidget'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block w-full bg-[#080808] border-t-4 border-black relative overflow-hidden font-mono z-30 select-none">
      
      {/* Sitemap Section */}
      <div className="grid grid-cols-5 gap-0 border-b border-white/5">
          {/* Channel 1: Sounds */}
          <div className="p-8 border-r border-white/5 bg-black/20 space-y-6 group">
              <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon">01 // Sounds</h4>
                  <div className="w-2 h-2 rounded-full bg-studio-neon animate-pulse" />
              </div>
              <nav className="flex flex-col gap-3">
                  {['Trap', 'Drill', 'Lo-Fi', 'EDM', 'Hip-Hop'].map(g => (
                      <Link key={g} href={`/sounds/genres/${g.toLowerCase()}`} className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">
                          {g} Samples
                      </Link>
                  ))}
              </nav>
          </div>

          {/* Channel 2: Freebies */}
          <div className="p-8 border-r border-white/5 bg-black/10 space-y-6">
              <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-yellow">02 // Free</h4>
                  <div className="w-2 h-2 rounded-full bg-studio-yellow/40" />
              </div>
              <nav className="flex flex-col gap-3">
                  {['Drum Kits', 'Piano Loops', 'Vocals', '808s', 'Melodies'].map(f => (
                      <Link key={f} href="/free" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">
                          Free {f}
                      </Link>
                  ))}
              </nav>
          </div>

          {/* Channel 3: Tools */}
          <div className="p-8 border-r border-white/5 bg-black/20 space-y-6">
              <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">03 // Tools</h4>
                  <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <nav className="flex flex-col gap-3">
                  <Link href="/software" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Visualizer</Link>
                  <Link href="/browse?filter=presets" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Presets</Link>
                  <Link href="/faq" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Licensing</Link>
                  <Link href="/terms" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Terms</Link>
              </nav>
          </div>

          {/* Channel 4: Support */}
          <div className="p-8 border-r border-white/5 bg-black/10 space-y-6">
              <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">04 // Support</h4>
                  <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <nav className="flex flex-col gap-3">
                  <Link href="/faq" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Help Center</Link>
                  <Link href="/contact" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Contact</Link>
                  <Link href="/refund" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Refunds</Link>
                  <Link href="/privacy" className="text-[11px] font-bold text-white/20 hover:text-white transition-all hover:translate-x-1 uppercase italic tracking-widest">Privacy</Link>
              </nav>
          </div>

          {/* About Section */}
          <div className="p-8 bg-studio-neon/5 space-y-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
                  <Zap size={120} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon">About Us</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/40 italic">
                  Samples Wala is a team of <span className="text-white">50+ Artists, Engineers & Sound Designers</span>. <br/>
                  Helping producers create the music of the future.
              </p>
          </div>
      </div>

      {/* Trust Strip */}
      <div className="bg-black/40 border-b border-white/5">
        <TrustpilotWidget />
      </div>

      {/* Status Bar */}
      <div className="flex items-stretch bg-black border-b border-white/5">
          {/* Branding */}
          <div className="p-6 px-10 border-r border-white/5 bg-white/[0.02] flex items-center gap-8">
              <Link href="/" className="group shrink-0">
                  <Image src="/Logo.png" alt="Samples Wala" width={110} height={30} className="h-6 w-auto brightness-90 group-hover:brightness-125 transition-all" />
              </Link>
              <div className="h-8 w-px bg-white/5" />
              <div className="flex flex-col">
                  <span className="text-[8px] font-black text-studio-neon uppercase tracking-[0.3em] animate-pulse">Online</span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mumbai, India</span>
              </div>
          </div>

          {/* Quick Links */}
          <div className="flex-1 flex divide-x divide-white/5">
              {[
                  { name: 'Sounds', href: '/browse' },
                  { name: 'Library', href: '/library' },
                  { name: 'Pricing', href: '/subscription' },
                  { name: 'Account', href: '/settings' },
                  { name: 'About', href: '/about' }
              ].map((link, i) => (
                  <Link key={i} href={link.href} className="flex-1 flex py-6 items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-studio-neon hover:bg-white/[0.02] transition-all group">
                      {link.name}
                  </Link>
              ))}
          </div>

          {/* Stats */}
          <div className="flex items-center px-10 gap-10 bg-studio-neon/[0.02] border-l border-white/5">
              <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest italic leading-none">QUALITY</span>
                  <span className="text-[10px] font-black text-studio-neon uppercase italic tracking-[0.2em] leading-none">48K / 24BIT</span>
              </div>
              <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest italic leading-none">VERSION</span>
                  <span className="text-[10px] font-black text-white/40 uppercase italic tracking-[0.2em] leading-none">V18.2.0</span>
              </div>
          </div>
      </div>

      {/* Footer Bottom */}
      <div className="px-8 py-4 bg-black flex items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="flex items-center gap-10 relative z-10">
          <div className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] italic">
            © {currentYear} SAMPLES WALA // PROFESSIONAL CONSOLE
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[8px] font-black text-studio-neon uppercase tracking-widest">
              <Globe size={10} /> MUMBAI, INDIA // GLOBAL DELIVERY
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 relative z-10">
            {[
                { 
                    name: 'Instagram', 
                    href: 'https://instagram.com/SamplesWala', 
                    color: 'hover:border-[#E1306C] hover:text-[#E1306C]',
                    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                },
                { 
                    name: 'Twitter', 
                    href: 'https://twitter.com/SamplesWala', 
                    color: 'hover:border-[#1DA1F2] hover:text-[#1DA1F2]',
                    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                },
                { 
                    name: 'Youtube', 
                    href: 'https://youtube.com/@SamplesWala', 
                    color: 'hover:border-[#FF0000] hover:text-[#FF0000]',
                    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                }
            ].map((social, i) => (
                <a 
                    key={i} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-2 bg-white/[0.03] border border-white/10 rounded-sm text-white/20 transition-all ${social.color} hover:bg-white/5 flex items-center justify-center`}
                    title={social.name}
                >
                    {social.svg}
                </a>
            ))}
        </div>

        <div className="flex items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[8px] font-black uppercase text-white/30">
                    <Lock size={10} className="text-studio-neon" /> SECURE PAYMENT
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-studio-neon/10 text-studio-neon border border-studio-neon/20 rounded-sm text-[8px] font-black uppercase animate-pulse">
                    <Wifi size={10} /> STATUS: ACTIVE
                </div>
            </div>
        </div>
      </div>
    </footer>
  )
}
