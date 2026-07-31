// src/app/blog/gear-guide/beginners-guide/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beginner's Gear Guide 2026 | Pulse Gear Egypt Blog",
  description:
    "دليل المبتدئين للجري: إيه اللي تحتاجه فعلًا، إمتى تحتاج Heart Rate Strap، وإمتى تستثمر في GPS Watch، بدون ما تشتري Gear مش محتاجه.",
  keywords: [
    "beginner running gear",
    "running gear Egypt",
    "heart rate strap Egypt",
    "GPS watch Egypt",
    "Polar H9",
    "Polar H10",
    "running accessories",
    "Pulse Gear Egypt",
  ],
  openGraph: {
    title: "Beginner's Gear Guide 2026 | Pulse Gear Egypt",
    description:
      "إبدأ الجري صح من غير ما تشتري Gear مش محتاجه.",
    type: "article",
  },
};

/* =========================================================
   DATA
========================================================= */

const setupStages = [
  {
    title: "المرحلة الأولى: ابدأ بالجري نفسه",
    icon: "🌱",
    color: "border-green-500/30 bg-green-500/5",
    titleColor: "text-green-400",
    description:
      "لو أنت لسه بتبدأ، مش محتاج تعمل Setup كامل. أهم حاجة تبدأ بشكل منتظم، تفهم جسمك، وتبني عادة الجري.",
    items: [
      {
        name: "Running Shoes",
        role: "الأساس",
        why: "اختيار حذاء مناسب لنوع جريك وراحتك أهم من شراء مجموعة أجهزة من أول يوم.",
      },
      {
        name: "Your Existing Watch / Phone",
        role: "اختياري",
        why: "لو عندك بالفعل ساعة أو موبايل بتستخدمه في متابعة التمرين، ابدأ بيه بدل ما تشتري جهاز جديد بدون احتياج واضح.",
      },
    ],
  },
  {
    title: "المرحلة الثانية: ابدأ تتدرب بالـ Heart Rate",
    icon: "❤️",
    color: "border-red-500/30 bg-red-500/5",
    titleColor: "text-red-400",
    description:
      "لو بدأت تهتم بالـ Heart Rate Zones أو بتحس إن الـ easy runs بتاعتك أسرع من اللازم، هنا الـ Chest Strap ممكن يكون أول Upgrade منطقي.",
    items: [
      {
        name: "Heart Rate Chest Strap",
        role: "أول Upgrade",
        why: "الـ Chest Strap بيوفر قراءة أكثر استجابة للـ Heart Rate أثناء تغير شدة التمرين.",
      },
      {
        name: "Training App",
        role: "اختياري",
        why: "ممكن تستخدم تطبيق متوافق عشان تتابع الـ Heart Rate والـ Training Zones أثناء التمرين.",
      },
    ],
  },
  {
    title: "المرحلة الثالثة: طوّر الـ Training Setup",
    icon: "📈",
    color: "border-blue-500/30 bg-blue-500/5",
    titleColor: "text-blue-400",
    description:
      "بعد ما تعرف احتياجاتك وتبدأ تتدرب بشكل منتظم، ممكن يكون الـ GPS Watch هو الخطوة التالية.",
    items: [
      {
        name: "GPS Watch",
        role: "Performance Upgrade",
        why: "مفيد لما تحتاج تتبع أدق للـ Pace والـ Distance والـ Training Data.",
      },
      {
        name: "Recovery Tools",
        role: "اختياري",
        why: "أدوات الـ Recovery ممكن تساعدك تضيف روتين للاستشفاء حسب احتياجك.",
      },
    ],
  },
];

const reasonsToUpgrade = [
  {
    icon: "🏃",
    title: "بتتمرن بانتظام",
    description:
      "لما التمرين يبقى جزء ثابت من أسبوعك، البيانات الإضافية ممكن تساعدك تفهم التدريب بشكل أفضل.",
  },
  {
    icon: "❤️",
    title: "عايز تتحكم في الـ Heart Rate",
    description:
      "لو بدأت تستخدم Heart Rate Zones في التدريب، دقة البيانات واستجابتها تصبح أكثر أهمية.",
  },
  {
    icon: "📊",
    title: "عايز بيانات أكثر",
    description:
      "لو محتاج تتبع Pace وDistance وTraining Data بشكل أكثر تفصيلًا، هنا الـ GPS Watch ممكن يكون Upgrade منطقي.",
  },
];

const commonMistakes = [
  {
    icon: "🛒",
    mistake: "شراء كل الـ Gear من أول يوم",
    solution:
      "ابدأ بالأساسيات. اشتري القطعة اللي عندك احتياج واضح ليها، وبعدها طوّر الـ Setup تدريجيًا.",
  },
  {
    icon: "💰",
    mistake: "اختيار المنتج بناءً على السعر فقط",
    solution:
      "السعر مهم، لكن لازم تشوف الـ Compatibility والاحتياجات الفعلية وطريقة استخدامك للجهاز.",
  },
  {
    icon: "⌚",
    mistake: "افتراض إن الـ GPS Watch هي أول حاجة تحتاجها",
    solution:
      "لو هدفك الأساسي هو فهم الـ Heart Rate Zones، ممكن يكون الـ Heart Rate Strap هو الـ Upgrade الأكثر منطقية.",
  },
  {
    icon: "📈",
    mistake: "التركيز على البيانات بدل التدريب",
    solution:
      "الـ Gear وسيلة تساعدك تتدرب بشكل أذكى، مش بديل عن التدريب المنتظم.",
  },
];

const keyTerms = [
  {
    term: "Heart Rate",
    def: "عدد ضربات القلب في الدقيقة أثناء الراحة أو التمرين.",
  },
  {
    term: "Heart Rate Zones",
    def: "مستويات مختلفة من شدة التمرين يتم تحديدها بناءً على معدل ضربات القلب.",
  },
  {
    term: "Zone 2",
    def: "شدة تدريب منخفضة نسبيًا تُستخدم كثيرًا في بناء القدرة الهوائية والتحمل.",
  },
  {
    term: "Recovery",
    def: "فترة الراحة بين التمارين، وفيها الجسم يستعيد قدرته ويتكيف مع التدريب.",
  },
  {
    term: "Training Load",
    def: "مجموع الضغط التدريبي على جسمك، ومتابعته تساعدك على تجنب زيادة الحمل التدريبي بشكل غير مناسب.",
  },
];

const firstWeek = [
  {
    day: "Day 1",
    icon: "🏃",
    title: "Easy Run",
    tasks: [
      "ابدأ بجلسة جري سهلة.",
      "ركز على المجهود بدل محاولة الجري بأقصى سرعة.",
    ],
  },
  {
    day: "Day 2",
    icon: "🚶",
    title: "Recovery",
    tasks: [
      "راحة أو نشاط خفيف.",
      "لاحظ إحساس جسمك بعد أول Session.",
    ],
  },
  {
    day: "Day 3",
    icon: "🏃",
    title: "Run Again",
    tasks: [
      "كرر جري سهل.",
      "حاول تخلي المجهود Controlled بدل ما تجري بأقصى سرعة.",
    ],
  },
  {
    day: "Day 4",
    icon: "🧘",
    title: "Rest",
    tasks: [
      "راحة.",
      "ركز على النوم والاستشفاء.",
    ],
  },
  {
    day: "Day 5",
    icon: "❤️",
    title: "Learn Your Data",
    tasks: [
      "لو عندك HR Monitor، راقب Heart Rate أثناء التمرين.",
      "ابدأ تفهم العلاقة بين المجهود والـ Heart Rate بدل مطاردة الأرقام فقط.",
    ],
  },
  {
    day: "Day 6",
    icon: "🏃",
    title: "Easy Run",
    tasks: [
      "جلسة جري سهلة.",
      "ركز على الـ Consistency أكثر من الـ Pace.",
    ],
  },
  {
    day: "Day 7",
    icon: "🔄",
    title: "Review",
    tasks: [
      "راجع الأسبوع.",
      "حدد إيه اللي كان ناقصك فعلًا قبل ما تشتري أي Gear جديد.",
    ],
  },
];

const faqs = [
  {
    q: "أبدأ بـ Chest Strap ولا GPS Watch؟",
    a: "لو هدفك الأساسي هو التدريب باستخدام Heart Rate Zones، فالـ Chest Strap ممكن يكون بداية منطقية. الـ GPS Watch ييجي بعدين لما تعرف إيه البيانات اللي محتاج تتابعها.",
  },
  {
    q: "الـ Foam Roller مهم فعلًا؟",
    a: "ممكن يكون مفيد كجزء من روتين الـ Recovery، لكن مش لازم يكون أول قطعة Gear تشتريها. ابدأ بالأساسيات وشوف احتياجاتك الفعلية.",
  },
  {
    q: "إزاي أعرف الـ Max HR بتاعي؟",
    a: "في طرق مختلفة لتقدير الـ Max HR، لكن التقدير البسيط مش دايمًا بيعكس الرقم الحقيقي لكل شخص. لو محتاج تستخدم Heart Rate Zones بشكل جاد، الأفضل تعتمد على طريقة مناسبة لمستواك وتدريبك.",
  },
  {
    q: "كام مرة في الأسبوع المفروض أتمرن؟",
    a: "للمبتدئ، المهم تبدأ بحجم تدريب تقدر تحافظ عليه باستمرار مع أيام للراحة والاستشفاء. الـ Consistency أهم من محاولة زيادة عدد أيام التدريب بسرعة.",
  },
  {
    q: "فين أقدر أشتري الـ Gear ده في مصر؟",
    a: "تقدر تشوف المنتجات المتاحة حاليًا على Pulse Gear Egypt، ولو المنتج اللي محتاجه مش موجود، تقدر تستخدم Request a Product ونشوف إمكانية توفيره.",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function BeginnersGuide() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap"
            dir="ltr"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/blog"
              className="hover:text-white transition-colors duration-200"
            >
              Blog
            </Link>

            <span>/</span>

            <Link
              href="/blog/gear-guide"
              className="hover:text-white transition-colors duration-200"
            >
              Gear Guide
            </Link>

            <span>/</span>

            <span className="text-zinc-400">Beginner's Guide</span>
          </div>

          <span
            className="self-start text-xs font-bold uppercase tracking-wide text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full"
            dir="ltr"
          >
            Beginner's Guide 2026
          </span>

          <h1
            className="text-4xl md:text-6xl font-black uppercase leading-tight"
            dir="ltr"
          >
            Beginner's Gear Guide 🌱
            <br />
            <span
              className="text-red-500"
              dir="rtl"
            >
              ابدأ صح من أول يوم
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl"
            dir="rtl"
          >
            مش محتاج تشتري كل حاجة من أول يوم. الهدف من الدليل ده إنك
            تعرف إيه اللي محتاجه فعلًا، وإمتى الـ Gear ممكن يساعدك تتدرب
            بشكل أذكى، وإمتى الأفضل إنك توفر فلوسك.
          </p>

          <div
            className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap"
            dir="ltr"
          >
            <span>⏱ 10 min read</span>
            <span>•</span>
            <span>🌱 Beginner Friendly</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-2xl shrink-0">🇪🇬</span>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white" dir="rtl">
                متاح في Pulse Gear Egypt
              </p>

              <p
                className="text-xs text-zinc-400 leading-relaxed"
                dir="rtl"
              >
                تقدر تطلب الـ Gear المناسب ليك من خلال Pulse Gear Egypt،
                ولو المنتج اللي محتاجه مش موجود على الموقع، تقدر تطلبه من
                خلال Request a Product.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p
              className="text-xs font-bold uppercase tracking-wide text-zinc-400"
              dir="ltr"
            >
              📋 Table of Contents
            </p>

            {[
              {
                href: "#setup-stages",
                label: "مراحل بناء الـ Training Setup",
              },
              {
                href: "#first-week",
                label: "خطة أول أسبوع",
              },
              {
                href: "#common-mistakes",
                label: "أكتر الأخطاء شيوعًا",
              },
              {
                href: "#key-terms",
                label: "المصطلحات الأساسية",
              },
              {
                href: "#faq",
                label: "الأسئلة الشائعة",
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                dir="rtl"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-red-500 transition-colors duration-200 shrink-0" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLE
      ===================================================== */}
      <article className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-16">
        {/* SETUP STAGES */}
        <section
          id="setup-stages"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              إيه الـ Gear اللي تحتاجه فعلًا؟
            </h2>

            <p
              className="text-zinc-500 text-sm leading-relaxed"
              dir="rtl"
            >
              بدل ما تشتري كل حاجة مرة واحدة، ابنِ الـ Training Setup
              خطوة بخطوة حسب احتياجاتك.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {setupStages.map((stage) => (
              <div
                key={stage.title}
                className={`${stage.color} border rounded-2xl p-5 flex flex-col gap-5`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl mb-3">{stage.icon}</p>

                    <h3
                      className={`font-black text-lg ${stage.titleColor}`}
                      dir="rtl"
                    >
                      {stage.title}
                    </h3>
                  </div>
                </div>

                <p
                  className="text-sm text-zinc-400 leading-relaxed"
                  dir="rtl"
                >
                  {stage.description}
                </p>

                <div className="flex flex-col gap-3">
                  {stage.items.map((item) => (
                    <div
                      key={item.name}
                      className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className="font-bold text-white text-sm"
                          dir="ltr"
                        >
                          {item.name}
                        </p>

                        <span
                          className="text-[10px] text-zinc-500 uppercase tracking-wide shrink-0"
                          dir="ltr"
                        >
                          {item.role}
                        </span>
                      </div>

                      <p
                        className="text-xs text-zinc-500 leading-relaxed mt-2"
                        dir="rtl"
                      >
                        {item.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HEART RATE */}
        <section className="flex flex-col gap-8">
          <div>
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              إمتى يكون الـ Heart Rate Strap مفيد؟
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2 leading-relaxed"
              dir="rtl"
            >
              لو هدفك التدريب باستخدام Heart Rate Zones، الـ Chest Strap
              ممكن يكون Upgrade مهم لأنه بيوفر قراءة أكثر استجابة أثناء
              تغير شدة التمرين.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p
                className="font-bold text-white mb-3"
                dir="ltr"
              >
                Optical Heart Rate
              </p>

              <p
                className="text-sm text-zinc-400 leading-relaxed"
                dir="rtl"
              >
                الساعات الذكية تستخدم Optical Sensors لقياس التغيرات
                المرتبطة بتدفق الدم. ده ممكن يكون كافي في مواقف كثيرة،
                خصوصًا أثناء النشاط المستقر.
              </p>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <p
                className="font-bold text-white mb-3"
                dir="ltr"
              >
                Chest Strap
              </p>

              <p
                className="text-sm text-zinc-400 leading-relaxed"
                dir="rtl"
              >
                الـ Chest Strap يقيس الإشارة الكهربائية للقلب، لذلك يكون
                مفيدًا عندما تحتاج Heart Rate Data أكثر استجابة أثناء
                تغير شدة التمرين.
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="self-start bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors"
            dir="ltr"
          >
            Explore Heart Rate Gear →
          </Link>
        </section>

        {/* GPS WATCH */}
        <section className="flex flex-col gap-8">
          <div>
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              إمتى تشتري GPS Watch؟
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              مش لازم تكون أول قطعة Gear تشتريها.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {reasonsToUpgrade.map((reason) => (
              <div
                key={reason.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4"
              >
                <span className="text-3xl">{reason.icon}</span>

                <h3
                  className="font-bold text-white"
                  dir="rtl"
                >
                  {reason.title}
                </h3>

                <p
                  className="text-sm text-zinc-500 leading-relaxed"
                  dir="rtl"
                >
                  {reason.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="self-start border border-zinc-700 hover:border-white text-zinc-300 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all"
            dir="ltr"
          >
            Explore GPS Watches →
          </Link>
        </section>

        {/* FIRST WEEK */}
        <section
          id="first-week"
          className="flex flex-col gap-8"
        >
          <div>
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              خطة أول أسبوع للمبتدئ 🗓️
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              الهدف من أول أسبوع مش إنك تجمع أكبر عدد من الـ Kilometers.
              الهدف إنك تبدأ وتعرف جسمك.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {firstWeek.map((day) => (
              <div
                key={day.day}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{day.icon}</span>

                  <div>
                    <p
                      className="text-xs text-red-400 font-bold uppercase tracking-wide"
                      dir="ltr"
                    >
                      {day.day}
                    </p>

                    <h3
                      className="font-bold text-white"
                      dir="ltr"
                    >
                      {day.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {day.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                    >
                      <span className="text-red-400 text-xs shrink-0 mt-0.5 font-bold">
                        {i + 1}.
                      </span>

                      <p
                        className="text-xs text-zinc-400 leading-relaxed"
                        dir="rtl"
                      >
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMMON MISTAKES */}
        <section
          id="common-mistakes"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <h2
              className="text-2xl font-black uppercase text-white"
              dir="rtl"
            >
              أكتر الأخطاء شيوعًا ⚠️
            </h2>

            <p
              className="text-sm text-zinc-500"
              dir="rtl"
            >
              اتعلم من غلطات الناس التانية ومتعملهاش أنت.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {commonMistakes.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">
                    {item.icon}
                  </span>

                  <p
                    className="font-bold text-white text-sm"
                    dir="rtl"
                  >
                    {item.mistake}
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                  <span
                    className="text-green-400 text-xs font-bold shrink-0 mt-0.5"
                    dir="rtl"
                  >
                    الحل:
                  </span>

                  <p
                    className="text-xs text-zinc-400 leading-relaxed"
                    dir="rtl"
                  >
                    {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KEY TERMS */}
        <section
          id="key-terms"
          className="flex flex-col gap-6"
        >
          <div>
            <h2
              className="text-2xl font-black uppercase"
              dir="rtl"
            >
              المصطلحات الأساسية 📚
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              أهم المصطلحات اللي هتقابلها وأنت بتتعلم عن الـ Running
              وTraining Data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {keyTerms.map((item) => (
              <div
                key={item.term}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
              >
                <p
                  className="font-bold text-red-400 mb-2"
                  dir="ltr"
                >
                  {item.term}
                </p>

                <p
                  className="text-sm text-zinc-400 leading-relaxed"
                  dir="rtl"
                >
                  {item.def}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="flex flex-col gap-6"
        >
          <div>
            <h2
              className="text-2xl font-black uppercase"
              dir="rtl"
            >
              الأسئلة الشائعة ❓
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              لو لسه محتار تبدأ منين، دي أهم الأسئلة اللي ممكن تساعدك.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 group"
              >
                <summary
                  className="cursor-pointer font-bold text-white list-none flex items-center justify-between gap-4"
                  dir="rtl"
                >
                  <span>{faq.q}</span>

                  <span className="text-zinc-500 group-open:text-red-400 transition-colors">
                    +
                  </span>
                </summary>

                <p
                  className="text-sm text-zinc-400 leading-relaxed mt-4 pt-4 border-t border-zinc-800"
                  dir="rtl"
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-gradient-to-b from-red-600/10 to-transparent border border-red-500/20 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center gap-5">
          <span className="text-4xl">🇪🇬</span>

          <h2
            className="text-3xl md:text-4xl font-black text-white"
            dir="rtl"
          >
            محتار تبدأ بإيه؟
          </h2>

          <p
            className="text-zinc-400 text-sm max-w-md leading-relaxed"
            dir="rtl"
          >
            في Pulse Gear Egypt، بنوفرلك أجهزة ومعدات تدريب مناسبة
            لمستويات مختلفة. تقدر تشوف المنتجات المتاحة حاليًا، أو تطلب
            منتج مش موجود على الموقع من خلال Request a Product.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors"
              dir="ltr"
            >
              Browse Products
            </Link>

            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors"
              dir="ltr"
            >
              Request a Product
            </Link>
          </div>
        </section>

        {/* RELATED ARTICLES */}
        <section className="flex flex-col gap-6">
          <h2
            className="text-2xl font-black uppercase text-white"
            dir="rtl"
          >
            اقرأ كمان 📚
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                href: "/blog/gear-guide/best-heart-rate-monitors",
                icon: "❤️",
                tag: "Gear Guide",
                title: "Best Heart Rate Monitors 2026",
              },
              {
                href: "/blog/gear-guide/budget-vs-premium",
                icon: "💰",
                tag: "Comparison",
                title: "Budget vs Premium Gear",
              },
              {
                href: "/blog/training-guide/complete-training-setup",
                icon: "🔧",
                tag: "Training Guide",
                title: "Complete Training Setup",
              },
            ].map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
                dir="ltr"
              >
                <span className="text-2xl">
                  {article.icon}
                </span>

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

        {/* BACK */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
            dir="ltr"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </main>
  );
}