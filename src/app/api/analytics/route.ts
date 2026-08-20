// src/app/api/analytics/route.ts

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { NextResponse } from 'next/server'
import path from 'path'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID!

export async function GET() {
  try {
    const client = new BetaAnalyticsDataClient({
      keyFilename: path.join(process.cwd(), 'secrets', 'pulsegear-analytics.json'),
    })

    // ─── Run all reports in parallel ──────────────────────────────────
    const [
      overviewResponse,
      dailyResponse,
      sourcesResponse,
      devicesResponse,
      pagesResponse,
      countriesResponse,
      landingResponse,
      newVsRetResponse,
    ] = await Promise.all([

      // 1. Overview Metrics
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'newUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViewsPerSession' },
          { name: 'engagementRate' },
        ],
      }),

      // 2. Daily Users + Sessions + Views
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),

      // 3. Traffic Sources
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),

      // 4. Device Breakdown
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
        ],
      }),

      // 5. Top Pages
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),

      // 6. Countries
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      }),

      // 7. Landing Pages
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'landingPage' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),

      // 8. New vs Returning
      client.runReport({
        property:   `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'newVsReturning' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
      }),
    ])

    // ─── Parse Overview ────────────────────────────────────────────────
    const ov = overviewResponse[0].rows?.[0]?.metricValues

    const ga4 = {
      activeUsers:        ov?.[0]?.value ?? '0',
      sessions:           ov?.[1]?.value ?? '0',
      pageViews:          ov?.[2]?.value ?? '0',
      newUsers:           ov?.[3]?.value ?? '0',
      bounceRate:         parseFloat(ov?.[4]?.value ?? '0').toFixed(1),
      avgSessionDuration: parseFloat(ov?.[5]?.value ?? '0').toFixed(0),
      pagesPerSession:    parseFloat(ov?.[6]?.value ?? '0').toFixed(1),
      engagementRate:     (parseFloat(ov?.[7]?.value ?? '0') * 100).toFixed(1),
    }

    // ─── Parse Daily Users ─────────────────────────────────────────────
    const ga4DailyUsers = dailyResponse[0].rows?.map((row) => ({
      date:     row.dimensionValues?.[0]?.value ?? '',
      users:    parseInt(row.metricValues?.[0]?.value ?? '0'),
      sessions: parseInt(row.metricValues?.[1]?.value ?? '0'),
      views:    parseInt(row.metricValues?.[2]?.value ?? '0'),
    })) ?? []

    // ─── Parse Traffic Sources ─────────────────────────────────────────
    const ga4TrafficSources = sourcesResponse[0].rows?.map((row) => ({
      source:     row.dimensionValues?.[0]?.value ?? 'Unknown',
      sessions:   parseInt(row.metricValues?.[0]?.value ?? '0'),
      users:      parseInt(row.metricValues?.[1]?.value ?? '0'),
      bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
    })) ?? []

    // ─── Parse Devices ─────────────────────────────────────────────────
    const ga4DeviceBreakdown = devicesResponse[0].rows?.map((row) => ({
      device:     row.dimensionValues?.[0]?.value ?? 'Unknown',
      sessions:   parseInt(row.metricValues?.[0]?.value ?? '0'),
      users:      parseInt(row.metricValues?.[1]?.value ?? '0'),
      bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
    })) ?? []

    // ─── Parse Top Pages ───────────────────────────────────────────────
    const ga4TopPages = pagesResponse[0].rows?.map((row) => ({
      page:        row.dimensionValues?.[0]?.value ?? '/',
      views:       row.metricValues?.[0]?.value ?? '0',
      users:       row.metricValues?.[1]?.value ?? '0',
      avgDuration: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(0),
      bounceRate:  parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(1),
    })) ?? []

    // ─── Parse Countries ───────────────────────────────────────────────
    const ga4Countries = countriesResponse[0].rows?.map((row) => ({
      country:  row.dimensionValues?.[0]?.value ?? 'Unknown',
      users:    parseInt(row.metricValues?.[0]?.value ?? '0'),
      sessions: parseInt(row.metricValues?.[1]?.value ?? '0'),
    })) ?? []

    // ─── Parse Landing Pages ───────────────────────────────────────────
    const ga4LandingPages = landingResponse[0].rows?.map((row) => ({
      page:       row.dimensionValues?.[0]?.value ?? '/',
      sessions:   parseInt(row.metricValues?.[0]?.value ?? '0'),
      users:      parseInt(row.metricValues?.[1]?.value ?? '0'),
      bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
    })) ?? []

    // ─── Parse New vs Returning ────────────────────────────────────────
    const ga4NewVsReturning = newVsRetResponse[0].rows?.map((row) => ({
      type:     row.dimensionValues?.[0]?.value === 'new' ? 'New Users' : 'Returning Users',
      users:    parseInt(row.metricValues?.[0]?.value ?? '0'),
      sessions: parseInt(row.metricValues?.[1]?.value ?? '0'),
    })) ?? []

    // ─── Return — keys match exactly what traffic/page.tsx expects ─────
    return NextResponse.json({
      ga4,
      ga4DailyUsers,
      ga4TrafficSources,
      ga4DeviceBreakdown,
      ga4TopPages,
      ga4Countries,
      ga4LandingPages,
      ga4NewVsReturning,
    })

  } catch (error: any) {
    console.error('GA4 Error:', error)
    return NextResponse.json(
      {
        // ✅ Return nulls so page shows graceful fallback, not crash
        ga4:                null,
        ga4DailyUsers:      [],
        ga4TrafficSources:  [],
        ga4DeviceBreakdown: [],
        ga4TopPages:        [],
        ga4Countries:       [],
        ga4LandingPages:    [],
        ga4NewVsReturning:  [],
        error:              error?.message ?? 'Failed to fetch GA4 data',
      },
      { status: 200 } // ✅ 200 not 500 — so page renders gracefully
    )
  }
}