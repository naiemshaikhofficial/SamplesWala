import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyDownloadToken } from '@/lib/jwt'
import { getDriveClient } from '@/lib/drive/automation'
import { getAdminClient } from '@/lib/supabase/admin'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

/**
 * 🛰️ SECURE_SIGNAL_BRIDGE (V4_STABLE)
 * Handling bit-level transmission from Google Drive to the user.
 * Hiding source URLs and bypassing Google's "File too large" warning screens.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tokenId } = await params
    const clientIp = request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const admin = getAdminClient();

    // 1. 🛡️ STATEFUL_TOKEN_VERIFICATION (V5_HARDENED)
    const { data: tokenRecord, error: tokenError } = await admin
        .from('secure_download_tokens')
        .select('*')
        .eq('id', tokenId)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (tokenError || !tokenRecord) {
        console.error("[SHIELD_BRIDGE_DENIED]:", tokenError?.message || "Token used or expired");
        return new NextResponse("Unauthorized or Expired Signal", { status: 403 })
    }

    if (tokenRecord.client_ip && tokenRecord.client_ip !== clientIp && clientIp !== "unknown" && tokenRecord.client_ip !== "unknown") {
       return new NextResponse("Unauthorized: IP Lock Conflict", { status: 403 })
    }

    // 🧬 Update used_at AFTER validation to avoid race conditions with pre-fetchers
    await admin.from('secure_download_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenId);

    const targetId = tokenRecord.item_id
    const isSample = tokenRecord.item_type === 'sample'

    // 2. 📡 GET SECURE SOURCE (Using Admin Signal to bypass RLS on protected columns)
    let downloadUrl: string | undefined;
    let name: string | undefined;

    if (isSample) {
        const { data: sample } = await admin.from('samples').select('name, download_url').eq('id', targetId).maybeSingle()
        downloadUrl = sample?.download_url;
        name = sample?.name;
    } else {
        const { data: pack } = await admin.from('sample_packs').select('name, full_pack_download_url').eq('id', targetId).maybeSingle()
        downloadUrl = pack?.full_pack_download_url;
        name = pack?.name;
    }

    if (!downloadUrl) return new NextResponse("Registry Sync Error: File not found", { status: 404 })

    // 🚀 STEP 3: RESOLVE DRIVE IDENTITY
    const driveId = downloadUrl.match(/[-\w]{25,}/)?.[0]
    
    if (!driveId || !downloadUrl.includes('drive.google.com')) {
      return NextResponse.redirect(downloadUrl, { status: 302 })
    }

    /** 
     * 🛰️ ZERO-EGRESS REDIRECT HUB (Free Tier Optimization)
     * For large files (GBs), we redirect to Drive to save Vercel bandwidth.
     * Fingerprinting is disabled in this mode because the server never touches the bytes.
     * To re-enable security proxy, uncomment the 'Mode A/B' blocks below and comment the redirect.
     **/
    
    const driveIdMatch = downloadUrl.match(/[-\w]{25,}/)?.[0];
    if (!driveIdMatch) return NextResponse.redirect(downloadUrl);

    // 🧬 ZERO-EGRESS SYNC: Grant viewer access so they can download directly from Google
    // This offloads all bandwidth (GBs) to Google Drive.
    if (user?.email) {
        const { grantDrivePermission } = await import('@/lib/drive/automation');
        await grantDrivePermission(user.email, targetId, !isSample);
    }

    // 🔗 Secure Direct Action: Send user to a direct Drive download signal
    const secureDriveLink = `https://drive.google.com/uc?export=download&id=${driveIdMatch}`;
    
    return NextResponse.redirect(secureDriveLink);

    /* --- 🧬 FUTURE PROXY HUB (UNCOMMENT TO RE-ENABLE FINGERPRINTING) ---
    const drive = getDriveClient();
    const fileName = name?.endsWith('.rar') || name?.endsWith('.zip') || name?.endsWith('.wav') 
        ? name 
        : `${name}.${isSample ? 'wav' : 'zip'}`;

    const metadata = `SIGN:USER_ID:${tokenRecord.user_id}|EMAIL:${user?.email || 'unknown'}|LICENSE:SAMPLES_WALA_V1`;
    const metadataBuffer = Buffer.from(metadata, 'utf8');

    if (isSample) {
        // ... (In-Memory Logic)
    } else {
        // ... (Streaming Logic)
    }
    ------------------------------------------------------------------ */

  } catch (error: any) {
    console.error("[SHIELD_BRIDGE_FAULT]:", error.message)
    
    // Detailed error reporting for debugging
    return new Response(JSON.stringify({ 
        pulse: "Critical Interference",
        signal: error.message,
        hint: "Check GOOGLE_PRIVATE_KEY format in .env.local"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
