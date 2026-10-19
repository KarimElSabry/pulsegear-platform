import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

// Server actions are public POST endpoints. Every exported action in an admin file must check the admin cookie itself:
// the page-level gate alone is not enough.
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'node_modules' && name !== '__tests__') walk(p, out) }
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

describe('admin server actions', () => {
  const root = join(__dirname, '..', '..', 'app', 'admin')
  const files = walk(root).filter((f) => /^\s*['"]use server['"]/m.test(readFileSync(f, 'utf8').slice(0, 600)))

  it('finds the action files', () => { expect(files.length).toBeGreaterThanOrEqual(6) })

  for (const file of files) {
    it(`${file.slice(root.length + 1)}: every exported action checks admin first`, () => {
      const src = readFileSync(file, 'utf8')
      const chunks = src.split(/^export async function /m).slice(1)
      expect(chunks.length).toBeGreaterThan(0)
      for (const chunk of chunks) {
        const name = chunk.slice(0, chunk.indexOf('('))
        const body = chunk.slice(0, 900)
        expect(/assertAdmin\(\)|guarded\(/.test(body), `${name} in ${file} does not call assertAdmin()`).toBe(true)
      }
    })
  }
})
