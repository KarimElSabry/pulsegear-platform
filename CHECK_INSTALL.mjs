// CHECK_INSTALL.mjs  (no dependencies)
// Run it from the ROOT of your repo after copying files:
//     node CHECK_INSTALL.mjs            check everything (all 3 steps)
//     node CHECK_INSTALL.mjs --step 1   check only step 1 (or --step 2)
// It reads MANIFEST.json (next to this file) and tells you, per file:
//     MISSING    the file is not in your repo at that path (copy it again)
//     DIFFERENT  the file exists but is not the delivered version (an older copy, or you edited it)
//     OLD FILE   a file the new version deletes is still in your repo (delete it)

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(readFileSync(join(here, 'MANIFEST.json'), 'utf8'))
const argStep = process.argv.indexOf('--step')
const upto = argStep > -1 ? Number(process.argv[argStep + 1]) : 3
const root = process.cwd()

const TEXT = /\.(tsx?|css|json|md|sql|txt|mjs)$/i
const sha = (p) => {
  let buf = readFileSync(p)
  if (TEXT.test(p)) buf = Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n')) // ignore Windows line endings
  return createHash('sha256').update(buf).digest('hex')
}

if (!existsSync(join(root, 'package.json'))) {
  console.log('Run this from the root of your repo (the folder that contains package.json).')
  process.exit(2)
}

let missing = 0, different = 0, ok = 0, custom = 0, old = 0
const lines = []
for (const f of manifest.files.filter((f) => f.step <= upto)) {
  const p = join(root, f.path)
  if (!existsSync(p)) { missing++; lines.push(`MISSING    ${f.path}   (step ${f.step})`); continue }
  if (sha(p) === f.sha) { ok++; continue }
  if (manifest.customizable.includes(f.path)) { custom++; lines.push(`edited     ${f.path}   (you are meant to edit this one)`); continue }
  different++; lines.push(`DIFFERENT  ${f.path}   (step ${f.step}: older or edited copy)`)
}
for (const d of manifest.deleteIfPresent) {
  if (existsSync(join(root, d))) { old++; lines.push(`OLD FILE   ${d}   (delete it)`) }
}

console.log(lines.join('\n') || 'Nothing to report.')
console.log(`\n${ok} files match, ${missing} missing, ${different} different, ${old} old files to delete, ${custom} customised.`)
if (missing + different + old === 0) console.log('Install looks complete. Now run: npm run build')
else console.log('Fix the lines above (copy those files again from modified_files), then run this check again.')
process.exit(missing + different + old === 0 ? 0 : 1)
