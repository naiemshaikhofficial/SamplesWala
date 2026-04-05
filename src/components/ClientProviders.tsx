'use client'
import { NotificationProvider } from '@/components/ui/NotificationProvider'
import { AudioProvider } from '@/components/audio/AudioProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <CurrencyProvider>
        <AudioProvider>
          {children}
        </AudioProvider>
      </CurrencyProvider>
    </NotificationProvider>
  )
}
