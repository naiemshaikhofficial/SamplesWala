'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layout, Search, Disc, User, Music, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    { label: 'Home', href: '/', icon: Layout },
    { label: 'Browse', href: '/browse', icon: Search },
    { label: 'AI Forge', href: '/studio', icon: Sparkles },
    { label: 'Profile', href: '/library', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[510] px-4 pointer-events-none">
      <nav className="max-w-[320px] mx-auto bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative group p-3"
            >
              <motion.div
                animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-studio-neon' : 'text-white/40'}`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-studio-neon/20 blur-lg rounded-full"
                    />
                  )}
                </div>
              </motion.div>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-studio-neon rounded-full" 
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
