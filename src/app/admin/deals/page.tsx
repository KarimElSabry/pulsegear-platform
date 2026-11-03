// src/app/admin/deals/page.tsx
// Deals are managed on the Orders page now (create, costs, status, delivery, cancel).

import { redirect } from 'next/navigation'
import { assertAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function DealsPage() {
  await assertAdmin()
  redirect('/admin/orders')
}
