// src/app/blog/training-guide/sleep-recovery/page.tsx
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
} from '@/components/blog'

const SLUG = 'training-guide/sleep-recovery'

export const metadata: Metadata = articleMetadata(SLUG)

const whySleepMatters = [
  {
    title: 'Muscle Repair & Growth',
    desc: 'في الـ Deep Sleep (Stage 3 & 4)، الجسم بيفرز الـ Growth Hormone بأعلى معدل. ده الوقت اللي العضلات بتتبني فيه فعلاً، مش في التمرين.',
  },
  {
    title: 'Motor Learning & Skill Retention',
    desc: 'الـ REM Sleep بيثبت الـ Motor Patterns اللي اتعلمتها في التمرين. لو بتتمرن على Technique جديدة، النوم هو اللي بيخليها تتثبت في جسمك.',
  },
  {
    title: 'Heart Rate & HRV Recovery',
    desc: 'الـ Resting HR والـ HRV بيرجعوا للـ Baseline بتاعهم أثناء النوم. الـ Garmin والـ Polar بيقيسوا الـ HRV أثناء النوم عشان يحسبوا الـ Recovery Score بتاعك.',
  },
  {
    title: 'Glycogen Replenishment',
    desc: 'الجسم بيعيد تخزين الـ Glycogen (وقود العضلات) أثناء النوم. قلة النوم = عضلات فاضية من الوقود في التمرين الجاي.',
  },
  {
    title: 'Immune System Boost',
    desc: 'الـ Cytokines (بروتينات الجهاز المناعي) بتتفرز أثناء النوم. Athletes بيناموا أقل من 6 ساعات عندهم 4x أكتر احتمال للإصابة بالمرض.',
  },
  {
    title: 'Cortisol Regulation',
    desc: 'قلة النوم بترفع الـ Cortisol (هرمون الإجهاد)، اللي بيكسر العضلات ويزود الـ Body Fat. نوم كافي = Cortisol منخفض = جسم بيبني مش بيهدم.',
  },
]

const sleepStages = [
  {
    title: 'Stage 1 · Light Sleep',
    badge: '5-10 دقائق',
    tone: 'neutral' as const,
    percent: 20,
    description: 'إيه اللي بيحصل: انتقال من الصحيان للنوم، العضلات بتسترخي، الـ HR بيبدأ ينزل.',
    meta: [{ label: 'للـ Athletes:', value: 'مش مهم جداً للـ Recovery، بس لازم تعدي بيه عشان توصل للـ Stages الأعمق.' }],
  },
  {
    title: 'Stage 2 · Core Sleep',
    badge: '20-30 دقيقة',
    tone: 'blue' as const,
    percent: 45,
    description: 'إيه اللي بيحصل: الـ HR والـ Body Temperature بينزلوا، الـ Brain بيبدأ يعمل Sleep Spindles.',
    meta: [{ label: 'للـ Athletes:', value: 'مهم للـ Memory Consolidation والـ Motor Learning. الـ 20-min Power Nap بيوصلك لـ Stage 2 بس.' }],
  },
  {
    title: 'Stage 3 · Deep Sleep (SWS)',
    badge: '20-40 دقيقة',
    tone: 'brand' as const,
    percent: 100,
    description: 'إيه اللي بيحصل: أعمق مرحلة نوم، الـ HR في أدنى مستوياته، الـ Growth Hormone بيتفرز.',
    meta: [{ label: 'للـ Athletes:', value: 'الأهم للـ Physical Recovery. العضلات بتتصلح هنا. قلة الـ Deep Sleep = قلة الـ Recovery.' }],
  },
  {
    title: 'REM Sleep',
    badge: '20-25 دقيقة',
    tone: 'red' as const,
    percent: 70,
    description: 'إيه اللي بيحصل: الـ Brain نشيط زي الصحيان، الأحلام بتحصل هنا، الـ Eyes بتتحرك بسرعة.',
    meta: [{ label: 'للـ Athletes:', value: 'مهم للـ Mental Recovery والـ Skill Learning. بيتزيد في الـ Cycles الأخيرة من الليل.' }],
  },
]

const hrvExplained = [
  {
    metric: 'HRV مرتفع',
    tone: 'tip' as const,
    meaning: 'الجهاز العصبي اللاإرادي في حالة ممتازة، الجسم جاهز للتمرين الشديد.',
    action: 'اتمرن بجد، Zone 4-5 مناسب النهارده.',
  },
  {
    metric: 'HRV منخفض',
    tone: 'warning' as const,
    meaning: 'الجسم لسه بيتعافى، ممكن يكون من تمرين شديد أو قلة نوم أو إجهاد.',
    action: 'Zone 1-2 بس، أو Rest Day كامل.',
  },
  {
    metric: 'HRV منخفض جداً لأيام',
    tone: 'danger' as const,
    meaning: 'علامة على Overtraining أو مرض قادم أو إجهاد نفسي شديد.',
    action: 'خد Rest Days متعددة، راجع الـ Training Load، ونامي أكتر.',
  },
]

const garminRecoveryFeatures = [
  {
    feature: 'Body Battery',
    watch: 'Forerunner 265 / 965 / Fenix 7',
    desc: 'بيحسب مستوى طاقتك من 0 لـ 100 بناءً على الـ HRV والنوم والنشاط. Body Battery فوق 70 = جاهز للتمرين الشديد.',
  },
  {
    feature: 'Sleep Score',
    watch: 'كل الـ Garmin Watches الحديثة',
    desc: 'بيقيّم جودة نومك من 0 لـ 100، بيحسب الـ Deep Sleep والـ REM والـ Light Sleep والاستيقاظات.',
  },
  {
    feature: 'HRV Status',
    watch: 'Forerunner 265 / 965 / Fenix 7',
    desc: 'بيتابع الـ HRV لمدة 5 دقائق أثناء النوم ويديك Trend على مدى 4 أسابيع. أهم مؤشر للـ Recovery.',
  },
  {
    feature: 'Training Readiness',
    watch: 'Forerunner 965 / Fenix 7',
    desc: 'Score من 0 لـ 100 بيجمع الـ HRV والـ Sleep والـ Training Load والـ Recovery Time. بيقولك صراحة: اتمرن ولا استنى.',
  },
  {
    feature: 'Recovery Time',
    watch: 'كل الـ Garmin Watches الحديثة',
    desc: 'بعد كل تمرين، بيحسب كام ساعة محتاج قبل ما تتمرن تاني. بيبني على الـ Training Load والـ HR Data.',
  },
]

const recoveryTools = [
  {
    tool: 'Foam Roller',
    price: '~500 EGP',
    timing: 'بعد كل تمرين، 10-15 دقيقة',
    how: 'اشتغل على الـ Calves والـ IT Band والـ Quads والـ Thoracic Spine. كل منطقة 60-90 ثانية.',
    science: 'بيزود الـ Blood Flow للعضلات ويقلل الـ DOMS بنسبة تصل لـ 30% في الـ 48 ساعة الأولى.',
  },
  {
    tool: 'Theragun / Massage Gun',
    price: '~5,000-10,000 EGP',
    timing: 'قبل التمرين (Activation) وبعده (Recovery)',
    how: 'قبل التمرين: 30 ثانية على كل عضلة للـ Activation. بعده: 2 دقيقة على العضلات المتعبة.',
    science: 'الـ Percussive Therapy بتزود الـ Blood Flow وتقلل الـ Muscle Tension أسرع من الـ Foam Rolling.',
  },
  {
    tool: 'Polar H10 + HRV Tracking',
    price: '~4,500 EGP',
    timing: 'كل صبح، 5 دقائق قبل ما تقوم',
    how: 'استخدم Polar H10 مع Elite HRV App أو Polar Flow. قيس الـ HRV وانت مستلقي قبل ما تقوم من السرير.',
    science: 'الـ Morning HRV Reading هو أدق وقت للقياس. بيديك صورة واضحة عن حالة الجهاز العصبي.',
  },
  {
    tool: 'Compression Gear',
    price: '~1,000-2,000 EGP',
    timing: 'أثناء التمرين وبعده لـ 2-4 ساعات',
    how: 'Compression Socks أو Tights بعد الـ Long Runs والـ Races. بيساعد في الـ Venous Return.',
    science: 'بيسرع إزالة الـ Lactic Acid من العضلات ويقلل الـ Swelling بعد التمارين الشديدة.',
  },
  {
    tool: 'Ice Bath / Cold Exposure',
    price: 'مجاناً تقريباً',
    timing: 'بعد التمارين الشديدة جداً، 10-15 دقيقة في 10-15°C',
    how: 'دوش بارد لـ 3-5 دقائق أو حوض بيه ثلج. مش لازم كل يوم، بعد الـ Hard Sessions بس.',
    science: 'بيقلل الـ Inflammation ويسرع الـ Recovery، لكن ممكن يقلل الـ Muscle Adaptation لو اتعمل كتير.',
  },
]

const sleepOptimizationTips = [
  {
    category: 'قبل النوم بـ 2 ساعة',
    tips: [
      'قلل الـ Blue Light (موبايل وتليفزيون)، استخدم Night Mode أو نضارات Blue Light Blocking',
      'خفف الأكل الثقيل، الجسم محتاج طاقة للـ Digestion مش للـ Recovery',
      'تجنب الكافيين، الـ Half-Life بتاعه 5-7 ساعات',
      'اعمل Foam Rolling خفيف أو Stretching لـ 10 دقائق',
    ],
  },
  {
    category: 'بيئة النوم',
    tips: [
      'درجة الحرارة: 18-20°C هي الأمثل للنوم العميق',
      'الظلام الكامل: أي ضوء بيقلل الـ Melatonin',
      'الهدوء: استخدم Earplugs أو White Noise لو في ضوضاء',
      'السرير للنوم بس، متشتغلش أو تتفرج فيه',
    ],
  },
  {
    category: 'الـ Sleep Schedule',
    tips: [
      'نام وصحي في نفس الوقت كل يوم، حتى في الإجازات',
      'الـ Consistency في الـ Sleep Schedule أهم من عدد الساعات',
      'الـ Athletes المحترفين بيناموا 9-10 ساعات في الليالي قبل الـ Races',
      'الـ Power Nap (20 دقيقة) بعد الظهر بيعوض قلة النوم ويزود الـ Alertness',
    ],
  },
  {
    category: 'بعد التمرين مباشرة',
    tips: [
      'Protein Shake أو وجبة بروتين في أول 30-60 دقيقة بعد التمرين',
      'Rehydration: اشرب 1.5x الوزن اللي خسرته في العرق',
      'Cool-Down صح: 10 دقائق Zone 1 + Stretching بيسرع الـ Recovery',
      'سجّل التمرين في الـ Garmin Connect عشان تتابع الـ Recovery Time',
    ],
  },
]

const weeklyRecoveryPlan = [
  { day: 'الاثنين', type: 'Hard', session: 'Interval Training — Zone 4-5', recovery: 'Foam Roller + Protein + 8h Sleep', hrv: 'مش مهم، يوم تمرين شديد' },
  { day: 'الثلاثاء', type: 'Easy', session: 'Easy Run 30 دقيقة — Zone 1-2', recovery: 'Compression Socks + Hydration', hrv: 'لو منخفض: حوّل لـ Rest Day' },
  { day: 'الأربعاء', type: 'Rest', session: 'Complete Rest أو Yoga خفيف', recovery: 'Theragun + Ice Bath لو محتاج', hrv: 'قيس الصبح واتابع الـ Trend' },
  { day: 'الخميس', type: 'Hard', session: 'Tempo Run — Zone 3-4', recovery: 'Foam Roller + Protein + 8h Sleep', hrv: 'لو فوق 70: اتمرن بجد' },
  { day: 'الجمعة', type: 'Easy', session: 'Easy Run أو Cross-Training', recovery: 'Stretching + Hydration', hrv: 'لو منخفض: خفف الـ Intensity' },
  { day: 'السبت', type: 'Long', session: 'Long Run — Zone 2', recovery: 'Ice Bath + Compression + 9h Sleep', hrv: 'مش مهم، يوم Long Run' },
  { day: 'الأحد', type: 'Rest', session: 'Complete Rest', recovery: 'Foam Roller خفيف + نوم كتير', hrv: 'أهم قراءة في الأسبوع' },
]

const commonMistakes = [
  {
    mistake: 'التمرين كل يوم بدون Rest Days',
    fix: 'الجسم بيتحسن في الـ Recovery مش في التمرين. Rest Days مش كسل، ده جزء أساسي من البرنامج.',
  },
  {
    mistake: 'النوم 5-6 ساعات وتوقع نتايج كويسة',
    fix: 'الـ Athletes محتاجين 8-10 ساعات. كل ساعة نوم ناقصة بتقلل الـ Performance بنسبة ملحوظة.',
  },
  {
    mistake: 'تجاهل الـ HRV وتمرين بنفس الـ Intensity كل يوم',
    fix: 'استخدم الـ Garmin Training Readiness أو Polar Recovery Pro عشان تعرف امتى تضغط وامتى تخف.',
  },
  {
    mistake: 'الأكل بعد التمرين بساعات',
    fix: 'الـ Anabolic Window الأول 30-60 دقيقة بعد التمرين هو الأهم. Protein + Carbs فوراً.',
  },
  {
    mistake: 'الـ Ice Bath كل يوم',
    fix: 'الـ Cold Exposure بعد كل تمرين بيقلل الـ Muscle Adaptation. استخدمه بعد الـ Hard Sessions بس.',
  },
  {
    mistake: 'تجاهل الـ Sleep Quality وركز على الساعات بس',
    fix: '8 ساعات نوم سيء أقل فائدة من 7 ساعات نوم عميق. اهتم بالـ Sleep Environment.',
  },
]

const keyTerms = [
  { term: 'HRV', def: 'Heart Rate Variability — الفرق الزمني بين ضربات القلب. أهم مؤشر للـ Recovery والـ Readiness. كلما ارتفع، كلما الجسم أكتر استعداداً.' },
  { term: 'Deep Sleep (SWS)', def: 'Slow Wave Sleep — أعمق مرحلة نوم، فيها الـ Growth Hormone بيتفرز والعضلات بتتصلح. المفروض يكون 20-25% من إجمالي النوم.' },
  { term: 'REM Sleep', def: 'Rapid Eye Movement — مرحلة الأحلام، مهمة للـ Mental Recovery والـ Motor Learning. بيتزيد في الـ Cycles الأخيرة من الليل.' },
  { term: 'DOMS', def: 'Delayed Onset Muscle Soreness — الوجع اللي بتحس بيه 24-48 ساعة بعد التمرين. طبيعي وعلامة على الـ Muscle Adaptation.' },
  { term: 'Cortisol', def: 'هرمون الإجهاد، بيرتفع مع قلة النوم والـ Overtraining. بيكسر العضلات ويزود الـ Body Fat.' },
  { term: 'Body Battery', def: 'مؤشر في الـ Garmin Watches من 0-100 بيقيس مستوى طاقتك بناءً على الـ HRV والنوم والنشاط.' },
  { term: 'Training Readiness', def: 'Score في الـ Garmin Forerunner 965 والـ Fenix 7 بيجمع كل مؤشرات الـ Recovery ويقولك هل تتمرن بجد ولا تخف.' },
  { term: 'Overtraining Syndrome', def: 'حالة من الإجهاد المزمن بسبب تمرين كتير مع Recovery قليل. أعراضه: انخفاض الـ Performance والـ HRV وزيادة الـ Resting HR.' },
]

const faqs = [
  {
    q: 'How many hours of sleep does a runner need?',
    qAr: 'كام ساعة نوم محتاج كـ Runner؟',
    a: 'Athletes need 8-10 hours, not the 7-8 that is enough for most people. Sleep is the strongest free performance enhancer there is.',
    aAr: 'الـ Athletes محتاجين 8-10 ساعات، مش 7-8 زي الناس العادية. Roger Federer بيقول بينام 12 ساعة، LeBron James 10 ساعات. النوم هو الـ Performance Enhancer الأقوى والمجاني.',
  },
  {
    q: 'Does Garmin measure HRV correctly?',
    qAr: 'الـ Garmin بيقيس الـ HRV صح؟',
    a: 'Forerunner 265, 965 and Fenix 7 measure HRV during sleep with good accuracy. For the highest accuracy, a Polar H10 with the Elite HRV app is the best on the market.',
    aAr: 'الـ Garmin Forerunner 265 و965 والـ Fenix 7 بيقيسوا الـ HRV أثناء النوم بدقة كويسة. للدقة الأعلى، الـ Polar H10 مع Elite HRV App هو الأفضل في السوق.',
  },
  {
    q: 'Do power naps actually help?',
    qAr: 'الـ Power Nap بيفيد فعلاً؟',
    a: 'Yes. Just 20 minutes noticeably improves alertness and performance. Do not go past 30 minutes or you dip into deep sleep and wake up groggy.',
    aAr: 'أيوه! 20 دقيقة بس بتزود الـ Alertness والـ Performance بنسبة ملحوظة. المهم متعدّيش 30 دقيقة عشان متدخلش في الـ Deep Sleep وتصحى تعبان.',
  },
  {
    q: 'When should I take an ice bath?',
    qAr: 'امتى أعمل Ice Bath؟',
    a: 'After hard sessions, long runs and races. Not after every workout: repeated cold exposure blunts muscle adaptation over the long term.',
    aAr: 'بعد الـ Hard Sessions والـ Long Runs والـ Races. مش بعد كل تمرين، لأن الـ Cold Exposure المتكرر بيقلل الـ Muscle Adaptation على المدى البعيد.',
  },
  {
    q: 'Foam roller before or after training?',
    qAr: 'الـ Foam Roller قبل ولا بعد التمرين؟',
    a: 'Both. Before: 5 minutes of dynamic rolling for activation. After: 10-15 minutes of static rolling for recovery. The post-workout session matters most.',
    aAr: 'الاتنين! قبل التمرين: 5 دقائق Dynamic Rolling للـ Activation. بعد التمرين: 10-15 دقيقة Static Rolling للـ Recovery. الـ Foam Roller بعد التمرين هو الأهم.',
  },
]

const toc = [
  { id: 'why-sleep', label: 'ليه النوم مهم للـ Athletes؟' },
  { id: 'sleep-stages', label: 'مراحل النوم وتأثيرها على الـ Performance' },
  { id: 'hrv-recovery', label: 'الـ HRV — مؤشر الـ Recovery الأهم' },
  { id: 'garmin-features', label: 'الـ Garmin وتتبع الـ Recovery' },
  { id: 'recovery-tools', label: 'أدوات الـ Recovery الأساسية' },
  { id: 'sleep-tips', label: 'إزاي تحسّن نومك؟' },
  { id: 'weekly-plan', label: 'خطة Recovery أسبوعية' },
  { id: 'mistakes', label: 'أكتر الأخطاء شيوعاً' },
  { id: 'terms', label: 'المصطلحات الأساسية' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function SleepRecoveryPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="ممكن تتمرن كل يوم، تاكل صح، وتشتري أغلى الـ Gear — ولو نومك والـ Recovery بتاعك غلط، هتفضل في نفس المكان. النوم مش وقت ضايع، هو الوقت الوحيد اللي جسمك بيتحسن فيه فعلاً."
      toc={toc}
      related={['training-guide/heart-rate-zones', 'training-guide/claude-kailo-free-running-coach', 'gear-guide/beginners-guide']}
      cta={{
        title: 'Pulse Gear Egypt — وصّلك الـ Gear الصح',
        body: 'Foam Rollers، Theragun، Garmin Watches، Polar H10 — كل أدوات الـ Recovery متاحة في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري. تواصل معانا وهنساعدك تبني Recovery Plan صح.',
        href: '/products',
        label: 'Browse Products',
      }}
    >
      <Section id="why-sleep" title="Why sleep matters for athletes" titleAr="ليه النوم مهم للـ Athletes؟">
        <P>مش بس عشان تصحى نشيط — النوم هو الوقت الوحيد اللي جسمك بيتصلح فيه.</P>
        <Callout tone="fact" title="الـ Science بتقول إيه؟">
          دراسة على لاعبي Basketball في Stanford: زيادة النوم من 6 لـ 10 ساعات حسّنت الـ Sprint Speed بـ 5%،
          الـ Shooting Accuracy بـ 9%، وقلّلت الـ Reaction Time بشكل ملحوظ. كل ده من النوم بس.
        </Callout>
        <StatCards
          items={[
            { value: '+5%', label: 'Sprint speed', sub: 'من 6 لـ 10 ساعات نوم', tone: 'green' },
            { value: '+9%', label: 'Shooting accuracy', sub: 'نفس الدراسة', tone: 'blue' },
            { value: '4x', label: 'Risk of illness', sub: 'لو بتنام أقل من 6 ساعات', tone: 'accent' },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {whySleepMatters.map((item) => (
            <div key={item.title} className="card flex flex-col gap-2 p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-white" dir="auto">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-strong" dir="auto">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sleep-stages" title="Sleep stages and performance" titleAr="مراحل النوم وتأثيرها على الـ Performance">
        <P>مش كل النوم زي بعض — كل Stage ليه دور مختلف في الـ Recovery.</P>
        <div className="space-y-4">
          {sleepStages.map((s) => (
            <MeterCard key={s.title} {...s} />
          ))}
        </div>
      </Section>

      <Section id="hrv-recovery" title="HRV: the recovery metric that matters most" titleAr="الـ HRV — مؤشر الـ Recovery الأهم">
        <P>قيّم Recovery بتاعك بالأرقام، مش بالإحساس.</P>
        <P>
          <Strong>إيه هو الـ HRV؟</Strong> الـ HRV (Heart Rate Variability) هو الفرق الزمني بين كل ضربة قلب والتانية.
          قلبك مش بيضرب زي الساعة بالضبط — في تفاوت طبيعي بين الضربات. لما الـ HRV مرتفع، ده معناه إن الجهاز العصبي
          اللاإرادي بتاعك مرن وصحي. لما بينزل، ده علامة على إجهاد أو مرض أو Overtraining.
        </P>
        <div className="space-y-3">
          {hrvExplained.map((item) => (
            <Callout key={item.metric} tone={item.tone} title={item.metric}>
              <p><Strong>المعنى:</Strong> {item.meaning}</p>
              <p><Strong>الإجراء:</Strong> {item.action}</p>
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="garmin-features" title="Garmin and recovery tracking" titleAr="الـ Garmin وتتبع الـ Recovery">
        <P>الـ Garmin Watches الحديثة مش بس بتقيس التمرين، بتتابع الـ Recovery كمان.</P>
        <CompareTable
          caption="Garmin recovery features"
          columns={['Watch', 'What it does']}
          rows={garminRecoveryFeatures.map((f) => ({ label: f.feature, cells: [f.watch, f.desc] }))}
        />
        <Callout tone="egypt" title="Garmin Watches متاحة في Pulse Gear Egypt">
          Forerunner 265، Forerunner 965، Fenix 7 — كلهم متاحين بأسعار مناسبة بالجنيه المصري.
          تواصل معانا عشان تعرف أنهي Watch يناسب مستواك وميزانيتك.{' '}
          <Link href="/products" className="font-bold text-brand-soft hover:text-white">Browse Garmin Watches →</Link>
          {' '}أو{' '}
          <Link href="/request-product" className="font-bold text-brand-soft hover:text-white">Request a Product</Link>.
        </Callout>
      </Section>

      <Section id="recovery-tools" title="Essential recovery tools" titleAr="أدوات الـ Recovery الأساسية">
        <P>من أرخص الأدوات لأغلاها، وإزاي تستخدم كل واحدة صح.</P>
        <div className="space-y-4">
          {recoveryTools.map((t) => (
            <div key={t.tool} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-1/60 px-5 py-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-white" dir="auto">{t.tool}</h3>
                <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-bold text-muted-strong" dir="auto">{t.price}</span>
              </div>
              <div className="space-y-2 p-5 text-sm leading-relaxed text-muted-strong">
                <p dir="auto"><Strong>التوقيت:</Strong> {t.timing}</p>
                <p dir="auto"><Strong>إزاي تستخدمه:</Strong> {t.how}</p>
                <p dir="auto" className="rounded-xl bg-surface-2 p-3"><span className="font-bold text-brand-soft">الـ Science:</span> {t.science}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sleep-tips" title="How to sleep better" titleAr="إزاي تحسّن نومك؟">
        <P>تغييرات صغيرة بتفرق فرق كبير في جودة النوم.</P>
        <div className="space-y-4">
          {sleepOptimizationTips.map((c) => (
            <div key={c.category} className="card space-y-3 p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-white" dir="auto">{c.category}</h3>
              <BulletList items={c.tips} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="weekly-plan" title="A weekly recovery plan" titleAr="خطة Recovery أسبوعية">
        <P>إزاي توازن بين التمرين والـ Recovery في أسبوع واحد.</P>
        <CompareTable
          caption="Weekly recovery plan"
          columns={['Type', 'Session', 'Recovery', 'HRV']}
          rows={weeklyRecoveryPlan.map((d) => ({ label: d.day, cells: [d.type, d.session, d.recovery, d.hrv] }))}
        />
      </Section>

      <Section id="mistakes" title="Most common mistakes" titleAr="أكتر الأخطاء شيوعاً">
        <P>اتعلم من غلطات الناس التانية، متعملهاش أنت.</P>
        <div className="space-y-3">
          {commonMistakes.map((m) => (
            <Callout key={m.mistake} tone="danger" title={m.mistake}>
              <Strong>الحل:</Strong> {m.fix}
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="terms" title="Key terms" titleAr="المصطلحات الأساسية">
        <dl className="card divide-y divide-line overflow-hidden">
          {keyTerms.map((k) => (
            <div key={k.term} className="flex flex-col gap-1 px-5 py-4 md:flex-row md:gap-6">
              <dt className="shrink-0 text-sm font-black text-brand-soft md:w-44" dir="auto">{k.term}</dt>
              <dd className="text-sm leading-relaxed text-muted-strong" dir="auto">{k.def}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <FaqList items={faqs} title="الأسئلة الشائعة" />
    </ArticleShell>
  )
}
