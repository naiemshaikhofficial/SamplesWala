import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'
import Image from 'next/image'
import { Music, Search, User, Menu } from 'lucide-react'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { CreditCounter } from '@/components/CreditCounter'
import { MobileMenu } from './MobileMenu'
import { TextScramble } from '@/components/ui/TextScramble'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white lg:pl-20">
      <div className="flex h-20 md:h-24 items-center justify-between px-4 md:px-20">
        <div className="flex items-center gap-6 md:gap-16">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group">
            <Image 
              src="/Logo.png" 
              alt="SAMPLES WALA Logo" 
              width={300} 
              height={80} 
              style={{ width: 'auto' }}
              className="h-12 md:h-20 w-auto object-contain"
              priority
            />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
            <Link href="/browse" className="text-white/30 hover:text-white transition-all py-8 px-2 relative group/link">
                <TextScramble text="Sounds" autostart={false} />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-white group-hover/link:w-full transition-all duration-500" />
            </Link>
            <Link href="/packs" className="text-white/30 hover:text-white transition-all py-8 px-2 relative group/link">
                <TextScramble text="Packs" autostart={false} />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-white group-hover/link:w-full transition-all duration-500" />
            </Link>
            <Link href="/pricing" className="text-white/30 hover:text-white transition-all py-8 px-2 relative group/link">
                <TextScramble text="Access" autostart={false} />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-white group-hover/link:w-full transition-all duration-500" />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
              {user && (
                  <Link href="/library" className="group flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all">
                      <Music className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-inherit">My Library</span>
                  </Link>
              )}
              {user && <CreditCounter />}
              <CurrencyToggle />
          </div>

          <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-6 pl-2 md:pl-6 border-l border-white/10">
            {user ? (
                <div className="flex items-center gap-3 md:gap-4">
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
                <Link href="/auth/login" className="px-4 md:px-8 py-2 md:py-3 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-white border border-white transition-all">
                    Login
                </Link>
            )}
            <MobileMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}

