// src/components/layout/Footer.tsx

import Image from 'next/image'
import Link from 'next/link'
import NewsletterSignup from '@/components/newsletter/NewsletterSignup'

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Brands', href: '/brands' },
  { label: 'Request Product', href: '/request-product' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
]

const accountLinks = [
  { label: 'Login', href: '/auth/login' },
  { label: 'Sign Up', href: '/auth/signup' },
  { label: 'My Account', href: '/account' },
]

export default function Footer() {
  return (
    <footer className="mt-0 w-full border-t border-white/10 bg-[#111111]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-12">
          <NewsletterSignup source="footer" compact />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link href="/" className="inline-flex w-fit items-center">
              <Image
                src="/logo.png"
                alt="Pulse Gear Logo"
                width={150}
                height={60}
                className="h-[52px] w-auto"
              />
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Egypt's home for serious runners. We source, ship, and deliver the gear you
              actually want to train and race with.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Navigation
            </h3>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Account
            </h3>

            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Get in Touch
            </h3>

            <a
              href="https://wa.me/+201205322444"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
            >
              WhatsApp Us
            </a>

            <a
              href="https://instagram.com/pulsegear_egypt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Pulse Gear Egypt. All rights reserved.
          </p>

          <p className="text-xs text-gray-500">Built for runners. Powered by passion.</p>
        </div>
      </div>
    </footer>
  )
}