'use server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function getAllCategories() {
  const adminClient = getAdminClient()
  const { data, error } = await adminClient.from('categories').select('*').order('name')
  if (error) {
    console.error('[BROWSE_ACTION_ERROR]', error);
    return [];
  }
  return data
}

export async function getFilteredPacks(filters: { query?: string, category?: string, filter?: string }) {
  const adminClient = getAdminClient()
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = adminClient.from('sample_packs').select('id, name, slug, description, price_inr, price_usd, cover_url, category_id, is_featured, created_at, categories(name)')
  
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
    const fallbackQuery = adminClient.from('sample_packs').select('id, name, slug, description, price_inr, price_usd, cover_url, category_id, is_featured, created_at')
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
  key?: string,
  genre?: string,
  sort?: string,
  limit?: string,
  page?: string,
  tag?: string,
  packId?: string
}) {
  const adminClient = getAdminClient()
  const cleanQuery = filters.query?.trim()
  const limitVal = parseInt(filters.limit || '20')
  const pageVal = parseInt(filters.page || '1')
  const from = (pageVal - 1) * limitVal
  const to = from + limitVal - 1
  
  let queryBuilder = adminClient.from('samples').select('id, name, bpm, key, credit_cost, pack_id, type, ai_genre, tags, time_signature, created_at, sample_packs(name, category_id, cover_url)', { count: 'exact' })
  
  // 🎹 ENHANCED STUDIO CONSOLE FILTERS
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  if (filters.tag) {
    queryBuilder = queryBuilder.contains('tags', [filters.tag.toLowerCase()])
  }

  if (filters.packId) {
    queryBuilder = queryBuilder.eq('pack_id', filters.packId)
  }

  if (filters.bpm_min !== undefined) queryBuilder = queryBuilder.gte('bpm', filters.bpm_min);
  if (filters.bpm_max !== undefined) queryBuilder = queryBuilder.lte('bpm', filters.bpm_max);

  if (filters.key && filters.key !== 'all') {
    const orSignal = `key.ilike.%${filters.key}%`;
    queryBuilder = queryBuilder.or(orSignal);
  }

  if (filters.genre) {
    const genreVal = filters.genre.toLowerCase();
    queryBuilder = queryBuilder.or(`name.ilike.%${genreVal}%,tags.cs.{${genreVal}}`)
  }

  if (filters.type) {
    const typeLabel = filters.type.toLowerCase()
    if (typeLabel === 'loops') {
        queryBuilder = queryBuilder.gt('bpm', 0).not('bpm', 'is', null);
    } else if (typeLabel === 'oneshots') {
        queryBuilder = queryBuilder.or('bpm.eq.0,bpm.is.null');
    }
  }

  const sortCol = filters.sort === 'bpm' ? 'bpm' : (filters.sort === 'key' ? 'key' : 'created_at');
  queryBuilder = queryBuilder.order(sortCol, { ascending: filters.sort !== 'newest' });

  // Range-based pagination
  let { data, error, count } = await queryBuilder.range(from, to)
  
  if (error) {
    console.error('[BROWSE_ACTION_ERROR_SAMPLES]', error);
    return { samples: [], count: 0 };
  }

  let processedData = data || [];
  if (filters.category && data) {
    processedData = data.filter((s: any) => s.sample_packs?.category_id === filters.category)
  }

  return { samples: processedData, count: count || 0 }
}

export async function getRelatedPacks(currentPackId: string, categoryId: string) {
  const adminClient = getAdminClient()
  const { data, error } = await adminClient
    .from('sample_packs')
    .select('id, name, slug, description, price_inr, cover_url, category_id, is_featured, created_at')
    .eq('category_id', categoryId)
    .neq('id', currentPackId)
    .limit(4)
  
  if (error) {
    console.error('[BROWSE_ACTION_ERROR]', error);
    return [];
  }
  return data
}

export async function unlockSampleBatch(sampleIds: string[]) {
  const supabase = await createClient()
  const adminClient = getAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Please login to unlock sounds' }

  // 1. Calculate total credit cost with Admin Signal
  const { data: samples, error: sError } = await adminClient
      .from('samples')
      .select('id, credit_cost')
      .in('id', sampleIds)

  if (sError || !samples) return { success: false, error: 'Could not fetch sample metadata' }
  const totalCost = samples.reduce((sum, s: any) => sum + (s.credit_cost || 1), 0)

  // 2. Fetch User Account State
  const { data: account } = await adminClient
      .from('user_accounts')
      .select('credits')
      .eq('user_id', user.id)
      .single()

  if (!account || account.credits < totalCost) {
      return { success: false, error: `Insufficient Credits (Need ${totalCost} CR)` }
  }

  // 3. Perform Batch Transaction
  const dataToInsert = sampleIds.map(id => ({
      user_id: user.id,
      item_id: id,
      item_type: 'sample'
  }))

  const { error: batchError } = await adminClient
      .from('user_vault')
      .insert(dataToInsert)

  if (batchError) {
      return { success: false, error: 'Batch acquisition terminal error.' }
  }

  // 4. Final Balance Update Signal
  await adminClient
      .from('user_accounts')
      .update({ credits: account.credits - totalCost })
      .eq('user_id', user.id)

  return { 
      success: true, 
      count: sampleIds.length, 
      cost: totalCost 
  }
}
