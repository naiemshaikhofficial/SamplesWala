'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, User, Music } from 'lucide-react'
import { motion } from 'framer-motion'

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse', href: '/browse', icon: Search },
    { label: 'Library', href: '/library', icon: Music },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[510] px-12 pointer-events-none">
      <div className="max-w-[280px] mx-auto flex items-center justify-around pointer-events-auto relative">
        
        {/* 🔊 THE_SIGNAL_WIRE (Ultra-Thin) */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/5" />

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative flex flex-col items-center py-4 px-2"
            >
              {/* Active VU Meter Indicator */}
              {isActive && (
                <div className="absolute -top-1 flex flex-col gap-[2px]">
                   <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1 h-1 rounded-full bg-studio-neon shadow-[0_0_8px_rgba(166,226,46,0.8)]"
                   />
                </div>
              )}

              <motion.div
                animate={isActive ? { 
                    y: -8,
                    scale: 1.1,
                } : { 
                    y: 0,
                    scale: 1,
                }}
                className={`relative z-10 transition-all duration-300 ${isActive ? 'text-studio-neon' : 'text-white/20'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              {/* Minimal Selection Dot */}
              {isActive && (
                <motion.div 
                  layoutId="minimal-nav-dot"
                  className="absolute bottom-0 w-8 h-[2px] bg-studio-neon/40 blur-[1px]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
