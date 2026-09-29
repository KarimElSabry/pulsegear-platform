// src/app/blog/gear-guide/best-gps-watches/page.tsx
// Built on the shared blog kit (src/components/blog).

import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata } from '@/lib/blog-meta'
import {
  ArticleShell,
  Section,
  P,
  Strong,
  Callout,
  MeterCard,
  CompareTable,
  PickCard,
} from '@/components/blog'

const SLUG = 'gear-guide/best-gps-watches'

export const metadata: Metadata = articleMetadata(SLUG)

type Tone = 'brand' | 'blue' | 'green' | 'orange' | 'neutral'

const watches: {
  rank: number
  badge: string
  name: string
  tagline: string
  tone: Tone
  price: string
  priceNote: string
  category: string
  bestFor: string
  availability: string
  href: string
  specs: { label: string; value: string }[]
  pros: string[]
  cons: string[]
  verdict: string
}[] = [
  {
    rank: 1,
    badge: 'أفضل اختيار للـ Serious Runner',
    name: 'Garmin Forerunner 965',
    tagline: 'للـ Runner اللي عايز كل الـ Training Features المهمة',
    tone: 'brand',
    price: '48,000–55,000 EGP',
    priceNote: 'السعر Estimated حسب تكلفة الاستيراد',
    category: 'Premium',
    bestFor: 'Serious Runners + Triathletes',
    availability: 'حسب الطلب',
    href: '/products?brand=Garmin',
    specs: [
      { label: 'Display', value: 'AMOLED' },
      { label: 'GPS', value: 'Multi-Band GPS' },
      { label: 'Maps', value: 'خرائط مدمجة' },
      { label: 'Training', value: 'HRV Status + Training Metrics' },
      { label: 'Triathlon', value: 'Multi-Sport' },
      { label: 'Battery', value: 'ممتازة للـ Long Training' },
    ],
    pros: [
      'AMOLED Screen ممتازة وواضحة',
      'Training Metrics متقدمة للـ Serious Runners',
      'خرائط مدمجة مفيدة للـ Long Runs والـ Routes الجديدة',
      'مناسب للـ Triathlon والـ Multi-Sport',
      'بيشتغل بشكل ممتاز مع Heart Rate Straps',
    ],
    cons: [
      'سعره عالي مقارنة بالـ Entry-Level Watches',
      'مش ضروري للمبتدئ اللي لسه بيبدأ',
      'السعر النهائي ممكن يتغير حسب تكلفة الشراء والاستيراد',
    ],
    verdict: 'لو بتتمرن بجد وعايز Watch تكمل معاك لفترة طويلة وتديك Training Data متقدمة، الـ Forerunner 965 اختيار قوي جداً. لكن لو لسه Beginner، مش محتاج تبدأ من هنا.',
  },
  {
    rank: 2,
    badge: 'أفضل اختيار متوازن',
    name: 'Garmin Forerunner 265',
    tagline: 'Training Features قوية بدون تكلفة الـ Flagship',
    tone: 'blue',
    price: '32,000–37,000 EGP',
    priceNote: 'السعر Estimated',
    category: 'Mid-Range',
    bestFor: 'Daily Runners + Serious Beginners',
    availability: 'حسب الطلب',
    href: '/products?brand=Garmin',
    specs: [
      { label: 'Display', value: 'AMOLED' },
      { label: 'GPS', value: 'Multi-Band GPS' },
      { label: 'Training', value: 'Advanced Training Metrics' },
      { label: 'HRV', value: 'HRV Status' },
      { label: 'Maps', value: 'مفيش Maps مدمجة' },
      { label: 'Category', value: 'Mid-Range Running Watch' },
    ],
    pros: [
      'AMOLED Screen ممتازة',
      'Training Metrics متقدمة بالنسبة لسعره',
      'Multi-Band GPS لدقة أعلى',
      'HRV Status يساعدك تتابع الـ Recovery',
      'مناسب جداً للـ Runner اللي عايز يطور تدريبه',
    ],
    cons: [
      'مفيش Maps مدمجة',
      'أغلى بكتير من الـ Forerunner 165',
      'السعر Estimated وممكن يتغير حسب تكلفة الاستيراد',
    ],
    verdict: 'لو أنت Runner بقالك فترة وعايز تطور من Watch بسيطة لساعة Training جادة، الـ Forerunner 265 من أحسن الاختيارات المتوازنة في الفئة دي.',
  },
  {
    rank: 3,
    badge: 'أفضل بداية',
    name: 'Garmin Forerunner 165',
    tagline: 'اختيار ممتاز للـ Beginner والـ Daily Runner',
    tone: 'green',
    price: '15,500–16,000 EGP',
    priceNote: 'من المنتجات المتاحة حالياً',
    category: 'Entry-Level',
    bestFor: 'Beginners + Daily Runners',
    availability: 'متاح',
    href: '/products?brand=Garmin',
    specs: [
      { label: 'Display', value: 'AMOLED' },
      { label: 'GPS', value: 'Built-in GPS' },
      { label: 'Training', value: 'Running-focused Metrics' },
      { label: 'Health', value: 'Heart Rate + Health Tracking' },
      { label: 'Maps', value: 'مفيش Maps كاملة' },
      { label: 'Category', value: 'Entry-Level Running Watch' },
    ],
    pros: [
      'سعره أقل بكتير من الـ Premium Watches',
      'AMOLED Screen',
      'مناسب جداً للـ Runner اللي لسه بيبدأ',
      'بيوفر الأساسيات المهمة للـ Running',
      'متاح في Pulse Gear حالياً',
    ],
    cons: [
      'الـ Training Features أقل من الـ 265 والـ 965',
      'مش مناسب للي محتاج Advanced Multi-Sport Features',
      'مش أفضل اختيار لو محتاج Maps متقدمة',
    ],
    verdict: 'لو أول GPS Watch ليك وعايز حاجة محترمة من غير ما تدفع عشرات الآلاف زيادة على Features مش هتستخدمها، الـ Forerunner 165 هو المكان الصح تبدأ منه.',
  },
  {
    rank: 4,
    badge: 'أفضل Budget Premium',
    name: 'Polar Pacer Pro',
    tagline: 'Running-focused Watch خفيفة وموجهة للـ Training',
    tone: 'orange',
    price: '22,000–26,000 EGP',
    priceNote: 'السعر Estimated',
    category: 'Running-focused',
    bestFor: 'Runners + Polar Users',
    availability: 'حسب الطلب',
    href: '/products?brand=Polar',
    specs: [
      { label: 'Display', value: 'MIP' },
      { label: 'GPS', value: 'Built-in GPS' },
      { label: 'Focus', value: 'Running + Training' },
      { label: 'Running Power', value: 'نعم' },
      { label: 'Recovery', value: 'Polar Training Ecosystem' },
      { label: 'Weight', value: 'خفيفة' },
    ],
    pros: [
      'Running-focused من الأساس',
      'خفيفة ومناسبة للـ Daily Training',
      'مناسبة جداً لو أنت بالفعل مستخدم Polar',
      'Running Power Features مفيدة للـ Serious Runner',
      'سعرها أقل من ساعات Garmin Premium',
    ],
    cons: ['الشاشة MIP مش AMOLED', 'الـ Ecosystem أصغر من Garmin', 'السعر Estimated'],
    verdict: 'لو أنت Polar User أو عايز Running Watch مركزة على التدريب من غير ما تدخل في أسعار الـ Flagship، الـ Pacer Pro اختيار منطقي جداً.',
  },
  {
    rank: 5,
    badge: 'للـ Serious Athlete',
    name: 'Garmin Forerunner 970',
    tagline: 'Flagship Running Watch للـ Athlete اللي عايز أحدث مستوى',
    tone: 'neutral',
    price: '56,000–62,000 EGP',
    priceNote: 'السعر Estimated',
    category: 'Flagship',
    bestFor: 'Advanced Runners + Triathletes',
    availability: 'حسب الطلب',
    href: '/products?brand=Garmin',
    specs: [
      { label: 'Position', value: 'Flagship Forerunner' },
      { label: 'Display', value: 'AMOLED' },
      { label: 'GPS', value: 'Advanced GPS' },
      { label: 'Training', value: 'Advanced Training Metrics' },
      { label: 'Multi-Sport', value: 'نعم' },
      { label: 'Maps', value: 'نعم' },
    ],
    pros: [
      'أحدث وأعلى فئة في Forerunner Lineup',
      'موجه للـ Advanced Training',
      'مناسب للـ Triathlon والـ Multi-Sport',
      'Advanced Running Metrics',
      'اختيار قوي جداً للـ Athlete اللي عايز Flagship',
    ],
    cons: ['سعره مرتفع جداً', 'مش منطقي لمعظم الـ Beginners', 'السعر Estimated'],
    verdict: 'الـ Forerunner 970 معمول للـ Athlete اللي فعلاً هيستخدم الـ Advanced Features. لو استخدامك الأساسي Easy Runs وLong Runs بسيطة، مش محتاج تدفع السعر ده.',
  },
]

const quickPick = [
  { need: 'أنا Beginner ودي أول GPS Watch ليا', pick: 'Garmin Forerunner 165', price: '15,500–16,000 EGP' },
  { need: 'عايز Training Features أقوى', pick: 'Garmin Forerunner 265', price: '32,000–37,000 EGP' },
  { need: 'عايز أعلى فئة Running Watch', pick: 'Garmin Forerunner 965', price: '48,000–55,000 EGP' },
  { need: 'أنا Polar User', pick: 'Polar Pacer Pro', price: '22,000–26,000 EGP' },
  { need: 'عايز Flagship وأحدث Features', pick: 'Garmin Forerunner 970', price: '56,000–62,000 EGP' },
]

const toc = [
  { id: 'quick-picks', label: 'اختار بسرعة' },
  { id: 'reviews', label: 'المراجعة التفصيلية' },
  { id: 'before-you-buy', label: 'قبل ما تشتري GPS Watch' },
]

export default function BestGPSWatchesPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="مش كل Runner محتاج أغلى GPS Watch في السوق. في المقال ده هنعرف الفرق بين الـ Entry-Level والـ Mid-Range والـ Premium، وإمتى فعلاً تستاهل تدفع أكتر. والأسعار اللي تحت بالجنيه المصري حسب بيانات Pulse Gear، مع توضيح المنتجات اللي سعرها Estimated."
      toc={toc}
      related={['gear-guide/best-heart-rate-monitors', 'gear-guide/best-chest-straps', 'gear-review/garmin-vs-polar']}
      cta={{
        title: 'مش عارف تختار أنهي Watch؟',
        body: 'ابعتلنا مستواك في الجري، ميزانيتك، والـ Watch اللي بتستخدمها حالياً. هنساعدك تختار الـ GPS Watch المناسبة بدل ما تدفع في Features مش محتاجها.',
        href: '/products?category=Fitness%20Watches',
        label: 'Browse GPS watches',
      }}
    >
      <Callout tone="egypt" title="الأسعار بالجنيه المصري">
        الأسعار في المقال مبنية على بيانات Pulse Gear الحالية. بعض أسعار الـ GPS Watches Estimated لأنها بتتأثر بتكلفة الشراء والاستيراد وتوفر المنتج. لو الموديل اللي عايزه مش موجود، اطلبه من خلال{' '}
        <Link href="/request-product" className="font-bold text-white underline-offset-4 hover:underline">Request a Product</Link>.
      </Callout>

      <Section id="quick-picks" title="Quick picks" titleAr="اختار بسرعة">
        <P>لو مش عايز تقرأ كل التفاصيل، دي الخلاصة حسب احتياجك.</P>
        <CompareTable
          caption="Quick picks by need"
          columns={['الاختيار', 'السعر']}
          highlightColumn={0}
          rows={quickPick.map((q) => ({ label: q.need, cells: [<Strong key="pick">{q.pick}</Strong>, q.price] }))}
        />
      </Section>

      <Section id="reviews" title="Detailed reviews" titleAr="المراجعة التفصيلية">
        <P>مش هنقولك إن أغلى Watch هي الأحسن. الاختيار الصح هو اللي يناسب مستواك وطريقة تدريبك وميزانيتك.</P>
        <div className="space-y-10">
          {watches.map((w) => (
            <div key={w.name} className="space-y-4">
              <PickCard
                rank={w.rank}
                name={w.name}
                badge={w.badge}
                priceBand={w.price}
                bestFor={w.bestFor}
                summary={`${w.tagline}. الحكم: ${w.verdict}`}
                pros={w.pros}
                cons={w.cons}
                href={w.href}
              />
              <MeterCard
                title="Key specs"
                badge={w.category}
                tone={w.tone}
                description={`التوفر: ${w.availability}. ${w.priceNote}.`}
                meta={w.specs}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section id="before-you-buy" title="Before you buy a GPS watch" titleAr="قبل ما تشتري GPS Watch">
        <div className="space-y-3">
          <Callout tone="warning" title="متدفعش على Features مش هتستخدمها">
            لو لسه Beginner، غالباً مش محتاج Flagship Watch. الـ Forerunner 165 ممكن يكون كفاية جداً.
          </Callout>
          <Callout tone="tip" title="الـ GPS مش أهم حاجة لوحده">
            لو هدفك الأساسي HR Zones والتدريب بالنبض، Heart Rate Strap كويس ممكن يفرق معاك أكتر من ترقية الـ Watch.
          </Callout>
          <Callout tone="tip" title="اختار على حسب تدريبك">
            Long Runs، Intervals، Triathlon، Recovery، أو مجرد Daily Running. كل استخدام له احتياجات مختلفة.
          </Callout>
        </div>
      </Section>
    </ArticleShell>
  )
}
