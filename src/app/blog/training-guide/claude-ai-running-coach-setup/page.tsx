// src/app/blog/training-guide/claude-ai-running-coach-setup/page.tsx
// Built on the shared blog kit (src/components/blog). Steps and quick
// commands are rendered by the ClaudeCoachClient client component.

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
  ProsCons,
  FaqList,
} from '@/components/blog'
import { ClaudeCoachClient } from './ClaudeCoachClient'

const SLUG = 'training-guide/claude-ai-running-coach-setup'
const INSTAGRAM_URL = 'https://instagram.com/pulsegear_egypt'
const ADVANCED_URL = '/blog/training-guide/claude-coach-watch-telegram'

export const metadata: Metadata = articleMetadata(SLUG, {
  keywords: [
    'Claude AI running coach',
    'Strava Claude AI',
    'Garmin Claude AI',
    'athletedata.health',
    'running dashboard Egypt',
    'AI training plan Egypt',
    'تريننج',
    'Claude AI',
  ],
})

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const requirements = [
  {
    icon: "🏃",
    what: "Garmin, COROS, Polar, Suunto, Wahoo or WHOOP account with your activities (Strava alone is not enough, see Step 1)",
    free: true,
    where: "connect.garmin.com",
    href: "https://connect.garmin.com",
  },
  {
    icon: "🔗",
    what: "athletedata.health account (MCP plan)",
    free: false,
    cost: "7-day free trial, then 9 €/month",
    where: "athletedata.health",
    href: "https://athletedata.health",
  },
  {
    icon: "🤖",
    what: "Claude account (claude.ai in the browser)",
    free: true,
    where: "claude.ai",
    href: "https://claude.ai",
  },
  {
    icon: "💻",
    what: "Claude Code on your laptop (only for the daily auto-update in Step 6)",
    free: false,
    cost: "Needs Claude Pro or Max",
    where: "code.claude.com/docs/en/quickstart",
    href: "https://code.claude.com/docs/en/quickstart",
  },
];

const steps = [
  {
    number: "01",
    color: "border-blue-500/40 bg-blue-500/5",
    numberColor: "text-blue-400",
    accentColor: "bg-blue-500",
    title: "Connect Your Training Apps to athletedata.health",
    why: "athletedata.health is the bridge between your training apps (Garmin, COROS, Polar, etc.) and Claude AI. Without this connection, Claude cannot read your data. It can only read what you paste manually. Important: Strava data is NOT available through this bridge (Strava's API terms forbid it), so connect the watch brand itself, not Strava.",
    instructions: [
      "Go to athletedata.health and create an account with your email (7-day free trial, no card up front; the MCP plan is 9 €/month after that)",
      "Click Connect Apps",
      "Choose the app your watch syncs to: Garmin, COROS, Polar, Wahoo, Suunto, or WHOOP. Do not pick Strava, it will not show up in Claude.",
      "Log in to that app and click Authorize when it asks. Accept all scopes (activities, wellness, sleep).",
      "Wait 2 to 3 minutes for your history to sync",
      "Open Dashboard → MCP on athletedata.health. You should see the server URL https://mcp.athletedata.health/mcp and an API key. Keep this page open for Step 4.",
    ],
    success:
      "You will know it worked when you see your recent activities listed on athletedata.health",
    warning:
      "If you see zero activities, your sync is still running. Give it 5 minutes and refresh. If it is still empty, disconnect and reconnect the app.",
    tip: {
      flag: "🇪🇬",
      text: "وصّل Garmin (أو COROS/Polar) مباشرة، مش Strava. Strava مش بيتقري من Claude خالص، وGarmin بيديك sleep و HRV وبيانات القلب كمان. كل ما البيانات أكتر، كل ما التحليل أحسن.",
      dir: "rtl",
    },
  },
  {
    number: "02",
    color: "border-purple-500/40 bg-purple-500/5",
    numberColor: "text-purple-400",
    accentColor: "bg-purple-500",
    title: "Get Claude Code on Your Laptop",
    why: "Claude.ai on the web is great for one-time analysis. But for automatic daily updates, you need Claude Code, the version that runs on your computer and can be scheduled like an alarm. Claude Code is not a download page: you install it with one command in your terminal, and it needs a Claude Pro or Max subscription (the free plan does not log in to Claude Code).",
    instructions: [
      "Open your terminal (PowerShell on Windows, Terminal on Mac)",
      "Paste the install command for your system and press Enter:",
    ],
    terminalBlocks: [
      { label: "Mac / Linux", commands: ["curl -fsSL https://claude.ai/install.sh | bash"] },
      { label: "Windows PowerShell", commands: ["irm https://claude.ai/install.ps1 | iex"] },
    ],
    afterSteps: [
      "Close the terminal, open a new one, and type claude --version. You should see a version number.",
      "Type claude and press Enter. A browser window opens: log in with your Claude Pro or Max account.",
    ],
    success: "If you see the Claude Code welcome screen after logging in, you are good to go.",
    tip: {
      flag: "💡",
      text: "معندكش Claude Pro أو مش عارف تشتغل بالـ terminal؟ مش مشكلة. اعمل الخطوات 1 و 4 (النسخة بتاعة claude.ai) و 5 و 7 من المتصفح مجاناً. بس مش هتاخد الـ auto-update اليومي (خطوة 6). تقدر ترجع وتضيفه بعدين.",
      dir: "rtl",
    },
  },
  {
    number: "03",
    color: "border-green-500/40 bg-green-500/5",
    numberColor: "text-green-400",
    accentColor: "bg-green-500",
    title: "Create Your Project Folder",
    why: null,
    instructions: ["Open your terminal and run these commands one at a time:"],
    terminalCommands: ["mkdir my-running-coach", "cd my-running-coach", "claude"],
    warning:
      "Do not delete this folder. Everything — your dashboard, your data, your settings — lives here.",
  },
  {
    number: "04",
    color: "border-yellow-500/40 bg-yellow-500/5",
    numberColor: "text-yellow-400",
    accentColor: "bg-yellow-500",
    title: "Connect Claude to Your Training Data (MCP Setup)",
    why: "You are registering athletedata.health as a live data source (an MCP server). Claude cannot discover it on its own, so you give it the exact address once. After that, every time you ask Claude something, it reads your fresh training data automatically.",
    instructions: [
      "Option A, Claude Code (needed for Step 6). In your terminal, NOT inside Claude, run:",
    ],
    terminalBlocks: [
      {
        label: "Terminal (Mac, Linux or Windows)",
        commands: ["claude mcp add --transport http --scope user athletedata https://mcp.athletedata.health/mcp"],
      },
    ],
    afterSteps: [
      "Start claude, type /mcp and press Enter. Pick athletedata → Authenticate. A browser tab opens, sign in to athletedata.health and approve. The status should read Connected.",
      "If the browser login does not work on your machine, remove and re-add it with the key from Dashboard → MCP: claude mcp remove athletedata then claude mcp add --transport http --scope user athletedata \"https://mcp.athletedata.health/mcp?apiKey=YOUR_API_KEY\"",
      "Option B, free claude.ai in the browser (no Claude Code): go to claude.ai/customize/connectors → Add custom connector → Name: athletedata, URL: https://mcp.athletedata.health/mcp → Add → Connect → sign in and approve. The free plan allows one custom connector, which is all you need.",
      "Now paste the test message below:",
    ],
    success:
      "You will know it is connected when Claude answers with your real weekly kilometres, not a generic answer. If it says it has no tools or no data, athletedata is not connected or your trial has not started: open the athletedata dashboard and check that an integration shows as connected.",
  },
  {
    number: "05",
    color: "border-red-500/40 bg-red-500/5",
    numberColor: "text-red-400",
    accentColor: "bg-red-500",
    title: "Build Your Personal Dashboard",
    why: "Now for the good part. Paste this full prompt into Claude Code:",
    instructions: [],
  },
  {
    number: "06",
    color: "border-orange-500/40 bg-orange-500/5",
    numberColor: "text-orange-400",
    accentColor: "bg-orange-500",
    title: "Make It Automatic (Daily Auto-Update)",
    why: "Instead of you going to Claude every day, Claude checks your new workouts every morning and updates your dashboard automatically.",
    instructions: ["Paste this into Claude Code:"],
    afterSteps: [
      "You finish a run tonight 🏃",
      "Garmin or Strava syncs it (usually within 15 minutes)",
      "Tomorrow morning at 7am Claude pulls the new data automatically",
      "You open dashboard.html and it already has yesterday's run included",
    ],
    warning:
      "This uses your computer's own scheduler (cron on Mac/Linux, Task Scheduler on Windows) to run Claude Code in the background, so it needs Claude Code from Step 2 and the athletedata connection added with --scope user in Step 4. Your laptop needs to be on at 7am. If it is off, run it manually with the first Quick Command below.",
  },
  {
    number: "07",
    color: "border-zinc-500/40 bg-zinc-500/5",
    numberColor: "text-zinc-300",
    accentColor: "bg-zinc-500",
    title: "Ask Claude Anything About Your Training",
    why: "Once your data is connected, you can ask Claude real questions in plain language.",
    instructions: [],
  },
];

const faqs = [
  {
    q: "Do I need to pay for Claude?",
    qAr: "محتاج أدفع عشان أستخدم Claude؟",
    a: "Not for the dashboard. The free claude.ai plan can add one custom connector (athletedata) and run the Step 5 prompt, with usage limits. Claude Code, which you need only for the automatic daily update in Step 6, requires Claude Pro or Max. Separately, athletedata.health's MCP access is a 7-day free trial and then 9 € per month.",
    aAr: "مش للـ dashboard. الـ free plan بتاع claude.ai بيسمح بـ custom connector واحد (athletedata) وتشغيل prompt الخطوة 5، مع limits. Claude Code، اللي محتاجه بس للـ auto-update اليومي في الخطوة 6، محتاج Claude Pro أو Max. وكمان الـ MCP بتاع athletedata.health: 7 أيام تجربة مجانية وبعدها 9 يورو في الشهر.",
  },
  {
    q: "My Garmin is connected to Strava. Do I connect Garmin or Strava to athletedata.health?",
    qAr: "Garmin بتاعي متوصل بـ Strava. أوصّل Garmin ولا Strava بـ athletedata.health؟",
    a: "Connect Garmin. Strava data is not exposed to Claude at all through athletedata.health (Strava's API terms do not allow it), so a Strava-only connection shows zero activities in Claude. Garmin also shares heart rate, HRV, sleep, and recovery data, which means better answers.",
    aAr: "وصّل Garmin. بيانات Strava مش بتوصل لـ Claude خالص عن طريق athletedata.health (شروط Strava مش بتسمح)، فلو وصّلت Strava بس هتلاقي صفر activities في Claude. وكمان Garmin بيشارك بيانات القلب و HRV والنوم والريكفري، يعني إجابات أحسن.",
  },
  {
    q: "What if my activities do not show up?",
    qAr: "إيه اللي أعمله لو الـ activities مش ظاهرة؟",
    a: "Give it 5 to 10 minutes after connecting. If it is still empty, disconnect and reconnect your app in athletedata.health settings. If Garmin is missing HR or sleep data, check that you authorized all scopes (wellness and sleep) when you connected, not just activities.",
    aAr: "استنى 5 لـ 10 دقايق بعد الاتصال. لو لسه فاضي، افصل وأعد الاتصال من إعدادات athletedata.health. لو Garmin مش بيظهر بيانات القلب أو النوم، تأكد إنك وافقت على كل الصلاحيات (wellness و sleep) مش بس الـ activities.",
  },
  {
    q: "Can I use this without Claude Code (just claude.ai on the web)?",
    qAr: "أقدر أستخدمه من غير Claude Code، يعني من الموقع بس؟",
    a: "Yes. Steps 1, 4 (Option B), 5 and 7 work on claude.ai without installing anything. You just will not get the automatic daily update from Step 6. You would need to open claude.ai and paste the prompt manually each time you want a fresh analysis.",
    aAr: "أيوه. الخطوات 1 و 5 شغالة على claude.ai من غير ما تنزّل حاجة. بس مش هتاخد الـ auto-update اليومي من الخطوة 6. هتحتاج تفتح claude.ai وتعمل paste للـ prompt بإيدك كل مرة عايز تحليل جديد.",
  },
  {
    q: "Is my training data private?",
    qAr: "بيانات تمريني هتبقى private؟",
    a: "Your data goes from your app to athletedata.health to Claude. It is not shared publicly. Check the privacy policies of athletedata.health and Anthropic if you want the full details. As a rule, do not include personal information like your name, location, or phone number in your prompts.",
    aAr: "البيانات بتاعتك بتروح من الـ app لـ athletedata.health لـ Claude. مش بتتشارك للعموم. لو عايز التفاصيل الكاملة، اقرأ سياسة الخصوصية بتاعة athletedata.health و Anthropic. كقاعدة، متحطش معلومات شخصية زي اسمك أو موقعك في الـ prompts.",
  },
  {
    q: "I got zero activities in my dashboard. What is wrong?",
    qAr: "الـ dashboard بتاعي بيظهر صفر activities. إيه المشكلة؟",
    a: "Usually one of three things: you connected Strava (not visible to Claude, connect Garmin/COROS/Polar instead), your athletedata.health connection did not authorize fully (disconnect and reconnect), or the sync is still running (wait 10 minutes and try again). Never accept a dashboard full of zeros as working. Claude will tell you clearly if data is missing.",
    aAr: "غالباً واحدة من اتنين: الاتصال بـ athletedata.health مش اتعمله صح (افصل وأعد الاتصال)، أو الـ sync لسه شغال (استنى 10 دقايق وحاول تاني). متقبلش dashboard مليان أصفار على إنه شغال. Claude هيقولك بوضوح لو في بيانات ناقصة.",
  },
  {
    q: "I do not have a race goal right now. Can I still use this?",
    qAr: "معنديش هدف سباق دلوقتي. أقدر أستخدمه برضو؟",
    a: "Yes. Just write no fixed date, building base in the goal section. Claude will give you a 10-week base-building plan and a dashboard that tracks your weekly volume and fitness trend without a countdown.",
    aAr: "تمام. اكتب في الـ goal section: no fixed date, building base. وهيديك خطة 10 أسابيع لبناء الـ base مع dashboard بيتابع الـ volume الأسبوعي وتطور اللياقة من غير countdown.",
  },
];

const whatItWontDo = [
  "It cannot watch your workout in real time",
  "It cannot contact your doctor or adjust medication",
  "It cannot guarantee race results. It gives analysis, not promises",
  "It cannot replace a qualified running coach for elite-level training",
  "It will not invent numbers if data is missing. It will tell you the data is absent",
];

const whatItDoesBest = [
  "Spots patterns in your data that you would never catch manually",
  "Gives you honest feedback without sugarcoating",
  "Answers specific questions about your specific numbers",
  "Updates your plan as your fitness changes, not a one-size plan",
  "Saves you hours of trying to interpret Garmin's own graphs",
];

const whatYouGet = [
  'Dashboard شخصي بيعرض pace trends و weekly load و fitness vs fatigue في ملف HTML واحد',
  'Auto-update كل يوم الصبح من غير ما تعمل حاجة',
  'تقدر تسأل Claude عن آخر 4 أسابيع، الأسبوع الجاي، أو لو بتعمل overtraining',
  'شغال على أي device، desktop أو موبايل، من غير app',
]

const commentPrompts = [
  'شيرلنا الـ readiness verdict بتاعك',
  'عندك سؤال في أي خطوة؟ اسأل هنا',
  'عجبك الـ setup؟ قولنا',
]

const toc = [
  { id: 'overview', label: 'هتعمل إيه في الـ 15 دقيقة دول' },
  { id: 'requirements', label: 'What You Need Before Starting' },
  { id: 'steps', label: 'الخطوات، واحدة واحدة' },
  { id: 'quick-reference', label: 'Quick Reference Commands' },
  { id: 'limitations', label: 'What This Will Not Do' },
  { id: 'closing', label: 'يلا، كمل' },
  { id: 'faq', label: 'FAQ' },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function ClaudeAIRunningCoachPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="Connect your Garmin, COROS or Polar once. Claude builds your personal dashboard and updates it every morning automatically. No copy-paste. No spreadsheets. 15 minutes to set up."
      toc={toc}
      related={['training-guide/claude-kailo-free-running-coach', 'training-guide/claude-coach-watch-telegram', 'training-guide/heart-rate-zones']}
      cta={{
        title: 'جاهز تتدرب صح؟',
        body: 'الـ running gear اللي محتاجه موجود، بأسعار مناسبة للـ Egyptian runners.',
        href: '/products',
        label: 'اتفرج على الـ Collection',
      }}
    >
      <Section id="overview" kicker="Level 1 · athletedata.health (paid, multi-brand) · AI Tools" title="Watched the reel? Full setup is right here." titleAr="هتعمل إيه في الـ 15 دقيقة دول:">
        <Callout tone="egypt" title="في نسخة مجانية من الطريق ده">
          الطريقة دي بتستخدم athletedata.health (9 يورو في الشهر بعد 7 أيام تجربة) عشان بتدعم Garmin و COROS و Polar و Suunto وبتحدّث لوحدها كل صباح. لو ميزانيتك صفر أو ساعتك Garmin، ابدأ بـ{' '}
          <Link href="/blog/training-guide/claude-kailo-free-running-coach" className="font-bold text-brand-soft hover:text-white">الـ Level 1 المجاني بـ Kailo</Link>{' '}
          الأول. نفس الـ dashboard ونفس الـ prompts، من غير اشتراك.
        </Callout>
        <StatCards
          columns={4}
          items={[
            { value: 'EG', label: 'For Egyptian Runners', tone: 'green' },
            { value: '15 min', label: 'Setup', tone: 'brand' },
            { value: '9 €/mo', label: 'Free trial first', sub: 'athletedata.health MCP plan', tone: 'accent' },
            { value: 'Claude', label: 'Claude AI', tone: 'blue' },
          ]}
        />
        <BulletList items={whatYouGet} />
        <Callout tone="tip" title="Level 2 متاح كمان">
          عايز Claude يبعت تمرينك على ساعتك ويكلمك على Telegram؟{' '}
          <Link href={ADVANCED_URL} className="font-bold text-brand-soft hover:text-white">اقرأ المستوى التاني →</Link>
        </Callout>
        <Callout tone="fact" title="عجبك الـ tutorial؟">
          Follow the page for gear, deals, and weekly training tips.{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-soft hover:text-white">Follow على Instagram</a>
        </Callout>
        <Callout tone="egypt" title="بتدور على الـ running gear الصح؟">
          الـ gear اللي بنستخدمه، متاح دلوقتي.{' '}
          <Link href="/products" className="font-bold text-brand-soft hover:text-white">اتفرج على الـ Gear →</Link>
        </Callout>
      </Section>

      <Section id="requirements" title="What You Need Before Starting" titleAr="اللي محتاجه قبل ما نبدأ، كله مجاناً">
        <CompareTable
          caption="Requirements"
          columns={['Free?', 'Where']}
          rows={requirements.map((req) => ({
            label: req.what,
            cells: [
              req.free ? <span className="font-bold text-emerald-400">Free</span> : <span className="font-bold text-accent-soft">{req.cost}</span>,
              <a key={req.href} href={req.href} target="_blank" rel="noopener noreferrer" className="text-brand-soft underline underline-offset-2 hover:text-white">{req.where}</a>,
            ],
          }))}
        />
        <Callout tone="fact" title="Note for Egyptian runners">
          Claude Code works on Windows, Mac, and Linux. Chrome or Edge works best.
        </Callout>
      </Section>

      <Section id="steps" title="Step by step" titleAr="الخطوات، واحدة واحدة">
        <P>One at a time. Do not skip ahead.</P>
        <ClaudeCoachClient steps={steps} />
        <Callout tone="tip" title="عجبك الـ setup لحد هنا؟">
          Follow the page on Instagram for gear reviews, running deals, and weekly tips for Egyptian runners.{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-soft hover:text-white">Follow على Instagram</a>
        </Callout>
      </Section>

      <Section id="quick-reference" title="Quick Reference Commands">
        <P>Save these. You will use them every week.</P>
        <ClaudeCoachClient quickCommands />
      </Section>

      <Section id="limitations" title="What This Will Not Do" titleAr="بكل صراحة، Claude مش بيعمل كل حاجة">
        <ProsCons
          pros={whatItDoesBest}
          cons={whatItWontDo}
          prosTitle="Does this extremely well"
          consTitle="Cannot do this"
        />
      </Section>

      <Section id="closing" title="Set it up once. Let it run. Focus on training." titleAr="يلا، الداتا بتاعتك جاهزة، Claude جاهز، انت بس كمل">
        <P>
          Most runners collect months of data and never look past the weekly summary. This setup changes that.
          Claude reads the full picture — your load, your recovery, your trend — and tells you what it means in
          plain language, every single morning.
        </P>
        <P><Strong>Set it up once. Let it run. Focus on training.</Strong></P>

        <Callout tone="tip" title="جاهز للمستوى التاني؟">
          <span className="block text-xs font-bold uppercase tracking-wide text-muted">Advanced · intervals.icu + Telegram</span>
          <Link href={ADVANCED_URL} className="font-bold text-white hover:text-brand-soft">
            خلي Claude يبعت تمرينك على ساعتك ويكلمك على Telegram لوحده →
          </Link>
        </Callout>

        <div className="card space-y-5 p-8 text-center">
          <h3 className="text-2xl font-black leading-tight text-white md:text-3xl" dir="auto">
            اتكلم معانا <span className="text-accent-soft">في الكومنتس</span>
          </h3>
          <p className="text-lg font-bold text-muted-strong">Tell us how it went.</p>
          <ul className="mx-auto max-w-md space-y-2 text-start">
            {commentPrompts.map((t) => (
              <li key={t} className="rounded-xl border border-line bg-surface-1/60 px-4 py-3 text-sm font-bold text-muted-strong" dir="auto">{t}</li>
            ))}
          </ul>
          <p className="text-sm text-muted" dir="auto">بنرد على كل كومنت</p>
        </div>

        <P>
          <Link href="/blog" className="font-bold text-brand-soft hover:text-white">كل المقالات والـ guides على المدونة →</Link>
        </P>

        <Callout tone="fact" title="عايز تشوف gear جديد ودـ deals وتips كل أسبوع؟">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-soft hover:text-white">Follow @pulsegear_egypt على Instagram</a>
          <span className="block pt-1 text-muted">اتكلم معانا في الكومنتس على الـ reel</span>
        </Callout>
      </Section>

      <FaqList items={faqs} title="Frequently Asked Questions" />
    </ArticleShell>
  )
}
