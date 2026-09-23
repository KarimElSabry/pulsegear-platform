// src/app/unsubscribe/page.tsx

import UnsubscribeClient from './UnsubscribeClient'

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : ''

  return <UnsubscribeClient email={email} />
}