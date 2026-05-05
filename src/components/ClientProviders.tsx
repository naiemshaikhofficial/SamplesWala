'use client'
import { NotificationProvider } from '@/components/ui/NotificationProvider'
import { AudioProvider } from '@/components/audio/AudioProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

import { SidebarProvider } from '@/components/layout/SidebarContext'

import { CacheProvider } from '@/components/providers/CacheProvider'

import { VaultProvider } from '@/components/VaultProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { User } from '@supabase/supabase-js'

import { CartProvider } from '@/components/CartProvider'

export function ClientProviders({ 
  children,
  initialUser = undefined
}: { 
  children: React.ReactNode,
  initialUser?: User | null
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <CacheProvider>
        <NotificationProvider>
          <CurrencyProvider>
            <CartProvider>
              <SidebarProvider>
                <VaultProvider>
                  <AudioProvider>
                    {children}
                  </AudioProvider>
                </VaultProvider>
              </SidebarProvider>
            </CartProvider>
          </CurrencyProvider>
        </NotificationProvider>
      </CacheProvider>
    </AuthProvider>
  )
}
