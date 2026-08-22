// src/app/api/leads/route.ts

export const dynamic    = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getGA4Data }   from '@/lib/analytics'

export async function GET() {
  try {
    const data = await getGA4Data()

    // ✅ لو الـ getGA4Data رجعت error field — لوج في الـ route كمان
    if ((data as any).error) {
      console.error('GA4 returned error in data:', (data as any).error)
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    })

  } catch (error: any) {
    console.error('GA4 ROUTE LEVEL ERROR:', error)

    return NextResponse.json(
      {
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
        error:   error?.message            ?? 'Route level error',
        code:    error?.code               ?? 'No code',
        status:  error?.status             ?? 'No status',
        details: error?.details            ?? 'No details',
        stack:   error?.stack?.split('\n')[0] ?? 'No stack',
      },
      { status: 200 }
    )
  }
}