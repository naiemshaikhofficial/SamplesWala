import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adminClient = getAdminClient()
  const domain = 'https://sampleswala.com'

  // 📦 1. FETCH DYNAMIC PACKS
  const { data: packs } = await adminClient
    .from('sample_packs')
    .select('slug, updated_at')

  const packUrls = (packs || []).map((pack: any) => ({
    url: `${domain}/packs/${pack.slug}`,
    lastModified: pack.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 🧬 2. FETCH DYNAMIC GENRES
  const { data: categories } = await adminClient
    .from('categories')
    .select('name')

  const genreUrls = (categories || []).map((cat: any) => ({
    url: `${domain}/genres/${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 🛠️ 3. FETCH DYNAMIC SOFTWARE
  const { data: software } = await adminClient
    .from('software_products')
    .select('slug, updated_at')
    .eq('is_active', true)

  // 🔊 4. FETCH DYNAMIC SAMPLES (Nuclear SEO)
  const { data: samples } = await adminClient
    .from('samples')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000) // 🛡️ Limit to preserve performance while indexing high-value assets

  const sampleUrls = (samples || []).map((s: any) => ({
    url: `${domain}/samples/${s.id}`,
    lastModified: s.created_at || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const softwareUrls = (software || []).map((prod: any) => ({
    url: `${domain}/software/${prod.slug}`,
    lastModified: prod.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 🏛️ 4. STATIC SIGNAL NODES
  const staticUrls = [
    { url: domain, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${domain}/browse`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${domain}/free`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${domain}/software`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${domain}/pricing`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${domain}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${domain}/about`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${domain}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${domain}/license`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: `${domain}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${domain}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${domain}/refund`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return [...staticUrls, ...packUrls, ...genreUrls, ...softwareUrls, ...sampleUrls]
}
