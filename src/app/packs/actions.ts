'use server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getAdminClient } from '@/lib/supabase/admin'

export async function getSecureDownloadUrl(targetId: string, isIndividualSample: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headerList = await headers()
  const clientIp = headerList.get("x-forwarded-for")?.split(',')[0] || "unknown"

  if (!user) throw new Error("Authentication Required")

  let hasAccess = false;
  const admin = getAdminClient();

  if (isIndividualSample) {
    // 🛡️ SUB-PROTOCOL: Free Artifact Check (Instant Authorization)
    const { data: sampleData } = await admin.from('samples').select('credit_cost, pack_id').eq('id', targetId).single();
    
    if (sampleData && sampleData.credit_cost === 0) {
        hasAccess = true;
    } else {
        // 🛡️ SUB-PROTOCOL: Sample owner check
        const { data: sampleRecord } = await admin.from('user_vault')
            .select('id').eq('item_id', targetId).eq('item_type', 'sample').eq('user_id', user.id).maybeSingle()
        
        if (sampleRecord) {
            hasAccess = true;
        } else if (sampleData?.pack_id) {
            // 🔄 Fallback: Check if user owns parent pack
            const { data: packRecord } = await admin.from('user_vault')
                .select('id').eq('item_id', sampleData.pack_id).eq('item_type', 'pack').eq('user_id', user.id).maybeSingle()
            hasAccess = !!packRecord;
        }
    }
  } else {
    // 🛡️ SUB-PROTOCOL: Full pack owner check
    const { data: vaultRecord } = await admin.from('user_vault')
      .select('id').eq('user_id', user.id).eq('item_id', targetId).eq('item_type', 'pack').maybeSingle()
    hasAccess = !!vaultRecord
  }

  if (!hasAccess) {
      console.log(`[ACCESS_DENIED] User ${user.email} attempted to download artifact ${targetId} without authorization.`);
      throw new Error("Access Denied: Product Not Owned")
  }

  // 🛰️ STATEFUL TOKEN GENERATION (Single-Use Protocol)
  const { data: tokenRecord, error: tokenError } = await admin
    .from('secure_download_tokens')
    .insert({
        user_id: user.id,
        item_id: targetId,
        item_type: isIndividualSample ? 'sample' : 'pack',
        client_ip: clientIp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 Minute Signal
    })
    .select('id')
    .single();

  if (tokenError || !tokenRecord) {
      console.error("[TOKEN_PROTOCOL_FAULT]", tokenError);
      throw new Error("SECURE_TOKEN_FAILURE: Link generation failed.");
  }

  // 📡 RETURN THE PROTECTED ENDPOINT (DB Linked UUID)
  return `/api/download/${tokenRecord.id}`
}
