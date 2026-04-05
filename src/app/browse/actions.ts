'use server'
import { createClient } from '@/lib/supabase/server'

export async function getAllCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function getFilteredPacks(filters: { query?: string, category?: string }) {
  const supabase = await createClient()
  let query = supabase.from('sample_packs').select('*, categories(name)')
  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFilteredSamples(filters: { query?: string, category?: string }) {
  const supabase = await createClient()
  
  // Basic search for individual samples
  let query = supabase.from('samples').select('*, sample_packs(name, category_id)')
  
  if (filters.query) {
    query = query.ilike('name', `%${filters.query}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
  if (error) throw error

  // Manual filter for category if needed (since samples are linked to packs)
  if (filters.category) {
    return data.filter((s: any) => s.sample_packs?.category_id === filters.category)
  }

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
