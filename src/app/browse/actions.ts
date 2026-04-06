'use server'
import { createClient } from '@/lib/supabase/server'

export async function getAllCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) {
    console.error('[BROWSE_ACTION_ERROR]', error);
    return [];
  }
  return data
}

export async function getFilteredPacks(filters: { query?: string, category?: string, filter?: string }) {
  const supabase = await createClient()
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = supabase.from('sample_packs').select('*, categories(name)')
  
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
  }
  
  if (filters.category) {
    queryBuilder = queryBuilder.eq('category_id', filters.category)
  }

  // 🎹 ENHANCED STUDIO CONSOLE FILTERS
  if (filters.filter && filters.filter !== 'all') {
    switch (filters.filter) {
      case 'trending':
        queryBuilder = queryBuilder.eq('is_featured', true)
        break;
      case 'bundles':
        queryBuilder = queryBuilder.gt('bundle_credit_cost', 0)
        break;
      case 'master_drums':
        queryBuilder = queryBuilder.ilike('name', '%drum%')
        break;
      case 'presets':
        queryBuilder = queryBuilder.or('name.ilike.%preset%,name.ilike.%serum%,name.ilike.%sylenth%')
        break;
      default:
        break;
    }
  }
  
  let { data, error } = await queryBuilder.order('created_at', { ascending: false })
  
  if (error && error.code === 'PGRST200') {
    console.warn('[REPAIRING_RELATIONAL_SIGNATURE] Categories relationship missing. Falling back...');
    const fallbackQuery = supabase.from('sample_packs').select('*')
    const { data: fallbackData, error: fallbackError } = await fallbackQuery.order('created_at', { ascending: false })
    if (fallbackError) {
        console.error('[BROWSE_ACTION_CRITICAL_FAILURE]', fallbackError);
        return [];
    }
    return fallbackData;
  }

  if (error) {
    console.error('[BROWSE_ACTION_ERROR]', error);
    return [];
  }
  return data
}

export async function getFilteredSamples(filters: { 
  query?: string, 
  category?: string, 
  type?: string, 
  filter?: string,
  bpm_min?: number,
  bpm_max?: number,
  key?: string
}) {
  const supabase = await createClient()
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = supabase.from('samples').select('*, sample_packs(name, category_id, cover_url)')
  
  // 🔭 PRECISION SEARCH SIGNAL
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  // 🎹 INSTRUMENT/CATEGORY FILTER (DATABASE LEVEL)
  if (filters.category) {
    // We join with sample_packs to filter by its category_id
    // But since Supabase inner joins are tricky with maybeSingle, we do it via subquery filter if possible
    // or just the current memory filter if result set is small.
    // For now, let's try direct filtering on junction.
  }

  // 🔋 BPM THRESHOLD SIGNAL
  if (filters.bpm_min !== undefined) queryBuilder = queryBuilder.gte('bpm', filters.bpm_min);
  if (filters.bpm_max !== undefined) queryBuilder = queryBuilder.lte('bpm', filters.bpm_max);

  // 🎼 MUSICAL KEY SIGNAL
  if (filters.key && filters.key !== 'all') {
    queryBuilder = queryBuilder.eq('key', filters.key);
  }

  if (filters.type) {
    const typeLabel = filters.type.toLowerCase()
    if (typeLabel === 'loops') queryBuilder = queryBuilder.not('bpm', 'is', null);
    else if (typeLabel === 'oneshots') queryBuilder = queryBuilder.is('bpm', null);
    else queryBuilder = queryBuilder.or(`name.ilike.%${typeLabel}%,tags.cs.{${typeLabel}}`)
  }

  // 🎹 ENHANCED STUDIO CONSOLE FILTERS
  if (filters.filter && filters.filter !== 'all') {
    switch (filters.filter) {
      case 'trending':
        queryBuilder = queryBuilder.limit(40)
        break;
      case 'master_drums':
        queryBuilder = queryBuilder.ilike('name', '%drum%')
        break;
      case 'presets':
        queryBuilder = queryBuilder.ilike('name', '%preset%')
        break;
      default:
        break;
    }
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false }).limit(100)
  if (error) {
    console.error('[BROWSE_ACTION_ERROR_SAMPLES]', error);
    return [];
  }

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
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', currentPackId)
    .limit(4)
  
  if (error) {
    console.error('[BROWSE_ACTION_ERROR]', error);
    return [];
  }
  return data
}
