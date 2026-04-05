import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@/lib/supabase/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'

function makeDirectLink(url: string): string {
  if (!url) return ''

  // Support for Google Drive links
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/[-\w]{25,}/)?.[0]
    if (!fileId) return url
    return `https://drive.google.com/uc?export=download&id=`
  }

  // Support for Dropbox links
  if (url.includes('dropbox.com')) {
    return url.replace('?dl=0', '?dl=1')
  }

  return url
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      sampleId: string
      ip: string
    }

    // IP Locking
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    if (decoded.ip && decoded.ip !== clientIp && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Link locked to original requester' }, { status: 403 })
    }

    const supabase = await createClient()

    // Check if the sample exists and get its download URL
    const { data: sample, error } = await supabase
      .from('samples')
      .select('name, download_url')
      .eq('id', decoded.sampleId)
      .single()

    if (error || !sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    // Convert to direct link
    const directLink = makeDirectLink(sample.download_url)
    
    // Redirect to direct download with attachment header
    const response = NextResponse.redirect(directLink, { status: 302 })
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Content-Disposition', `attachment; filename="\.wav\"`)

    return response
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json({ error: 'Unauthorized or expired' }, { status: 401 })
  }
}
