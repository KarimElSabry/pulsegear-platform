import { createClient } from '@supabase/supabase-js'
import DiscountsClient from './DiscountsClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DiscountsPage() {
  const { data: codes, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 text-red-400">
        ❌ Failed to load discount codes: {error.message}
      </div>
    )
  }

  return <DiscountsClient initialCodes={codes ?? []} />
}