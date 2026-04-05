'use client'
import { Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CreditCounter() {
  const [credits, setCredits] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCredits() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('user_subscriptions').select('current_credits').eq('user_id', user.id).single()
        if (data) setCredits(data.current_credits)
      }
    }
    fetchCredits()
  }, [])

  if (credits === null) return null

  return (
    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60">
      <Zap className="h-3.5 w-3.5 fill-white text-white" />
      <span className="text-[10px] font-black uppercase tracking-widest">{credits} Credits</span>
    </div>
  )
}
