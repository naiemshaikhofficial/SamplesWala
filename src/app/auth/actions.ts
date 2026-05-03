'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

async function verifyTurnstile(token: string | null) {
  if (!token) return false;
  
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Bypass if secret is not set yet (for local development/initial setup)
  if (!secret || secret === 'your_secret_key_here') return true;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('[TURNSTILE_VERIFICATION_FAILED]', error);
    return false;
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const turnstileToken = formData.get('cf-turnstile-response') as string
  const redirectTo = (formData.get('redirect') as string) || '/browse'

  // 🛡️ BOT_SHIELD
  const isHuman = await verifyTurnstile(turnstileToken)
  if (!isHuman) {
    return { error: 'Bot detection failed. Please refresh and try again.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, redirectTo }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const turnstileToken = formData.get('cf-turnstile-response') as string
  const redirectTo = (formData.get('redirect') as string) || '/browse'

  // 🛡️ BOT_SHIELD
  const isHuman = await verifyTurnstile(turnstileToken)
  if (!isHuman) {
    return { error: 'Security challenge failed. Please verify you are human.' }
  }

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
