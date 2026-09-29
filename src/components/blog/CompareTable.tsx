// src/components/blog/CompareTable.tsx
import type { ReactNode } from 'react'

export default function CompareTable({
  caption,
  columns,
  rows,
  highlightColumn,
}: {
  caption?: string
  columns: string[]
  rows: { label: string; cells: ReactNode[] }[]
  /** index into `columns` (excluding the row label) to visually emphasise */
  highlightColumn?: number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[560px] text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-3 font-bold" />
              {columns.map((c, i) => (
                <th key={c} scope="col" className={`px-4 py-3 font-bold ${i === highlightColumn ? 'text-brand-soft' : ''}`} dir="auto">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.label} className="bg-surface-1/40">
                <th scope="row" className="px-4 py-3 text-left font-bold text-white" dir="auto">{r.label}</th>
                {r.cells.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 align-top text-muted-strong ${i === highlightColumn ? 'bg-brand/5' : ''}`} dir="auto">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
