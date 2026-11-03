// src/lib/tax/estimate.ts
// A planning estimate of the extra tax caused by the side business. It is NOT a tax return:
// the Steuerberater has the final say. The tariff constants are for 2026 and are kept in one place so they are easy to update.

const TARIFF_YEAR = 2026
const GRUNDFREIBETRAG = 12_348
const ZONE2_END = 17_799
const ZONE3_END = 69_878
const ZONE4_END = 277_825

export const GEWERBE_ALLOWANCE = 24_500
const GEWERBE_MESSZAHL = 0.035
const SECTION_35_FACTOR = 4.0
const SOLI_RATE = 0.055
const SOLI_THRESHOLD = 20_350

const KLEIN_PRIOR_LIMIT = 25_000
const KLEIN_CURRENT_LIMIT = 100_000
/** Side income above this makes a tax return mandatory for employees (section 46 EStG). */
export const SIDE_INCOME_FILING_LIMIT = 410

const eur = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const floor = (n: number) => Math.floor(n)

/** Income tax (section 32a) on a taxable income, whole euros as the law rounds it. */
export function incomeTax(zvE: number): number {
  const x = floor(Math.max(0, zvE))
  if (x <= GRUNDFREIBETRAG) return 0
  if (x <= ZONE2_END) { const y = (x - GRUNDFREIBETRAG) / 10_000; return floor((914.51 * y + 1400) * y) }
  if (x <= ZONE3_END) { const z = (x - ZONE2_END) / 10_000; return floor((173.1 * z + 2397) * z + 1034.87) }
  if (x <= ZONE4_END) return floor(0.42 * x - 11_135.63)
  return floor(0.45 * x - 19_470.38)
}

export interface TaxInput {
  /** Business profit of the year (income minus expenses), EUR. */
  profit: number
  /** Business income of the year (turnover), EUR. */
  turnover: number
  /** Turnover of the year before. */
  priorYearTurnover: number
  /** Your yearly taxable income from the job, before the business. */
  salaryTaxable: number
  hebesatzPct: number
}

export interface TaxEstimate {
  year: number
  profit: number
  incomeTaxExtra: number
  soliExtra: number
  tradeTax: number
  /** Trade tax is credited against income tax (up to 4x the base amount). */
  tradeTaxCredit: number
  totalTax: number
  /** Share of the profit to put aside. */
  reservePct: number | null
  kleinunternehmer: { eligible: boolean; reason: string }
  mustFile: boolean
  notes: string[]
}

export function estimateTax(i: TaxInput): TaxEstimate {
  const profit = Math.max(0, eur(i.profit))
  const salary = Math.max(0, i.salaryTaxable)

  const taxWith = incomeTax(salary + profit)
  const taxWithout = incomeTax(salary)
  let incomeTaxExtra = taxWith - taxWithout

  const base = Math.max(0, floor(profit / 100) * 100 - GEWERBE_ALLOWANCE)
  const messbetrag = floor(base * GEWERBE_MESSZAHL)
  const tradeTax = floor(messbetrag * (i.hebesatzPct / 100))
  const credit = Math.min(incomeTaxExtra, floor(messbetrag * SECTION_35_FACTOR))
  incomeTaxExtra -= credit

  const taxWithAfterCredit = taxWith - credit
  const soliWith = taxWithAfterCredit > SOLI_THRESHOLD ? taxWithAfterCredit * SOLI_RATE : 0
  const soliWithout = taxWithout > SOLI_THRESHOLD ? taxWithout * SOLI_RATE : 0
  const soliExtra = Math.max(0, eur(soliWith - soliWithout))

  const total = eur(incomeTaxExtra + soliExtra + tradeTax)

  const klein = i.priorYearTurnover <= KLEIN_PRIOR_LIMIT && i.turnover <= KLEIN_CURRENT_LIMIT
  const notes: string[] = [
    'Estimate only. Church tax and health insurance effects are not included.',
    'Income tax uses the salary you entered as the starting point, so the business is taxed at your top rate.',
  ]
  if (i.salaryTaxable <= 0) notes.push('Enter your yearly taxable salary in the settings, otherwise the income tax part is too low.')
  if (profit > 0 && profit <= GEWERBE_ALLOWANCE) notes.push(`No trade tax: profit is below the ${GEWERBE_ALLOWANCE.toLocaleString('en-US')} EUR allowance.`)

  return {
    year: TARIFF_YEAR,
    profit,
    incomeTaxExtra: eur(incomeTaxExtra),
    soliExtra,
    tradeTax,
    tradeTaxCredit: credit,
    totalTax: total,
    reservePct: profit > 0 ? Math.round((total / profit) * 1000) / 10 : null,
    kleinunternehmer: klein
      ? { eligible: true, reason: `Turnover is within ${KLEIN_PRIOR_LIMIT.toLocaleString('en-US')} EUR last year and ${KLEIN_CURRENT_LIMIT.toLocaleString('en-US')} EUR this year, so no VAT is charged (section 19 UStG).` }
      : { eligible: false, reason: 'Turnover is above the small-business limits, so VAT rules apply. Ask the Steuerberater.' },
    mustFile: profit > SIDE_INCOME_FILING_LIMIT,
    notes,
  }
}
