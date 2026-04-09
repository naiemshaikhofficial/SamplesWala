'use client'

import React, { useEffect } from 'react'
import { useSidebar } from './SidebarContext'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen } = useSidebar()
  const isAdmin = pathname?.includes('/admin')
  
  useEffect(() => {
    if (isAdmin) console.log('🛡️ ADMIN_MODE_ACTIVE :: PATH:', pathname);
  }, [isAdmin, pathname]);

  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative bg-studio-charcoal overflow-x-hidden ${isAdmin ? 'pl-0' : (isOpen ? 'lg:pl-64' : 'lg:pl-20')}`}>
      {!isAdmin && <Header />}
      <main className={`flex-grow relative ${isAdmin ? 'pt-0 pb-0' : 'pt-[70px] md:pt-[140px] lg:pt-[120px] pb-36 lg:pb-0'}`}>
        {children}
      </main>
    </div>
  )
}
