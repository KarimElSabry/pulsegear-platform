// src/lib/tracking/client.ts
// Browser side: visitor id, attribution cookie, and a fire-and-forget event sender. Never throws.

import {
  ATTR_COOKIE, ATTR_MAX_AGE_SECONDS, VISITOR_COOKIE, deriveTouch, mergeAttribution, parseAttributionCookie,
  readCookie, serializeAttribution,
} from './touch'

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Max-Age=${ATTR_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}

export function ensureVisitorId(): string {
  let id = readCookie(document.cookie, VISITOR_COOKIE)
  if (!id) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0, 64)
    setCookie(VISITOR_COOKIE, id)
  }
  return id
}

/** Reads this page load's marketing parameters and updates first-touch / last-non-direct. */
export function captureAttribution() {
  try {
    const touch = deriveTouch(new URL(window.location.href), document.referrer, window.location.hostname)
    const prev = parseAttributionCookie(readCookie(document.cookie, ATTR_COOKIE))
    setCookie(ATTR_COOKIE, serializeAttribution(mergeAttribution(prev, touch)))
  } catch { /* tracking must never break the page */ }
}

const PIXEL_EVENTS: Record<string, string> = {
  page_view: 'PageView', product_view: 'ViewContent', whatsapp_click: 'Contact', contact_click: 'Contact', checkout_started: 'InitiateCheckout',
}

export function trackEvent(event: string, extra: { productId?: number; detail?: string } = {}) {
  try {
    // One id shared by the browser Pixel and our server, so Meta counts the action once.
    const eventId = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0, 64)
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
    if (fbq && PIXEL_EVENTS[event]) {
      fbq('track', PIXEL_EVENTS[event], extra.productId ? { content_ids: [String(extra.productId)], content_type: 'product' } : {}, { eventID: eventId })
    }
    const attr = parseAttributionCookie(readCookie(document.cookie, ATTR_COOKIE))
    const body = JSON.stringify({
      event,
      eventId,
      visitorId: ensureVisitorId(),
      path: window.location.pathname,
      productId: extra.productId,
      detail: extra.detail,
      first: attr?.first ?? null,
      lastNonDirect: attr?.lastNonDirect ?? null,
    })
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return
    void fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
  } catch { /* ignore */ }
}
