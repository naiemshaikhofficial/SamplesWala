import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================================
// NUCLEAR CONFIGURATION (Edge-Compatible)
// ============================================================================

const rateLimitStore = new Map<string, { count: number; reset: number }>();

const SENSITIVE_PATHS = ['/api/auth', '/api/payment', '/admin'];

/** 
 * NEXT_SAMPLESWALA_V5 RELIANCE PROXY (NUCLEAR UPGRADE)
 * Handles Gatekeeping, SEO Protection, and Security Headers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 🛡️ 1. RATE LIMITING (Basic Edge implementation)
  const now = Date.now();
  const limitKey = `${ip}:${pathname.startsWith('/api') ? 'api' : 'web'}`;
  const entry = rateLimitStore.get(limitKey) || { count: 0, reset: now + 60000 };

  if (now > entry.reset) {
    entry.count = 1;
    entry.reset = now + 60000;
  } else {
    entry.count++;
  }
  rateLimitStore.set(limitKey, entry);

  if (entry.count > (SENSITIVE_PATHS.some(p => pathname.startsWith(p)) ? 20 : 100)) {
    return new NextResponse(JSON.stringify({ error: "High traffic detected. Please slow down." }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
    });
  }

  // 🤖 2. BOT SHIELD (Allow Google, Block Scrapers)
  const ua = request.headers.get('user-agent') || '';
  const isSuspicious = /bot|spider|crawl|scraper|curl|wget|python|libwww|headless/i.test(ua) && 
                      !/googlebot|bingbot|yandexbot|duckduckbot/i.test(ua);

  if (isSuspicious && pathname.startsWith('/api')) {
    return new NextResponse("Automated access restricted.", { status: 403 });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 🧪 Supabase Auth Client
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

  const { data: { user } } = await supabase.auth.getUser();

  // 🛡️ SECURITY_GATE: Private Route Protection
  const isProtectedRoute = pathname.startsWith('/library') || pathname.startsWith('/settings');
  const isAdminRoute = pathname.startsWith('/admin');

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

  // 🏛️ NUCLEAR SEO HEADERS
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // API No-Index Protection
  if (pathname.startsWith("/api")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Content Security Policy (Nuclear Optimized)
  const connectSrc = [
    "'self'", 
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    "https://*.supabase.co",
    "wss://*.supabase.co", // Allow Supabase Realtime (WebSockets)
    "https://*.workers.dev", 
    "https://drive.google.com",
    "https://*.trustpilot.com", // Trustpilot API & Analytics
    "https://*.razorpay.com",    // Razorpay Metrics & API
    "https://www.paypal.com",    // PayPal API
    "https://*.paypal.com"
  ].filter(Boolean);

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://*.razorpay.com",       // Razorpay Scripts (cdn, checkout)
    "https://*.trustpilot.com",      // Trustpilot Scripts
    "https://widget.trustpilot.com",
    "https://www.paypal.com",       // PayPal Scripts
    "https://*.paypalobjects.com"   // PayPal Static Assets
  ];

  const frameSrc = [
    "'self'",
    "https://*.razorpay.com",       // Razorpay Checkout Frame
    "https://*.trustpilot.com",      // Trustpilot Widgets
    "https://api-m.sandbox.paypal.com",
    "https://www.paypal.com",
    "https://*.paypal.com"          // PayPal Checkout Frames
  ];

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
    "img-src 'self' data: https: https://*.trustpilot.com https://*.razorpay.com https://*.paypalobjects.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "media-src 'self' blob: data: https://*.supabase.co https://*.workers.dev",
    `frame-src ${frameSrc.join(' ')}`,
    "frame-ancestors 'none'"
  ].join('; ');

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|m4a|ogg|flac|PNG|JPG|JPEG|MP3|WAV|M4A)$).*)',
  ],
}
