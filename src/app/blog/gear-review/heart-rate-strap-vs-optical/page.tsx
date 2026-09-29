// src/app/blog/gear-review/heart-rate-strap-vs-optical/page.tsx
// Built on the shared blog kit (src/components/blog).

import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata } from '@/lib/blog-meta'
import {
  ArticleShell,
  Section,
  P,
  Strong,
  BulletList,
  Callout,
  StatCards,
  MeterCard,
  CompareTable,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-review/heart-rate-strap-vs-optical'

export const metadata: Metadata = articleMetadata(SLUG)

type Side = { rating: number; note: string }
type Row = { category: string; strap: Side; optical: Side; winner: 'strap' | 'optical' }

const comparison: Row[] = [
  {
    category: 'Accuracy',
    strap: { rating: 5, note: 'دقة طبية، بيقيس الـ Electrical Signal مباشرة من القلب. الأدق في السوق.' },
    optical: { rating: 3, note: 'كويس في الحالات العادية بس بيغلط في الـ Intervals والـ Sprints.' },
    winner: 'strap',
  },
  {
    category: 'Comfort',
    strap: { rating: 3, note: 'محتاج تبلله قبل اللبس، ممكن يعمل احتكاك في الجلد بعد فترة.' },
    optical: { rating: 5, note: 'زي الساعة العادية، مفيش إحساس بيه خالص طول اليوم.' },
    winner: 'optical',
  },
  {
    category: 'High Intensity Performance',
    strap: { rating: 5, note: 'ممتاز في الـ HIIT والـ Sprints، بيتابع التغييرات السريعة فوراً.' },
    optical: { rating: 2, note: 'بيتأخر في التسجيل، الـ Lag ممكن يوصل لـ 10–15 ثانية.' },
    winner: 'strap',
  },
  {
    category: 'Battery Life',
    strap: { rating: 5, note: 'من 400 لـ 500 ساعة، بيستمر شهور من غير شحن.' },
    optical: { rating: 3, note: 'من يوم لـ 7 أيام حسب الـ GPS والـ Features المفعّلة.' },
    winner: 'strap',
  },
  {
    category: 'Ease of Use',
    strap: { rating: 3, note: 'محتاج تربطه صح وتبلله، خطوة إضافية قبل كل تمرين.' },
    optical: { rating: 5, note: 'البسه وروح، مفيش إعداد أو تحضير.' },
    winner: 'optical',
  },
  {
    category: 'All-Day Tracking',
    strap: { rating: 2, note: 'مش مناسب للبس طول اليوم، صُمّم للتمرين بس.' },
    optical: { rating: 5, note: 'ممتاز للـ 24/7 Tracking، HR والـ Sleep والـ HRV وكل حاجة.' },
    winner: 'optical',
  },
]

function Rated({ side }: { side: Side }) {
  return (
    <>
      <span className="mb-1 block text-xs font-bold tabular-nums text-white" dir="ltr">
        {'●'.repeat(side.rating)}
        <span className="text-muted">{'●'.repeat(5 - side.rating)}</span>
        <span className="ms-2 text-muted">{side.rating}/5</span>
      </span>
      {side.note}
    </>
  )
}

const strapCases = [
  'بتعمل HIIT أو Interval Training بجدية',
  'بتجري سباقات أو بتتدرب بـ Serious Level',
  'محتاج أدق قراءة ممكنة للـ HR',
  'عندك Arrhythmia أو مشاكل في القلب',
  'عايز Battery Life يستمر شهور',
]

const opticalCases = [
  'بتتمرن بشكل عام وغير متخصص',
  'عايز تتابع الـ HR والـ Sleep طول اليوم',
  'مش قادر تتحمل الـ Chest Strap',
  'بتعمل Yoga أو Pilates أو تمارين خفيفة',
  'عايز كل حاجة في جهاز واحد',
]

const verdicts = [
  'لو الدقة أهم حاجة ليك، Chest Strap بدون تفكير',
  'لو الراحة والسهولة أهم، Optical Smartwatch',
  'لو بتتدرب بجدية، Chest Strap للتمرين والـ Smartwatch لليوم كله',
]

const faqs: FaqItem[] = [
  {
    q: 'Can I use a chest strap and a watch at the same time?',
    qAr: 'أقدر أستخدم الـ Chest Strap والساعة مع بعض؟',
    a: 'Yes. Garmin and Polar watches pair with a chest strap over Bluetooth or ANT+ and use it as the heart rate source during the workout, then fall back to the wrist sensor for the rest of the day.',
    aAr: 'أيوه. ساعات Garmin و Polar بتتوصل بالـ Chest Strap عن طريق الـ Bluetooth أو ANT+ وبتاخد منه الـ HR أثناء التمرين، وباقي اليوم بترجع لحساس المعصم.',
  },
  {
    q: 'Why does my optical sensor lag during intervals?',
    qAr: 'ليه الـ Optical Sensor بيتأخر في الـ Intervals؟',
    a: 'PPG reads blood flow at the wrist, which changes a few seconds after the heart does, and the algorithm smooths the signal. That is where the 10 to 15 second lag comes from. ECG straps read the electrical signal directly, so they react instantly.',
    aAr: 'الـ PPG بيقيس تدفق الدم في المعصم، وده بيتغير بعد القلب بثواني، والـ Algorithm بيعمل smoothing كمان. من هنا جاي الـ Lag بتاع 10 لـ 15 ثانية. الـ ECG Strap بيقرأ الإشارة الكهربائية مباشرة فبيتفاعل فوراً.',
  },
  {
    q: 'Is a chest strap uncomfortable?',
    qAr: 'الـ Chest Strap مش مريح؟',
    a: 'Modern straps are light and soft, but you still need to wet the electrodes and adjust the fit before each run. Most people stop noticing it after the first kilometre.',
    aAr: 'الـ Straps الحديثة خفيفة وطرية، بس لسه محتاج تبلّ الـ Electrodes وتظبط الحزام قبل كل جرية. أغلب الناس بتنسى إنه موجود بعد أول كيلومتر.',
  },
]

const toc = [
  { id: 'glance', label: 'نظرة سريعة' },
  { id: 'how', label: 'إزاي كل واحد بيشتغل؟' },
  { id: 'compare', label: 'المقارنة التفصيلية' },
  { id: 'score', label: 'النتيجة الإجمالية' },
  { id: 'who', label: 'أيهما يناسبك؟' },
  { id: 'verdict', label: 'الحكم النهائي' },
  { id: 'faq', label: 'FAQ' },
]

export default function HeartRateStrapVsOpticalPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="الـ Chest Strap أدق والـ Optical أسهل. بس الحقيقة مش بسيطة كده، الاختيار الصح بيعتمد على نوع تدريبك وأسلوب حياتك."
      toc={toc}
      related={['training-guide/heart-rate-zones', 'training-guide/zone-2-training', 'gear-review/garmin-vs-polar']}
      cta={{
        title: 'جاهز تختار الـ Monitor المناسب ليك؟',
        body: 'شوف مجموعتنا الكاملة من الـ Chest Straps والـ GPS Watches، كلها مختارة بعناية للـ Serious Athletes في مصر.',
        href: '/products?category=Heart%20Rate%20Straps',
        label: 'Browse heart rate monitors',
      }}
    >
      <Section id="glance" title="At a glance" titleAr="نظرة سريعة">
        <StatCards
          columns={2}
          items={[
            { value: 'ECG', label: 'Chest Strap', sub: 'بيقيس الـ Electrical Signal من القلب مباشرة. ECG-level accuracy.', tone: 'blue' },
            { value: 'PPG', label: 'Optical Sensor', sub: 'بيقيس الـ Blood Flow من الـ Wrist بالـ LED. PPG technology.', tone: 'brand' },
          ]}
        />
      </Section>

      <Section id="how" title="How each one works" titleAr="إزاي كل واحد بيشتغل؟">
        <MeterCard
          title="Chest Strap"
          badge="ECG / Electrocardiography"
          tone="blue"
          description="الـ Chest Strap بيقيس الـ Electrical Signals اللي القلب بيبعتها مع كل نبضة، نفس التقنية اللي بيستخدمها الأطباء في الـ ECG. ده بيديه دقة عالية جداً حتى في التمارين الشديدة لأنه مش بيتأثر بالحركة أو العرق."
        />
        <MeterCard
          title="Optical Sensor"
          badge="PPG / Photoplethysmography"
          tone="brand"
          description="الـ Optical Sensor بيستخدم LED Light بيضيء على الجلد ويقيس التغيير في الـ Blood Flow مع كل نبضة. الطريقة دي كويسة في الحالات العادية بس بتتأثر بالحركة والعرق ولون الجلد."
        />
      </Section>

      <Section id="compare" title="Detailed comparison" titleAr="المقارنة التفصيلية">
        <CompareTable
          caption="Chest strap vs optical sensor by category"
          columns={['Chest Strap', 'Optical', 'Winner']}
          rows={comparison.map((r) => ({
            label: r.category,
            cells: [
              <Rated key="s" side={r.strap} />,
              <Rated key="o" side={r.optical} />,
              <Strong key="w">{r.winner === 'strap' ? 'Chest Strap يكسب' : 'Optical يكسب'}</Strong>,
            ],
          }))}
        />
      </Section>

      <Section id="score" title="Overall score" titleAr="النتيجة الإجمالية">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MeterCard
            title="Chest Strap"
            badge="4 / 6"
            tone="blue"
            percent={67}
            description="يكسب في: Accuracy والـ High Intensity والـ Battery Life والـ Price"
          />
          <MeterCard
            title="Optical Sensor"
            badge="2 / 6"
            tone="brand"
            percent={33}
            description="يكسب في: Comfort والـ Ease of Use والـ All-Day Tracking"
          />
        </div>
      </Section>

      <Section id="who" title="Which one fits you?" titleAr="أيهما يناسبك؟">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="card space-y-4 p-6">
            <h3 className="text-sm font-black uppercase text-sky-400" dir="auto">اختار الـ Chest Strap لو...</h3>
            <BulletList items={strapCases} />
          </div>
          <div className="card space-y-4 p-6">
            <h3 className="text-sm font-black uppercase text-brand-soft" dir="auto">اختار الـ Optical لو...</h3>
            <BulletList items={opticalCases} />
          </div>
        </div>
        <Callout tone="tip" title="Pro Tip: استخدم الاتنين مع بعض!">
          كتير من الـ Athletes المحترفين بيلبسوا الـ Chest Strap في التمارين الشديدة للدقة والـ Smartwatch في باقي اليوم لمتابعة
          الـ HR والـ Recovery. الـ Garmin والـ Polar بيدعموا الاتنين مع بعض في نفس الوقت، بيبعت الـ Chest Strap Data للـ Watch
          مباشرة عن طريق الـ Bluetooth.
        </Callout>
      </Section>

      <Section id="verdict" title="Final verdict" titleAr="الحكم النهائي">
        <Callout tone="tip" title="الخلاصة">
          <ul className="list-disc space-y-1 ps-5">
            {verdicts.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </Callout>
        <P>
          مش لاقي الموديل اللي بتدور عليه؟{' '}
          <Link href="/request-product" className="font-semibold text-brand-soft hover:text-white">
            اطلبه من صفحة Request a Product
          </Link>{' '}
          وهنجيبهولك.
        </P>
      </Section>

      <FaqList items={faqs} />
    </ArticleShell>
  )
}
