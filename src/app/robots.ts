import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/profile/',
        '/settings/',
        '/auth/',
        '/library/',
        '/checkout/',
        '/cart/',
      ],
    },
    sitemap: 'https://sampleswala.com/sitemap.xml',
    host: 'https://sampleswala.com',
  }
}
