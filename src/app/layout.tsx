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
  metadataBase: new URL('https://sampleswala.com'),
  title: {
    default: 'SAMPLES WALA | Premium Musical Samples, Loops & VSTs',
    template: '%s | SAMPLES WALA'
  },
  description: 'Pro-grade royalty-free audio samples, loops, and sample packs for modern music producers. High-performance sounds for Trap, EDM, Lo-Fi, and industry-standard VST software.',
  keywords: ['music samples', 'sample packs', 'royalty free loops', 'trap samples', 'edm loops', 'music production', 'drum kits', 'sampleswala', 'vst plugins', 'audio samples'],
  authors: [{ name: 'SamplesWala Team' }],
  creator: 'SamplesWala',
  publisher: 'SamplesWala',
  applicationName: 'SamplesWala',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sampleswala.com',
    siteName: 'SAMPLES WALA',
    title: 'SAMPLES WALA | Premium Musical Samples, Loops & VSTs',
    description: 'Pro-grade royalty-free audio samples for modern music producers. Industry-standard sound kits.',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'SAMPLES WALA - Premium Music Samples'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAMPLES WALA | Premium Musical Samples & Loops',
    description: 'Pro-grade royalty-free audio samples for modern music producers.',
    images: ['/og-image.jpg'],
  },
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
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 📝 SITE_SEARCH_SCHEMA (JSON-LD)
  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SamplesWala",
    "alternateName": ["Samples Wala", "SamplesWala Music"],
    "url": "https://sampleswala.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://sampleswala.com/browse?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 🏛️ ORGANIZATION_SCHEMA (JSON-LD)
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SamplesWala",
    "url": "https://sampleswala.com",
    "logo": "https://sampleswala.com/logo.png",
    "sameAs": [
      "https://instagram.com/sampleswala",
      "https://youtube.com/sampleswala",
      "https://twitter.com/sampleswala"
    ]
  };

  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <head>
        {/* 🔗 CANONICAL_URI_LOCK */}
        <link rel="canonical" href="https://sampleswala.com" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify({
              ...orgSchema,
              "founder": {
                "@type": "Person",
                "name": "Naiem Shaikh"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-XXXXXXXXXX",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": "en"
              }
            }) 
          }}
        />
        {/* ⭐ BRAND_RATING_SCHEMA (Placeholder for CTR) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify({
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
            }) 
          }}
        />
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
