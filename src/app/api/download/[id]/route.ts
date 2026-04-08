import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyDownloadToken } from '@/lib/jwt'
import { getDriveClient } from '@/lib/drive/automation'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

/**
 * 🛰️ SECURE_SIGNAL_BRIDGE (V4_STABLE)
 * Handling bit-level transmission from Google Drive to the user.
 * Hiding source URLs and bypassing Google's "File too large" warning screens.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: token } = await params
    const clientIp = request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"

    // 1. 🛡️ VERIFY TOKEN & IP LOCK
    const payload = await verifyDownloadToken(token) as any
    if (!payload || !payload.id) return new NextResponse("Unauthorized Pulse", { status: 403 })

    if (payload.ip && payload.ip !== clientIp && clientIp !== "unknown" && payload.ip !== "unknown") {
       return new NextResponse("Unauthorized: IP Lock Conflict", { status: 403 })
    }

    const targetId = payload.id as string
    const isSample = payload.isSample as boolean
    const supabase = await createClient()

    // 2. 📡 GET SECURE SOURCE
    let downloadUrl: string | undefined;
    let name: string | undefined;

    if (isSample) {
        const { data: sample } = await supabase.from('samples').select('name, download_url').eq('id', targetId).maybeSingle()
        downloadUrl = sample?.download_url;
        name = sample?.name;
    } else {
        const { data: pack } = await supabase.from('sample_packs').select('name, full_pack_download_url').eq('id', targetId).maybeSingle()
        downloadUrl = pack?.full_pack_download_url;
        name = pack?.name;
    }

    if (!downloadUrl) return new NextResponse("Registry Sync Error: File not found", { status: 404 })

    // 🚀 STEP 3: RESOLVE DRIVE IDENTITY
    const driveId = downloadUrl.match(/[-\w]{25,}/)?.[0]
    
    if (!driveId || !downloadUrl.includes('drive.google.com')) {
      return NextResponse.redirect(downloadUrl, { status: 302 })
    }

    /** 📠 STARTING DIRECT SIGNAL PIPE (V4 Authenticated) **/
    const drive = getDriveClient();
    console.log(`[DRIVE_BRIDGE] Initialized V4 Stream for: ${name}`);

    const driveResponse = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'stream' }
    )

    // Convert Node.js stream to Web stream
    const stream = driveResponse.data as unknown as Readable;

    const fileName = name?.endsWith('.rar') || name?.endsWith('.zip') || name?.endsWith('.wav') 
        ? name 
        : `${name}.${isSample ? 'wav' : 'zip'}`;

    return new Response(stream as any, {
      headers: {
        'Content-Type': driveResponse.headers['content-type'] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })

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
