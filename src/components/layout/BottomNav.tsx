'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layout, Search, Disc, User, Music } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    { label: 'Home', href: '/', icon: <Layout className="w-5 h-5" /> },
    { label: 'Browse', href: '/browse', icon: <Search className="w-5 h-5" /> },
    { label: 'Library', href: '/profile/library', icon: <Music className="w-5 h-5" /> },
    { label: 'User', href: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[110] bg-black border-t-2 border-white/5 px-6 py-4 pb-8 flex items-center justify-between backdrop-blur-xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-studio-neon' : 'text-white/20'}`}
          >
            <div className={`relative ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
                {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-studio-neon rounded-full animate-pulse shadow-[0_0_10px_#a6e22e]" />
                )}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
