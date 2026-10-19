// src/app/admin/milestones/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { ValidationError, money, oneOf, optionalText, requiredText, uuid } from '@/lib/finance/validate'
import { isDateString } from '@/lib/finance/range'
import type { ActionResult } from '../analytics/finance-actions'

export async function createMilestone(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const startRaw = optionalText(f, 'start_date', 10)
    if (startRaw && !isDateString(startRaw)) throw new ValidationError('start date is not a valid date')

    const { error } = await createAdminSupabaseClient().from('milestones').insert({
      title: requiredText(f, 'title', 80),
      target_eur: money(f, 'target_eur', { required: true, min: 1 })!,
      metric: oneOf(f, 'metric', ['net_revenue', 'net_result'] as const)!,
      start_date: startRaw,
      eur_rate_override: money(f, 'eur_rate_override', { min: 0.000001 }),
    })
    if (error) throw error
    revalidatePath('/admin/milestones')
    return { ok: true, message: 'Milestone created.' }
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, message: err.message }
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return { ok: false, message: 'Your admin session expired. Log in again.' }
    console.error('[milestones] create failed:', err instanceof Error ? err.message : err)
    return { ok: false, message: 'Could not save. Check that 20261019_01_milestones.sql has been run.' }
  }
}

/** Archiving hides a milestone from the page without deleting it. */
export async function archiveMilestone(f: FormData): Promise<void> {
  await assertAdmin()
  const id = uuid(f, 'id')
  const { error } = await createAdminSupabaseClient().from('milestones').update({ archived: true }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/milestones')
}

/** Change a milestone's name, target, metric, start date or rate. If the goal moves, "reached" is worked out again. */
export async function updateMilestone(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = uuid(f, 'id')
    const startRaw = optionalText(f, 'start_date', 10)
    if (startRaw && !isDateString(startRaw)) throw new ValidationError('start date is not a valid date')

    const next = {
      title: requiredText(f, 'title', 80),
      target_eur: money(f, 'target_eur', { required: true, min: 1 })!,
      metric: oneOf(f, 'metric', ['net_revenue', 'net_result'] as const)!,
      start_date: startRaw,
      eur_rate_override: money(f, 'eur_rate_override', { min: 0.000001 }),
    }
    const db = createAdminSupabaseClient()
    const { data: before, error: readError } = await db.from('milestones').select('target_eur, metric, start_date').eq('id', id).maybeSingle()
    if (readError) throw readError
    if (!before) return { ok: false, message: 'Milestone not found.' }

    // a changed goal can no longer be "reached on" the old day; the page stamps it again if it is still reached
    const goalMoved = Number(before.target_eur) !== next.target_eur || before.metric !== next.metric || (before.start_date ?? null) !== next.start_date
    const { error } = await db.from('milestones').update(goalMoved ? { ...next, achieved_at: null } : next).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/milestones')
    return { ok: true, message: 'Milestone updated.' }
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, message: err.message }
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return { ok: false, message: 'Your admin session expired. Log in again.' }
    console.error('[milestones] update failed:', err instanceof Error ? err.message : err)
    return { ok: false, message: 'Could not save the changes.' }
  }
}

/** Permanently removes a milestone (archiving keeps it in the history list instead). */
export async function deleteMilestone(f: FormData): Promise<void> {
  await assertAdmin()
  const id = uuid(f, 'id')
  const { error } = await createAdminSupabaseClient().from('milestones').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/milestones')
}
