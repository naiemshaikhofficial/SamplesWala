'use client'
import { NotificationProvider } from '@/components/ui/NotificationProvider'
import { AudioProvider } from '@/components/audio/AudioProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

import { SidebarProvider } from '@/components/layout/SidebarContext'

import { CacheProvider } from '@/components/providers/CacheProvider'

import { VaultProvider } from '@/components/VaultProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <NotificationProvider>
        <CurrencyProvider>
          <SidebarProvider>
            <VaultProvider>
              <AudioProvider>
                {children}
              </AudioProvider>
            </VaultProvider>
          </SidebarProvider>
        </CurrencyProvider>
      </NotificationProvider>
    </CacheProvider>
  )
}
