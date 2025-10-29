"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Loader2, Copy, Check } from "lucide-react"
import { SelfAppBuilder, getUniversalLink, type SelfApp } from "@selfxyz/qrcode"
import { useFarcaster } from "@/contexts/FarcasterContext"
import { sdk } from "@farcaster/miniapp-sdk"
import { useAccount } from "wagmi"

interface SelfVerifyButtonProps {
  onVerificationSuccess: (data: {
    date_of_birth?: string
    userIdentifier?: string
    name?: string
    nationality?: string
  }) => void
  disabled?: boolean
  variant?: "default" | "outline"
}

export function SelfVerifyButton({
  onVerificationSuccess,
  disabled,
  variant = "outline"
}: SelfVerifyButtonProps) {
  const { isAuthenticated } = useFarcaster()
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [mounted, setMounted] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId)
      }
    }
  }, [pollingIntervalId])

  // Initialize Self app
  useEffect(() => {
    if (!address) return

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SITE_NAME || "Farcaster Mini App",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "farcaster-miniapp-template",
        endpoint: `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`,
        logoBase64: process.env.NEXT_PUBLIC_SELF_LOGO_URL || "",
        userId: address,
        endpointType: "https",
        userIdType: "hex",
        userDefinedData: JSON.stringify({
          timestamp: Date.now(),
          source: "farcaster-miniapp"
        }),
        disclosures: {
          minimumAge: 18,
          ofac: false,
          excludedCountries: [],
          date_of_birth: true
        }
      }).build()

      setSelfApp(app)
    } catch (err) {
      console.error("Failed to initialize Self app:", err)
      setError("Failed to initialize Self Protocol")
    }
  }, [address])

  const copyToClipboard = () => {
    if (!selfApp) return

    const universalLink = getUniversalLink(selfApp)
    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy text:", err)
        setError("Failed to copy link")
      })
  }

  const handleVerify = async () => {
    if (!selfApp || !address) {
      setError("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const universalLink = getUniversalLink(selfApp)

      console.log('🔗 Generated Self deeplink:', universalLink)
      console.log('📍 Verification endpoint:', `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-self`)
      console.log('👤 User address:', address)

      if (isAuthenticated) {
        // In Farcaster app - open with SDK
        try {
          await sdk.actions.openUrl(universalLink)

          // Clear any existing polling
          if (pollingIntervalId) {
            clearInterval(pollingIntervalId)
          }

          let pollAttempts = 0
          const maxPollAttempts = 60 // 60 attempts * 5 seconds = 5 minutes max

          // Poll for verification result
          const pollForResult = setInterval(async () => {
            pollAttempts++

            // Stop after max attempts
            if (pollAttempts > maxPollAttempts) {
              clearInterval(pollForResult)
              setPollingIntervalId(null)
              setIsLoading(false)
              setError('Verification timeout. Please try again or refresh the page.')
              console.log(`⏱️ Polling stopped after ${pollAttempts} attempts (${(pollAttempts * 5) / 60} minutes)`)
              return
            }

            try {
              // Check if verification completed
              const response = await fetch('/api/verify-self/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: address })
              })

              const data = await response.json()

              if (data.verified) {
                clearInterval(pollForResult)
                setPollingIntervalId(null)
                setIsLoading(false)
                onVerificationSuccess(data)
              }
            } catch (err) {
              console.error('Polling error:', err)
            }
          }, 5000) // Poll every 5 seconds

          setPollingIntervalId(pollForResult)

        } catch (err) {
          console.error('Error opening Self app with SDK:', err)
          setIsLoading(false)
          setError('Failed to open verification. Please try copying the link.')
        }
      } else {
        // In browser - open in new tab and provide manual check
        window.open(universalLink, '_blank')
        setIsLoading(false)
        setError('Please complete verification in the opened tab, then refresh this page.')
      }

    } catch (err) {
      console.error('Verification error:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleVerify}
          disabled={disabled || isLoading || !address}
          variant={variant}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying with Self...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Verify with Self Protocol
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={copyToClipboard}
          disabled={disabled || !address || !selfApp}
          variant="outline"
          className="px-3"
          title="Copy verification link"
        >
          {linkCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {!address && (
        <p className="text-xs text-muted-foreground">
          Connect your wallet to verify with Self Protocol
        </p>
      )}
    </div>
  )
}
