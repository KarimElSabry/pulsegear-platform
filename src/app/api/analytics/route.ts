// src/app/api/analytics/route.ts

export const dynamic    = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getGA4Data }   from '@/lib/analytics'

export async function GET() {
  try {
    const data = await getGA4Data()
    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    })
  } catch (error: any) {
    console.error('GA4 Route Error:', error)
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
        error: error?.message ?? 'Failed to fetch GA4 data',
      },
      { status: 200 }
    )
  }
}