'use server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

import { unstable_cache } from 'next/cache'
import { generateAudioSignal, getDriveFileId } from '@/lib/audio/signal'

import { cache } from 'react'

export const getAllCategories = cache(unstable_cache(
  async () => {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient.from('categories').select('*').order('name')
    if (error) {
      console.error('[BROWSE_ACTION_ERROR]', error);
      return [];
    }
    return data
  },
  ['global-categories-cache'],
  { revalidate: 86400 } // Align with 24h cycle
))

export async function getFilteredPacks(filters: { query?: string, category?: string, filter?: string }) {
  const adminClient = getAdminClient()
  const cleanQuery = filters.query?.trim()
  
  let queryBuilder = adminClient.from('sample_packs').select('id, name, slug, description, price_inr, price_usd, cover_url, category_id, is_featured, created_at, categories(name)')
  
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
  }
  
  if (filters.category) {
    const categories = await getAllCategories()
    const category = categories.find((c: any) => c.slug === filters.category || c.id === filters.category)
    if (category) {
      queryBuilder = queryBuilder.eq('category_id', category.id)
    }
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
  
  let { data, error } = await queryBuilder.order('created_at', { ascending: false }).limit(50)
  
  if (error && error.code === 'PGRST200') {
    const fallbackQuery = adminClient.from('sample_packs').select('id, name, slug, description, price_inr, price_usd, cover_url, category_id, is_featured, created_at')
    const { data: fallbackData, error: fallbackError } = await fallbackQuery.order('created_at', { ascending: false }).limit(50)
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
  
  let queryBuilder = adminClient.from('artifact_registry').select('id, name, audio_url, bpm, key, credit_cost, pack_id, type, created_at, pack_name, pack_category_id, pack_cover_url, popularity_score', { count: 'exact' })
  
  // 🎹 ENHANCED STUDIO CONSOLE FILTERS
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  if (filters.category) {
    const categories = await getAllCategories()
    const category = categories.find((c: any) => c.slug === filters.category || c.id === filters.category)
    if (category) {
      queryBuilder = queryBuilder.eq('pack_category_id', category.id)
    }
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
    } else if (typeLabel === 'presets') {
        queryBuilder = queryBuilder.eq('type', 'preset');
    }
  }

  // 🧬 ADVANCED STUDIO SORTING
  let sortCol = 'created_at';
  let isAsc = false;

  switch(filters.sort) {
    case 'popular':
        sortCol = 'popularity_score';
        isAsc = false;
        break;
    case 'name':
        sortCol = 'name';
        isAsc = true;
        break;
    case 'bpm-high':
        sortCol = 'bpm';
        isAsc = false;
        break;
    case 'bpm-low':
        sortCol = 'bpm';
        isAsc = true;
        break;
    case 'newest':
    default:
        sortCol = 'created_at';
        isAsc = false;
        break;
  }

  queryBuilder = queryBuilder.order(sortCol, { ascending: isAsc, nullsFirst: false });

  // Range-based pagination
  let { data, error, count } = await queryBuilder.range(from, to)
  
  if (error) {
    console.error('[BROWSE_ACTION_ERROR_SAMPLES]', error.message, error.code, error.details);
    return { samples: [], count: 0 };
  }

  // 🧬 STRUCTURE_MAPPING: Transform flattened view data into the nested format the UI expects
  const enrichedSamples = (data || []).map((s: any) => {
      const driveId = getDriveFileId(s.audio_url);
      return {
          ...s,
          signal: driveId ? generateAudioSignal(driveId, s.name) : null,
          sample_packs: {
              name: s.pack_name,
              category_id: s.pack_category_id,
              cover_url: s.pack_cover_url
          }
      }
  });

  return { samples: enrichedSamples, count: count || 0 };
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
      .from('artifact_registry')
      .select('id, credit_cost')
      .in('id', sampleIds)

  if (sError || !samples) return { success: false, error: 'Could not fetch sample metadata' }
  const totalCost = samples.reduce((sum: number, s: any) => sum + (s.credit_cost || 1), 0)

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

// 🚀 ANONYMOUS_BROWSE_CACHE: Cache public browsing results for 1 hour
const getPublicBrowseData = unstable_cache(
    async (rpcParams: any) => {
        const adminClient = getAdminClient()
        const { data, error } = await adminClient.rpc('get_studio_browse_data', rpcParams)
        if (error) throw error
        return data
    },
    ['public-browse-data'],
    { revalidate: 86400, tags: ['browse'] }
)

export async function getBrowseData(filters: {
    query?: string;
    category?: string;
    type?: string;
    bpm_min?: number;
    bpm_max?: number;
    key?: string;
    sort?: string;
    page?: number;
    limit?: number;
    packId?: string;
    genre?: string;
    tag?: string;
    filter?: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let isSubscribed = false
    if (user) {
        const { data: account } = await supabase
            .from('user_accounts')
            .select('subscription_status')
            .eq('user_id', user.id)
            .maybeSingle()
        isSubscribed = account?.subscription_status === 'ACTIVE'
    }

    // 🛡️ SECURITY LAYER: Validate Parameters Server-Side
    const pageVal = filters.page || 1
    const isPremiumAttempt = (pageVal > 1) || !!filters.query || (filters.sort && filters.sort !== 'popular') || !!filters.bpm_min || !!filters.bpm_max || !!filters.key || !!filters.genre || !!filters.tag || (filters.filter && filters.filter !== 'all')
    
    // If not subscribed and attempting premium features, force basic parameters
    const finalFilters = (!isSubscribed && isPremiumAttempt) ? {
        ...filters,
        query: undefined,
        sort: 'popular',
        page: 1,
        bpm_min: undefined,
        bpm_max: undefined,
        key: undefined,
        genre: undefined,
        tag: undefined,
        filter: undefined
    } : filters

    // 🧬 SLUG_RESOLVER: Convert URL slugs (e.g. 'hip-hop') to UUIDs for the database
    let resolvedCategoryId = null
    if (finalFilters.category && finalFilters.category !== 'all' && finalFilters.category !== '') {
        const categories = await getAllCategories()
        const category = categories.find((c: any) => c.slug === finalFilters.category || c.id === finalFilters.category)
        resolvedCategoryId = category?.id || null
    }

    const rpcParams = {
        p_query: finalFilters.query || null,
        p_category_id: resolvedCategoryId,
        p_type: finalFilters.type || null,
        p_bpm_min: finalFilters.bpm_min || null,
        p_bpm_max: finalFilters.bpm_max || null,
        p_key: finalFilters.key || null,
        p_sort: finalFilters.sort || 'popular',
        p_page: finalFilters.page || 1,
        p_page_size: finalFilters.limit || 20,
        p_is_subscribed: isSubscribed,
        p_pack_id: finalFilters.packId || null,
        p_genre: finalFilters.genre || null,
        p_tag: finalFilters.tag || null,
        p_filter: (finalFilters.filter && finalFilters.filter !== 'all') ? finalFilters.filter : null
    }

    let data;
    if (!user) {
        // Use cached public data for guest users
        try {
            data = await getPublicBrowseData(rpcParams)
        } catch (error: any) {
            console.error('[BROWSE_CACHE_ERROR]', error)
            const adminClient = getAdminClient()
            const { data: fallbackData } = await adminClient.rpc('get_studio_browse_data', rpcParams)
            data = fallbackData
        }
    } else {
        // Live fetch for authenticated users (ensures personalized state)
        const adminClient = getAdminClient()
        const { data: liveData, error } = await adminClient.rpc('get_studio_browse_data', rpcParams)
        if (error) {
            console.error('[BROWSE_RPC_ERROR]', error)
            throw new Error("Failed to fetch library data")
        }
        data = liveData
    }

    return {
        ...data,
        packs: data.context_packs,
        isSubscribed,
        isRestricted: !isSubscribed && isPremiumAttempt
    }
}
