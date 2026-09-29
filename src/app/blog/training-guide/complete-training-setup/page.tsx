// src/app/blog/training-guide/complete-training-setup/page.tsx
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
  StatCards,
  CompareTable,
  FaqList,
} from '@/components/blog'

const SLUG = 'training-guide/complete-training-setup'

export const metadata: Metadata = articleMetadata(SLUG)

type GearItem = { name: string; role: string; price: string; essential: boolean; why: string }

const setupLevels: { level: string; tagline: string; total: string; tone: 'green' | 'blue' | 'accent' | 'brand'; gear: GearItem[]; plan: string[] }[] = [
  {
    level: 'Starter Setup',
    tagline: 'ابدأ صح بأقل تكلفة',
    total: '~3,500 EGP',
    tone: 'green',
    gear: [
      { name: 'Polar H9', role: 'HR Monitor', price: '~3,000 EGP', essential: true, why: 'أساس أي Setup، بدونه مش هتعرف تتدرب بالـ Zones الصح.' },
      { name: 'Foam Roller', role: 'Recovery', price: '~500 EGP', essential: true, why: 'أهم Recovery Tool وأرخصه، استخدمه يومياً بعد كل تمرين.' },
      { name: 'Polar Beat App', role: 'Training App', price: 'مجاناً', essential: true, why: 'بيشتغل مع الـ H9 مباشرة، HR Zones وCalories وWorkout Summary.' },
    ],
    plan: [
      '3 أيام تدريب في الأسبوع، مش أكتر',
      '80% من التمرين في Zone 2',
      '20% في Zone 4-5',
      'Rest Day بعد كل يوم تمرين',
      'Foam Roller يومياً، 10 دقائق',
    ],
  },
  {
    level: 'Serious Setup',
    tagline: 'للـ Athlete الجاد',
    total: '~16,500 EGP',
    tone: 'blue',
    gear: [
      { name: 'Polar H10', role: 'HR Monitor', price: '~4,500 EGP', essential: true, why: 'الأدق في السوق مع HRV Tracking وذاكرة داخلية.' },
      { name: 'Coros Pace 3', role: 'GPS Watch', price: '~11,500 EGP', essential: true, why: 'أفضل GPS Watch بسعر معقول، Dual GPS وBattery 38 ساعة.' },
      { name: 'Foam Roller', role: 'Recovery', price: '~500 EGP', essential: true, why: 'Recovery أساسي، لازم يبقى في الـ Setup من اليوم الأول.' },
      { name: 'Resistance Bands', role: 'Warm-Up & Activation', price: '~500 EGP', essential: false, why: 'للـ Activation قبل التمرين، بيقلل الإصابات بشكل ملحوظ.' },
    ],
    plan: [
      '4-5 أيام تدريب في الأسبوع',
      '80/20 Rule، 80% Zone 2 و20% High Intensity',
      'HRV Check كل صبح، لو نازل خفف التمرين',
      'Long Run أسبوعي في Zone 2',
      'Interval Session أسبوعية واحدة بس',
      'Foam Roller يومياً والـ Resistance Bands قبل التمرين',
    ],
  },
  {
    level: 'Advanced Setup',
    tagline: 'للـ Competitive Athlete',
    total: '~35,500 EGP',
    tone: 'accent',
    gear: [
      { name: 'Polar H10', role: 'HR Monitor', price: '~4,500 EGP', essential: true, why: 'الأدق في السوق، أساسي في أي Advanced Setup.' },
      { name: 'Garmin Forerunner 965', role: 'GPS Watch', price: '~30,000 EGP', essential: true, why: 'أفضل Running Watch، Training Readiness وHRV وOnboard Maps.' },
      { name: 'Foam Roller', role: 'Daily Recovery', price: '~500 EGP', essential: true, why: 'Recovery يومي أساسي، مش اختياري.' },
      { name: 'Resistance Bands', role: 'Activation', price: '~500 EGP', essential: true, why: 'Activation قبل كل تمرين، مهم للـ Injury Prevention.' },
    ],
    plan: [
      '5-6 أيام تدريب في الأسبوع',
      'Periodization، Base Phase وBuild Phase وPeak Phase',
      'HRV والـ Resting HR كل صبح',
      'Training Readiness من الـ Garmin، اتبعه',
      '2 Quality Sessions في الأسبوع، مش أكتر',
      'Long Run أسبوعي والـ Medium Long Run',
      'Recovery Week كل 3-4 أسابيع',
    ],
  },
  {
    level: 'Pro Setup',
    tagline: 'الـ Full Package',
    total: '~47,500 EGP',
    tone: 'brand',
    gear: [
      { name: 'Polar H10', role: 'HR Monitor', price: '~4,500 EGP', essential: true, why: 'الأدق في السوق، أساسي في أي Pro Setup.' },
      { name: 'Garmin Forerunner 965', role: 'GPS Watch', price: '~30,000 EGP', essential: true, why: 'أفضل Running Watch في السوق، مفيش بديل على المستوى ده.' },
      { name: 'Theragun Prime', role: 'Percussive Recovery', price: '~12,000 EGP', essential: true, why: 'بيسرع الـ Recovery بشكل ملحوظ، ضروري في الـ High Volume Training.' },
      { name: 'Foam Roller', role: 'Daily Recovery', price: '~500 EGP', essential: true, why: 'يكمّل الـ Theragun، استخدمه للـ Large Muscle Groups.' },
      { name: 'Resistance Bands', role: 'Activation', price: '~500 EGP', essential: true, why: 'Activation قبل كل تمرين، مش اختياري على المستوى ده.' },
    ],
    plan: [
      '6 أيام تدريب في الأسبوع',
      'Double Sessions بعض الأيام',
      'HRV والـ Resting HR والـ Sleep Score كل يوم',
      'Theragun بعد كل Session شديدة',
      'Recovery Week كل 3 أسابيع',
      'Periodization كاملة، Base وBuild وPeak وTaper',
      'Race-Specific Training في الـ Peak Phase',
    ],
  },
]

const trainingPrinciples = [
  {
    title: '80/20 Rule',
    body: '80% من تمرينك في Zone 2 (سهل) و20% في Zone 4-5 (شديد). ده مش رأي، ده علم مثبت في الـ Elite Athletes.',
    tip: 'لو بتحس إن كل تمارينك صعبة، أنت بتعمل كتير أوي في الـ Middle Zones. خفف.',
  },
  {
    title: 'Recovery = Training',
    body: 'الجسم بيتحسن في الـ Recovery مش في التمرين. النوم 8 ساعات والـ Foam Roller والـ Rest Days جزء من البرنامج مش كسل.',
    tip: 'HRV نازل 3 أيام متتالية؟ خد Rest Day إجباري، جسمك بيقولك حاجة.',
  },
  {
    title: 'Progressive Overload',
    body: 'زود الـ Volume بـ 10% بس كل أسبوع، مش أكتر. الزيادة السريعة هي السبب الأول للإصابات.',
    tip: 'قاعدة الـ 10%: لو بتجري 30km في الأسبوع، الأسبوع الجاي 33km بس.',
  },
  {
    title: 'Specificity',
    body: 'اتدرب على اللي عايز تتحسن فيه. لو هدفك الـ 5K، معظم تمرينك يكون Running. الـ Cross Training مفيد لكن مش بديل.',
    tip: 'حدد هدفك الأول، Race أو Weight Loss أو General Fitness، وبني التمرين حواليه.',
  },
  {
    title: 'Periodization',
    body: 'قسّم تدريبك في Phases، Base Phase (بناء الـ Aerobic Base) ثم Build Phase (زيادة الـ Intensity) ثم Peak Phase (قبل السباق).',
    tip: 'Recovery Week كل 3-4 أسابيع، خفف الـ Volume بـ 30-40% وخلي الـ Intensity.',
  },
]

const weekDays = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']

const weeklySchedules = [
  {
    level: 'Starter — 3 أيام',
    sessions: [
      'Easy Run، 30 دقيقة Zone 2',
      'Rest + Foam Roller',
      'Easy Run، 30 دقيقة Zone 2',
      'Rest + Foam Roller',
      'Easy Run، 40 دقيقة Zone 2',
      'Rest + Foam Roller',
      'Complete Rest',
    ],
  },
  {
    level: 'Serious — 5 أيام',
    sessions: [
      'Easy Run، 45 دقيقة Zone 2',
      'Interval Session، 4×1km Zone 4',
      'Recovery Run، 30 دقيقة Zone 1',
      'Strength + Resistance Bands',
      'Rest + Foam Roller',
      'Long Run، 90 دقيقة Zone 2',
      'Complete Rest',
    ],
  },
  {
    level: 'Advanced — 6 أيام',
    sessions: [
      'Easy Run، 60 دقيقة Zone 2',
      'Tempo Run، 20 دقيقة Zone 3-4',
      'Medium Long Run، 75 دقيقة Zone 2',
      'Strength + Activation',
      'Interval Session، 6×800m Zone 5',
      'Long Run، 120 دقيقة Zone 2',
      'Complete Rest + Theragun',
    ],
  },
]

const gearChecklist = [
  {
    category: 'HR Monitoring',
    items: [
      { name: 'Chest Strap (Polar H9 أو H10)', essential: true, price: '~3,000–4,500 EGP' },
      { name: 'GPS Watch (Coros أو Garmin)', essential: false, price: '~11,500–30,000 EGP' },
    ],
  },
  {
    category: 'Recovery',
    items: [
      { name: 'Foam Roller', essential: true, price: '~500 EGP' },
      { name: 'Resistance Bands', essential: false, price: '~500 EGP' },
      { name: 'Theragun Prime', essential: false, price: '~12,000 EGP' },
    ],
  },
  {
    category: 'Apps & Software',
    items: [
      { name: 'Polar Beat (مجاناً)', essential: true, price: 'مجاناً' },
      { name: 'Garmin Connect (مجاناً)', essential: false, price: 'مجاناً' },
      { name: 'Strava (Free أو Premium)', essential: false, price: 'مجاناً / ~250 EGP شهرياً' },
      { name: 'TrainingPeaks', essential: false, price: 'مجاناً / ~800 EGP شهرياً' },
    ],
  },
  {
    category: 'Running Gear',
    items: [
      { name: 'Running Shoes مناسبة للقدم', essential: true, price: '~3,000–8,000 EGP' },
      { name: 'Moisture-Wicking Socks', essential: true, price: '~200–500 EGP' },
      { name: 'Running Shorts / Tights', essential: true, price: '~500–1,500 EGP' },
    ],
  },
]

const faqs = [
  {
    q: 'Where do I start on a tight budget?',
    qAr: 'من فين أبدأ لو عندي ميزانية محدودة؟',
    a: 'A Polar H9 and a foam roller, about 3,500 EGP total. That is all you need to start right. The GPS watch comes later, once consistency is there.',
    aAr: 'Polar H9 والـ Foam Roller، حوالي 3,500 EGP بس. ده كل اللي محتاجه للبداية الصح. الـ GPS Watch جاي بعدين لما تثبت الـ Consistency.',
  },
  {
    q: 'Is the 80/20 rule real?',
    qAr: 'الـ 80/20 Rule ده حقيقي؟',
    a: 'Yes, it is well documented in elite athletes. Most people train far too much in the middle zones (Zone 3), which produces fatigue without real adaptation.',
    aAr: 'أيوه، مثبت علمياً في الـ Elite Athletes. معظم الناس بتتمرن كتير أوي في الـ Middle Zones (Zone 3) وده بيعمل Fatigue بدون Adaptation حقيقية.',
  },
  {
    q: 'How many weeks until I see results?',
    qAr: 'كام أسبوع لحد ما أشوف نتيجة؟',
    a: 'The aerobic base takes 8-12 weeks before you feel a real difference. Consistency is the key, not intensity.',
    aAr: 'الـ Aerobic Base بياخد 8-12 أسبوع تبدأ تحس بفرق حقيقي. الـ Consistency هي المفتاح، مش الـ Intensity.',
  },
  {
    q: 'Is the Theragun actually worth it?',
    qAr: 'الـ Theragun يستحق فعلاً؟',
    a: 'If you train 5 or more days a week, yes. Below that, a foam roller is completely sufficient and far cheaper.',
    aAr: 'لو بتتمرن 5 أيام أو أكتر في الأسبوع، أيوه. لو أقل من كده، الـ Foam Roller كافي تماماً وأرخص بكتير.',
  },
  {
    q: 'Garmin or Coros for a beginner?',
    qAr: 'Garmin ولا Coros للـ Beginner؟',
    a: 'Coros Pace 3: far better value for a beginner, with dual-band GPS and longer battery at a lower price. Garmin when you are ready to upgrade.',
    aAr: 'Coros Pace 3، أفضل قيمة بكتير للـ Beginner. Dual GPS وBattery أطول بسعر أقل. الـ Garmin لما تكون جاهز للـ Upgrade.',
  },
  {
    q: 'Where can I buy this gear in Egypt?',
    qAr: 'فين أقدر أشتري الـ Gear ده في مصر؟',
    a: 'All of it is available through Pulse Gear Egypt at fair prices in Egyptian pounds. Get in touch and we will help you build the setup that fits your level and budget.',
    aAr: 'كل الـ Gear ده متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري، تواصل معانا وهنساعدك تبني الـ Setup المناسب لمستواك وميزانيتك.',
  },
]

const toc = [
  { id: 'setup-levels', label: 'الـ Setup Levels الأربعة' },
  { id: 'training-principles', label: 'مبادئ التدريب الأساسية' },
  { id: 'weekly-schedules', label: 'الجداول الأسبوعية' },
  { id: 'gear-checklist', label: 'الـ Gear Checklist الكاملة' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function CompleteTrainingSetupPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="الدليل الشامل لبناء أفضل Setup تدريبي في 2026، من اختيار الـ Gear الصح للـ Training Plan للـ Recovery. كل حاجة محتاجها في مكان واحد، من الصفر للـ Pro. كل الـ Gear متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري."
      toc={toc}
      related={['training-guide/claude-kailo-free-running-coach', 'gear-guide/best-heart-rate-monitors', 'gear-guide/beginners-guide']}
      cta={{
        title: 'Pulse Gear Egypt — وصّلك الـ Gear الصح',
        body: 'في Pulse Gear Egypt، بنوفرلك أفضل أجهزة التدريب العالمية بأسعار مناسبة بالجنيه المصري، بدون تعقيدات الاستيراد أو الوسطاء. تواصل معانا وهنساعدك تبني الـ Complete Setup المناسب لمستواك وميزانيتك. ومش لاقي منتج؟ اطلبه من صفحة Request a Product.',
        href: '/products',
        label: 'Browse Products',
      }}
    >
      <Section id="setup-levels" title="The four setup levels" titleAr="الـ Setup Levels الأربعة">
        <P>اختار الـ Level المناسب لمستواك وميزانيتك.</P>
        <Callout tone="egypt" title="متاح في Pulse Gear Egypt">
          كل الـ Gear في المقال ده بتقدر تطلبه عن طريق Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري،
          بدون تعقيدات الاستيراد أو الوسطاء. كل الأسعار المذكورة تقريبية وعبر Pulse Gear Egypt.
        </Callout>
        <StatCards
          columns={4}
          items={setupLevels.map((s) => ({ value: s.total, label: s.level, sub: s.tagline, tone: s.tone }))}
        />
        <div className="space-y-8">
          {setupLevels.map((setup) => (
            <div key={setup.level} className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black uppercase text-white" dir="auto">{setup.level}</h3>
                  <p className="text-sm text-muted" dir="auto">{setup.tagline}</p>
                </div>
                <p className="text-sm text-muted" dir="auto">
                  إجمالي الـ Setup: <Strong>{setup.total}</Strong>
                </p>
              </div>
              <CompareTable
                caption={`${setup.level} gear`}
                columns={['Role', 'Price', 'أساسي', 'ليه؟']}
                rows={setup.gear.map((g) => ({ label: g.name, cells: [g.role, g.price, g.essential ? 'أساسي' : 'اختياري', g.why] }))}
              />
              <div className="card space-y-3 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted" dir="auto">Training Plan للـ {setup.level}</p>
                <BulletList items={setup.plan} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="training-principles" title="Core training principles" titleAr="مبادئ التدريب الأساسية">
        <P>الـ Principles دي أهم من أي Gear، افهمها كويس.</P>
        <div className="space-y-4">
          {trainingPrinciples.map((p) => (
            <div key={p.title} className="card space-y-3 p-6">
              <h3 className="text-lg font-black uppercase text-white" dir="auto">{p.title}</h3>
              <p className="leading-relaxed text-muted-strong" dir="auto">{p.body}</p>
              <Callout tone="tip">{p.tip}</Callout>
            </div>
          ))}
        </div>
      </Section>

      <Section id="weekly-schedules" title="Weekly schedules" titleAr="الجداول الأسبوعية">
        <P>جدول جاهز لكل مستوى، ابدأ بيه من بكرة.</P>
        <CompareTable
          caption="Weekly schedules by level"
          columns={weeklySchedules.map((s) => s.level)}
          rows={weekDays.map((day, i) => ({ label: day, cells: weeklySchedules.map((s) => s.sessions[i]) }))}
        />
      </Section>

      <Section id="gear-checklist" title="The complete gear checklist" titleAr="الـ Gear Checklist الكاملة">
        <P>كل حاجة محتاجها، مرتبة حسب الأولوية. كل الأسعار عبر Pulse Gear Egypt.</P>
        <div className="space-y-4">
          {gearChecklist.map((c) => (
            <div key={c.category} className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wide text-white" dir="auto">{c.category}</h3>
              <CompareTable
                caption={`${c.category} checklist`}
                columns={['Priority', 'Price']}
                rows={c.items.map((it) => ({ label: it.name, cells: [it.essential ? 'أساسي' : 'اختياري', it.price] }))}
              />
            </div>
          ))}
        </div>
      </Section>

      <FaqList items={faqs} title="الأسئلة الشائعة" />
    </ArticleShell>
  )
}
