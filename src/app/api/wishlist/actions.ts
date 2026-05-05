
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getServerAuth } from '@/lib/supabase/auth'

export async function toggleWishlist(sampleId: string) {
  const { user } = await getServerAuth()
  const supabase = await createClient()

  if (!user) return { error: 'Please login to favorite sounds' }

  // 1. Check if already in wishlist
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('sample_id', sampleId)
    .single()

  if (existing) {
    // 2. Remove if exists
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id)
    
    revalidatePath('/')
    return { status: 'removed', error }
  } else {
    // 3. Add if not exists
    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: user.id, sample_id: sampleId })
    
    revalidatePath('/')
    return { status: 'added', error }
  }
}

export async function getWishlist() {
  const { user } = await getServerAuth()
  const supabase = await createClient()

  if (!user) return []

  const { data } = await supabase
    .from('wishlist')
    .select('sample_id')
    .eq('user_id', user.id)

  return data?.map(d => d.sample_id) || []
}
