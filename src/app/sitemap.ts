import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adminClient = getAdminClient()
  const domain = 'https://sampleswala.com'

  // 📦 1. FETCH DYNAMIC PACKS
  const { data: packs } = await adminClient
    .from('sample_packs')
    .select('slug, updated_at')

  const packUrls = (packs || []).map((pack) => ({
    url: `${domain}/packs/${pack.slug}`,
    lastModified: pack.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 🧬 2. FETCH DYNAMIC GENRES
  const { data: categories } = await adminClient
    .from('categories')
    .select('name')

  const genreUrls = (categories || []).map((cat) => ({
    url: `${domain}/genres/${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 🏛️ 3. STATIC SIGNAL NODES
  const staticUrls = [
    { url: domain, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${domain}/browse`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${domain}/free`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${domain}/pricing`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${domain}/software`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${domain}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${domain}/about`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${domain}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${domain}/license`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: `${domain}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${domain}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${domain}/refund`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return [...staticUrls, ...packUrls, ...genreUrls]
}
