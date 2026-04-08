'use client'

import React from 'react'
import { useSidebar } from './SidebarContext'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen } = useSidebar()
  const isAdmin = pathname?.startsWith('/admin')
  
  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out relative ${isAdmin ? 'pl-0' : (isOpen ? 'lg:pl-64' : 'lg:pl-20')}`}>
      {!isAdmin && <Header />}
      
      {/* 🔮 MASTER_CONTENT_TERMINAL */}
      <main className={`
        flex-grow z-20 relative flex flex-col 
        ${isAdmin ? 'pt-0 pb-0' : 'pt-20 sm:pt-32 md:pt-40 lg:pt-[160px] xl:pt-[140px] pb-32 lg:pb-12'}
      `}>
        <div className="relative z-10 flex-1 flex flex-col w-full max-w-[2000px] mx-auto overflow-x-hidden">
            {children}
        </div>
      </main>

      {/* 🧬 GLOBAL_Z_INDEX_SAFETY_OVERLAYS */}
      <style jsx global>{`
        /* Prevent body scroll when mobile menu might be open */
        body.menu-open {
          overflow: hidden;
        }
        
        /* Smooth horizontal transitions for content reveal */
        .step-grid {
          background-size: 24px 24px;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
        }
      `}</style>
    </div>
  )
}
