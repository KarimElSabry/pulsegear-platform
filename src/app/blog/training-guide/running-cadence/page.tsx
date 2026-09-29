// src/app/blog/training-guide/running-cadence/page.tsx
// Built on the shared blog kit (src/components/blog).

import type { Metadata } from 'next'
import { articleMetadata } from '@/lib/blog-meta'
import {
  ArticleShell,
  Section,
  P,
  Strong,
  BulletList,
  Callout,
  Steps,
  StatCards,
  MeterCard,
  CompareTable,
  FaqList,
} from '@/components/blog'

const SLUG = 'training-guide/running-cadence'

export const metadata: Metadata = articleMetadata(SLUG)

const cadenceZones = [
  {
    title: 'Low Cadence',
    badge: 'أقل من 160 spm',
    tone: 'red' as const,
    percent: 20,
    description: 'Overstriding، ضغط زيادة على الـ Knees والـ Hips',
    meta: [{ label: 'الخطر:', value: 'عالي جداً' }, { label: 'النصيحة:', value: 'ركز على تقصير الـ Stride وزيادة الـ Steps' }],
  },
  {
    title: 'Below Average',
    badge: '160 – 170 spm',
    tone: 'orange' as const,
    percent: 40,
    description: 'Overstriding خفيف، بتضيع طاقة في كل خطوة',
    meta: [{ label: 'الخطر:', value: 'متوسط' }, { label: 'النصيحة:', value: 'زود الـ Cadence بـ 5% كل أسبوعين' }],
  },
  {
    title: 'Good',
    badge: '170 – 180 spm',
    tone: 'yellow' as const,
    percent: 60,
    description: 'Running Form كويسة، بس في مجال للتحسين',
    meta: [{ label: 'الخطر:', value: 'منخفض' }, { label: 'النصيحة:', value: 'أنت على الطريق الصح، استمر' }],
  },
  {
    title: 'Optimal',
    badge: '180 spm',
    tone: 'green' as const,
    percent: 80,
    description: 'أفضل Efficiency، أقل Impact على المفاصل',
    meta: [{ label: 'الخطر:', value: 'الأدنى' }, { label: 'النصيحة:', value: 'الـ Sweet Spot للـ Elite والـ Amateur على حد سواء' }],
  },
  {
    title: 'Elite Zone',
    badge: 'أكتر من 180 spm',
    tone: 'blue' as const,
    percent: 100,
    description: 'الـ Elite Runners بيوصلوا لـ 190-200 spm في السباقات',
    meta: [{ label: 'الخطر:', value: 'الأدنى' }, { label: 'النصيحة:', value: 'مش ضروري تستهدفه كـ Amateur، الـ 180 كافية' }],
  },
]

const watchFeatures = [
  {
    brand: 'Garmin',
    models: 'Forerunner 165 / 255 / 265 / 965',
    features: {
      display: 'Real-time على الـ Watch',
      alert: 'Vibration لو نزلت عن الـ Target',
      dynamics: 'مع الـ HRM-Pro Plus',
      graph: 'في Garmin Connect',
      metronome: 'Built-in في كل الـ Models',
      history: 'تتبع التحسن على مدار أسابيع',
    },
    verdict: 'الأفضل لتتبع الـ Cadence، خصوصاً مع الـ HRM-Pro Plus اللي بيديك Running Dynamics كاملة.',
    tip: 'فعّل الـ Metronome من Settings > Sensors > Metronome واضبطه على 180 bpm.',
  },
  {
    brand: 'Polar',
    models: 'Pacer / Pacer Pro / Vantage M2 / V3',
    features: {
      display: 'Real-time على الـ Watch',
      alert: 'في الـ Pacer Pro والـ Vantage',
      dynamics: 'مع Polar H10 + Stride Sensor',
      graph: 'في Polar Flow',
      metronome: 'في الـ Pacer Pro والـ Vantage V3',
      history: 'تتبع كامل في Polar Flow',
    },
    verdict: 'ممتاز لتتبع الـ Cadence مع أفضل HR Accuracy في السوق، الـ Pacer Pro أفضل خيار للـ Serious Runner.',
    tip: 'استخدم الـ Running Program في Polar Flow وهيديك Cadence Targets مبنية على مستواك.',
  },
  {
    brand: 'Coros',
    models: 'Pace 3 / Apex 2 / Apex 2 Pro / Vertix 2S',
    features: {
      display: 'Real-time على الـ Watch',
      alert: 'في كل الـ Models',
      dynamics: 'مع Coros Pod 2',
      graph: 'في Coros App',
      metronome: 'Built-in في كل الـ Models',
      history: 'تتبع كامل في Coros App',
    },
    verdict: 'أفضل Battery Life في الفئة، الـ Pace 3 بسعر منافس جداً مع كل الـ Cadence Features المهمة.',
    tip: 'الـ Coros Pod 2 بيديك Ground Contact Time وVertical Oscillation بدون الحاجة لـ Chest Strap.',
  },
]

const featureRows: { key: keyof (typeof watchFeatures)[number]['features']; label: string }[] = [
  { key: 'display', label: 'Cadence Display' },
  { key: 'alert', label: 'Cadence Alert' },
  { key: 'dynamics', label: 'Running Dynamics' },
  { key: 'graph', label: 'Cadence Graph' },
  { key: 'metronome', label: 'Metronome' },
  { key: 'history', label: 'Cadence History' },
]

const improvementPlan = [
  {
    week: 'الأسبوع 1-2',
    title: 'Measure First',
    steps: [
      'اعمل Easy Run عادي بدون ما تفكر في الـ Cadence',
      'شوف الـ Average Cadence بتاعك في الـ App',
      'دي هي الـ Baseline بتاعتك',
    ],
    note: 'معظم الـ Beginners بيبدأوا بـ 155-165 spm، ده طبيعي تماماً.',
  },
  {
    week: 'الأسبوع 3-4',
    title: 'Metronome Training',
    steps: [
      'فعّل الـ Metronome على الـ Watch بتاعك',
      'اضبطه على Cadence الحالية + 5 spm بس',
      'اتدرب معاه 10 دقايق في كل Run',
    ],
    note: 'متزودش أكتر من 5-10 spm كل أسبوعين، الزيادة السريعة بتسبب Injury.',
  },
  {
    week: 'الأسبوع 5-8',
    title: 'Progressive Increase',
    steps: [
      'زود الـ Metronome بـ 5 spm كل أسبوعين',
      'ركز على Short & Quick Steps مش Long Strides',
      'اتخيل إنك بتجري على جمر، خطواتك خفيفة وسريعة',
    ],
    note: 'في الأسبوع ده هتبدأ تحس بفرق حقيقي في الـ Efficiency.',
  },
  {
    week: 'الأسبوع 9-12',
    title: 'Target 175-180 spm',
    steps: [
      'هتوصل لـ 175-180 spm بشكل طبيعي',
      'الـ Metronome مش ضروري في كل Run دلوقتي',
      'راجع الـ Data كل أسبوع في الـ App',
    ],
    note: 'بعد 12 أسبوع، الـ 180 spm هتبقى طبيعية ومش محتاج تفكر فيها.',
  },
]

const myths = [
  {
    myth: 'لازم توصل لـ 180 spm بالظبط',
    truth: 'الـ 180 هي الـ Target المثالية، بس 175-185 spm كلها Optimal Range. متوسطش على رقم بالظبط.',
    isTrue: false,
  },
  {
    myth: 'الـ Cadence الأعلى دايماً أحسن',
    truth: 'فوق الـ 185 spm للـ Amateur مش بيضيف حاجة، وممكن يتعبك أكتر. الـ 180 هي الـ Sweet Spot.',
    isTrue: false,
  },
  {
    myth: 'الـ Cadence بتتغير مع السرعة',
    truth: 'صح! الـ Elite Runners بيزودوا الـ Cadence مع السرعة. في الـ Easy Runs ممكن تكون 170-175 وده طبيعي.',
    isTrue: true,
  },
  {
    myth: 'تقدر تحسن الـ Cadence في أسبوع',
    truth: 'الـ Cadence Improvement محتاج 8-12 أسبوع على الأقل. الجسم محتاج وقت يتأقلم على الـ New Pattern.',
    isTrue: false,
  },
]

const faqs = [
  {
    q: 'What exactly is running cadence?',
    qAr: 'إيه هو الـ Running Cadence بالظبط؟',
    a: 'Cadence is your number of steps per minute (spm). If your right foot lands 90 times in a minute, your total cadence is 180 spm.',
    aAr: 'الـ Running Cadence هو عدد الخطوات في الدقيقة (Steps Per Minute / spm). لو عملت 90 خطوة بالرجل اليمين في دقيقة، الـ Total Cadence بتاعك هو 180 spm.',
  },
  {
    q: 'Why 180 spm specifically?',
    qAr: 'ليه الـ 180 spm تحديداً؟',
    a: 'In 1984 the American coach Jack Daniels noticed that every elite runner at the Olympics ran at 180 spm or more. Since then 180 has been the gold standard for running efficiency.',
    aAr: 'في 1984، الـ Coach الأمريكي Jack Daniels لاحظ إن كل الـ Elite Runners في الأوليمبياد كانوا بيجروا بـ 180 spm أو أكتر. من ساعتها، الـ 180 بقت الـ Gold Standard للـ Running Efficiency.',
  },
  {
    q: 'How do I find my current cadence?',
    qAr: 'إزاي أعرف الـ Cadence بتاعتي دلوقتي؟',
    a: 'Any Garmin, Polar or Coros measures cadence automatically. After a run, open the app and check Average Cadence in the run details.',
    aAr: 'أي Garmin أو Polar أو Coros بيقيس الـ Cadence تلقائياً. بعد أي Run، افتح الـ App وشوف الـ Average Cadence في الـ Run Details.',
  },
  {
    q: 'Will a higher cadence make me faster?',
    qAr: 'هل تحسين الـ Cadence بيخليني أسرع؟',
    a: 'Not directly, but it makes you more efficient: the same pace at lower effort, so you can hold it longer. Over time that turns into better race times.',
    aAr: 'مش مباشرةً، بس بيخليك أكفأ. نفس السرعة بـ Effort أقل، يعني تقدر تجري لفترة أطول بنفس الطاقة. وده بيترجم لـ Better Race Times على المدى البعيد.',
  },
  {
    q: 'Does cadence change uphill and downhill?',
    qAr: 'الـ Cadence بتتغير في الـ Uphill والـ Downhill؟',
    a: 'Yes. Uphill, cadence naturally rises a little as your stride shortens. Downhill, focus on cadence to reduce impact on the knees.',
    aAr: 'أيوه! في الـ Uphill طبيعي الـ Cadence ترتفع شوية مع قصر الـ Stride. في الـ Downhill ركز على الـ Cadence عشان تقلل الـ Impact على الـ Knees.',
  },
]

const toc = [
  { id: 'what-is-cadence', label: 'إيه هو الـ Cadence؟' },
  { id: 'cadence-zones', label: 'الـ Cadence Zones' },
  { id: 'watch-features', label: 'إزاي تتابع الـ Cadence بالـ Watch بتاعك' },
  { id: 'improvement-plan', label: 'خطة تحسين الـ Cadence في 12 أسبوع' },
  { id: 'myths', label: 'الـ Myths الشائعة' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function RunningCadencePage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="الـ Elite Runners بيجروا بـ 180 Steps Per Minute أو أكتر. معظم الـ Beginners بيبدأوا بـ 155-165 spm، والفرق ده بيكلفهم طاقة زيادة وبيزود خطر الـ Injury. اعرف إزاي تقيس الـ Cadence بتاعك وتحسنه بالـ Data الحقيقية."
      toc={toc}
      related={['training-guide/heart-rate-zones', 'training-guide/zone-2-training', 'gear-guide/best-gps-watches']}
      cta={{
        title: 'جاهز تتابع الـ Cadence بتاعك؟',
        body: 'كل الـ Watches اللي اتكلمنا عنها متاحة في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري. تواصل معانا وهنساعدك تختار الـ Watch المناسبة لمستواك وميزانيتك. ومش لاقي اللي بتدور عليه؟ اطلبه من صفحة Request a Product.',
        href: '/products',
        label: 'Browse Watches',
      }}
    >
      <Section id="what-is-cadence" title="What is running cadence?" titleAr="إيه هو الـ Running Cadence؟">
        <Callout tone="fact" title="الـ Magic Number: 180 spm">
          الـ Elite Runners بيجروا بـ 180 Steps Per Minute أو أكتر. معظم الـ Beginners بيبدأوا بـ 155-165 spm،
          والفرق ده بيكلفهم طاقة زيادة وبيزود خطر الـ Injury.
        </Callout>
        <P>
          الـ Running Cadence هو ببساطة عدد الخطوات اللي بتخطيها في الدقيقة الواحدة.
          بيتقاس بـ <Strong>Steps Per Minute (spm)</Strong> أو أحياناً <Strong>Strides Per Minute</Strong> لو الـ Watch بيحسب كل رجل لوحدها.
        </P>
        <P><Strong>مثال بسيط:</Strong></P>
        <StatCards
          items={[
            { value: '90', label: 'خطوات الرجل اليمين', sub: 'خطوة/دقيقة' },
            { value: '90', label: 'خطوات الرجل الشمال', sub: 'خطوة/دقيقة' },
            { value: '180', label: 'Total Cadence', sub: 'spm', tone: 'green' },
          ]}
        />
        <Callout tone="tip" title="ليه مهم؟">
          الـ Cadence المنخفضة معناها Overstriding، يعني كل خطوة بتوقع قدامك بعيد عن جسمك.
          ده بيزود الـ Braking Force على كل خطوة، بيضيع طاقة، وبيزود الضغط على الـ Knees والـ Hips.
        </Callout>
      </Section>

      <Section id="cadence-zones" title="Cadence zones" titleAr="الـ Cadence Zones">
        <P>انت في أنهي Zone دلوقتي؟</P>
        <div className="space-y-4">
          {cadenceZones.map((z) => (
            <MeterCard key={z.title} {...z} />
          ))}
        </div>
      </Section>

      <Section id="watch-features" title="Tracking cadence with your watch" titleAr="تتبع الـ Cadence بالـ Watch بتاعك">
        <P>Garmin، Polar، وCoros — كل واحد بيتابع الـ Cadence إزاي؟</P>
        <CompareTable
          caption="Cadence features by brand"
          columns={watchFeatures.map((w) => w.brand)}
          rows={[
            { label: 'Models', cells: watchFeatures.map((w) => w.models) },
            ...featureRows.map((r) => ({ label: r.label, cells: watchFeatures.map((w) => w.features[r.key]) })),
          ]}
        />
        <div className="space-y-3">
          {watchFeatures.map((w) => (
            <Callout key={w.brand} tone="tip" title={w.brand}>
              <p><Strong>الحكم:</Strong> {w.verdict}</p>
              <p><Strong>Tip:</Strong> {w.tip}</p>
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="improvement-plan" title="A 12-week cadence plan" titleAr="خطة تحسين الـ Cadence في 12 أسبوع">
        <P>خطوة خطوة، من الـ Baseline لـ 180 spm.</P>
        <Steps
          steps={improvementPlan.map((p) => ({
            title: p.title,
            meta: p.week,
            body: (
              <div className="space-y-3">
                <BulletList items={p.steps} />
                <p className="rounded-xl bg-surface-2 p-3"><Strong>ملحوظة:</Strong> {p.note}</p>
              </div>
            ),
          }))}
        />
      </Section>

      <Section id="myths" title="Common cadence myths" titleAr="الـ Myths الشائعة عن الـ Cadence">
        <div className="space-y-3">
          {myths.map((m) => (
            <Callout key={m.myth} tone={m.isTrue ? 'fact' : 'danger'} title={m.myth}>
              <Strong>الحقيقة:</Strong> {m.truth}
            </Callout>
          ))}
        </div>
      </Section>

      <FaqList items={faqs} title="الأسئلة الشائعة" />
    </ArticleShell>
  )
}
