import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GlobalPlayer } from '@/components/audio/GlobalPlayer'
import { ClientProviders } from '@/components/ClientProviders'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SAMPLES WALA | Premium Music Production Samples',
  description: 'High-performance, royalty-free audio samples, loops, and sample packs for modern music producers.',
}

import { SignalScan } from '@/components/ui/SignalScan'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white selection:text-black overflow-x-hidden bg-black`}>
        <SignalScan />
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <GlobalPlayer />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
