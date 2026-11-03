import { describe, expect, it } from 'vitest'
import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { crc32, createZip } from '../zip'

describe('zip', () => {
  it('crc32 of "123456789" is the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })
  it('builds a zip that a real unzip program accepts, with names and (German) text intact', () => {
    const files = [{ name: '01-ubersicht.txt', data: 'Gewinn: 1.234,56 €\nÄÖÜ ß' }, { name: 'sub/02-daten.csv', data: 'a;b\r\n1;2\r\n' }, { name: 'leer.txt', data: '' }]
    const dir = mkdtempSync(join(tmpdir(), 'zip-'))
    const zip = join(dir, 't.zip')
    writeFileSync(zip, createZip(files, new Date('2026-11-03T10:00:00Z')))
    let ok = true
    try { execFileSync('unzip', ['-tq', zip], { stdio: 'pipe' }) } catch (e) { if ((e as { code?: string }).code === 'ENOENT') return; ok = false }
    expect(ok).toBe(true)
    execFileSync('unzip', ['-qo', zip, '-d', join(dir, 'out')])
    expect(readFileSync(join(dir, 'out', '01-ubersicht.txt'), 'utf8')).toBe(files[0].data)
    expect(readFileSync(join(dir, 'out', 'sub', '02-daten.csv'), 'utf8')).toBe(files[1].data)
  })
})
