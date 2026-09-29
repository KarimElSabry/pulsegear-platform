// src/app/blog/gear-review/running-shoes-guide/page.tsx
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
  Steps,
  StatCards,
  MeterCard,
  CompareTable,
  PickCard,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-review/running-shoes-guide'

export const metadata: Metadata = articleMetadata(SLUG)

/* ───────────── data ───────────── */

const whyShoesMatter = [
  {
    title: 'Injury Prevention',
    desc: 'الجزمة الغلط هي السبب رقم 1 في إصابات الـ Runners. Shin Splints والـ Plantar Fasciitis والـ Knee Pain معظمهم بيجوا من جزمة مش مناسبة للـ Gait بتاعك.',
  },
  {
    title: 'Running Economy',
    desc: 'الـ Running Economy هو كمية الأكسجين اللي بتستهلكه في سرعة معينة. الجزمة الصح ممكن تحسن الـ Economy بنسبة 2-4%، ده فرق كبير في الـ Race.',
  },
  {
    title: 'Comfort & Performance',
    desc: 'الجزمة المريحة بتخليك تتمرن أكتر وأطول. الـ Discomfort بيشتت التركيز ويأثر على الـ Form، اللي بيأثر على الـ Performance.',
  },
  {
    title: 'Value for Money',
    desc: 'الجزمة الصح بتدوم أطول وبتقلل تكلفة الإصابات والعلاج. استثمار في الجزمة الصح أرخص بكتير من العلاج الطبيعي.',
  },
]

const pronationTypes = [
  {
    type: 'Neutral Pronation',
    percentage: '~45% من الـ Runners',
    desc: 'القدم بتلف للداخل بشكل طبيعي عند الـ Landing، الـ Weight Distribution متوازن.',
    signs: ['الـ Wear Pattern في النص من الـ Heel للـ Ball', 'القوس طبيعي', 'الركبة مش بتنحرف'],
    shoes: 'Neutral Running Shoes، أي جزمة بدون Support إضافي',
    examples: 'Nike Pegasus، Brooks Ghost، Saucony Ride',
  },
  {
    type: 'Overpronation',
    percentage: '~35% من الـ Runners',
    desc: 'القدم بتلف للداخل أكتر من اللازم، بيحط ضغط زيادة على الـ Arch والـ Knee.',
    signs: ['الـ Wear Pattern على الجانب الداخلي من الـ Heel', 'القوس منخفض (Flat Feet)', 'الركبة بتنحرف للداخل'],
    shoes: 'Stability أو Motion Control Shoes، بيحتوي على Medial Post Support',
    examples: 'Brooks Adrenaline GTS، ASICS Kayano، New Balance 860',
  },
  {
    type: 'Supination (Underpronation)',
    percentage: '~20% من الـ Runners',
    desc: 'القدم بتلف للخارج، بيحط ضغط على الجانب الخارجي من القدم والـ Ankle.',
    signs: ['الـ Wear Pattern على الجانب الخارجي من الـ Heel والـ Forefoot', 'القوس مرتفع جداً', 'Ankle Sprains متكررة'],
    shoes: 'Neutral Shoes مع Cushioning عالي، مش محتاج Support لكن محتاج Shock Absorption',
    examples: 'Brooks Glycerin، ASICS Nimbus، Hoka Clifton',
  },
]

const shoeCategories = [
  {
    category: 'Daily Trainer',
    use: '80% من تدريبك: Easy Runs والـ Long Runs',
    drop: '8-12mm',
    cushioning: 'Medium to High',
    weight: '250-300g',
    desc: 'الجزمة الأساسية في الـ Rotation بتاعك. محتاج تكون مريحة، durable، ومناسبة لساعات طويلة.',
    examples: 'Nike Pegasus 41، Brooks Ghost 16، ASICS Gel-Nimbus 26',
    tip: 'محتاج جوز واحد على الأقل من الـ Daily Trainer. لو بتتمرن كتير، خد جوزين وبدّل بينهم عشان الـ Foam يتعافى.',
  },
  {
    category: 'Speed / Race Day',
    use: 'Tempo Runs والـ Intervals والـ Races',
    drop: '4-8mm',
    cushioning: 'Low to Medium (Carbon Fiber Plate)',
    weight: '180-230g',
    desc: 'الجزمة اللي بتلبسها لما تيجي تسرع. Carbon Fiber Plate بيحسن الـ Energy Return ويزود الـ Propulsion.',
    examples: 'Nike Vaporfly 3، Adidas Adizero Adios Pro 3، ASICS Metaspeed Sky+',
    tip: 'متلبسهاش في كل تمرين، وفّرها للـ Speed Work والـ Races. الـ Carbon Plate بيتعب الـ Calves لو اتلبس كتير.',
  },
  {
    category: 'Trail Running',
    use: 'Off-Road والـ Trails والـ Uneven Terrain',
    drop: '4-8mm',
    cushioning: 'Medium مع Rock Plate',
    weight: '280-340g',
    desc: 'Aggressive Lugs للـ Grip على التراب والصخر، Rock Plate لحماية القدم، Upper أقوى للـ Durability.',
    examples: 'Salomon Speedcross 6، Hoka Speedgoat 5، Brooks Cascadia 17',
    tip: 'لو بتتمرن على Road والـ Trail، محتاج جوزين منفصلين. الـ Trail Shoes على الـ Road بتتبلى بسرعة.',
  },
  {
    category: 'Stability / Support',
    use: 'للـ Overpronators أو اللي عندهم Flat Feet',
    drop: '8-12mm',
    cushioning: 'Medium مع Medial Post',
    weight: '260-310g',
    desc: 'Medial Post أو Guide Rail بيمنع الـ Overpronation ويحمي الـ Knee والـ Ankle.',
    examples: 'Brooks Adrenaline GTS 24، ASICS Kayano 31، New Balance 860v14',
    tip: 'لو مش متأكد إنك Overpronator، اعمل Gait Analysis الأول. الـ Stability Shoes على الـ Neutral Foot ممكن تعمل مشاكل.',
  },
]

const keyMetrics = [
  {
    metric: 'Heel-to-Toe Drop',
    low: '0-4mm (Minimalist)',
    medium: '5-8mm (Moderate)',
    high: '9-12mm (Traditional)',
    what: 'الفرق في الارتفاع بين الـ Heel والـ Forefoot. Drop منخفض = أكتر Natural، Drop مرتفع = أكتر Heel Strike Support.',
    tip: 'لو بتتحول من Drop مرتفع لمنخفض، اعمل ده تدريجياً على مدى أشهر عشان تتجنب إصابات الـ Achilles.',
  },
  {
    metric: 'Stack Height',
    low: 'أقل من 25mm',
    medium: '25-35mm',
    high: 'أكتر من 35mm (Max Cushion)',
    what: 'ارتفاع الـ Midsole تحت القدم. Stack مرتفع = أكتر Cushioning وحماية، Stack منخفض = أكتر Ground Feel.',
    tip: 'الـ Max Cushion (Hoka) مناسب للـ Long Runs والـ Ultramarathons. للـ Speed Work، Stack أقل أفضل.',
  },
  {
    metric: 'Upper Material',
    low: 'Mesh: خفيف ومتنفس',
    medium: 'Engineered Knit: مريح ومرن',
    high: 'Ripstop / Reinforced: للـ Trail',
    what: 'المادة اللي بتلف القدم. بتأثر على الـ Breathability والـ Durability والـ Fit.',
    tip: 'للـ Hot Weather (مصر 😅)، Mesh Upper هو الأفضل للـ Breathability.',
  },
  {
    metric: 'Midsole Foam',
    low: 'EVA: تقليدي وأرخص',
    medium: 'PEBA / Nylon Foam: خفيف وـ Responsive',
    high: 'Carbon Fiber Plate: للـ Racing',
    what: 'المادة اللي بتعمل الـ Cushioning. الـ PEBA Foam (زي Nike ZoomX وAdidas Lightstrike Pro) أخف وأكتر Energy Return.',
    tip: 'الـ Carbon Plate مش للكل، محتاج تكون عندك Base Fitness كافية عشان تستفيد منه.',
  },
]

const shoeRotation = [
  {
    level: 'المبتدئ',
    shoes: 1,
    recommendation: 'جوز واحد Daily Trainer كويس',
    why: 'في البداية، جوز واحد كافي. ركّز على الـ Consistency في التمرين الأول.',
    budget: '~3,000-5,000 EGP',
  },
  {
    level: 'الـ Intermediate Runner',
    shoes: 2,
    recommendation: 'Daily Trainer + Speed Shoe',
    why: 'لما تبدأ تعمل Speed Work والـ Easy Runs، جوزين بيخليك تتمرن أكتر بدون إصابات.',
    budget: '~8,000-15,000 EGP',
  },
  {
    level: 'الـ Serious Runner',
    shoes: 3,
    recommendation: 'Daily Trainer + Speed Shoe + Trail أو Recovery Shoe',
    why: '3 جزم بتغطي كل أنواع التمارين وبتطوّل عمر كل جزمة.',
    budget: '~20,000-35,000 EGP',
  },
]

const wearIndicators = [
  { sign: 'الـ Midsole بقى صلب', action: 'وقت الاستبدال، الـ Cushioning انتهى حتى لو الـ Upper كويس' },
  { sign: 'الـ Outsole اتمسح في مناطق معينة', action: 'راقب الـ Wear Pattern، بيقولك عن الـ Gait بتاعك' },
  { sign: 'بتحس بوجع جديد بعد التمرين', action: 'غالباً الجزمة خلصت، جسمك بيقولك قبل ما تشوف بعينيك' },
  { sign: 'الـ Upper اتمزق أو اتفك', action: 'ممكن تكمل لو الـ Midsole كويس، بس فكر في الاستبدال' },
  { sign: 'عدت الـ 800 كيلومتر', action: 'الـ General Rule: كل 600-800km استبدل الجزمة. بعض الجزم بتدوم أكتر.' },
]

const commonMistakes = [
  { mistake: 'شراء الجزمة بناءً على الشكل بس', fix: 'الجزمة الأجمل مش دايماً الأنسب. اعرف الـ Pronation Type بتاعك الأول.' },
  { mistake: 'الـ Size الغلط: نفس مقاسك في الجزم العادية', fix: 'الـ Running Shoes المفروض تاخد نص مقاس أكبر من الجزم العادية. القدم بتتمدد أثناء الجري.' },
  { mistake: 'جزمة واحدة لكل أنواع التمارين', fix: 'الـ Daily Trainer مش مناسب للـ Races، والـ Carbon Shoe مش مناسب للـ Easy Runs. Rotation ضروري.' },
  { mistake: 'الاستمرار في الجزمة القديمة عشان لسه شكلها كويس', fix: 'الـ Midsole بيتبلى قبل الـ Outsole. بعد 600-800km، الـ Cushioning خلص حتى لو الجزمة شايفها كويسة.' },
  { mistake: 'تجاهل الـ Gait Analysis', fix: 'Gait Analysis مجاني في كتير من محلات الـ Running. 10 دقائق بتوفرلك آلام وإصابات.' },
  { mistake: 'شراء Carbon Plate Shoes من أول يوم', fix: 'الـ Carbon Shoes محتاج Base Fitness. ابدأ بـ Daily Trainer وترقي للـ Carbon لما تكون جاهز.' },
]

const topPicks = [
  {
    category: 'أفضل Daily Trainer',
    picks: [
      { name: 'Nike Pegasus 41', why: 'الأكتر Versatile، مناسب لكل الـ Runners', drop: '10mm', weight: '283g' },
      { name: 'Brooks Ghost 16', why: 'الأكتر Comfortable، مثالي للـ Long Runs', drop: '12mm', weight: '298g' },
      { name: 'ASICS Gel-Nimbus 26', why: 'الأكتر Cushioning، للـ Runners اللي بيتعبوا من الـ Knees', drop: '10mm', weight: '310g' },
    ],
  },
  {
    category: 'أفضل Speed Shoe',
    picks: [
      { name: 'Nike Vaporfly 3', why: 'الأسرع في السوق، ZoomX Foam + Carbon Plate', drop: '8mm', weight: '195g' },
      { name: 'Adidas Adizero Adios Pro 3', why: 'مريح أكتر من الـ Vaporfly، مناسب للـ Half Marathon فأكتر', drop: '6mm', weight: '220g' },
      { name: 'ASICS Metaspeed Sky+', why: 'للـ Heel Strikers، أفضل Carbon Shoe لـ Cadence منخفض', drop: '5mm', weight: '215g' },
    ],
  },
  {
    category: 'أفضل Budget Option',
    picks: [
      { name: 'Saucony Ride 17', why: 'أفضل Daily Trainer بسعر معقول', drop: '8mm', weight: '275g' },
      { name: 'New Balance Fresh Foam 880', why: 'Cushioning ممتاز بسعر أقل من المنافسين', drop: '10mm', weight: '290g' },
      { name: 'ASICS Gel-Kayano Lite 3', why: 'Stability بسعر مناسب للـ Overpronators', drop: '10mm', weight: '285g' },
    ],
  },
]

const faqs: FaqItem[] = [
  {
    q: 'How do I find my pronation type?',
    qAr: 'إزاي أعرف الـ Pronation Type بتاعي؟',
    a: 'Three ways: 1) Wet test: wet your foot and stand on paper, the footprint shape tells you. 2) Shoe wear test: look at the wear pattern on your old shoes. 3) Gait analysis: the best method, available at specialist running stores.',
    aAr: '3 طرق: 1) Wet Test: بلّل قدمك واوقف على ورقة، شكل الأثر بيقولك. 2) Shoe Wear Test: شوف الـ Wear Pattern في جزمتك القديمة. 3) Gait Analysis: أفضل طريقة، متاحة في محلات الـ Running المتخصصة.',
  },
  {
    q: 'How many kilometres does a shoe last?',
    qAr: 'كام كيلومتر تدوم الجزمة؟',
    a: '600 to 800 km for daily trainers. Carbon race shoes last 300 to 500 km. Trail shoes wear faster on the road and last longer on trail. Most important: listen to your body. New pain usually means the shoe is done.',
    aAr: '600-800km للـ Daily Trainers. الـ Carbon Race Shoes بتدوم 300-500km. الـ Trail Shoes بتدوم أقل على الـ Road وأكتر على الـ Trail. الأهم: استمع لجسمك، لو حسيت بوجع جديد، الجزمة غالباً خلصت.',
  },
  {
    q: 'Are carbon plate shoes worth it?',
    qAr: 'هل الـ Carbon Plate Shoes تستاهل؟',
    a: 'If you race and have a solid fitness base, yes. Studies show a 4 to 6% improvement in running economy. For easy runs and training, a daily trainer is better and safer.',
    aAr: 'لو بتسابق وعندك Base Fitness كويسة، أيوه. الـ Studies بتقول إنها بتحسن الـ Running Economy بـ 4-6%. لكن للـ Easy Runs والـ Training، Daily Trainer أفضل وأأمن.',
  },
  {
    q: 'Can I wear the same shoe for the gym and running?',
    qAr: 'ممكن ألبس نفس الجزمة للـ Gym والـ Running؟',
    a: 'No. Running shoes are built for forward motion only. In the gym you need lateral support that running shoes do not provide. A separate cross-training shoe is essential.',
    aAr: 'لأ! الـ Running Shoes مصممة للـ Forward Motion بس. في الـ Gym، محتاج Lateral Support اللي الـ Running Shoes مش بتوفره. جزمة Cross-Training منفصلة ضرورية.',
  },
  {
    q: 'Is Hoka right for every runner?',
    qAr: 'الـ Hoka مناسبة لكل الـ Runners؟',
    a: 'Hoka (max cushion) is great for long runs, recovery runs and runners with joint issues. It is not ideal for speed work because of the high stack.',
    aAr: 'الـ Hoka (Max Cushion) مناسبة جداً للـ Long Runs والـ Recovery Runs وللـ Runners اللي عندهم مشاكل في الـ Joints. مش مثالية للـ Speed Work بسبب الـ Stack المرتفع.',
  },
]

const toc = [
  { id: 'why-shoes', label: 'ليه الجزمة مهمة؟' },
  { id: 'pronation', label: 'الـ Pronation: أهم حاجة تعرفها' },
  { id: 'categories', label: 'أنواع الـ Running Shoes' },
  { id: 'metrics', label: 'الـ Key Metrics: Drop والـ Stack والـ Foam' },
  { id: 'rotation', label: 'الـ Shoe Rotation: ليه محتاج أكتر من جوز؟' },
  { id: 'wear', label: 'امتى تستبدل الجزمة؟' },
  { id: 'top-picks', label: 'أفضل الخيارات في 2026' },
  { id: 'mistakes', label: 'أكتر الأخطاء شيوعاً' },
  { id: 'verdict', label: 'الخلاصة' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

/* ───────────── page ───────────── */

export default function RunningShoeGuidePage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="الجزمة الغلط بتكسر الـ Runner، والجزمة الصح بتصنع الـ Race. مش بس عن الشكل أو الـ Brand، ده علم كامل. دليل شامل يخليك تختار بثقة."
      toc={toc}
      related={['training-guide/heart-rate-zones', 'training-guide/sleep-recovery', 'gear-guide/beginners-guide']}
      cta={{
        title: 'الـ Gear الصح بسعر مناسب: Pulse Gear Egypt',
        body: 'Garmin Watches، Polar Heart Rate Monitors، وكل أدوات التدريب اللي محتاجها، متاحة في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري. تواصل معانا وهنساعدك تختار الصح.',
        href: '/products',
        label: 'Browse products',
      }}
    >
      <Section id="why-shoes" title="Why the shoe matters" titleAr="ليه الجزمة مهمة؟">
        <P>مش بس Comfort، الجزمة بتأثر على الـ Performance والـ Injury Risk.</P>
        <StatCards
          items={[
            { value: '2–4%', label: 'Running Economy', sub: 'فرق الجزمة الصح', tone: 'brand' },
            { value: '4–6%', label: 'Carbon plate gain', sub: 'تحسّن الـ Running Economy', tone: 'accent' },
            { value: '600–800', label: 'km per pair', sub: 'عمر الـ Daily Trainer', tone: 'blue' },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {whyShoesMatter.map((item) => (
            <MeterCard key={item.title} title={item.title} description={item.desc} />
          ))}
        </div>
        <Callout tone="fact" title="الـ Numbers بتقول إيه؟">
          الـ Carbon Fiber Plate Shoes بتحسن الـ Running Economy بـ 4-6%. ده معناه إنك بتوفر طاقة في كل خطوة. في الـ Marathon، ده
          بيترجم لـ 2-4 دقائق أسرع. من الجزمة بس.
        </Callout>
      </Section>

      <Section id="pronation" title="Pronation: the first thing to know" titleAr="الـ Pronation: أهم حاجة تعرفها">
        <P>قبل ما تشتري أي جزمة، لازم تعرف الـ Pronation Type بتاعك.</P>
        <Callout tone="fact" title="إيه هو الـ Pronation؟">
          الـ Pronation هو الطريقة اللي قدمك بتلف بيها للداخل عند الـ Landing. ده Biomechanical Movement طبيعي بيساعد في امتصاص
          الصدمات. المشكلة بتحصل لما القدم بتلف أكتر أو أقل من اللازم.
        </Callout>
        <CompareTable
          caption="Pronation types compared"
          columns={pronationTypes.map((t) => t.type)}
          rows={[
            { label: 'النسبة', cells: pronationTypes.map((t) => t.percentage) },
            { label: 'الوصف', cells: pronationTypes.map((t) => t.desc) },
            {
              label: 'علامات',
              cells: pronationTypes.map((t) => (
                <ul key={t.type} className="list-disc space-y-1 ps-4">
                  {t.signs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )),
            },
            { label: 'الجزمة المناسبة', cells: pronationTypes.map((t) => <Strong key={t.type}>{t.shoes}</Strong>) },
            { label: 'أمثلة', cells: pronationTypes.map((t) => t.examples) },
          ]}
        />
      </Section>

      <Section id="categories" title="Types of running shoes" titleAr="أنواع الـ Running Shoes">
        <P>كل نوع ليه استخدام مختلف، اعرف محتاج إيه.</P>
        <CompareTable
          caption="Running shoe categories compared"
          columns={shoeCategories.map((c) => c.category)}
          rows={[
            { label: 'الاستخدام', cells: shoeCategories.map((c) => c.use) },
            { label: 'Drop', cells: shoeCategories.map((c) => c.drop) },
            { label: 'Cushioning', cells: shoeCategories.map((c) => c.cushioning) },
            { label: 'Weight', cells: shoeCategories.map((c) => c.weight) },
            { label: 'الوصف', cells: shoeCategories.map((c) => c.desc) },
            { label: 'أمثلة', cells: shoeCategories.map((c) => c.examples) },
          ]}
        />
        <div className="space-y-3">
          {shoeCategories.map((c) => (
            <Callout key={c.category} tone="tip" title={`Tip: ${c.category}`}>
              {c.tip}
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="metrics" title="Key metrics: drop, stack and foam" titleAr="الـ Key Metrics: Drop والـ Stack والـ Foam">
        <P>الأرقام اللي لازم تفهمها قبل ما تشتري.</P>
        <CompareTable
          caption="Key shoe metrics by level"
          columns={['Low', 'Medium', 'High']}
          rows={keyMetrics.map((m) => ({ label: m.metric, cells: [m.low, m.medium, m.high] }))}
        />
        <BulletList
          items={keyMetrics.map((m) => (
            <>
              <Strong>{m.metric}:</Strong> {m.what}
            </>
          ))}
        />
        <div className="space-y-3">
          {keyMetrics.map((m) => (
            <Callout key={m.metric} tone="tip" title={`Tip: ${m.metric}`}>
              {m.tip}
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="rotation" title="Shoe rotation: why you need more than one pair" titleAr="الـ Shoe Rotation: ليه محتاج أكتر من جوز؟">
        <P>الـ Elite Athletes عندهم 3-5 جزم مختلفة، ومش بس عشان الموضة.</P>
        <Callout tone="fact" title="ليه الـ Rotation؟">
          الـ Midsole Foam محتاج 24-48 ساعة عشان يرجع لشكله الأصلي بعد التمرين. لو بتتمرن كل يوم بنفس الجزمة، الـ Foam مش بيتعافى
          كامل. الـ Rotation بيطوّل عمر الجزمة ويقلل الـ Injury Risk.
        </Callout>
        <Steps
          steps={shoeRotation.map((l) => ({
            title: l.level,
            meta: l.budget,
            body: (
              <>
                <Strong>
                  {l.shoes} جوز: {l.recommendation}
                </Strong>
                <br />
                {l.why}
              </>
            ),
          }))}
        />
      </Section>

      <Section id="wear" title="When to replace your shoes" titleAr="امتى تستبدل الجزمة؟">
        <P>الجزمة القديمة أخطر من الجزمة الغلط.</P>
        <BulletList
          items={wearIndicators.map((w) => (
            <>
              <Strong>{w.sign}</Strong> — {w.action}
            </>
          ))}
        />
      </Section>

      <Section id="top-picks" title="Best picks for 2026" titleAr="أفضل الخيارات في 2026">
        <P>اختيارات مبنية على الـ Performance والـ Value.</P>
        {topPicks.map((group) => (
          <div key={group.category} className="space-y-4">
            <h3 className="text-lg font-black uppercase text-white" dir="auto">
              {group.category}
            </h3>
            {group.picks.map((pick, i) => (
              <PickCard
                key={pick.name}
                rank={i + 1}
                name={pick.name}
                badge={i === 0 ? 'Top Pick' : undefined}
                priceBand={`Drop ${pick.drop} · ${pick.weight}`}
                summary={pick.why}
              />
            ))}
          </div>
        ))}
      </Section>

      <Section id="mistakes" title="Most common mistakes" titleAr="أكتر الأخطاء شيوعاً">
        <div className="space-y-3">
          {commonMistakes.map((m) => (
            <Callout key={m.mistake} tone="danger" title={m.mistake}>
              <Strong>الحل: </Strong>
              {m.fix}
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="verdict" title="Verdict" titleAr="الخلاصة">
        <Callout tone="tip" title="لو هتاخد حاجة واحدة من المقال">
          اعرف الـ Pronation Type بتاعك الأول، ابدأ بجوز Daily Trainer كويس بنص مقاس أكبر من جزمتك العادية، ضيف Speed Shoe لما تبدأ
          الـ Speed Work، واستبدل أي جزمة بعد 600-800km حتى لو شكلها لسه كويس. الـ Carbon Plate آخر حاجة تشتريها، مش أول حاجة.
        </Callout>
        <Callout tone="egypt" title="في مصر">
          الحر هو العامل الأول: اختار Mesh Upper للـ Breathability، وخلي بالك إن الـ Foam بيتبلى أسرع على أسفلت سخن، فراقب الـ Wear Pattern
          بدري.
        </Callout>
        <P>
          محتاج ساعة أو Heart Rate Monitor يكمّل الـ Setup مع الجزمة؟{' '}
          <Link href="/request-product" className="font-semibold text-brand-soft hover:text-white">
            اطلب أي موديل من صفحة Request a Product
          </Link>{' '}
          وهنجيبهولك.
        </P>
      </Section>

      <FaqList items={faqs} title="الأسئلة الشائعة" />
    </ArticleShell>
  )
}
