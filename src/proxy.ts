
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** 
 * NEXT_SAMPLESWALA_V5 RELIANCE PROXY
 * This version uses the modern 'proxy' convention for route gating.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 🛡️ SECURITY_GATE: Private Route Protection
  const path = request.nextUrl.pathname;
  const isProtectedRoute = path.startsWith('/library') || path.startsWith('/settings');
  const isAdminRoute = path.startsWith('/admin');

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 🏛️ ADMIN_GATE: Verified Identity Check
  if (isAdminRoute) {
     if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
     
     // Check for admin role in metadata
     const role = user.app_metadata?.role || user.user_metadata?.role;
     if (role !== 'admin') {
        return NextResponse.redirect(new URL('/browse', request.url));
     }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
