import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.sampleswala.com',
          },
        ],
        destination: 'https://sampleswala.com/:path*',
        permanent: true,
      },
      {
        source: '/genres/:genre',
        destination: '/sounds/genres/:genre',
        permanent: true,
      },
      {
        source: '/pricing',
        destination: '/subscription',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/webhooks/razorpay/',
        destination: '/api/webhooks/razorpay',
      },
    ]
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // Cache optimized images for 24 hours
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagizer.imageshack.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
  },
};

export default nextConfig;
