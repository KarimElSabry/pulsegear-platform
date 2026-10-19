// src/components/OrderButtons.tsx

'use client'

import type { MouseEvent } from 'react'
import { INSTAGRAM_URL, whatsappOrderUrl } from '@/lib/contact'
import { trackEvent } from '@/lib/tracking/client'

export default function OrderButtons({
  productId,
  productTitle,
  price,
}: {
  productId: number
  productTitle: string
  price: number
}) {
  const message = (pageUrl?: string) =>
    `Hi Pulse Gear, I'd like to order:\n${productTitle} (#${productId})\n` +
    `Price: ${price.toLocaleString('en-EG')} EGP` +
    (pageUrl ? `\n${pageUrl}` : '')

  // The page link is only known in the browser, so it is added to the message at click time.
  const openWhatsApp = (e: MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = whatsappOrderUrl(message(window.location.href))
    trackEvent('whatsapp_click', { productId })
  }

  return (
    <div className="space-y-3">
      <a
        href={whatsappOrderUrl(message())}
        onClick={openWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-500"
      >
        اطلب عبر واتساب · Order on WhatsApp
      </a>
      <a
        href={INSTAGRAM_URL}
        onClick={() => trackEvent('contact_click', { productId, detail: 'instagram' })}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 py-3 font-bold text-white transition hover:opacity-90"
      >
        اطلب عبر انستجرام · Order on Instagram
      </a>
    </div>
  )
}
