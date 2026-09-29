// src/components/blog/FaqList.tsx
// Accordion FAQ with FAQPage structured data. Accepts bilingual items.

export type FaqItem = { q: string; a: string; qAr?: string; aAr?: string }

export default function FaqList({ items, title = 'FAQ' }: { items: FaqItem[]; title?: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.aAr ? `${i.a} ${i.aAr}` : i.a },
    })),
  }
  return (
    <section id="faq" className="scroll-mt-28 space-y-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 className="text-2xl font-black uppercase tracking-tight text-white" dir="auto">{title}</h2>
      <div className="divide-y divide-line rounded-2xl border border-line bg-surface-1/40">
        {items.map((item) => (
          <details key={item.q} className="group px-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              <span className="space-y-1">
                <span className="block text-sm font-bold text-white" dir="auto">{item.q}</span>
                {item.qAr && <span className="block text-sm font-semibold text-muted" dir="rtl">{item.qAr}</span>}
              </span>
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45 group-open:border-brand-soft group-open:text-brand-soft" aria-hidden="true">+</span>
            </summary>
            <div className="space-y-2 pb-5 text-sm leading-relaxed text-muted-strong">
              <p dir="auto">{item.a}</p>
              {item.aAr && <p dir="rtl" className="border-t border-line pt-2 text-muted">{item.aAr}</p>}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
