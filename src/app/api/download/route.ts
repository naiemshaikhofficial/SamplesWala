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

    // 3. Ownership & Trial Shield Verification
    const { data: userAccount } = await supabase
      .from('user_accounts')
      .select('is_trial_active, trial_downloads_count')
      .eq('user_id', decoded.userId)
      .single()

    if (userAccount?.is_trial_active) {
      if ((userAccount.trial_downloads_count || 0) >= 10) {
        return NextResponse.json({ 
          error: 'Trial limit reached. Please wait for your first full payment to unlock unlimited downloads.' 
        }, { status: 403 })
      }
      
      // Increment Trial Signal Counter
      await supabase
        .from('user_accounts')
        .update({ trial_downloads_count: (userAccount.trial_downloads_count || 0) + 1 })
        .eq('user_id', decoded.userId)
    }

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

    /** 📠 V4 SIGNAL PIPE :: CLOUDFLARE_STEALTH_UPGRADE **/
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    const proxySecret = process.env.PROXY_SECRET;

    if (workerUrl && proxySecret && driveId) {
      const crypto = await import('crypto');
      
      // 🔐 AES-256-GCM Encryption (Sync with [id] protocol)
      const secretHash = crypto.createHash('sha256').update(proxySecret).digest();
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', secretHash, iv);
      let encryptedId = cipher.update(driveId, 'utf8', 'hex');
      encryptedId += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      const payload = iv.toString('hex') + encryptedId + authTag;

      // 🔐 Generate EXPIRING Signature (1 Hour for Downloads)
      const timestamp = Math.floor(Date.now() / 1000) + 3600; 
      
      const hmac = crypto.createHmac('sha256', proxySecret);
      hmac.update(`${payload}:${timestamp}`);
      
      const sig = hmac.digest('base64')
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");

      const fileName = sample.name.endsWith('.wav') || sample.name.endsWith('.zip') || sample.name.endsWith('.rar') 
          ? sample.name 
          : `${sample.name}.wav`;
      const encodedName = encodeURIComponent(`SamplesWala - ${fileName}`);

      return NextResponse.redirect(`${workerUrl}?payload=${payload}&sig=${sig}&exp=${timestamp}&name=${encodedName}&download=1`);
    }

    // 🔄 Fallback: Direct Drive
    const fallbackUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
    return NextResponse.redirect(fallbackUrl);

  } catch (err: any) {
    console.error('Download bridge failed:', err.message)
    return NextResponse.json({ error: 'Unauthorized or Config Error' }, { status: 401 })
  }
}
