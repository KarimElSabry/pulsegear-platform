// src/app/blog/training-guide/sleep-recovery/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sleep & Recovery | Pulse Gear Egypt Blog",
  description:
    "الجزء اللي بتتجاهله في تدريبك — ليه النوم والـ Recovery هم السر الحقيقي وراء كل Athlete ناجح.",
  openGraph: {
    title: "Sleep & Recovery | Pulse Gear Egypt Blog",
    description:
      "الجزء اللي بتتجاهله في تدريبك — ليه النوم والـ Recovery هم السر الحقيقي.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const whySleepMatters = [
  {
    icon: "🧬",
    title: "Muscle Repair & Growth",
    desc: "في الـ Deep Sleep (Stage 3 & 4)، الجسم بيفرز الـ Growth Hormone بأعلى معدل. ده الوقت اللي العضلات بتتبني فيه فعلاً، مش في التمرين.",
  },
  {
    icon: "🧠",
    title: "Motor Learning & Skill Retention",
    desc: "الـ REM Sleep بيثبت الـ Motor Patterns اللي اتعلمتها في التمرين. لو بتتمرن على Technique جديدة، النوم هو اللي بيخليها تتثبت في جسمك.",
  },
  {
    icon: "❤️",
    title: "Heart Rate & HRV Recovery",
    desc: "الـ Resting HR والـ HRV بيرجعوا للـ Baseline بتاعهم أثناء النوم. الـ Garmin والـ Polar بيقيسوا الـ HRV أثناء النوم عشان يحسبوا الـ Recovery Score بتاعك.",
  },
  {
    icon: "⚡",
    title: "Glycogen Replenishment",
    desc: "الجسم بيعيد تخزين الـ Glycogen (وقود العضلات) أثناء النوم. قلة النوم = عضلات فاضية من الوقود في التمرين الجاي.",
  },
  {
    icon: "🛡️",
    title: "Immune System Boost",
    desc: "الـ Cytokines (بروتينات الجهاز المناعي) بتتفرز أثناء النوم. Athletes بيناموا أقل من 6 ساعات عندهم 4x أكتر احتمال للإصابة بالمرض.",
  },
  {
    icon: "🎯",
    title: "Cortisol Regulation",
    desc: "قلة النوم بترفع الـ Cortisol (هرمون الإجهاد)، اللي بيكسر العضلات ويزود الـ Body Fat. نوم كافي = Cortisol منخفض = جسم بيبني مش بيهدم.",
  },
];

const sleepStages = [
  {
    stage: "Stage 1 — Light Sleep",
    duration: "5-10 دقائق",
    color: "border-zinc-600 bg-zinc-800/30",
    tagColor: "text-zinc-400",
    what: "انتقال من الصحيان للنوم، العضلات بتسترخي، الـ HR بيبدأ ينزل.",
    forAthletes: "مش مهم جداً للـ Recovery، بس لازم تعدي بيه عشان توصل للـ Stages الأعمق.",
  },
  {
    stage: "Stage 2 — Core Sleep",
    duration: "20-30 دقيقة",
    color: "border-blue-500/30 bg-blue-500/5",
    tagColor: "text-blue-400",
    what: "الـ HR والـ Body Temperature بينزلوا، الـ Brain بيبدأ يعمل Sleep Spindles.",
    forAthletes: "مهم للـ Memory Consolidation والـ Motor Learning. الـ 20-min Power Nap بيوصلك لـ Stage 2 بس.",
  },
  {
    stage: "Stage 3 — Deep Sleep (SWS)",
    duration: "20-40 دقيقة",
    color: "border-purple-500/30 bg-purple-500/5",
    tagColor: "text-purple-400",
    what: "أعمق مرحلة نوم، الـ HR في أدنى مستوياته، الـ Growth Hormone بيتفرز.",
    forAthletes: "⭐ الأهم للـ Physical Recovery. العضلات بتتصلح هنا. قلة الـ Deep Sleep = قلة الـ Recovery.",
  },
  {
    stage: "REM Sleep",
    duration: "20-25 دقيقة",
    color: "border-red-500/30 bg-red-500/5",
    tagColor: "text-red-400",
    what: "الـ Brain نشيط زي الصحيان، الأحلام بتحصل هنا، الـ Eyes بتتحرك بسرعة.",
    forAthletes: "⭐ مهم للـ Mental Recovery والـ Skill Learning. بيتزيد في الـ Cycles الأخيرة من الليل.",
  },
];

const hrvExplained = [
  {
    metric: "HRV مرتفع",
    icon: "✅",
    color: "border-green-500/30 bg-green-500/5 text-green-400",
    meaning: "الجهاز العصبي اللاإرادي في حالة ممتازة، الجسم جاهز للتمرين الشديد.",
    action: "اتمرن بجد، Zone 4-5 مناسب النهارده.",
  },
  {
    metric: "HRV منخفض",
    icon: "⚠️",
    color: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    meaning: "الجسم لسه بيتعافى، ممكن يكون من تمرين شديد أو قلة نوم أو إجهاد.",
    action: "Zone 1-2 بس، أو Rest Day كامل.",
  },
  {
    metric: "HRV منخفض جداً لأيام",
    icon: "🚨",
    color: "border-red-500/30 bg-red-500/5 text-red-400",
    meaning: "علامة على Overtraining أو مرض قادم أو إجهاد نفسي شديد.",
    action: "خد Rest Days متعددة، راجع الـ Training Load، ونامي أكتر.",
  },
];

const garminRecoveryFeatures = [
  {
    feature: "Body Battery",
    watch: "Forerunner 265 / 965 / Fenix 7",
    icon: "🔋",
    desc: "بيحسب مستوى طاقتك من 0 لـ 100 بناءً على الـ HRV والنوم والنشاط. Body Battery فوق 70 = جاهز للتمرين الشديد.",
  },
  {
    feature: "Sleep Score",
    watch: "كل الـ Garmin Watches الحديثة",
    icon: "😴",
    desc: "بيقيّم جودة نومك من 0 لـ 100، بيحسب الـ Deep Sleep والـ REM والـ Light Sleep والاستيقاظات.",
  },
  {
    feature: "HRV Status",
    watch: "Forerunner 265 / 965 / Fenix 7",
    icon: "📊",
    desc: "بيتابع الـ HRV لمدة 5 دقائق أثناء النوم ويديك Trend على مدى 4 أسابيع. أهم مؤشر للـ Recovery.",
  },
  {
    feature: "Training Readiness",
    watch: "Forerunner 965 / Fenix 7",
    icon: "🎯",
    desc: "Score من 0 لـ 100 بيجمع الـ HRV والـ Sleep والـ Training Load والـ Recovery Time. بيقولك صراحة: اتمرن ولا استنى.",
  },
  {
    feature: "Recovery Time",
    watch: "كل الـ Garmin Watches الحديثة",
    icon: "⏱",
    desc: "بعد كل تمرين، بيحسب كام ساعة محتاج قبل ما تتمرن تاني. بيبني على الـ Training Load والـ HR Data.",
  },
];

const recoveryTools = [
  {
    tool: "Foam Roller",
    price: "~500 EGP",
    icon: "🪵",
    timing: "بعد كل تمرين، 10-15 دقيقة",
    how: "اشتغل على الـ Calves والـ IT Band والـ Quads والـ Thoracic Spine. كل منطقة 60-90 ثانية.",
    science: "بيزود الـ Blood Flow للعضلات ويقلل الـ DOMS بنسبة تصل لـ 30% في الـ 48 ساعة الأولى.",
  },
  {
    tool: "Theragun / Massage Gun",
    price: "~5,000-10,000 EGP",
    icon: "🔫",
    timing: "قبل التمرين (Activation) وبعده (Recovery)",
    how: "قبل التمرين: 30 ثانية على كل عضلة للـ Activation. بعده: 2 دقيقة على العضلات المتعبة.",
    science: "الـ Percussive Therapy بتزود الـ Blood Flow وتقلل الـ Muscle Tension أسرع من الـ Foam Rolling.",
  },
  {
    tool: "Polar H10 + HRV Tracking",
    price: "~4,500 EGP",
    icon: "🫀",
    timing: "كل صبح، 5 دقائق قبل ما تقوم",
    how: "استخدم Polar H10 مع Elite HRV App أو Polar Flow. قيس الـ HRV وانت مستلقي قبل ما تقوم من السرير.",
    science: "الـ Morning HRV Reading هو أدق وقت للقياس. بيديك صورة واضحة عن حالة الجهاز العصبي.",
  },
  {
    tool: "Compression Gear",
    price: "~1,000-2,000 EGP",
    icon: "🧦",
    timing: "أثناء التمرين وبعده لـ 2-4 ساعات",
    how: "Compression Socks أو Tights بعد الـ Long Runs والـ Races. بيساعد في الـ Venous Return.",
    science: "بيسرع إزالة الـ Lactic Acid من العضلات ويقلل الـ Swelling بعد التمارين الشديدة.",
  },
  {
    tool: "Ice Bath / Cold Exposure",
    price: "مجاناً تقريباً",
    icon: "🧊",
    timing: "بعد التمارين الشديدة جداً، 10-15 دقيقة في 10-15°C",
    how: "دوش بارد لـ 3-5 دقائق أو حوض بيه ثلج. مش لازم كل يوم، بعد الـ Hard Sessions بس.",
    science: "بيقلل الـ Inflammation ويسرع الـ Recovery، لكن ممكن يقلل الـ Muscle Adaptation لو اتعمل كتير.",
  },
];

const sleepOptimizationTips = [
  {
    category: "قبل النوم بـ 2 ساعة",
    icon: "🌆",
    color: "border-orange-500/30 bg-orange-500/5",
    tips: [
      "قلل الـ Blue Light (موبايل وتليفزيون)، استخدم Night Mode أو نضارات Blue Light Blocking",
      "خفف الأكل الثقيل، الجسم محتاج طاقة للـ Digestion مش للـ Recovery",
      "تجنب الكافيين، الـ Half-Life بتاعه 5-7 ساعات",
      "اعمل Foam Rolling خفيف أو Stretching لـ 10 دقائق",
    ],
  },
  {
    category: "بيئة النوم",
    icon: "🛏️",
    color: "border-blue-500/30 bg-blue-500/5",
    tips: [
      "درجة الحرارة: 18-20°C هي الأمثل للنوم العميق",
      "الظلام الكامل: أي ضوء بيقلل الـ Melatonin",
      "الهدوء: استخدم Earplugs أو White Noise لو في ضوضاء",
      "السرير للنوم بس، متشتغلش أو تتفرج فيه",
    ],
  },
  {
    category: "الـ Sleep Schedule",
    icon: "⏰",
    color: "border-green-500/30 bg-green-500/5",
    tips: [
      "نام وصحي في نفس الوقت كل يوم، حتى في الإجازات",
      "الـ Consistency في الـ Sleep Schedule أهم من عدد الساعات",
      "الـ Athletes المحترفين بيناموا 9-10 ساعات في الليالي قبل الـ Races",
      "الـ Power Nap (20 دقيقة) بعد الظهر بيعوض قلة النوم ويزود الـ Alertness",
    ],
  },
  {
    category: "بعد التمرين مباشرة",
    icon: "🏃",
    color: "border-red-500/30 bg-red-500/5",
    tips: [
      "Protein Shake أو وجبة بروتين في أول 30-60 دقيقة بعد التمرين",
      "Rehydration: اشرب 1.5x الوزن اللي خسرته في العرق",
      "Cool-Down صح: 10 دقائق Zone 1 + Stretching بيسرع الـ Recovery",
      "سجّل التمرين في الـ Garmin Connect عشان تتابع الـ Recovery Time",
    ],
  },
];

const weeklyRecoveryPlan = [
  { day: "الاثنين", type: "Hard", session: "Interval Training — Zone 4-5", recovery: "Foam Roller + Protein + 8h Sleep", hrv: "مش مهم، يوم تمرين شديد" },
  { day: "الثلاثاء", type: "Easy", session: "Easy Run 30 دقيقة — Zone 1-2", recovery: "Compression Socks + Hydration", hrv: "لو منخفض: حوّل لـ Rest Day" },
  { day: "الأربعاء", type: "Rest", session: "Complete Rest أو Yoga خفيف", recovery: "Theragun + Ice Bath لو محتاج", hrv: "قيس الصبح واتابع الـ Trend" },
  { day: "الخميس", type: "Hard", session: "Tempo Run — Zone 3-4", recovery: "Foam Roller + Protein + 8h Sleep", hrv: "لو فوق 70: اتمرن بجد" },
  { day: "الجمعة", type: "Easy", session: "Easy Run أو Cross-Training", recovery: "Stretching + Hydration", hrv: "لو منخفض: خفف الـ Intensity" },
  { day: "السبت", type: "Long", session: "Long Run — Zone 2", recovery: "Ice Bath + Compression + 9h Sleep", hrv: "مش مهم، يوم Long Run" },
  { day: "الأحد", type: "Rest", session: "Complete Rest", recovery: "Foam Roller خفيف + نوم كتير", hrv: "أهم قراءة في الأسبوع" },
];

const commonMistakes = [
  {
    mistake: "التمرين كل يوم بدون Rest Days",
    fix: "الجسم بيتحسن في الـ Recovery مش في التمرين. Rest Days مش كسل، ده جزء أساسي من البرنامج.",
  },
  {
    mistake: "النوم 5-6 ساعات وتوقع نتايج كويسة",
    fix: "الـ Athletes محتاجين 8-10 ساعات. كل ساعة نوم ناقصة بتقلل الـ Performance بنسبة ملحوظة.",
  },
  {
    mistake: "تجاهل الـ HRV وتمرين بنفس الـ Intensity كل يوم",
    fix: "استخدم الـ Garmin Training Readiness أو Polar Recovery Pro عشان تعرف امتى تضغط وامتى تخف.",
  },
  {
    mistake: "الأكل بعد التمرين بساعات",
    fix: "الـ Anabolic Window الأول 30-60 دقيقة بعد التمرين هو الأهم. Protein + Carbs فوراً.",
  },
  {
    mistake: "الـ Ice Bath كل يوم",
    fix: "الـ Cold Exposure بعد كل تمرين بيقلل الـ Muscle Adaptation. استخدمه بعد الـ Hard Sessions بس.",
  },
  {
    mistake: "تجاهل الـ Sleep Quality وركز على الساعات بس",
    fix: "8 ساعات نوم سيء أقل فائدة من 7 ساعات نوم عميق. اهتم بالـ Sleep Environment.",
  },
];

const keyTerms = [
  { term: "HRV", def: "Heart Rate Variability — الفرق الزمني بين ضربات القلب. أهم مؤشر للـ Recovery والـ Readiness. كلما ارتفع، كلما الجسم أكتر استعداداً." },
  { term: "Deep Sleep (SWS)", def: "Slow Wave Sleep — أعمق مرحلة نوم، فيها الـ Growth Hormone بيتفرز والعضلات بتتصلح. المفروض يكون 20-25% من إجمالي النوم." },
  { term: "REM Sleep", def: "Rapid Eye Movement — مرحلة الأحلام، مهمة للـ Mental Recovery والـ Motor Learning. بيتزيد في الـ Cycles الأخيرة من الليل." },
  { term: "DOMS", def: "Delayed Onset Muscle Soreness — الوجع اللي بتحس بيه 24-48 ساعة بعد التمرين. طبيعي وعلامة على الـ Muscle Adaptation." },
  { term: "Cortisol", def: "هرمون الإجهاد، بيرتفع مع قلة النوم والـ Overtraining. بيكسر العضلات ويزود الـ Body Fat." },
  { term: "Body Battery", def: "مؤشر في الـ Garmin Watches من 0-100 بيقيس مستوى طاقتك بناءً على الـ HRV والنوم والنشاط." },
  { term: "Training Readiness", def: "Score في الـ Garmin Forerunner 965 والـ Fenix 7 بيجمع كل مؤشرات الـ Recovery ويقولك هل تتمرن بجد ولا تخف." },
  { term: "Overtraining Syndrome", def: "حالة من الإجهاد المزمن بسبب تمرين كتير مع Recovery قليل. أعراضه: انخفاض الـ Performance والـ HRV وزيادة الـ Resting HR." },
];

const faqs = [
  {
    q: "كام ساعة نوم محتاج كـ Runner؟",
    a: "الـ Athletes محتاجين 8-10 ساعات، مش 7-8 زي الناس العادية. Roger Federer بيقول بينام 12 ساعة، LeBron James 10 ساعات. النوم هو الـ Performance Enhancer الأقوى والمجاني.",
  },
  {
    q: "الـ Garmin بيقيس الـ HRV صح؟",
    a: "الـ Garmin Forerunner 265 و965 والـ Fenix 7 بيقيسوا الـ HRV أثناء النوم بدقة كويسة. للدقة الأعلى، الـ Polar H10 مع Elite HRV App هو الأفضل في السوق.",
  },
  {
    q: "الـ Power Nap بيفيد فعلاً؟",
    a: "أيوه! 20 دقيقة بس بتزود الـ Alertness والـ Performance بنسبة ملحوظة. المهم متعدّيش 30 دقيقة عشان متدخلش في الـ Deep Sleep وتصحى تعبان.",
  },
  {
    q: "امتى أعمل Ice Bath؟",
    a: "بعد الـ Hard Sessions والـ Long Runs والـ Races. مش بعد كل تمرين، لأن الـ Cold Exposure المتكرر بيقلل الـ Muscle Adaptation على المدى البعيد.",
  },
  {
    q: "الـ Foam Roller قبل ولا بعد التمرين؟",
    a: "الاتنين! قبل التمرين: 5 دقائق Dynamic Rolling للـ Activation. بعد التمرين: 10-15 دقيقة Static Rolling للـ Recovery. الـ Foam Roller بعد التمرين هو الأهم.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function SleepRecoveryPage() {
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
            <span className="text-zinc-400">Sleep & Recovery</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-purple-500 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            Training Guide
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Sleep & Recovery 😴
            <br />
            <span className="text-red-500">الجزء اللي بتتجاهله في تدريبك</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            ممكن تتمرن كل يوم، تاكل صح، وتشتري أغلى الـ Gear — ولو نومك
            وـ Recovery بتاعك غلط، هتفضل في نفس المكان. النوم مش وقت
            ضايع، هو الوقت الوحيد اللي جسمك بيتحسن فيه فعلاً. 💪
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 8 min read</span>
            <span>•</span>
            <span>😴 Recovery Science</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Key Stat Banner */}
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">📊</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white">
                الـ Science بتقول إيه؟
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                دراسة على لاعبي Basketball في Stanford: زيادة النوم من 6 لـ 10 ساعات
                حسّنت الـ Sprint Speed بـ 5%، الـ Shooting Accuracy بـ 9%، وقلّلت
                الـ Reaction Time بشكل ملحوظ. كل ده من النوم بس.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#why-sleep", label: "ليه النوم مهم للـ Athletes؟" },
              { href: "#sleep-stages", label: "مراحل النوم وتأثيرها على الـ Performance" },
              { href: "#hrv-recovery", label: "الـ HRV — مؤشر الـ Recovery الأهم" },
              { href: "#garmin-features", label: "الـ Garmin وتتبع الـ Recovery" },
              { href: "#recovery-tools", label: "أدوات الـ Recovery الأساسية" },
              { href: "#sleep-tips", label: "إزاي تحسّن نومك؟" },
              { href: "#weekly-plan", label: "خطة Recovery أسبوعية" },
              { href: "#mistakes", label: "أكتر الأخطاء شيوعاً" },
              { href: "#faq", label: "الأسئلة الشائعة" },
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

        {/* ─── WHY SLEEP MATTERS ─── */}
        <section id="why-sleep" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              ليه النوم مهم للـ Athletes؟ 🧬
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              مش بس عشان تصحى نشيط — النوم هو الوقت الوحيد اللي جسمك بيتصلح فيه
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whySleepMatters.map((item) => (
              <div
                key={item.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="font-black text-white text-sm uppercase tracking-wide">
                    {item.title}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SLEEP STAGES ─── */}
        <section id="sleep-stages" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              مراحل النوم وتأثيرها على الـ Performance 🌙
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              مش كل النوم زي بعض — كل Stage ليه دور مختلف في الـ Recovery
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {sleepStages.map((stage) => (
              <div
                key={stage.stage}
                className={`border rounded-2xl overflow-hidden ${stage.color}`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-2">
                  <p className={`font-black uppercase text-sm ${stage.tagColor}`}>
                    {stage.stage}
                  </p>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                    {stage.duration}
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    <span className="text-white font-bold">إيه اللي بيحصل: </span>
                    {stage.what}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    <span className="text-red-400 font-bold">للـ Athletes: </span>
                    {stage.forAthletes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HRV ─── */}
        <section id="hrv-recovery" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ HRV — مؤشر الـ Recovery الأهم 📊
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              قيّم Recovery بتاعك بالأرقام، مش بالإحساس
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-sm font-bold text-white" dir="rtl">
              إيه هو الـ HRV؟
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
              الـ HRV (Heart Rate Variability) هو الفرق الزمني بين كل ضربة قلب
              والتانية. قلبك مش بيضرب زي الساعة بالضبط — في تفاوت طبيعي بين
              الضربات. لما الـ HRV مرتفع، ده معناه إن الجهاز العصبي اللاإرادي
              بتاعك مرن وصحي. لما بينزل، ده علامة على إجهاد أو مرض أو Overtraining.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {hrvExplained.map((item) => (
              <div
                key={item.metric}
                className={`border rounded-2xl p-5 flex flex-col gap-3 ${item.color.split(" ").slice(0, 2).join(" ")}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <p className={`font-black uppercase text-sm ${item.color.split(" ")[2]}`}>
                    {item.metric}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  <span className="text-white font-bold">المعنى: </span>
                  {item.meaning}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  <span className="text-red-400 font-bold">الإجراء: </span>
                  {item.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── GARMIN FEATURES ─── */}
        <section id="garmin-features" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Garmin وتتبع الـ Recovery ⌚
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              الـ Garmin Watches الحديثة مش بس بتقيس التمرين، بتتابع الـ Recovery كمان
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {garminRecoveryFeatures.map((item) => (
              <div
                key={item.feature}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-black text-white text-sm uppercase tracking-wide">
                        {item.feature}
                      </p>
                      <p className="text-xs text-red-400 font-bold">{item.watch}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Garmin CTA */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl shrink-0">🇪🇬</span>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-white">
                Garmin Watches متاحة في Pulse Gear Egypt
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                Forerunner 265، Forerunner 965، Fenix 7 — كلهم متاحين بأسعار
                مناسبة بالجنيه المصري. تواصل معانا عشان تعرف أنهي Watch يناسب
                مستواك وميزانيتك.
              </p>
              <Link
                href="/products"
                className="self-start bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-colors duration-200"
              >
                Browse Garmin Watches →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── RECOVERY TOOLS ─── */}
        <section id="recovery-tools" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              أدوات الـ Recovery الأساسية 🛠️
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              من أرخص الأدوات لأغلاها، وإزاي تستخدم كل واحدة صح
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {recoveryTools.map((item) => (
              <div
                key={item.tool}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="font-black text-white text-sm uppercase tracking-wide">
                      {item.tool}
                    </p>
                  </div>
                  <span className="text-sm font-black text-red-400">{item.price}</span>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    <span className="text-white font-bold">التوقيت: </span>
                    {item.timing}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    <span className="text-white font-bold">إزاي تستخدمه: </span>
                    {item.how}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-800 rounded-xl p-3" dir="rtl">
                    <span className="text-purple-400 font-bold">🔬 الـ Science: </span>
                    {item.science}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SLEEP TIPS ─── */}
        <section id="sleep-tips" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              إزاي تحسّن نومك؟ 🌙
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              تغييرات صغيرة بتفرق فرق كبير في جودة النوم
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {sleepOptimizationTips.map((category) => (
              <div
                key={category.category}
                className={`border rounded-2xl overflow-hidden ${category.color}`}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                  <span className="text-xl">{category.icon}</span>
                  <p className="font-black text-white text-sm uppercase tracking-wide">
                    {category.category}
                  </p>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  {category.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-red-400 text-xs shrink-0 mt-0.5 font-bold">
                        {i + 1}.
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WEEKLY PLAN ─── */}
        <section id="weekly-plan" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              خطة Recovery أسبوعية 📅
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              إزاي توازن بين التمرين والـ Recovery في أسبوع واحد
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {weeklyRecoveryPlan.map((day, i) => (
              <div
                key={day.day}
                className="flex flex-col md:flex-row gap-3 md:gap-0 px-5 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="md:w-24 shrink-0">
                  <p className="text-sm font-black text-white" dir="rtl">{day.day}</p>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                    day.type === "Hard" ? "bg-red-500/20 text-red-400" :
                    day.type === "Easy" ? "bg-green-500/20 text-green-400" :
                    day.type === "Long" ? "bg-blue-500/20 text-blue-400" :
                    "bg-zinc-700 text-zinc-400"
                  }`}>
                    {day.type}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1 md:px-4">
                  <p className="text-xs text-white font-bold" dir="rtl">{day.session}</p>
                  <p className="text-xs text-zinc-500" dir="rtl">{day.recovery}</p>
                </div>
                <div className="md:w-48 shrink-0">
                  <p className="text-xs text-zinc-500" dir="rtl">
                    <span className="text-purple-400 font-bold">HRV: </span>
                    {day.hrv}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MISTAKES ─── */}
        <section id="mistakes" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              أكتر الأخطاء شيوعاً ⚠️
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              اتعلم من غلطات الناس التانية، متعملهاش أنت
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {commonMistakes.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">❌</span>
                  <p className="font-bold text-white text-sm" dir="rtl">
                    {item.mistake}
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                  <span className="text-green-400 text-xs font-bold shrink-0 mt-0.5">✅ الحل:</span>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {item.fix}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── KEY TERMS ─── */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              المصطلحات الأساسية 📖
            </h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {keyTerms.map((item, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-2 md:gap-6 px-5 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
              >
                <p className="text-sm font-black text-red-400 shrink-0 md:w-40">
                  {item.term}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  {item.def}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الأسئلة الشائعة ❓
          </h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <p className="font-bold text-white text-sm" dir="rtl">
                  س: {faq.q}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3" dir="rtl">
                  <span className="text-red-400 font-bold">ج: </span>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇪🇬</span>
            <span className="text-4xl">🛒</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white">
            Pulse Gear Egypt — وصّلك الـ Gear الصح
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            Foam Rollers، Theragun، Garmin Watches، Polar H10 — كل أدوات
            الـ Recovery متاحة في Pulse Gear Egypt بأسعار مناسبة بالجنيه
            المصري. تواصل معانا وهنساعدك تبني Recovery Plan صح. 💪
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Products
            </Link>
            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Request a Product
            </Link>
          </div>
        </section>

        {/* Related Articles */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/blog/training-guide/heart-rate-zones", icon: "📊", tag: "Training Guide", title: "Heart Rate Zones — اتدرب بذكاء" },
              { href: "/blog/training-guide/zone-2-training", icon: "🫀", tag: "Training Guide", title: "Zone 2 Training — سر الـ Elite Athletes" },
              { href: "/blog/gear-guide/beginners-guide", icon: "🌱", tag: "Gear Guide", title: "Beginner's Gear Guide 2026" },
            ].map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
              >
                <span className="text-2xl">{article.icon}</span>
                <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                  {article.tag}
                </p>
                <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors duration-200">
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