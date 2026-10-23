// src/lib/checkout-messages.ts
// The WhatsApp message you send to a customer who confirmed an order on the website. Pure, so it is easy to test.

import { whatsappLink } from '@/lib/orders'

export function orderWhatsappLink(order: { customer_name: string; phone: string; code: string }, items: { title: string; color_name?: string | null; quantity: number }[]): string | null {
  const first = order.customer_name.trim().split(/\s+/)[0] || 'there'
  const list = items.map((i) => `- ${i.title}${i.color_name ? ` (${i.color_name})` : ''} x${i.quantity}`).join('\n')
  return whatsappLink(
    order.phone,
    `Hi ${first}, this is Pulse Gear. We received your order ${order.code}:\n${list}\nPlease reply to confirm it, and we will arrange payment and delivery with you.`
  )
}
