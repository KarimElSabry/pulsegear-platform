import { describe, expect, it } from 'vitest'
import { syncValue, type SyncState } from '../synced-value'

type R = { ok: boolean; message: string }
const start = (prop: string): SyncState<R> => ({ value: prop, seenProp: prop, seenRes: null })
const ok: R = { ok: true, message: 'Posted' }
const bad: R = { ok: false, message: 'nope' }

describe('syncValue', () => {
  it('keeps what you picked while saving and after a successful save, even before the page reloads', () => {
    const picked = { ...start('processing'), value: 'shipped' }
    expect(syncValue(picked, 'processing', null).value).toBe('shipped')
    expect(syncValue(picked, 'processing', ok).value).toBe('shipped')
  })
  it('follows the saved value when the page loads a new one', () => {
    const picked = { ...start('processing'), value: 'shipped' }
    const after = syncValue(syncValue(picked, 'processing', ok), 'shipped', ok)
    expect(after.value).toBe('shipped')
    const other = syncValue(start('processing'), 'delivered', null)
    expect(other.value).toBe('delivered')
  })
  it('goes back to the saved value when saving failed', () => {
    const picked = { ...start('processing'), value: 'shipped' }
    expect(syncValue(picked, 'processing', bad).value).toBe('processing')
  })
  it('a failure is only applied once: you can pick again afterwards', () => {
    let s = syncValue({ ...start('processing'), value: 'shipped' }, 'processing', bad)
    s = { ...s, value: 'delivered' } // picked again
    expect(syncValue(s, 'processing', bad).value).toBe('delivered') // same result object, not a new failure
  })
})
