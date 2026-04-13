import { createBrowserClient } from '@supabase/ssr'

let client: any = null;

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient<any, "public">(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!client) {
    client = createBrowserClient<any, "public">(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return client
}
