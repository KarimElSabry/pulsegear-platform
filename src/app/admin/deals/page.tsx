// src/app/admin/deals/page.tsx

import { getDeals, getOpenProductRequests } from './actions'
import { getDiscountCodes } from '../sales/actions'
import DealsClient from './DealsClient'

export default async function DealsPage() {
  const [deals, productRequests, discountCodes] = await Promise.all([
    getDeals(),
    getOpenProductRequests(),
    getDiscountCodes().catch(() => []),
  ])

  return <DealsClient deals={deals} productRequests={productRequests} discountCodes={discountCodes} />
}
