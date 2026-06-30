// app/faq/page.tsx

const faqs = [
  {
    section: "About Pulse Gear",
    questions: [
      {
        q: "What is Pulse Gear?",
        a: `Pulse Gear is an Egyptian platform dedicated to helping runners train smarter by providing premium running watches, heart rate monitors, accessories, and performance tools at competitive prices.

We carefully source products from trusted international marketplaces and handle the entire process — from sourcing and purchasing to shipping and delivery — making it easy for athletes in Egypt to access equipment that is often unavailable locally.`,
      },
      {
        q: "Why should I buy from Pulse Gear instead of ordering myself?",
        a: `We take care of everything for you:

• Product sourcing
• Communication with the seller
• International shipping
• Import process
• Delivery inside Egypt

Instead of dealing with multiple websites, shipping companies, customs, and payment methods, you only communicate with Pulse Gear.`,
      },
      {
        q: "Can you get products that are not listed on the website?",
        a: `Yes.

If you cannot find a product on our website, simply use the Request Product page or contact us through Instagram or WhatsApp.

We'll do our best to source it for you.`,
      },
    ],
  },
  {
    section: "Products",
    questions: [
      {
        q: "Are all products brand new?",
        a: `No.

We offer products in multiple conditions:

• Brand New
• Like New
• Very Good
• Good

The condition is clearly displayed on every product page.`,
      },
      {
        q: "What do the product conditions mean?",
        a: `Brand New — Unused product in original condition.

Like New — Almost no signs of use.

Very Good — Minor cosmetic signs of use with full functionality.

Good — Visible signs of use while remaining fully functional.`,
      },
      {
        q: "Are used products tested?",
        a: `Whenever possible, products are checked before being offered.

The product condition shown on the website reflects our evaluation together with the seller's description.`,
      },
      {
        q: `Why are some products marked "Out of Stock"?`,
        a: `Many products come from second-hand marketplaces where only one unit may be available.

If it has already been sold, it will appear as Out of Stock or be moved to our Sold Archive.`,
      },
      {
        q: "What is the Sold Archive?",
        a: `The Sold Archive shows products that have already been successfully sourced and sold.

It helps customers understand what kinds of products are available through Pulse Gear and demonstrates our sourcing history.`,
      },
    ],
  },
  {
    section: "Pricing",
    questions: [
      {
        q: "Why are your prices different?",
        a: `The price shown on Pulse Gear is the final estimated price for delivery to Egypt.

It includes everything needed to get the product to your door:

• International purchasing
• Shipping
• Import costs
• Operational costs

You do not need to calculate any additional expenses yourself.`,
      },
      {
        q: "Which price should I trust?",
        a: `Always rely on the price displayed on Pulse Gear.

Marketplace prices may change frequently, while our displayed price reflects what you can expect to pay.`,
      },
    ],
  },
  {
    section: "Orders",
    questions: [
      {
        q: "How do I reserve a product?",
        a: `Simply press the Reserve on WhatsApp button or contact us through Instagram.`,
      },
      {
        q: "How do I order?",
        a: `The process is simple:

1. Browse products
2. Reserve your product
3. We confirm availability
4. We purchase it
5. We ship it
6. We deliver it to you in Egypt`,
      },
      {
        q: "Can I request multiple products?",
        a: `Yes.

You can reserve multiple products or request products that are not currently listed.`,
      },
      {
        q: "Can I cancel my reservation?",
        a: `Please contact us as soon as possible.

Cancellation depends on whether the purchasing process has already started.`,
      },
    ],
  },
  {
    section: "Shipping",
    questions: [
      {
        q: "Do you ship across Egypt?",
        a: `Yes, we deliver to all governorates across Egypt.

Delivery to major cities such as Cairo and Alexandria is typically faster. Orders to other governorates may require additional time depending on the location.`,
      },
      {
        q: "How long does delivery take?",
        a: `Delivery generally takes between 1 to 2 weeks depending on the product source and international shipping process.

An estimated delivery timeframe will always be shared with you before confirming your order.`,
      },
    ],
  },
  {
    section: "Product Compatibility",
    questions: [
      {
        q: "Will this heart rate strap work with my watch?",
        a: `Each product page will indicate compatibility.

If you're unsure, contact us and we'll help you before placing an order.`,
      },
      {
        q: "Do you sell replacement straps?",
        a: `Yes.

We also source replacement chest straps and accessories whenever available.`,
      },
      {
        q: "Can you find accessories for my watch?",
        a: `Absolutely.

If the accessory isn't listed, submit a Product Request and we'll do our best to source it for you.`,
      },
    ],
  },
  {
    section: "Warranty",
    questions: [
      {
        q: "Do your products come with a warranty?",
        a: `Warranty depends on the product type and source.

Any available warranty information will be clearly mentioned on the product page.`,
      },
    ],
  },
  {
    section: "Payments",
    questions: [
      {
        q: "How do I pay?",
        a: `Payment is split into two parts:

• 50% upfront before we ship the product — via Instapay or bank transfer
• 50% cash on delivery when the product arrives to you`,
      },
      {
        q: "Do I pay before you purchase the product?",
        a: `Yes, a 50% deposit is required before we proceed with shipping.

We will walk you through the full payment process after confirming your order.`,
      },
    ],
  },
  {
    section: "Wishlist",
    questions: [
      {
        q: "What is the Wishlist?",
        a: `Wishlist allows you to save products that you're interested in and revisit them later.`,
      },
      {
        q: "Does adding a product to my Wishlist reserve it?",
        a: `No.

Wishlist only saves the product for you. Products remain available to other customers until formally reserved.`,
      },
    ],
  },
  {
    section: "Contact",
    questions: [
      {
        q: "How can I contact Pulse Gear?",
        a: `You can reach us through:

• Instagram
• WhatsApp
• Product Request page`,
      },
      {
        q: "I still have questions. What should I do?",
        a: `We're always happy to help.

Contact us through WhatsApp or Instagram, and we'll guide you to the right product.`,
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ===== HEADER ===== */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-red-500">
          Got Questions?
        </span>
        <h1 className="text-5xl font-black uppercase mt-3 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-zinc-400 text-lg">
          Everything you need to know about Pulse Gear, our products, and how we work.
        </p>
      </section>

      {/* ===== FAQ SECTIONS ===== */}
      <section className="max-w-3xl mx-auto px-6 pb-20 flex flex-col gap-16">
        {faqs.map((section) => (
          <div key={section.section}>

            {/* Section Title */}
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-6">
              {section.section}
            </h2>

            {/* Questions */}
            <div className="flex flex-col gap-px">
              {section.questions.map((item, i) => (
                <details
                  key={i}
                  className="group border-t border-zinc-800 last:border-b last:border-zinc-800"
                >
                  <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none">
                    <span className="text-base font-semibold text-white group-open:text-red-400 transition-colors duration-200">
                      {item.q}
                    </span>
                    <span className="text-zinc-500 group-open:text-red-500 transition-colors duration-200 text-xl shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="pb-6 text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>

          </div>
        ))}
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="border-t border-zinc-800 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-5">
          <h2 className="text-3xl font-black uppercase">
            Don't See Your Question?
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            Our goal is to make buying running gear simple and hassle-free. If you couldn't find the answer you're looking for, send us a message on WhatsApp or Instagram — we'll be happy to help you find the right product or source equipment that isn't currently listed on the website.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a
              href="https://wa.me/+201205322444"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              WhatsApp Us
            </a>
            <a
              href="https://instagram.com/pulsegear_egypt"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}