import { NextRequest, NextResponse } from 'next/server'
import { scriptRateLimiter, imageRateLimiter } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Rate limit reset only available in development' },
        { status: 403 }
      )
    }

    // Reset both rate limiters
    scriptRateLimiter.resetLimits()
    imageRateLimiter.resetLimits()

    return NextResponse.json({
      message: 'Rate limits reset successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting rate limits:', error)
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    )
  }
}
