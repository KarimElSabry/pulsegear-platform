// src/lib/jobs.ts
// Scheduled-job log and health rules. Every cron route is wrapped so that each run is recorded, and a failed run
// sends you a Telegram message instead of failing silently.

import { sendTelegramMessage, escapeTelegramHtml } from '@/lib/telegram'

export const JOBS = {
  'newsletter-weekly': { label: 'Weekly newsletter', everyHours: 24 * 7, graceHours: 36 },
  'meta-spend': { label: 'Meta ad spend sync', everyHours: 24, graceHours: 12 },
  'release-expired': { label: 'Release expired reservations', everyHours: 24, graceHours: 12 },
  'reprice': { label: 'EUR price check', everyHours: 24 * 7, graceHours: 36 },
  'vinted-check': { label: 'Vinted availability check', everyHours: 24, graceHours: 12 },
} as const
export type JobName = keyof typeof JOBS

export interface JobRun { job: string; ok: boolean; status: number | null; message: string | null; started_at: string }

export type JobState = 'ok' | 'failed' | 'overdue' | 'never'
export interface JobHealth { job: JobName; label: string; state: JobState; last: JobRun | null; hint: string }

const HOUR = 3600_000

/** Pure. `runs` can be in any order. */
export function evaluateJobHealth(runs: JobRun[], now = new Date(), only: JobName[] = Object.keys(JOBS) as JobName[]): JobHealth[] {
  return only.map((job) => {
    const spec = JOBS[job]
    const mine = runs.filter((r) => r.job === job).sort((a, b) => b.started_at.localeCompare(a.started_at))
    const last = mine[0] ?? null
    if (!last) return { job, label: spec.label, state: 'never', last, hint: 'Has not run yet since logging was added. It runs on its schedule, or call it once by hand.' }
    if (!last.ok) return { job, label: spec.label, state: 'failed', last, hint: last.message ?? 'The last run failed.' }
    const ageHours = (now.getTime() - new Date(last.started_at).getTime()) / HOUR
    if (ageHours > spec.everyHours + spec.graceHours) {
      return { job, label: spec.label, state: 'overdue', last, hint: `Last ran ${Math.round(ageHours)} hours ago; it should run every ${spec.everyHours} hours. Check Vercel > Cron Jobs and that CRON_SECRET is set.` }
    }
    return { job, label: spec.label, state: 'ok', last, hint: last.message ?? '' }
  })
}

export interface JobDeps {
  record: (row: { job: string; ok: boolean; status: number; message: string; started_at: string }) => Promise<void>
  notify: (html: string) => Promise<unknown>
}

async function defaultRecord(row: Parameters<JobDeps['record']>[0]) {
  try {
    const { createAdminSupabaseClient } = await import('@/lib/supabase')
    const db = createAdminSupabaseClient()
    const { error } = await db.from('job_runs').insert({ ...row, finished_at: new Date().toISOString() })
    if (error && error.code !== 'PGRST205' && error.code !== '42P01') console.error('[jobs] log failed:', error.message)
    // keep the table small
    await db.from('job_runs').delete().lt('started_at', new Date(Date.now() - 90 * 24 * HOUR).toISOString())
  } catch (err) {
    console.error('[jobs] log error:', err instanceof Error ? err.message : err)
  }
}

/**
 * Wraps a cron route handler. Unauthorised calls (401) are not logged, so random visitors cannot fill the log.
 * A response of 400+ or a thrown error counts as a failure: it is logged and sent to Telegram.
 */
export function withJobLog<R extends Request>(
  job: JobName,
  handler: (req: R) => Promise<Response>,
  deps: JobDeps = { record: defaultRecord, notify: sendTelegramMessage },
): (req: R) => Promise<Response> {
  return async (req: R) => {
    const started = new Date().toISOString()
    let res: Response
    try {
      res = await handler(req)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error'
      await deps.record({ job, ok: false, status: 500, message: message.slice(0, 300), started_at: started })
      await deps.notify(`⚠️ <b>${escapeTelegramHtml(JOBS[job].label)}</b> failed\n${escapeTelegramHtml(message.slice(0, 300))}`)
      throw err
    }
    if (res.status === 401) return res
    let message = ''
    try { message = JSON.stringify(await res.clone().json()).slice(0, 300) } catch { /* not JSON */ }
    const ok = res.status < 400
    await deps.record({ job, ok, status: res.status, message, started_at: started })
    if (!ok) await deps.notify(`⚠️ <b>${escapeTelegramHtml(JOBS[job].label)}</b> failed (HTTP ${res.status})\n${escapeTelegramHtml(message)}`)
    return res
  }
}
