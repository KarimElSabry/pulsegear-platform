// src/app/admin/analytics/traffic/page.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
  AreaChart, Area,
} from 'recharts'

// --- Types ------------------------------------------------------------------

interface GA4Overview {
  activeUsers:        string
  sessions:           string
  pageViews:          string
  bounceRate:         string
  avgSessionDuration: string
  newUsers:           string
  pagesPerSession:    string
  engagementRate:     string
  totalUsers:         string
  conversions:        string
}

interface DailyUser {
  date:           string
  users:          number
  sessions:       number
  views:          number
  newUsers:       number
  engagementRate: string
}

interface TrafficSrc {
  source:         string
  sessions:       number
  users:          number
  bounceRate:     string
  engagementRate: string
  avgDuration:    string
  conversions:    number
}

interface Device {
  device:          string
  sessions:        number
  users:           number
  bounceRate:      string
  avgDuration:     string
  pagesPerSession: string
}

interface TopPage {
  page:        string
  pageTitle:   string
  views:       string
  users:       string
  avgDuration: string
  bounceRate:  string
  exits:       number
  exitRate:    string
}

interface Country {
  country:     string
  users:       number
  sessions:    number
  bounceRate:  string
  avgDuration: string
}

interface LandingPage {
  page:        string
  sessions:    number
  bounceRate:  string
  users:       number
  avgDuration: string
  conversions: number
}

interface NewVsReturning {
  type:        string
  users:       number
  sessions:    number
  bounceRate:  number
  avgDuration: number
}

interface ExitPage {
  page:      string
  pageTitle: string
  exits:     number
  exitRate:  string
  views:     number
}

interface City {
  country:    string
  city:       string
  users:      number
  sessions:   number
  bounceRate: string
}

interface OperatingSystem {
  os:         string
  users:      number
  sessions:   number
  bounceRate: string
}

interface SourceMedium {
  source:      string
  medium:      string
  sessions:    number
  users:       number
  bounceRate:  string
  avgDuration: string
}

interface AnalyticsData {
  ga4:                 GA4Overview | null
  ga4TopPages:         TopPage[]
  ga4DailyUsers:       DailyUser[]
  ga4TrafficSources:   TrafficSrc[]
  ga4DeviceBreakdown:  Device[]
  ga4Countries:        Country[]
  ga4LandingPages:     LandingPage[]
  ga4NewVsReturning:   NewVsReturning[]
  ga4ExitPages:        ExitPage[]
  ga4Cities:           City[]
  ga4OperatingSystems: OperatingSystem[]
  ga4SourceMedium:     SourceMedium[]
}

// --- Constants --------------------------------------------------------------

const COLORS = [
  '#a855f7', '#6366f1', '#22d3ee', '#f59e0b',
  '#10b981', '#f43f5e', '#3b82f6', '#ec4899',
]

const TOOLTIP_STYLE = {
  backgroundColor: '#111827',
  border:          '1px solid #374151',
  borderRadius:    12,
  color:           '#fff',
}

// --- Helpers ----------------------------------------------------------------

function formatDate(raw: string) {
  return raw.slice(6, 8) + '/' + raw.slice(4, 6)
}

function formatDuration(seconds: string | number) {
  const s = typeof seconds === 'string' ? parseInt(seconds) : seconds
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return m + 'm ' + r + 's'
}

function getWeekRange() {
  const end   = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return fmt(start) + ' to ' + fmt(end)
}

// --- Metric Info Card -------------------------------------------------------

function MetricInfo({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-500 hover:text-purple-400 transition text-xs"
        title={'What is ' + title + '?'}
      >
        i
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-5 w-64 bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs text-gray-300 shadow-xl">
          <p className="font-bold text-white mb-1">{title}</p>
          {children}
          <button onClick={() => setOpen(false)} className="mt-2 text-purple-400 hover:underline">
            Close
          </button>
        </div>
      )}
    </span>
  )
}

// --- Stat Card --------------------------------------------------------------

function StatCard({
  icon, label, value, sub, info,
}: {
  icon:   string
  label:  string
  value:  string
  sub?:   string
  info?:  React.ReactNode
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-1">
        {label}
        {info && <MetricInfo title={label}>{info}</MetricInfo>}
      </span>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}

// --- Bounce Badge -----------------------------------------------------------

function BounceBadge({ rate }: { rate: string }) {
  const n = parseFloat(rate)
  const cls =
    n < 40 ? 'bg-green-500/20 text-green-400' :
    n < 65 ? 'bg-yellow-500/20 text-yellow-400' :
             'bg-red-500/20 text-red-400'
  return (
    <span className={'text-xs font-bold px-2 py-1 rounded-full ' + cls}>
      {rate}%
    </span>
  )
}

// --- Export Utilities -------------------------------------------------------

function buildHTMLReport(data: AnalyticsData): string {
  const {
    ga4, ga4TopPages, ga4TrafficSources, ga4DeviceBreakdown,
    ga4Countries, ga4LandingPages, ga4NewVsReturning,
    ga4ExitPages, ga4Cities, ga4OperatingSystems, ga4SourceMedium,
  } = data

  const row = (cells: string[], header = false): string => {
    const tag = header ? 'th' : 'td'
    return (
      '<tr>' +
      cells.map(c =>
        '<' + tag + ' style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left">' +
        c + '</' + tag + '>'
      ).join('') +
      '</tr>'
    )
  }

  const table = (headers: string[], rows: string[][]): string =>
    '<table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">' +
    '<thead style="background:#f3f4f6">' + row(headers, true) + '</thead>' +
    '<tbody>' + rows.map(r => row(r)).join('') + '</tbody>' +
    '</table>'

  const css =
    'body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#111;background:#fff;margin:0;padding:40px}' +
    'h1{color:#7c3aed;margin-bottom:4px}' +
    'h2{color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:32px}' +
    '.meta{color:#6b7280;font-size:13px;margin-bottom:32px}' +
    '.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}' +
    '.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px}' +
    '.card-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}' +
    '.card-value{font-size:24px;font-weight:800;color:#7c3aed}' +
    '.card-sub{font-size:11px;color:#9ca3af;margin-top:2px}' +
    '.insight{background:#faf5ff;border-left:4px solid #7c3aed;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#374151}' +
    '.footer{margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center}' +
    '@media print{body{padding:20px}}'

  const cardData: [string, string, string][] = ga4 ? [
    ['Active Users',    parseInt(ga4.activeUsers).toLocaleString(),  'Unique visitors'],
    ['Sessions',        parseInt(ga4.sessions).toLocaleString(),      'Total visits'],
    ['Page Views',      parseInt(ga4.pageViews).toLocaleString(),     'Total pages viewed'],
    ['New Users',       parseInt(ga4.newUsers).toLocaleString(),      'First-time visitors'],
    ['Bounce Rate',     ga4.bounceRate + '%',                         'Lower is better'],
    ['Avg. Duration',   formatDuration(ga4.avgSessionDuration),       'Per session'],
    ['Pages / Session', ga4.pagesPerSession,                          'Depth of engagement'],
    ['Engagement Rate', ga4.engagementRate + '%',                     'Engaged sessions'],
  ] : []

  const overviewSection = ga4
    ? '<h2>Key Metrics - Last 30 Days</h2>' +
      '<div class="cards">' +
      cardData.map(([label, value, sub]) =>
        '<div class="card">' +
        '<div class="card-label">' + label + '</div>' +
        '<div class="card-value">' + value + '</div>' +
        '<div class="card-sub">'   + sub   + '</div>' +
        '</div>'
      ).join('') +
      '</div>' +
      '<h2>Automated Insights</h2>' +
      '<div class="insight">' +
      (parseFloat(ga4.bounceRate) > 60
        ? 'High Bounce Rate (' + ga4.bounceRate + '%) — Consider improving landing page content, load speed, or CTAs.'
        : 'Healthy Bounce Rate (' + ga4.bounceRate + '%) — Visitors are engaging well.'
      ) + '</div>' +
      '<div class="insight">' +
      (parseFloat(ga4.engagementRate) > 50
        ? 'Strong Engagement Rate (' + ga4.engagementRate + '%) — Quality traffic.'
        : 'Low Engagement Rate (' + ga4.engagementRate + '%) — Improve content relevance.'
      ) + '</div>' +
      '<div class="insight">Pages per Session: ' + ga4.pagesPerSession + ' — ' +
      (parseFloat(ga4.pagesPerSession) >= 2
        ? 'Visitors explore multiple pages!'
        : 'Mostly single-page visits. Improve internal linking.'
      ) + '</div>'
    : '<p style="color:#ef4444">GA4 data unavailable.</p>'

  const trafficSection = ga4TrafficSources.length > 0
    ? '<h2>Traffic Sources</h2>' +
      table(
        ['Source', 'Sessions', 'Users', 'Bounce Rate', 'Engagement Rate'],
        ga4TrafficSources.map(s => [
          s.source, s.sessions.toLocaleString(), s.users.toLocaleString(),
          s.bounceRate + '%', s.engagementRate + '%',
        ])
      )
    : ''

  const deviceSection = ga4DeviceBreakdown.length > 0
    ? '<h2>Device Breakdown</h2>' +
      table(
        ['Device', 'Sessions', 'Users', 'Bounce Rate', 'Pages/Session'],
        ga4DeviceBreakdown.map(d => [
          d.device, d.sessions.toLocaleString(), d.users.toLocaleString(),
          d.bounceRate + '%', d.pagesPerSession,
        ])
      )
    : ''

  const countriesSection = ga4Countries.length > 0
    ? '<h2>Top Countries</h2>' +
      table(
        ['Country', 'Users', 'Sessions', 'Bounce Rate'],
        ga4Countries.map(c => [
          c.country, c.users.toLocaleString(), c.sessions.toLocaleString(), c.bounceRate + '%',
        ])
      )
    : ''

  const topPagesSection = ga4TopPages.length > 0
    ? '<h2>Top Pages</h2>' +
      table(
        ['#', 'Page', 'Views', 'Users', 'Avg Duration', 'Bounce Rate'],
        ga4TopPages.map((p, i) => [
          String(i + 1), p.page,
          parseInt(p.views).toLocaleString(), parseInt(p.users).toLocaleString(),
          formatDuration(p.avgDuration), p.bounceRate + '%',
        ])
      )
    : ''

  const landingSection = ga4LandingPages.length > 0
    ? '<h2>Top Landing Pages</h2>' +
      table(
        ['Page', 'Sessions', 'Users', 'Bounce Rate'],
        ga4LandingPages.map(p => [
          p.page, p.sessions.toLocaleString(), p.users.toLocaleString(), p.bounceRate + '%',
        ])
      )
    : ''

  const newVsRetSection = ga4NewVsReturning.length > 0
    ? '<h2>New vs Returning Users</h2>' +
      table(
        ['Type', 'Users', 'Sessions', 'Bounce Rate'],
        ga4NewVsReturning.map(r => [
          r.type, r.users.toLocaleString(), r.sessions.toLocaleString(), r.bounceRate + '%',
        ])
      )
    : ''

  const exitSection = ga4ExitPages.length > 0
    ? '<h2>Top Exit Pages</h2>' +
      table(
        ['Page', 'Exits', 'Exit Rate', 'Views'],
        ga4ExitPages.map(p => [
          p.page, p.exits.toLocaleString(), p.exitRate + '%', p.views.toLocaleString(),
        ])
      )
    : ''

  const citiesSection = ga4Cities.length > 0
    ? '<h2>Egypt Cities</h2>' +
      table(
        ['City', 'Users', 'Sessions', 'Bounce Rate'],
        ga4Cities.map(c => [
          c.city, c.users.toLocaleString(), c.sessions.toLocaleString(), c.bounceRate + '%',
        ])
      )
    : ''

  const osSection = ga4OperatingSystems.length > 0
    ? '<h2>Operating Systems</h2>' +
      table(
        ['OS', 'Users', 'Sessions', 'Bounce Rate'],
        ga4OperatingSystems.map(o => [
          o.os, o.users.toLocaleString(), o.sessions.toLocaleString(), o.bounceRate + '%',
        ])
      )
    : ''

  const sourceMediumSection = ga4SourceMedium.length > 0
    ? '<h2>Source / Medium</h2>' +
      table(
        ['Source', 'Medium', 'Sessions', 'Users', 'Bounce Rate'],
        ga4SourceMedium.map(s => [
          s.source, s.medium, s.sessions.toLocaleString(),
          s.users.toLocaleString(), s.bounceRate + '%',
        ])
      )
    : ''

  return (
    '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="UTF-8"/>' +
    '<title>PulseGear Analytics Report - ' + getWeekRange() + '</title>' +
    '<style>' + css + '</style></head><body>' +
    '<h1>PulseGear Weekly Analytics Report</h1>' +
    '<p class="meta">Period: ' + getWeekRange() +
    ' | Generated: ' + new Date().toLocaleString('en-GB') +
    ' | Source: Google Analytics 4</p>' +
    overviewSection + trafficSection + deviceSection + countriesSection +
    topPagesSection + landingSection + newVsRetSection +
    exitSection + citiesSection + osSection + sourceMediumSection +
    '<div class="footer">PulseGear Analytics — Powered by GA4 — Confidential</div>' +
    '</body></html>'
  )
}

// --- CSV Export -------------------------------------------------------------

function exportCSV(data: AnalyticsData) {
  const {
    ga4, ga4TopPages, ga4TrafficSources, ga4DeviceBreakdown,
    ga4Countries, ga4LandingPages, ga4NewVsReturning,
    ga4ExitPages, ga4Cities, ga4OperatingSystems, ga4SourceMedium,
  } = data

  const lines: string[] = []

  lines.push('PULSEGEAR WEEKLY ANALYTICS REPORT')
  lines.push('Period,' + getWeekRange())
  lines.push('Generated,' + new Date().toLocaleString('en-GB'))
  lines.push('')

  if (ga4) {
    lines.push('KEY METRICS')
    lines.push('Metric,Value')
    lines.push('Active Users,'         + ga4.activeUsers)
    lines.push('Total Users,'          + ga4.totalUsers)
    lines.push('Sessions,'             + ga4.sessions)
    lines.push('Page Views,'           + ga4.pageViews)
    lines.push('New Users,'            + ga4.newUsers)
    lines.push('Bounce Rate,'          + ga4.bounceRate + '%')
    lines.push('Avg Session Duration,' + formatDuration(ga4.avgSessionDuration))
    lines.push('Pages Per Session,'    + ga4.pagesPerSession)
    lines.push('Engagement Rate,'      + ga4.engagementRate + '%')
    lines.push('Conversions,'          + ga4.conversions)
    lines.push('')
  }

  if (ga4TrafficSources.length > 0) {
    lines.push('TRAFFIC SOURCES')
    lines.push('Source,Sessions,Users,Bounce Rate,Engagement Rate')
    ga4TrafficSources.forEach(s =>
      lines.push(s.source + ',' + s.sessions + ',' + s.users + ',' + s.bounceRate + '%,' + s.engagementRate + '%')
    )
    lines.push('')
  }

  if (ga4DeviceBreakdown.length > 0) {
    lines.push('DEVICE BREAKDOWN')
    lines.push('Device,Sessions,Users,Bounce Rate,Pages/Session')
    ga4DeviceBreakdown.forEach(d =>
      lines.push(d.device + ',' + d.sessions + ',' + d.users + ',' + d.bounceRate + '%,' + d.pagesPerSession)
    )
    lines.push('')
  }

  if (ga4Countries.length > 0) {
    lines.push('TOP COUNTRIES')
    lines.push('Country,Users,Sessions,Bounce Rate')
    ga4Countries.forEach(c =>
      lines.push(c.country + ',' + c.users + ',' + c.sessions + ',' + c.bounceRate + '%')
    )
    lines.push('')
  }

  if (ga4TopPages.length > 0) {
    lines.push('TOP PAGES')
    lines.push('Page,Views,Users,Avg Duration,Bounce Rate,Exits,Exit Rate')
    ga4TopPages.forEach(p =>
      lines.push(
        p.page + ',' + p.views + ',' + p.users + ',' +
        formatDuration(p.avgDuration) + ',' + p.bounceRate + '%,' +
        p.exits + ',' + p.exitRate + '%'
      )
    )
    lines.push('')
  }

  if (ga4LandingPages.length > 0) {
    lines.push('LANDING PAGES')
    lines.push('Page,Sessions,Users,Bounce Rate,Conversions')
    ga4LandingPages.forEach(p =>
      lines.push(p.page + ',' + p.sessions + ',' + p.users + ',' + p.bounceRate + '%,' + p.conversions)
    )
    lines.push('')
  }

  if (ga4NewVsReturning.length > 0) {
    lines.push('NEW VS RETURNING')
    lines.push('Type,Users,Sessions,Bounce Rate')
    ga4NewVsReturning.forEach(r =>
      lines.push(r.type + ',' + r.users + ',' + r.sessions + ',' + r.bounceRate + '%')
    )
    lines.push('')
  }

  if (ga4ExitPages.length > 0) {
    lines.push('EXIT PAGES')
    lines.push('Page,Exits,Exit Rate,Views')
    ga4ExitPages.forEach(p =>
      lines.push(p.page + ',' + p.exits + ',' + p.exitRate + '%,' + p.views)
    )
    lines.push('')
  }

  if (ga4Cities.length > 0) {
    lines.push('EGYPT CITIES')
    lines.push('City,Users,Sessions,Bounce Rate')
    ga4Cities.forEach(c =>
      lines.push(c.city + ',' + c.users + ',' + c.sessions + ',' + c.bounceRate + '%')
    )
    lines.push('')
  }

  if (ga4OperatingSystems.length > 0) {
    lines.push('OPERATING SYSTEMS')
    lines.push('OS,Users,Sessions,Bounce Rate')
    ga4OperatingSystems.forEach(o =>
      lines.push(o.os + ',' + o.users + ',' + o.sessions + ',' + o.bounceRate + '%')
    )
    lines.push('')
  }

  if (ga4SourceMedium.length > 0) {
    lines.push('SOURCE / MEDIUM')
    lines.push('Source,Medium,Sessions,Users,Bounce Rate')
    ga4SourceMedium.forEach(s =>
      lines.push(s.source + ',' + s.medium + ',' + s.sessions + ',' + s.users + ',' + s.bounceRate + '%')
    )
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'pulsegear-analytics-' + new Date().toISOString().slice(0, 10) + '.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// --- HTML / PDF Export ------------------------------------------------------

function exportHTML(data: AnalyticsData) {
  const html = buildHTMLReport(data)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'pulsegear-analytics-' + new Date().toISOString().slice(0, 10) + '.html'
  a.click()
  URL.revokeObjectURL(url)
}

function exportPDF(data: AnalyticsData) {
  const html     = buildHTMLReport(data)
  const printWin = window.open('', '_blank', 'width=1000,height=700')
  if (!printWin) return
  printWin.document.write(html)
  printWin.document.close()
  printWin.onload = () => { printWin.focus(); printWin.print() }
}

// --- Export Menu ------------------------------------------------------------

function ExportMenu({ data }: { data: AnalyticsData }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
      >
        Export Report
        <span className="text-xs opacity-70">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden w-52">
          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-800">
            Choose Format
          </div>
          {[
            { label: 'CSV / Excel', sub: 'Open in Excel or Sheets', fn: () => exportCSV(data) },
            { label: 'HTML Report', sub: 'Send via email or browser', fn: () => exportHTML(data) },
            { label: 'PDF',         sub: 'Print or save as PDF',      fn: () => exportPDF(data) },
          ].map(({ label, sub, fn }) => (
            <button
              key={label}
              onClick={() => { fn(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-sm text-white border-t border-gray-800 first:border-t-0"
            >
              <div className="text-left">
                <div className="font-semibold">{label}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Main Page --------------------------------------------------------------

export default function TrafficPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-3">
        <div className="text-4xl animate-pulse">📊</div>
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-3">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-400 font-semibold">Failed to load analytics</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  )

  const {
    ga4, ga4DailyUsers, ga4TrafficSources, ga4DeviceBreakdown,
    ga4TopPages, ga4Countries, ga4LandingPages, ga4NewVsReturning,
    ga4ExitPages, ga4Cities, ga4OperatingSystems, ga4SourceMedium,
  } = data

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Traffic Analytics</h1>
          <p className="text-gray-400 mt-1">Real-time data from Google Analytics 4 — last 30 days</p>
          <p className="text-gray-600 text-xs mt-1">{getWeekRange()}</p>
        </div>
        {data && <ExportMenu data={data} />}
      </div>

      {!ga4 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-500">GA4 data unavailable — check service account credentials.</p>
        </div>
      ) : (
        <>
          {/* ── Key Metrics ─────────────────────────────────────────── */}
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Active Users"
                value={parseInt(ga4.activeUsers).toLocaleString()}
                sub="Unique visitors in 30 days"
                info={<>Distinct users who visited your site. Most important top-level metric.</>}
              />
              <StatCard icon="🔄" label="Sessions"
                value={parseInt(ga4.sessions).toLocaleString()}
                sub="Total visits"
                info={<>One visit to your site. One user can have multiple sessions.</>}
              />
              <StatCard icon="👁️" label="Page Views"
                value={parseInt(ga4.pageViews).toLocaleString()}
                sub="Total pages viewed"
                info={<>Total pages loaded. High views with low users means deep engagement.</>}
              />
              <StatCard icon="🆕" label="New Users"
                value={parseInt(ga4.newUsers).toLocaleString()}
                sub="First-time visitors"
                info={<>People visiting for the first time. High new users means good discovery.</>}
              />
              <StatCard icon="↩️" label="Bounce Rate"
                value={ga4.bounceRate + '%'}
                sub={
                  parseFloat(ga4.bounceRate) < 50 ? 'Healthy' :
                  parseFloat(ga4.bounceRate) < 70 ? 'Average' : 'High'
                }
                info={<>Sessions where the user left without interaction. Under 40% excellent. Above 70% needs attention.</>}
              />
              <StatCard icon="⏱️" label="Avg. Duration"
                value={formatDuration(ga4.avgSessionDuration)}
                sub="Per session"
                info={<>How long visitors stay. Over 2 minutes is excellent for e-commerce.</>}
              />
              <StatCard icon="📄" label="Pages / Session"
                value={ga4.pagesPerSession}
                sub="Depth of visit"
                info={<>Average pages per visit. Aim for 3+ pages per session.</>}
              />
              <StatCard icon="💡" label="Engagement Rate"
                value={ga4.engagementRate + '%'}
                sub={parseFloat(ga4.engagementRate) > 50 ? 'Strong' : 'Needs work'}
                info={<>Sessions with meaningful interaction. Higher is always better.</>}
              />
            </div>

            {/* Extra metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
              <StatCard icon="👤" label="Total Users"
                value={parseInt(ga4.totalUsers).toLocaleString()}
                sub="Including returning users"
                info={<>All users including returning ones. Active Users only counts users with engaged sessions.</>}
              />
              <StatCard icon="🎯" label="Conversions"
                value={parseInt(ga4.conversions).toLocaleString()}
                sub="Goal completions"
                info={<>Total conversion events tracked in GA4. Set up goals in GA4 to track purchases, signups, etc.</>}
              />
            </div>
          </section>

          {/* ── Daily Traffic Trend ─────────────────────────────────── */}
          <section>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Daily Traffic Trend</h2>
              <p className="text-xs text-gray-500 mb-1">Users, Sessions and Page Views per day</p>
              <p className="text-xs text-gray-600 mb-6">Spot traffic spikes, drops, and weekly patterns.</p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={ga4DailyUsers.map(d => ({ ...d, date: formatDate(d.date) }))}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} interval={4}/>
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }}/>
                  <Tooltip contentStyle={TOOLTIP_STYLE}/>
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }}/>
                  <Area type="monotone" dataKey="users"    stroke="#a855f7" fill="url(#gUsers)"    strokeWidth={2} dot={false} name="Users"/>
                  <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#gSessions)" strokeWidth={2} dot={false} name="Sessions"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── Traffic Sources + Devices ───────────────────────────── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Traffic Sources</h2>
                <p className="text-xs text-gray-500 mb-1">Where your visitors come from</p>
                <p className="text-xs text-gray-600 mb-4">Heavy reliance on one source is risky — diversify!</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={ga4TrafficSources}
                      dataKey="sessions"
                      nameKey="source"
                      cx="50%" cy="50%"
                      outerRadius={85} innerRadius={45}
                      label={(p: any) => p.source + ' ' + ((p.percent ?? 0) * 100).toFixed(0) + '%'}
                      labelLine={false}
                    >
                      {ga4TrafficSources.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {ga4TrafficSources.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>
                        <span className="text-gray-300">{s.source}</span>
                      </div>
                      <div className="flex gap-4 text-gray-500">
                        <span>{s.sessions.toLocaleString()} sessions</span>
                        <span className={parseFloat(s.bounceRate) > 60 ? 'text-red-400' : 'text-green-400'}>
                          {s.bounceRate}% bounce
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Device Breakdown</h2>
                <p className="text-xs text-gray-500 mb-1">Which devices your visitors use</p>
                <p className="text-xs text-gray-600 mb-4">If mobile is over 60%, mobile experience is critical.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ga4DeviceBreakdown} barSize={48}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                    <XAxis dataKey="device" tick={{ fill: '#6b7280', fontSize: 12 }}/>
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }}/>
                    <Tooltip contentStyle={TOOLTIP_STYLE}/>
                    <Bar dataKey="sessions" radius={[8, 8, 0, 0]} name="Sessions">
                      {ga4DeviceBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {ga4DeviceBreakdown.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>
                        <span className="text-gray-300 capitalize">{d.device}</span>
                      </div>
                      <span className="text-gray-500">{d.users.toLocaleString()} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── New vs Returning + Countries ────────────────────────── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {ga4NewVsReturning.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-1">New vs Returning Users</h2>
                  <p className="text-xs text-gray-500 mb-1">Loyalty indicator</p>
                  <p className="text-xs text-gray-600 mb-4">Aim for at least 20–30% returning users.</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={ga4NewVsReturning}
                        dataKey="users"
                        nameKey="type"
                        cx="50%" cy="50%"
                        outerRadius={80} innerRadius={40}
                        label={(p: any) => p.type + ' ' + ((p.percent ?? 0) * 100).toFixed(0) + '%'}
                        labelLine={false}
                      >
                        {ga4NewVsReturning.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {ga4NewVsReturning.map((r, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>
                          <span className="text-gray-300">{r.type}</span>
                        </div>
                        <span className="text-gray-500">{r.users.toLocaleString()} users</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ga4Countries.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-1">Top Countries</h2>
                  <p className="text-xs text-gray-500 mb-1">Where your audience is located</p>
                  <p className="text-xs text-gray-600 mb-4">Unexpected countries may reveal untapped markets.</p>
                  <div className="space-y-3">
                    {ga4Countries.map((c, i) => {
                      const max = ga4Countries[0]?.users || 1
                      const pct = Math.round((c.users / max) * 100)
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">{c.country}</span>
                            <span className="text-gray-500">{c.users.toLocaleString()} users</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: pct + '%', background: COLORS[i % COLORS.length] }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Source / Medium ─────────────────────────────────────── */}
          {ga4SourceMedium.length > 0 && (
            <section>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Source / Medium Detail</h2>
                <p className="text-xs text-gray-500 mb-1">Granular breakdown of where traffic comes from</p>
                <p className="text-xs text-gray-600 mb-4">Helps identify which campaigns or channels drive the best quality traffic.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 uppercase text-xs border-b border-gray-800">
                        <th className="text-left pb-3">Source</th>
                        <th className="text-left pb-3">Medium</th>
                        <th className="text-right pb-3">Sessions</th>
                        <th className="text-right pb-3">Users</th>
                        <th className="text-right pb-3">Bounce</th>
                        <th className="text-right pb-3">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {ga4SourceMedium.map((s, i) => (
                        <tr key={i} className="hover:bg-gray-800/50 transition">
                          <td className="py-3 text-purple-400 font-mono text-xs">{s.source}</td>
                          <td className="py-3 text-gray-400 text-xs">{s.medium}</td>
                          <td className="py-3 text-right text-white font-bold">{s.sessions.toLocaleString()}</td>
                          <td className="py-3 text-right text-gray-400">{s.users.toLocaleString()}</td>
                          <td className="py-3 text-right"><BounceBadge rate={s.bounceRate}/></td>
                          <td className="py-3 text-right text-gray-400">{formatDuration(s.avgDuration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── Operating Systems ───────────────────────────────────── */}
          {ga4OperatingSystems.length > 0 && (
            <section>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Operating Systems</h2>
                <p className="text-xs text-gray-500 mb-1">What OS your visitors use</p>
                <p className="text-xs text-gray-600 mb-4">Useful for testing priorities — focus QA on the most common OS.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ga4OperatingSystems} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                    <XAxis dataKey="os" tick={{ fill: '#6b7280', fontSize: 11 }}/>
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }}/>
                    <Tooltip contentStyle={TOOLTIP_STYLE}/>
                    <Bar dataKey="sessions" radius={[8, 8, 0, 0]} name="Sessions">
                      {ga4OperatingSystems.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ── Egypt Cities ────────────────────────────────────────── */}
          {ga4Cities.length > 0 && (
            <section>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">🇪🇬 Egypt Cities</h2>
                <p className="text-xs text-gray-500 mb-1">City-level breakdown for Egyptian visitors</p>
                <p className="text-xs text-gray-600 mb-4">Useful for targeting local delivery zones or ads.</p>
                <div className="space-y-3">
                  {ga4Cities.map((c, i) => {
                    const max = ga4Cities[0]?.users || 1
                    const pct = Math.round((c.users / max) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{c.city}</span>
                          <div className="flex gap-3 text-gray-500">
                            <span>{c.users.toLocaleString()} users</span>
                            <BounceBadge rate={c.bounceRate}/>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: pct + '%', background: COLORS[i % COLORS.length] }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── Top Pages ───────────────────────────────────────────── */}
          <section>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Top Pages</h2>
              <p className="text-xs text-gray-500 mb-1">Most visited pages — last 30 days</p>
              <p className="text-xs text-gray-600 mb-4">High views + high bounce = not converting. High views + low bounce = your best page.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 uppercase text-xs border-b border-gray-800">
                      <th className="text-left pb-3">#</th>
                      <th className="text-left pb-3">Page</th>
                      <th className="text-right pb-3">Views</th>
                      <th className="text-right pb-3">Users</th>
                      <th className="text-right pb-3">Avg Time</th>
                      <th className="text-right pb-3">Bounce</th>
                      <th className="text-right pb-3">Exits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {ga4TopPages.map((page, i) => (
                      <tr key={i} className="hover:bg-gray-800/50 transition">
                        <td className="py-3 text-gray-500">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1)}
                        </td>
                        <td className="py-3 text-purple-400 font-mono text-xs max-w-xs truncate">
                          {page.page}
                          {page.pageTitle && (
                            <span className="block text-gray-600 font-sans normal-case">{page.pageTitle}</span>
                          )}
                        </td>
                        <td className="py-3 text-right text-white font-bold">{parseInt(page.views).toLocaleString()}</td>
                        <td className="py-3 text-right text-gray-400">{parseInt(page.users).toLocaleString()}</td>
                        <td className="py-3 text-right text-gray-400">{formatDuration(page.avgDuration)}</td>
                        <td className="py-3 text-right"><BounceBadge rate={page.bounceRate}/></td>
                        <td className="py-3 text-right text-gray-500">{page.exits.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── Exit Pages ──────────────────────────────────────────── */}
          {ga4ExitPages.length > 0 && (
            <section>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Top Exit Pages</h2>
                <p className="text-xs text-gray-500 mb-1">Where visitors leave your site</p>
                <p className="text-xs text-gray-600 mb-4">High exit rate on key pages (cart, checkout) needs immediate attention.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 uppercase text-xs border-b border-gray-800">
                        <th className="text-left pb-3">#</th>
                        <th className="text-left pb-3">Page</th>
                        <th className="text-right pb-3">Exits</th>
                        <th className="text-right pb-3">Exit Rate</th>
                        <th className="text-right pb-3">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {ga4ExitPages.map((page, i) => (
                        <tr key={i} className="hover:bg-gray-800/50 transition">
                          <td className="py-3 text-gray-500">{i + 1}</td>
                          <td className="py-3 text-purple-400 font-mono text-xs max-w-xs truncate">
                            {page.page}
                            {page.pageTitle && (
                              <span className="block text-gray-600 font-sans normal-case">{page.pageTitle}</span>
                            )}
                          </td>
                          <td className="py-3 text-right text-white font-bold">{page.exits.toLocaleString()}</td>
                          <td className="py-3 text-right"><BounceBadge rate={page.exitRate}/></td>
                          <td className="py-3 text-right text-gray-400">{page.views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── Landing Pages ───────────────────────────────────────── */}
          {ga4LandingPages.length > 0 && (
            <section>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Top Landing Pages</h2>
                <p className="text-xs text-gray-500 mb-1">First pages visitors see when they arrive</p>
                <p className="text-xs text-gray-600 mb-4">High bounce on landing pages = weak hook. Improve headlines, speed, or CTAs.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 uppercase text-xs border-b border-gray-800">
                        <th className="text-left pb-3">#</th>
                        <th className="text-left pb-3">Page</th>
                        <th className="text-right pb-3">Sessions</th>
                        <th className="text-right pb-3">Users</th>
                        <th className="text-right pb-3">Bounce</th>
                        <th className="text-right pb-3">Conversions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {ga4LandingPages.map((page, i) => (
                        <tr key={i} className="hover:bg-gray-800/50 transition">
                          <td className="py-3 text-gray-500">{i + 1}</td>
                          <td className="py-3 text-purple-400 font-mono text-xs max-w-xs truncate">{page.page}</td>
                          <td className="py-3 text-right text-white">{page.sessions.toLocaleString()}</td>
                          <td className="py-3 text-right text-gray-400">{page.users.toLocaleString()}</td>
                          <td className="py-3 text-right"><BounceBadge rate={page.bounceRate}/></td>
                          <td className="py-3 text-right text-gray-400">{page.conversions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

        </>
      )}
    </div>
  )
}