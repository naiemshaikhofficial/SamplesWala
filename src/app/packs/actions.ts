'use server'
import { createClient } from '@/lib/supabase/server'
import { signDownloadToken } from '@/lib/jwt'
import { headers } from 'next/headers'

export async function getSecureDownloadUrl(packId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headerList = await headers()
  const clientIp = headerList.get("x-forwarded-for")?.split(',')[0] || "unknown"

  if (!user) throw new Error("Authentication Required")

  // 1. 🛡️ VERIFY OWNERSHIP
  const { data: unlock } = await supabase
    .from('unlocked_packs')
    .select('id')
    .eq('pack_id', packId)
    .eq('user_id', user.id)
    .maybeSingle()

  let hasAccess = !!unlock

  if (!hasAccess) {
     const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('product_id', packId)
        .eq('user_id', user.id)
        .maybeSingle()
     
     hasAccess = !!purchase
  }

  if (!hasAccess) throw new Error("Access Denied: Pack Not Owned")

  // 2. 🚀 GENERATE JWT TOKEN (IP LOCKED)
  // This is inspired by the Naiem-Shaikh-main logic
  const token = await signDownloadToken({
    id: packId,
    userId: user.id,
    ip: clientIp,
    timestamp: Date.now()
  })

  // 3. 📡 RETURN THE PROTECTED ENDPOINT
  return `/api/download/${token}`
}
