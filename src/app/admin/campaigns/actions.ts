// src/app/admin/campaigns/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanPromotion } from '@/lib/promotions'
import { deleteCampaign, saveCampaign, setCampaignActive } from '@/lib/campaign-service'
import { emailCampaign, type EmailMode } from '@/lib/campaign-email-service'
import { sendBrevoCampaign, sendBrevoTest } from '@/lib/brevo'

export interface CampaignResult { ok: boolean; message: string; id?: number }

const idOf = (formData: FormData) => {
  const n = Number(formData.get('id'))
  return Number.isInteger(n) && n > 0 ? n : null
}

function refresh() {
  revalidatePath('/admin/campaigns')
  revalidatePath('/products')
  revalidatePath('/deals')
  revalidatePath('/')
}

/** Creates a campaign (no id) or changes one (id): name, start/end in Egypt time, which products and how many percent off. */
export async function saveCampaignAction(_prev: CampaignResult | null, formData: FormData): Promise<CampaignResult> {
  await assertAdmin()
  let items: unknown = []
  try { items = JSON.parse(String(formData.get('items') ?? '[]')) } catch { /* handled below: no products */ }
  const clean = cleanPromotion({
    name: formData.get('name'),
    starts: formData.get('starts'),
    ends: formData.get('ends'),
    is_active: formData.get('is_active') === 'on',
    allow_codes: formData.get('allow_codes') === 'on',
    items,
  })
  if ('error' in clean) return { ok: false, message: clean.error }
  const result = await saveCampaign(createAdminSupabaseClient(), idOf(formData), clean.value)
  if (!result.ok) return { ok: false, message: result.message }
  refresh()
  return { ok: true, id: result.id, message: ['Saved.', ...result.warnings].join(' ') }
}

export async function setCampaignActiveAction(_prev: CampaignResult | null, formData: FormData): Promise<CampaignResult> {
  await assertAdmin()
  const id = idOf(formData)
  if (!id) return { ok: false, message: 'Missing campaign.' }
  const result = await setCampaignActive(createAdminSupabaseClient(), id, formData.get('active') === 'true')
  if (result.ok) refresh()
  return result
}

export async function deleteCampaignAction(_prev: CampaignResult | null, formData: FormData): Promise<CampaignResult> {
  await assertAdmin()
  const id = idOf(formData)
  if (!id) return { ok: false, message: 'Missing campaign.' }
  const result = await deleteCampaign(createAdminSupabaseClient(), id)
  if (result.ok) refresh()
  return result
}

/** Emails a live campaign to the newsletter list ("all", or "again" if it was sent before), or sends you a test ("test"). */
export async function emailCampaignAction(_prev: CampaignResult | null, formData: FormData): Promise<CampaignResult> {
  await assertAdmin()
  const id = idOf(formData)
  const mode = String(formData.get('mode') ?? '')
  if (!id || !['test', 'all', 'again'].includes(mode)) return { ok: false, message: 'Missing campaign.' }
  const result = await emailCampaign(createAdminSupabaseClient(), id, mode as EmailMode, { sendAll: sendBrevoCampaign, sendTest: sendBrevoTest })
  if (result.ok) revalidatePath('/admin/campaigns')
  return result
}
