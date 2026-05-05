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
import { CartDrawer } from '@/components/audio/CartDrawer'
import Script from 'next/script'
import { getAllCategories } from './browse/actions'
import { createClient } from '@/lib/supabase/server'

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
    template: '%s | Samples Wala'
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categories = await getAllCategories()

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
        
        {/* 🎹 Music Industry Specifics */}
        <meta name="subject" content="Music Production, Sample Packs, Bollywood Loops, VST Plugins" />
        <meta name="topic" content="Music Production and Indian Hip Hop" />
        <meta name="classification" content="Music Marketplace, Audio Samples, Loops, Presets" />
        <meta name="summary" content="Samples Wala - India's premier destination for high-quality, royalty-free sample packs and music production tools." />
        
        {/* 💳 Payment & Image Pre-fetching */}
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.phonepe.com" />
        
        {/* 📝 Structured Data (Nuclear SEO) */}
        <JsonLdSchema />
        
        {/* ⭐ Aggregate Brand Rating for CTR Boost */}
        <JsonLdSchema data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Samples Wala",
          "image": "https://sampleswala.com/Logo.png",
          "description": "Premium royalty-free sample packs and loops for music production.",
          "brand": {
            "@type": "Brand",
            "name": "Samples Wala"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2450"
          }
        }} />

        {/* ⭐ Trustpilot Integration */}
        <Script
          id="trustpilot-integration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
              a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
              f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
              tp('register', 'eYCb1xHgnp07RuDx');
            `
          }}
        />
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
        />
        
        {/* 💰 Google AdSense Verification */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2230304701927195"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white selection:text-black overflow-x-hidden bg-studio-charcoal custom-scrollbar`}>
        <ClientProviders>
          <MasterLight />
          <ScanlineOverlay />
          <SignalScan />
          <CartDrawer />
          <div className="flex min-h-screen relative overflow-x-hidden">
            <Suspense fallback={null}>
                <Sidebar initialCategories={categories} />
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
