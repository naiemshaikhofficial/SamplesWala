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
      case 'master_drums':
        queryBuilder = queryBuilder.ilike('name', '%drum%')
        break;
      case 'presets':
        queryBuilder = queryBuilder.or('name.ilike.%preset%,name.ilike.%serum%,name.ilike.%sylenth%')
        break;
      case 'plugin':
        queryBuilder = queryBuilder.or('name.ilike.%plugin%,description.ilike.%plugin%')
        break;
      case 'recent_files':
        // Handled by default ordering usually, but we could add a date filter if we had many
        break;
      case 'studio_packs':
        // Default behavior for packs
        break;
      case 'star':
        // Mocking 'starred' via a high rating or specific tag if existed, 
        // for now let's just use a sample of high-quality ones
        queryBuilder = queryBuilder.limit(10)
        break;
      default:
        // No specific filter applied for other IDs yet
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

export async function getFilteredSamples(filters: { query?: string, category?: string, type?: string, filter?: string }) {
  const supabase = await createClient()
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = supabase.from('samples').select('*, sample_packs(name, category_id, cover_url)')
  
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  if (filters.type) {
    const typeLabel = filters.type.toLowerCase()
    queryBuilder = queryBuilder.or(`name.ilike.%${typeLabel}%,tags.cs.{${typeLabel}}`)
  }

  // 🎹 ENHANCED STUDIO CONSOLE FILTERS
  if (filters.filter && filters.filter !== 'all') {
     switch (filters.filter) {
      case 'master_drums':
        queryBuilder = queryBuilder.ilike('name', '%drum%')
        break;
      case 'presets':
        queryBuilder = queryBuilder.ilike('name', '%preset%')
        break;
      case 'plugin':
        queryBuilder = queryBuilder.ilike('name', '%plugin%')
        break;
      case 'recent_files':
        // Default ordering handles this
        break;
      case 'star':
        // Mocking featured samples
        queryBuilder = queryBuilder.limit(20)
        break;
      default:
        break;
    }
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false }).limit(60)
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
