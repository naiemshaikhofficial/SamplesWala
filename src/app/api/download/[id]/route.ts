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

    const driveIdMatch = downloadUrl.match(/[-\w]{25,}/)?.[0]
    
    if (!driveIdMatch || !downloadUrl.includes('drive.google.com')) {
      return NextResponse.redirect(downloadUrl, { status: 302 })
    }

    /** 
     * 🛰️ ULTRA_STEALTH_HUB (V8_HMAC_ENCRYPTED)
     * Security Upgrade: We now use a HMAC signature instead of a plaintext secret.
     * Your master secret stays hidden on the server!
     **/
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    const proxySecret = process.env.PROXY_SECRET;

    if (workerUrl && proxySecret && driveIdMatch) {
        // 🔐 Generate HMAC-SHA256 Signature
        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha256', proxySecret);
        hmac.update(driveIdMatch);
        const sig = hmac.digest('base64')
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");

        // 🏷️ Add Branding, Filename & Extension (e.g. SamplesWala - DrumKit.zip)
        const brandName = `SamplesWala - ${name || 'Asset'}`;
        const fileName = brandName + (isSample ? '.wav' : '.zip');
        const encodedName = encodeURIComponent(fileName);

        return NextResponse.redirect(`${workerUrl}?id=${driveIdMatch}&sig=${sig}&name=${encodedName}`);
    }

    // 🔄 Fallback: Direct Drive
    const secureDriveLink = `https://drive.google.com/uc?export=download&id=${driveIdMatch}`;
    return NextResponse.redirect(secureDriveLink);

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
