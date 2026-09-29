// src/app/sitemap.ts
// Generated from the DB (products) and the posts registry, so it never
// lists a URL that does not exist.

import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { posts, categoryIndexes } from '@/content/posts'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const revalidate = 3600

const STATIC_ROUTES: { path: string; priority: number; freq: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '', priority: 1, freq: 'daily' },
  { path: '/products', priority: 0.9, freq: 'daily' },
  { path: '/deals', priority: 0.8, freq: 'daily' },
  { path: '/brands', priority: 0.6, freq: 'monthly' },
  { path: '/sold', priority: 0.4, freq: 'weekly' },
  { path: '/request-product', priority: 0.6, freq: 'monthly' },
  { path: '/faq', priority: 0.5, freq: 'monthly' },
  { path: '/contact', priority: 0.4, freq: 'monthly' },
  { path: '/blog', priority: 0.8, freq: 'weekly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = [
    ...categoryIndexes.map((c) => ({
      url: `${SITE_URL}/blog/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p.featured ? 0.8 : 0.6,
    })),
  ]

  let productEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = createAdminSupabaseClient()
    const { data } = await supabase
      .from('products')
      .select('slug, created_at, sold_at, status')
      .not('slug', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5000)

    productEntries = (data ?? []).map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: new Date(p.sold_at ?? p.created_at ?? now),
      changeFrequency: p.status === 'available' ? ('weekly' as const) : ('monthly' as const),
      priority: p.status === 'available' ? 0.7 : 0.3,
    }))
  } catch (error) {
    console.error('[sitemap] product query failed:', error)
  }

  return [...staticEntries, ...blogEntries, ...productEntries]
}
