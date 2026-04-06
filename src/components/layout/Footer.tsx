import Link from 'next/link'
import Image from 'next/image'
import { Globe, Music4, Play, Mail, CreditCard, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t-2 border-white/10 bg-black text-white pt-16 md:pt-24 pb-12 lg:pl-20">
      <div className="container mx-auto px-4 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24">
          
          {/* 🎰 THE IDENTITY */}
          <div className="md:col-span-1 flex flex-col justify-between h-full gap-8">
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
                <Link href="/" className="inline-flex items-center gap-4 group">
                    <Image 
                      src="/Logo.png" 
                      alt="SAMPLES WALA Logo" 
                      width={160} 
                      height={40} 
                      style={{ width: 'auto' }}
                      className="h-8 md:h-10 w-auto object-contain grayscale brightness-200"
                    />
                </Link>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20 leading-relaxed max-w-[240px] mx-auto md:mx-0">
                    ESTABLISHED 2024. MUMBAI. <br/>
                    PREMIUM AUDIO SAMPLES FOR MODERN MUSIC PRODUCERS.
                </p>
            </div>
            
            <div className="mt-4 md:mt-12 flex justify-center md:justify-start gap-6">
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

          <div className="space-y-6 md:space-y-10 text-center md:text-left pt-8 md:pt-0 border-t border-white/5 md:border-t-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Explore</h3>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              <li><Link href="/browse" className="text-white/40 hover:text-white transition-colors">Browse Sounds</Link></li>
              <li><Link href="/packs" className="text-white/40 hover:text-white transition-colors">Sample Packs</Link></li>
              <li><Link href="/browse?mode=samples" className="text-white/40 hover:text-white transition-colors">Top Samples</Link></li>
              <li><Link href="/pricing" className="text-white/40 hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:space-y-10 text-center md:text-left pt-8 md:pt-0 border-t border-white/5 md:border-t-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Account</h3>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest">
              <li><Link href="/library" className="text-white/40 hover:text-white transition-colors">My Library</Link></li>
              <li><Link href="/profile" className="text-white/40 hover:text-white transition-colors">My Profile</Link></li>
              <li><Link href="/license" className="text-white/40 hover:text-white transition-colors">Licenses</Link></li>
              <li><Link href="/terms" className="text-white/40 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:space-y-10 text-center md:text-left pt-8 md:pt-0 border-t border-white/5 md:border-t-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 underline decoration-white/20 underline-offset-8">Newsletter</h3>
            <div className="bg-white/5 border border-white/10 p-6 space-y-4 group hover:bg-white transition-all duration-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-black/40 block text-left">Updates</span>
                <p className="text-[10px] font-bold text-white/60 group-hover:text-black leading-relaxed text-left">
                    SUBSCRIBE FOR FREE MONTHLY SAMPLE PACKS AND EXCLUSIVE DEALS.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="EMAIL ADDRESS" 
                        className="flex-1 bg-transparent border-b border-white/20 group-hover:border-black/20 text-[10px] font-black group-hover:text-black focus:outline-none transition-all placeholder:text-white/10 group-hover:placeholder:text-black/10" 
                    />
                    <button className="h-8 px-4 bg-white text-black group-hover:bg-black group-hover:text-white text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap">Subscribe</button>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
          <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start">
             <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">
                <div className="flex items-center gap-2"><CreditCard className="h-3 w-3" /> Razorpay Secure</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> SSL Encryption</div>
             </div>
             <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest leading-none">
                © 2026 SAMPLES WALA. DEVELOPED BY NAIEM SHAIKH. PERFORMANCE AUDIO SOLUTIONS. MUMBAI, INDIA.
             </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[9px] font-black uppercase tracking-widest text-white/40">
            <Link href="/privacy" className="hover:text-white transition-all underline decoration-transparent hover:decoration-white underline-offset-4">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-white transition-all underline decoration-transparent hover:decoration-white underline-offset-4">Refund Policy</Link>
            <Link href="/terms" className="hover:text-white transition-all underline decoration-transparent hover:decoration-white underline-offset-4">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

