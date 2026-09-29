// src/components/blog/Steps.tsx
import type { ReactNode } from 'react'

export default function Steps({ steps }: { steps: { title: string; body: ReactNode; meta?: string }[] }) {
  return (
    <ol className="relative space-y-4 border-s border-line ps-6">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -start-[31px] top-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-[11px] font-black text-white">
            {i + 1}
          </span>
          <div className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-black text-white" dir="auto">{s.title}</h3>
              {s.meta && <span className="text-xs text-muted" dir="auto">{s.meta}</span>}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-muted-strong" dir="auto">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}
