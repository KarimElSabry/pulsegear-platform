import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ContactForm from "@/components/ContactForm";

const homeFaqs = [
  {
    q: "What is Pulse Gear?",
    a: "An Egyptian platform sourcing premium running gear globally — delivered to your door across Egypt.",
  },
  {
    q: "Are the products original?",
    a: "Yes. All products are 100% authentic, sourced from trusted international sellers.",
  },
  {
    q: "What conditions do products come in?",
    a: "Brand New, Like New, Very Good, or Good — clearly displayed on every product page.",
  },
  {
    q: "How long does delivery take?",
    a: "Generally 1–2 weeks depending on the product source and international shipping.",
  },
  {
    q: "How do I pay?",
    a: "50% upfront via Instapay or bank transfer, and 50% cash on delivery.",
  },
  {
    q: "Can I request a product not listed?",
    a: "Absolutely! Use our Request a Product page and we'll source it for you.",
  },
];

export default function HomePage() {
  return (
    <main className="w-full">

      {/* ===== HERO SECTION ===== */}
      <section className="w-full bg-zinc-950 text-white min-h-[90vh] flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-24 w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex flex-col gap-6 max-w-xl flex-1">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Your Gear. Your Pace. Your Race.
            </span>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.05] uppercase tracking-tight">
              Train Smarter.{" "}
              <span className="text-red-500">Perform Better.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Premium running watches, heart rate monitors, and accessories
              sourced globally, priced competitively, hand-delivered to your doorstep across Egypt.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                href="/products"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
              >
                Browse Products
              </Link>
              <Link
                href="/request-product"
                className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
              >
                Request a Product
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <img
              src="/image.jpg"
              alt="Athlete with sports watch"
              className="w-full h-[500px] object-cover rounded-3xl"
            />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-red-600/20 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="w-full py-20 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-white uppercase">
              Hand-Picked For You
            </h2>
            <Link
              href="/products"
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200 uppercase tracking-wide"
            >
              View All →
            </Link>
          </div>
          <ProductGrid limit={3} />
        </div>
      </section>

      {/* ===== WHY PULSE GEAR ===== */}
      <section className="w-full bg-zinc-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-2 mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Our Promise
            </span>
            <h2 className="text-3xl font-black text-white uppercase">
              Why Pulse Gear?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🌍",
                title: "Globally Sourced",
                desc: "We bring you the best running gear from top international brands.",
              },
              {
                icon: "🚀",
                title: "Fast Delivery",
                desc: "Quick and reliable shipping straight to your door across Egypt.",
              },
              {
                icon: "💬",
                title: "Expert Support",
                desc: "Not sure what to get? We help you find the perfect gear for your goals.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-red-600 transition-colors duration-300"
              >
                <span className="text-4xl">{item.icon}</span>
                <h3 className="text-lg font-bold text-white uppercase">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REQUEST A PRODUCT ===== */}
      <section className="w-full bg-zinc-950 text-white py-20 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="text-4xl font-black uppercase leading-tight">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-zinc-400 text-lg">
            Submit a product request and we'll source it for you.
          </p>
          <Link
            href="/request-product"
            className="self-center bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
          >
            Request a Product
          </Link>
        </div>
      </section>

      {/* ===== GET IN TOUCH — FAQ + CONTACT FORM ===== */}
      <section className="w-full bg-zinc-950 py-20 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <div className="flex flex-col items-center gap-2 mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Get In Touch
            </span>
            <h2 className="text-3xl font-black text-white uppercase">
              We're Here To Help
            </h2>
            <p className="text-zinc-400 text-sm max-w-md">
              Browse our most common questions or send us a message directly.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

            {/* LEFT — FAQ */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-white uppercase">
                  Quick Answers
                </h3>
                <Link
                  href="/faq"
                  className="text-xs font-semibold text-red-500 hover:text-red-400 uppercase tracking-wide transition-colors duration-200"
                >
                  View All FAQs →
                </Link>
              </div>

              {/* FAQ Items using same <details> style as FAQ page */}
              <div className="flex flex-col gap-px">
                {homeFaqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group border-t border-zinc-800 last:border-b last:border-zinc-800"
                  >
                    <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none">
                      <span className="text-sm font-semibold text-white group-open:text-red-400 transition-colors duration-200">
                        {faq.q}
                      </span>
                      <span className="text-zinc-500 group-open:text-red-500 transition-colors duration-200 text-xl shrink-0">
                        +
                      </span>
                    </summary>
                    <div className="pb-4 text-zinc-400 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* RIGHT — Contact Form */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}