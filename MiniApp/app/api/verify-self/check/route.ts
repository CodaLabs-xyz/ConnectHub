import { NextRequest, NextResponse } from 'next/server'

// Declare global type for verification cache
declare global {
  var verificationCache: Map<string, {
    verified: boolean
    date_of_birth?: string
    name?: string
    nationality?: string
    timestamp: number
  }> | undefined
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const body = await request.json()
    const { userId } = body

    console.log(`[${requestId}] 📥 Verification check request:`, {
      userId,
      bodyReceived: !!body,
      headers: {
        contentType: request.headers.get('content-type'),
        origin: request.headers.get('origin')
      }
    })

    if (!userId) {
      console.log(`[${requestId}] ❌ Missing userId in request`)
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Initialize cache if it doesn't exist
    global.verificationCache = global.verificationCache || new Map()

    const normalizedUserId = userId.toLowerCase()
    const cacheSize = global.verificationCache.size
    const cacheKeys = Array.from(global.verificationCache.keys())

    console.log(`[${requestId}] 🔍 Cache status:`, {
      normalizedUserId,
      cacheSize,
      cacheKeys,
      hasEntry: global.verificationCache.has(normalizedUserId)
    })

    // Check if verification exists for this user
    const verification = global.verificationCache.get(normalizedUserId)

    if (verification) {
      const now = Date.now()
      const oneHourAgo = now - 3600000
      const age = now - verification.timestamp
      const ageMinutes = Math.floor(age / 60000)

      console.log(`[${requestId}] ✅ Found verification:`, {
        verified: verification.verified,
        hasDOB: !!verification.date_of_birth,
        ageMinutes,
        timestamp: new Date(verification.timestamp).toISOString()
      })

      // Clean up old entries (older than 1 hour)
      if (verification.timestamp < oneHourAgo) {
        global.verificationCache.delete(normalizedUserId)
        console.log(`[${requestId}] ⏰ Verification expired (${ageMinutes} minutes old)`)
        return NextResponse.json({
          verified: false
        })
      }

      console.log(`[${requestId}] ✅ Returning valid verification`)
      return NextResponse.json({
        verified: verification.verified,
        date_of_birth: verification.date_of_birth,
        name: verification.name,
        nationality: verification.nationality
      })
    }

    // No verification found yet
    console.log(`[${requestId}] ❌ No verification found - cache empty for this user`)
    return NextResponse.json({
      verified: false
    })

  } catch (error) {
    console.error(`[${requestId}] 🔴 Check verification error:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
