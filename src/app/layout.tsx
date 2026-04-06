import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GlobalPlayer } from '@/components/audio/GlobalPlayer'
import { ClientProviders } from '@/components/ClientProviders'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { SignalScan } from '@/components/ui/SignalScan'
import { Suspense } from 'react'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white selection:text-black overflow-x-hidden bg-studio-charcoal custom-scrollbar`}>
        <SignalScan />
        <ClientProviders>
          <div className="flex min-h-screen relative overflow-x-hidden">
            <Suspense fallback={null}>
                <Sidebar />
            </Suspense>
            <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-500 pb-20 lg:pb-0">
              <Suspense fallback={null}>
                  <Header />
              </Suspense>
              <main className="flex-grow relative">
                {children}
              </main>
              <Footer />
              <GlobalPlayer />
              <Suspense fallback={null}>
                  <BottomNav />
              </Suspense>
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
