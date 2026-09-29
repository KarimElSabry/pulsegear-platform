import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Files in public/ (images, hero videos) are served from Vercel's CDN and are never read by a
  // serverless function. Keeping them out of the function bundles keeps every function small
  // (the limit is 250 MB and the hero videos alone are about 300 MB).
  outputFileTracingExcludes: {
    '/**/*': ['./public/**/*', './supabase/**/*', './secrets/**/*'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vinted.net',
      },
      {
        protocol: 'https',
        hostname: '**.vinted.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // ✅ أضيف هنا
  async redirects() {
    return [
      {
        source: '/blog/zone-2-training',
        destination: '/blog/training-guide/zone-2-training',
        permanent: true,
      },
      // Old flat article URLs (previously linked from the homepage, the old sitemap and social posts)
      { source: '/blog/heart-rate-zones', destination: '/blog/training-guide/heart-rate-zones', permanent: true },
      { source: '/blog/sleep-recovery', destination: '/blog/training-guide/sleep-recovery', permanent: true },
      { source: '/blog/running-cadence', destination: '/blog/training-guide/running-cadence', permanent: true },
      { source: '/blog/complete-training-setup', destination: '/blog/training-guide/complete-training-setup', permanent: true },
      { source: '/blog/claude-ai-running-coach-setup', destination: '/blog/training-guide/claude-ai-running-coach-setup', permanent: true },
      { source: '/blog/claude-coach-watch-telegram', destination: '/blog/training-guide/claude-coach-watch-telegram', permanent: true },
      { source: '/blog/claude-kailo-free-running-coach', destination: '/blog/training-guide/claude-kailo-free-running-coach', permanent: true },
      { source: '/blog/beginners-guide', destination: '/blog/gear-guide/beginners-guide', permanent: true },
      { source: '/blog/best-heart-rate-monitors', destination: '/blog/gear-guide/best-heart-rate-monitors', permanent: true },
      { source: '/blog/best-gps-watches', destination: '/blog/gear-guide/best-gps-watches', permanent: true },
      { source: '/blog/best-chest-straps', destination: '/blog/gear-guide/best-chest-straps', permanent: true },
      { source: '/blog/budget-vs-premium', destination: '/blog/gear-guide/budget-vs-premium', permanent: true },
      { source: '/blog/heart-rate-strap-vs-optical', destination: '/blog/gear-review/heart-rate-strap-vs-optical', permanent: true },
      { source: '/blog/garmin-vs-polar', destination: '/blog/gear-review/garmin-vs-polar', permanent: true },
      { source: '/blog/running-shoes-guide', destination: '/blog/gear-review/running-shoes-guide', permanent: true },
    ]
  },
}

export default nextConfig