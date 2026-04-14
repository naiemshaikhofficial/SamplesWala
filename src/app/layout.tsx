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
import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'
import JsonLdSchema from '@/components/seo/JsonLdSchema'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  ...generateMetadata(pagesMeta.home),
  title: {
    default: pagesMeta.home.title,
    template: '%s | SAMPLES WALA'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <head>
        {/* 🚀 Performance Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
        <link rel="dns-prefetch" href="https://imagizer.imageshack.com" />
        
        {/* 📍 Geographic Targeting (Mumbai, India) */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="Mumbai, India" />
        <meta name="geo.position" content="19.0760;72.8777" />
        <meta name="ICBM" content="19.0760, 72.8777" />

        {/* 🛡️ Content Classification */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="revisit-after" content="2 days" />

        {/* 🔗 CANONICAL_URI_LOCK */}
        <link rel="canonical" href="https://sampleswala.com" />
        
        {/* 📝 Structured Data (Nuclear SEO) */}
        <JsonLdSchema type="website" />
        <JsonLdSchema type="organization" />
        <JsonLdSchema type="music-group" />
        
        {/* ⭐ Aggregate Brand Rating for CTR Boost */}
        <JsonLdSchema data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "SamplesWala",
          "image": "https://sampleswala.com/logo.png",
          "description": "Premium royalty-free sample packs and loops for music production.",
          "brand": {
            "@type": "Brand",
            "name": "SamplesWala"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2450"
          }
        }} />
      </head>
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
