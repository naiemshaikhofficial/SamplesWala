import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded.sampleId !== id || decoded.purpose !== 'preview') {
            console.error("[AUDIO PROXY] Token Mismatch:", { decoded, id });
            return new NextResponse('Invalid Security Token', { status: 401 });
        }
    } catch (e: any) {
        console.error("[AUDIO PROXY] JWT Verify Error:", e.message);
        return new NextResponse(`Token Error: ${e.message}`, { status: 401 });
    }

    // 🛡️ SECURITY LAYER 2: Mandatory Referer check
    // This stops anyone from copy-pasting the link into a new tab
    const referer = req.headers.get('referer') || '';
    const host = req.headers.get('host') || '';
    
    if (!referer || !referer.includes(host)) {
        console.error("[AUDIO PROXY] Direct Access Hijack Blocked:", { referer, host });
        return new NextResponse('Direct Access Blocked (Security Code 102)', { status: 403 });
    }

    const { data: sample, error: dbError } = await supabaseAdmin.from('samples').select('audio_url').eq('id', id).single();
    if (dbError || !sample) {
        console.error("[AUDIO PROXY] DB Error:", dbError);
        return new NextResponse('Not found', { status: 404 });
    }

    const dbUrl = sample.audio_url;
    let finalUrl = dbUrl, cookie = '', fileId = '';
    const extractedId = getDriveFileId(dbUrl);

    if (extractedId) {
      fileId = extractedId;
      const cached = urlCache.get(fileId);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        finalUrl = cached.url; cookie = cached.cookie;
      } else {
        const resolved = await resolveFinalDriveUrl(`https://drive.google.com/uc?export=download&id=${fileId}`);
        finalUrl = resolved.url; cookie = resolved.cookie;
        urlCache.set(fileId, { url: finalUrl, cookie, timestamp: Date.now() });
      }
    }

    console.log(`[AUDIO PROXY] Fetching binary from: ${finalUrl.substring(0, 50)}...`);

    const range = req.headers.get('range');
    const requestHeaders: HeadersInit = { 'User-Agent': USER_AGENT };
    if (cookie) requestHeaders['Cookie'] = cookie;
    if (range) requestHeaders['Range'] = range;

    const upstreamResponse = await fetch(finalUrl, { headers: requestHeaders });
    if (!upstreamResponse.ok) {
        console.error("[AUDIO PROXY] Upstream Error:", upstreamResponse.status);
        return new NextResponse(`Error: ${upstreamResponse.status}`, { status: upstreamResponse.status });
    }

    const responseHeaders = new Headers();
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach(h => {
        const val = upstreamResponse.headers.get(h);
        if (val) responseHeaders.set(h, val);
    });
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(upstreamResponse.body, { status: upstreamResponse.status, headers: responseHeaders });
  } catch (error: any) {
    console.error('[AUDIO PROXY] Global Error:', error.message);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
