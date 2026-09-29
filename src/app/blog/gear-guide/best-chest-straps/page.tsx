// src/app/blog/gear-guide/best-chest-straps/page.tsx
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
  MeterCard,
  CompareTable,
  PickCard,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-guide/best-chest-straps'

export const metadata: Metadata = articleMetadata(SLUG)

type Tone = 'brand' | 'blue' | 'green' | 'orange'

const straps: {
  rank: number
  badge: string
  name: string
  tagline: string
  tone: Tone
  priceNote: string
  href: string
  specs: { label: string; value: string }[]
  pros: string[]
  cons: string[]
  verdict: string
}[] = [
  {
    rank: 1,
    badge: 'Best Overall',
    name: 'Polar H10',
    tagline: 'الخيار الأقوى لمن يريد دقة وموثوقية عالية',
    tone: 'brand',
    priceNote: 'Premium option',
    href: '/products?brand=Polar',
    specs: [
      { label: 'Battery Life', value: 'حتى 400 ساعة' },
      { label: 'Connectivity', value: 'Dual BLE + ANT+' },
      { label: 'Waterproof', value: 'IPX7، حتى 30 متر' },
      { label: 'Memory', value: 'يحفظ Session بدون الحاجة إلى Watch أثناء التسجيل' },
      { label: 'Compatibility', value: 'Garmin وPolar وWahoo وتطبيقات التدريب المتوافقة' },
    ],
    pros: [
      'دقة عالية جدًا في قياس Heart Rate',
      'يدعم Bluetooth وANT+',
      'يمكنه تسجيل Session بدون Watch متوافقة أثناء التمرين',
      'Soft Strap مريح للاستخدام أثناء الجري',
      'مناسب للـ Zone Training والـ Intervals والـ Endurance Training',
    ],
    cons: [
      'أعلى سعرًا من الخيارات الاقتصادية',
      'يحتاج إلى ترطيب منطقة الأقطاب قبل الاستخدام للحصول على أفضل اتصال',
      'لا يقدم Running Dynamics الخاصة بأنظمة Garmin',
    ],
    verdict: 'لو أهم حاجة عندك هي جودة Heart Rate Data والاعتمادية، فالـ Polar H10 من أقوى الخيارات في الفئة. مناسب جدًا للـ runners اللي بدأوا يعتمدوا على Heart Rate Zones بشكل جاد.',
  },
  {
    rank: 2,
    badge: 'Best for Garmin Users',
    name: 'Garmin HRM-Pro Plus',
    tagline: 'للي عايز Heart Rate مع Running Dynamics',
    tone: 'blue',
    priceNote: 'Premium Garmin option',
    href: '/products?brand=Garmin',
    specs: [
      { label: 'Battery Life', value: 'حتى 500 ساعة' },
      { label: 'Connectivity', value: 'ANT+ + Bluetooth' },
      { label: 'Waterproof', value: 'IPX7' },
      { label: 'Running Dynamics', value: 'Cadence وGround Contact Time وStride Length وRunning Power' },
      { label: 'Memory', value: 'يمكنه تخزين بيانات التمرين بدون Watch' },
    ],
    pros: [
      'ممتاز لمستخدمي Garmin المتوافقين',
      'يدعم Running Dynamics',
      'يوفر Running Power بدون Footpod عند استخدام النظام المتوافق',
      'بطارية طويلة',
      'تكامل قوي مع Garmin Connect',
    ],
    cons: [
      'أغلى من الخيارات الأساسية',
      'بعض ميزات Running Dynamics تعتمد على وجود Garmin Watch متوافق',
      'لو كل احتياجك هو Heart Rate فقط، قد لا تحتاج كل هذه Features',
    ],
    verdict: 'لو عندك Garmin Watch متوافق وعايز تستفيد من Running Dynamics، فالـ HRM-Pro Plus منطقي جدًا. أما لو هدفك الأساسي Heart Rate فقط، فممكن توفر وتختار Strap أبسط.',
  },
  {
    rank: 3,
    badge: 'Best Value',
    name: 'Wahoo TICKR X',
    tagline: 'Features قوية بدون الوصول لسعر الفئة الأعلى',
    tone: 'green',
    priceNote: 'Value-focused option',
    href: '/products?brand=Wahoo',
    specs: [
      { label: 'Battery Life', value: 'حتى 500 ساعة حسب المصدر الداخلي' },
      { label: 'Connectivity', value: 'Dual BLE + ANT+' },
      { label: 'Waterproof', value: 'IPX7' },
      { label: 'Memory', value: 'حتى 16 ساعة حسب بيانات المنتج' },
      { label: 'Motion Data', value: 'Cadence وReps وSteps' },
    ],
    pros: [
      'يدعم الاتصال بأكثر من جهاز',
      'ذاكرة داخلية كبيرة نسبيًا',
      'يوفر Motion Data إضافية',
      'مناسب للـ Running والـ Gym',
      'اختيار جيد لمن يريد Features أكثر من مجرد Heart Rate',
    ],
    cons: [
      'تجربة التطبيق ليست بالضرورة العامل الأقوى في الاختيار',
      'راحة الـ Strap قد تختلف من شخص لآخر',
      'لو هدفك فقط أعلى مستوى من Heart Rate Accuracy، توجد خيارات أقوى في القائمة',
    ],
    verdict: 'لو عايز Chest Strap متعدد الاستخدامات ومش محتاج الدخول في فئة Garmin المتقدمة، فالـ TICKR X اختيار قوي خصوصًا لو هتستخدمه في Running وGym.',
  },
  {
    rank: 4,
    badge: 'Best Budget',
    name: 'Polar H9',
    tagline: 'اختيار ممتاز لو عايز تبدأ بـ Heart Rate Training',
    tone: 'orange',
    priceNote: 'Budget-focused option',
    href: '/products?brand=Polar',
    specs: [
      { label: 'Battery Life', value: 'حتى 400 ساعة' },
      { label: 'Connectivity', value: 'Bluetooth + ANT+' },
      { label: 'Waterproof', value: 'IPX7' },
      { label: 'Memory', value: 'لا توجد ذاكرة داخلية' },
      { label: 'Compatibility', value: 'يدعم العديد من الساعات والتطبيقات المتوافقة' },
    ],
    pros: [
      'قيمة قوية مقابل السعر',
      'مناسب جدًا للـ runners اللي بيبدأوا Heart Rate Training',
      'خفيف ومناسب للاستخدام اليومي',
      'يدعم Garmin وWahoo وتطبيقات التدريب المتوافقة',
      'أبسط من H10 لو مش محتاج كل الـ Features الإضافية',
    ],
    cons: [
      'لا توجد ذاكرة داخلية',
      'يحتاج إلى Watch أو Phone متوافق لتسجيل البيانات',
      'لا يقدم Running Dynamics المتقدمة',
    ],
    verdict: 'لو أنت لسه بتبدأ وعايز تدخل عالم Heart Rate Training من غير ما تدفع في Features مش محتاجها، فالـ Polar H9 من الاختيارات المنطقية جدًا.',
  },
]

const quickPick = [
  { need: 'عايز أقوى اختيار عام', pick: 'Polar H10' },
  { need: 'عندي Garmin وعايز Running Dynamics', pick: 'Garmin HRM-Pro Plus' },
  { need: 'عايز Features كثيرة وقيمة جيدة', pick: 'Wahoo TICKR X' },
  { need: 'عايز تبدأ بأقل تكلفة ممكنة', pick: 'Polar H9' },
]

const decisionFactors = [
  { title: 'Accuracy', description: 'لو هدفك الأساسي هو Training by Heart Rate، جودة البيانات واستجابة الـ Sensor أهم من عدد الـ Features.' },
  { title: 'Compatibility', description: 'قبل الشراء، تأكد إن الـ Strap متوافق مع الـ Watch أو Training App اللي بتستخدمه.' },
  { title: 'Features', description: 'لو محتاج Running Dynamics أو Memory أو Multi-device Connectivity، اختار Strap يوفر الوظائف دي فعلًا.' },
  { title: 'Budget', description: 'مش لازم تشتري أغلى Strap. الاختيار الصح هو اللي يوفر البيانات اللي تحتاجها بدون دفع مقابل Features مش هتستخدمها.' },
]

const faqs: FaqItem[] = [
  { q: 'هل أحتاج Chest Strap لو عندي Smartwatch؟', a: 'لو استخدامك General Fitness، فالـ Optical Heart Rate في الـ Watch ممكن يكون كافي. لكن لو بتعمل Zone Training أو Intervals أو Marathon Training أو محتاج بيانات أكثر استجابة أثناء تغير شدة التمرين، فالـ Chest Strap ممكن يكون Upgrade مفيد.' },
  { q: 'هل الـ Chest Strap يشتغل مع Garmin؟', a: 'معظم الـ Straps المذكورة هنا تدعم طرق اتصال مثل Bluetooth وANT+. لكن التوافق النهائي يعتمد على موديل الـ Garmin والـ Features التي تريد استخدامها، لذلك يجب التأكد من مواصفات الجهازين قبل الشراء.' },
  { q: 'هل الـ Polar H9 وH10 يشتغلوا مع أجهزة غير Polar؟', a: 'نعم. قاعدة البيانات الداخلية تشير إلى أن H9 وH10 يدعمان Bluetooth وANT+، لذلك يمكن استخدامهما مع أجهزة وتطبيقات خارج منظومة Polar عندما يكون الجهاز الآخر متوافقًا.' },
  { q: 'إيه الفرق الأساسي بين H9 وH10؟', a: 'الـ H10 يضيف Features مثل الذاكرة الداخلية والاتصال المتعدد، بينما الـ H9 أبسط ومناسب لمن يريد Heart Rate Tracking بدون الحاجة إلى كل الإضافات.' },
  { q: 'هل Chest Strap مناسب للمبتدئين؟', a: 'نعم، ومش لازم تكون Professional Athlete. لو هدفك تتعلم تستخدم Heart Rate Zones وتفهم شدة تمرينك بشكل أفضل، ممكن يكون Chest Strap بداية مفيدة.' },
  { q: 'هل كل Chest Straps مناسبة للسباحة؟', a: 'لا. مقاومة المياه والـ Swimming Features تختلف من موديل لآخر. قاعدة البيانات الداخلية تشير إلى أن Polar H10 يمكنه تسجيل Heart Rate أثناء السباحة، بينما يجب التأكد من مواصفات أي Strap آخر قبل استخدامه في الماء.' },
  { q: 'إيه أفضل Strap أبدأ بيه؟', a: 'يعتمد على احتياجك. لو عايز خيار اقتصادي، Polar H9 مناسب. لو عايز Features أكثر وذاكرة داخلية، Polar H10 أقوى. ولو عندك Garmin وتهتم بـ Running Dynamics، فالـ Garmin HRM-Pro Plus يستحق النظر.' },
]

const toc = [
  { id: 'quick-pick', label: 'اختار بسرعة' },
  { id: 'what-matters', label: 'إيه اللي يهم فعلًا؟' },
  { id: 'straps', label: 'أفضل 4 Chest Straps' },
  { id: 'smartwatch', label: 'طيب لو عندي Smartwatch؟' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function BestChestStrapsPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="لو بتدور على Chest Strap جديد، مش لازم تختار أغلى موديل. الاختيار الصح بيعتمد على الـ Accuracy والـ Compatibility والـ Features والميزانية. في الدليل ده هنقارن 4 اختيارات مختلفة ونوضح كل واحد مناسب لمين."
      toc={toc}
      related={['gear-guide/best-gps-watches', 'gear-review/heart-rate-strap-vs-optical', 'training-guide/zone-2-training']}
      cta={{
        title: 'لسه مش عارف تختار؟',
        body: 'ابعتلنا نوع الـ Watch اللي بتستخدمها، نوع التمرين، وميزانيتك، وإحنا نساعدك تحدد أنسب Chest Strap ليك. ولو المنتج اللي بتدور عليه مش موجود حاليًا، تقدر تستخدم Request a Product ونشوف إمكانية توفيره.',
        href: '/products?category=Heart%20Rate%20Straps',
        label: 'Browse chest straps',
      }}
    >
      <Callout tone="egypt" title="قبل ما تشتري">
        الأسعار والتوفر ممكن يتغيروا، خصوصًا مع الاستيراد وتغير تكلفة الشراء. استخدم المقارنة دي لفهم الفرق بين الأجهزة، وبعدها راجع المنتجات المتاحة حاليًا على Pulse Gear أو اطلب موديل من خلال{' '}
        <Link href="/request-product" className="font-bold text-white underline-offset-4 hover:underline">Request a Product</Link>.
      </Callout>

      <Section id="quick-pick" title="Quick pick" titleAr="اختار بسرعة">
        <P>لو مش عايز تقرأ المقارنة كلها، ابدأ من هنا.</P>
        <CompareTable
          caption="Quick pick by need"
          columns={['الاختيار']}
          highlightColumn={0}
          rows={quickPick.map((q) => ({ label: q.need, cells: [<Strong key="pick">{q.pick}</Strong>] }))}
        />
      </Section>

      <Section id="what-matters" title="What actually matters in a chest strap" titleAr="إيه اللي يهم فعلًا في الـ Chest Strap؟">
        <P>متقارنش الأجهزة بعدد الـ Features فقط. اسأل نفسك إيه البيانات اللي محتاجها فعلًا في التدريب.</P>
        <BulletList
          items={decisionFactors.map((f) => (
            <>
              <Strong>{f.title}:</Strong> {f.description}
            </>
          ))}
        />
      </Section>

      <Section id="straps" title="The 4 best chest straps" titleAr="أفضل 4 Chest Straps">
        <P>كل اختيار هنا مناسب لاحتياج مختلف.</P>
        <div className="space-y-10">
          {straps.map((s) => (
            <div key={s.name} className="space-y-4">
              <PickCard
                rank={s.rank}
                name={s.name}
                badge={s.badge}
                priceBand={s.priceNote}
                bestFor={s.tagline}
                summary={`رأينا: ${s.verdict}`}
                pros={s.pros}
                cons={s.cons}
                href={s.href}
              />
              <MeterCard title="Key specs" badge={s.priceNote} tone={s.tone} description={s.tagline} meta={s.specs} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="smartwatch" title="What if I already have a smartwatch?" titleAr="طيب لو عندي Smartwatch بالفعل؟">
        <P muted={false}>مش معنى إنك عندك Smartwatch إنك لازم تشتري Chest Strap.</P>
        <P>
          لو استخدامك General Fitness، فالـ Optical Heart Rate ممكن يكون كافي. لكن لما تدخل في Zone Training أو Intervals أو Marathon Preparation، سرعة واستقرار Heart Rate Data بيبقوا أهم، وهنا الـ Chest Strap ممكن يقدم قيمة أكبر.
        </P>
        <CompareTable
          caption="Smartwatch vs chest strap use cases"
          columns={['Smartwatch may be enough', 'Chest Strap becomes more useful']}
          highlightColumn={1}
          rows={[
            {
              label: 'When',
              cells: [
                'General fitness، المشي، والجري السهل بدون اعتماد كبير على Heart Rate Zones.',
                'Intervals، HIIT، Zone Training، Marathon Preparation والتمارين اللي فيها تغيرات سريعة في شدة المجهود.',
              ],
            },
          ]}
        />
      </Section>

      <FaqList title="الأسئلة الشائعة" items={faqs} />
    </ArticleShell>
  )
}
