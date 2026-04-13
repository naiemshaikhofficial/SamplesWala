import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret-for-dev';

// Initialize Supabase Admin client (Build-safe Check)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Cache for resolved Drive links
type CachedData = { url: string; cookie: string; timestamp: number; };
const urlCache = new Map<string, CachedData>();
const CACHE_TTL = 45 * 60 * 1000;

function getDriveFileId(url: string): string | null {
  if (!url) return null;
  const regex = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:.+?\/)*(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getCookiesFromResponse(response: Response): string {
  const setCookieHeader = response.headers.get('set-cookie');
  if (!setCookieHeader) return '';
  return setCookieHeader.split(/,(?=\s*[^;]+=)/).map(c => c.split(';')[0].trim()).join('; ');
}

async function resolveFinalDriveUrl(url: string, cookie: string = ''): Promise<{ url: string, cookie: string }> {
  console.log(`[AUDIO PROXY] Resolving: ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': USER_AGENT, 'Cookie': cookie, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    redirect: 'manual'
  });

  const nextCookie = [cookie, getCookiesFromResponse(response)].filter(Boolean).join('; ');

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('Location');
    if (location) {
      const nextUrl = location.startsWith('http') ? location : `https://drive.google.com${location}`;
      return resolveFinalDriveUrl(nextUrl, nextCookie);
    }
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status === 200 && contentType.includes('text/html')) {
    const html = await response.text();
    const confirmMatch = html.match(/href="(\/uc\?[^"]*confirm=[^"]*[^"]*)"/);
    if (confirmMatch && confirmMatch[1]) {
      const confirmUrl = `https://drive.google.com${confirmMatch[1].replace(/&amp;/g, '&')}`;
      return resolveFinalDriveUrl(confirmUrl, nextCookie);
    }
  }

  return { url, cookie: nextCookie };
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const token = req.nextUrl.searchParams.get('token');
  
  if (!id || !token) {
    console.warn("[AUDIO PROXY] Missing id or token");
    return new NextResponse('Missing Security Token', { status: 401 });
  }

  try {
    // 🛡️ SECURITY LAYER 1: Verify JWT
    let decoded: any;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
        const isAdminRequest = id.endsWith('_lq') || id.endsWith('_hq');
        const isValidId = decoded.sampleId === id || (isAdminRequest && id.startsWith(decoded.sampleId));

        if (!isValidId || !['preview', 'download'].includes(decoded.purpose)) {
            console.error("[AUDIO PROXY] Token Mismatch:", { decoded, id });
            return new NextResponse('Invalid Security Token', { status: 401 });
        }
    } catch (e: any) {
        console.error("[AUDIO PROXY] JWT Verify Error:", e.message);
        return new NextResponse(`Token Error: ${e.message}`, { status: 401 });
    }

    const referer = req.headers.get('referer') || '';
    const origin = req.headers.get('origin') || '';
    const host = req.headers.get('host') || '';
    
    // 🛡️ SECURITY LAYER 2: Same-Origin & Anti-Hijack
    // Check if the request comes from our own app. 
    // Note: Some browsers strip referer on media/fetch redirects. 
    // We trust the JWT token as the primary security layer.
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const isInternal = referer.includes(host) || origin.includes(host);
    
    if (!isInternal && !isLocal && process.env.NODE_ENV === 'production') {
        console.error("[AUDIO PROXY] Direct Access Hijack Blocked:", { referer, origin, host });
        return new NextResponse('Direct Access Blocked (Security Code 102)', { status: 403 });
    }

    if (!supabaseAdmin) {
        console.error("[AUDIO PROXY] Supabase Admin not initialized. Check your environment variables.");
        return new NextResponse('Internal Server Error', { status: 500 });
    }

    const isLq = id.endsWith('_lq');
    const isHq = id.endsWith('_hq');
    const cleanId = id.replace('_lq', '').replace('_hq', '');

    const { data: sample, error: dbError } = await supabaseAdmin.from('samples').select('audio_url, download_url, name').eq('id', cleanId).single();
    if (dbError || !sample) {
        console.error("[AUDIO PROXY] DB Error:", dbError);
        return new NextResponse('Not found', { status: 404 });
    }

    const isDownload = decoded.purpose === 'download' || isHq;
    const dbUrl = (isHq || isDownload) ? sample.download_url : sample.audio_url;
    const extractedId = getDriveFileId(dbUrl);

    /** 
     * 🛰️ SAMPLES_WALA :: V11_IP_LOCKED_STEALTH
     * Signatures are now locked to the requester's IP for previews.
     **/
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    const proxySecret = process.env.PROXY_SECRET;
    
    const headersList = await import('next/headers').then(h => h.headers());
    const clientIp = (await headersList).get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    if (workerUrl && proxySecret && extractedId) {
        const crypto = (await import('crypto')).default || await import('crypto');
        
        // 🔐 AES-256-GCM Encryption
        const secretHash = crypto.createHash('sha256').update(proxySecret).digest();
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', secretHash, iv);
        let encryptedId = cipher.update(extractedId, 'utf8', 'hex');
        encryptedId += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        const payload = iv.toString('hex') + encryptedId + authTag;

        // 🔐 Generate SHORT-LIVED & TRIPLE-LOCKED Signature (2 Minute Preview)
        const timestamp = Math.floor(Date.now() / 1000) + 120; 
        const userAgent = (await headersList).get('user-agent') || 'UNKNOWN';
        
        const hmac = crypto.createHmac('sha256', proxySecret);
        // Payload + Expiry + IP + UA
        hmac.update(`${payload}:${timestamp}:${clientIp}:${userAgent}`);
        
        const sig = hmac.digest('base64')
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");

        // Branding & Name
        const brandName = `SamplesWala - ${sample.name || 'Preview'}`;
        const encodedName = encodeURIComponent(brandName);

        // Redirect using V11 Parameters
        const redirectUrl = `${workerUrl}?payload=${payload}&sig=${sig}&exp=${timestamp}&name=${encodedName}${isDownload ? '&download=1' : ''}`;
        return NextResponse.redirect(redirectUrl);
    }

    // Fallback: Direct Drive (Only if Cloudflare is down)
    return NextResponse.redirect(`https://drive.google.com/uc?export=download&id=${extractedId}`);

  } catch (error: any) {
    console.error('[AUDIO PROXY] Global Error:', error.message);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
