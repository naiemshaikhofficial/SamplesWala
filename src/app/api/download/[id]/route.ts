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
       console.warn(`[IP_LOCK_CONFLICT] Expected ${tokenRecord.client_ip}, got ${clientIp}. Allowing for mobile compatibility.`);
       // return new NextResponse("Unauthorized: IP Lock Conflict", { status: 403 })
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
     * 🛰️ SAMPLES_WALA :: V11_IP_LOCKED_STEALTH
     * Signatures are now locked to the requester's IP.
     **/
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    const proxySecret = process.env.PROXY_SECRET;
    
    const headersList = await import('next/headers').then(h => h.headers());
    // clientIp already declared at the top, reusing it

    if (workerUrl && proxySecret && driveIdMatch) {
        const crypto = await import('crypto');
        
        // 🔐 AES-256-GCM Encryption
        const secretHash = crypto.createHash('sha256').update(proxySecret).digest();
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', secretHash, iv);
        let encryptedId = cipher.update(driveIdMatch, 'utf8', 'hex');
        encryptedId += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        const payload = iv.toString('hex') + encryptedId + authTag;

        // 🔐 Generate EXPIRING & TRIPLE-LOCKED Signature (IP + UserAgent)
        const timestamp = Math.floor(Date.now() / 1000) + 3600; // 1 Hour for Downloads
        const userAgent = (await headersList).get('user-agent') || 'UNKNOWN';
        
        const hmac = crypto.createHmac('sha256', proxySecret);
        // 🧬 V12_STABLE_SIGNAL :: Removed User-Agent from signature for mobile compatibility
        // Payload + Expiry + IP
        hmac.update(`${payload}:${timestamp}:${clientIp}`);
        
        const sig = hmac.digest('base64')
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");

        // 🏷️ Filename Branding
        const brandName = `SamplesWala - ${name || 'Asset'}`;
        const fileName = brandName + (isSample ? '.wav' : '.zip');
        const encodedName = encodeURIComponent(fileName);

        return NextResponse.redirect(`${workerUrl}?payload=${payload}&sig=${sig}&exp=${timestamp}&name=${encodedName}&download=1`);
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
