import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'
import { Music, Search, User } from 'lucide-react'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { CreditCounter } from '@/components/CreditCounter'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center space-x-2 group">
            <Music className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black tracking-tighter uppercase italic">SAMPLES WALA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-white/40">
            <Link href="/browse" className="transition-colors hover:text-white">Browse</Link>
            <Link href="/packs" className="transition-colors hover:text-white">Sample Packs</Link>
            <Link href="/pricing" className="transition-colors hover:text-white text-white/80">Pricing</Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user && <CreditCounter />}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 transition-colors group-focus-within:text-white/60" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-full rounded-full border border-white/5 bg-white/5 px-10 py-1 text-xs shadow-sm transition-all focus:ring-1 focus:ring-white/20 outline-none md:w-[200px] lg:w-[240px]"
              />
            </div>
          </div>
          
          <nav className="flex items-center gap-3 border-l border-white/10 pl-4 ml-4">
            <CurrencyToggle />
            
            {user ? (
                <form action={signOut}>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
                        <User className="h-4 w-4" />
                    </button>
                </form>
            ) : (
                <Link href="/auth/login" className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Login / Join
                </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

