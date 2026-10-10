// src/app/admin/requests/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { REQUEST_STATUSES } from './statuses'

const allowedStatuses: string[] = REQUEST_STATUSES.map((s) => s.value)

export async function updateProductRequestStatus(formData: FormData) {
  const supabase = createAdminSupabaseClient()

  const requestId = Number(formData.get('request_id'))
  const status = String(formData.get('status') || '')

  if (!requestId || !allowedStatuses.includes(status)) {
    throw new Error('Invalid request status update')
  }

  const { error } = await supabase
    .from('product_requests')
    .update({ status })
    .eq('id', requestId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/requests')
  revalidatePath('/admin/deals')
  revalidatePath('/account/requests')
}