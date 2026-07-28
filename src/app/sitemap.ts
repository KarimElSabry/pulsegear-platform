import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://pulsegear-platform.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://pulsegear-platform.vercel.app/products',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },

    // ============ BLOG ============
    {
      url: 'https://pulsegear-platform.vercel.app/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://pulsegear-platform.vercel.app/blog/heart-rate-zones',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://pulsegear-platform.vercel.app/blog/zone-2-training',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://pulsegear-platform.vercel.app/blog/heart-rate-strap-vs-optical',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://pulsegear-platform.vercel.app/blog/garmin-vs-polar',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://pulsegear-platform.vercel.app/blog/gear-guide',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}