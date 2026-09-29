// src/app/blog/training-guide/claude-kailo-free-running-coach/page.tsx
// Level 1 (free): Kailo connector + claude.ai. Verified against kailo.fit on 2026-09-29.

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
  CompareTable,
  FaqList,
  PromptBlock,
} from '@/components/blog'

const SLUG = 'training-guide/claude-kailo-free-running-coach'
const PAID_URL = '/blog/training-guide/claude-ai-running-coach-setup'
const LEVEL2_URL = '/blog/training-guide/claude-coach-watch-telegram'

export const metadata: Metadata = articleMetadata(SLUG, {
  keywords: ['Kailo Claude', 'Claude running coach free', 'Garmin Claude MCP', 'kailo.fit', 'AI running coach Egypt', 'Claude AI', 'كوتش جري AI'],
})

const testPrompt = `Using the Kailo tools that are now connected, tell me:
1. How many runs I did in the last 7 days and the total kilometres.
2. My most recent run: date, distance, time, average pace, average heart rate.
3. My last 7 nights of sleep and my HRV trend, if you can see them.
Do not estimate anything. If a tool returns no data, or you do not see any
Kailo tools at all, say exactly that so I can fix the connection.`

const dashboardPrompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUNNING ANALYSIS, DASHBOARD & TRAINING PLAN (Kailo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

My data is connected through the Kailo connector.
Pull everything available for the last 6 weeks now (activities, sleep,
HRV, heart rate). Note: the free Kailo plan only exposes ~6 weeks, so
do not ask me for older data.

SECTION 1 — MY GOAL
Event / goal:        [e.g., Cairo Marathon / Wadi Degla 10K / build base]
Race or target date: [exact date, or "no fixed date"]
Target outcome:      [e.g., finish / sub-50:00 / sub-1:45 half]
Constraints:         [injuries, max hours per week, days unavailable]
Experience level:    [e.g., returning after 6 months / 3 races completed]

SECTION 2 — ANALYSIS (plain language, never invent a number)
1. Volume trend: weekly km and run count. Flag any week-over-week jump
   above 10% as injury risk.
2. Pace trend at a comparable heart rate: improving, flat, declining?
3. Intensity split: easy / moderate / hard. Flag hard > 20% of volume.
4. Recovery: resting HR, HRV and sleep trend, only if the data exists.
5. Current fitness estimate from my best recent effort (show the inputs).
6. Gap analysis against my goal and date. If it is not realistic, say so
   and tell me what is.

SECTION 3 — DASHBOARD
Build one self-contained HTML file (inline CSS and JS, opens offline).
Include: countdown + one-line readiness verdict, stat cards (weekly km,
runs/week, longest run, predicted goal time), weekly volume bar chart,
pace-vs-HR trend chart, recovery panel if data exists, last 10 runs
table. Omit any panel with no data instead of showing zeros.

SECTION 4 — TRAINING PLAN
Week-by-week plan from today to the goal date (or a 10-week block).
Runs, session types, rest days, paces or HR zones derived from the
fitness estimate, progressive long run, 2-week taper if racing.

SECTION 5 — OUTPUT ORDER
A. Written analysis  B. dashboard.html  C. Plan table
D. One honest paragraph: am I on track and what is the one change to make now
E. One bold line, 10 words or fewer: my readiness verdict`

const weeklyPrompts = [
  { label: 'Weekly check-in', prompt: 'Look at my last 7 days in Kailo. Did I follow the plan? What should change for next week? Keep it to 8 lines.' },
  { label: 'Overtraining check', prompt: 'Using my last 21 days of runs, sleep and HRV from Kailo, am I showing signs of overtraining or under-recovery? Be direct.' },
  { label: 'Before a race', prompt: 'I race in [X] days. Based on my Kailo data, tell me exactly what to do and not do between now and the start line.' },
  { label: 'Refresh the dashboard', prompt: 'Pull my latest Kailo data and give me an updated dashboard.html with the same layout as before.' },
]

const faqs = [
  {
    q: 'Is it really free?', qAr: 'هو بجد ببلاش؟',
    a: 'Yes for this guide. Kailo’s Base plan is free and includes the Claude connector with the read tools. The free claude.ai plan allows one custom connector, which is all you need. Kailo Premium (about $10 a month) adds training plans, full history and deeper analysis, and you do not need it to follow these steps.',
    aAr: 'أيوه للـ guide ده. خطة Kailo الأساسية مجانية وفيها الـ Claude connector بأدوات القراءة. وخطة claude.ai المجانية بتسمح بـ custom connector واحد، وده كل اللي محتاجه. الـ Premium (حوالي 10 دولار في الشهر) بيضيف خطط تدريب وتاريخ كامل وتحليل أعمق، ومش محتاجه عشان تعمل الخطوات دي.',
  },
  {
    q: 'I only use Strava. Will this work?', qAr: 'أنا بستخدم Strava بس. هيشتغل؟',
    a: 'Partly. Strava no longer allows live AI reads through its API, so Kailo can only import a one-time Strava archive. You will get your history but not new runs automatically. If your watch is a Garmin, connect Garmin directly in Kailo and everything syncs live. Polar, COROS and Suunto users should use the intervals.icu route in Level 2.',
    aAr: 'جزئياً. Strava بقت متسمحش بقراءة مباشرة من الـ AI، فـ Kailo بيستورد أرشيف Strava مرة واحدة بس. هتاخد تاريخك بس مش الجري الجديد تلقائياً. لو ساعتك Garmin وصّل Garmin مباشرة في Kailo وكل حاجة هتتزامن لحظياً. Polar و COROS و Suunto يستخدموا طريقة intervals.icu في الـ Level 2.',
  },
  {
    q: 'Claude says it has no Kailo tools. What now?', qAr: 'Claude بيقول مفيش أدوات Kailo. أعمل إيه؟',
    a: 'Open Customize → Connectors in claude.ai and check that Kailo shows Connected, not just added. Then start a new chat, connectors attach per chat. If it still fails, open kailo.fit → Data → Linking and make sure at least one source (Garmin) is connected and has synced activities.',
    aAr: 'افتح Customize → Connectors في claude.ai واتأكد إن Kailo مكتوب عليها Connected مش بس متضافة. بعدين افتح شات جديد، الـ connectors بتتربط لكل شات. لو لسه، افتح kailo.fit → Data → Linking واتأكد إن مصدر واحد على الأقل (Garmin) متوصل وفيه activities.',
  },
  {
    q: 'Why do I not see sleep or HRV?', qAr: 'ليه مش شايف النوم أو الـ HRV؟',
    a: 'Garmin’s standard connection gives Kailo your activities but not sleep, HRV or all-day heart rate. Kailo has a separate "Garmin unlock" step on kailo.fit for that, where you sign in with your Garmin account inside Kailo. It is optional. Runs, pace and workout heart rate work without it.',
    aAr: 'الاتصال العادي بـ Garmin بيدي Kailo الـ activities بس، مش النوم أو الـ HRV أو النبض طول اليوم. Kailo عنده خطوة "Garmin unlock" منفصلة على kailo.fit بتسجّل فيها دخول Garmin جوه Kailo. دي اختيارية. الجري والـ pace ونبض التمرين شغالين من غيرها.',
  },
  {
    q: 'Does this need Claude Code or a laptop?', qAr: 'محتاج Claude Code أو لابتوب؟',
    a: 'No. Everything here runs in claude.ai in the browser or the Claude app, on a phone too. Claude Code (which needs a paid Claude plan) is only for the optional automatic morning update described in the paid Level 1 article.',
    aAr: 'لا. كل حاجة هنا بتشتغل في claude.ai من المتصفح أو من التطبيق، حتى من الموبايل. Claude Code (اللي محتاج خطة Claude مدفوعة) بس للـ auto-update الصباحي الاختياري الموجود في مقال الـ Level 1 المدفوع.',
  },
  {
    q: 'Is my data safe with Kailo?', qAr: 'بياناتي آمنة مع Kailo؟',
    a: 'Kailo is a small company. Their site says they do not train models on your Strava data and access is read-only. Treat it like any app you connect to Garmin: use a unique password, and if you do the Garmin unlock step, know that you are giving Kailo your Garmin login. If that bothers you, skip the unlock or use the self-hosted option in the comparison table.',
    aAr: 'Kailo شركة صغيرة. موقعهم بيقول إنهم مش بيدرّبوا موديلات على بياناتك وإن الوصول قراءة فقط. عامله زي أي app بتوصّله بـ Garmin: استخدم باسورد مختلف، ولو عملت خطوة الـ Garmin unlock اعرف إنك بتدي Kailo بيانات دخول Garmin بتاعتك. لو ده مضايقك، اتخطى الـ unlock أو استخدم الخيار الـ self-hosted في جدول المقارنة.',
  },
]

const toc = [
  { id: 'overview', label: 'هتعمل إيه في 10 دقايق' },
  { id: 'requirements', label: 'اللي محتاجه' },
  { id: 'step-kailo', label: '1. حساب Kailo + Garmin' },
  { id: 'step-claude', label: '2. وصّل Claude' },
  { id: 'step-test', label: '3. اختبار الاتصال' },
  { id: 'step-dashboard', label: '4. الـ Dashboard والخطة' },
  { id: 'step-routine', label: '5. الروتين الأسبوعي' },
  { id: 'limits', label: 'الحدود بصراحة' },
  { id: 'compare', label: 'Kailo ولا البدائل؟' },
  { id: 'faq', label: 'FAQ' },
]

export default function KailoFreeCoachPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="ده أرخص طريق لكوتش جري بالـ AI: Kailo مجاني، claude.ai مجاني، ومفيش حاجة تتسطّب. عشر دقايق من الموبايل و Claude بيقرأ جريك ونومك ونبضك ويبني لك dashboard وخطة."
      toc={toc}
      related={[PAID_URL.replace('/blog/', ''), LEVEL2_URL.replace('/blog/', ''), 'training-guide/heart-rate-zones']}
      cta={{
        title: 'الكوتش جاهز. الـ strap؟',
        body: 'Claude بيحلل النبض اللي ساعتك بتسجله. chest strap دقيق بيخلي التحليل ده يستاهل. شوف اللي عندنا وبنوصّله لباب بيتك.',
        href: '/products?category=Heart%20Rate%20Straps',
        label: 'Browse heart rate straps',
      }}
    >
      <Section id="overview" kicker="Level 1 · Free · Kailo + claude.ai" title="A free AI running coach in 10 minutes" titleAr="هتعمل إيه في الـ 10 دقايق دول">
        <BulletList
          items={[
            <>Claude بيشوف جريك ونومك ونبضك بنفسه، من غير copy-paste.</>,
            <>dashboard شخصي في ملف HTML واحد: weekly volume، pace vs heart rate، recovery.</>,
            <>خطة تدريب أسبوع بأسبوع مبنية على أرقامك الحقيقية مش على قالب.</>,
            <>أسئلة مباشرة بالعربي أو الإنجليزي: &quot;أنا overtrained؟&quot;، &quot;أجري الـ long run بكرة ولا لأ؟&quot;</>,
          ]}
        />
        <StatCards
          items={[
            { value: '0 EGP', label: 'Cost', sub: 'Kailo Base + claude.ai free', tone: 'green' },
            { value: '10 min', label: 'Setup', sub: 'من الموبايل أو اللابتوب', tone: 'brand' },
            { value: '6 wk', label: 'History', sub: 'حد الخطة المجانية', tone: 'accent' },
          ]}
        />
        <Callout tone="fact" title="فين ده من باقي المقالات؟">
          ده الـ <Strong>Level 1 المجاني</Strong>. لو عايز دعم ماركات أكتر وتحديث تلقائي كل صباح، في{' '}
          <Link href={PAID_URL} className="font-bold text-brand-soft hover:text-white">نسخة Level 1 بـ athletedata.health</Link>{' '}
          (مدفوعة). ولو عايز الخطة تتبعت على ساعتك و Claude يكلمك على Telegram، ده{' '}
          <Link href={LEVEL2_URL} className="font-bold text-brand-soft hover:text-white">الـ Level 2</Link>.
        </Callout>
      </Section>

      <Section id="requirements" title="What you need" titleAr="اللي محتاجه، كله ببلاش">
        <CompareTable
          columns={['What', 'Cost', 'Where']}
          rows={[
            { label: 'Watch data', cells: ['Garmin (live), Wahoo (live), Apple Health (via Kailo iOS app), Strava (archive import only)', 'Free', 'ساعتك الحالية'] },
            { label: 'Kailo account', cells: ['Base plan: connector for Claude & ChatGPT, read tools, last 6 weeks', 'Free', 'kailo.fit'] },
            { label: 'Claude account', cells: ['claude.ai in the browser or the app. Free plan allows one custom connector', 'Free', 'claude.ai'] },
            { label: 'Laptop / terminal', cells: ['Not needed. Phone is enough', '—', '—'] },
          ]}
        />
        <Callout tone="egypt" title="للجمهور المصري">
          مفيش اشتراك شهري ولا بطاقة ائتمان في الطريق ده. Kailo Premium (حوالي 10 دولار) اختياري تماماً، ومعظمكم مش هيحتاجه.
        </Callout>
      </Section>

      <Section id="step-kailo" title="Step 1 · Kailo account and your watch" titleAr="الخطوة 1: حساب Kailo ووصّل ساعتك">
        <Steps
          steps={[
            { title: 'افتح kailo.fit واعمل حساب', body: <>اضغط <Strong>Login</Strong> واختار <Strong>Connect with Garmin</Strong> (أو Strava لو ده اللي عندك). مفيش بطاقة.</> },
            { title: 'وصّل Garmin', body: <>وافق على صلاحيات Garmin Connect. الـ activities بتبدأ تظهر خلال دقايق. لو بتستخدم Wahoo أو Apple Watch، من <Strong>Data → Linking</Strong>.</>, meta: 'Garmin: live sync' },
            { title: 'Strava؟ أرشيف مرة واحدة', body: <>Strava مش بيسمح بقراءة مباشرة من الـ AI. من Strava: Settings → My Account → Download or Delete Your Account → Request your archive، وارفع الملف في Kailo من Data → Linking → Strava. هتاخد التاريخ، مش الجري الجديد.</>, meta: 'اختياري' },
            { title: 'Garmin unlock (اختياري) للنوم والـ HRV', body: <>الاتصال العادي بيدي الجري بس. لو عايز النوم والـ HRV والنبض طول اليوم، افتح <Strong>kailo.fit/garmin-mcp-unlock</Strong> وسجّل دخول Garmin جوه Kailo. لو مش مرتاح تدي بيانات دخولك، اتخطاه: الجري والـ pace ونبض التمرين شغالين من غيره.</>, meta: 'اختياري' },
            { title: 'اتأكد', body: <>افتح <Strong>Activities</Strong> في Kailo. لازم تشوف آخر جري ليك. لو فاضي، مفيش حاجة هتشتغل بعد كده، ارجع للخطوة 2.</> },
          ]}
        />
      </Section>

      <Section id="step-claude" title="Step 2 · Connect Claude to Kailo" titleAr="الخطوة 2: وصّل Claude بـ Kailo">
        <P>
          Kailo بيقدّم <Strong>MCP server</Strong> جاهز. مش محتاج تفهم يعني إيه، محتاج بس تلصق عنوانه مرة واحدة في Claude.
        </P>
        <Steps
          steps={[
            { title: 'افتح claude.ai', body: <>من المتصفح أو من تطبيق Claude Desktop. من الإعدادات: <Strong>Customize → Connectors</Strong>.</> },
            { title: 'Add custom connector', body: <>اضغط علامة <Strong>+</Strong> جنب البحث ثم <Strong>Add custom connector</Strong>.</> },
            { title: 'الاسم والعنوان', body: <>Name: <Strong>Kailo</Strong>. URL: انسخ اللي تحت. بعدين <Strong>Add</Strong>.</> },
            { title: 'Connect وسجّل دخول', body: <>تحت &quot;Not connected&quot; اضغط <Strong>Kailo → Connect</Strong>. هتتفتح صفحة Kailo، سجّل دخول ووافق. لازم الحالة تبقى <Strong>Connected</Strong>.</> },
          ]}
        />
        <PromptBlock label="MCP URL — paste in the URL field" content="https://kailo.fit/mcp" variant="terminal" />
        <Callout tone="tip" title="بتستخدم Claude Code على اللابتوب؟">
          نفس السيرفر بيشتغل مع أي MCP client. في الترمينال:{' '}
          <code className="rounded bg-surface-3 px-1.5 py-0.5 text-xs text-white" dir="ltr">claude mcp add --transport http --scope user kailo https://kailo.fit/mcp</code>{' '}
          وبعدين جوه Claude اكتب <code className="rounded bg-surface-3 px-1.5 py-0.5 text-xs text-white">/mcp</code> واختار Kailo → Authenticate. الطريق الموثّق رسمياً من Kailo هو claude.ai، فلو حصلت مشكلة ارجع له.
        </Callout>
      </Section>

      <Section id="step-test" title="Step 3 · Prove it is connected" titleAr="الخطوة 3: اتأكد إن الاتصال شغال">
        <P>افتح شات جديد في Claude (الـ connectors بتتفعّل لكل شات) والصق ده:</P>
        <PromptBlock label="Test message — paste into a new Claude chat" content={testPrompt} />
        <Callout tone="warning" title="النجاح شكله إيه؟">
          Claude يرد بأرقامك الحقيقية: عدد الجري، الكيلومترات، وآخر جري بتاريخه. لو رد بكلام عام أو قال &quot;مفيش أدوات&quot;، ارجع للخطوة 2 واتأكد إن Kailo مكتوب عليها Connected.
        </Callout>
      </Section>

      <Section id="step-dashboard" title="Step 4 · Dashboard and training plan" titleAr="الخطوة 4: الـ Dashboard والخطة">
        <Callout tone="tip" title="املا SECTION 1 قبل ما تبعت">
          هدفك، تاريخ السباق، مستواك، وقيودك. الباقي Claude بيطلعه من الداتا. الـ HTML اللي هيطلعه انسخه في ملف اسمه <Strong>dashboard.html</Strong> وافتحه بأي متصفح.
        </Callout>
        <PromptBlock label="Full dashboard prompt — copy & paste into Claude" content={dashboardPrompt} />
        <Callout tone="fact" title="على الموبايل؟">
          Claude هيكتب لك الـ HTML في الشات. اضغط Copy، افتح تطبيق ملاحظات أو Files، احفظه باسم dashboard.html، وافتحه من المتصفح. أو اعمل الخطوة دي من لابتوب مرة وخلاص.
        </Callout>
      </Section>

      <Section id="step-routine" title="Step 5 · Your weekly routine" titleAr="الخطوة 5: الروتين الأسبوعي">
        <P>الدنيا بتبقى مفيدة لما تتكرر. أربع رسايل جاهزة، انسخ اللي محتاجه:</P>
        <div className="space-y-3">
          {weeklyPrompts.map((w) => (
            <PromptBlock key={w.label} label={w.label} content={w.prompt} />
          ))}
        </div>
        <Callout tone="tip" title="عايز التحديث يحصل لوحده كل صباح؟">
          ده محتاج Claude Code (خطة Claude مدفوعة) وجدولة على اللابتوب. الخطوات موجودة في{' '}
          <Link href={`${PAID_URL}#steps`} className="font-bold text-brand-soft hover:text-white">الخطوة 6 من مقال athletedata</Link>، ونفس الفكرة بتشتغل مع Kailo بعد ما تضيفه بـ --scope user.
        </Callout>
      </Section>

      <Section id="limits" title="The honest limits" titleAr="الحدود بصراحة">
        <BulletList
          items={[
            <><Strong>6 أسابيع بس</Strong> من التاريخ في الخطة المجانية. كفاية لخطة وكفاية للـ trend، مش كفاية لمقارنة السنة دي بالسنة اللي فاتت.</>,
            <><Strong>Strava = أرشيف مرة واحدة.</Strong> الجري الجديد مش هيوصل لـ Claude إلا لو ساعتك Garmin أو Wahoo أو Apple Watch متوصلة مباشرة.</>,
            <><Strong>النوم والـ HRV محتاجين Garmin unlock</Strong> ببيانات دخول Garmin جوه Kailo. اختياري.</>,
            <><Strong>Polar و COROS و Suunto</Strong> مش مدعومين مباشرة. الحل: intervals.icu في الـ Level 2.</>,
            <><Strong>Kailo شركة ناشئة.</Strong> الخدمة ممكن تتغير. المقال ده اتراجع في سبتمبر 2026.</>,
          ]}
        />
      </Section>

      <Section id="compare" title="Kailo or the alternatives?" titleAr="Kailo ولا البدائل؟">
        <CompareTable
          columns={['Kailo (free)', 'athletedata.health', 'garmin_mcp (self-hosted)', 'intervals.icu (Level 2)']}
          highlightColumn={0}
          rows={[
            { label: 'Cost', cells: ['0', '9 €/mo after 7 days', '0', '0 + Claude Pro'] },
            { label: 'Setup', cells: ['3 clicks in claude.ai', '3 clicks in claude.ai', 'Python 3.12 + uv + terminal', 'API key + Claude Code'] },
            { label: 'Watches', cells: ['Garmin, Wahoo, Apple Health, Strava archive', 'Garmin, COROS, Polar, Suunto, Wahoo, WHOOP, Oura', 'Garmin only', 'كل الماركات تقريباً'] },
            { label: 'History', cells: ['6 weeks (free)', 'Full', 'Full', 'Full'] },
            { label: 'Sleep / HRV', cells: ['بعد Garmin unlock', 'نعم', 'نعم', 'نعم'] },
            { label: 'Push workouts to watch', cells: ['Garmin, via Kailo tools', 'Garmin, COROS, Apple Watch', 'Garmin', 'Garmin وغيره'] },
            { label: 'Needs a laptop', cells: ['لا', 'لا', 'أيوه', 'أيوه'] },
            { label: 'Best for', cells: ['أول مرة، ميزانية صفر', 'ماركات متعددة، zero setup', 'خصوصية كاملة، تاريخ كامل', 'خطة على الساعة + Telegram'] },
          ]}
        />
        <Callout tone="tip" title="قرارنا">
          ابدأ بـ Kailo النهارده. لو بعد شهر لقيت إنك محتاج تاريخ أطول أو ماركة تانية، وقتها بس فكّر في athletedata أو الـ Level 2. متدفعش قبل ما تحتاج.
        </Callout>
      </Section>

      <FaqList items={faqs} />
    </ArticleShell>
  )
}
