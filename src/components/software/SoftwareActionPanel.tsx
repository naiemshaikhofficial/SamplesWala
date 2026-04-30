'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { SubscribeButton } from '@/components/SubscribeButton'

interface OwnershipResult {
  id: string
}

/**
 * 🧬 CLIENT-SIDE SOFTWARE OWNERSHIP CHECK
 * Replaces server-side getUser() call — page stays fully static (ISR).
 * Only logged-in users trigger a lightweight client-side DB check.
 */
export function SoftwareActionPanel({
  softwareName,
  softwareId,
  downloadUrlWin,
  downloadUrlMac,
}: {
  softwareName: string
  softwareId: string
  priceInr: number
  downloadUrlWin?: string | null
  downloadUrlMac?: string | null
}) {
  const { user } = useAuth()
  const [isOwned, setIsOwned] = useState(false)
  // Initialize loading to true only when user exists (avoids sync setState in effect)
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()
    supabase
      .from('software_orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('software_name', softwareName)
      .eq('status', 'complete')
      .maybeSingle()
      .then(({ data }: { data: OwnershipResult | null }) => {
        setIsOwned(!!data)
        setLoading(false)
      })
  }, [user, softwareName])

  // Loading shimmer (matches button height)
  if (loading) {
    return (
      <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 h-16 bg-white/5 animate-pulse rounded-sm" />
      </div>
    )
  }

  if (isOwned) {
    return (
      <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {downloadUrlWin && (
          <a 
            href={downloadUrlWin} 
            className="h-16 flex items-center justify-center bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-studio-neon transition-all gap-3 shadow-xl"
          >
            <svg viewBox="0 0 88 88" className="w-4 h-4 fill-current"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.44v-31.51zm4.326-39.04L87.314 0v41.26l-47.318.376zm47.318 39.897L87.31 88l-47.315-6.52v-34.71z"/></svg>
            Windows
          </a>
        )}
        {downloadUrlMac && (
          <a 
            href={downloadUrlMac} 
            className="h-16 flex items-center justify-center bg-black border-2 border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:border-studio-neon transition-all gap-3 shadow-xl"
          >
            <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            Apple
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <SubscribeButton 
          planId={softwareId} 
          planName={`PURCHASE ${softwareName.toUpperCase()}`} 
          mode="software"
          isFeatured={true}
        />
      </div>
    </div>
  )
}

/**
 * Price display that hides when owned (for listing cards)
 */
export function SoftwarePriceTag({ softwareName, priceInr }: { softwareName: string, priceInr: number }) {
  const { user } = useAuth()
  const [isOwned, setIsOwned] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('software_orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('software_name', softwareName)
      .eq('status', 'complete')
      .maybeSingle()
      .then(({ data }: { data: OwnershipResult | null }) => setIsOwned(!!data))
  }, [user, softwareName])

  if (isOwned) return null

  return (
    <div className="flex flex-col">
      <span className="text-5xl font-black italic tracking-tighter text-white">₹{priceInr}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">ONE-TIME LICENSE</span>
    </div>
  )
}

/**
 * 🛠️ Detail page variant — used on /software/[slug]
 * Shows full licensed UI with ShieldCheck badge or purchase panel.
 */
export function SoftwareDetailActions({
  softwareName,
  softwareId,
  priceInr,
  downloadUrlWin,
  downloadUrlMac,
}: {
  softwareName: string
  softwareId: string
  priceInr: number
  downloadUrlWin?: string | null
  downloadUrlMac?: string | null
}) {
  const { user } = useAuth()
  const [isOwned, setIsOwned] = useState(false)
  const [loading, setLoading] = useState(!!user)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()
    supabase
      .from('software_orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('software_name', softwareName)
      .eq('status', 'complete')
      .maybeSingle()
      .then(({ data }: { data: OwnershipResult | null }) => {
        setIsOwned(!!data)
        setLoading(false)
      })
  }, [user, softwareName])

  if (loading) {
    return <div className="h-14 bg-white/5 animate-pulse rounded-sm" />
  }

  if (isOwned) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3 text-studio-neon mb-4">
          <ShieldCheckIcon />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Licensed Version</span>
        </div>
        <div className="flex flex-col gap-4 w-full">
          {downloadUrlWin && (
            <a href={downloadUrlWin} className="h-14 flex items-center justify-center bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-studio-neon hover:scale-[1.02] active:scale-95 transition-all gap-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-sm">
              <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.44v-31.51zm4.326-39.04L87.314 0v41.26l-47.318.376zm47.318 39.897L87.31 88l-47.315-6.52v-34.71z"/></svg>
              Download for Windows
            </a>
          )}
          {downloadUrlMac && (
            <a href={downloadUrlMac} className="h-14 flex items-center justify-center bg-black border-2 border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:border-studio-neon hover:text-black hover:scale-[1.02] active:scale-95 transition-all gap-4 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-sm">
              <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              Download for Mac
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center">
        <span className="text-5xl lg:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">₹{priceInr}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">ONE-TIME PAYMENT</span>
      </div>
      <div className="w-full">
        <SubscribeButton 
          planId={softwareId} 
          planName={`PURCHASE ${softwareName.toUpperCase()}`} 
          mode="software"
          isFeatured={true}
        />
      </div>
    </div>
  )
}

// Inline icon to avoid importing lucide-react in this client bundle
function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
