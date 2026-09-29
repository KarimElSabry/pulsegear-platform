// src/lib/site.ts
// One place for site-wide constants. Safe to import from client or server code.

export const SITE_NAME = 'Pulse Gear Egypt'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://pulsegear-platform.vercel.app'
).replace(/\/$/, '')

export const WHATSAPP_NUMBER = '201205300000' // TODO: set the real number without "+"

export const PRODUCT_CATEGORIES = [
  'Fitness Watches',
  'Heart Rate Straps',
  'Replacement Straps',
  'Running Accessories',
  'Cycling Accessories',
  'Other',
] as const
