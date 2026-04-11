import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adminClient = getAdminClient()
  const domain = 'https://sampleswala.com'

  // Fetch all packs to create dynamic URLs
  const { data: packs } = await adminClient
    .from('sample_packs')
    .select('slug, updated_at')

  const packUrls = (packs || []).map((pack) => ({
    url: `${domain}/packs/${pack.slug}`,
    lastModified: pack.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const staticUrls = [
    {
      url: domain,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${domain}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
        url: `${domain}/software`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
  ]

  return [...staticUrls, ...packUrls]
}
