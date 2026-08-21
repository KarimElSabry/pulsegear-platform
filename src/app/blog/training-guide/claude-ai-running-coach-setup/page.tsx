// src/app/blog/training-guide/claude-ai-running-coach-setup/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeCoachClient } from "./ClaudeCoachClient";

const SITE_URL = "https://pulsegear-platform.vercel.app";
const SHOP_URL  = "https://pulsegear-platform.vercel.app/products";
const BLOG_URL  = "https://pulsegear-platform.vercel.app/blog";
const INSTAGRAM_URL = "https://instagram.com/pulsegear_egypt";
const ADVANCED_URL  = "/blog/training-guide/claude-coach-watch-telegram";

export const metadata: Metadata = {
  title: "خلي Claude AI يقرأ تمرينك كل يوم لوحده — دليل الإعداد الكامل",
  description:
    "دليل خطوة بخطوة لربط Strava أو Garmin بـ Claude AI عن طريق athletedata.health وبناء dashboard يتحدث تلقائياً كل يوم. للرياضيين المصريين اللي عايزين إجابات حقيقية من داتاهم.",
  keywords: [
    "Claude AI running coach",
    "Strava Claude AI",
    "Garmin Claude AI",
    "athletedata.health",
    "running dashboard Egypt",
    "AI training plan Egypt",
    "تريننج",
    "Claude AI",
  ],
  openGraph: {
    title: "خلي Claude AI يقرأ تمرينك كل يوم لوحده",
    description:
      "ربط Strava أو Garmin بـ Claude AI، بناء dashboard يتحدث تلقائياً، وتحليل يومي شخصي. للرياضيين المصريين.",
    type: "article",
    url: `${SITE_URL}/blog/training-guide/claude-ai-running-coach-setup`,
    images: [
      {
        url: `${SITE_URL}/og-claude-coach.jpg`,
        width: 1200,
        height: 630,
        alt: "Claude AI Running Coach Setup - Pulse Gear Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "خلي Claude AI يقرأ تمرينك كل يوم لوحده",
    description:
      "ربط Strava أو Garmin بـ Claude AI وتحليل يومي تلقائي. للرياضيين المصريين.",
    images: [`${SITE_URL}/og-claude-coach.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/blog/training-guide/claude-ai-running-coach-setup`,
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const requirements = [
  {
    icon: "🏃",
    what: "Strava or Garmin account with your activities",
    free: true,
    where: "strava.com or connect.garmin.com",
    href: "https://www.strava.com",
  },
  {
    icon: "🔗",
    what: "athletedata.health account",
    free: true,
    where: "athletedata.health",
    href: "https://athletedata.health",
  },
  {
    icon: "🤖",
    what: "Claude account",
    free: true,
    where: "claude.ai",
    href: "https://claude.ai",
  },
  {
    icon: "💻",
    what: "Claude Code on your laptop (for auto-updates)",
    free: true,
    where: "claude.ai/code",
    href: "https://claude.ai/code",
  },
];

const steps = [
  {
    number: "01",
    color: "border-blue-500/40 bg-blue-500/5",
    numberColor: "text-blue-400",
    accentColor: "bg-blue-500",
    title: "Connect Your Training Apps to athletedata.health",
    why: "athletedata.health is the bridge between your training apps (Strava, Garmin, COROS, etc.) and Claude AI. Without this connection, Claude cannot read your data. It can only read what you paste manually.",
    instructions: [
      "Go to athletedata.health",
      "Create a free account with your email",
      "Click Connect Apps",
      "Choose your app: Strava, Garmin, COROS, Polar, Wahoo, Suunto, or WHOOP",
      "Log in to that app and click Authorize when it asks",
      "Wait 2 to 3 minutes for your history to sync",
    ],
    success:
      "You will know it worked when you see your recent activities listed on athletedata.health",
    warning:
      "If you see zero activities, your sync is still running. Give it 5 minutes and refresh. If it is still empty, disconnect and reconnect the app.",
    tip: {
      flag: "🇪🇬",
      text: "لو بتستخدم Strava و Garmin مع بعض، وصّل Garmin. بيديك sleep و HRV وبيانات القلب اللي Strava مش بيشاركها. كل ما البيانات أكتر، كل ما التحليل أحسن.",
      dir: "rtl",
    },
  },
  {
    number: "02",
    color: "border-purple-500/40 bg-purple-500/5",
    numberColor: "text-purple-400",
    accentColor: "bg-purple-500",
    title: "Get Claude Code on Your Laptop",
    why: "Claude.ai on the web is great for one-time analysis. But for automatic daily updates, you need Claude Code, the version that runs on your computer and can be scheduled like an alarm.",
    instructions: [
      "Go to claude.ai/code",
      "Download Claude Code for your operating system (Windows / Mac / Linux)",
      "Install it like any normal app",
      "Open your terminal (Command Prompt on Windows, Terminal on Mac)",
      "Type this and press Enter:",
    ],
    terminalCommand: "claude",
    success: "If you see a welcome message, you are good to go.",
    tip: {
      flag: "💡",
      text: "مش عارف تشتغل بالـ terminal؟ مش مشكلة. الخطوات 1 لـ 4 شغالة من غيره. بس مش هتاخد الـ auto-update اليومي. تقدر ترجع وتضيفه بعدين.",
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
    why: "You are telling Claude Code to use athletedata.health as a live data source. So every time you ask Claude something, it reads your fresh training data automatically.",
    instructions: ["Do this inside Claude Code (paste this message):"],
    success:
      "You will know it is connected when you ask Claude how many km you ran last week and it gives you the real number, not a generic answer.",
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
      "Your laptop needs to be on at 7am for this to run. If it is off, it runs the next time it is on and it is past 7am. You can change the time by telling Claude to run it at 6am or 9am instead.",
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
    a: "The free tier of Claude handles everything in this guide. You do not need a paid plan to start. If you run into limits, it tells you when you do. The paid plan is affordable and worth it if you use this daily.",
    aAr: "الـ free plan بتاع Claude بيعمل كل حاجة في الـ guide ده. مش محتاج تدفع عشان تبدأ. لو وصلت للـ limit هيقولك. لو بتستخدمه كل يوم، الـ paid plan بسعر كويس وبيستاهل.",
  },
  {
    q: "My Garmin is connected to Strava. Do I connect Garmin or Strava to athletedata.health?",
    qAr: "Garmin بتاعي متوصل بـ Strava. أوصّل Garmin ولا Strava بـ athletedata.health؟",
    a: "Connect Garmin directly if you can. Garmin shares heart rate, HRV, sleep, and recovery data. Strava only shares pace and distance. More data means Claude gives you better answers.",
    aAr: "وصّل Garmin مباشرة لو قدرت. Garmin بيشارك بيانات القلب و HRV والنوم والريكفري. Strava بيشارك بس الـ pace والمسافة. كل ما البيانات أكتر، كل ما إجابات Claude أحسن.",
    suffix: "اتصل بالاتنين لو ممكن.",
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
    a: "Yes. Steps 1 and 5 work on claude.ai without installing anything. You just will not get the automatic daily update from Step 6. You would need to open claude.ai and paste the prompt manually each time you want a fresh analysis.",
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
    a: "Usually one of two things: your athletedata.health connection did not authorize fully (disconnect and reconnect), or the sync is still running (wait 10 minutes and try again). Never accept a dashboard full of zeros as working. Claude will tell you clearly if data is missing.",
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

const relatedPosts = [
  {
    href: ADVANCED_URL,
    label: "المستوى التاني",
    title: "خلي Claude يبعت تمرينك على ساعتك ويكلمك على Telegram لوحده",
    tag: "Advanced · intervals.icu + Telegram",
    accent: "border-cyan-500/30 hover:border-cyan-500/60",
    tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function ClaudeAIRunningCoachPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Level badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wide text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              Level 1 · المبتدئ
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
              Training Guide · AI Tools
            </span>
          </div>

          {/* Hook */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-red-400 uppercase tracking-widest" dir="ltr">
              Watched the reel? Full setup is right here.
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight" dir="rtl">
              خلي Claude AI يقرأ
              <br />
              <span className="text-red-500">تمرينك كل يوم</span>
              <br />
              لوحده.
            </h1>
            <p className="text-base text-zinc-300 leading-relaxed max-w-xl" dir="ltr">
              Connect Strava or Garmin once. Claude builds your personal dashboard
              and updates it every morning automatically. No copy-paste. No
              spreadsheets. 15 minutes to set up.
            </p>
          </div>

          {/* Trust Bar */}
          <div className="flex items-center gap-4 text-sm text-zinc-500 flex-wrap" dir="ltr">
            <span>🇪🇬 For Egyptian Runners</span>
            <span>·</span>
            <span>⏱ 15 min setup</span>
            <span>·</span>
            <span>✅ 100% Free</span>
            <span>·</span>
            <span>🤖 Claude AI</span>
          </div>

          {/* Level upgrade teaser */}
          <Link
            href={ADVANCED_URL}
            className="group bg-zinc-900 border border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-200"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wide text-cyan-400" dir="ltr">
                Level 2 متاح كمان
              </span>
              <p className="text-sm font-bold text-white" dir="rtl">
                عايز Claude يبعت تمرينك على ساعتك ويكلمك على Telegram؟
              </p>
            </div>
            <span className="text-cyan-400 text-xl group-hover:translate-x-1 transition-transform duration-200 shrink-0">
              ←
            </span>
          </Link>

          {/* Follow CTA */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-white" dir="rtl">
                عجبك الـ tutorial؟
              </p>
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
              هتعمل إيه في الـ 15 دقيقة دول:
            </p>
            {[
              {
                icon: "🗂️",
                text: "Dashboard شخصي بيعرض pace trends و weekly load و fitness vs fatigue في ملف HTML واحد",
                dir: "rtl" as const,
              },
              {
                icon: "🔄",
                text: "Auto-update كل يوم الصبح من غير ما تعمل حاجة",
                dir: "rtl" as const,
              },
              {
                icon: "🤖",
                text: "تقدر تسأل Claude عن آخر 4 أسابيع، الأسبوع الجاي، أو لو بتعمل overtraining",
                dir: "rtl" as const,
              },
              {
                icon: "📱",
                text: "شغال على أي device، desktop أو موبايل، من غير app",
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
              <p className="text-sm font-bold text-white" dir="rtl">
                بتدور على الـ running gear الصح؟
              </p>
              <p className="text-sm text-zinc-400" dir="rtl">
                الـ gear اللي بنستخدمه، متاح دلوقتي.
              </p>
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

        {/* ─── REQUIREMENTS ─── */}
        <section id="requirements" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">
              ⚙️ What You Need Before Starting
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              اللي محتاجه قبل ما نبدأ، كله مجاناً
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">What</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">Free?</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">Where</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {requirements.map((req) => (
                  <tr key={req.what} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span>{req.icon}</span>
                        <span className="text-zinc-300 text-sm leading-relaxed" dir="ltr">
                          {req.what}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-green-400 font-bold text-sm">✅ Free</span>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={req.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                        dir="ltr"
                      >
                        {req.where}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🪟</span>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">
              <span className="text-white font-bold">Note for Egyptian runners:</span>{" "}
              Claude Code works on Windows, Mac, and Linux. Chrome or Edge works best.
            </p>
          </div>
        </section>

        {/* ─── STEPS ─── */}
        <section id="steps" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="rtl">
              الخطوات، واحدة واحدة 📋
            </h2>
            <p className="text-sm text-zinc-500" dir="ltr">
              One at a time. Do not skip ahead.
            </p>
          </div>
          <ClaudeCoachClient steps={steps} />
        </section>

        {/* ─── MID-PAGE FOLLOW CTA ─── */}
        <section className="bg-gradient-to-br from-purple-600/15 to-pink-600/10 border border-purple-500/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <span className="text-3xl">📲</span>
          <h3 className="text-lg font-bold text-white" dir="rtl">
            عجبك الـ setup لحد هنا؟
          </h3>
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

        {/* ─── FAQ ─── */}
        <section id="faq" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">
              ❓ Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              أسئلة شايفينها كتير
            </p>
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
                  <p className="text-sm text-zinc-300 leading-relaxed" dir="ltr">
                    {faq.a}
                    {faq.suffix && (
                      <span dir="rtl" className="block mt-1 text-sm text-zinc-400">
                        {faq.suffix}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed border-t border-zinc-800/60 pt-3" dir="rtl">
                    {faq.aAr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── QUICK REFERENCE ─── */}
        <section id="quick-reference" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">
              📌 Quick Reference Commands
            </h2>
            <p className="text-sm text-zinc-500" dir="ltr">
              Save these. You will use them every week.
            </p>
          </div>
          <ClaudeCoachClient quickCommands />
        </section>

        {/* ─── LIMITATIONS ─── */}
        <section id="limitations" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white" dir="ltr">
              ⚠️ What This Will Not Do
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              بكل صراحة، Claude مش بيعمل كل حاجة
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-sm font-bold uppercase tracking-wide text-red-400" dir="ltr">❌ Cannot do this</p>
              <div className="flex flex-col gap-3">
                {whatItWontDo.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-500 text-sm shrink-0 mt-0.5">✗</span>
                    <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900 border border-green-500/20 rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-sm font-bold uppercase tracking-wide text-green-400" dir="ltr">✅ Does this extremely well</p>
              <div className="flex flex-col gap-3">
                {whatItDoesBest.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-500 text-sm shrink-0 mt-0.5">✓</span>
                    <p className="text-sm text-zinc-400 leading-relaxed" dir="ltr">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CLOSING ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 text-center items-center">
          <span className="text-4xl">🏁</span>
          <h3 className="text-xl font-bold text-white" dir="rtl">
            يلا، الداتا بتاعتك جاهزة، Claude جاهز، انت بس كمل
          </h3>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed" dir="ltr">
            Most runners collect months of data and never look past the weekly
            summary. This setup changes that. Claude reads the full picture —
            your load, your recovery, your trend — and tells you what it means
            in plain language, every single morning.
          </p>
          <p className="text-sm text-zinc-300 font-bold" dir="ltr">
            Set it up once. Let it run. Focus on training.
          </p>
        </section>

        {/* ══════════════════════════════════════
            LEVEL UP CTA
        ══════════════════════════════════════ */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-wide text-zinc-500" dir="ltr">
            جاهز للمستوى التاني؟
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
              { emoji: "🏃", text: "شيرلنا الـ readiness verdict بتاعك", dir: "rtl" as const },
              { emoji: "❓", text: "عندك سؤال في أي خطوة؟ اسأل هنا", dir: "rtl" as const },
              { emoji: "🔥", text: "عجبك الـ setup؟ قولنا", dir: "rtl" as const },
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