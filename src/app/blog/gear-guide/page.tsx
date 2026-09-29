// src/app/blog/gear-guide/page.tsx
import type { Metadata } from 'next'
import CategoryIndex from '@/components/blog/CategoryIndex'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Gear Guide',
  description: 'All Gear Guide articles from Pulse Gear Egypt.',
  alternates: { canonical: `${SITE_URL}/blog/gear-guide` },
}

export default function gearguideIndexPage() {
  return <CategoryIndex category="gear-guide" />
}
