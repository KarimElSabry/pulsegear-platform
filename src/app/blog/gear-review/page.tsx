// src/app/blog/gear-review/page.tsx
import type { Metadata } from 'next'
import CategoryIndex from '@/components/blog/CategoryIndex'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Gear Reviews',
  description: 'All Gear Reviews articles from Pulse Gear Egypt.',
  alternates: { canonical: `${SITE_URL}/blog/gear-review` },
}

export default function gearreviewIndexPage() {
  return <CategoryIndex category="gear-review" />
}
