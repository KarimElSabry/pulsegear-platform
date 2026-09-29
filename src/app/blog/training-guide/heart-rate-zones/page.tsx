// src/app/blog/training-guide/heart-rate-zones/page.tsx
// Reference article built on the shared blog kit (src/components/blog).

import type { Metadata } from 'next'
import { articleMetadata } from '@/lib/blog-meta'
import {
  ArticleShell,
  Section,
  P,
  Strong,
  Callout,
  StatCards,
  MeterCard,
  CompareTable,
  FaqList,
} from '@/components/blog'

const SLUG = 'training-guide/heart-rate-zones'

export const metadata: Metadata = articleMetadata(SLUG)

const zones = [
  { title: 'Zone 1 · Active Recovery', badge: '50–60% Max HR', tone: 'green' as const, percent: 20,
    description: 'مجهود خفيف جداً. جسمك بيتعافى وبيحرق الدهون كـ fuel أساسي. تقدر تتكلم جمل كاملة من غير ما تلهث.',
    meta: [{ label: 'مثال', value: 'مشي خفيف، عجلة هادية' }, { label: 'الفايدة', value: 'Recovery + fat burning' }] },
  { title: 'Zone 2 · Aerobic Base', badge: '60–70% Max HR', tone: 'blue' as const, percent: 40,
    description: 'أهم zone في التدريب. بتبني الـ aerobic base وبتحسّن كفاءة الجسم في حرق الدهون. ده سر الـ elite athletes اللي محدش بيحكيه.',
    meta: [{ label: 'مثال', value: 'جري هادي، تقدر تتكلم جمل قصيرة' }, { label: 'الفايدة', value: 'Endurance + efficiency' }] },
  { title: 'Zone 3 · Aerobic Threshold', badge: '70–80% Max HR', tone: 'yellow' as const, percent: 60,
    description: 'مجهود متوسط. التنفس بيتقل وبتتكلم كلمات مش جمل. بيحسّن الـ cardiovascular efficiency، بس ممكن يبقى trap لو اتدربت فيه كتير.',
    meta: [{ label: 'مثال', value: 'Tempo run' }, { label: 'الفايدة', value: 'Cardio efficiency' }] },
  { title: 'Zone 4 · Lactate Threshold', badge: '80–90% Max HR', tone: 'orange' as const, percent: 80,
    description: 'مجهود عالي. جسمك بيبدأ يراكم lactate. بيحسّن السرعة والـ race performance. صعب تتكلم، كلمتين بالعافية.',
    meta: [{ label: 'مثال', value: 'Intervals، race pace' }, { label: 'الفايدة', value: 'Speed + performance' }] },
  { title: 'Zone 5 · Maximum Effort', badge: '90–100% Max HR', tone: 'red' as const, percent: 100,
    description: 'أقصى طاقة ممكنة. مش هتكمل أكتر من دقيقتين أو تلاتة. بيبني الـ peak power والسرعة القصوى. مش للاستخدام اليومي.',
    meta: [{ label: 'مثال', value: 'Sprints، max intervals' }, { label: 'الفايدة', value: 'Peak power' }] },
]

const faqs = [
  { q: 'Is 220 minus age accurate?', qAr: 'معادلة 220 ناقص العمر دقيقة؟',
    a: 'It is an estimate with a margin of about ±10 bpm. A field test (a hard 3-minute effort at the end of a warm-up, twice) or a lab test is more accurate. Use the formula to start, then correct it with real data from your strap.',
    aAr: 'تقدير بهامش خطأ حوالي ±10 نبضة. الـ field test (مجهود قوي 3 دقايق بعد الإحماء، مرتين) أو الـ lab test أدق. ابدأ بالمعادلة وصحّحها ببيانات حقيقية من الـ strap.' },
  { q: 'Do I need a chest strap for zone training?', qAr: 'محتاج chest strap عشان أتدرب بالـ zones؟',
    a: 'For easy runs a wrist sensor is fine. For intervals and tempo work a chest strap reacts faster and does not lose the signal when you sweat or grip your arms, which is exactly when the zone boundary matters.',
    aAr: 'في الجري الهادي حساس المعصم كفاية. في الـ intervals والـ tempo الـ chest strap أسرع وأدق ومش بيضيّع الإشارة مع العرق، وده بالظبط الوقت اللي حدود الـ zone فيه مهمة.' },
  { q: 'Why does my Zone 2 pace feel embarrassingly slow?', qAr: 'ليه الـ pace بتاع Zone 2 بطيء بشكل محرج؟',
    a: 'Because your aerobic base is still being built. That is the point. Within 8 to 12 weeks the same heart rate produces a faster pace. Do not speed up to fix the number, let the number fix itself.',
    aAr: 'لأن الـ aerobic base لسه بيتبني. ده الهدف أصلاً. خلال 8 لـ 12 أسبوع نفس النبض هيديك pace أسرع. متزوّدش السرعة عشان تصلّح الرقم، سيب الرقم يتصلّح لوحده.' },
]

const toc = [
  { id: 'what', label: 'إيه هي الـ Heart Rate Zones؟' },
  { id: 'maxhr', label: 'إزاي تحسب الـ Max HR' },
  { id: 'zones', label: 'الـ 5 Zones بالتفصيل' },
  { id: 'eighty-twenty', label: 'قاعدة الـ 80/20' },
  { id: 'mistakes', label: 'أكتر الأخطاء الشائعة' },
  { id: 'faq', label: 'FAQ' },
]

export default function HeartRateZonesPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="معظم الناس بتتدرب غلط: بتتعب أوي في الأيام السهلة وبتفضل ضعيفة في الأيام الصعبة. الـ Heart Rate Zones هي الأداة اللي بتحوّل التدريب من تخمين لقرار."
      toc={toc}
      related={['training-guide/zone-2-training', 'training-guide/claude-kailo-free-running-coach', 'gear-review/heart-rate-strap-vs-optical']}
      cta={{
        title: 'جاهز تتدرب بالـ Heart Rate Zones؟',
        body: 'محتاج heart rate strap دقيق عشان تفضل في الـ zone الصح. شوف مجموعة الـ chest straps والـ GPS watches اللي بنوصّلها في مصر.',
        href: '/products?category=Heart%20Rate%20Straps',
        label: 'Browse heart rate monitors',
      }}
    >
      <Section id="what" title="What are heart rate zones?" titleAr="إيه هي الـ Heart Rate Zones؟">
        <P>
          الـ Heart Rate Zones هي نطاقات شدة محسوبة كنسبة من الـ <Strong>Maximum Heart Rate</Strong> بتاعك.
          كل zone بيحفّز تكيّف فسيولوجي مختلف: واحد بيبني القاعدة الهوائية، واحد بيرفع عتبة الـ lactate، وواحد بيبني السرعة القصوى.
        </P>
        <P>
          التدريب من غير zones زي إنك تسوق عربية من غير عداد سرعة. ممكن توصل، بس مش هتعرف إنت ماشي بكفاءة ولا بتحرق نفسك.
        </P>
        <Callout tone="fact" title="حقيقة مهمة">
          الـ elite athletes بيقضوا حوالي <Strong>80% من تدريبهم</Strong> في Zone 1 و Zone 2 بس. مش كل يوم شدة عالية.
        </Callout>
      </Section>

      <Section id="maxhr" title="How to estimate your Max HR" titleAr="إزاي تحسب الـ Max HR بتاعك؟">
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-muted">المعادلة</span>
          <p className="text-3xl font-black text-white md:text-4xl" dir="ltr">Max HR ≈ 220 − age</p>
          <p className="text-sm text-muted-strong" dir="rtl">لو عندك 30 سنة: Max HR ≈ 190 bpm</p>
        </div>
        <StatCards
          columns={4}
          items={[
            { value: '200', label: 'Age 20', sub: 'bpm' },
            { value: '190', label: 'Age 30', sub: 'bpm' },
            { value: '180', label: 'Age 40', sub: 'bpm' },
            { value: '170', label: 'Age 50', sub: 'bpm' },
          ]}
        />
        <Callout tone="warning" title="تقدير مش قياس">
          المعادلة بتغلط بحوالي ±10 نبضة. لو عندك chest strap، اعمل field test: بعد إحماء كويس، اجري 3 دقايق بأقصى جهد،
          ارتاح دقيقتين، وكرّر. أعلى رقم تشوفه هو الـ Max HR الحقيقي بتاعك.
        </Callout>
      </Section>

      <Section id="zones" title="The five zones in detail" titleAr="الـ 5 Heart Rate Zones بالتفصيل">
        <div className="space-y-4">
          {zones.map((z) => (
            <MeterCard key={z.title} {...z} />
          ))}
        </div>
      </Section>

      <Section id="eighty-twenty" title="The 80/20 rule" titleAr="قاعدة الـ 80/20: سر الـ Elite Athletes">
        <StatCards
          items={[
            { value: '80%', label: 'Easy days', sub: 'Zone 1–2 · روح أبطأ مما تتخيل', tone: 'blue' },
            { value: '10%', label: 'Tempo days', sub: 'Zone 3 · مجهود متحكم فيه', tone: 'accent' },
            { value: '10%', label: 'Hard days', sub: 'Zone 4–5 · اديها كل حاجة', tone: 'brand' },
          ]}
        />
        <CompareTable
          caption="Weekly example for 4 runs"
          columns={['Easy', 'Long run', 'Tempo', 'Intervals']}
          rows={[
            { label: 'Zone', cells: ['Z1–Z2', 'Z2', 'Z3', 'Z4–Z5'] },
            { label: 'Talk test', cells: ['جمل كاملة', 'جمل قصيرة', 'كلمات', 'كلمة واحدة'] },
            { label: 'Duration', cells: ['30–45 min', '60–120 min', '20–30 min at effort', '6–10 × 2–3 min'] },
            { label: 'Frequency', cells: ['2×/week', '1×/week', '1×/2 weeks', '1×/week'] },
          ]}
        />
      </Section>

      <Section id="mistakes" title="Common mistakes" titleAr="أكتر الأخطاء الشائعة">
        <div className="space-y-3">
          <Callout tone="danger" title="التدريب في Zone 3 طول الوقت">
            Zone 3 مش سهل ومش صعب، بيتعبك من غير ما يفيدك كتير. اتجنبه كـ default واخليه لجلسات الـ tempo المقصودة بس.
          </Callout>
          <Callout tone="danger" title="مش بتتدرب في Zone 2 كفاية">
            Zone 2 شكله بطيء أوي، بس ده الأساس الحقيقي للـ endurance. الجري الهادي هو اللي بيخلي الجري السريع ممكن.
          </Callout>
          <Callout tone="danger" title="كل يوم تدريب شديد">
            جسمك بيتحسن في وقت الراحة مش في وقت التدريب. الـ recovery جزء من الخطة، مش استراحة منها.
          </Callout>
        </div>
        <Callout tone="egypt" title="في حر مصر">
          النبض بيعلى 5 لـ 10 نبضات على نفس الـ pace لما الحرارة تعدّي 30 درجة. اتدرب بالنبض مش بالـ pace في الصيف، واقبل إن الـ Zone 2 هيبقى أبطأ. ده مش تراجع، ده فيزياء.
        </Callout>
      </Section>

      <FaqList items={faqs} />
    </ArticleShell>
  )
}
