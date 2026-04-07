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
  
  let queryBuilder = supabase.from('sample_packs').select('id, name, slug, description, price_inr, cover_url, category_id, is_featured, created_at, specifications, demo_audio_url, categories(name)')
  
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
    const fallbackQuery = supabase.from('sample_packs').select('id, name, slug, description, price_inr, cover_url, category_id, is_featured, created_at, specifications, demo_audio_url')
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
  mood?: string,
  genre?: string,
  time_sig?: string,
  producer?: string,
  sort?: string,
  limit?: string,
  tag?: string
}) {
  const supabase = await createClient()
  const cleanQuery = filters.query?.trim()
  const limitVal = parseInt(filters.limit || '25')
  
  let queryBuilder = supabase.from('samples').select('id, name, bpm, key, credit_cost, pack_id, type, ai_genre, tags, time_signature, created_at, sample_packs(name, category_id, cover_url)')
  
  // 🔭 PRECISION SEARCH SIGNAL (Search name OR tags)
  if (cleanQuery) {
    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`)
  }

  // 🏷️ SPECIFIC TAG SIGNAL
  if (filters.tag) {
    queryBuilder = queryBuilder.contains('tags', [filters.tag.toLowerCase()])
  }

  // 🔋 BPM THRESHOLD SIGNAL (Loops vs Oneshots fallback)
  if (filters.bpm_min !== undefined) queryBuilder = queryBuilder.gte('bpm', filters.bpm_min);
  if (filters.bpm_max !== undefined) queryBuilder = queryBuilder.lte('bpm', filters.bpm_max);

  // 🎼 MUSICAL KEY SIGNAL (Total Metadata Resonance)
  if (filters.key && filters.key !== 'all') {
    const key = filters.key;
    const isMinor = key.endsWith('m');
    const base = isMinor ? key.slice(0, -1) : key;
    
    // Enharmonic mapping for the base note
    const enharmonicMap: Record<string, string> = {
      'C#': 'Db', 'Db': 'C#', 'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#', 'G#': 'Ab', 'Ab': 'G#'
    };
    const altBase = enharmonicMap[base];

    const generateKeyAliases = (note: string, minor: boolean) => {
        if (!minor) return [`${note}`, `${note} Major`, `${note}Maj`];
        return [`${note}m`, `${note} Minor`, `${note}min`, `${note} m`].map(v => v.toLowerCase());
    }

    let allAliases = generateKeyAliases(base, isMinor);
    if (altBase) {
        allAliases = [...allAliases, ...generateKeyAliases(altBase, isMinor)];
    }

    // Build the OR signal for all possible naming conventions
    const orSignal = allAliases.map(alias => `key.ilike.%${alias}%`).join(',');
    queryBuilder = queryBuilder.or(orSignal);
  }

  // 🎭 GENRE SIGNAL (Stylistic filtering)
  if (filters.genre) {
    const genreVal = filters.genre.toLowerCase();
    queryBuilder = queryBuilder.or(`name.ilike.%${genreVal}%,tags.cs.{${genreVal}}`)
  }

  // 🧪 EMOTIONAL SIGNAL (Mood filtering)
  if (filters.mood) {
    const moodVal = filters.mood.toLowerCase();
    queryBuilder = queryBuilder.or(`name.ilike.%${moodVal}%,tags.cs.{${moodVal}}`)
  }

  // 🎹 TIME SIGNATURE SIGNAL (Safe fallback)
  if (filters.time_sig) {
    try {
        queryBuilder = queryBuilder.eq('time_signature', filters.time_sig);
    } catch (e) {
        console.warn('[REPAIRING_RHYTHMIC_NODE] Time Signature column missing.');
    }
  }

  // 👤 PRODUCER IDENTITY SIGNAL
  if (filters.producer) {
    queryBuilder = queryBuilder.ilike('name', `%${filters.producer}%`);
  }

  if (filters.type) {
    const typeLabel = filters.type.toLowerCase()
    if (typeLabel === 'loops') {
        queryBuilder = queryBuilder.gt('bpm', 0).not('bpm', 'is', null);
    } else if (typeLabel === 'oneshots') {
        queryBuilder = queryBuilder.or('bpm.eq.0,bpm.is.null');
    } else {
        queryBuilder = queryBuilder.or(`name.ilike.%${typeLabel}%,tags.cs.{${typeLabel}}`)
    }
  }

  // 📊 DIAGNOSTIC SORTING ENGINE
  const sortCol = filters.sort === 'bpm' ? 'bpm' : (filters.sort === 'key' ? 'key' : 'created_at');
  queryBuilder = queryBuilder.order(sortCol, { ascending: filters.sort !== 'newest' });

  // 🎹 ENHANCED STUDIO CONSOLE FILTERS
  if (filters.filter && filters.filter !== 'all') {
    switch (filters.filter) {
      case 'trending':
        // No specific trending column yet, so just limit
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

  let { data, error } = await queryBuilder.limit(limitVal)
  
  // 🛰️ SIGNAL RECOVERY: Fallback if custom columns (Time Signature) are missing
  if (error && error.code === 'PGRST103') {
    console.warn('[RECOVERY_MODE] Rerouting signal without Time_Signature metadata.');
    const fallbackBuilder = supabase.from('samples').select('id, name, bpm, key, credit_cost, pack_id, type, ai_genre, tags, created_at, sample_packs(name, category_id, cover_url)')
    if (cleanQuery) fallbackBuilder.or(`name.ilike.%${cleanQuery}%,tags.cs.{${cleanQuery}}`);
    const { data: fbData, error: fbError } = await fallbackBuilder.limit(limitVal);
    data = fbData as any;
    error = fbError;
  }

  if (error) {
    console.error('[BROWSE_ACTION_ERROR_SAMPLES]', error);
    return [];
  }

  let processedData = data || [];

  if (filters.category && data) {
    processedData = data.filter((s: any) => s.sample_packs?.category_id === filters.category)
  }

  return processedData
}

export async function getRelatedPacks(currentPackId: string, categoryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sample_packs')
    .select('id, name, slug, description, price_inr, cover_url, category_id, is_featured, created_at, specifications, demo_audio_url')
    .eq('category_id', categoryId)
    .neq('id', currentPackId)
    .limit(4)
  
  if (error) {
    console.error('[BROWSE_ACTION_ERROR]', error);
    return [];
  }
  return data
}
