// Saves the live table and column names to supabase/schema-snapshot.json (read-only: one GET to Supabase).
// Usage: node scripts/schema-snapshot.mjs          (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

function loadEnv() {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').replace(/\r/g, '').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(2) }

const res = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
if (!res.ok) { console.error(`Supabase answered ${res.status}`); process.exit(2) }
const spec = await res.json()
const tables = {}
for (const [name, def] of Object.entries(spec.definitions ?? {})) tables[name] = Object.keys(def.properties ?? {}).sort()
writeFileSync('supabase/schema-snapshot.json', JSON.stringify({ takenAt: new Date().toISOString(), tables }, null, 1) + '\n')
console.log(`Saved ${Object.keys(tables).length} tables to supabase/schema-snapshot.json`)
