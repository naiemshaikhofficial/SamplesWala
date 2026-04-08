import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@/lib/supabase/server'
import { getDriveClient } from '@/lib/drive/automation'
import { Readable } from 'stream'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'

/**
 * 🛰️ SECURE_SIGNAL_BRIDGE (Direct Drive Proxy - V4)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // 1. Verify Secure Pulse (JWT)
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      sampleId: string
      ip: string
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    if (decoded.ip && decoded.ip !== clientIp && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Link locked to original requester' }, { status: 403 })
    }

    const supabase = await createClient()

    // 3. Ownership Verification
    const { data: sample, error } = await supabase
      .from('samples')
      .select('name, download_url')
      .eq('id', decoded.sampleId)
      .single()

    if (error || !sample) {
      return NextResponse.json({ error: 'Sample not found in archive.' }, { status: 404 })
    }

    // 4. Extract Artifact ID
    const driveId = sample.download_url.match(/[-\w]{25,}/)?.[0]
    
    if (!driveId || !sample.download_url.includes('drive.google.com')) {
      return NextResponse.redirect(sample.download_url)
    }

    /** 📠 V4 SIGNAL PIPE **/
    const drive = getDriveClient();
    const driveResponse = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'stream' }
    )

    const stream = driveResponse.data as unknown as Readable;
    
    const fileName = sample.name.endsWith('.wav') || sample.name.endsWith('.zip') || sample.name.endsWith('.rar') 
        ? sample.name 
        : `${sample.name}.wav`;

    return new Response(stream as any, {
      headers: {
        'Content-Type': driveResponse.headers['content-type'] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })

  } catch (err: any) {
    console.error('Download bridge failed:', err.message)
    return NextResponse.json({ error: 'Unauthorized or Config Error' }, { status: 401 })
  }
}
