import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================================
// NUCLEAR CONFIGURATION (Edge-Compatible)
// ============================================================================

const rateLimitStore = new Map<string, { count: number; reset: number }>();

const SENSITIVE_PATHS = ['/api/auth', '/api/payment', '/admin'];

// 🛡️ BATTLE_HARDENED_BOT_BLOCKER: Block known bandwidth-heavy crawlers
const BLOCKED_BOTS = [
  'ahrefsbot', 'semrushbot', 'dotbot', 'rogerbot', 'exabot', 'mj12bot', 
  'backlinkchecker', 'megaindex', 'grapeshot', 'seznam', 'mail.ru', 
  'yandexbot', 'baiduspider', 'petalbot', 'sogou', 'petalbot', 'aspiegelbot',
  'amazonbot', 'claudebot', 'gptbot', 'bytespider', 'ccbot', 'diffbot'
];


// 🧬 PRE-COMPUTED CSP: Built once at cold start, reused for every request
let _cachedCSP: string | null = null;
function getStaticCSP(): string {
  if (_cachedCSP) return _cachedCSP;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const connectSrc = [
    "'self'", supabaseUrl, "https://*.supabase.co", "wss://*.supabase.co",
    "https://*.workers.dev", "https://drive.google.com",
    "https://*.trustpilot.com", "https://*.razorpay.com",
    "https://www.paypal.com", "https://*.paypal.com",
    "https://challenges.cloudflare.com"
  ].filter(Boolean).join(' ');
  const scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval' https://*.razorpay.com https://*.trustpilot.com https://widget.trustpilot.com https://www.paypal.com https://*.paypalobjects.com https://challenges.cloudflare.com";
  const frameSrc = "'self' https://*.razorpay.com https://*.trustpilot.com https://api-m.sandbox.paypal.com https://www.paypal.com https://*.paypal.com https://challenges.cloudflare.com";
  _cachedCSP = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `connect-src ${connectSrc}`,
    "img-src 'self' data: https: https://*.trustpilot.com https://*.razorpay.com https://*.paypalobjects.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "media-src 'self' blob: data: https://*.supabase.co https://*.workers.dev",
    `frame-src ${frameSrc}`,
    "frame-ancestors 'none'"
  ].join('; ');
  return _cachedCSP;
}

/** 
 * NEXT_SAMPLESWALA_V5 RELIANCE PROXY (NUCLEAR UPGRADE)
 * Handles Gatekeeping, SEO Protection, and Security Headers.
 */
export async function proxy(request: NextRequest) {
  // 🏎️ 0. PREFETCH_OPTIMIZATION
  // Skip heavy logic for Next.js prefetches to save CPU cycles & Invocations.
  const isPrefetch = request.headers.get('next-router-prefetch') || 
                     request.headers.get('purpose') === 'prefetch' ||
                     request.headers.get('x-middleware-prefetch') === '1';

  if (isPrefetch) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 🛡️ WEBHOOK_BYPASS: Protocols like Razorpay/PayPal handle their own security.
  // Bypassing proxy to prevent Rate Limiting or Bot Shield from blocking critical signals.
  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const isApi = pathname.startsWith('/api');
  const isSensitive = SENSITIVE_PATHS.some(p => pathname.startsWith(p));

  // 🛡️ 1. SELECTIVE RATE LIMITING
  // Only apply strict rate limiting to API and sensitive sectors to save CPU on public traffic.
  if (isApi || isSensitive) {
    const now = Date.now();
    const limitKey = `${ip}:${isSensitive ? 'sensitive' : 'api'}`;
    const entry = rateLimitStore.get(limitKey) || { count: 0, reset: now + 60000 };

    if (now > entry.reset) {
      entry.count = 1;
      entry.reset = now + 60000;
    } else {
      entry.count++;
    }
    rateLimitStore.set(limitKey, entry);

    if (entry.count > (isSensitive ? 20 : 100)) {
      return new NextResponse(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 🤖 2. BOT SHIELD (Allow Google, Block Scrapers)
  const ua = request.headers.get('user-agent') || '';
  const isBot = /bot|spider|crawl|scraper|curl|wget|python|libwww|headless/i.test(ua);
  const isGoodBot = /googlebot|bingbot|yandexbot|duckduckbot/i.test(ua);

  if (isBot && !isGoodBot && isApi) {
    return new NextResponse("Automated access restricted.", { status: 403 });
  }

  // 🛡️ AGGRESSIVE_BOT_SHIELD: Kill known aggressive crawlers everywhere
  if (BLOCKED_BOTS.some(bot => ua.toLowerCase().includes(bot))) {
    return new NextResponse('Crawler Blocked', { status: 403 });
  }


  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 🛡️ SECURITY_GATE: Identify secured sectors
  const isProtectedRoute = pathname.startsWith('/library') || pathname.startsWith('/settings');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthCallback = pathname.startsWith('/auth/callback');

  // 🧪 AUTH_SIGNAL_OPTIMIZATION: Defer client creation to ONLY secured routes.
  // This saves massive resources on public traffic (99% of requests).
  if (isProtectedRoute || isAdminRoute || isAuthCallback) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (isAdminRoute) {
      if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
      
      const userEmail = user.email?.toLowerCase() || '';
      const role = user.app_metadata?.role || user.user_metadata?.role;
      const isAuthorized = role === 'admin' || userEmail === 'naiemshaikh@gmail.com' || userEmail.includes('naiem');

      if (!isAuthorized) return NextResponse.redirect(new URL('/browse', request.url));
    }
  }

  // 🏛️ NUCLEAR SEO & SECURITY HEADERS (Offloaded to Edge)
  // Note: These are also in next.config.ts for redundancy but enforced here for API/Direct hits
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // CSP set below via getStaticCSP()

  // API No-Index Protection
  if (pathname.startsWith("/api")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Content Security Policy (Pre-computed at cold start)
  response.headers.set("Content-Security-Policy", getStaticCSP());

  // 🧬 EDGE_CACHE_HINTS: Optimize media delivery
  if (pathname.startsWith('/api/audio')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  return response;

}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|Logo\\.png|robots\\.txt|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|m4a|ogg|flac|ico|css|js|woff2?|ttf|json|xml|txt|webmanifest|PNG|JPG|JPEG|MP3|WAV|M4A)$).*)',
  ],
}
