// src/lib/analytics.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import path from 'path'
import fs from 'fs'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID!

function getClient(): BetaAnalyticsDataClient {

  // ✅ PRODUCTION (Vercel) — credentials from env variable
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new BetaAnalyticsDataClient({ credentials })
  }

  // ✅ LOCAL DEV — use the JSON file
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : path.join(process.cwd(), 'secrets', 'pulsegear-analytics.json')

  if (!fs.existsSync(keyPath)) {
    throw new Error(`GA4 key file not found at: ${keyPath}`)
  }

  return new BetaAnalyticsDataClient({ keyFilename: keyPath })
}

export async function getGA4Data() {
  try {
    const client = getClient()

    const [overview, topPages, dailyUsers, trafficSources, deviceBreakdown,
           countryData, landingPages, returningUsers] =
      await Promise.all([

        // 1. Overview metrics
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'newUsers' },
            { name: 'screenPageViewsPerSession' },
            { name: 'engagementRate' },
          ],
        }),

        // 2. Top pages
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
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

        // 3. Daily users
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        }),

        // 4. Traffic sources
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),

        // 5. Device breakdown
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'bounceRate' },
          ],
        }),

        // 6. Top countries
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
          ],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 8,
        }),

        // 7. Landing pages
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'landingPage' }],
          metrics: [
            { name: 'sessions' },
            { name: 'bounceRate' },
            { name: 'activeUsers' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 8,
        }),

        // 8. New vs Returning
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'newVsReturning' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
          ],
        }),
      ])

    const overviewRow = overview[0].rows?.[0]?.metricValues

    return {
      ga4: {
        activeUsers:        overviewRow?.[0]?.value ?? '0',
        sessions:           overviewRow?.[1]?.value ?? '0',
        pageViews:          overviewRow?.[2]?.value ?? '0',
        bounceRate:         parseFloat(overviewRow?.[3]?.value ?? '0').toFixed(1),
        avgSessionDuration: parseFloat(overviewRow?.[4]?.value ?? '0').toFixed(0),
        newUsers:           overviewRow?.[5]?.value ?? '0',
        pagesPerSession:    parseFloat(overviewRow?.[6]?.value ?? '0').toFixed(2),
        engagementRate:     parseFloat(overviewRow?.[7]?.value ?? '0').toFixed(1),
      },

      ga4TopPages: (topPages[0].rows ?? []).map((row) => ({
        page:        row.dimensionValues?.[0]?.value ?? '',
        views:       row.metricValues?.[0]?.value    ?? '0',
        users:       row.metricValues?.[1]?.value    ?? '0',
        avgDuration: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(0),
        bounceRate:  parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(1),
      })),

      ga4DailyUsers: (dailyUsers[0].rows ?? []).map((row) => ({
        date:     row.dimensionValues?.[0]?.value ?? '',
        users:    parseInt(row.metricValues?.[0]?.value ?? '0'),
        sessions: parseInt(row.metricValues?.[1]?.value ?? '0'),
        views:    parseInt(row.metricValues?.[2]?.value ?? '0'),
      })),

      ga4TrafficSources: (trafficSources[0].rows ?? []).map((row) => ({
        source:     row.dimensionValues?.[0]?.value ?? '',
        sessions:   parseInt(row.metricValues?.[0]?.value ?? '0'),
        users:      parseInt(row.metricValues?.[1]?.value ?? '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
      })),

      ga4DeviceBreakdown: (deviceBreakdown[0].rows ?? []).map((row) => ({
        device:     row.dimensionValues?.[0]?.value ?? '',
        sessions:   parseInt(row.metricValues?.[0]?.value ?? '0'),
        users:      parseInt(row.metricValues?.[1]?.value ?? '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
      })),

      ga4Countries: (countryData[0].rows ?? []).map((row) => ({
        country:  row.dimensionValues?.[0]?.value ?? '',
        users:    parseInt(row.metricValues?.[0]?.value ?? '0'),
        sessions: parseInt(row.metricValues?.[1]?.value ?? '0'),
      })),

      ga4LandingPages: (landingPages[0].rows ?? []).map((row) => ({
        page:       row.dimensionValues?.[0]?.value ?? '',
        sessions:   parseInt(row.metricValues?.[0]?.value ?? '0'),
        bounceRate: parseFloat(row.metricValues?.[1]?.value ?? '0').toFixed(1),
        users:      parseInt(row.metricValues?.[2]?.value ?? '0'),
      })),

      // ✅ FIX — merge duplicate "Returning Users" rows from GA4
      ga4NewVsReturning: (() => {
        const rows = returningUsers[0].rows ?? []
        const result: Record<string, { type: string; users: number; sessions: number }> = {}

        for (const row of rows) {
          const rawType  = row.dimensionValues?.[0]?.value ?? ''
          const users    = parseInt(row.metricValues?.[0]?.value ?? '0')
          const sessions = parseInt(row.metricValues?.[1]?.value ?? '0')

          // Normalize — anything that's not "new" goes under "Returning Users"
          const type = rawType === 'new' ? 'New Users' : 'Returning Users'

          if (!result[type]) {
            result[type] = { type, users: 0, sessions: 0 }
          }

          result[type].users    += users
          result[type].sessions += sessions
        }

        return Object.values(result)
      })(),
    }

  } catch (error) {
    console.error('GA4 Error:', error)
    return {
      ga4:                null,
      ga4TopPages:        [],
      ga4DailyUsers:      [],
      ga4TrafficSources:  [],
      ga4DeviceBreakdown: [],
      ga4Countries:       [],
      ga4LandingPages:    [],
      ga4NewVsReturning:  [],
    }
  }
}