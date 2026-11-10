// src/components/home/CampaignSection.tsx
// The campaign that is live right now (the one ending first): name, best discount, end date and its products.

import ScrollReveal from '@/components/ScrollReveal'
import SectionHeading from '@/components/home/SectionHeading'
import ProductCarousel from '@/components/home/ProductCarousel'
import { cairoDateDots } from '@/lib/promotions'
import type { LiveCampaign } from '@/lib/promotions-service'

export default function CampaignSection({ campaign }: { campaign: LiveCampaign }) {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-transparent" />
      <div className="container-x relative">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Limited time"
            title={`🔥 ${campaign.name}`}
            sub={`Up to ${campaign.maxPercent}% off${campaign.endsAt ? `. Until ${cairoDateDots(campaign.endsAt)} or while stock lasts.` : '. While stock lasts.'}`}
            action={{ label: 'See all deals', href: '/deals' }}
          />
          <ProductCarousel products={campaign.products.slice(0, 10)} />
        </ScrollReveal>
      </div>
    </section>
  )
}
