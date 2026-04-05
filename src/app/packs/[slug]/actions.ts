'use server'
import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'

export async function unlockSample(sampleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authorization required to unlock sounds.')
  const { data: sub } = await supabase.from('user_subscriptions').select('*').eq('user_id', user.id).single()
  if (!sub || (sub.status !== 'active' && !(sub.status === 'cancelled' && sub.credits_expiry && new Date(sub.credits_expiry) > new Date()))) {
    throw new Error('Active subscription required.')
  }
  if (sub.current_credits <= 0) throw new Error('Insufficient credits.')
  await supabase.from('user_subscriptions').update({ current_credits: sub.current_credits - 1 }).eq('user_id', user.id)
  await supabase.from('unlocked_samples').insert({ user_id: user.id, sample_id: sampleId })
  revalidatePath('/packs/[slug]', 'page')
  return { success: true }
}

export async function unlockFullPack(packId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Auth required')
  
  const { data: pack } = await supabase.from('sample_packs').select('*').eq('id', packId).single()
  const { data: sub } = await supabase.from('user_subscriptions').select('*').eq('user_id', user.id).single()
  
  if (!sub || sub.current_credits < (pack?.bundle_credit_cost || 50)) throw new Error('Insufficient credits for bundle.')
  
  const { data: samples } = await supabase.from('samples').select('id').eq('pack_id', packId)
  if (!samples) return { success: true }

  // Transaction: Deduct bundle cost & Unlock all samples
  await supabase.from('user_subscriptions').update({ current_credits: sub.current_credits - (pack?.bundle_credit_cost || 50) }).eq('user_id', user.id)
  const unlockEntries = samples.map(s => ({ user_id: user.id, sample_id: s.id }))
  await supabase.from('unlocked_samples').upsert(unlockEntries, { onConflict: 'user_id,sample_id' })
  
  revalidatePath('/packs/[slug]', 'page')
  return { success: true }
}

export async function generateDownloadToken(sampleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Auth required')
  const { data: isUnlocked } = await supabase.from('unlocked_samples').select('*').eq('sample_id', sampleId).eq('user_id', user.id).single()
  if (!isUnlocked) throw new Error('Unlock sound first.')
  const clientIp = (await headers()).get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const token = jwt.sign({ userId: user.id, sampleId: sampleId, ip: clientIp }, JWT_SECRET, { expiresIn: '1h' })
  return token
}
