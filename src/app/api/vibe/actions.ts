
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getVibeSuggestions(sampleId: string, limit = 6) {
  const supabase = await createClient()

  // 1. Get the target sample's DNA
  const { data: target, error: targetError } = await supabase
    .from('samples')
    .select('id, bpm, key, ai_genre, type, pack_id')
    .eq('id', sampleId)
    .single()

  if (targetError || !target) return []

  // 2. Build the similarity signal
  let query = supabase
    .from('samples')
    .select('*, sample_packs(name, slug, cover_url)')
    .neq('id', sampleId)
    .limit(limit)

  // Filter by matching characteristics
  if (target.bpm) {
    query = query.gte('bpm', target.bpm - 10).lte('bpm', target.bpm + 10)
  }

  if (target.ai_genre) {
     query = query.ilike('ai_genre', `%${target.ai_genre}%`)
  }

  const { data: suggestions } = await query

  // 3. Fallback: If not enough matches, just get newest from same pack
  if (!suggestions || suggestions.length < 3) {
      const { data: packSamples } = await supabase
        .from('samples')
        .select('*, sample_packs(name, slug, cover_url)')
        .eq('pack_id', target.pack_id)
        .neq('id', sampleId)
        .limit(limit)
      return packSamples || []
  }

  return suggestions
}
