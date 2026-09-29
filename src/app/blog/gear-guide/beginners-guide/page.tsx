// src/app/blog/gear-guide/beginners-guide/page.tsx
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
  CompareTable,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-guide/beginners-guide'

export const metadata: Metadata = articleMetadata(SLUG)

const setupStages = [
  {
    title: 'المرحلة الأولى: ابدأ بالجري نفسه',
    description: 'لو أنت لسه بتبدأ، مش محتاج تعمل Setup كامل. أهم حاجة تبدأ بشكل منتظم، تفهم جسمك، وتبني عادة الجري.',
    items: [
      { name: 'Running Shoes', role: 'الأساس', why: 'اختيار حذاء مناسب لنوع جريك وراحتك أهم من شراء مجموعة أجهزة من أول يوم.' },
      { name: 'Your Existing Watch / Phone', role: 'اختياري', why: 'لو عندك بالفعل ساعة أو موبايل بتستخدمه في متابعة التمرين، ابدأ بيه بدل ما تشتري جهاز جديد بدون احتياج واضح.' },
    ],
  },
  {
    title: 'المرحلة الثانية: ابدأ تتدرب بالـ Heart Rate',
    description: 'لو بدأت تهتم بالـ Heart Rate Zones أو بتحس إن الـ easy runs بتاعتك أسرع من اللازم، هنا الـ Chest Strap ممكن يكون أول Upgrade منطقي.',
    items: [
      { name: 'Heart Rate Chest Strap', role: 'أول Upgrade', why: 'الـ Chest Strap بيوفر قراءة أكثر استجابة للـ Heart Rate أثناء تغير شدة التمرين.' },
      { name: 'Training App', role: 'اختياري', why: 'ممكن تستخدم تطبيق متوافق عشان تتابع الـ Heart Rate والـ Training Zones أثناء التمرين.' },
    ],
  },
  {
    title: 'المرحلة الثالثة: طوّر الـ Training Setup',
    description: 'بعد ما تعرف احتياجاتك وتبدأ تتدرب بشكل منتظم، ممكن يكون الـ GPS Watch هو الخطوة التالية.',
    items: [
      { name: 'GPS Watch', role: 'Performance Upgrade', why: 'مفيد لما تحتاج تتبع أدق للـ Pace والـ Distance والـ Training Data.' },
      { name: 'Recovery Tools', role: 'اختياري', why: 'أدوات الـ Recovery ممكن تساعدك تضيف روتين للاستشفاء حسب احتياجك.' },
    ],
  },
]

const reasonsToUpgrade = [
  { title: 'بتتمرن بانتظام', description: 'لما التمرين يبقى جزء ثابت من أسبوعك، البيانات الإضافية ممكن تساعدك تفهم التدريب بشكل أفضل.' },
  { title: 'عايز تتحكم في الـ Heart Rate', description: 'لو بدأت تستخدم Heart Rate Zones في التدريب، دقة البيانات واستجابتها تصبح أكثر أهمية.' },
  { title: 'عايز بيانات أكثر', description: 'لو محتاج تتبع Pace وDistance وTraining Data بشكل أكثر تفصيلًا، هنا الـ GPS Watch ممكن يكون Upgrade منطقي.' },
]

const commonMistakes = [
  { mistake: 'شراء كل الـ Gear من أول يوم', solution: 'ابدأ بالأساسيات. اشتري القطعة اللي عندك احتياج واضح ليها، وبعدها طوّر الـ Setup تدريجيًا.' },
  { mistake: 'اختيار المنتج بناءً على السعر فقط', solution: 'السعر مهم، لكن لازم تشوف الـ Compatibility والاحتياجات الفعلية وطريقة استخدامك للجهاز.' },
  { mistake: 'افتراض إن الـ GPS Watch هي أول حاجة تحتاجها', solution: 'لو هدفك الأساسي هو فهم الـ Heart Rate Zones، ممكن يكون الـ Heart Rate Strap هو الـ Upgrade الأكثر منطقية.' },
  { mistake: 'التركيز على البيانات بدل التدريب', solution: 'الـ Gear وسيلة تساعدك تتدرب بشكل أذكى، مش بديل عن التدريب المنتظم.' },
]

const keyTerms = [
  { term: 'Heart Rate', def: 'عدد ضربات القلب في الدقيقة أثناء الراحة أو التمرين.' },
  { term: 'Heart Rate Zones', def: 'مستويات مختلفة من شدة التمرين يتم تحديدها بناءً على معدل ضربات القلب.' },
  { term: 'Zone 2', def: 'شدة تدريب منخفضة نسبيًا تُستخدم كثيرًا في بناء القدرة الهوائية والتحمل.' },
  { term: 'Recovery', def: 'فترة الراحة بين التمارين، وفيها الجسم يستعيد قدرته ويتكيف مع التدريب.' },
  { term: 'Training Load', def: 'مجموع الضغط التدريبي على جسمك، ومتابعته تساعدك على تجنب زيادة الحمل التدريبي بشكل غير مناسب.' },
]

const firstWeek = [
  { day: 'Day 1', title: 'Easy Run', tasks: ['ابدأ بجلسة جري سهلة.', 'ركز على المجهود بدل محاولة الجري بأقصى سرعة.'] },
  { day: 'Day 2', title: 'Recovery', tasks: ['راحة أو نشاط خفيف.', 'لاحظ إحساس جسمك بعد أول Session.'] },
  { day: 'Day 3', title: 'Run Again', tasks: ['كرر جري سهل.', 'حاول تخلي المجهود Controlled بدل ما تجري بأقصى سرعة.'] },
  { day: 'Day 4', title: 'Rest', tasks: ['راحة.', 'ركز على النوم والاستشفاء.'] },
  { day: 'Day 5', title: 'Learn Your Data', tasks: ['لو عندك HR Monitor، راقب Heart Rate أثناء التمرين.', 'ابدأ تفهم العلاقة بين المجهود والـ Heart Rate بدل مطاردة الأرقام فقط.'] },
  { day: 'Day 6', title: 'Easy Run', tasks: ['جلسة جري سهلة.', 'ركز على الـ Consistency أكثر من الـ Pace.'] },
  { day: 'Day 7', title: 'Review', tasks: ['راجع الأسبوع.', 'حدد إيه اللي كان ناقصك فعلًا قبل ما تشتري أي Gear جديد.'] },
]

const faqs: FaqItem[] = [
  { q: 'أبدأ بـ Chest Strap ولا GPS Watch؟', a: 'لو هدفك الأساسي هو التدريب باستخدام Heart Rate Zones، فالـ Chest Strap ممكن يكون بداية منطقية. الـ GPS Watch ييجي بعدين لما تعرف إيه البيانات اللي محتاج تتابعها.' },
  { q: 'الـ Foam Roller مهم فعلًا؟', a: 'ممكن يكون مفيد كجزء من روتين الـ Recovery، لكن مش لازم يكون أول قطعة Gear تشتريها. ابدأ بالأساسيات وشوف احتياجاتك الفعلية.' },
  { q: 'إزاي أعرف الـ Max HR بتاعي؟', a: 'في طرق مختلفة لتقدير الـ Max HR، لكن التقدير البسيط مش دايمًا بيعكس الرقم الحقيقي لكل شخص. لو محتاج تستخدم Heart Rate Zones بشكل جاد، الأفضل تعتمد على طريقة مناسبة لمستواك وتدريبك.' },
  { q: 'كام مرة في الأسبوع المفروض أتمرن؟', a: 'للمبتدئ، المهم تبدأ بحجم تدريب تقدر تحافظ عليه باستمرار مع أيام للراحة والاستشفاء. الـ Consistency أهم من محاولة زيادة عدد أيام التدريب بسرعة.' },
  { q: 'فين أقدر أشتري الـ Gear ده في مصر؟', a: 'تقدر تشوف المنتجات المتاحة حاليًا على Pulse Gear Egypt، ولو المنتج اللي محتاجه مش موجود، تقدر تستخدم Request a Product ونشوف إمكانية توفيره.' },
]

const toc = [
  { id: 'setup-stages', label: 'مراحل بناء الـ Training Setup' },
  { id: 'heart-rate', label: 'إمتى يكون الـ Heart Rate Strap مفيد؟' },
  { id: 'gps-watch', label: 'إمتى تشتري GPS Watch؟' },
  { id: 'first-week', label: 'خطة أول أسبوع' },
  { id: 'common-mistakes', label: 'أكتر الأخطاء شيوعًا' },
  { id: 'key-terms', label: 'المصطلحات الأساسية' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function BeginnersGuidePage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="مش محتاج تشتري كل حاجة من أول يوم. الهدف من الدليل ده إنك تعرف إيه اللي محتاجه فعلًا، وإمتى الـ Gear ممكن يساعدك تتدرب بشكل أذكى، وإمتى الأفضل إنك توفر فلوسك."
      toc={toc}
      related={['gear-guide/best-heart-rate-monitors', 'gear-guide/budget-vs-premium', 'training-guide/complete-training-setup']}
      cta={{
        title: 'محتار تبدأ بإيه؟',
        body: 'في Pulse Gear Egypt، بنوفرلك أجهزة ومعدات تدريب مناسبة لمستويات مختلفة. تقدر تشوف المنتجات المتاحة حاليًا، أو تطلب منتج مش موجود على الموقع من خلال Request a Product.',
        href: '/products',
        label: 'Browse products',
      }}
    >
      <Callout tone="egypt" title="متاح في Pulse Gear Egypt">
        تقدر تطلب الـ Gear المناسب ليك من خلال Pulse Gear Egypt، ولو المنتج اللي محتاجه مش موجود على الموقع، تقدر تطلبه من خلال{' '}
        <Link href="/request-product" className="font-bold text-white underline-offset-4 hover:underline">Request a Product</Link>.
      </Callout>

      <Section id="setup-stages" title="What gear do you actually need?" titleAr="إيه الـ Gear اللي تحتاجه فعلًا؟">
        <P>بدل ما تشتري كل حاجة مرة واحدة، ابنِ الـ Training Setup خطوة بخطوة حسب احتياجاتك.</P>
        <Steps
          steps={setupStages.map((stage) => ({
            title: stage.title,
            body: (
              <div className="space-y-3">
                <p>{stage.description}</p>
                <BulletList
                  items={stage.items.map((item) => (
                    <>
                      <Strong>{item.name}</Strong> <span className="text-muted">({item.role})</span> — {item.why}
                    </>
                  ))}
                />
              </div>
            ),
          }))}
        />
      </Section>

      <Section id="heart-rate" title="When is a heart rate strap useful?" titleAr="إمتى يكون الـ Heart Rate Strap مفيد؟">
        <P>
          لو هدفك التدريب باستخدام Heart Rate Zones، الـ <Strong>Chest Strap</Strong> ممكن يكون Upgrade مهم لأنه بيوفر قراءة أكثر استجابة أثناء تغير شدة التمرين.
        </P>
        <CompareTable
          caption="Optical heart rate vs chest strap"
          columns={['Optical Heart Rate', 'Chest Strap']}
          highlightColumn={1}
          rows={[
            {
              label: 'How it works',
              cells: [
                'الساعات الذكية تستخدم Optical Sensors لقياس التغيرات المرتبطة بتدفق الدم. ده ممكن يكون كافي في مواقف كثيرة، خصوصًا أثناء النشاط المستقر.',
                'الـ Chest Strap يقيس الإشارة الكهربائية للقلب، لذلك يكون مفيدًا عندما تحتاج Heart Rate Data أكثر استجابة أثناء تغير شدة التمرين.',
              ],
            },
          ]}
        />
        <Link href="/products?category=Heart%20Rate%20Straps" className="btn-ghost">Explore heart rate gear</Link>
      </Section>

      <Section id="gps-watch" title="When should you buy a GPS watch?" titleAr="إمتى تشتري GPS Watch؟">
        <P>مش لازم تكون أول قطعة Gear تشتريها. الـ GPS Watch بيبقى Upgrade منطقي لما:</P>
        <BulletList
          items={reasonsToUpgrade.map((r) => (
            <>
              <Strong>{r.title}</Strong> — {r.description}
            </>
          ))}
        />
        <Link href="/products?category=Fitness%20Watches" className="btn-ghost">Explore GPS watches</Link>
      </Section>

      <Section id="first-week" title="Your first week" titleAr="خطة أول أسبوع للمبتدئ">
        <P>الهدف من أول أسبوع مش إنك تجمع أكبر عدد من الـ Kilometers. الهدف إنك تبدأ وتعرف جسمك.</P>
        <Steps
          steps={firstWeek.map((d) => ({
            title: d.title,
            meta: d.day,
            body: <BulletList items={d.tasks} />,
          }))}
        />
      </Section>

      <Section id="common-mistakes" title="Common mistakes" titleAr="أكتر الأخطاء شيوعًا">
        <P>اتعلم من غلطات الناس التانية ومتعملهاش أنت.</P>
        <div className="space-y-3">
          {commonMistakes.map((m) => (
            <Callout key={m.mistake} tone="danger" title={m.mistake}>
              <Strong>الحل:</Strong> {m.solution}
            </Callout>
          ))}
        </div>
      </Section>

      <Section id="key-terms" title="Key terms" titleAr="المصطلحات الأساسية">
        <P>أهم المصطلحات اللي هتقابلها وأنت بتتعلم عن الـ Running وTraining Data.</P>
        <BulletList
          items={keyTerms.map((t) => (
            <>
              <Strong>{t.term}</Strong> — {t.def}
            </>
          ))}
        />
      </Section>

      <FaqList title="الأسئلة الشائعة" items={faqs} />
    </ArticleShell>
  )
}
