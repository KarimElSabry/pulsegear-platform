import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import { analyze } from '../engine'
import { toCsv, toHtml, toXlsx, safeText } from '../export'
import { mapAttributions, mapLegacyCommission, mapSales } from '../load'
import { buildReport, reconciliation, REPORT_IDS } from '../reports'
import { parseCsv, parseSpendCsv, spendHash, validateSpend } from '../spend'
import { attribution, cost, dataset, item, RANGE, refund, sale, spend, touch } from './fixtures'

function richDataset() {
  const a = sale({ channel: 'whatsapp', discount: 100, shippingRevenue: 40, items: [item({ productId: 1, productName: 'Watch', unitPrice: 1000, unitCostSnapshot: 600 }), item({ productId: 2, productName: 'Strap', unitPrice: 200, unitCostSnapshot: 50, quantity: 2 })] })
  const b = sale({ channel: 'instagram', paymentMethod: 'cod', deliveryStatus: 'delivered', items: [item({ productId: 1, productName: 'Watch', unitPrice: 1200, unitCostSnapshot: 600 })] })
  const c = sale({ status: 'failed_delivery', deliveryStatus: 'failed', items: [item({ productId: 3, productName: 'Band', unitPrice: 300, unitCostSnapshot: 100 })] })
  const d = sale({ items: [item({ productId: 2, productName: 'Strap', unitPrice: 250, unitCostSnapshot: null })] })
  return dataset({
    sales: [a, b, c, d],
    refunds: [refund(b.id, { amount: 200 })],
    orderCosts: [cost(a.id, { category: 'packaging', amount: 25 }), cost(a.id, { category: 'payment_fee', amount: 15 }), cost(c.id, { category: 'failed_delivery', amount: 70 }), cost(b.id, { category: 'commission', amount: 60, source: 'legacy_commission' })],
    spend: [spend({ amountEgp: 200 }), spend({ campaign: 'Other', amountEgp: 80, date: '2026-10-06' })],
    expenses: [{ id: 'e1', category: 'rent', amount: 500, date: '2026-10-02', note: null }, { id: 'e2', category: 'interest', amount: 10, date: '2026-10-02', note: null }],
    attributions: [attribution(a.id), attribution(b.id, { status: 'unknown' })],
    touchpoints: [touch({ event: 'reservation_created' })],
  })
}

describe('dashboard and reports share one calculation', () => {
  const ds = richDataset()
  const analysis = analyze(ds, RANGE, { comparePrevious: true })
  const t = analysis.totals

  it('every reconciliation check passes on a rich dataset', () => {
    const bad = reconciliation(analysis).filter((c) => c.status !== 'ok')
    expect(bad).toEqual([])
  })

  it('sales report totals equal dashboard totals', () => {
    const r = buildReport('sales', ds, RANGE, { analysis })
    expect(r.totals?.net_revenue).toBe(t.netSalesRevenue)
    expect(r.totals?.gross_profit).toBe(t.grossProfit)
    expect(r.totals?.cogs).toBe(t.cogs)
    expect(r.totals?.contribution).toBe(t.contributionBeforeAds)
    expect(r.totals?.order_costs).toBe(t.orderCostsTotal)
    expect(r.rows).toHaveLength(4)
  })

  it('executive report current values equal dashboard totals', () => {
    const r = buildReport('executive', ds, RANGE, { analysis })
    const get = (m: string) => r.rows.find((x) => x.metric === m)?.current
    expect(get('Net Sales Revenue')).toBe(t.netSalesRevenue)
    expect(get('Contribution After Ads')).toBe(t.contributionAfterAds)
    expect(get('Operating Profit')).toBe(t.operatingProfit)
    expect(get('Completed Orders')).toBe(t.completedOrders)
  })

  it('product report adds up to the dashboard', () => {
    const r = buildReport('products', ds, RANGE, { analysis })
    expect(r.totals?.net_revenue).toBe(t.netSalesRevenue)
    expect(r.totals?.contribution).toBe(t.contributionBeforeAds)
  })

  it('costs report adds up to order costs + operating expenses + tax/interest + ad spend, with no overlap', () => {
    const r = buildReport('costs', ds, RANGE, { analysis })
    const sumType = (type: string) => r.rows.filter((x) => x.type === type).reduce((a, x) => a + (x.amount as number), 0)
    expect(Math.round(sumType('order_cost') * 100) / 100).toBe(t.orderCostsTotal)
    expect(sumType('operating_expense')).toBe(t.operatingExpenses)
    expect(sumType('tax_interest')).toBe(t.taxAndInterest)
    expect(sumType('ad_spend')).toBe(t.adSpend)
  })

  it('costs report honours the category filter', () => {
    const r = buildReport('costs', ds, { ...RANGE, costCategory: 'packaging' })
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0].category).toBe('packaging')
  })

  it('campaign report total spend equals ad spend and contains no customer data', () => {
    const r = buildReport('campaigns', ds, RANGE, { analysis })
    expect(r.totals?.spend).toBe(t.adSpend)
    for (const id of REPORT_IDS) {
      const columns = buildReport(id, ds, RANGE).columns.map((c) => `${c.key} ${c.label}`.toLowerCase()).join(' ')
      expect(columns).not.toMatch(/phone|email|address|customer|name\b/)
    }
  })

  it('quality report lists the alerts it found', () => {
    const r = buildReport('quality', ds, RANGE, { analysis })
    expect(r.rows.some((x) => String(x.item).includes('no recorded product cost'))).toBe(true)
  })
})

describe('exports', () => {
  const ds = richDataset()

  it('CSV matches the report row for row and ends with a totals row', () => {
    const r = buildReport('sales', ds, RANGE)
    const csv = toCsv(r)
    const parsed = parseCsv(csv)
    expect(parsed).toHaveLength(r.rows.length + 2)
    expect(parsed[parsed.length - 1][0]).toBe('TOTAL')
  })

  it('neutralises spreadsheet formulas', () => {
    expect(safeText('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(safeText('+1')).toBe("'+1")
    expect(safeText('Garmin')).toBe('Garmin')
    const r = buildReport('sales', dataset({ sales: [sale({ items: [item({ productName: '=HYPERLINK("http://x")' })] })] }), RANGE)
    expect(toCsv(r)).toContain("'=HYPERLINK")
  })

  it('quotes cells containing commas and quotes', () => {
    const r = buildReport('sales', dataset({ sales: [sale({ items: [item({ productName: 'Fenix, "Pro"' })] })] }), RANGE)
    expect(toCsv(r)).toContain('"Fenix, ""Pro"""')
  })

  it('HTML escapes content and renders a totals row', () => {
    const r = buildReport('sales', dataset({ sales: [sale({ items: [item({ productName: '<script>x</script>' })] })] }), RANGE)
    const html = toHtml(r)
    expect(html).not.toContain('<script>x')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('class="total"')
  })

  it('XLSX is a valid workbook with the same row count and money as numbers', async () => {
    const r = buildReport('sales', ds, RANGE)
    const buf = await toXlsx(r)
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buf as unknown as ArrayBuffer)
    const ws = wb.worksheets[0]
    expect(ws.rowCount).toBe(r.rows.length + 2)
    const netCol = r.columns.findIndex((c) => c.key === 'net_revenue') + 1
    expect(typeof ws.getRow(2).getCell(netCol).value).toBe('number')
    expect(ws.getRow(ws.rowCount).getCell(netCol).value).toBe(r.totals?.net_revenue)
  })
})

describe('loading legacy rows', () => {
  const legacyRow = {
    id: 's1', product_name: 'Fenix 6X', cost_egp: '8000', selling_price_egp: '12000', commission_egp: '500',
    sale_channel: 'whatsapp', sale_date: '2026-10-02', discount_code: 'SAVE10', created_at: '2026-10-02T10:00:00Z',
  }

  it('turns an old sale row into one item with its cost as the snapshot, and commission into a cost', () => {
    const [s] = mapSales([legacyRow], [])
    expect(s.legacy).toBe(true)
    expect(s.items).toHaveLength(1)
    expect(s.items[0].unitPrice).toBe(12000)
    expect(s.items[0].unitCostSnapshot).toBe(8000)
    expect(s.status).toBe('completed')
    const [c] = mapLegacyCommission([legacyRow])
    expect(c.category).toBe('commission')
    expect(c.amount).toBe(500)
  })

  it('treats a zero stored cost as missing, not as free goods', () => {
    const [s] = mapSales([{ ...legacyRow, cost_egp: '0' }], [])
    expect(s.items[0].unitCostSnapshot).toBeNull()
    const a = analyze(dataset({ sales: [s] }), RANGE)
    expect(a.totals.missingCostRecords).toBe(1)
  })

  it('uses real item rows when they exist and ignores the sale-level price for revenue', () => {
    const [s] = mapSales([{ ...legacyRow, selling_price_egp: '900', discount_egp: '100' }], [
      { id: 'i1', sale_id: 's1', product_id: 4, product_name: 'A', quantity: 1, unit_price_egp: '600', unit_cost_egp_snapshot: '300' },
      { id: 'i2', sale_id: 's1', product_id: 5, product_name: 'B', quantity: 2, unit_price_egp: '200', unit_cost_egp_snapshot: '50' },
    ])
    expect(s.legacy).toBe(false)
    expect(s.items).toHaveLength(2)
    const a = analyze(dataset({ sales: [s] }), RANGE)
    expect(a.totals.netSalesRevenue).toBe(900)
    expect(a.alerts.some((x) => x.code === 'reconciliation_mismatch')).toBe(false)
  })

  it('keeps only one attribution per sale', () => {
    const rows = mapAttributions([
      { sale_id: 's1', status: 'attributed', utm_campaign: 'A', model: 'manual' },
      { sale_id: 's1', status: 'attributed', utm_campaign: 'B', model: 'manual' },
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0].utmCampaign).toBe('A')
  })
})

describe('advertising spend import', () => {
  it('hash ignores case and spacing so a re-import is a duplicate', () => {
    const base = { platform: 'Instagram', campaign: 'Fenix  Launch', date: '2026-10-04', currency: 'egp', amount: 300 }
    expect(spendHash(base)).toBe(spendHash({ ...base, platform: ' instagram ', campaign: 'fenix launch', currency: 'EGP' }))
    expect(spendHash(base)).not.toBe(spendHash({ ...base, amount: 301 }))
    expect(spendHash(base)).not.toBe(spendHash({ ...base, date: '2026-10-05' }))
  })

  it('parses a CSV, drops in-file duplicates and reports bad rows with line numbers', () => {
    const csv = [
      'platform,campaign,date,currency,amount',
      'Instagram,"Fenix, Launch",2026-10-04,EGP,300',
      'instagram,"fenix, launch",2026-10-04,EGP,300',
      'Facebook,Spring,2026-10-05,EGP,150.50',
      'Facebook,Spring,not-a-date,EGP,10',
      'Google,Brand,2026-10-06,USD,10',
      'Google,Brand,2026-10-07,USD,10,',
    ].join('\r\n')
    const r = parseSpendCsv(csv)
    expect(r.valid).toHaveLength(2)
    expect(r.duplicatesInFile).toBe(1)
    expect(r.rejected.map((x) => x.line)).toEqual([5, 6, 7])
    expect(r.rejected[1].error).toMatch(/exchange rate/)
  })

  it('converts foreign currency with an exchange rate or explicit EGP amount', () => {
    const a = validateSpend({ platform: 'Google', campaign: 'Brand', date: '2026-10-06', currency: 'USD', amount: 10, fxRateToEgp: 50 }, 'manual')
    expect(a.ok && a.row.amount_egp).toBe(500)
    const b = validateSpend({ platform: 'Google', campaign: 'Brand', date: '2026-10-06', currency: 'USD', amount: 10, amountEgp: 480 }, 'manual')
    expect(b.ok && b.row.amount_egp).toBe(480)
  })

  it('rejects missing columns, negative amounts and impossible dates', () => {
    expect(parseSpendCsv('platform,campaign,amount\nA,B,1').rejected[0].error).toMatch(/missing column "date"/)
    expect(validateSpend({ platform: 'A', campaign: 'B', date: '2026-02-30', currency: 'EGP', amount: 1 }, 'csv').ok).toBe(false)
    expect(validateSpend({ platform: 'A', campaign: 'B', date: '2026-02-01', currency: 'EGP', amount: -1 }, 'csv').ok).toBe(false)
  })
})

describe('EUR columns', () => {
  it('adds a EUR column after every money column and converts totals at one rate', async () => {
    const { withEurColumns } = await import('../reports')
    const base = {
      id: 'sales' as const, title: 't', filters: { from: '2026-10-01', to: '2026-10-31' }, note: 'n',
      columns: [{ key: 'name', label: 'Name', type: 'text' as const }, { key: 'cost', label: 'Cost', type: 'money' as const }],
      rows: [{ name: 'a', cost: 5500 }, { name: 'b', cost: null }],
      totals: { name: 'TOTAL', cost: 5500 },
    }
    const out = withEurColumns(base, 55)
    expect(out.columns.map((c) => c.key)).toEqual(['name', 'cost', 'cost_eur'])
    expect(out.columns[2].label).toBe('Cost (EUR)')
    expect(out.rows[0].cost_eur).toBe(100)
    expect(out.rows[1].cost_eur).toBeNull()
    expect(out.totals?.cost_eur).toBe(100)
    expect(out.note).toContain('1 EUR = 55.00 EGP')
  })
  it('executive report converts money rows only, never ratios', async () => {
    const { buildReport } = await import('../reports')
    const { dataset, RANGE } = await import('./fixtures')
    const r = buildReport('executive', dataset(), RANGE, { comparePrevious: false, egpPerEur: 50 })
    expect(r.columns.map((c) => c.key)).toContain('current_eur')
    const roas = r.rows.find((x) => x.metric === 'ROAS')!
    const orders = r.rows.find((x) => x.metric === 'Completed Orders')!
    expect(roas.current_eur).toBeNull()
    expect(orders.current_eur).toBeNull()
    const rev = r.rows.find((x) => x.metric === 'Net Sales Revenue')!
    if (typeof rev.current === 'number') expect(rev.current_eur).toBe(Math.round((rev.current / 50) * 100) / 100)
  })
  it('executive report always has a Net Result So Far number, even when Net Profit is blank', async () => {
    const { buildReport } = await import('../reports')
    const { analyze } = await import('../engine')
    const { netSoFar } = await import('../summary')
    const { dataset, RANGE } = await import('./fixtures')
    const ds = { ...dataset(), expenses: [], orderCosts: [], spend: [] }
    const a = analyze(ds, RANGE, { comparePrevious: false })
    const r = buildReport('executive', ds, RANGE, { analysis: a, egpPerEur: 50 })
    const net = r.rows.find((x) => x.metric === 'Net Result So Far')!
    expect(typeof net.current).toBe('number')
    expect(net.current).toBe(netSoFar(a.totals).value)
    expect(typeof net.current_eur).toBe('number')
    expect(r.rows.find((x) => x.metric === 'Net Profit')!.current).toBeNull()
    expect(r.note).toContain('Net Result So Far is not final')
  })
})
