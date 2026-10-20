// src/components/orders/OrderUpdates.tsx
// What a customer sees for one order: a progress bar over the steps, then the update log like a parcel tracker
// (newest first, each update with its own date, time and comment). Used on My Orders and on /track-order.

import type { PublicEvent, TimelineStep } from '@/lib/orders'

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', year: 'numeric' })

export default function OrderUpdates({ timeline, events, cancelled }: { timeline: TimelineStep[]; events: PublicEvent[]; cancelled: boolean }) {
  const reached = timeline.filter((s) => s.state !== 'upcoming').length
  const current = timeline.find((s) => s.state === 'current') ?? timeline[timeline.length - 1]

  return (
    <div className="mt-5 space-y-6">
      {cancelled ? (
        <p className="text-sm text-red-400">This order was cancelled. Message us if you have questions.</p>
      ) : timeline.length > 0 && (
        <div>
          <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={timeline.length} aria-valuenow={reached}>
            {timeline.map((s) => (
              <span key={s.key} title={s.label} className={`h-2 flex-1 rounded-full ${s.state === 'done' ? 'bg-green-500' : s.state === 'current' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">Step {reached} of {timeline.length}{current ? <> · <span className="text-zinc-200">{current.label}</span>{current.at ? ` · ${day(current.at)}` : ''}</> : null}</p>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Updates</p>
          <ol className="relative border-l-2 border-zinc-700 ml-2 space-y-5">
            {events.map((e, i) => (
              <li key={`${e.at}-${i}`} className="ml-5 relative">
                <span className={`absolute -left-6.75 top-1 h-3.5 w-3.5 rounded-full border-2 ${i === 0 ? 'bg-red-500 border-red-500' : 'bg-zinc-950 border-zinc-500'}`} />
                <p className={i === 0 ? 'text-white font-bold' : 'text-zinc-200 font-semibold'}>{e.title}</p>
                {e.comment && <p className="text-sm text-zinc-300 mt-0.5">{e.comment}</p>}
                <p className="text-xs text-zinc-500 mt-0.5">{when(e.at)}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
