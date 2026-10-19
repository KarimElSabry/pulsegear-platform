import { describe, expect, it, vi } from 'vitest'
import { evaluateJobHealth, withJobLog, type JobRun } from '../jobs'
import { checkBrevo, envChecks } from '../health'

const NOW = new Date('2026-10-19T12:00:00Z')
const run = (job: string, hoursAgo: number, ok = true, message = 'm'): JobRun => ({ job, ok, status: ok ? 200 : 502, message, started_at: new Date(NOW.getTime() - hoursAgo * 3600_000).toISOString() })

describe('evaluateJobHealth', () => {
  it('ok, failed, overdue and never', () => {
    const h = evaluateJobHealth([run('meta-spend', 5), run('vinted-check', 3, false, 'boom'), run('release-expired', 60)], NOW, ['meta-spend', 'vinted-check', 'release-expired', 'newsletter-weekly'])
    expect(h.map((x) => x.state)).toEqual(['ok', 'failed', 'overdue', 'never'])
    expect(h[1].hint).toBe('boom')
  })
  it('uses the newest run and tolerates a weekly job being a little late', () => {
    expect(evaluateJobHealth([run('newsletter-weekly', 24 * 7 + 20), run('newsletter-weekly', 24 * 3, false)], NOW, ['newsletter-weekly'])[0].state).toBe('failed')
    expect(evaluateJobHealth([run('newsletter-weekly', 24 * 7 + 20)], NOW, ['newsletter-weekly'])[0].state).toBe('ok')
    expect(evaluateJobHealth([run('newsletter-weekly', 24 * 9)], NOW, ['newsletter-weekly'])[0].state).toBe('overdue')
  })
})

describe('withJobLog', () => {
  const deps = () => ({ record: vi.fn(async () => {}), notify: vi.fn(async () => {}) })
  it('logs success without notifying', async () => {
    const d = deps()
    const res = await withJobLog('meta-spend', async () => Response.json({ ok: 1 }), d)(new Request('http://x'))
    expect(res.status).toBe(200)
    expect(d.record).toHaveBeenCalledWith(expect.objectContaining({ job: 'meta-spend', ok: true, status: 200 }))
    expect(d.notify).not.toHaveBeenCalled()
  })
  it('logs and alerts on an error response, and still returns it', async () => {
    const d = deps()
    const res = await withJobLog('newsletter-weekly', async () => Response.json({ error: 'Failed' }, { status: 502 }), d)(new Request('http://x'))
    expect(res.status).toBe(502)
    expect(d.record).toHaveBeenCalledWith(expect.objectContaining({ ok: false, status: 502 }))
    expect(d.notify).toHaveBeenCalledTimes(1)
  })
  it('logs and alerts on a thrown error, then rethrows', async () => {
    const d = deps()
    await expect(withJobLog('vinted-check', async () => { throw new Error('db down') }, d)(new Request('http://x'))).rejects.toThrow('db down')
    expect(d.record).toHaveBeenCalledWith(expect.objectContaining({ ok: false, message: 'db down' }))
    expect(d.notify).toHaveBeenCalledTimes(1)
  })
  it('ignores unauthorised calls so strangers cannot fill the log', async () => {
    const d = deps()
    const res = await withJobLog('meta-spend', async () => Response.json({ error: 'Unauthorized' }, { status: 401 }), d)(new Request('http://x'))
    expect(res.status).toBe(401)
    expect(d.record).not.toHaveBeenCalled()
    expect(d.notify).not.toHaveBeenCalled()
  })
})

describe('health checks', () => {
  it('flags missing setup and never prints values', () => {
    const c = envChecks({ ADMIN_SECRET: 'x', CRON_SECRET: '' })
    expect(c.find((x) => x.name === 'Scheduled jobs')?.state).toBe('bad')
    expect(c.find((x) => x.name === 'Meta ad spend')?.state).toBe('warn')
    expect(JSON.stringify(c)).not.toContain('"x"')
  })
  it('explains a Brevo 401', async () => {
    const r = await checkBrevo('xsmtpsib-abc', (async () => ({ ok: false, status: 401 })) as never)
    expect(r.state).toBe('bad')
    expect(r.detail).toMatch(/xkeysib/)
    expect((await checkBrevo('k', (async () => ({ ok: true, status: 200 })) as never)).state).toBe('ok')
  })
})
