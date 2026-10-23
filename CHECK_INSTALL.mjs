// CHECK_INSTALL.mjs  (no dependencies)
// Run from the ROOT of your repo (the folder with package.json) after copying a step:
//     node CHECK_INSTALL.mjs --step 2     check everything up to and including step 2
//     node CHECK_INSTALL.mjs              check all steps
// Per file it tells you:
//     MISSING    the file is not in your repo at that path (copy it again)
//     DIFFERENT  the file is not the delivered version (older copy, or you edited it)
// A file that a later step replaces is checked against the newest version up to the step you asked for.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(readFileSync(join(here, 'MANIFEST.json'), 'utf8'))
const i = process.argv.indexOf('--step')
const upto = i > -1 ? Number(process.argv[i + 1]) : 99
const root = process.cwd()

if (!existsSync(join(root, 'package.json'))) {
  console.log('Run this from the root of your repo (the folder that contains package.json).')
  process.exit(2)
}

const sha = (p) => createHash('sha256').update(Buffer.from(readFileSync(p).toString('utf8').replace(/\r\n/g, '\n'))).digest('hex')

const latest = new Map()
for (const f of manifest.files) if (f.step <= upto && (!latest.has(f.path) || latest.get(f.path).step < f.step)) latest.set(f.path, f)

let ok = 0, bad = 0
for (const f of latest.values()) {
  const p = join(root, f.path)
  if (!existsSync(p)) { bad++; console.log(`MISSING    ${f.path}   (step ${f.step})`); continue }
  if (sha(p) === f.sha) ok++
  else { bad++; console.log(`DIFFERENT  ${f.path}   (step ${f.step}: older or edited copy)`) }
}
if (upto >= 8) for (const rel of manifest.deleteIfPresent ?? []) {
  if (existsSync(join(root, rel))) { bad++; console.log(`DELETE     ${rel}   (a copy placed in the wrong folder; delete this file)`) }
}
console.log(`\n${ok} files match, ${bad} need attention.`)
console.log(bad === 0 ? 'Install looks complete. Now run: npm run build' : 'Copy those files again from the step folder, then re-run this check.')
process.exit(bad === 0 ? 0 : 1)
