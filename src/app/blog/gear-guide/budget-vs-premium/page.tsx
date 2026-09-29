// src/app/blog/gear-guide/budget-vs-premium/page.tsx
// Built on the shared blog kit (src/components/blog).

import type { Metadata } from 'next'
import { articleMetadata } from '@/lib/blog-meta'
import {
  ArticleShell,
  Section,
  P,
  Callout,
  MeterCard,
  CompareTable,
  PickCard,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-guide/budget-vs-premium'

export const metadata: Metadata = articleMetadata(SLUG)

type Pick = {
  name: string
  price: string
  badge: string
  href: string
  specs: { label: string; value: string }[]
  pros: string[]
  cons: string[]
  verdict: string
}

const comparisons: { id: string; category: string; categoryAr: string; budget: Pick; premium: Pick; worthIt: string }[] = [
  {
    id: 'hr-monitors',
    category: 'Heart Rate Monitors',
    categoryAr: 'Polar H9 vs Polar H10',
    budget: {
      name: 'Polar H9',
      price: '7,500 EGP',
      badge: 'Budget Pick',
      href: '/products?brand=Polar',
      specs: [
        { label: 'Accuracy', value: 'عالية جداً' },
        { label: 'Connectivity', value: 'BT 5.0 + ANT+' },
        { label: 'Battery', value: '400 hrs' },
        { label: 'Memory', value: 'لأ' },
        { label: 'HRV', value: 'أيوه' },
        { label: 'ECG', value: 'أيوه' },
      ],
      pros: ['دقة عالية جداً بسعر منخفض', 'بيشتغل مع كل الـ Apps', 'خفيف ومريح'],
      cons: ['مفيش ذاكرة داخلية', 'مفيش Running Dynamics'],
      verdict: 'أفضل خيار للمبتدئ، نفس دقة الـ H10 في الـ HR الأساسي.',
    },
    premium: {
      name: 'Polar H10',
      price: '9,000 EGP',
      badge: 'Premium Pick',
      href: '/products?brand=Polar',
      specs: [
        { label: 'Accuracy', value: 'الأعلى في السوق' },
        { label: 'Connectivity', value: 'BT 5.0 + ANT+' },
        { label: 'Battery', value: '400 hrs' },
        { label: 'Memory', value: 'جلسة واحدة' },
        { label: 'HRV', value: 'أيوه' },
        { label: 'ECG', value: 'أيوه' },
      ],
      pros: ['الأدق في السوق، دقة طبية مثبتة', 'ذاكرة داخلية لجلسة بدون هاتف', 'مناسب للسباحة 30m'],
      cons: ['أغلى من الـ H9 بـ ~1,500 EGP', 'محتاج تبلله قبل اللبس'],
      verdict: 'يستحق الفرق لو بتسبح أو محتاج الذاكرة الداخلية.',
    },
    worthIt: 'الـ Premium يستحق لو بتسبح أو عايز الذاكرة الداخلية. غير كده الـ H9 بـ 7,500 EGP كافي تماماً.',
  },
  {
    id: 'gps-entry',
    category: 'GPS Watches — Entry Level',
    categoryAr: 'Forerunner 165 vs Forerunner 255',
    budget: {
      name: 'Garmin Forerunner 165',
      price: '15,500 EGP',
      badge: 'Budget Pick',
      href: '/products?brand=Garmin',
      specs: [
        { label: 'Display', value: 'AMOLED 1.2"' },
        { label: 'Battery GPS', value: '19 hrs' },
        { label: 'GPS', value: 'Multi-Band' },
        { label: 'HRV', value: 'HRV Status' },
        { label: 'Maps', value: 'لأ' },
        { label: 'Weight', value: '39g' },
      ],
      pros: ['AMOLED بسعر منخفض', 'HRV Status يومي', 'Training Readiness', 'خفيف جداً'],
      cons: ['مفيش Maps', 'Battery GPS أقل من الـ 255', 'مفيش Full Triathlon Mode'],
      verdict: 'أفضل Entry-Level GPS Watch، AMOLED وHRV بسعر 15,500 EGP.',
    },
    premium: {
      name: 'Garmin Forerunner 255',
      price: '18,000 EGP',
      badge: 'Premium Pick',
      href: '/products?brand=Garmin',
      specs: [
        { label: 'Display', value: 'MIP 1.3"' },
        { label: 'Battery GPS', value: '30 hrs' },
        { label: 'GPS', value: 'Multi-Band' },
        { label: 'HRV', value: 'HRV Status' },
        { label: 'Maps', value: 'لأ' },
        { label: 'Weight', value: '49g' },
      ],
      pros: ['Battery GPS أطول بكتير من الـ 165', 'Training Readiness وHRV Status', 'Multi-Band GPS', 'Garmin Ecosystem كامل'],
      cons: ['شاشة MIP مش AMOLED', 'أتقل من الـ 165', 'أغلى بـ ~2,500 EGP'],
      verdict: 'يستحق لو Battery Life أولوية ليك أكتر من الـ AMOLED.',
    },
    worthIt: 'الـ FR 165 أفضل لو عايز AMOLED وخفة. الـ FR 255 أفضل لو Battery Life أهم ليك.',
  },
  {
    id: 'gps-advanced',
    category: 'GPS Watches — Advanced',
    categoryAr: 'Forerunner 265S vs Forerunner 965',
    budget: {
      name: 'Garmin Forerunner 265S',
      price: '24,000 EGP',
      badge: 'Mid-Range',
      href: '/products?brand=Garmin',
      specs: [
        { label: 'Display', value: 'AMOLED 1.2"' },
        { label: 'Battery GPS', value: '20 hrs' },
        { label: 'GPS', value: 'Multi-Band' },
        { label: 'HRV', value: 'HRV Status' },
        { label: 'Maps', value: 'لأ' },
        { label: 'Training Readiness', value: 'أيوه' },
      ],
      pros: ['AMOLED ممتازة', 'Training Readiness وHRV Status', 'Multi-Band GPS', 'Garmin Ecosystem'],
      cons: ['مفيش Onboard Maps', 'Battery أقل من الـ 965'],
      verdict: 'الأفضل للـ Serious Runner اللي مش محتاج Maps.',
    },
    premium: {
      name: 'Garmin Forerunner 965',
      price: '32,000 EGP',
      badge: 'Premium Pick',
      href: '/products?brand=Garmin',
      specs: [
        { label: 'Display', value: 'AMOLED 1.4"' },
        { label: 'Battery GPS', value: '31 hrs' },
        { label: 'GPS', value: 'Multi-Band' },
        { label: 'HRV', value: 'HRV Status' },
        { label: 'Maps', value: 'Onboard Maps' },
        { label: 'Training Readiness', value: 'أيوه' },
      ],
      pros: ['Onboard Maps كاملة', 'أكبر شاشة AMOLED في الفئة', 'Battery أطول', 'كل الـ Features الموجودة في الـ 265 وأكتر'],
      cons: ['أغلى بـ ~8,000 EGP من الـ 265S', 'أتقل شوية'],
      verdict: 'يستحق الفرق بس لو الـ Onboard Maps ضرورية ليك، Trail Running أو Hiking.',
    },
    worthIt: 'الـ FR 265S كافي لـ 90% من الـ Runners. الـ FR 965 بس لو بتعمل Trail Running أو محتاج Maps.',
  },
  {
    id: 'recovery',
    category: 'Recovery Tools',
    categoryAr: 'Foam Roller vs Theragun Prime',
    budget: {
      name: 'Foam Roller',
      price: '~500 EGP',
      badge: 'Budget Pick',
      href: '/products',
      specs: [
        { label: 'Type', value: 'Static Pressure' },
        { label: 'Areas', value: 'كل الجسم' },
        { label: 'Portability', value: 'سهل' },
        { label: 'Battery', value: 'مش محتاج' },
        { label: 'Intensity', value: 'متوسطة' },
        { label: 'Learning Curve', value: 'سهل جداً' },
      ],
      pros: ['أرخص Recovery Tool فعّال', 'بيشتغل على كل العضلات', 'مش محتاج شحن أو بطارية', 'سهل الاستخدام'],
      cons: ['مش بيوصل للعضلات العميقة', 'محتاج وقت أطول من الـ Theragun'],
      verdict: 'أساسي لكل Athlete، لازم يبقى عندك من اليوم الأول.',
    },
    premium: {
      name: 'Theragun Prime',
      price: '~12,000 EGP',
      badge: 'Premium Pick',
      href: '/products',
      specs: [
        { label: 'Type', value: 'Percussive Therapy' },
        { label: 'Areas', value: 'كل الجسم' },
        { label: 'Portability', value: 'سهل' },
        { label: 'Battery', value: '120 min' },
        { label: 'Intensity', value: 'عالية جداً' },
        { label: 'Learning Curve', value: 'سهل' },
      ],
      pros: ['بيوصل للعضلات العميقة', 'أسرع Recovery بشكل ملحوظ', '5 Speeds مختلفة', 'مناسب للـ Post-Race Recovery'],
      cons: ['غالي جداً', 'محتاج شحن', 'ممكن يكون قوي أوي للمبتدئ'],
      verdict: 'يستحق لو بتتمرن 5+ أيام في الأسبوع وعندك Sessions شديدة.',
    },
    worthIt: 'الـ Foam Roller أساسي للكل. الـ Theragun يستحق بس لو بتتمرن بجدية عالية، 5+ أيام في الأسبوع.',
  },
]

const valueMatrix = [
  { product: 'Polar H9', price: '7,500 EGP', value: 10, for: 'الكل', skip: 'لو محتاج ذاكرة داخلية' },
  { product: 'Polar H10', price: '9,000 EGP', value: 9, for: 'Swimmers + Advanced Athletes', skip: 'لو مش بتسبح' },
  { product: 'Garmin FR 165', price: '15,500 EGP', value: 10, for: 'Entry-Level Runners', skip: 'لو محتاج Battery أطول' },
  { product: 'Garmin FR 255', price: '18,000 EGP', value: 9, for: 'Battery-Focused Runners', skip: 'لو عايز AMOLED' },
  { product: 'Garmin FR 265S', price: '24,000 EGP', value: 8, for: 'Serious Runners', skip: 'لو مش محتاج AMOLED' },
  { product: 'Garmin FR 965', price: '32,000 EGP', value: 7, for: 'Trail Runners + Map Lovers', skip: 'لو مش بتعمل Trail Running' },
  { product: 'Foam Roller', price: '~500 EGP', value: 10, for: 'الكل، بدون استثناء', skip: 'مفيش سبب تتخطاه' },
  { product: 'Theragun Prime', price: '~12,000 EGP', value: 7, for: 'High-Volume Athletes', skip: 'لو بتتمرن أقل من 5 أيام' },
]

const budgetTiers: { tier: string; range: string; tone: 'green' | 'blue' | 'yellow' | 'red'; percent: number; items: { label: string; value: string }[]; note: string }[] = [
  {
    tier: 'Tier 1 · Essentials',
    range: '~8,000 EGP',
    tone: 'green',
    percent: 15,
    items: [{ label: 'Polar H9', value: '7,500 EGP' }, { label: 'Foam Roller', value: '~500 EGP' }],
    note: 'كل اللي محتاجه للبداية، مفيش أقل من كده.',
  },
  {
    tier: 'Tier 2 · Serious Setup',
    range: '~25,500 EGP',
    tone: 'blue',
    percent: 48,
    items: [{ label: 'Polar H10', value: '9,000 EGP' }, { label: 'Garmin FR 165', value: '15,500 EGP' }, { label: 'Foam Roller', value: '~500 EGP' }],
    note: 'الـ Setup المثالي للـ Serious Runner، أفضل قيمة في السوق.',
  },
  {
    tier: 'Tier 3 · Advanced Setup',
    range: '~41,500 EGP',
    tone: 'yellow',
    percent: 78,
    items: [{ label: 'Polar H10', value: '9,000 EGP' }, { label: 'Garmin FR 265S', value: '24,000 EGP' }, { label: 'Foam Roller', value: '~500 EGP' }],
    note: 'للـ Dedicated Athletes، أفضل Ecosystem وأفضل Running Metrics.',
  },
  {
    tier: 'Tier 4 · Full Pro Setup',
    range: '~53,500 EGP',
    tone: 'red',
    percent: 100,
    items: [{ label: 'Polar H10', value: '9,000 EGP' }, { label: 'Garmin FR 965', value: '32,000 EGP' }, { label: 'Theragun Prime', value: '~12,000 EGP' }, { label: 'Foam Roller', value: '~500 EGP' }],
    note: 'الـ Full Setup للـ Competitive Athletes، مفيش حاجة فوق ده للـ Amateur.',
  },
]

const faqs: FaqItem[] = [
  { q: 'هل الـ Premium Gear بيخليني أسرع؟', a: 'لأ مباشرةً، الـ Gear بيساعدك تتدرب أذكى مش أسرع. الـ Consistency والـ Training Plan أهم بكتير من الـ Gear.' },
  { q: 'إيه أهم حاجة أشتريها أول؟', a: 'Polar H9 + Foam Roller، ~8,000 EGP بس. ده كل اللي محتاجه للبداية الصح.' },
  { q: 'الـ Garmin FR 165 ولا الـ FR 255؟', a: 'FR 165 أفضل لو عايز AMOLED وخفة بسعر 15,500 EGP. الـ FR 255 أفضل لو Battery Life أهم ليك بسعر 18,000 EGP.' },
  { q: 'الـ Theragun يستحق فعلاً؟', a: 'لو بتتمرن 5+ أيام في الأسبوع، أيوه يستحق. لو أقل من كده، الـ Foam Roller كافي تماماً.' },
  { q: 'فين أقدر أشتري الـ Gear ده في مصر؟', a: 'كل الـ Gear ده متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري، تواصل معانا وهنساعدك تختار الصح لميزانيتك.' },
]

const toc = [
  { id: 'hr-monitors', label: 'Heart Rate Monitors' },
  { id: 'gps-entry', label: 'GPS Watches — Entry Level' },
  { id: 'gps-advanced', label: 'GPS Watches — Advanced' },
  { id: 'recovery', label: 'Recovery Tools' },
  { id: 'value-matrix', label: 'Value Matrix، إيه يستحق؟' },
  { id: 'budget-tiers', label: 'الـ Budget Tiers' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function BudgetVsPremiumPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="مش كل الـ Premium Gear يستحق الفرق في السعر، وفي نفس الوقت مش كل الـ Budget Gear كافي. مقارنة شاملة بالأرقام الحقيقية بالجنيه المصري عشان تاخد القرار الصح. كل الأجهزة متاحة في Pulse Gear Egypt."
      toc={toc}
      related={['gear-guide/best-heart-rate-monitors', 'gear-guide/beginners-guide', 'training-guide/complete-training-setup']}
      cta={{
        title: 'Pulse Gear Egypt — وصّلك الـ Gear الصح',
        body: 'في Pulse Gear Egypt، بنوفرلك أفضل أجهزة التدريب العالمية بأسعار مناسبة بالجنيه المصري، بدون تعقيدات الاستيراد أو الوسطاء. تواصل معانا وهنساعدك تختار الـ Gear المناسب لميزانيتك ومستواك.',
        href: '/products',
        label: 'Browse products',
      }}
    >
      <Callout tone="egypt" title="متاح في Pulse Gear Egypt">
        كل الأجهزة في المقال ده بتقدر تطلبها عن طريق Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري، بدون تعقيدات الاستيراد أو الوسطاء. الأسعار المذكورة شاملة التوصيل.
      </Callout>

      <P>المقارنات التفصيلية: Budget vs Premium، بالأرقام والـ Specs الحقيقية.</P>

      {comparisons.map((c) => (
        <Section key={c.id} id={c.id} title={c.category} titleAr={c.categoryAr} kicker="Budget vs Premium">
          <div className="grid grid-cols-1 gap-4">
            {[c.budget, c.premium].map((p) => (
              <PickCard
                key={p.name}
                name={p.name}
                badge={p.badge}
                priceBand={p.price}
                summary={`الحكم: ${p.verdict}`}
                pros={p.pros}
                cons={p.cons}
                href={p.href}
              />
            ))}
          </div>
          <CompareTable
            caption={`${c.budget.name} vs ${c.premium.name} specs`}
            columns={[c.budget.name, c.premium.name]}
            rows={[
              { label: 'Price', cells: [`${c.budget.price} (شامل التوصيل)`, `${c.premium.price} (شامل التوصيل)`] },
              ...c.budget.specs.map((s, i) => ({ label: s.label, cells: [s.value, c.premium.specs[i]?.value ?? ''] })),
            ]}
          />
          <Callout tone="tip" title="الخلاصة">{c.worthIt}</Callout>
        </Section>
      ))}

      <Section id="value-matrix" title="Value matrix" titleAr="إيه اللي يستحق فلوسك، وإيه اللي تتخطاه">
        <CompareTable
          caption="Value matrix"
          columns={['السعر', 'Value', 'لمين؟', 'تخطاه لو']}
          highlightColumn={1}
          rows={valueMatrix.map((r) => ({ label: r.product, cells: [r.price, `${r.value}/10`, r.for, r.skip] }))}
        />
      </Section>

      <Section id="budget-tiers" title="Budget tiers" titleAr="اختار الـ Tier المناسب لميزانيتك">
        <div className="space-y-4">
          {budgetTiers.map((t) => (
            <MeterCard
              key={t.tier}
              title={t.tier}
              badge={`${t.range} إجمالي الـ Setup`}
              tone={t.tone}
              percent={t.percent}
              description={t.note}
              meta={t.items}
            />
          ))}
        </div>
      </Section>

      <FaqList title="الأسئلة الشائعة" items={faqs} />
    </ArticleShell>
  )
}
