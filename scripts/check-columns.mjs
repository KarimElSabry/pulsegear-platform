// Checks that every column named in a simple  .from('table').select('a, b, c')  in src/ exists in
// supabase/schema-snapshot.json. Catches wrong column names (like customer_name vs name) before deploy, and shows which
// migrations still have to be run.
// Usage: node scripts/check-columns.mjs        (take a fresh snapshot first: node scripts/schema-snapshot.mjs)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

if (!existsSync('supabase/schema-snapshot.json')) { console.error('No snapshot yet. Run: node scripts/schema-snapshot.mjs'); process.exit(2) }
const { takenAt, tables } = JSON.parse(readFileSync('supabase/schema-snapshot.json', 'utf8'))

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== '__tests__') walk(p, out) } else if (/\.(ts|tsx)$/.test(n)) out.push(p)
  }
  return out
}

// split on commas that are not inside parentheses
function splitTop(s) {
  const parts = []; let depth = 0; let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  if (cur.trim()) parts.push(cur)
  return parts.map((p) => p.trim()).filter(Boolean)
}

const problems = new Map()
const re = /\.from\(\s*['"]([a-z_]+)['"]\s*\)\s*\.select\(\s*(['"`])([^'"`]*)\2/gs
for (const file of walk('src')) {
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(re)) {
    const [, table, , cols] = m
    if (!tables[table]) { problems.set(`${table}.*`, `table "${table}" is not in the database  (${file})`); continue }
    for (const raw of splitTop(cols)) {
      if (raw === '*' || raw.includes('(')) continue                  // joins like product:products(id, slug)
      const col = raw.includes(':') ? raw.split(':').pop().trim() : raw
      if (col === '*' || col.includes('!') || col.includes('->')) continue
      if (!tables[table].includes(col)) problems.set(`${table}.${col}`, `column "${col}" is not in table "${table}"  (${file})`)
    }
  }
}

console.log(`Checked against the database as of ${takenAt}`)
if (problems.size === 0) { console.log('All simple selects match the database.'); process.exit(0) }
console.log(`\n${problems.size} column(s) used by the code but missing in the database:`)
for (const v of problems.values()) console.log(' - ' + v)
console.log('\nIf they belong to a new feature, run its migration in supabase/migrations/. Otherwise it is a typo.')
process.exit(1)
