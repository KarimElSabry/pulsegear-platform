// src/lib/blog-meta.ts
// Builds Next.js Metadata for a blog article from the posts registry,
// so title/description/canonical/OG never drift from the index or sitemap.

import type { Metadata } from 'next'
import { getPost } from '@/content/posts'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export function articleMetadata(slug: string, overrides: Partial<Metadata> = {}): Metadata {
  const post = getPost(slug)
  if (!post) return { title: 'Article' }
  const url = `${SITE_URL}/blog/${post.slug}`
  const title = post.titleAr ? `${post.title} | ${post.titleAr}` : post.title
  const image = post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og-default.jpg`
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title,
      description: post.excerpt,
      modifiedTime: post.updated,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    ...overrides,
  }
}
