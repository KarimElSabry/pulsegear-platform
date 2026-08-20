// src/app/blog/training-guide/claude-ai-running-coach-setup/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeCoachClient } from "./ClaudeCoachClient";

const SITE_URL = "https://pulsegear-platform.vercel.app";

export const metadata: Metadata = {
  title: "How to Make Claude AI Your Personal Running Coach (Auto-Setup Guide)",
  description:
    "Step-by-step guide to connecting Strava or Garmin to Claude AI through athletedata.health — and making your training dashboard update itself automatically. For Egyptian runners who want real answers from their data.",
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
    title: "How to Connect Strava & Garmin to Claude AI (Auto Dashboard Setup)",
    description:
      "Step-by-step guide for Egyptian runners to connect training data to Claude AI, build an auto-updating dashboard, and get daily personalized training insights.",
    type: "article",
    url: `${SITE_URL}/blog/training-guide/claude-ai-running-coach-setup`,
    images: [
      {
        url: `${SITE_URL}/og-claude-coach.jpg`,
        width: 1200,
        height: 630,
        alt: "Claude AI Running Coach Setup — Pulse Gear Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Make Claude AI Your Personal Running Coach",
    description:
      "Connect Strava or Garmin to Claude AI and get automatic daily training analysis. For Egyptian runners.",
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
    why: "athletedata.health is the bridge between your training apps (Strava, Garmin, COROS, etc.) and Claude AI. Without this connection, Claude can't read your data — it can only read what you paste manually.",
    instructions: [
      "Go to athletedata.health",
      "Create a free account with your email",
      'Click "Connect Apps"',
      "Choose your app — Strava, Garmin, COROS, Polar, Wahoo, Suunto, or WHOOP",
      'Log in to that app and click "Authorize" when it asks',
      "Wait 2–3 minutes for your history to sync ⏳",
    ],
    success: "You'll know it worked when you see your recent activities listed on athletedata.health",
    warning: "If you see zero activities: your sync is still running — give it 5 minutes and refresh. If it's still empty, disconnect and reconnect the app.",
    tip: {
      flag: "🇪🇬",
      text: "If you use both Strava and Garmin — connect Garmin. Garmin gives you sleep, HRV, and heart rate data that Strava doesn't share. More data = better analysis.",
    },
  },
  {
    number: "02",
    color: "border-purple-500/40 bg-purple-500/5",
    numberColor: "text-purple-400",
    accentColor: "bg-purple-500",
    title: "Get Claude Code on Your Laptop",
    why: "Claude.ai (the website) is great for one-time analysis. But for automatic daily updates, you need Claude Code — the version that runs on your computer and can be scheduled like an alarm.",
    instructions: [
      "Go to claude.ai/code",
      "Download Claude Code for your operating system (Windows / Mac / Linux)",
      "Install it — it's like installing any normal app",
      "Open your terminal (Command Prompt on Windows, Terminal on Mac)",
      "Type this and press Enter:",
    ],
    terminalCommand: "claude",
    success: "If you see a welcome message — تمام، شغال 🎉",
    tip: {
      flag: "💡",
      text: "مش عارف تشتغل بالـ terminal؟ No problem — Steps 1–4 still work without it. You just won't get the automatic daily update. You can always come back and add that part later.",
    },
  },
  {
    number: "03",
    color: "border-green-500/40 bg-green-500/5",
    numberColor: "text-green-400",
    accentColor: "bg-green-500",
    title: "Create Your Project Folder",
    why: null,
    instructions: [
      "Open your terminal and run these commands one at a time:",
    ],
    terminalCommands: [
      "mkdir my-running-coach",
      "cd my-running-coach",
      "claude",
    ],
    warning: "Don't delete this folder. Everything — your dashboard, your data, your settings — lives here.",
  },
  {
    number: "04",
    color: "border-yellow-500/40 bg-yellow-500/5",
    numberColor: "text-yellow-400",
    accentColor: "bg-yellow-500",
    title: "Connect Claude to Your Training Data (MCP Setup)",
    why: "You're telling Claude Code to use athletedata.health as a live data source — so every time you ask Claude something, it reads your fresh training data automatically.",
    instructions: [
      "Do this inside Claude Code (paste this message):",
    ],
    success: 'You\'ll know it\'s connected when you ask Claude "how many km did I run last week?" and it gives you the real number — not a generic answer.',
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
    title: "Make It Automatic (Daily Auto-Update) ⭐",
    why: "Instead of you going to Claude every day, Claude checks your new workouts every morning and updates your dashboard automatically.",
    instructions: [
      "Paste this into Claude Code:",
    ],
    afterSteps: [
      "You finish a run tonight 🏃",
      "Garmin or Strava syncs it (usually within 15 minutes)",
      "Tomorrow morning at 7am Claude pulls the new data automatically",
      "You open dashboard.html and it already has yesterday's run included",
    ],
    warning: "Your laptop needs to be on at 7am for this to run. If it's off, it runs the next time it's on and it's past 7am. You can change the time — just tell Claude \"run it at 6am\" or \"run it at 9am\" instead.",
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
    a: "The free tier of Claude handles everything in this guide. You don't need a paid plan to start. If you run into limits (it tells you when you do), the paid plan is affordable and worth it if you use this daily.",
  },
  {
    q: "My Garmin is connected to Strava — do I connect Garmin or Strava to athletedata.health?",
    a: "Connect Garmin directly if you can. Garmin shares heart rate, HRV, sleep, and recovery data. Strava only shares pace and distance. More data = Claude gives you better answers. اتصل بالاتنين لو ممكن.",
  },
  {
    q: "What if my activities don't show up?",
    a: "Give it 5–10 minutes after connecting. If it's still empty, disconnect and reconnect your app in athletedata.health settings. If Garmin specifically is missing HR or sleep data, check that you authorized all scopes (wellness and sleep) when you connected, not just activities.",
  },
  {
    q: "Can I use this without Claude Code (just claude.ai on the web)?",
    a: "Yes — Steps 1 and 5 work on claude.ai without installing anything. You just won't get the automatic daily update from Step 6. You would need to open claude.ai and paste the prompt manually each time you want a fresh analysis.",
  },
  {
    q: "Is my training data private?",
    a: "Your data goes from your app → athletedata.health → Claude. It is not shared publicly. Check the privacy policies of athletedata.health and Anthropic (Claude's maker) if you want the full details. As a rule: don't include personal information (name, location, phone number) in your prompts.",
  },
  {
    q: "I got zero activities in my dashboard — what's wrong?",
    a: "Usually one of two things: your athletedata.health connection didn't authorize fully (disconnect and reconnect), or the sync is still running (wait 10 minutes and try again). Never accept a dashboard full of zeros as working. Claude will tell you clearly if data is missing.",
  },
  {
    q: "I don't have a race goal right now — can I still use this?",
    a: 'تمام — just write "no fixed date, building base" in the goal section. Claude will give you a 10-week base-building plan and a dashboard that tracks your weekly volume and fitness trend without a countdown.',
  },
];

const whatItWontDo = [
  "It cannot watch your workout in real time",
  "It cannot contact your doctor or adjust medication",
  "It cannot guarantee race results — it gives analysis, not promises",
  "It cannot replace a qualified running coach for elite-level training",
  "It will not invent numbers if data is missing — it will tell you the data is absent",
];

const whatItDoesBest = [
  "Spots patterns in your data that you would never catch manually",
  "Gives you honest feedback without sugarcoating",
  "Answers specific questions about your specific numbers",
  "Updates your plan as your fitness changes — not a one-size plan",
  "Saves you hours of trying to interpret Garmin's own graphs",
];

const relatedArticles = [
  {
    href: "/blog/training-guide/heart-rate-zones",
    icon: "📊",
    tag: "Training Guide",
    title: "Heart Rate Zones Explained",
  },
  {
    href: "/blog/training-guide/zone-2-training",
    icon: "🫀",
    tag: "Training Guide",
    title: "Zone 2 Training: سر الـ Elite Athletes",
  },
  {
    href: "/blog/training-guide/complete-training-setup",
    icon: "🔧",
    tag: "Training Guide",
    title: "Complete Training Setup 2026",
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
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap">
            <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">Blog</Link>
            <span>/</span>
            <Link href="/blog/training-guide" className="hover:text-white transition-colors duration-200">Training Guide</Link>
            <span>/</span>
            <span className="text-zinc-400">Claude AI Running Coach</span>
          </div>

          {/* Tag */}
          <span className="self-start text-xs font-bold uppercase tracking-wide text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            Training Guide · AI Tools
          </span>

          {/* Hero Label */}
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
            🏃‍♂️ Claude بيحلل تريننجك أوتوماتيك؟ يلا نعمل ده دلوقتي.
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Turn Your Running Data Into a
            <br />
            <span className="text-red-500">Personal Coach</span>
            <br />
            — Automatically
          </h1>

          {/* Subheadline */}
          <p className="text-lg font-bold text-zinc-300 leading-relaxed">
            No copy-paste. No spreadsheets. Connect once, and Claude AI reads your Strava or Garmin data, builds your dashboard, and adjusts your training plan — every single day.
          </p>

          {/* Intro */}
          <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
            بجد — most runners have way more data than they know what to do with. You finish a 10K, Garmin shows you 47 numbers, and you still don't know if you trained too hard or not hard enough. This guide sets up Claude AI to answer that for you — automatically, in plain language, every morning before you even lace up.
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 15 min read</span>
            <span>•</span>
            <span>🤖 AI Tools</span>
            <span>•</span>
            <span>🇪🇬 For Egyptian Runners</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* What You'll Build */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              ✅ What you get at the end of this guide:
            </p>
            {[
              { icon: "🗂️", text: "A personal training dashboard — pace trends, weekly load, fitness vs fatigue — in one HTML file you open like a normal webpage" },
              { icon: "🔄", text: "Automatic daily updates — Claude checks for new workouts every morning without you doing anything" },
              { icon: "🤖", text: "A prompt you send to Claude — ask it to analyze your last 4 weeks, write your next training week, or tell you if you're overtraining" },
              { icon: "📱", text: "Works on any device — desktop, phone, tablet — no app to install" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-sm text-zinc-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#requirements", label: "What You Need Before Starting" },
              { href: "#steps", label: "Step-by-Step Setup (7 Steps)" },
              { href: "#faq", label: "Frequently Asked Questions" },
              { href: "#quick-reference", label: "Quick Reference Commands" },
              { href: "#limitations", label: "What This Won't Do" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-red-500 transition-colors duration-200 shrink-0" />
                {item.label}
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          ARTICLE BODY
      ══════════════════════════════════════ */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ─── REQUIREMENTS ─── */}
        <section id="requirements" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              ⚙️ What You Need Before Starting
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              اللي محتاجه قبل ما نبدأ — كله مجاناً
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
                        <span className="text-zinc-300 text-xs leading-relaxed">{req.what}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-green-400 font-bold text-xs">✅ Free</span>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={req.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                      >
                        {req.where}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Windows note */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
            <span className="text-lg shrink-0">🪟</span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-white font-bold">Note for Egyptian runners:</span>{" "}
              Claude Code works on Windows, Mac, and Linux. If you're on Windows, خليك على Chrome or Edge — it works fine.
            </p>
          </div>
        </section>

        {/* ─── STEPS ─── */}
        <section id="steps" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              📋 الخطوات — follow them in order
            </h2>
            <p className="text-sm text-zinc-500">
              One at a time. Don't skip ahead.
            </p>
          </div>

          {/* Pass steps data to Client Component for interactive copy buttons */}
          <ClaudeCoachClient steps={steps} />
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
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
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <p className="font-bold text-white text-sm">
                  🔸 {faq.q}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── QUICK REFERENCE ─── */}
        <section id="quick-reference" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              📌 Quick Reference Commands
            </h2>
            <p className="text-sm text-zinc-500">Save these — you'll use them every week.</p>
          </div>
          {/* Quick commands with copy buttons — Client Component */}
          <ClaudeCoachClient quickCommands />
        </section>

        {/* ─── LIMITATIONS ─── */}
        <section id="limitations" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              ⚠️ What This Won't Do
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              بكل صراحة — Claude مش بيعمل كل حاجة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Won't do */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                ❌ Can't do this
              </p>
              <div className="flex flex-col gap-3">
                {whatItWontDo.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-500 text-xs shrink-0 mt-0.5">✗</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Does best */}
            <div className="bg-zinc-900 border border-green-500/20 rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-wide text-green-400">
                ✅ Does this extremely well
              </p>
              <div className="flex flex-col gap-3">
                {whatItDoesBest.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-500 text-xs shrink-0 mt-0.5">✓</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CLOSING ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 text-center items-center">
          <span className="text-4xl">🏁</span>
          <h3 className="text-xl font-black uppercase text-white">
            يلا — الداتا بتاعتك جاهزة، Claude جاهز، انت بس كمل
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            Most runners collect months of data and never look past the weekly summary. This setup changes that. Claude reads the full picture — your load, your recovery, your trend — and tells you what it means in plain language, every single morning.
          </p>
          <p className="text-zinc-300 text-sm font-bold">
            Set it up once. Let it run. Focus on training.
          </p>
          <p className="text-zinc-500 text-xs" dir="rtl">
            اتكلم معانا في الكومنتس — شيرلنا الـ readiness verdict بتاعك لما تخلص الـ setup 👇
          </p>
        </section>

        {/* ─── RELATED ARTICLES ─── */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
              >
                <span className="text-2xl">{article.icon}</span>
                <p className="text-xs font-bold uppercase tracking-wide text-purple-400">
                  {article.tag}
                </p>
                <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors duration-200" dir="rtl">
                  {article.title}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Back */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
          >
            ← Back to Blog
          </Link>
        </div>

      </article>
    </main>
  );
}