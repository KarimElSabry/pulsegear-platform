// src/app/blog/training-guide/page.tsx
import type { Metadata } from 'next'
import CategoryIndex from '@/components/blog/CategoryIndex'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Training Guide',
  description: 'All Training Guide articles from Pulse Gear Egypt.',
  alternates: { canonical: `${SITE_URL}/blog/training-guide` },
}

export default function trainingguideIndexPage() {
  return <CategoryIndex category="training-guide" />
}
