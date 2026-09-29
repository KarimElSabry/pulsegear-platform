// src/components/home/HomeFaq.tsx
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

const FAQS = [
  { q: 'What is Pulse Gear?', a: 'An Egyptian platform sourcing premium running gear globally and delivering it to your door across Egypt.' },
  { q: 'Are the products original?', a: 'Yes. Every item is 100% authentic and bought from trusted international sellers.' },
  { q: 'What conditions do products come in?', a: 'Brand New, Like New, Very Good or Good. The condition is shown clearly on every product page.' },
  { q: 'How long does delivery take?', a: 'Usually 1–2 weeks depending on where the product ships from.' },
  { q: 'How do I pay?', a: '50% upfront via Instapay or bank transfer, and 50% cash on delivery.' },
  { q: 'Can I request a product that is not listed?', a: 'Yes. Use the Request a Product page and we will source it for you.' },
]

export default function HomeFaq() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black uppercase text-white">Quick answers</h3>
          <Link href="/faq" className="text-xs font-semibold uppercase tracking-wide text-brand-soft hover:text-white">
            All FAQs
          </Link>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-white transition-colors group-open:text-brand-soft [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45 group-open:border-brand-soft group-open:text-brand-soft" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
      <div className="card p-6 md:p-8">
        <h3 className="mb-6 text-lg font-black uppercase text-white">Send us a message</h3>
        <ContactForm />
      </div>
    </div>
  )
}
