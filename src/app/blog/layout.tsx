// src/app/blog/layout.tsx

import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://pulsegear-platform.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Blog | Pulse Gear",
    template: "%s | Pulse Gear Blog",
  },
  description:
    "Training tips, gear reviews, and heart rate guides from Pulse Gear Egypt — أفضل محتوى تدريبي بالعربي والإنجليزي.",
  keywords: [
    "heart rate monitor",
    "running gear Egypt",
    "GPS watch Egypt",
    "Pulse Gear Egypt",
    "training tips",
    "gear reviews",
    "heart rate zones",
    "chest strap",
    "Garmin Egypt",
    "Polar Egypt",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "Pulse Gear",
    type: "website",
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: `${SITE_URL}/og-blog.jpg`,
        width: 1200,
        height: 630,
        alt: "Pulse Gear Egypt Blog — Training Tips, Gear Reviews & Heart Rate Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Pulse Gear",
    description:
      "Training tips, gear reviews, and heart rate guides from Pulse Gear Egypt.",
    images: [`${SITE_URL}/og-blog.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* ══════════════════════════════════════
          BLOG TOP BAR
      ══════════════════════════════════════ */}
      <div className="w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Pulse Gear
            </Link>
            <span className="text-zinc-700">/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200 text-zinc-400">
              Blog
            </Link>
          </div>

          {/* Blog Categories — ✅ Paths مصلحة */}
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { href: "/blog",                label: "All"           },
              { href: "/blog/training-guide", label: "Training"      }, // ✅ كان /blog/training
              { href: "/blog/gear-guide",     label: "Gear Guides"   }, // ✅ صح
              { href: "/blog/gear-review",    label: "Reviews"       }, // ✅ كان /blog/reviews
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="text-xs text-zinc-500 hover:text-white px-3 py-1 rounded-full hover:bg-zinc-800 transition-all duration-200"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Shop Gear
          </Link>

        </div>
      </div>

      {/* ══════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════ */}
      <main className="flex-1">
        {children}
      </main>

      {/* ══════════════════════════════════════
          BLOG FOOTER
      ══════════════════════════════════════ */}
      <footer className="w-full border-t border-zinc-800/60 bg-zinc-950 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Pulse Gear <span className="text-red-500">Egypt</span>
            </p>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed" dir="rtl">
              أفضل أجهزة التدريب العالمية, متاحة في مصر بأسعار مناسبة.
            </p>
          </div>

          {/* Blog Links — ✅ Paths مصلحة */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-1">
              Popular Posts
            </p>
            {[
              {
                href:  "/blog/gear-guide/best-heart-rate-monitors", // ✅ كان /blog/best-heart-rate-monitors
                label: "Best Heart Rate Monitors 2026",
              },
              {
                href:  "/blog/gear-guide/beginners-guide",          // ✅ صح
                label: "Beginner's Gear Guide",
              },
              {
                href:  "/blog/training-guide/heart-rate-zones",     // ✅ كان /blog/heart-rate-zones
                label: "Heart Rate Zones Explained",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-zinc-500 hover:text-white transition-colors duration-200"
              >
                → {link.label}
              </Link>
            ))}
          </div>

          {/* Shop CTA */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Ready to Gear Up?
            </p>
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-colors duration-200 text-center"
            >
              Browse Products →
            </Link>
            <Link
              href="/request-product"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-200 text-center"
            >
              Request a Product
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/60 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Pulse Gear Egypt. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200">
                Terms
              </Link>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}