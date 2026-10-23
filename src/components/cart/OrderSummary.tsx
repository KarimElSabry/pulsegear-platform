// src/components/cart/OrderSummary.tsx

import { egp } from '@/lib/checkout-core'
import { problemText, type QuoteResult } from '@/lib/quote'

export default function OrderSummary({ quote }: { quote: QuoteResult }) {
  const t = quote.totals
  return (
    <div className="space-y-2 text-sm">
      <Row label="Subtotal" value={egp(t.subtotal)} />
      {t.discount > 0 && <Row label={`Discount${quote.discountCode ? ` (${quote.discountCode})` : ''}`} value={`− ${egp(t.discount)}`} green />}
      <Row label="Total" value={egp(t.total)} bold />
      <p className="text-xs text-zinc-500">Payment and delivery are arranged with you on WhatsApp after you confirm.</p>
      {quote.lines.some((l) => l.problem !== 'ok') && (
        <p className="rounded-lg bg-amber-900/20 px-3 py-2 text-amber-300">
          {quote.lines.filter((l) => l.problem !== 'ok').map(problemText).join('. ')}.
        </p>
      )}
    </div>
  )
}

function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? 'font-bold text-white' : 'text-zinc-400'}>{label}</span>
      <span className={`${bold ? 'text-base font-black text-white' : 'text-zinc-200'} ${green ? 'text-green-400' : ''}`}>{value}</span>
    </div>
  )
}
