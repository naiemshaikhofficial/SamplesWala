'use server'
import { createClient } from '@/lib/supabase/server'

export async function getFilteredPacks(filters: { query?: string, category?: string }) {
  const supabase = await createClient()
  let query = supabase.from('sample_packs').select('*, categories(name)')
  if (filters.query) query = query.ilike('name', %\%)
  if (filters.category) query = query.eq('category_id', filters.category)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRelatedPacks(currentPackId: string, categoryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sample_packs')
    .select('*, categories(name)')
    .eq('category_id', categoryId)
    .neq('id', currentPackId)
    .limit(4)
  if (error) throw error
  return data
}
