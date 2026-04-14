import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adminClient = getAdminClient()
  const domain = 'https://sampleswala.com'
  const currentDate = new Date()

  // 📦 1. FETCH DYNAMIC PACKS
  let packUrls: MetadataRoute.Sitemap = []
  try {
    const { data: packs } = await adminClient
      .from('sample_packs')
      .select('slug, updated_at')
    
    if (packs) {
      packUrls = packs.map((pack: any) => ({
        url: `${domain}/packs/${pack.slug}`,
        lastModified: pack.updated_at || currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
      }))
    }
  } catch (e) {
    console.error('Sitemap: Error fetching packs', e)
  }

  // 🧬 2. FETCH DYNAMIC GENRES (Splice-Style Silos)
  let genreUrls: MetadataRoute.Sitemap = []
  try {
    const { data: categories } = await adminClient
      .from('categories')
      .select('name')
    
    if (categories) {
      categories.forEach((cat: any) => {
        const slug = cat.name.toLowerCase().replace(/\s+/g, '-')
        // Overview Page
        genreUrls.push({
          url: `${domain}/sounds/genres/${slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
        // Packs-Only Page
        genreUrls.push({
          url: `${domain}/sounds/genres/${slug}/packs`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    }
  } catch (e) {
    console.error('Sitemap: Error fetching genres', e)
  }

  // 🛠️ 3. FETCH DYNAMIC SOFTWARE
  let softwareUrls: MetadataRoute.Sitemap = []
  try {
    const { data: software } = await adminClient
      .from('software_products')
      .select('slug, updated_at')
      .eq('is_active', true)
    
    if (software) {
      softwareUrls = software.map((prod: any) => ({
        url: `${domain}/software/${prod.slug}`,
        lastModified: prod.updated_at || currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch (e) {
    console.error('Sitemap: Error fetching software', e)
  }

  // 🔊 4. FETCH DYNAMIC SAMPLES (Nuclear SEO)
  let sampleUrls: MetadataRoute.Sitemap = []
  try {
    const { data: samples } = await adminClient
      .from('samples')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(2000) // 🛡️ Increased limit for broader coverage
    
    if (samples) {
      sampleUrls = samples.map((s: any) => ({
        url: `${domain}/samples/${s.id}`,
        lastModified: s.created_at || currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      }))
    }
  } catch (e) {
    console.error('Sitemap: Error fetching samples', e)
  }

  // 🏛️ 5. STATIC SIGNAL NODES
  const staticUrls: MetadataRoute.Sitemap = [
    { url: domain, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${domain}/browse`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${domain}/free`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${domain}/software`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${domain}/pricing`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${domain}/faq`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.8 },
    { url: `${domain}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${domain}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${domain}/license`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${domain}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${domain}/privacy`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${domain}/refund`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [...staticUrls, ...packUrls, ...genreUrls, ...softwareUrls, ...sampleUrls]
}
