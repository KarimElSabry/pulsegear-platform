// src/lib/synced-value.ts
// A form field that shows what you picked right away, follows the saved value when the page reloads it, and goes back to the
// saved value if saving failed. (React clears ordinary form fields after a save, which made a changed status look "not saved".)

export type SyncState<R> = { value: string; seenProp: string; seenRes: R | null }

export function syncValue<R extends { ok: boolean }>(state: SyncState<R>, prop: string, res: R | null): SyncState<R> {
  let { value, seenProp, seenRes } = state
  if (prop !== seenProp) { seenProp = prop; value = prop } // the page loaded a new saved value
  if (res !== seenRes) { seenRes = res; if (res && !res.ok) value = prop } // saving failed: show what is really saved
  return { value, seenProp, seenRes }
}
