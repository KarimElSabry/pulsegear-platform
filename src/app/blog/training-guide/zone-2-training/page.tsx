// src/app/blog/training-guide/zone-2-training/page.tsx
// Built on the shared blog kit (src/components/blog).

import type { Metadata } from 'next'
import { articleMetadata } from '@/lib/blog-meta'
import {
  ArticleShell,
  Section,
  P,
  Strong,
  Callout,
  StatCards,
  CompareTable,
  FaqList,
} from '@/components/blog'

const SLUG = 'training-guide/zone-2-training'

export const metadata: Metadata = articleMetadata(SLUG)

const benefits = [
  {
    title: 'Fat Burning',
    desc: 'جسمك بيعتمد على الدهون كـ Fuel الأساسي في الـ Zone 2 مش الكربوهيدرات. ده بيخليك أكفأ على المسافات الطويلة.',
  },
  {
    title: 'Cardiac Output',
    desc: 'بيكبّر حجم الـ Left Ventricle وبيضخ دم أكتر في كل نبضة، يعني قلبك بيشتغل أذكى مش أصعب.',
  },
  {
    title: 'Mitochondria Density',
    desc: 'بتزيد عدد وكفاءة الـ Mitochondria في خلاياك، محطات الطاقة اللي بتحولك من Runner عادي لـ Machine.',
  },
  {
    title: 'Lactate Clearance',
    desc: 'جسمك بيتعلم يتخلص من الـ Lactic Acid أسرع، يعني تتعب أبطأ وتقدر تستمر أطول.',
  },
  {
    title: 'Faster Recovery',
    desc: 'بيقلل الـ Inflammation ويسرع الـ Recovery بين الـ Sessions، يعني تقدر تتدرب أكتر.',
  },
  {
    title: 'VO2 Max Improvement',
    desc: 'الـ Aerobic Base القوي هو الأساس اللي بيرفع الـ VO2 Max على المدى البعيد مش الـ Intervals بس.',
  },
]

const athletes = [
  {
    name: 'Eliud Kipchoge',
    sport: 'Marathon Runner',
    zone2: '80%',
    fact: 'أسرع راجل في تاريخ الـ Marathon، 80% من تدريبه Zone 2 هادي.',
  },
  {
    name: 'Tadej Pogačar',
    sport: 'Pro Cyclist',
    zone2: '75%',
    fact: 'بطل Tour de France، بيقضي معظم وقت التدريب في Zone 2.',
  },
  {
    name: 'Kristian Blummenfelt',
    sport: 'Olympic Triathlete',
    zone2: '85%',
    fact: 'بطل Olympic Triathlon، معروف بـ Zone 2 Volume العالي جداً.',
  },
]

const weekPlan = [
  { day: 'الاثنين', session: 'Zone 2 Run', duration: '45 دقيقة', type: 'Easy' },
  { day: 'الثلاثاء', session: 'Rest أو Zone 1 Walk', duration: '30 دقيقة', type: 'Rest' },
  { day: 'الأربعاء', session: 'Zone 2 Cycling', duration: '60 دقيقة', type: 'Easy' },
  { day: 'الخميس', session: 'Zone 4 Intervals', duration: '30 دقيقة', type: 'Intense' },
  { day: 'الجمعة', session: 'Zone 2 Run', duration: '45 دقيقة', type: 'Easy' },
  { day: 'السبت', session: 'Long Zone 2 Run', duration: '90 دقيقة', type: 'Easy' },
  { day: 'الأحد', session: 'Complete Rest', duration: 'يوم راحة', type: 'Rest' },
]

const talkTest = [
  { test: 'تقدر تغني؟', zone: 'Zone 1', result: 'سهل أوي، زود السرعة شوية' },
  { test: 'تقدر تتكلم جمل كاملة؟', zone: 'Zone 2', result: 'ده المكان الصح!' },
  { test: 'بتتكلم كلمتين بس؟', zone: 'Zone 3–4', result: 'تقيل أوي، هدّي' },
  { test: 'مش قادر تتكلم خالص؟', zone: 'Zone 5', result: 'أقصى مجهود' },
]

const faqs = [
  {
    q: 'How do I know I am really in Zone 2?',
    qAr: 'إزاي أتأكد إني في الـ Zone 2 فعلاً؟',
    a: 'Two checks: the talk test (full sentences without gasping) and a heart rate strap reading 60–70% of your max HR. If the strap says Zone 3 but you feel fine, trust the strap and slow down.',
    aAr: 'اختبارين: الـ Talk Test (جمل كاملة من غير ما تلهث) وقراءة Heart Rate Strap بين 60 و70% من الـ Max HR. لو الـ strap بيقول Zone 3 وإنت حاسس إنك كويس، صدّق الـ strap وهدّي.',
  },
  {
    q: 'Is Zone 2 enough on its own?',
    qAr: 'الـ Zone 2 لوحده كفاية؟',
    a: 'It is the base, not the whole plan. Keep roughly 80% of your week easy and the other 20% genuinely hard (Zone 4–5). Avoid living in Zone 3.',
    aAr: 'هو الأساس مش الخطة كلها. خلّي حوالي 80% من أسبوعك سهل و20% صعب بجد (Zone 4–5). واتجنب إنك تعيش في الـ Zone 3.',
  },
  {
    q: 'How long until I see results?',
    qAr: 'هشوف نتيجة إمتى؟',
    a: 'Most runners notice the same heart rate producing a faster pace within 8 to 12 weeks of consistent Zone 2 volume.',
    aAr: 'معظم الـ runners بيلاحظوا إن نفس النبض بيديهم pace أسرع خلال 8 لـ 12 أسبوع من Zone 2 Volume منتظم.',
  },
]

const toc = [
  { id: 'what', label: 'إيه هو الـ Zone 2 بالظبط؟' },
  { id: 'eighty-twenty', label: 'قاعدة الـ 80/20' },
  { id: 'benefits', label: 'ليه الـ Zone 2 مهم جداً؟' },
  { id: 'athletes', label: 'الـ Elite Athletes اللي بيثبتوا الكلام ده' },
  { id: 'mistake', label: 'الغلطة اللي كلنا بنعملها' },
  { id: 'week-plan', label: 'خطة أسبوعية مقترحة للمبتدئين' },
  { id: 'faq', label: 'FAQ' },
]

export default function Zone2TrainingPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="لو شايف إن التدريب الصح لازم يكون مؤلم وصعب، إنت غلطان. الـ Zone 2 هو أهم Zone في تدريبك وهو الأبطأ والأسهل. وده مش رأيي، ده العلم."
      toc={toc}
      related={['training-guide/heart-rate-zones', 'training-guide/claude-kailo-free-running-coach', 'gear-review/heart-rate-strap-vs-optical']}
      cta={{
        title: 'عايز تتأكد إنك في الـ Zone 2 الصح؟',
        body: 'محتاج Heart Rate Monitor دقيق عشان تتدرب في الـ Zone الصح. شوف مجموعتنا من الـ Chest Straps والـ GPS Watches.',
        href: '/products',
        label: 'Browse Heart Rate Monitors',
      }}
    >
      <Section id="what" title="What exactly is Zone 2?" titleAr="إيه هو الـ Zone 2 بالظبط؟">
        <P>
          الـ Zone 2 هو التدريب اللي بيحصل عند <Strong>60–70% من الـ Max HR</Strong> بتاعك.
          ده المجهود اللي تقدر تتكلم فيه جمل كاملة بدون ما تلهث، يعني مريح بس مش سهل أوي.
        </P>
        <P>
          <Strong>الـ Talk Test</Strong> هو أسهل طريقة تعرف إنك في الـ Zone 2 من غير أي جهاز:
        </P>
        <CompareTable
          caption="Talk test"
          columns={['Zone', 'الحكم']}
          rows={talkTest.map((t) => ({ label: t.test, cells: [t.zone, t.result] }))}
        />
      </Section>

      <Section id="eighty-twenty" title="The 80/20 rule" titleAr="قاعدة الـ 80/20">
        <P>الـ Elite Athletes مش بيتدربوا بشدة كل يوم، بيوزعوا تدريبهم كده:</P>
        <StatCards
          columns={2}
          items={[
            { value: '80%', label: 'Zone 1 & 2', sub: 'Easy & Aerobic Training', tone: 'blue' },
            { value: '20%', label: 'Zone 4 & 5', sub: 'Hard & Intense Training', tone: 'brand' },
          ]}
        />
        <Callout tone="tip">
          معظم الناس بتعمل العكس، بتتدرب بشدة كل يوم وبتتساءل ليه مش بتتحسن.
        </Callout>
      </Section>

      <Section id="benefits" title="Why Zone 2 matters so much" titleAr="ليه الـ Zone 2 مهم جداً؟">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="card flex flex-col gap-2 p-5">
              <h3 className="text-sm font-black uppercase text-white" dir="auto">{b.title}</h3>
              <p className="text-sm leading-relaxed text-muted-strong" dir="auto">{b.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="athletes" title="The elite athletes who prove it" titleAr="الـ Elite Athletes اللي بيثبتوا الكلام ده">
        <StatCards
          items={athletes.map((a) => ({ value: a.zone2, label: a.name, sub: `${a.sport} · Zone 2`, tone: 'brand' as const }))}
        />
        <CompareTable
          caption="Elite athletes and their Zone 2 share"
          columns={['Sport', 'Zone 2', 'Fact']}
          rows={athletes.map((a) => ({ label: a.name, cells: [a.sport, a.zone2, a.fact] }))}
        />
      </Section>

      <Section id="mistake" title="The mistake we all make" titleAr="الغلطة اللي كلنا بنعملها">
        <Callout tone="danger" title='الـ "Grey Zone" Trap — الـ Zone 3'>
          معظم الناس بتتدرب في الـ Zone 3 طول الوقت، مش سهل ومش صعب.
          ده بيخليك تتعب من غير ما تاخد الفايدة الكاملة من الـ Zone 2 أو الـ Zone 4.
          بتدفع تمن التعب من غير ما تاخد الـ Adaptation.
        </Callout>
        <Callout tone="tip" title="الحل الصح">
          <Strong>Zone 2 — 80%</Strong> من الأسبوع، و<Strong>Zone 4–5 — 20%</Strong> بس.
          اعمل الـ Easy Days سهلة فعلاً، واعمل الـ Hard Days صعبة فعلاً.
        </Callout>
      </Section>

      <Section id="week-plan" title="A sample week for beginners" titleAr="خطة أسبوعية مقترحة للمبتدئين">
        <CompareTable
          caption="Suggested weekly plan"
          columns={['Session', 'Duration', 'Type']}
          rows={weekPlan.map((d) => ({ label: d.day, cells: [d.session, d.duration, d.type] }))}
        />
        <Callout tone="warning">
          ده مجرد مثال. اضبط الـ Volume على حسب مستواك الحالي.
        </Callout>
      </Section>

      <FaqList items={faqs} />
    </ArticleShell>
  )
}
