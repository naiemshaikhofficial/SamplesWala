import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'
import { Music, Search, User, Menu } from 'lucide-react'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { CreditCounter } from '@/components/CreditCounter'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white lg:pl-20">
      <div className="flex h-24 items-center justify-between px-6 md:px-20">
        <div className="flex items-center gap-16">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="h-4 w-4 bg-white rotate-45 group-hover:rotate-180 transition-all duration-700" />
            <span className="text-2xl font-black tracking-tighter uppercase italic">SAMPLES WALA</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <Link href="/browse" className="text-white/40 hover:text-white transition-all hover:bg-white hover:text-black py-10 px-4">Browse</Link>
            <Link href="/packs" className="text-white/40 hover:text-white transition-all hover:bg-white hover:text-black py-10 px-4">Collections</Link>
            <Link href="/pricing" className="text-white/40 hover:text-white transition-all hover:bg-white hover:text-black py-10 px-4">Access</Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
              {user && <CreditCounter />}
              <CurrencyToggle />
          </div>

          <div className="flex items-center gap-4 ml-6 pl-6 border-l border-white/10">
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 hidden sm:block">
                        {user.email?.split('@')[0]}
                    </span>
                    <form action={signOut}>
                        <button className="h-10 w-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                            <User className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            ) : (
                <Link href="/auth/login" className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-white border border-white transition-all">
                    Login
                </Link>
            )}
            <button className="lg:hidden h-10 w-10 flex items-center justify-center border border-white/10">
                <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

