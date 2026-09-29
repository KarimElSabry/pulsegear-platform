// src/app/blog/layout.tsx
// Slim blog chrome: the global Header/Footer already wrap every page, so this
// only adds category navigation and blog-wide metadata defaults.

import type { Metadata } from 'next'
import BlogNav from '@/components/blog/BlogNav'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: { default: `Blog | ${SITE_NAME}`, template: `%s | ${SITE_NAME} Blog` },
  description: 'Training tips, gear reviews and heart rate guides for runners in Egypt, from Pulse Gear.',
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    url: `${SITE_URL}/blog`,
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: `${SITE_NAME} Blog` }],
  },
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0 text-white">
      <BlogNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
