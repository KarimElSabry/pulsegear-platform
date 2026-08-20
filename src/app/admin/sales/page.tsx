// src/app/admin/sales/page.tsx
import { getSales, getDiscountCodes } from './actions'
import SalesClient from './SalesClient' // ✅ Client component جديد

export default async function SalesPage() {
  const [sales, discountCodes] = await Promise.all([getSales(), getDiscountCodes()])
  return <SalesClient sales={sales} discountCodes={discountCodes} />
}