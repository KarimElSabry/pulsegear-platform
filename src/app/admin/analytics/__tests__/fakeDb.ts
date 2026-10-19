// Minimal in-memory stand-in for the Supabase query builder, enough for finance-actions.
type Row = Record<string, unknown>
type Result = { data: unknown; error: { code?: string; message: string } | null; count?: number | null }

const PK: Record<string, string> = { sales_attribution: 'sale_id' }
const UNIQUE: Record<string, string[]> = { marketing_spend: ['source_hash'] }
let counter = 0

export class FakeDb {
  tables: Record<string, Row[]> = {}
  from(table: string) { this.tables[table] ??= []; return new Query(this, table) }
  seed(table: string, rows: Row[]) { this.tables[table] = rows.map((r) => ({ ...r })) }
  rows(table: string) { return this.tables[table] ?? [] }
}

class Query implements PromiseLike<Result> {
  private mode: 'select' | 'insert' | 'update' | 'upsert' = 'select'
  private filters: [string, unknown][] = []
  private payload: Row[] = []
  private patch: Row = {}
  private opts: { onConflict?: string; ignoreDuplicates?: boolean } = {}
  private returning = false
  private head = false
  private wantCount = false
  private lim: number | null = null
  private kind: 'many' | 'single' | 'maybe' = 'many'
  constructor(private db: FakeDb, private table: string) {}

  select(_cols?: string, o?: { count?: string; head?: boolean }) {
    if (this.mode === 'select') { this.head = !!o?.head; this.wantCount = !!o?.count } else this.returning = true
    return this
  }
  insert(v: Row | Row[]) { this.mode = 'insert'; this.payload = Array.isArray(v) ? v : [v]; return this }
  upsert(v: Row | Row[], o: { onConflict?: string; ignoreDuplicates?: boolean } = {}) { this.mode = 'upsert'; this.payload = Array.isArray(v) ? v : [v]; this.opts = o; return this }
  update(p: Row) { this.mode = 'update'; this.patch = p; return this }
  eq(c: string, v: unknown) { this.filters.push([c, v]); return this }
  order() { return this }
  limit(n: number) { this.lim = n; return this }
  single() { this.kind = 'single'; return this }
  maybeSingle() { this.kind = 'maybe'; return this }

  private match(r: Row) { return this.filters.every(([c, v]) => r[c] === v) }

  private run(): Result {
    const t = this.db.tables[this.table]
    if (this.mode === 'select') {
      let rows = t.filter((r) => this.match(r))
      if (this.lim !== null) rows = rows.slice(0, this.lim)
      if (this.head) return { data: null, error: null, count: rows.length }
      return this.shaped(rows, this.wantCount ? rows.length : undefined)
    }
    if (this.mode === 'update') {
      const hit = t.filter((r) => this.match(r))
      hit.forEach((r) => Object.assign(r, this.patch))
      return this.returning ? this.shaped(hit) : { data: null, error: null }
    }
    const out: Row[] = []
    const keys = UNIQUE[this.table] ?? []
    const pk = this.opts.onConflict ?? PK[this.table] ?? 'id'
    for (const p of this.payload) {
      const existing = t.find((r) => (this.mode === 'upsert' && r[pk] !== undefined && r[pk] === p[pk]) || keys.some((k) => r[k] === p[k]))
      if (existing) {
        if (this.mode === 'upsert' && this.opts.ignoreDuplicates) continue
        if (this.mode === 'upsert') { Object.assign(existing, p); out.push(existing); continue }
        return { data: null, error: { code: '23505', message: 'duplicate key' } }
      }
      const row = { id: `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`, ...p }
      t.push(row)
      out.push(row)
    }
    return this.returning ? this.shaped(out) : { data: null, error: null }
  }

  private shaped(found: Row[], count?: number): Result {
    // like a real database, hand back copies so later updates cannot change rows already returned
    const rows = found.map((r) => ({ ...r }))
    if (this.kind === 'single') return rows.length === 1 ? { data: rows[0], error: null } : { data: null, error: { message: 'not found' } }
    if (this.kind === 'maybe') return { data: rows[0] ?? null, error: null }
    return { data: rows, error: null, count }
  }

  then<T1 = Result, T2 = never>(res?: ((v: Result) => T1 | PromiseLike<T1>) | null, rej?: ((r: unknown) => T2 | PromiseLike<T2>) | null) {
    return Promise.resolve(this.run()).then(res, rej)
  }
}
