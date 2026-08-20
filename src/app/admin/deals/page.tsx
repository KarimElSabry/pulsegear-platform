// src/app/admin/deals/page.tsx

import { getDeals, getOpenProductRequests } from './actions'
import DealsClient from './DealsClient'

export default async function DealsPage() {
  const [deals, productRequests] = await Promise.all([
    getDeals(),
    getOpenProductRequests(),
  ])

  return <DealsClient deals={deals} productRequests={productRequests} />
}