'use client'
import { NotificationProvider } from '@/components/ui/NotificationProvider'
import { AudioProvider } from '@/components/audio/AudioProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

import { SidebarProvider } from '@/components/layout/SidebarContext'

import { CacheProvider } from '@/components/providers/CacheProvider'

import { VaultProvider } from '@/components/VaultProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
