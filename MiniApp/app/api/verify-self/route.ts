import { NextRequest, NextResponse } from 'next/server'
import { SelfBackendVerifier, DefaultConfigStore, AllIds } from '@selfxyz/core'

// Initialize the Self Backend Verifier
const selfBackendVerifier = new SelfBackendVerifier(
  process.env.NEXT_PUBLIC_SELF_SCOPE || 'farcaster-miniapp-template',
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`,
  process.env.NEXT_PUBLIC_SELF_USE_MOCK === 'true', // mockPassport (false for mainnet)
  AllIds, // allowed attestation IDs
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [],
    ofac: false
  }),
  'hex' // user identifier type (ethereum address)
)

export async function POST(request: NextRequest) {
  console.log('🚀 /api/verify-self POST endpoint hit!')
  console.log('📍 Request URL:', request.url)
  console.log('🔗 Origin:', request.headers.get('origin'))
  console.log('🔗 Referer:', request.headers.get('referer'))

  try {
    const body = await request.json()
    console.log('📦 Request body keys:', Object.keys(body))

    const { attestationId, proof, publicSignals, userContextData } = body

    console.log('Self verification request received:', {
      attestationId,
      hasProof: !!proof,
      hasPublicSignals: !!publicSignals,
      userContextData
    })

    // Verify the attestation
    const result = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    )

    console.log('Self verification result:', {
      isValid: result.isValidDetails.isValid,
      isMinimumAgeValid: result.isValidDetails.isMinimumAgeValid,
      hasDiscloseOutput: !!result.discloseOutput
    })

    // Log the full discloseOutput to debug
    console.log('🔍 Full discloseOutput:', JSON.stringify(result.discloseOutput, null, 2))

    // Check verification details
    const { isValid, isMinimumAgeValid } = result.isValidDetails

    if (!isValid || !isMinimumAgeValid) {
      return NextResponse.json({
        status: 'error',
        result: false,
        reason: 'Verification failed - User does not meet minimum age requirement or verification is invalid'
      }, { status: 200 })
    }

    // Extract date of birth from disclosure output (camelCase format)
    const dateOfBirthRaw = result.discloseOutput?.dateOfBirth // Format: YYMMDD like "750429"

    console.log('📅 Raw dateOfBirth from Self:', dateOfBirthRaw)
    console.log('🔍 Full discloseOutput keys:', result.discloseOutput ? Object.keys(result.discloseOutput) : 'null')

    // Convert YYMMDD to YYYY-MM-DD format
    let dateOfBirth: string | undefined
    if (dateOfBirthRaw && dateOfBirthRaw.length === 6) {
      const yy = dateOfBirthRaw.substring(0, 2)
      const mm = dateOfBirthRaw.substring(2, 4)
      const dd = dateOfBirthRaw.substring(4, 6)

      // Assume 19xx for years 50-99, 20xx for years 00-49
      const yyyy = parseInt(yy) >= 50 ? `19${yy}` : `20${yy}`
      dateOfBirth = `${yyyy}-${mm}-${dd}`

      console.log('📅 Converted to ISO format:', dateOfBirth)
    }

    // Extract wallet address from userContextData (hex encoded)
    let walletAddress: string | null = null
    try {
      // The userContextData contains the wallet address
      // It's hex-encoded, starts with userId
      const decoded = Buffer.from(userContextData, 'hex').toString('utf8')
      console.log('🔓 Decoded userContextData:', decoded)

      // Try to parse JSON from decoded data
      const jsonMatch = decoded.match(/\{.*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('📝 Parsed user data:', parsed)
      }

      // Extract address from publicSignals or userContextData hex
      // The address is in the userContextData as hex (after the attestation ID)
      const hexData = userContextData.slice(64) // Skip first 32 bytes (attestationId)
      const addressHex = '0x' + hexData.slice(24, 64) // Extract 20-byte address
      walletAddress = addressHex.toLowerCase()
      console.log('💼 Extracted wallet address:', walletAddress)
    } catch (err) {
      console.error('Failed to extract wallet address:', err)
    }

    // Store verification result for polling endpoint using wallet address
    if (dateOfBirth && walletAddress) {
      global.verificationCache = global.verificationCache || new Map()

      global.verificationCache.set(walletAddress, {
        verified: true,
        date_of_birth: dateOfBirth,
        name: result.discloseOutput?.name || '',
        nationality: result.discloseOutput?.nationality || '',
        timestamp: Date.now()
      })

      console.log('✅ Stored verification for wallet:', walletAddress)
      console.log('📅 Date of birth:', dateOfBirth)
      console.log('🗂️ Cache size:', global.verificationCache.size)
      console.log('🗂️ Cache keys:', Array.from(global.verificationCache.keys()))
    } else {
      console.log('❌ Could not store - missing dateOfBirth or walletAddress')
      console.log('   dateOfBirth:', dateOfBirth)
      console.log('   walletAddress:', walletAddress)
    }

    // Return successful verification with disclosed data
    return NextResponse.json({
      status: 'success',
      result: true,
      data: {
        date_of_birth: dateOfBirth,
        name: result.discloseOutput?.name || '',
        nationality: result.discloseOutput?.nationality || ''
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Self verification error:', error)

    return NextResponse.json({
      status: 'error',
      result: false,
      reason: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 200 })
  }
}

// Handle GET requests (for health check)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Self Protocol verification endpoint is active',
    scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'farcaster-miniapp-template'
  })
}
