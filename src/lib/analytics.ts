// src/lib/analytics.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import path from 'path'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID!

function getClient() {
  return new BetaAnalyticsDataClient({
    keyFilename: path.join(process.cwd(), 'secrets', 'pulsegear-analytics.json'),
  })
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

        // 6. Top countries 🆕
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 8,
        }),

        // 7. Landing pages 🆕
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

        // 8. New vs Returning 🆕
        client.runReport({
          property: `properties/${PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'newVsReturning' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        }),
      ])

    const overviewRow = overview[0].rows?.[0]?.metricValues

    return {
      ga4: {
        activeUsers:         overviewRow?.[0]?.value ?? '0',
        sessions:            overviewRow?.[1]?.value ?? '0',
        pageViews:           overviewRow?.[2]?.value ?? '0',
        bounceRate:          parseFloat(overviewRow?.[3]?.value ?? '0').toFixed(1),
        avgSessionDuration:  parseFloat(overviewRow?.[4]?.value ?? '0').toFixed(0),
        newUsers:            overviewRow?.[5]?.value ?? '0',
        pagesPerSession:     parseFloat(overviewRow?.[6]?.value ?? '0').toFixed(2),
        engagementRate:      parseFloat(overviewRow?.[7]?.value ?? '0').toFixed(1),
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

      // 🆕 New fields
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

      ga4NewVsReturning: (returningUsers[0].rows ?? []).map((row) => ({
        type:     row.dimensionValues?.[0]?.value ?? '',
        users:    parseInt(row.metricValues?.[0]?.value ?? '0'),
        sessions: parseInt(row.metricValues?.[1]?.value ?? '0'),
      })),
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