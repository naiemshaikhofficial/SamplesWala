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
import { MasterLight, ScanlineOverlay } from '@/components/ui/MasterLight'
import { Suspense } from 'react'
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'SAMPLES WALA | Premium Music Production Samples & Loops',
    template: '%s | SAMPLES WALA'
  },
  description: 'Pro-grade royalty-free audio samples, loops, and sample packs for modern music producers. High-performance sounds for Trap, EDM, Lo-Fi, and more.',
  keywords: ['music samples', 'sample packs', 'royalty free loops', 'trap samples', 'edm loops', 'music production', 'drum kits', 'sampleswala'],
  authors: [{ name: 'SamplesWala Team' }],
  creator: 'SamplesWala',
  publisher: 'SamplesWala',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white selection:text-black overflow-x-hidden bg-studio-charcoal custom-scrollbar`}>
        <ClientProviders>
          <MasterLight />
          <ScanlineOverlay />
          <SignalScan />
          <div className="flex min-h-screen relative overflow-x-hidden">
            <Suspense fallback={null}>
                <Sidebar />
            </Suspense>
            <MainLayoutWrapper>
               {children}
               <Footer />
               <GlobalPlayer />
               <Suspense fallback={null}>
                   <BottomNav />
               </Suspense>
            </MainLayoutWrapper>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
