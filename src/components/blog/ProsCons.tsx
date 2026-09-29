// src/components/blog/ProsCons.tsx
export default function ProsCons({ pros, cons, prosTitle = 'Pros', consTitle = 'Cons' }: { pros: string[]; cons: string[]; prosTitle?: string; consTitle?: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-emerald-400" dir="auto">{prosTitle}</p>
        <ul className="space-y-2 text-sm text-muted-strong">
          {pros.map((p) => (
            <li key={p} className="flex gap-2" dir="auto"><span className="text-emerald-400">+</span><span>{p}</span></li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-red-400" dir="auto">{consTitle}</p>
        <ul className="space-y-2 text-sm text-muted-strong">
          {cons.map((c) => (
            <li key={c} className="flex gap-2" dir="auto"><span className="text-red-400">−</span><span>{c}</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}
