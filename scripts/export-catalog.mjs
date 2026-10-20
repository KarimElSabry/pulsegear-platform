// scripts/export-catalog.mjs  (no dependencies, read-only)
// Writes pulse-gear-catalog.md: the products that are for sale right now, public facts only
// (title, brand, condition, price, size, link). Upload it to your chatbot tool and re-run it every week or two.
//
//   node scripts/export-catalog.mjs                    -> ./pulse-gear-catalog.md
//   node scripts/export-catalog.mjs out/catalog.md     -> custom path
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from the environment or .env.local).
// Cost, source link, supplier and margin are never selected, so they cannot end up in the file.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

function env(name) {
  if (process.env[name]) return process.env[name]
  if (!existsSync('.env.local')) return ''
  const line = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='))
  return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '') : ''
}

const url = env('NEXT_PUBLIC_SUPABASE_URL'), key = env('SUPABASE_SERVICE_ROLE_KEY')
const site = (env('NEXT_PUBLIC_SITE_URL') || 'https://pulsegear-platform.vercel.app').replace(/\/$/, '')
if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them or run from the repo root with .env.local).'); process.exit(1) }

const cols = 'id,title,brand,category,condition,price_egp,size,compatible_with,status'
const res = await fetch(`${url}/rest/v1/products?select=${cols}&status=eq.available&order=category.asc,brand.asc,title.asc&limit=1000`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
})
if (!res.ok) { console.error('Could not read products:', res.status, (await res.text()).slice(0, 200)); process.exit(1) }
const rows = await res.json()

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()
const money = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-US') + ' EGP' : 'price on request')
const byCat = new Map()
for (const p of rows) { const c = clean(p.category) || 'Other'; byCat.set(c, [...(byCat.get(c) ?? []), p]) }

const out = [
  '# Pulse Gear Egypt: products for sale right now',
  `Generated: ${new Date().toISOString().slice(0, 10)}. ${rows.length} items. Prices in EGP, delivered to Egypt (see the knowledge file for payment and delivery).`,
  'Items are usually one-of-a-kind: availability is confirmed by the team before an order starts. If an item is not here it may be sold or not listed yet.',
  '',
]
for (const [cat, list] of byCat) {
  out.push(`## ${cat}`, '')
  for (const p of list) {
    const bits = [clean(p.brand), clean(p.condition) && `condition: ${clean(p.condition)}`, clean(p.size) && `size: ${clean(p.size)}`, clean(p.compatible_with) && `compatible with: ${clean(p.compatible_with)}`].filter(Boolean)
    out.push(`- **${clean(p.title)}**: ${money(p.price_egp)}${bits.length ? ' · ' + bits.join(' · ') : ''} · ${site}/products/${p.id}`)
  }
  out.push('')
}
const path = process.argv[2] || 'pulse-gear-catalog.md'
if (dirname(path) !== '.') mkdirSync(dirname(path), { recursive: true })
writeFileSync(path, out.join('\n'))
console.log(`Wrote ${path} (${rows.length} items)`)
