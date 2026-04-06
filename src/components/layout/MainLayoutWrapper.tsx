'use client'

import React from 'react'
import { useSidebar } from './SidebarContext'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  
  return (
    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-20 lg:pb-0 relative ${isOpen ? 'lg:pl-80' : 'lg:pl-20'}`}>
      {children}
    </div>
  )
}
