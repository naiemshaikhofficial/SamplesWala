/**
 * 🛰️ CLOUDFLARE_IMAGE_OPTIMIZER_LOADER
 * Bypasses Vercel's Image Optimization to save data transfer.
 * Redirects all image requests to the Unified Cloudflare Worker.
 */
export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // 1. Agar image local hai (/Logo.png) ya absolute local hai, toh original return karo
  if (src.startsWith('/') || src.includes('localhost') || src.includes('sampleswala.com')) {
    // Append dummy width to satisfy Next.js loader validation
    return src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`;
  }

  // 2. Agar path remote nahi hai (http/https), toh bhi original return karo
  if (!src.startsWith('http')) {
    return src;
  }

  const workerUrl = 'https://sampleswala-images.sampleswala.workers.dev'; 
  
  const params = [
    `url=${encodeURIComponent(src)}`,
    `w=${width}`,
    `q=${quality || 75}`
  ];

  return `${workerUrl}?${params.join('&')}`;
}
