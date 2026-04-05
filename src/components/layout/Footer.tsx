import Link from 'next/link'
import { Globe, Music4, Play, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="container mx-auto px-4 py-12 md:py-16 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <h2 className="text-xl font-black tracking-tighter uppercase italic italic">SAMPLES WALA</h2>
            <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
              Premium royalty-free assets for modern music producers who demand excellence.
            </p>
            <div className="flex gap-4 opacity-40">
              <Link href="#" className="hover:text-white transition-colors"><Globe className="h-4 w-4" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Music4 className="h-4 w-4" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Play className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">SHOP</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-foreground transition-colors">All Samples</Link></li>
              <li><Link href="/packs" className="hover:text-foreground transition-colors">Sample Packs</Link></li>
              <li><Link href="/browse?type=one-shot" className="hover:text-foreground transition-colors">One-Shots</Link></li>
              <li><Link href="/browse?type=loop" className="hover:text-foreground transition-colors">Loops</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">SUPPORT</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">NEWSLETTER</h3>
            <p className="text-xs text-muted-foreground">Get exclusive deals and free sample drops weekly.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-semibold">Join</button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p> 2026 Samples Wala. Developed by Naiem Shaikh. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
            <Link href="/license" className="hover:text-foreground transition-colors">Licensing Info</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
