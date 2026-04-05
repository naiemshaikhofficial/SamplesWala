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
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = supabase.from('sample_packs').select('*, categories(name)')
  
  if (cleanQuery) {
    // 🔍 AUTOMATIC SEARCH: Name or Description (Case-insensitive)
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
  }
  
  if (filters.category) {
    queryBuilder = queryBuilder.eq('category_id', filters.category)
  }
  
  const { data, error } = await queryBuilder.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFilteredSamples(filters: { query?: string, category?: string, type?: string }) {
  const supabase = await createClient()
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = supabase.from('samples').select('*, sample_packs(name, category_id, cover_url)')
  
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  // 🏮 VIBE FILTER INJECTION
  if (filters.type) {
    const typeLabel = filters.type.toLowerCase()
    queryBuilder = queryBuilder.or(`name.ilike.%${typeLabel}%,tags.cs.{${typeLabel}}`)
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false }).limit(60)
  if (error) throw error

  let processedData = data;

  if (filters.category) {
    processedData = data.filter((s: any) => s.sample_packs?.category_id === filters.category)
  }

  return processedData
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
