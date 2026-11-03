// src/lib/order-messages.ts
// The WhatsApp message for an order update, ready to send with one click. Pure, so it is easy to test.

import { whatsappLink } from '@/lib/orders'

export interface UpdateMessageInput {
  customerName: string | null | undefined
  code: string | null | undefined
  title: string
  comment?: string | null
  trackUrl?: string | null
  /** deliveries only: "expected 20 Nov" style text */
  expected?: string | null
}

export function customerUpdateMessage(i: UpdateMessageInput): string {
  const first = (i.customerName ?? '').trim().split(/\s+/)[0] || 'there'
  const lines = [
    `Hi ${first}, this is Pulse Gear. An update on your order${i.code ? ` ${i.code}` : ''}:`,
    `*${i.title}*`,
    i.comment?.trim() ? i.comment.trim() : null,
    i.expected ? `Expected delivery: ${i.expected}` : null,
    i.trackUrl ? `You can follow every step here: ${i.trackUrl}` : null,
  ]
  return lines.filter(Boolean).join('\n')
}

export function updateWhatsappLink(phone: string | null | undefined, input: UpdateMessageInput): string | null {
  return whatsappLink(phone, customerUpdateMessage(input))
}
