// src/app/blog/gear-guide/best-heart-rate-monitors/page.tsx
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
  CompareTable,
  PickCard,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-guide/best-heart-rate-monitors'

export const metadata: Metadata = articleMetadata(SLUG)

const chestStraps = [
  {
    rank: 1,
    name: 'Polar H10',
    badge: 'Best Overall',
    price: 'حوالي 9,000 EGP',
    connectivity: 'Bluetooth + ANT+',
    battery: 'حوالي 400 ساعة',
    memory: 'نعم',
    waterproof: 'نعم',
    compatibility: 'Garmin / Polar / Apps',
    bestFor: 'Zone training بشكل جاد',
    href: '/products?brand=Polar',
    pros: ['دقة ممتازة للـ Heart Rate Training', 'ذاكرة داخلية لتسجيل التمرين', 'يدعم Bluetooth وANT+', 'مناسب للـ Running والـ Cycling والـ HIIT'],
    cons: ['أغلى من الـ Entry-Level Straps', 'مش كل المستخدمين محتاجين كل الـ Features الموجودة فيه'],
    verdict: 'اختيار قوي للعدائين والـ Athletes اللي عايزين بيانات Heart Rate موثوقة ويستخدموا التدريب بالـ Zones بشكل جاد.',
  },
  {
    rank: 2,
    name: 'Garmin HRM-Pro Plus',
    badge: 'Best for Garmin Users',
    price: 'Premium',
    connectivity: 'Bluetooth + ANT+',
    battery: 'بطارية طويلة',
    memory: 'نعم',
    waterproof: 'نعم',
    compatibility: 'Garmin Ecosystem',
    bestFor: 'مستخدمي Garmin',
    href: '/products?brand=Garmin',
    pros: ['مناسب جدًا لمستخدمي Garmin', 'يدعم Running Dynamics مع الأجهزة المتوافقة', 'يدعم تخزين بيانات التمرين', 'مفيد للعدائين الجادين'],
    cons: ['السعر أعلى من الـ Entry-Level Straps', 'جزء من قيمته يظهر مع Garmin Ecosystem'],
    verdict: 'لو عندك Garmin Watch بالفعل وعايز تستفيد من الـ Ecosystem بشكل أكبر، ده اختيار منطقي.',
  },
  {
    rank: 3,
    name: 'Wahoo TRACKR HR',
    badge: 'Best Rechargeable Option',
    price: 'حوالي 8,500 EGP',
    connectivity: 'Bluetooth + ANT+',
    battery: '100+ ساعة',
    memory: 'حسب الاستخدام',
    waterproof: 'مقاوم للماء',
    compatibility: 'Wahoo / Garmin / Apps',
    bestFor: 'اللي مش عايز يغيّر بطاريات',
    href: '/products?brand=Wahoo',
    pros: ['بطارية قابلة لإعادة الشحن', 'مناسب للـ Running والـ Cycling', 'يدعم Bluetooth وANT+', 'اختيار جيد لو مش عايز بطاريات تقليدية'],
    cons: ['أقل انتشارًا من Polar وGarmin', 'اختيار الـ Ecosystem مهم قبل الشراء'],
    verdict: 'اختيار مناسب لو أهم حاجة عندك هي الراحة وإعادة الشحن بدل تغيير البطارية.',
  },
  {
    rank: 4,
    name: 'Polar H9',
    badge: 'Best Entry Level',
    price: 'حوالي 7,500 EGP',
    connectivity: 'Bluetooth + ANT+',
    battery: 'حوالي 400 ساعة',
    memory: 'لا',
    waterproof: 'نعم',
    compatibility: 'Garmin / Polar / Apps',
    bestFor: 'أول Chest Strap',
    href: '/products?brand=Polar',
    pros: ['بداية ممتازة لدخول عالم Chest Straps', 'دقة مناسبة جدًا للتدريب بالـ Heart Rate', 'Bluetooth وANT+', 'مناسب للمبتدئين والعدائين اللي مش محتاجين Memory'],
    cons: ['لا توجد ذاكرة داخلية', 'يحتاج جهازًا متصلًا أثناء التمرين لتسجيل البيانات'],
    verdict: 'لو أول مرة تجرب Chest Strap ومش محتاج Features متقدمة، الـ H9 نقطة بداية قوية.',
  },
]

const quickPicks = [
  { need: 'عايز أفضل اختيار شامل', pick: 'Polar H10', reason: 'دقة + Memory + توافق واسع' },
  { need: 'عندي Garmin Watch', pick: 'Garmin HRM-Pro Plus', reason: 'تكامل قوي مع Garmin' },
  { need: 'عايز Rechargeable Strap', pick: 'Wahoo TRACKR HR', reason: 'بطارية قابلة لإعادة الشحن' },
  { need: 'أول مرة أشتري Chest Strap', pick: 'Polar H9', reason: 'بداية قوية بدون Features زائدة' },
]

const howToChoose = [
  { title: 'لو أنت Beginner', body: 'ابدأ بالأساسيات. لو عندك Watch بالفعل، استخدمها الأول. لو بدأت تهتم بالـ Heart Rate Zones، Entry-Level Chest Strap ممكن يكون أول Upgrade منطقي.' },
  { title: 'لو هدفك Zone Training', body: 'اختيار Chest Strap موثوق هيكون أكثر منطقية لأنك بتعتمد على Heart Rate Data أثناء التدريب بدل الاعتماد على الإحساس فقط.' },
  { title: 'لو بتتمرن Intervals أو HIIT', body: 'الـ Rapid Changes في Heart Rate هي واحدة من الحالات اللي Chest Strap فيها يكون مفيد جدًا مقارنة بالـ Wrist Optical Sensors.' },
  { title: 'لو بتعمل Cycling', body: 'ركز على Compatibility مع الـ Bike Computer أو الـ Training App اللي بتستخدمه، وتأكد إن الـ Strap يدعم Bluetooth أو ANT+ المطلوب.' },
  { title: 'لو عندك Garmin', body: 'لو أنت بالفعل داخل Garmin Ecosystem، اختار Strap يحقق أكبر استفادة من الـ Features المتاحة على ساعتك.' },
]

const faqs: FaqItem[] = [
  { q: 'هل أحتاج Heart Rate Strap لو عندي Smartwatch؟', a: 'مش بالضرورة. لو استخدامك Fitness عام أو Easy Runs، الـ Optical HR في الساعة ممكن يكون كافي. لكن لو بتتمرن باستخدام Heart Rate Zones أو بتعمل Intervals وHIIT أو بتحضر لسباق، الـ Chest Strap بيديك قراءة أسرع وأكثر ثباتًا خصوصًا أثناء تغير شدة التمرين.' },
  { q: 'ليه Chest Strap أدق من الـ Optical HR؟', a: 'الـ Smartwatch بتستخدم Optical Sensors لقياس تدفق الدم من خلال الجلد، بينما الـ Chest Strap يقيس النشاط الكهربائي للقلب. ده بيخلي الـ Chest Strap مناسب جدًا للحالات اللي فيها Heart Rate بيتغير بسرعة زي Intervals وSprints.' },
  { q: 'هل Polar H9 يشتغل مع Garmin؟', a: 'الـ Polar H9 بيدعم Bluetooth وANT+، وبالتالي يمكن استخدامه مع أجهزة وتطبيقات متوافقة. لكن لازم تتأكد من Compatibility الخاصة بموديل Garmin بتاعك قبل الشراء.' },
  { q: 'هل Polar H10 مناسب للـ Cycling؟', a: 'أيوه. الـ Chest Straps مناسبة جدًا للـ Running والـ Cycling والـ HIIT لأنها بتوفر Heart Rate Data مستمرة أثناء التمرين.' },
  { q: 'هل Chest Strap مناسب للمبتدئين؟', a: 'أيوه، لكن مش لازم تشتري أغلى موديل. لو لسه بتبدأ ومحتاج فقط بيانات Heart Rate موثوقة، Entry-Level Strap زي Polar H9 ممكن يكون كافي جدًا.' },
  { q: 'هل أحتاج Chest Strap لو أنا بجري مرتين أو ثلاثة في الأسبوع؟', a: 'مش بالضرورة. لو هدفك مجرد الحركة واللياقة العامة، ممكن تبدأ بالـ Watch أو Phone الموجود عندك. الـ Chest Strap يصبح أكثر فائدة لما تبدأ تستخدم Heart Rate Zones أو Structured Training.' },
  { q: 'إيه أهم حاجة أركز عليها قبل شراء Chest Strap؟', a: 'ركز على ثلاثة أشياء: Compatibility مع ساعتك أو الـ App، طريقة الاتصال Bluetooth أو ANT+، والـ Features اللي تحتاجها فعلًا مثل Memory أو Running Dynamics أو Rechargeable Battery.' },
  { q: 'أقدر أطلب موديل مش موجود على الموقع؟', a: 'أيوه. Pulse Gear عنده Product Request functionality، فتقدر تبعت الموديل اللي بتدور عليه وإحنا نشوف إمكانية توفيره ليك.' },
]

const toc = [
  { id: 'why-heart-rate', label: 'ليه Heart Rate Monitoring مهم؟' },
  { id: 'chest-straps', label: 'Best Chest Straps' },
  { id: 'specs', label: 'مقارنة المواصفات' },
  { id: 'quick-picks', label: 'اختار بسرعة' },
  { id: 'how-to-choose', label: 'إزاي تختار؟' },
  { id: 'do-you-need-it', label: 'هل فعلًا محتاج Chest Strap؟' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
]

export default function BestHeartRateMonitorsPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="مش كل Runner محتاج أغلى Heart Rate Monitor في السوق. المهم تعرف أنت محتاج إيه فعلًا، وهل الـ Chest Strap هيفرق في تدريبك ولا الـ Watch الموجودة عندك كفاية."
      toc={toc}
      related={['gear-guide/beginners-guide', 'gear-guide/best-chest-straps', 'training-guide/heart-rate-zones']}
      cta={{
        title: 'اختار الـ Gear اللي يخدم تدريبك',
        body: 'مش متأكد أنهي Heart Rate Monitor مناسب ليك؟ شوف المنتجات المتاحة أو ابعتلنا الموديل اللي بتدور عليه. تقدر كمان تطلب Product مش موجود حاليًا على الموقع.',
        href: '/products?category=Heart%20Rate%20Straps',
        label: 'Browse heart rate monitors',
      }}
    >
      <Callout tone="tip" title="أهم سؤال قبل ما تشتري">
        هل أنت محتاج Accuracy أعلى لأنك بتتدرب بالـ Heart Rate Zones، ولا أنت لسه في مرحلة إنك تبني عادة الجري؟ لو الإجابة الثانية، مش لازم تشتري Gear غالي من البداية.
      </Callout>

      <Callout tone="egypt" title="Pulse Gear Egypt">
        بنساعد العدائين في مصر يختاروا Training Gear مناسب لمستواهم وميزانيتهم، مع إمكانية طلب منتجات مش موجودة حاليًا على الموقع من خلال{' '}
        <Link href="/request-product" className="font-bold text-white underline-offset-4 hover:underline">Request a Product</Link>.
      </Callout>

      <Section id="why-heart-rate" title="Why heart rate monitoring matters" titleAr="ليه Heart Rate Monitoring مهم؟">
        <P>واحدة من أكبر مشاكل العدائين هي إنهم أحيانًا بيجروا الـ Easy Runs أسرع من اللازم، أو مش عارفين إذا كانوا فعلًا في الـ Zone المطلوبة.</P>
        <P>Heart Rate Monitoring بيساعدك تحول التدريب من مجرد إحساس بالجهد إلى بيانات تقدر تعتمد عليها.</P>
        <Callout tone="fact" title="الفكرة الأساسية">
          الفكرة مش إنك تشتري جهاز عشان تجمع أرقام أكتر. الفكرة إن البيانات تساعدك تعرف إمتى تزود شدة التمرين وإمتى تهدي وتحافظ على الـ Recovery.
        </Callout>
      </Section>

      <Section id="chest-straps" title="Best chest straps" titleAr="أفضل الـ Chest Straps">
        <P>أفضل الاختيارات لو هدفك Heart Rate Training أكثر دقة واتصال موثوق. الأسعار استرشادية وبتتغير حسب التوفر.</P>
        <div className="space-y-5">
          {chestStraps.map((s) => (
            <PickCard
              key={s.name}
              rank={s.rank}
              name={s.name}
              badge={s.badge}
              priceBand={s.price}
              bestFor={s.bestFor}
              summary={`الحكم: ${s.verdict}`}
              pros={s.pros}
              cons={s.cons}
              href={s.href}
            />
          ))}
        </div>
      </Section>

      <Section id="specs" title="Specs side by side" titleAr="مقارنة المواصفات">
        <CompareTable
          caption="Chest strap specs compared"
          columns={chestStraps.map((s) => s.name)}
          highlightColumn={0}
          rows={[
            { label: 'Price', cells: chestStraps.map((s) => s.price) },
            { label: 'Connectivity', cells: chestStraps.map((s) => s.connectivity) },
            { label: 'Battery', cells: chestStraps.map((s) => s.battery) },
            { label: 'Memory', cells: chestStraps.map((s) => s.memory) },
            { label: 'Waterproof', cells: chestStraps.map((s) => s.waterproof) },
            { label: 'Compatibility', cells: chestStraps.map((s) => s.compatibility) },
          ]}
        />
        <Callout tone="warning" title="ملاحظة على الأسعار">السعر استرشادي ويتغير حسب التوفر.</Callout>
      </Section>

      <Section id="quick-picks" title="Quick picks" titleAr="اختار بسرعة">
        <CompareTable
          caption="Quick picks by need"
          columns={['الاختيار', 'السبب']}
          highlightColumn={0}
          rows={quickPicks.map((r) => ({ label: r.need, cells: [<Strong key="pick">{r.pick}</Strong>, r.reason] }))}
        />
      </Section>

      <Section id="how-to-choose" title="How to choose the right one" titleAr="إزاي تختار الـ Heart Rate Monitor الصح؟">
        <BulletList
          items={howToChoose.map((item) => (
            <>
              <Strong>{item.title}:</Strong> {item.body}
            </>
          ))}
        />
      </Section>

      <Section id="do-you-need-it" title="Do you really need a chest strap?" titleAr="هل فعلًا محتاج Chest Strap؟">
        <Callout tone="warning" title="لو لسه بتسأل السؤال ده">
          متشتريش على طول. جرّب الأول تفهم طريقة تدريبك، وهل أنت بتستخدم Heart Rate Zones فعلًا، وهل الـ Optical Sensor الموجود عندك بيحقق احتياجاتك.
        </Callout>
        <P>الهدف من الـ Gear مش إنك تجمع أجهزة أكتر. الهدف إن الجهاز يساعدك تتدرب بشكل أذكى.</P>
      </Section>

      <FaqList title="الأسئلة الشائعة" items={faqs} />
    </ArticleShell>
  )
}
