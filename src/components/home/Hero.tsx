import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-48">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-background to-background" />
      <div className="container relative mx-auto px-4 text-center">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-8 text-xs font-medium text-muted-foreground transition-all duration-1000">
          <span className="text-white bg-white/10 rounded-full px-2 py-0.5 mr-2">New</span>
          Bollywood Trap Essentials Vol. 1 just landed
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6">
          LEVEL UP YOUR<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 font-[900]">PRODUCTION.</span>
        </h1>
        
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl mb-10 leading-relaxed font-medium">
          Premium royalty-free samples, loops, and presets for music producers who demand excellence. 
          The benchmark platform for modern high-performance libraries.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/browse" 
            className="group inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md bg-white px-8 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-95"
          >
            Browse Samples
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/packs" 
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md border border-white/10 bg-white/5 px-8 text-sm font-bold transition-all hover:bg-white/10 active:scale-95"
          >
            View Sample Packs
          </Link>
        </div>
      </div>
    </section>
  )
}
