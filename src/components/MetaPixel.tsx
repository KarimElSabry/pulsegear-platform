// src/components/MetaPixel.tsx
// Meta Pixel base code. Renders nothing unless NEXT_PUBLIC_META_PIXEL_ID is set, and never on admin pages.

'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function MetaPixel() {
  const pathname = usePathname()
  if (!PIXEL_ID || !/^\d{8,20}$/.test(PIXEL_ID) || pathname?.startsWith('/admin')) return null
  return (
    <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');
`}</Script>
  )
}
