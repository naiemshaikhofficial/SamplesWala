import Link from 'next/link'
import { Globe, Music4, Play, Mail, CreditCard, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t-2 border-white/10 bg-black text-white pt-24 pb-12 lg:pl-20">
      <div className="container mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24">
          
          {/* 🎰 THE IDENTITY */}
          <div className="md:col-span-1 flex flex-col justify-between h-full">
            <div className="space-y-8">
                <Link href="/" className="inline-flex items-center gap-4 group">
                    <div className="h-4 w-4 bg-white rotate-45 group-hover:rotate-180 transition-all duration-700" />
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic italic">SAMPLES WALA</h2>
                </Link>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20 leading-relaxed max-w-[240px]">
                    ESTABLISHED 2024. MUMBAI. <br/>
                    HIGH-PERFORMANCE AUDIO ARTIFACTS FOR MODERN PRODUCTION AGENTS.
                </p>
            </div>
            
            <div className="mt-12 flex gap-6">
                <Link href="#" className="h-10 w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <Music4 className="h-4 w-4" />
                </Link>
                <Link href="#" className="h-10 w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <Play className="h-4 w-4" />
                </Link>
                <Link href="#" className="h-10 w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <Mail className="h-4 w-4" />
                </Link>
            </div>
          </div>

          {/* 💿 DISCOVERY PORTALS */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Discovery</h3>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              <li><Link href="/browse" className="text-white/40 hover:text-white transition-colors">Digital Vault</Link></li>
              <li><Link href="/packs" className="text-white/40 hover:text-white transition-colors">Master Collections</Link></li>
              <li><Link href="/browse?mode=samples" className="text-white/40 hover:text-white transition-colors">Singular Sounds</Link></li>
              <li><Link href="/pricing" className="text-white/40 hover:text-white transition-colors">Membership Access</Link></li>
            </ul>
          </div>

          {/* ⚡ ACCOUNT AGENT */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Agent Hub</h3>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              <li><Link href="/library" className="text-white/40 hover:text-white transition-colors">My Secured Sounds</Link></li>
              <li><Link href="/profile" className="text-white/40 hover:text-white transition-colors">Security Profile</Link></li>
              <li><Link href="/license" className="text-white/40 hover:text-white transition-colors">Licensing Terminal</Link></li>
              <li><Link href="/terms" className="text-white/40 hover:text-white transition-colors">Production Registry</Link></li>
            </ul>
          </div>

          {/* 💳 SECURE TRANSMISSION */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Transmission</h3>
            <div className="bg-white/5 border border-white/10 p-6 space-y-4 group hover:bg-white transition-all duration-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-black/40 block">Signal Center</span>
                <p className="text-[10px] font-bold text-white/60 group-hover:text-black leading-relaxed">
                    SUBSCRIBE FOR FREE MONTHLY ARTIFACT DROPS AND EXCLUSIVE SIGNAL ACCESS.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="EMAIL ADDRESS" 
                        className="flex-1 bg-transparent border-b border-white/20 group-hover:border-black/20 text-[10px] font-black group-hover:text-black focus:outline-none transition-all placeholder:text-white/10 group-hover:placeholder:text-black/10" 
                    />
                    <button className="h-8 px-4 bg-white text-black group-hover:bg-black group-hover:text-white text-[9px] font-black uppercase tracking-widest transition-all">Submit</button>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">
                <div className="flex items-center gap-2"><CreditCard className="h-3 w-3" /> Razorpay Secure</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> SSL Encryption</div>
             </div>
             <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest leading-none">
                © 2026 SAMPLES WALA. DEVELOPED BY NAIEM SHAIKH. PERFORMANCE AUDIO SOLUTIONS. MUMBAI, INDIA.
             </p>
          </div>
          
          <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-white/40">
            <Link href="/privacy" className="hover:text-white transition-all underline decoration-transparent hover:decoration-white underline-offset-4">Privacy Pipeline</Link>
            <Link href="/refund" className="hover:text-white transition-all underline decoration-transparent hover:decoration-white underline-offset-4">Refund Protocol</Link>
            <Link href="/terms" className="hover:text-white transition-all underline decoration-transparent hover:decoration-white underline-offset-4">TOS Registry</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

