// src/app/admin/analytics/ad-spend/SpendForms.tsx

'use client'

import ActionForm, { Field, inputClass } from '../ActionForm'
import { addSpend, importSpendCsv } from '../finance-actions'

export default function SpendForms() {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="space-y-6">
      <ActionForm action={addSpend} title="Add spend manually" description="One row per platform, campaign and day. Entering the same row twice is rejected." submitLabel="Add spend">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Platform"><input name="platform" required placeholder="instagram" className={inputClass} /></Field>
          <Field label="Campaign"><input name="campaign" required placeholder="Fenix Launch" className={inputClass} /></Field>
          <Field label="Date"><input name="spend_date" type="date" defaultValue={today} required className={inputClass} /></Field>
          <Field label="Currency"><input name="currency" defaultValue="EGP" maxLength={3} className={inputClass} /></Field>
          <Field label="Amount"><input name="amount" type="number" step="0.01" min="0" required className={inputClass} /></Field>
          <Field label="Exchange rate to EGP" hint="Only for non-EGP currencies"><input name="fx_rate_to_egp" type="number" step="0.000001" min="0" className={inputClass} /></Field>
        </div>
      </ActionForm>

      <ActionForm
        action={importSpendCsv}
        title="Import spend from CSV"
        description="Columns: platform, campaign, date (YYYY-MM-DD), amount, and optionally currency, amount_egp, fx_rate. Re-importing the same file adds nothing. Rows with problems are listed, good rows are still imported."
        submitLabel="Import"
      >
        <Field label="CSV file"><input name="file" type="file" accept=".csv,text/csv" className={inputClass} /></Field>
        <Field label="…or paste CSV text">
          <textarea name="csv_text" rows={5} placeholder={'platform,campaign,date,currency,amount\ninstagram,Fenix Launch,2026-10-04,EGP,300'} className={inputClass + ' font-mono'} />
        </Field>
      </ActionForm>
    </div>
  )
}
