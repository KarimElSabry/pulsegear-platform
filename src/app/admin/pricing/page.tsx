// src/app/admin/pricing/page.tsx
// Automatic EUR-based pricing: what would change, your approval, settings, and history with undo.

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { getEgpPerEur } from '@/lib/finance/fx'
import { costEgp, marginPct, planReprice, planSetup, type PricingSettings } from '@/lib/repricing'
import { loadProducts, loadSettings, recentBatches } from '@/lib/pricing-service'
import { ApprovalForm, ProductsForm, SettingsForm, UndoForm } from './PricingForms'

export const dynamic = 'force-dynamic'

const fmt = (n: number) => n.toLocaleString('en-US')
const when = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'never'
const th = 'text-left text-xs font-semibold text-zinc-400 px-3 py-2 whitespace-nowrap'
const td = 'px-3 py-2 text-sm text-zinc-200'

function Margin({ value, s }: { value: number | null; s: PricingSettings }) {
  if (value === null) return <span className="text-zinc-500">unknown</span>
  const color = value < s.minMarginPct ? 'text-red-400' : value < s.targetMarginPct ? 'text-amber-300' : 'text-green-400'
  return <span className={color}>{value}%</span>
}

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ baseline?: string }> }) {
  await assertAdmin()
  const db = createAdminSupabaseClient()
  const state = await loadSettings(db)
  const live = state.ready ? await loadProducts(db) : null

  if (!state.ready || !live?.ok) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-3">Pricing</h1>
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4 text-sm">
          Run supabase/migrations/20261026_01_repricing.sql in the Supabase SQL editor, then reload this page.
        </p>
      </div>
    )
  }

  const { rate, source } = await getEgpPerEur(state.manualRate)
  const s = state.settings
  const products = live.products
  const params = await searchParams
  const typed = Number(params.baseline)
  const baseline = Number.isFinite(typed) && typed > 0 ? typed : rate ? Math.round((rate - 3.5) * 100) / 100 : 0

  const plan = rate ? planReprice(products, rate, s) : null
  const setup = rate && baseline ? planSetup(products, rate, baseline, s) : []
  const batches = await recentBatches(db)
  const followed = products.filter((p) => p.follows_eur).length

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">💶 Pricing</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Prices follow the euro in clean steps of 50 and keep your profit margin. Nothing changes without your approval unless you switch on automatic updates below.
        </p>
        <p className="mt-3 text-sm text-zinc-300">
          {rate ? <>1 EUR = <b className="text-white">{rate.toFixed(2)} EGP</b> ({source === 'manual' ? 'your fixed rate' : 'live market rate'})</> : <span className="text-red-400">Could not read the EUR rate. Set a fixed rate in the settings.</span>}
          {' · '}{followed} product{followed === 1 ? '' : 's'} follow the euro · last weekly check: {when(state.lastRunAt)}
          {state.lastRate ? <> at {state.lastRate.toFixed(2)}</> : null}
        </p>
      </header>

      {setup.length > 0 && rate && (
        <section className="rounded-2xl border border-purple-500/40 bg-zinc-900 p-5 space-y-3">
          <h2 className="text-lg font-bold text-white">1. First-time setup: proposed new prices</h2>
          <p className="text-sm text-zinc-400">
            Today&apos;s prices are the starting point. The euro moved from <b className="text-white">{baseline.toFixed(2)}</b> to <b className="text-white">{rate.toFixed(2)}</b>,
            so these prices go up slightly, rounded up to the next 50. Only items with an official-store EUR price are listed. Untick any you want to leave alone.
          </p>
          <form method="get" className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
            <label htmlFor="baseline">The euro was at</label>
            <input id="baseline" name="baseline" defaultValue={baseline} inputMode="decimal" autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white w-24" />
            <span>when these prices were set.</span>
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg">Recalculate</button>
          </form>
          <ApprovalForm kind="setup" baseline={baseline} count={setup.length}>
            <table className="w-full min-w-[700px]">
              <thead><tr><th className={th}></th><th className={th}>Product</th><th className={th}>Store price</th><th className={th}>Now</th><th className={th}>New</th><th className={th}>Change</th><th className={th}>Margin now → new</th></tr></thead>
              <tbody className="divide-y divide-zinc-800">
                {setup.map((r) => (
                  <tr key={r.id}>
                    <td className={td}><input type="checkbox" name="change" value={`${r.id}:${r.from}:${r.to}`} defaultChecked aria-label={`Approve ${r.title}`} /></td>
                    <td className={`${td} max-w-xs truncate`} title={r.title}>{r.title}</td>
                    <td className={td}>€{fmt(r.storeEur)}</td>
                    <td className={td}>{fmt(r.from)}</td>
                    <td className={`${td} font-bold text-white`}>{fmt(r.to)}</td>
                    <td className={td}>{r.to === r.from ? 'no change' : `+${r.changePct}%`}</td>
                    <td className={td}><Margin value={r.marginFrom} s={s} /> → <Margin value={r.marginTo} s={s} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ApprovalForm>
          <p className="text-xs text-zinc-500">Margin = profit as a share of the selling price. It is estimated from your cost (or the store price × the factor in the settings), so fill in the real cost below for exact numbers.</p>
        </section>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">{setup.length > 0 ? '2. ' : ''}Proposed changes for products that follow the euro</h2>
        {followed === 0 ? (
          <p className="text-sm text-zinc-400">No product follows the euro yet. Approve the first-time setup above, or tick products in the list below.</p>
        ) : plan && plan.changes.length > 0 ? (
          <ApprovalForm kind="changes" count={plan.changes.length}>
            <table className="w-full min-w-[700px]">
              <thead><tr><th className={th}></th><th className={th}>Product</th><th className={th}>Now</th><th className={th}>New</th><th className={th}>Change</th><th className={th}>Margin now → new</th><th className={th}>Note</th></tr></thead>
              <tbody className="divide-y divide-zinc-800">
                {plan.changes.map((c) => (
                  <tr key={c.id}>
                    <td className={td}><input type="checkbox" name="change" value={`${c.id}:${c.from}:${c.to}`} defaultChecked aria-label={`Approve ${c.title}`} /></td>
                    <td className={`${td} max-w-xs truncate`} title={c.title}>{c.title}</td>
                    <td className={td}>{fmt(c.from)}</td>
                    <td className={`${td} font-bold text-white`}>{fmt(c.to)}</td>
                    <td className={td}>{c.changePct > 0 ? '+' : ''}{c.changePct}%</td>
                    <td className={td}><Margin value={c.marginFrom} s={s} /> → <Margin value={c.marginTo} s={s} /></td>
                    <td className={`${td} text-xs text-zinc-400`}>{c.marginRaise ? 'raised to keep your minimum margin' : c.capped ? 'limited per run, the rest follows next week' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ApprovalForm>
        ) : (
          <p className="text-sm text-zinc-400">Nothing to change right now. {plan?.unchanged ?? 0} followed product{plan?.unchanged === 1 ? ' is' : 's are'} already at the right price.</p>
        )}
        {plan && plan.lowMargin.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            <p className="font-semibold">Below your {s.targetMarginPct}% target margin:</p>
            <ul className="mt-1 list-disc pl-5">{plan.lowMargin.slice(0, 12).map((m) => <li key={m.id}>{m.title.slice(0, 70)} ({m.margin}%)</li>)}</ul>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">Settings</h2>
        <SettingsForm s={s} manualRate={state.manualRate} />
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">Products: follow the euro and real cost</h2>
        <p className="text-sm text-zinc-400">Tick the products whose price should move with the euro. Used and one-off items you already paid for usually should not. Cost (in EUR) is optional; it makes the margin exact.</p>
        <ProductsForm ids={products.map((p) => p.id)}>
          <table className="w-full min-w-[700px]">
            <thead><tr><th className={th}>Follows the euro</th><th className={th}>Product</th><th className={th}>Price</th><th className={th}>Store price (EUR)</th><th className={th}>Your cost (EUR)</th><th className={th}>Margin</th></tr></thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className={td}><input type="checkbox" name={`follow_${p.id}`} defaultChecked={p.follows_eur} aria-label={`${p.title} follows the euro`} /></td>
                  <td className={`${td} max-w-xs truncate`} title={p.title}>{p.title}</td>
                  <td className={td}>{fmt(p.price_egp)}</td>
                  <td className={td}>{p.original_price ? `€${fmt(p.original_price)}` : '–'}</td>
                  <td className={td}><input name={`cost_${p.id}`} defaultValue={p.cost_eur ?? ''} inputMode="decimal" autoComplete="off" className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white w-24 text-sm" aria-label={`Cost of ${p.title} in EUR`} /></td>
                  <td className={td}>{rate ? <Margin value={marginPct(p.price_egp, costEgp(p, rate, s))} s={s} /> : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ProductsForm>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">History</h2>
        {batches.length === 0 ? <p className="text-sm text-zinc-400">No price has been changed automatically yet.</p> : (
          <ul className="divide-y divide-zinc-800">
            {batches.map((b) => (
              <li key={b.batchId} className="py-3 space-y-1">
                <p className="text-sm text-zinc-200"><b className="text-white">{when(b.createdAt)}</b> · {b.count} price{b.count === 1 ? '' : 's'} · {b.reason}{b.rate ? ` · rate ${b.rate.toFixed(2)}` : ''}{b.undone ? ' · undone' : ''}</p>
                <p className="text-xs text-zinc-500">{b.sample.map((x) => `${x.title.slice(0, 30)}: ${fmt(x.from)} → ${fmt(x.to)}`).join(' · ')}{b.count > b.sample.length ? ' …' : ''}</p>
                {!b.undone && <UndoForm batchId={b.batchId} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
