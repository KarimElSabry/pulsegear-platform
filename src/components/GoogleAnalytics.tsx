// src/components/GoogleAnalytics.tsx

'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!gaId) return null

  // Do not track admin pages
  if (pathname?.startsWith('/admin')) return null
  if (pathname?.startsWith('/admin-login')) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}