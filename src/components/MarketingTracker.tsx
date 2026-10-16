// src/components/MarketingTracker.tsx

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution, trackEvent } from '@/lib/tracking/client'

/** Captures UTM / click ids once per page load and records page and product views. Skipped on admin pages. */
export default function MarketingTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    captureAttribution()
    trackEvent('page_view')
    const m = pathname.match(/^\/products\/([^/]+)$/)
    if (m) {
      const id = Number(m[1])
      trackEvent('product_view', Number.isInteger(id) ? { productId: id } : { detail: m[1] })
    }
  }, [pathname])

  return null
}
