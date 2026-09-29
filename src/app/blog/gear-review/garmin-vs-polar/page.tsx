// src/app/blog/gear-review/garmin-vs-polar/page.tsx
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
  CompareTable,
  FaqList,
  type FaqItem,
} from '@/components/blog'

const SLUG = 'gear-review/garmin-vs-polar'

export const metadata: Metadata = articleMetadata(SLUG)

type Winner = 'garmin' | 'polar' | 'tie'
type Row = { category: string; garmin: string; polar: string; winner: Winner }

const WINNER_LABEL: Record<Winner, string> = {
  garmin: 'Garmin يكسب',
  polar: 'Polar يكسب',
  tie: 'تعادل',
}

const comparison: Row[] = [
  {
    category: 'GPS Accuracy',
    garmin: 'Multi-Band GPS، الأدق في السوق حتى في الأماكن المغلقة والمدن الكبيرة. بيـ Lock على الـ Signal بسرعة جداً.',
    polar: 'دقيق جداً وكويس بس بياخد وقت أطول شوية في الـ Signal Lock مقارنةً بـ Garmin.',
    winner: 'garmin',
  },
  {
    category: 'Heart Rate Accuracy',
    garmin: 'الـ Optical HR كويس جداً وموثوق بس Polar لسه أدق منه في الـ Wrist-Based HR.',
    polar: 'الأفضل في الـ Optical HR على الـ Wrist، تقنية PrecisionPrime بتديك دقة قريبة من الـ Chest Strap.',
    winner: 'polar',
  },
  {
    category: 'Training Features',
    garmin: 'Training Readiness والـ HRV Status والـ Race Predictor والـ Daily Suggested Workouts، أكتر Features في السوق بفرق كبير.',
    polar: 'Running Program والـ Nightly Recharge والـ FitSpark Workout Guidance، ممتازة ومفيدة بس أقل عمقاً من Garmin.',
    winner: 'garmin',
  },
  {
    category: 'Battery Life',
    garmin: 'الـ Battery Life من أحسن حاجة في Garmin، الـ GPS Mode بيديك من 20 لـ 150 ساعة أو أكتر حسب الموديل.',
    polar: 'كويس ومحترم بس مش بنفس مستوى Garmin في الـ High-End Models.',
    winner: 'garmin',
  },
  {
    category: 'App & Ecosystem',
    garmin: 'Garmin Connect، الأغنى في الـ Data والـ Analytics. Third-Party Integration ممتاز مع Strava وTrainingPeaks وغيرهم.',
    polar: 'Polar Flow، نظيفة وسهلة الاستخدام بس الـ Data أقل عمقاً وتفصيلاً من Garmin Connect.',
    winner: 'garmin',
  },
  {
    category: 'Design & Comfort',
    garmin: 'تصميم رياضي قوي ومتين، بعض الـ High-End Models زي الـ Fenix تقيلة شوية على المعصم.',
    polar: 'أخف وأريح بشكل عام، مناسب للبس اليومي والتدريب بنفس الراحة.',
    winner: 'polar',
  },
  {
    category: 'Value for Money',
    garmin: 'الـ Features اللي بتاخدها مقابل السعر ممتازة خصوصاً في الـ Mid-Range Models زي الـ Forerunner Series.',
    polar: 'الـ Mid-Range Models بتديك HR دقيق جداً بسعر أقل، Value كويسة لو الـ HR هو أهم حاجة عندك.',
    winner: 'tie',
  },
]

const garminProfiles = [
  'لو بتتدرب بجدية وعايز أعمق Training Data في السوق',
  'لو الـ GPS Accuracy هي أهم حاجة عندك',
  'لو بتعمل Ultra Races أو Long Distance وعايز Battery تصحبك',
  'لو عايز Ecosystem غني مع Strava وTrainingPeaks',
  'لو بتستعد لـ Marathon أو Triathlon وعايز كل الـ Tools',
]

const polarProfiles = [
  'لو الـ Heart Rate Accuracy هي أهم حاجة عندك',
  'لو عايز Watch خفيفة ومريحة في اليومي والتدريب',
  'لو مبتدئ وعايز Watch تعلمك تتدرب صح من الأول',
  'لو الـ Sleep Tracking والـ Recovery مهمين ليك',
  'لو عايز HR دقيق جداً بـ Budget أقل من الـ Garmin المقابل',
]

const faqs: FaqItem[] = [
  {
    q: 'Which has the more accurate wrist heart rate, Garmin or Polar?',
    qAr: 'مين أدق في الـ Wrist HR، Garmin ولا Polar؟',
    a: 'Polar. Its PrecisionPrime optical sensor gets closer to chest strap readings than Garmin Elevate, especially at steady efforts. For intervals, both brands still benefit from pairing a chest strap.',
    aAr: 'Polar. حساس PrecisionPrime بيقرب من قراءات الـ Chest Strap أكتر من Garmin Elevate، خصوصاً في المجهود الثابت. في الـ Intervals، البراندين بيستفيدوا من توصيل Chest Strap.',
  },
  {
    q: 'Which brand has the better app?',
    qAr: 'مين عنده App أحسن؟',
    a: 'Garmin Connect is deeper and integrates with more third-party services such as Strava and TrainingPeaks. Polar Flow is cleaner and easier to read, but shows less detail.',
    aAr: 'Garmin Connect أغنى في الـ Data وبيتكامل مع خدمات أكتر زي Strava و TrainingPeaks. Polar Flow أنضف وأسهل في القراءة بس التفاصيل فيه أقل.',
  },
  {
    q: 'Is Garmin worth the extra money?',
    qAr: 'Garmin يستاهل الفرق في السعر؟',
    a: 'If you use the training features, GPS accuracy and long battery, yes. If heart rate accuracy and comfort are what matter most, a mid-range Polar gives you that for less.',
    aAr: 'لو هتستخدم الـ Training Features والـ GPS الدقيق والبطارية الطويلة، أيوه. لو دقة الـ HR والراحة هما الأهم، Polar في الـ Mid-Range بيديك ده بسعر أقل.',
  },
]

const toc = [
  { id: 'intro', label: 'الصراع الحقيقي' },
  { id: 'compare', label: 'المقارنة التفصيلية' },
  { id: 'score', label: 'النتيجة النهائية' },
  { id: 'who', label: 'مين يشتري إيه؟' },
  { id: 'verdict', label: 'الكلام الأخير' },
  { id: 'faq', label: 'FAQ' },
]

export default function GarminVsPolarPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="Garmin والـ Polar، الاتنين Brands عملاقة في عالم الـ Running Watches. بس الفرق بينهم مش بس في الشكل أو السعر، كل واحد فيهم بيخدم نوع معين من الـ Runners. خليني أوريك الفرق الحقيقي عشان تختار صح."
      toc={toc}
      related={['gear-review/heart-rate-strap-vs-optical', 'gear-guide/best-gps-watches', 'training-guide/heart-rate-zones']}
      cta={{
        title: 'عايز Garmin أو Polar؟',
        body: 'عندنا في Pulse Gear مجموعة مختارة من الـ Running Watches، كلها أصلية 100% ومتاحة للشحن لأي مكان في مصر.',
        href: '/products?category=Fitness%20Watches',
        label: 'Browse running watches',
      }}
    >
      <Section id="intro" title="The real fight" titleAr="الصراع الحقيقي">
        <P>
          لو بتدور على Running Watch وضيّعت ساعات في المقارنات على الإنترنت، أنت مش لوحدك. Garmin والـ Polar من أكتر الـ Brands
          اللي بتتسأل عنهم وكلاهما بيستاهل كل جنيه فيه.
        </P>
        <P>
          بس الحقيقة؟ مفيش واحد فيهم أحسن بشكل مطلق. كل واحد فيهم بيتفوق في حاجات معينة، والاختيار الصح بيعتمد على{' '}
          <Strong>أنت عايز إيه بالظبط</Strong>.
        </P>
      </Section>

      <Section id="compare" title="Detailed comparison" titleAr="المقارنة التفصيلية">
        <P>خلينا نقارن الاتنين في كل Category مهمة، وفي الآخر نشوف مين فاز.</P>
        <CompareTable
          caption="Garmin vs Polar by category"
          columns={['Garmin', 'Polar', 'Winner']}
          rows={comparison.map((r) => ({
            label: r.category,
            cells: [r.garmin, r.polar, <Strong key="w">{WINNER_LABEL[r.winner]}</Strong>],
          }))}
        />
      </Section>

      <Section id="score" title="Final score" titleAr="النتيجة النهائية">
        <StatCards
          columns={2}
          items={[
            { value: '4', label: 'Garmin · Categories won', sub: 'GPS Accuracy · Training Features · Battery Life · App & Ecosystem', tone: 'blue' },
            { value: '2', label: 'Polar · Categories won', sub: 'Heart Rate Accuracy · Design & Comfort · تعادل في Value for Money', tone: 'brand' },
          ]}
        />
        <Callout tone="fact" title="الـ Numbers مش بتحكي الحكاية كلها">
          Garmin فاز في عدد أكبر من الـ Categories، بس لو الـ Heart Rate Accuracy هي أهم حاجة عندك، Polar هيديك حاجة مش هتلاقيها في
          أي Watch تانية بنفس المستوى.
        </Callout>
      </Section>

      <Section id="who" title="Who should buy what?" titleAr="مين يشتري إيه؟">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="card space-y-4 p-6">
            <h3 className="text-sm font-black uppercase text-sky-400" dir="auto">اشتري Garmin لو...</h3>
            <BulletList items={garminProfiles} />
          </div>
          <div className="card space-y-4 p-6">
            <h3 className="text-sm font-black uppercase text-brand-soft" dir="auto">اشتري Polar لو...</h3>
            <BulletList items={polarProfiles} />
          </div>
        </div>
      </Section>

      <Section id="verdict" title="The last word" titleAr="الكلام الأخير">
        <P>
          لو سألتني بصراحة؟ <Strong>Garmin هو الـ Default Choice</Strong> لأغلب الـ Runners، الـ Ecosystem الغني والـ GPS الدقيق
          والـ Training Features العميقة بتخليه الأنسب لأي حد بيتدرب بجدية.
        </P>
        <P>
          بس لو أنت شخص بيهتم بالـ Heart Rate فوق أي حاجة تانية، أو عايز Watch خفيفة ومريحة في اليومي، <Strong>Polar هيبهرك</Strong>{' '}
          بدقة الـ HR وخفة الـ Design.
        </P>
        <Callout tone="tip" title="الحكم النهائي">
          في الآخر الاتنين Watches عملاقة، والغلط الوحيد هو إنك تختار بناءً على الـ Brand اسمه مش على احتياجاتك الحقيقية.
        </Callout>
        <P>
          عايز موديل معين مش موجود عندنا؟{' '}
          <Link href="/request-product" className="font-semibold text-brand-soft hover:text-white">
            اطلبه من صفحة Request a Product
          </Link>
          . وتقدر تشوف{' '}
          <Link href="/products?brand=Garmin" className="font-semibold text-brand-soft hover:text-white">ساعات Garmin</Link> أو{' '}
          <Link href="/products?brand=Polar" className="font-semibold text-brand-soft hover:text-white">ساعات Polar</Link> المتاحة دلوقتي.
        </P>
      </Section>

      <FaqList items={faqs} />
    </ArticleShell>
  )
}
