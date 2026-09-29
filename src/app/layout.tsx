// src/app/layout.tsx

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { SITE_URL, SITE_NAME } from '@/lib/site'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Running Watches, Heart Rate Monitors & Gear`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Premium running watches, heart rate monitors and running accessories, sourced globally and hand-delivered across Egypt.',
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} | Train Smarter. Perform Better.`,
    description:
      'Premium running watches, heart rate monitors and running accessories, delivered across Egypt.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  verification: {
    google: 'DG_mrFdxIOFCNw5RiQrc-yz5uG_YRsf26m4VZ1Dl44M',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-surface-0 font-sans text-white">
        <GoogleAnalytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
