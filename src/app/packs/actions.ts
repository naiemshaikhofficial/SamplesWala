'use server'
import { createClient } from '@/lib/supabase/server'
import { signDownloadToken } from '@/lib/jwt'
import { headers } from 'next/headers'

export async function getSecureDownloadUrl(targetId: string, isIndividualSample: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headerList = await headers()
  const clientIp = headerList.get("x-forwarded-for")?.split(',')[0] || "unknown"

  if (!user) throw new Error("Authentication Required")

  let hasAccess = false;

  // 🛡️ UNIVERSAL VAULT VERIFICATION Protocol
  const { data: vaultRecord } = await supabase
    .from('user_vault')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_id', targetId)
    .eq('item_type', isIndividualSample ? 'sample' : 'pack')
    .maybeSingle()
  
  hasAccess = !!vaultRecord

  if (!hasAccess && !isIndividualSample) {
    // 🔍 Legacy/Alternate Purchase Check
    const { data: legacy } = await supabase.from('unlocked_packs').select('id').eq('pack_id', targetId).eq('user_id', user.id).maybeSingle()
    hasAccess = !!legacy
  }

  if (!hasAccess) throw new Error("Access Denied: Product Not Owned")

  // 2. 🚀 GENERATE JWT TOKEN (IP LOCKED)
  // This is inspired by the Naiem-Shaikh-main logic
  const token = await signDownloadToken({
    id: targetId,
    userId: user.id,
    ip: clientIp,
    isSample: isIndividualSample,
    timestamp: Date.now()
  })

  // 3. 📡 RETURN THE PROTECTED ENDPOINT
  return `/api/download/${token}`
}
