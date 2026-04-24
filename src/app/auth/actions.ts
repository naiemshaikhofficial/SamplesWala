'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/browse'

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const redirectTo = (formData.get('redirect') as string) || '/browse'

  // 🛡️ PROFANITY FILTER
  const { containsProfanity } = await import('@/lib/profanity')
  if (containsProfanity(name)) {
    return { error: 'Please use a more appropriate name for our professional community.' }
  }

  // 🛡️ STRICT GMAIL ENFORCEMENT
  if (!email.endsWith('@gmail.com')) {
    return { error: 'Only @gmail.com emails are allowed to maintain high-quality producer signal.' }
  }

  // Use current origin if available, or fallback to env
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sampleswala.com'
  const nextPath = encodeURIComponent('/auth/verify-success')

  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
        data: {
            full_name: name
        },
        emailRedirectTo: `${siteUrl}/auth/callback?next=${nextPath}`
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  // Use current origin if available, or fallback to env
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sampleswala.com'
  const nextPath = encodeURIComponent('/auth/reset-password')
  
  // Set a temporary cookie to remember intent (expires in 10 mins)
  const cookieStore = await cookies()
  cookieStore.set('reset_flow', 'true', { maxAge: 600, path: '/' })

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=${nextPath}`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  redirect('/browse?status=password-updated')
}
