// src/lib/contact.ts
// Where "order" buttons send customers.

export const WHATSAPP_NUMBER = '201205322444'
export const INSTAGRAM_URL = 'https://www.instagram.com/pulsegear_egypt'

export function whatsappOrderUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/** Opens a direct message to the Instagram account. */
export function instagramDmUrl(): string {
  const handle = INSTAGRAM_URL.replace(/\/+$/, '').split('/').pop() ?? ''
  return `https://ig.me/m/${handle}`
}
