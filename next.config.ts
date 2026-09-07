import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
    ]
  },
}

export default nextConfig