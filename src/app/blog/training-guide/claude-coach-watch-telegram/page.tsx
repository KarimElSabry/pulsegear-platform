// src/app/blog/training-guide/claude-coach-watch-telegram/page.tsx
// Built on the shared blog kit (src/components/blog). The build pieces,
// the full prompt and the traps are rendered by AdvancedCoachClient.

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
} from '@/components/blog'
import { AdvancedCoachClient } from './AdvancedCoachClient'

const SLUG = 'training-guide/claude-coach-watch-telegram'
const INSTAGRAM_URL = 'https://instagram.com/pulsegear_egypt'
const BEGINNER_URL = '/blog/training-guide/claude-ai-running-coach-setup'

export const metadata: Metadata = articleMetadata(SLUG, {
  keywords: [
    'intervals.icu Claude AI',
    'Telegram running coach Egypt',
    'push workouts to Garmin',
    'Claude AI training block',
    'AI coach Telegram Egypt',
    'تريننج متقدم',
    'Claude AI',
    'intervals.icu',
  ],
})

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const requirements = [
  {
    icon: "⌚",
    what: "A watch or app you already train with",
    note: "Garmin, Strava, COROS, Polar, Suunto, Wahoo, Oura, WHOOP, or Zwift",
    free: true,
    where: "intervals.icu/settings → Integrations",
    href: "https://intervals.icu",
  },
  {
    icon: "📊",
    what: "intervals.icu account",
    note: "The only free tool that writes workouts back to your watch",
    free: true,
    where: "intervals.icu",
    href: "https://intervals.icu",
  },
  {
    icon: "🤖",
    what: "Claude Code on your laptop",
    note: "Not just claude.ai — you need the terminal version. Install: curl -fsSL https://claude.ai/install.sh | bash (Mac/Linux) or irm https://claude.ai/install.ps1 | iex (Windows PowerShell). Needs a Claude Pro or Max subscription.",
    free: false,
    where: "code.claude.com/docs/en/quickstart",
    href: "https://code.claude.com/docs/en/quickstart",
  },
  {
    icon: "📱",
    what: "Telegram on your phone",
    note: "Any account works — you will create a bot in 5 minutes",
    free: true,
    where: "telegram.org",
    href: "https://telegram.org",
  },
  {
    icon: "📁",
    what: "An empty folder on your laptop",
    note: "This is where everything lives — do not delete it after setup",
    free: true,
    where: "Anywhere on your computer",
    href: "#",
  },
];

const whatYoureBuilding = [
  {
    piece: "intervals.icu",
    does: "One free account that pulls Garmin, Strava, COROS, WHOOP, Oura, Polar, Suunto, Wahoo and Zwift into one place. Free API. The only one that writes back to your watch.",
  },
  {
    piece: "Claude Code",
    does: "Reads 180 days of your training, interviews you about how you want to be coached, writes that to a file you own, then builds your next training block.",
  },
  {
    piece: "Your watch",
    does: "The training block lands on it directly. No exporting, no copy-paste, no manual entry.",
  },
  {
    piece: "Telegram",
    does: "Your coach reaches your phone. Daily summary, today's session, one line of why — in the coaching voice you defined.",
  },
];

const traps = [
  {
    trap: '"Upload planned workouts" is off by default',
    what: "Your block posts perfectly to intervals.icu and never reaches your wrist. Check this toggle before anything else.",
  },
  {
    trap: "Zones not set in intervals.icu",
    what: "Workout lands on the watch with targets that mean nothing. Two minutes in Settings saves the whole block.",
  },
  {
    trap: 'Bare Z2 in a running workout description',
    what: 'Your watch shows a power target instead of heart rate. Always write "Z2 HR" or "Z2 Pace" for running.',
  },
  {
    trap: "Basic auth username",
    what: 'It is the literal string "API_KEY" — not your actual key. Anything else returns a 401 that looks like a bad key.',
  },
];

const whatHappens = [
  {
    label: "Part 1 is the only part that needs you.",
    text: "Accounts, an API key, and the Telegram bot. Everything after that Claude does while you watch.",
  },
  {
    label: "The backfill is the slow bit.",
    text: "When you connect Garmin or Strava, intervals.icu fetches your history. It is not instant. Go make a coffee. If the calendar is still empty after ten minutes, the sync toggle is off.",
  },
  {
    label: "Part 3 is the part people skip and should not.",
    text: "It is a real interview and it takes ten minutes. What comes out is coach.md — a plain text file that holds how you want to be coached. That file is the actual product here. Everything else is plumbing.",
  },
  {
    label: "Part 4 shows you the block before it posts it.",
    text: "Read it. Push back on it. It is reading your real Fitness and Fatigue numbers, so if the block looks too hard, say so and tell it why. That conversation is the coaching.",
  },
  {
    label: "Part 5 is 5 minutes.",
    text: "BotFather, one message, done. You will see it land on your phone before you close the laptop.",
  },
];

const extraTraps = [
  "Only ~7 days push to the watch at a time. Build a 4-week block and week 1 shows up now. The rest lands as it approaches. Nothing is broken.",
  "A 403 error is almost always the User-Agent, not your key. Cloudflare sits in front of intervals.icu and blocks default Python requests.",
]

const faqs = [
  {
    q: "Do I need to have done the Level 1 setup first?",
    qAr: "لازم أكون عملت الـ Level 1 الأول؟",
    a: "No. This is a completely separate setup. It uses intervals.icu instead of Kailo or athletedata.health and does not require the dashboard from Level 1. You can start here directly.",
    aAr: "لا. ده setup منفصل خالص. بيستخدم intervals.icu بدل Kailo أو athletedata.health ومش محتاج الـ dashboard من الـ Level 1. تقدر تبدأ هنا مباشرة.",
  },
  {
    q: "My block posted to intervals.icu but nothing showed on my watch. Why?",
    qAr: "الـ block اتبعت على intervals.icu بس مش ظاهر على الساعة. ليه؟",
    a: 'Almost always the "Upload planned workouts" toggle. Go to intervals.icu Settings → Integrations → your device → make sure that toggle is on. Then sync your watch manually.',
    aAr: 'غالباً الـ "Upload planned workouts" toggle مش شغال. روح intervals.icu Settings → Integrations → الجهاز بتاعك → تأكد إن الـ toggle شغال. بعدين عمل sync يدوي للساعة.',
  },
  {
    q: "intervals.icu only pushes 7 days ahead. What about the rest of my block?",
    qAr: "intervals.icu بيبعت بس 7 أيام للأمام. إيه اللي بيحصل لباقي الـ block؟",
    a: "The full block is on your intervals.icu calendar. Your watch just stays one week out. As each week approaches, it pushes automatically. Nothing is broken — this is how it works by design.",
    aAr: "الـ block كامل موجود على الـ intervals.icu calendar. الساعة بتاخد أسبوع بأسبوع. كل ما أسبوع اقترب، بيتبعت تلقائي. مفيش مشكلة — ده تصميم الموضوع.",
  },
  {
    q: "My Telegram bot is not replying to me. Is that normal?",
    qAr: "الـ Telegram bot مش بيرد عليا. ده طبيعي؟",
    a: "Yes, at this stage. The bot sends messages to you — it does not listen for replies yet. That is the next level of setup. For now, Claude sends, you read.",
    aAr: "أيوه، في المرحلة دي. الـ bot بيبعتلك messages — مش بيسمع ردودك لسه. ده الـ level الجاي. دلوقتي Claude بيبعت وانت بتقرأ.",
  },
  {
    q: "getUpdates came back empty. What do I do?",
    qAr: "getUpdates رجع فاضي. إيه اللي أعمله؟",
    a: "Your message to the bot is either older than 24 hours or went to a different bot. Open Telegram, find your bot, send a fresh message — anything, even just hi — then tell Claude to try getUpdates again.",
    aAr: "الـ message اللي بعتيه للـ bot إما أقدم من 24 ساعة أو راح لـ bot تاني. افتح Telegram، لاقي الـ bot بتاعك، ابعت message جديد — أي حاجة، حتى لو hi — وبعدين قول لـ Claude يجرب getUpdates تاني.",
  },
  {
    q: "Can I undo the block if I do not like it?",
    qAr: "أقدر أمسح الـ block لو مش عاجبني؟",
    a: "Yes. Claude saves every event ID to block.json when it posts. Just tell Claude to delete the block and it will remove every session it posted. You can then ask it to rebuild with different parameters.",
    aAr: "أيوه. Claude بيحفظ كل event ID في block.json لما بيبعت. بس قول لـ Claude يمسح الـ block وهيشيل كل session بعتها. بعدين تقدر تطلب منه يبني من جديد بمعطيات مختلفة.",
  },
  {
    q: "What is coach.md and do I need to keep it?",
    qAr: "إيه هو coach.md ولازم أحتفظ بيه؟",
    a: "coach.md is the file Claude writes after interviewing you. It holds your goals, constraints, injury history, and how you want to be coached. Every time Claude builds a block or sends a Telegram message, it reads this file. Keep it. Edit it when something changes about you.",
    aAr: "coach.md هو الملف اللي Claude بيكتبه بعد ما بيعملك interview. بيحتوي على أهدافك وقيودك وتاريخ إصاباتك وإزاي عايز تتكوّش. كل مرة Claude يبني block أو يبعت Telegram message، بيقرأ الملف ده. احتفظ بيه. عدّله لما حاجة تتغير.",
  },
];

const whatYouGet = [
  '180 يوم من داتا تمرينك متحللة بالكامل',
  'coach.md — ملف بيحتوي على فلسفة التدريب بتاعتك وانت اللي بتكتبه',
  'Training block كامل على ساعتك مباشرة — من غير copy paste',
  'Telegram bot بيبعتلك تفاصيل تمرين النهارده كل يوم',
]

const commentPrompts = [
  'وصل الـ block على ساعتك؟ قولنا',
  'شايف الـ Telegram messages؟ شيرلنا',
  'عندك سؤال في أي خطوة؟ اسأل هنا',
]

const toc = [
  { id: 'overview', label: 'في نهاية الـ 40 دقيقة دول' },
  { id: 'what-youre-building', label: 'What you are building' },
  { id: 'requirements', label: 'What You Need Before Starting' },
  { id: 'the-prompt', label: 'الـ Prompt الكامل' },
  { id: 'what-happens', label: 'What happens, and what to expect' },
  { id: 'traps', label: 'The Four Traps' },
  { id: 'cost', label: 'What it costs' },
  { id: 'closing', label: 'يلا اتدرب' },
  { id: 'faq', label: 'FAQ' },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function AdvancedCoachPage() {
  return (
    <ArticleShell
      slug={SLUG}
      dek="intervals.icu connects your watch. Claude reads 180 days of your training, interviews you, builds your block, pushes it to your wrist, and texts you every day on Telegram. Everything is free except the Claude Pro subscription that Claude Code needs."
      toc={toc}
      related={['training-guide/claude-kailo-free-running-coach', 'training-guide/claude-ai-running-coach-setup', 'training-guide/complete-training-setup']}
      cta={{
        title: 'جاهز تتدرب صح؟',
        body: 'الـ running gear اللي محتاجه موجود، بأسعار مناسبة للـ Egyptian runners.',
        href: '/products',
        label: 'اتفرج على الـ Collection',
      }}
    >
      <Section id="overview" kicker="Level 2 · المتقدم · intervals.icu · Watch · Telegram" title="Your watch. Your phone. Zero subscriptions." titleAr="في نهاية الـ 40 دقيقة دول:">
        <StatCards
          columns={4}
          items={[
            { value: 'EG', label: 'For Egyptian Runners', tone: 'green' },
            { value: '~40 min', label: 'Setup', tone: 'brand' },
            { value: 'Free', label: 'Free tools + Claude Pro', tone: 'accent' },
            { value: 'Watch', label: 'Watch Push + Telegram', tone: 'blue' },
          ]}
        />
        <BulletList items={whatYouGet} />
        <Callout tone="tip" title="مش عملت الـ Level 1 لسه؟">
          <span className="block">
            <Link href="/blog/training-guide/claude-kailo-free-running-coach" className="font-bold text-brand-soft hover:text-white">الـ Level 1 المجاني (Kailo) →</Link>
          </span>
          ابدأ بـ Claude + Dashboard الأول — أسهل وأسرع.{' '}
          <Link href={BEGINNER_URL} className="font-bold text-brand-soft hover:text-white">اقرأ الـ Level 1 →</Link>
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

      <Section id="what-youre-building" title="What you are building" titleAr="إيه اللي هيتبني بالظبط">
        <AdvancedCoachClient whatYoureBuilding={whatYoureBuilding} />
        <Callout tone="tip" title="The reason this works is intervals.icu.">
          Everything else can read your data — Strava, Garmin, all of them. intervals.icu is the only free tool that
          lets something <Strong>write a workout back to your watch.</Strong> That is the whole trick.
        </Callout>
      </Section>

      <Section id="requirements" title="What You Need Before Starting" titleAr="اللي محتاجه قبل ما نبدأ، كله مجاناً">
        <CompareTable
          caption="Requirements"
          columns={['Note', 'Where']}
          rows={requirements.map((req) => ({
            label: req.what,
            cells: [
              <span key="note" className="text-xs">{req.note}{req.free ? '' : ' (Needs Claude Pro or Max)'}</span>,
              req.href === '#' ? (
                <span key="where" className="text-muted">{req.where}</span>
              ) : (
                <a key="where" href={req.href} target="_blank" rel="noopener noreferrer" className="text-brand-soft underline underline-offset-2 hover:text-white">{req.where}</a>
              ),
            ],
          }))}
        />
        <Callout tone="fact" title="You do not need to know how to code">
          The prompt tells Claude to run everything itself. If Claude ever hands you terminal commands and tells you
          to run them, say <span className="font-mono font-bold text-white">&quot;run it yourself, don&apos;t give me commands to paste&quot;</span> and it will.
        </Callout>
      </Section>

      <Section id="the-prompt" title="The full prompt" titleAr="الـ Prompt الكامل">
        <P>Open Claude Code in your empty folder. Paste this whole thing. Do not edit it first.</P>
        <AdvancedCoachClient telegramPrompt />
      </Section>

      <Section id="what-happens" title="What happens, and what to expect" titleAr="مش هتتفاجأ بحاجة لو قرأت ده الأول">
        <div className="space-y-3">
          {whatHappens.map((item) => (
            <div key={item.label} className="card p-5">
              <p className="text-sm font-bold text-white" dir="auto">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-strong" dir="auto">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="traps" title="The Four Traps">
        <P>كل واحدة فيهم خلّت حد يقف. كلهم اتعملت ليهم حل في الـ prompt — بس اعرفهم عشان تعرفهم لما تشوفهم.</P>
        <AdvancedCoachClient traps={traps} />
        <div className="space-y-3">
          {extraTraps.map((t) => (
            <Callout key={t} tone="warning">{t}</Callout>
          ))}
        </div>
        <Callout tone="tip" title="عجبك الـ setup لحد هنا؟">
          Follow the page on Instagram for gear reviews, running deals, and weekly tips for Egyptian runners.{' '}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-soft hover:text-white">Follow على Instagram</a>
        </Callout>
      </Section>

      <Section id="cost" title="What it costs" titleAr="مقارنة بيها بيانت">
        <StatCards
          columns={3}
          items={[
            { value: 'Free', label: 'intervals.icu', sub: 'API, calendar, builder, push', tone: 'green' },
            { value: 'Free', label: 'Telegram', sub: 'Any account', tone: 'green' },
            { value: 'Pro', label: 'Claude Pro or Max', sub: 'Only paid piece', tone: 'brand' },
          ]}
        />
        <P><Strong>Only Claude Pro.</Strong></P>
        <P>
          Free intervals.icu account covers the API, the calendar, the workout builder, the device integrations, and
          the push to your watch. Telegram is free. Claude Code itself requires a Claude Pro or Max subscription (or
          pre-paid API credits); the free claude.ai plan cannot run it.
        </P>
        <P>
          قارن ده بـ training app + coaching app + recovery app اللي ممكن تكون بتدفع فيهم دلوقتي. الـ setup ده بيعمل الثلاثة مع بعض.
        </P>
      </Section>

      <Section id="closing" title="Set it up once. Let it run. Focus on training." titleAr="الداتا بتاعتك على ساعتك، والكوتش على تليفونك. يلا اتدرب.">
        <Callout tone="fact" title="FYI">
          <p>
            This builds you a real coach, and it is still a coach that has never watched you run. It knows your
            numbers and it knows what you told it. It does not know that your left knee talks to you on descents
            unless you put that in <span className="font-mono font-bold text-white">coach.md</span>. Keep that file
            honest and it gets sharper. Leave it thin and you get generic.
          </p>
          <p className="pt-1 text-muted">الـ coach.md هو الفرق بين كوتش حقيقي وكالكيوليتر. كل ما تحدّثه، كل ما التدريب أدق.</p>
        </Callout>
        <P>
          Most athletes pay three subscriptions and still get generic plans. This setup reads your actual numbers,
          knows how you want to be coached, and reaches your phone every morning. Set it up once.
        </P>
        <P><Strong>Set it up once. Let it run. Focus on training.</Strong></P>

        <Callout tone="tip" title="مش جاهز للـ Level 2 لسه؟">
          <span className="block text-xs font-bold uppercase tracking-wide text-muted">Level 1 — المبتدئ · Beginner · Kailo (free) or athletedata.health + Dashboard</span>
          <Link href={BEGINNER_URL} className="font-bold text-white hover:text-brand-soft">
            خلي Claude AI يقرأ تمرينك كل يوم لوحده →
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
