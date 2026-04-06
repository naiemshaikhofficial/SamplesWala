'use client'
import { NotificationProvider } from '@/components/ui/NotificationProvider'
import { AudioProvider } from '@/components/audio/AudioProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

import { SidebarProvider } from '@/components/layout/SidebarContext'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <CurrencyProvider>
        <SidebarProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </SidebarProvider>
      </CurrencyProvider>
    </NotificationProvider>
  )
}
