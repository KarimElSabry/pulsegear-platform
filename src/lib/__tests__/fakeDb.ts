// In-memory stand-in for the Supabase query builder, for the checkout tests.
// Supports what checkout-service uses: select/insert/update/delete, eq/neq/in/is/lt, order, limit, single/maybeSingle.
type Row = Record<string, unknown>
type Result = { data: unknown; error: { code?: string; message: string } | null }
type Filter = (r: Row) => boolean

let counter = 0
const uuid = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`
const numericIds = new Set(['checkout_items', 'product_variants', 'product_images', 'products', 'order_events_n'])

export class FakeDb {
  tables: Record<string, Row[]> = {}
  /** table -> force an error for every query (to test tolerance of missing tables / columns) */
  failing = new Set<string>()
  /** Called after every update on a table, to simulate another buyer changing a row in between */
  onUpdate: ((table: string, patch: Row) => void) | null = null
  /** Called after every insert on a table */
  onInsert: ((table: string) => void) | null = null
  from(table: string) { this.tables[table] ??= []; return new Query(this, table) }
  seed(table: string, rows: Row[]) { this.tables[table] = rows.map((r) => ({ ...r })) }
  rows(table: string) { return this.tables[table] ?? [] }
}

const DEFAULTS: Record<string, () => Row> = {
  checkout_orders: () => ({ id: uuid(), code: `PG-${String(++counter).padStart(8, '0')}`, view_token: `tok${String(++counter).padStart(20, '0')}`, status: 'pending', created_at: new Date().toISOString() }),
  checkout_items: () => ({ id: ++counter, held: false }),
  deals: () => ({ id: uuid() }),
  order_events: () => ({ id: uuid(), created_at: new Date(Date.now() + ++counter).toISOString() }),
}

class Query implements PromiseLike<Result> {
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private filters: Filter[] = []
  private payload: Row[] = []
  private patch: Row = {}
  private returning = false
  private lim: number | null = null
  private orderBy: { col: string; asc: boolean } | null = null
  private kind: 'many' | 'single' | 'maybe' = 'many'
  constructor(private db: FakeDb, private table: string) {}

  select(_c?: string) { if (this.mode !== 'select') this.returning = true; return this }
  insert(v: Row | Row[]) { this.mode = 'insert'; this.payload = Array.isArray(v) ? v : [v]; return this }
  update(p: Row) { this.mode = 'update'; this.patch = p; return this }
  delete() { this.mode = 'delete'; return this }
  eq(c: string, v: unknown) { this.filters.push((r) => r[c] === v || (v !== null && r[c] !== null && r[c] !== undefined && typeof v === 'string' && typeof r[c] === 'string' && Date.parse(v) === Date.parse(r[c] as string) && /\d{4}-\d{2}-\d{2}T/.test(v))); return this }
  neq(c: string, v: unknown) { this.filters.push((r) => r[c] !== v); return this }
  in(c: string, vs: unknown[]) { this.filters.push((r) => vs.includes(r[c])); return this }
  is(c: string, v: null) { this.filters.push((r) => (r[c] ?? null) === v); return this }
  lt(c: string, v: string) { this.filters.push((r) => r[c] != null && String(r[c]) < v); return this }
  order(col: string, o?: { ascending?: boolean }) { this.orderBy = { col, asc: o?.ascending !== false }; return this }
  limit(n: number) { this.lim = n; return this }
  single() { this.kind = 'single'; return this }
  maybeSingle() { this.kind = 'maybe'; return this }

  private run(): Result {
    if (this.db.failing.has(this.table)) return { data: null, error: { code: 'PGRST205', message: `no table ${this.table}` } }
    const t = this.db.tables[this.table]
    const match = (r: Row) => this.filters.every((f) => f(r))
    if (this.mode === 'select') {
      let rows = t.filter(match)
      if (this.orderBy) { const { col, asc } = this.orderBy; rows = [...rows].sort((a, b) => (a[col]! < b[col]! ? -1 : a[col]! > b[col]! ? 1 : 0) * (asc ? 1 : -1)) }
      if (this.lim !== null) rows = rows.slice(0, this.lim)
      return this.shaped(rows)
    }
    if (this.mode === 'update') {
      const hit = t.filter(match)
      hit.forEach((r) => Object.assign(r, this.patch))
      if (hit.length) this.db.onUpdate?.(this.table, this.patch)
      return this.returning ? this.shaped(hit) : { data: null, error: null }
    }
    if (this.mode === 'delete') {
      const keep = t.filter((r) => !match(r))
      this.db.tables[this.table] = keep
      return { data: null, error: null }
    }
    const out: Row[] = []
    for (const p of this.payload) {
      const base = DEFAULTS[this.table]?.() ?? (numericIds.has(this.table) ? { id: ++counter } : { id: uuid() })
      const row = { ...base, ...p }
      t.push(row)
      out.push(row)
    }
    this.db.onInsert?.(this.table)
    return this.returning ? this.shaped(out) : { data: null, error: null }
  }

  private shaped(found: Row[]): Result {
    const rows = found.map((r) => ({ ...r }))
    if (this.kind === 'single') return rows.length === 1 ? { data: rows[0], error: null } : { data: null, error: { message: 'not found' } }
    if (this.kind === 'maybe') return { data: rows[0] ?? null, error: null }
    return { data: rows, error: null }
  }

  then<T1 = Result, T2 = never>(res?: ((v: Result) => T1 | PromiseLike<T1>) | null, rej?: ((r: unknown) => T2 | PromiseLike<T2>) | null) {
    return Promise.resolve(this.run()).then(res, rej)
  }
}
