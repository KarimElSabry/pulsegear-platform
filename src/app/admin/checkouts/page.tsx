// src/app/admin/checkouts/page.tsx
// Online orders now live on the Orders page together with their progress.

import { redirect } from 'next/navigation'
import { assertAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function CheckoutsAdminPage() {
  await assertAdmin()
  redirect('/admin/orders')
}
