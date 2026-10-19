// src/app/admin/milestones/page.tsx

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { analyze } from '@/lib/finance/engine'
import { loadDataset } from '@/lib/finance/load'
import { addDays, daysInRange, todayCairo } from '@/lib/finance/range'
import { getEgpPerEur, toEur } from '@/lib/finance/fx'
import { METRIC_LABEL, etaDays, metricValueEgp, progressPct, stageMessage, type Milestone } from '@/lib/milestones'
import ActionForm, { Field, inputClass } from '../analytics/ActionForm'
import Confetti from './Confetti'
import ConfirmDeleteButton from './ConfirmDeleteButton'
import { archiveMilestone, createMilestone, deleteMilestone, updateMilestone } from './actions'

export const dynamic = 'force-dynamic'

const eur = (n: number | null, digits = 0) =>
  n === null ? '—' : '€' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export default async function MilestonesPage() {
  await assertAdmin()
  const db = createAdminSupabaseClient()

  const { data, error } = await db.from('milestones').select('*').order('created_at', { ascending: false })
  const missingTable = !!error && (error.code === 'PGRST205' || error.code === '42P01')
  const all = (data ?? []) as Milestone[]
  const active = all.find((m) => !m.archived) ?? null
  const past = all.filter((m) => m.id !== active?.id)

  let progress: {
    valueEgp: number; valueEur: number | null; pct: number; remainingEur: number | null
    perDayEur: number | null; eta: number | null; rate: number | null; rateSource: string | null
  } | null = null
  let achievedAt = active?.achieved_at ?? null

  if (active) {
    const today = todayCairo()
    const from = active.start_date ?? '2000-01-01'
    const ds = await loadDataset(db, { from, to: today })
    const value = metricValueEgp(analyze(ds, { from, to: today }).totals, active.metric)

    // recent pace: last 30 days (or since the start date if that is more recent)
    const paceFrom = from > addDays(today, -29) ? from : addDays(today, -29)
    const paceValue = metricValueEgp(analyze(ds, { from: paceFrom, to: today }).totals, active.metric)

    const fx = await getEgpPerEur(active.eur_rate_override)
    const valueEur = toEur(value, fx.rate)
    const perDayEur = toEur(paceValue / daysInRange(paceFrom, today), fx.rate)
    const target = Number(active.target_eur)
    const pct = valueEur === null ? 0 : progressPct(valueEur, target)
    const remainingEur = valueEur === null ? null : Math.max(0, Math.round((target - valueEur) * 100) / 100)

    if (pct >= 100 && !achievedAt) {
      // remember the day the milestone was first reached; only ever sets it once
      const now = new Date().toISOString()
      const { error: stampError } = await db.from('milestones').update({ achieved_at: now }).eq('id', active.id).is('achieved_at', null)
      if (!stampError) achievedAt = now
    }
    progress = {
      valueEgp: value, valueEur, pct, remainingEur, perDayEur,
      eta: remainingEur === null || perDayEur === null ? null : etaDays(remainingEur, perDayEur),
      rate: fx.rate, rateSource: fx.source,
    }
  }

  const reached = !!progress && progress.pct >= 100

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">🏆 Milestones</h1>
        <p className="text-zinc-500 text-sm mt-1">Set a target in euros and watch the progress bar fill as orders come in.</p>
      </div>

      {missingTable && (
        <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-xl px-4 py-3">
          Run <code>20261019_01_milestones.sql</code> in Supabase first.
        </p>
      )}
      {error && !missingTable && <p className="text-red-400 text-sm">Could not load milestones: {error.message}</p>}

      {active && progress && (
        <section className={`relative overflow-hidden rounded-3xl border p-8 ${reached ? 'border-yellow-400/40 bg-linear-to-br from-yellow-500/10 via-gray-900 to-purple-500/10' : 'border-gray-800 bg-gray-900'}`}>
          {reached && <Confetti />}
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{METRIC_LABEL[active.metric]}{active.start_date ? ` since ${day(active.start_date)}` : ' since the first sale'}</p>
            <h2 className="text-3xl font-black text-white mt-1">{active.title}</h2>

            {reached && (
              <p className="mt-4 text-2xl font-black text-yellow-300">🎉 Milestone reached{achievedAt ? ` on ${day(achievedAt)}` : ''}! 🎉</p>
            )}

            <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
              <p className="text-5xl font-black text-white">{eur(progress.valueEur)}</p>
              <p className="text-lg text-zinc-400">of {eur(Number(active.target_eur))}</p>
            </div>

            <div className="mt-4">
              <div className="h-6 w-full rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-linear-to-r from-yellow-400 via-orange-400 to-pink-500' : 'bg-linear-to-r from-purple-600 via-pink-500 to-orange-400'}`}
                  style={{ width: `${Math.min(100, progress.pct)}%` }}
                  role="progressbar" aria-valuenow={Math.min(100, progress.pct)} aria-valuemin={0} aria-valuemax={100}
                />
              </div>
              <div className="relative mt-1 h-4 text-[11px] text-zinc-600">
                {[25, 50, 75, 100].map((m) => (
                  <span key={m} className="absolute -translate-x-1/2" style={{ left: `${m === 100 ? 97 : m}%` }}>{m}%</span>
                ))}
              </div>
              <p className="text-white font-bold text-xl mt-2">{progress.pct}% <span className="text-zinc-500 font-normal text-base">· {stageMessage(progress.pct)}</span></p>
            </div>

            {progress.valueEur === null ? (
              <p className="mt-4 text-sm text-yellow-300">Could not get the EUR exchange rate right now. Archive this milestone and create it again with a manual rate, or reload in a moment.</p>
            ) : (
              <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-800/60 rounded-xl p-3"><p className="text-zinc-500 text-xs">Still to go</p><p className="text-white font-bold text-lg">{eur(progress.remainingEur)}</p></div>
                <div className="bg-gray-800/60 rounded-xl p-3"><p className="text-zinc-500 text-xs">Recent pace (last 30 days)</p><p className="text-white font-bold text-lg">{eur(progress.perDayEur, 1)} / day</p></div>
                <div className="bg-gray-800/60 rounded-xl p-3"><p className="text-zinc-500 text-xs">At this pace</p><p className="text-white font-bold text-lg">{reached ? 'Done!' : progress.eta === null ? 'Not enough data' : `about ${progress.eta} day${progress.eta === 1 ? '' : 's'}`}</p></div>
              </div>
            )}

            <p className="mt-4 text-[11px] text-zinc-600">
              {progress.valueEgp.toLocaleString('en-US', { maximumFractionDigits: 0 })} EGP converted at 1 EUR = {progress.rate?.toFixed(2) ?? '—'} EGP ({progress.rateSource === 'manual' ? 'rate you set' : 'live rate, refreshed hourly'}).
              {active.metric === 'net_result' && ' Net result counts only the costs you have entered, so enter your costs for an accurate figure.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <form action={archiveMilestone}>
                <input type="hidden" name="id" value={active.id} />
                <button className="text-xs text-zinc-500 hover:text-white underline">{reached ? 'Done celebrating? Archive it and set the next milestone' : 'Archive this milestone'}</button>
              </form>
              <form action={deleteMilestone}>
                <input type="hidden" name="id" value={active.id} />
                <ConfirmDeleteButton message={`Delete "${active.title}" permanently?`} />
              </form>
            </div>

            <details className="mt-4 group">
              <summary className="cursor-pointer text-xs text-purple-400 hover:text-purple-300">✏️ Edit this milestone</summary>
              <div className="mt-3">
                <ActionForm action={updateMilestone} title="Edit milestone" description="If you change the target, what counts or the start date, the progress is recalculated at once." submitLabel="Save changes">
                  <input type="hidden" name="id" value={active.id} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Name"><input name="title" required maxLength={80} defaultValue={active.title} className={inputClass} /></Field>
                    <Field label="Target (EUR)"><input name="target_eur" type="number" step="0.01" min="1" required defaultValue={Number(active.target_eur)} className={inputClass} /></Field>
                    <Field label="What counts?">
                      <select name="metric" defaultValue={active.metric} className={inputClass}>
                        <option value="net_revenue">Net sales revenue (what customers paid)</option>
                        <option value="net_result">Net result (after the costs I entered)</option>
                      </select>
                    </Field>
                    <Field label="Count sales from (optional)" hint="Empty = since your first sale."><input name="start_date" type="date" defaultValue={active.start_date ?? ''} className={inputClass} /></Field>
                    <Field label="EUR rate (optional)" hint="EGP per 1 EUR. Empty = live rate."><input name="eur_rate_override" type="number" step="0.01" min="0.01" defaultValue={active.eur_rate_override ?? ''} className={inputClass} /></Field>
                  </div>
                </ActionForm>
              </div>
            </details>
          </div>
        </section>
      )}

      {!active && !missingTable && (
        <p className="text-zinc-400 text-sm">No active milestone. Create your first one below.</p>
      )}

      {!missingTable && (
        <ActionForm
          action={createMilestone}
          title={active ? 'Set the next milestone' : 'Create a milestone'}
          description="Only one milestone is shown at a time: the newest one that is not archived."
          submitLabel="Create milestone"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input name="title" required maxLength={80} placeholder="First €5,000" className={inputClass} /></Field>
            <Field label="Target (EUR)"><input name="target_eur" type="number" step="0.01" min="1" required placeholder="5000" className={inputClass} /></Field>
            <Field label="What counts?">
              <select name="metric" defaultValue="net_revenue" className={inputClass}>
                <option value="net_revenue">Net sales revenue (what customers paid)</option>
                <option value="net_result">Net result (after the costs I entered)</option>
              </select>
            </Field>
            <Field label="Count sales from (optional)" hint="Leave empty to count everything since your first sale."><input name="start_date" type="date" className={inputClass} /></Field>
            <Field label="EUR rate (optional)" hint="EGP per 1 EUR. Leave empty to use the live rate."><input name="eur_rate_override" type="number" step="0.01" min="0.01" placeholder="e.g. 55" className={inputClass} /></Field>
          </div>
        </ActionForm>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-white font-bold text-lg mb-3">Earlier milestones</h2>
          <ul className="divide-y divide-gray-800 bg-gray-900 border border-gray-800 rounded-2xl text-sm">
            {past.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 px-4 py-3 text-gray-300">
                <span>{m.achieved_at ? '🏆' : '·'} {m.title} <span className="text-zinc-500">({eur(Number(m.target_eur))})</span></span>
                <span className="flex items-center gap-4">
                  <span className="text-zinc-500">{m.achieved_at ? `reached ${day(m.achieved_at)}` : 'archived, not reached'}</span>
                  <form action={deleteMilestone}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmDeleteButton message={`Delete "${m.title}" permanently?`} />
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
