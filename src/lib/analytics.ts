import { BetaAnalyticsDataClient } from '@google-analytics/data'
import path from 'path'
import fs from 'fs'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID!

function getClient(): BetaAnalyticsDataClient {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new BetaAnalyticsDataClient({ credentials })
  }

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : path.join(process.cwd(), 'secrets', 'pulsegear-analytics.json')

  if (!fs.existsSync(keyPath)) {
    throw new Error(`GA4 key file not found at: ${keyPath}`)
  }

  return new BetaAnalyticsDataClient({ keyFilename: keyPath })
}

// ✅ بنشغل كل report لوحده ونشوف أيهم بيفشل
async function runSafe(
  client: BetaAnalyticsDataClient,
  name: string,
  request: Parameters<BetaAnalyticsDataClient['runReport']>[0]
) {
  try {
    const [response] = await client.runReport(request)
    console.log(`✅ Report OK: ${name}`)
    return response
  } catch (error: any) {
    console.error(`❌ Report FAILED: ${name}`)
    console.error(`   Error: ${error?.message}`)
    console.error(`   Code:  ${error?.code}`)
    // ✅ رجّع object فاضي بدل ما يكسر كل حاجة
    return { rows: [], failedReport: name, failedError: error?.message }
  }
}

export async function getGA4Data() {
  try {
    const client = getClient()

    const overview = await runSafe(client, 'overview', {
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
        { name: 'totalUsers' },
        { name: 'conversions' },
      ],
    })

    const topPages = await runSafe(client, 'topPages', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'exits' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    })

    const dailyUsers = await runSafe(client, 'dailyUsers', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'newUsers' },
        { name: 'engagementRate' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    })

    const trafficSources = await runSafe(client, 'trafficSources', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    })

    const deviceBreakdown = await runSafe(client, 'deviceBreakdown', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViewsPerSession' },
      ],
    })

    const countryData = await runSafe(client, 'countryData', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 8,
    })

    const landingPages = await runSafe(client, 'landingPages', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8,
    })

    const returningUsers = await runSafe(client, 'returningUsers', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'newVsReturning' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    })

    const exitPages = await runSafe(client, 'exitPages', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'exits' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ metric: { metricName: 'exits' }, desc: true }],
      limit: 8,
    })

    const cityData = await runSafe(client, 'cityData', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'country' },
        { name: 'city' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'country',
          stringFilter: { value: 'Egypt' },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    })

    const operatingSystem = await runSafe(client, 'operatingSystem', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'operatingSystem' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8,
    })

    const sourcesMedium = await runSafe(client, 'sourcesMedium', {
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    })

    // ✅ نحط كل الـ failed reports في الـ response
    const failedReports = [
      overview, topPages, dailyUsers, trafficSources,
      deviceBreakdown, countryData, landingPages, returningUsers,
      exitPages, cityData, operatingSystem, sourcesMedium,
    ]
      .filter((r: any) => r.failedReport)
      .map((r: any) => ({ report: r.failedReport, error: r.failedError }))

    const overviewRow = (overview as any).rows?.[0]?.metricValues

    return {
      // ✅ لو في failed reports هنرجع ga4: null مع قائمة المشاكل
      ga4: failedReports.length > 0 && !(overview as any).rows ? null : {
        activeUsers:        overviewRow?.[0]?.value ?? '0',
        sessions:           overviewRow?.[1]?.value ?? '0',
        pageViews:          overviewRow?.[2]?.value ?? '0',
        bounceRate:         parseFloat(overviewRow?.[3]?.value ?? '0').toFixed(1),
        avgSessionDuration: parseFloat(overviewRow?.[4]?.value ?? '0').toFixed(0),
        newUsers:           overviewRow?.[5]?.value ?? '0',
        pagesPerSession:    parseFloat(overviewRow?.[6]?.value ?? '0').toFixed(2),
        engagementRate:     parseFloat(overviewRow?.[7]?.value ?? '0').toFixed(1),
        totalUsers:         overviewRow?.[8]?.value ?? '0',
        conversions:        overviewRow?.[9]?.value ?? '0',
      },

      // ✅ أهم حاجة — قائمة الـ reports اللي فشلت
      failedReports,

      ga4TopPages: ((topPages as any).rows ?? []).map((row: any) => ({
        page:        row.dimensionValues?.[0]?.value ?? '',
        pageTitle:   row.dimensionValues?.[1]?.value ?? '',
        views:       row.metricValues?.[0]?.value    ?? '0',
        users:       row.metricValues?.[1]?.value    ?? '0',
        avgDuration: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(0),
        bounceRate:  parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(1),
        exits:       parseInt(row.metricValues?.[4]?.value   ?? '0'),
        exitRate: (
          parseInt(row.metricValues?.[4]?.value ?? '0') /
          Math.max(parseInt(row.metricValues?.[0]?.value ?? '1'), 1) * 100
        ).toFixed(1),
      })),

      ga4DailyUsers: ((dailyUsers as any).rows ?? []).map((row: any) => ({
        date:           row.dimensionValues?.[0]?.value ?? '',
        users:          parseInt(row.metricValues?.[0]?.value ?? '0'),
        sessions:       parseInt(row.metricValues?.[1]?.value ?? '0'),
        views:          parseInt(row.metricValues?.[2]?.value ?? '0'),
        newUsers:       parseInt(row.metricValues?.[3]?.value ?? '0'),
        engagementRate: parseFloat(row.metricValues?.[4]?.value ?? '0').toFixed(1),
      })),

      ga4TrafficSources: ((trafficSources as any).rows ?? []).map((row: any) => ({
        source:         row.dimensionValues?.[0]?.value ?? '',
        sessions:       parseInt(row.metricValues?.[0]?.value  ?? '0'),
        users:          parseInt(row.metricValues?.[1]?.value  ?? '0'),
        bounceRate:     parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
        engagementRate: parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(1),
        avgDuration:    parseFloat(row.metricValues?.[4]?.value ?? '0').toFixed(0),
        conversions:    parseInt(row.metricValues?.[5]?.value  ?? '0'),
      })),

      ga4DeviceBreakdown: ((deviceBreakdown as any).rows ?? []).map((row: any) => ({
        device:          row.dimensionValues?.[0]?.value ?? '',
        sessions:        parseInt(row.metricValues?.[0]?.value  ?? '0'),
        users:           parseInt(row.metricValues?.[1]?.value  ?? '0'),
        bounceRate:      parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
        avgDuration:     parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(0),
        pagesPerSession: parseFloat(row.metricValues?.[4]?.value ?? '0').toFixed(2),
      })),

      ga4Countries: ((countryData as any).rows ?? []).map((row: any) => ({
        country:     row.dimensionValues?.[0]?.value ?? '',
        users:       parseInt(row.metricValues?.[0]?.value  ?? '0'),
        sessions:    parseInt(row.metricValues?.[1]?.value  ?? '0'),
        bounceRate:  parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
        avgDuration: parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(0),
      })),

      ga4LandingPages: ((landingPages as any).rows ?? []).map((row: any) => ({
        page:        row.dimensionValues?.[0]?.value ?? '',
        sessions:    parseInt(row.metricValues?.[0]?.value  ?? '0'),
        bounceRate:  parseFloat(row.metricValues?.[1]?.value ?? '0').toFixed(1),
        users:       parseInt(row.metricValues?.[2]?.value  ?? '0'),
        avgDuration: parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(0),
        conversions: parseInt(row.metricValues?.[4]?.value  ?? '0'),
      })),

      ga4NewVsReturning: (() => {
        const rows = (returningUsers as any).rows ?? []
        const result: Record<string, any> = {}
        for (const row of rows) {
          const rawType    = row.dimensionValues?.[0]?.value ?? ''
          const users      = parseInt(row.metricValues?.[0]?.value ?? '0')
          const sessions   = parseInt(row.metricValues?.[1]?.value ?? '0')
          const bounceRate = parseFloat(row.metricValues?.[2]?.value ?? '0')
          const avgDur     = parseFloat(row.metricValues?.[3]?.value ?? '0')
          const type       = rawType === 'new' ? 'New Users' : 'Returning Users'
          if (!result[type]) {
            result[type] = { type, users: 0, sessions: 0, bounceRate: 0, avgDuration: 0, count: 0 }
          }
          result[type].users       += users
          result[type].sessions    += sessions
          result[type].bounceRate  += bounceRate
          result[type].avgDuration += avgDur
          result[type].count       += 1
        }
        return Object.values(result).map(({ count, bounceRate, avgDuration, ...rest }) => ({
          ...rest,
          bounceRate:  parseFloat((bounceRate  / count).toFixed(1)),
          avgDuration: parseFloat((avgDuration / count).toFixed(0)),
        }))
      })(),

      ga4ExitPages: ((exitPages as any).rows ?? []).map((row: any) => ({
        page:      row.dimensionValues?.[0]?.value ?? '',
        pageTitle: row.dimensionValues?.[1]?.value ?? '',
        exits:     parseInt(row.metricValues?.[0]?.value ?? '0'),
        views:     parseInt(row.metricValues?.[1]?.value ?? '0'),
        exitRate: (
          parseInt(row.metricValues?.[0]?.value ?? '0') /
          Math.max(parseInt(row.metricValues?.[1]?.value ?? '1'), 1) * 100
        ).toFixed(1),
      })),

      ga4Cities: ((cityData as any).rows ?? []).map((row: any) => ({
        country:    row.dimensionValues?.[0]?.value ?? '',
        city:       row.dimensionValues?.[1]?.value ?? '',
        users:      parseInt(row.metricValues?.[0]?.value  ?? '0'),
        sessions:   parseInt(row.metricValues?.[1]?.value  ?? '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
      })),

      ga4OperatingSystems: ((operatingSystem as any).rows ?? []).map((row: any) => ({
        os:         row.dimensionValues?.[0]?.value ?? '',
        users:      parseInt(row.metricValues?.[0]?.value  ?? '0'),
        sessions:   parseInt(row.metricValues?.[1]?.value  ?? '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
      })),

      ga4SourceMedium: ((sourcesMedium as any).rows ?? []).map((row: any) => ({
        source:      row.dimensionValues?.[0]?.value ?? '',
        medium:      row.dimensionValues?.[1]?.value ?? '',
        sessions:    parseInt(row.metricValues?.[0]?.value  ?? '0'),
        users:       parseInt(row.metricValues?.[1]?.value  ?? '0'),
        bounceRate:  parseFloat(row.metricValues?.[2]?.value ?? '0').toFixed(1),
        avgDuration: parseFloat(row.metricValues?.[3]?.value ?? '0').toFixed(0),
      })),
    }

  } catch (error: any) {
    console.error('GA4 FATAL ERROR:', error?.message)
    return {
      ga4:                 null,
      ga4TopPages:         [],
      ga4DailyUsers:       [],
      ga4TrafficSources:   [],
      ga4DeviceBreakdown:  [],
      ga4Countries:        [],
      ga4LandingPages:     [],
      ga4NewVsReturning:   [],
      ga4ExitPages:        [],
      ga4Cities:           [],
      ga4OperatingSystems: [],
      ga4SourceMedium:     [],
      error:   error?.message   ?? 'Unknown error',
      code:    error?.code      ?? 'No code',
      details: error?.toString() ?? 'No details',
    }
  }
}