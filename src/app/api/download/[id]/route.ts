import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyDownloadToken } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: token } = await params
    const clientIp = request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown"

    // 1. 🛡️ VERIFY TOKEN & IP LOCK
    const payload = await verifyDownloadToken(token)
    if (!payload || !payload.id) return new NextResponse("Unauthorized", { status: 403 })

    if (payload.ip && payload.ip !== clientIp && clientIp !== "unknown" && payload.ip !== "unknown") {
       return new NextResponse("Unauthorized IP", { status: 403 })
    }

    const packId = payload.id as string
    const supabase = await createClient()

    // 2. 📡 GET SOURCE
    const { data: pack } = await supabase
      .from('sample_packs')
      .select('name, full_pack_download_url')
      .eq('id', packId)
      .maybeSingle()

    if (!pack?.full_pack_download_url) return new NextResponse("Source Missing", { status: 404 })

    const driveUrl = pack.full_pack_download_url
    const fileId = driveUrl.match(/\/d\/(.+?)\//)?.[1] || driveUrl.match(/id=(.+?)(&|$)/)?.[1]
    
    // 🚀 STEP 3: AUTHORIZED REDIRECT (Reliable for 350MB+)
    // We use confirm=t to skip warnings for small files. 
    // For large ones, the browser will natively handle the Google Warning page.
    const finalDownloadUrl = fileId 
      ? `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t` 
      : pack.full_pack_download_url

    console.log(`[SECURE_DOWNLOAD] Success: Handing over to Browser engine for ${pack.name}`)

    const response = NextResponse.redirect(finalDownloadUrl, { status: 302 })
    response.headers.set("Cache-Control", "no-store")
    
    return response

  } catch (error: any) {
    console.error("[SHIELD_CRASH]:", error)
    return new NextResponse("Tunnel Error: " + error.message, { status: 500 })
  }
}
