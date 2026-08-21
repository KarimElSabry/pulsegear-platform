// src/app/blog/training-guide/claude-coach-watch-telegram/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { AdvancedCoachClient } from "./AdvancedCoachClient";

const SITE_URL     = "https://pulsegear-platform.vercel.app";
const SHOP_URL     = "https://pulsegear-platform.vercel.app/products";
const BLOG_URL     = "https://pulsegear-platform.vercel.app/blog";
const INSTAGRAM_URL = "https://instagram.com/pulsegear_egypt";
const BEGINNER_URL  = "/blog/training-guide/claude-ai-running-coach-setup";

export const metadata: Metadata = {
  title: "خلي Claude يبعت تمرينك على ساعتك ويكلمك على Telegram — الإعداد الكامل",
  description:
    "ربط intervals.icu بـ Claude AI لبناء training block كامل يتبعت على ساعتك، مع Telegram bot يكلمك بتفاصيل تمرينك كل يوم. مجاناً تماماً.",
  keywords: [
    "intervals.icu Claude AI",
    "Telegram running coach Egypt",
    "push workouts to Garmin",
    "Claude AI training block",
    "AI coach Telegram Egypt",
    "تريننج متقدم",
    "Claude AI",
    "intervals.icu",
  ],
  openGraph: {
    title: "خلي Claude يبعت تمرينك على ساعتك ويكلمك على Telegram",
    description:
      "intervals.icu + Claude AI + Telegram. Training block على ساعتك، coaching messages على تليفونك، مجاناً.",
    type: "article",
    url: `${SITE_URL}/blog/training-guide/claude-coach-watch-telegram`,
    images: [
      {
        url: `${SITE_URL}/og-claude-telegram.jpg`,
        width: 1200,
        height: 630,
        alt: "Claude AI Watch + Telegram Coach Setup - Pulse Gear Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "خلي Claude يبعت تمرينك على ساعتك ويكلمك على Telegram",
    description:
      "intervals.icu + Claude AI + Telegram. Training block على ساعتك، coaching messages على تليفونك.",
    images: [`${SITE_URL}/og-claude-telegram.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/blog/training-guide/claude-coach-watch-telegram`,
  },
};

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
    note: "Not just claude.ai — you need the desktop version",
    free: true,
    where: "claude.ai/code",
    href: "https://claude.ai/code",
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
    icon: "👤",
  },
  {
    label: "The backfill is the slow bit.",
    text: "When you connect Garmin or Strava, intervals.icu fetches your history. It is not instant. Go make a coffee. If the calendar is still empty after ten minutes, the sync toggle is off.",
    icon: "⏳",
  },
  {
    label: "Part 3 is the part people skip and should not.",
    text: "It is a real interview and it takes ten minutes. What comes out is coach.md — a plain text file that holds how you want to be coached. That file is the actual product here. Everything else is plumbing.",
    icon: "📝",
  },
  {
    label: "Part 4 shows you the block before it posts it.",
    text: "Read it. Push back on it. It is reading your real Fitness and Fatigue numbers, so if the block looks too hard, say so and tell it why. That conversation is the coaching.",
    icon: "📋",
  },
  {
    label: "Part 5 is 5 minutes.",
    text: "BotFather, one message, done. You will see it land on your phone before you close the laptop.",
    icon: "📱",
  },
];

const faqs = [
  {
    q: "Do I need to have done the Level 1 setup first?",
    qAr: "لازم أكون عملت الـ Level 1 الأول؟",
    a: "No. This is a completely separate setup. It uses intervals.icu instead of athletedata.health and does not require the dashboard from Level 1. You can start here directly.",
    aAr: "لا. ده setup منفصل خالص. بيستخدم intervals.icu بدل athletedata.health ومش محتاج الـ dashboard من الـ Level 1. تقدر تبدأ هنا مباشرة.",
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

const relatedPosts = [
  {
    href: BEGINNER_URL,
    label: "Level 1 — المبتدئ",
    title: "خلي Claude AI يقرأ تمرينك كل يوم لوحده",
    tag: "Beginner · athletedata.health + Dashboard",
    accent: "border-green-500/30 hover:border-green-500/60",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function AdvancedCoachPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Level badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wide text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              Level 2 · المتقدم
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
              intervals.icu · Watch · Telegram
            </span>
          </div>

          {/* Hook */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest" dir="ltr">
              Your watch. Your phone. Zero subscriptions.
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight" dir="rtl">
              خلي Claude يبعت
              <br />
              <span className="text-cyan-400">تمرينك على ساعتك</span>
              <br />
              ويكلمك على Telegram.
            </h1>
            <p className="text-base text-zinc-300 leading-relaxed max-w-xl" dir="ltr">
              intervals.icu connects your watch. Claude reads 180 days of your
              training, interviews you, builds your block, pushes it to your
              wrist, and texts you every day on Telegram. Free. The whole thing.
            </p>
          </div>

          {/* Trust Bar */}
          <div className="flex items-center gap-4 text-sm text-zinc-500 flex-wrap" dir="ltr">
            <span>🇪🇬 For Egyptian Runners</span>
            <span>·</span>
            <span>⏱ ~40 min setup</span>
            <span>·</span>
            <span>✅ 100% Free</span>
            <span>·</span>
            <span>⌚ Watch Push</span>
            <span>·</span>
            <span>📱 Telegram</span>
          </div>

          {/* Level 1 back-link */}
          <Link
            href={BEGINNER_URL}
            className="group bg-zinc-900 border border-green-500/20 hover:border-green-500/50 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-200"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wide text-green-400" dir="ltr">
                مش عملت الـ Level 1 لسه؟
              </span>
              <p className="text-sm font-bold text-white" dir="rtl">
                ابدأ بـ Claude + Dashboard الأول — أسهل وأسرع
              </p>
            </div>
            <span className="text-green-400 text-xl group-hover:translate-x-1 transition-transform duration-200 shrink-0">
              ←
            </span>
          </Link>

          {/* Follow CTA */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-white" dir="rtl">عجبك الـ tutorial؟</p>
              <p className="text-sm text-zinc-400" dir="ltr">
                Follow the page for gear, deals, and weekly training tips.
              </p>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Follow على Instagram
            </a>
          </div>

          {/* What You'll Get */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-400" dir="rtl">
              في نهاية الـ 40 دقيقة دول:
            </p>
            {[
              {
                icon: "📊",
                text: "180 يوم من داتا تمرينك متحللة بالكامل",
                dir: "rtl" as const,
              },
              {
                icon: "📝",
                text: "coach.md — ملف بيحتوي على فلسفة التدريب بتاعتك وانت اللي بتكتبه",
                dir: "rtl" as const,
              },
              {
                icon: "⌚",
                text: "Training block كامل على ساعتك مباشرة — من غير copy paste",
                dir: "rtl" as const,
              },
              {
                icon: "📱",
                text: "Telegram bot بيبعتلك تفاصيل تمرين النهارده كل يوم",
                dir: "rtl" as const,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="text-sm text-zinc-300 leading-relaxed" dir={item.dir}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          GEAR BANNER
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 bg-zinc-900/50 py-6 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏃</span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-white" dir="rtl">بتدور على الـ running gear الصح؟</p>
              <p className="text-sm text-zinc-400" dir="rtl">الـ gear اللي بنستخدمه، متاح دلوقتي.</p>
            </div>
          </div>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap"
          >
            اتفرج على الـ Gear
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ARTICLE BODY
      ══════════════════════════════════════ */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ─── WHAT YOU'RE BUILDING ─── */}
        <section id="what-youre-building" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">🧩 What you are building</h2>
            <p className="text-sm text-zinc-500" dir="rtl">إيه اللي هيتبني بالظبط</p>
          </div>

          <AdvancedCoachClient whatYoureBuilding={whatYoureBuilding} />

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-cyan-400 shrink-0 text-lg">💡</span>
            <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">
              <span className="text-cyan-400 font-bold">The reason this works is intervals.icu.</span>{" "}
              Everything else can read your data — Strava, Garmin, all of them.
              intervals.icu is the only free tool that lets something{" "}
              <span className="text-white font-bold">write a workout back to your watch.</span>{" "}
              That is the whole trick.
            </p>
          </div>
        </section>

        {/* ─── REQUIREMENTS ─── */}
        <section id="requirements" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">⚙️ What You Need Before Starting</h2>
            <p className="text-sm text-zinc-500" dir="rtl">اللي محتاجه قبل ما نبدأ، كله مجاناً</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">What</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">Note</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">Where</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {requirements.map((req) => (
                  <tr key={req.what} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span>{req.icon}</span>
                        <span className="text-zinc-300 text-sm font-bold" dir="ltr">{req.what}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-zinc-500 leading-relaxed" dir="ltr">{req.note}</span>
                    </td>
                    <td className="px-5 py-4">
                      {req.href === "#" ? (
                        <span className="text-sm text-zinc-500" dir="ltr">{req.where}</span>
                      ) : (
                        <a
                          href={req.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                          dir="ltr"
                        >
                          {req.where}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🙋</span>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">
              You do not need to know how to code. The prompt tells Claude to run
              everything itself. If Claude ever hands you terminal commands and
              tells you to run them, say{" "}
              <span className="text-white font-bold font-mono">
                &quot;run it yourself, don&apos;t give me commands to paste&quot;
              </span>{" "}
              and it will.
            </p>
          </div>
        </section>

        {/* ─── THE PROMPT ─── */}
        <section id="the-prompt" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="rtl">🚀 الـ Prompt الكامل</h2>
            <p className="text-sm text-zinc-500" dir="ltr">
              Open Claude Code in your empty folder. Paste this whole thing. Do not edit it first.
            </p>
          </div>
          <AdvancedCoachClient telegramPrompt />
        </section>

        {/* ─── WHAT HAPPENS ─── */}
        <section id="what-happens" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">📖 What happens, and what to expect</h2>
            <p className="text-sm text-zinc-500" dir="rtl">مش هتتفاجأ بحاجة لو قرأت ده الأول</p>
          </div>
          <div className="flex flex-col gap-3">
            {whatHappens.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start gap-4"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-white" dir="ltr">{item.label}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TRAPS ─── */}
        <section id="traps" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">⚠️ The Four Traps</h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              كل واحدة فيهم خلّت حد يقف. كلهم اتعملت ليهم حل في الـ prompt — بس اعرفهم عشان تعرفهم لما تشوفهم.
            </p>
          </div>
          <AdvancedCoachClient traps={traps} />
          <div className="flex flex-col gap-3">
            {[
              {
                icon: "⌚",
                text: "Only ~7 days push to the watch at a time. Build a 4-week block and week 1 shows up now. The rest lands as it approaches. Nothing is broken.",
              },
              {
                icon: "🔒",
                text: "A 403 error is almost always the User-Agent, not your key. Cloudflare sits in front of intervals.icu and blocks default Python requests.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MID-PAGE FOLLOW CTA ─── */}
        <section className="bg-gradient-to-br from-purple-600/15 to-pink-600/10 border border-purple-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">📲</span>
          <h3 className="text-lg font-bold text-white" dir="rtl">عجبك الـ setup لحد هنا؟</h3>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed" dir="ltr">
            Follow the page on Instagram for gear reviews, running deals, and
            weekly tips for Egyptian runners.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold px-6 py-3 rounded-full transition-all duration-200"
          >
            Follow على Instagram
          </a>
        </section>

        {/* ─── WHAT IT COSTS ─── */}
        <section id="cost" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">💰 What it costs</h2>
            <p className="text-sm text-zinc-500" dir="rtl">مقارنة بيها بيانت</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-3xl font-black text-green-400" dir="ltr">Nothing.</p>
            <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">
              Free intervals.icu account covers the API, the calendar, the workout
              builder, the device integrations, and the push to your watch.
              Telegram is free. Claude free tier handles everything here.
            </p>
            <div className="border-t border-green-500/20 pt-4">
              <p className="text-sm text-zinc-500 leading-relaxed" dir="rtl">
                قارن ده بـ training app + coaching app + recovery app اللي ممكن تكون بتدفع فيهم دلوقتي.
                الـ setup ده بيعمل الثلاثة مع بعض.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">❓ Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-500" dir="rtl">أسئلة شايفينها كتير</p>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4"
              >
                <p className="font-bold text-white text-base" dir="ltr">🔸 {faq.q}</p>
                <p className="text-sm font-bold text-zinc-400" dir="rtl">{faq.qAr}</p>
                <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3">
                  <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">{faq.a}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed border-t border-zinc-800/60 pt-3" dir="rtl">
                    {faq.aAr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FYI ─── */}
        <section className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-sm font-bold uppercase tracking-wide text-zinc-400" dir="ltr">FYI</p>
          <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">
            This builds you a real coach, and it is still a coach that has never
            watched you run. It knows your numbers and it knows what you told it.
            It does not know that your left knee talks to you on descents unless
            you put that in{" "}
            <span className="text-white font-mono font-bold">coach.md</span>.
            Keep that file honest and it gets sharper. Leave it thin and you get
            generic.
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed" dir="rtl">
            الـ coach.md هو الفرق بين كوتش حقيقي وكالكيوليتر. كل ما تحدّثه، كل ما التدريب أدق.
          </p>
        </section>

        {/* ─── CLOSING ─── */}
        <section className="bg-gradient-to-br from-cyan-600/20 to-zinc-900 border border-cyan-500/20 rounded-2xl p-8 flex flex-col gap-5 text-center items-center">
          <span className="text-4xl">🏁</span>
          <h3 className="text-xl font-bold text-white" dir="rtl">
            الداتا بتاعتك على ساعتك، والكوتش على تليفونك. يلا اتدرب.
          </h3>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed" dir="ltr">
            Most athletes pay three subscriptions and still get generic plans.
            This setup reads your actual numbers, knows how you want to be
            coached, and reaches your phone every morning. Set it up once.
          </p>
          <p className="text-sm text-zinc-300 font-bold" dir="ltr">
            Set it up once. Let it run. Focus on training.
          </p>
        </section>

        {/* ══════════════════════════════════════
            LEVEL DOWN LINK
        ══════════════════════════════════════ */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-wide text-zinc-500" dir="ltr">
            مش جاهز للـ Level 2 لسه؟
          </p>
          {relatedPosts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className={`group bg-zinc-900 border ${post.accent} rounded-2xl p-6 flex items-center justify-between gap-4 transition-all duration-200`}
            >
              <div className="flex flex-col gap-2">
                <span className={`self-start text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${post.tagColor}`}>
                  {post.tag}
                </span>
                <p className="text-base font-bold text-white leading-snug" dir="rtl">
                  {post.title}
                </p>
              </div>
              <span className="text-zinc-400 text-2xl group-hover:translate-x-1 transition-transform duration-200 shrink-0">
                ←
              </span>
            </Link>
          ))}
        </section>

        {/* ══════════════════════════════════════
            COMMENT CTA
        ══════════════════════════════════════ */}
        <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-600 rounded-2xl p-10 flex flex-col items-center gap-6 text-center">
          <span className="text-5xl">💬</span>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight" dir="rtl">
              اتكلم معانا
              <br />
              <span className="text-yellow-400">في الكومنتس</span>
            </h3>
            <p className="text-lg font-bold text-zinc-300" dir="ltr">Tell us how it went.</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-md">
            {[
              { emoji: "⌚", text: "وصل الـ block على ساعتك؟ قولنا", dir: "rtl" as const },
              { emoji: "📱", text: "شايف الـ Telegram messages؟ شيرلنا", dir: "rtl" as const },
              { emoji: "❓", text: "عندك سؤال في أي خطوة؟ اسأل هنا", dir: "rtl" as const },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <p className="text-sm font-bold text-zinc-300" dir={item.dir}>{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500" dir="rtl">بنرد على كل كومنت 👇</p>
        </section>

        {/* ─── RELATED BLOG ─── */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-wide text-zinc-500" dir="ltr">
            More from the blog
          </p>
          <a
            href={BLOG_URL}
            className="group bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-200"
          >
            <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors" dir="rtl">
              كل المقالات والـ guides على المدونة
            </p>
            <span className="text-zinc-500 group-hover:text-zinc-300 text-xl group-hover:translate-x-1 transition-all duration-200 shrink-0">
              ←
            </span>
          </a>
        </section>

        {/* ─── FINAL GEAR CTA ─── */}
        <section className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
          <span className="text-3xl">🛒</span>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white" dir="rtl">جاهز تتدرب صح؟</h3>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed" dir="rtl">
              الـ running gear اللي محتاجه موجود، بأسعار مناسبة للـ Egyptian runners.
            </p>
          </div>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500 hover:bg-red-400 text-white text-sm font-bold px-8 py-3 rounded-full transition-all duration-200"
          >
            اتفرج على الـ Collection
          </a>
        </section>

        {/* ─── FINAL FOLLOW CTA ─── */}
        <section className="flex flex-col items-center gap-4 text-center pb-4">
          <p className="text-sm text-zinc-400" dir="rtl">
            عايز تشوف gear جديد ودـ deals وتips كل أسبوع؟
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold px-6 py-3 rounded-full transition-all duration-200"
          >
            Follow @pulsegear_egypt على Instagram
          </a>
          <p className="text-sm text-zinc-600" dir="rtl">
            اتكلم معانا في الكومنتس على الـ reel
          </p>
        </section>

      </article>
    </main>
  );
}