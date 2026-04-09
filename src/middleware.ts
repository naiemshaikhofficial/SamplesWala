
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** 
 * NEXT_SAMPLESWALA_V5 RELIANCE PROXY
 * This version uses the modern 'proxy' convention for route gating.
 */
export async function middleware(request: NextRequest) {
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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
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
     if (!user) {
        console.warn('🛡️ MIDDLEWARE :: No user found for admin route. Redirecting to login.');
        return NextResponse.redirect(new URL('/auth/login', request.url));
     }
     
     const userEmail = user.email?.toLowerCase() || '';
     const role = user.app_metadata?.role || user.user_metadata?.role;
     
     const isAuthorized = role === 'admin' || 
                         userEmail.includes('naiem') || 
                         userEmail.includes('sampleswala') || 
                         userEmail === 'naiemshaikh@gmail.com';

     if (!isAuthorized) {
        console.warn(`🛡️ MIDDLEWARE :: Unauthorized access attempt to ${path} by ${userEmail}`);
        return NextResponse.redirect(new URL('/browse', request.url));
     }
     
     console.log(`✅ MIDDLEWARE :: Authorized admin access to ${path} by ${userEmail}`);
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
