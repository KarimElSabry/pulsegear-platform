// src/app/admin/health/page.tsx

import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { evaluateJobHealth, type JobName, type JobRun } from '@/lib/jobs'
import { checkBrevo, checkTelegram, envChecks, type Check } from '@/lib/health'
import { readMetaConfig } from '@/lib/meta/insights'

export const dynamic = 'force-dynamic'

const dot = { ok: 'bg-green-500', warn: 'bg-yellow-400', bad: 'bg-red-500', failed: 'bg-red-500', overdue: 'bg-yellow-400', never: 'bg-gray-500' } as const
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

function Row({ state, title, detail }: { state: keyof typeof dot; title: string; detail: string }) {
  return (
    <li className="flex gap-3 px-4 py-3">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot[state]}`} />
      <div><p className="text-white text-sm font-semibold">{title}</p><p className="text-zinc-400 text-xs mt-0.5">{detail}</p></div>
    </li>
  )
}

export default async function HealthPage() {
  await assertAdmin()
  const db = createAdminSupabaseClient()

  const { data, error } = await db.from('job_runs').select('job, ok, status, message, started_at').order('started_at', { ascending: false }).limit(200)
  const missingTable = !!error && (error.code === 'PGRST205' || error.code === '42P01')
  const only: JobName[] = ['newsletter-weekly', 'release-expired', ...(readMetaConfig() ? (['meta-spend'] as JobName[]) : [])]
  const jobs = evaluateJobHealth((data ?? []) as JobRun[], new Date(), only)

  const live: Check[] = await Promise.all([checkBrevo(process.env.BREVO_API_KEY), checkTelegram(process.env.TELEGRAM_BOT_TOKEN)])
  const checks = [...envChecks(), ...live]
  const problems = checks.filter((c) => c.state === 'bad').length + jobs.filter((j) => j.state === 'failed' || j.state === 'overdue').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">🩺 Health</h1>
        <p className={`text-sm mt-1 ${problems ? 'text-yellow-300' : 'text-green-400'}`}>{problems ? `${problems} thing(s) need attention.` : 'Everything checked looks fine.'}</p>
      </div>

      {missingTable && <p className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-xl px-4 py-3">Run <code>20261019_02_job_runs.sql</code> in Supabase to start logging scheduled jobs.</p>}

      <section>
        <h2 className="text-white font-bold text-lg mb-2">Scheduled jobs</h2>
        <ul className="divide-y divide-gray-800 bg-gray-900 border border-gray-800 rounded-2xl">
          {jobs.map((j) => (
            <Row key={j.job} state={j.state} title={`${j.label}${j.last ? ` · last run ${when(j.last.started_at)}` : ''}`} detail={j.hint || (j.state === 'ok' ? 'Ran on schedule.' : '')} />
          ))}
        </ul>
        <p className="text-[11px] text-zinc-600 mt-2">A failed run also sends you a Telegram message.</p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg mb-2">Setup</h2>
        <ul className="divide-y divide-gray-800 bg-gray-900 border border-gray-800 rounded-2xl">
          {checks.map((c) => <Row key={c.name} state={c.state} title={c.name} detail={c.detail} />)}
        </ul>
        <p className="text-[11px] text-zinc-600 mt-2">Only whether a value is set and accepted is shown, never the value itself.</p>
      </section>
    </div>
  )
}
