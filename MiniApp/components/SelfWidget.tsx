"use client"

import React, { useState, useEffect } from 'react'
import { useSelf } from '@/contexts/SelfContext'
import { useFarcaster } from '@/contexts/FarcasterContext'
import { useAccount, usePublicClient } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Shield, Copy, ExternalLink, Loader2, X, QrCode, Server, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SelfQRcodeWrapper } from '@selfxyz/qrcode'

interface SelfWidgetProps {
  variant?: 'card' | 'inline' | 'floating'
  showQRCode?: boolean
  className?: string
}

export function SelfWidget({
  variant = 'card',
  showQRCode = false,
  className
}: SelfWidgetProps) {
  const { isConnected } = useAccount()
  const { isAuthenticated } = useFarcaster()
  const {
    isVerified,
    verificationData,
    isVerifying,
    error,
    universalLink,
    selfApp,
    initiateSelfVerification,
    clearVerification,
    checkVerificationStatus,
    showWidget,
    setShowWidget
  } = useSelf()

  const [linkCopied, setLinkCopied] = useState(false)
  const [showQR, setShowQR] = useState(showQRCode)

  const copyToClipboard = () => {
    if (!universalLink) return

    navigator.clipboard.writeText(universalLink)
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
      })
  }

  // Don't show if not connected
  if (!isConnected) {
    return null
  }

  // Floating variant
  if (variant === 'floating') {
    if (!showWidget) {
      return (
        <button
          onClick={() => setShowWidget(true)}
          className={cn(
            "fixed bottom-4 right-4 z-50",
            "bg-primary text-primary-foreground",
            "rounded-full p-4 shadow-lg",
            "hover:scale-110 transition-transform",
            "flex items-center gap-2",
            className
          )}
        >
          <Shield className="h-5 w-5" />
          {!isVerified && <span className="text-sm font-medium">Verify</span>}
        </button>
      )
    }

    return (
      <Card className={cn(
        "fixed bottom-4 right-4 z-50",
        "w-80 shadow-xl",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Self Protocol</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowWidget(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Privacy-preserving identity verification</CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetContent
            isVerified={isVerified}
            verificationData={verificationData}
            isVerifying={isVerifying}
            error={error}
            universalLink={universalLink}
            linkCopied={linkCopied}
            selfApp={selfApp}
            showQR={showQR}
            onVerify={initiateSelfVerification}
            onCopy={copyToClipboard}
            onClear={clearVerification}
            onToggleQR={() => setShowQR(!showQR)}
            onVerificationSuccess={checkVerificationStatus}
            isAuthenticated={isAuthenticated}
          />
        </CardContent>
      </Card>
    )
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {isVerified ? (
          <>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Verified
            </Badge>
            {verificationData?.date_of_birth && (
              <span className="text-sm text-muted-foreground">
                DOB: {verificationData.date_of_birth}
              </span>
            )}
          </>
        ) : (
          <Button
            onClick={initiateSelfVerification}
            disabled={isVerifying || !universalLink}
            size="sm"
            variant="outline"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify with Self
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" suppressHydrationWarning>
          <Shield className="h-5 w-5" />
          Self Protocol Verification
        </CardTitle>
        <CardDescription>
          Choose your verification method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="backend" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backend" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Backend API
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Smart Contract
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backend" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Verify using our backend API service
            </div>
            <WidgetContent
              isVerified={isVerified}
              verificationData={verificationData}
              isVerifying={isVerifying}
              error={error}
              universalLink={universalLink}
              linkCopied={linkCopied}
              selfApp={selfApp}
              showQR={showQR}
              onVerify={initiateSelfVerification}
              onCopy={copyToClipboard}
              onClear={clearVerification}
              onToggleQR={() => setShowQR(!showQR)}
              onVerificationSuccess={checkVerificationStatus}
              isAuthenticated={isAuthenticated}
            />
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Verify on-chain using Celo Mainnet smart contract
            </div>
            <ContractVerificationContent
              isVerified={isVerified}
              verificationData={verificationData}
              isVerifying={isVerifying}
              error={error}
              universalLink={universalLink}
              linkCopied={linkCopied}
              selfApp={selfApp}
              showQR={showQR}
              onVerify={initiateSelfVerification}
              onCopy={copyToClipboard}
              onClear={clearVerification}
              onToggleQR={() => setShowQR(!showQR)}
              onVerificationSuccess={checkVerificationStatus}
              isAuthenticated={isAuthenticated}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Shared widget content
function WidgetContent({
  isVerified,
  verificationData,
  isVerifying,
  error,
  universalLink,
  linkCopied,
  selfApp,
  showQR,
  onVerify,
  onCopy,
  onClear,
  onToggleQR,
  onVerificationSuccess,
  isAuthenticated
}: {
  isVerified: boolean
  verificationData: any
  isVerifying: boolean
  error: string | null
  universalLink: string | null
  linkCopied: boolean
  selfApp: any
  showQR: boolean
  onVerify: () => void
  onCopy: () => void
  onClear: () => void
  onToggleQR: () => void
  onVerificationSuccess: (data?: any) => void
  isAuthenticated: boolean
}) {
  if (isVerified && verificationData) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Verification Complete!</span>
        </div>

        <div className="space-y-2 text-sm">
          {verificationData.date_of_birth && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth:</span>
              <span className="font-medium">{verificationData.date_of_birth}</span>
            </div>
          )}
          {verificationData.name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{verificationData.name}</span>
            </div>
          )}
          {verificationData.nationality && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nationality:</span>
              <span className="font-medium">{verificationData.nationality}</span>
            </div>
          )}
        </div>

        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Verification
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Show processing notification when transaction is being processed */}
      {isVerifying && (
        <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-sm">Processing verification...</h3>
              <p className="text-xs text-muted-foreground">
                Your identity proof is being verified and stored on-chain. This may take up to 5 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display - always show when QR mode is active */}
      {showQR && selfApp && (
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-white p-4 rounded-lg border">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={() => {
                console.log('QR verification successful')
                onVerificationSuccess()
              }}
              onError={(err) => {
                console.error('QR verification error:', err)
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Scan with Self Protocol mobile app
          </p>
        </div>
      )}

      {/* Gas fee warning */}
      {!showQR && !isVerifying && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Gas Fees Required
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                You need CELO tokens in your wallet to pay for gas fees when storing verification on-chain. Estimated cost: ~0.01 CELO
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      {!showQR && (
        <Button
          onClick={onVerify}
          disabled={isVerifying || !universalLink}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Waiting for verification...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              {isAuthenticated ? 'Open Self App' : 'Verify with Self'}
            </>
          )}
        </Button>
      )}

      {universalLink && !isVerifying && (
        <div className="flex gap-2">
          <Button
            onClick={onCopy}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Copy className="mr-2 h-3 w-3" />
            {linkCopied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button
            onClick={onToggleQR}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <QrCode className="mr-2 h-3 w-3" />
            {showQR ? 'Hide QR' : 'Show QR'}
          </Button>
        </div>
      )}

      {isVerifying && (
        <p className="text-xs text-muted-foreground text-center">
          Complete verification in Self app. This may take up to 5 minutes.
        </p>
      )}
    </div>
  )
}

// Contract verification content component
function ContractVerificationContent({
  isVerified,
  verificationData,
  isVerifying,
  error,
  universalLink,
  linkCopied,
  selfApp,
  showQR,
  onVerify,
  onCopy,
  onClear,
  onToggleQR,
  onVerificationSuccess,
  isAuthenticated
}: {
  isVerified: boolean
  verificationData: any
  isVerifying: boolean
  error: string | null
  universalLink: string | null
  linkCopied: boolean
  selfApp: any
  showQR: boolean
  onVerify: () => void
  onCopy: () => void
  onClear: () => void
  onToggleQR: () => void
  onVerificationSuccess: (data?: any) => void
  isAuthenticated: boolean
}) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [contractVerifying, setContractVerifying] = useState(false)
  const [contractError, setContractError] = useState<string | null>(null)
  const [contractSelfApp, setContractSelfApp] = useState<any>(null)
  const [contractUniversalLink, setContractUniversalLink] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [contractVerified, setContractVerified] = useState(false)
  const [contractVerificationData, setContractVerificationData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false) // Track when transaction is being processed

  const contractAddress = process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS
  const contractChain = process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE || 'celo'
  // For contract mode, SDK expects string scope (< 31 chars)
  // The relayer will calculate Poseidon hash: Poseidon3.hash([Poseidon(contractAddress), stringToBigInt(scope)])
  const scope = process.env.NEXT_PUBLIC_SELF_SCOPE || 'farcaster-miniapp-template'
  const appName = process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Farcaster Mini App'

  // Get block explorer URL based on chain
  const getExplorerUrl = (txHash: string) => {
    const explorers: Record<string, string> = {
      'celo': 'https://celoscan.io/tx',
      'staging_celo': 'https://alfajores.celoscan.io/tx',
      'base': 'https://basescan.org/tx',
      'staging_base': 'https://sepolia.basescan.org/tx',
    }
    const baseUrl = explorers[contractChain] || 'https://celoscan.io/tx'
    return `${baseUrl}/${txHash}`
  }

  // Initialize contract-specific Self app
  useEffect(() => {
    if (!address || !contractAddress) return

    const initContractApp = async () => {
      try {
        const { SelfAppBuilder, getUniversalLink } = await import('@selfxyz/qrcode')

        console.log('🔧 Contract Self Protocol Configuration:', {
          verificationMode: 'contract',
          endpoint: contractAddress,
          endpointType: contractChain,
          scope,
          userId: address,
        })

        const app = new SelfAppBuilder({
          version: 2,
          appName,
          scope,
          endpoint: contractAddress,
          deeplinkCallback: process.env.NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK ||
            (typeof window !== 'undefined' ? window.location.href : ''),
          logoBase64: process.env.NEXT_PUBLIC_SELF_LOGO_URL || '',
          userId: address,
          endpointType: contractChain as any,
          userIdType: 'hex',
          disclosures: {
            minimumAge: 18,
            excludedCountries: [],
            ofac: false,
            date_of_birth: true,
            name: false,
            nationality: false,
          }
        }).build()

        setContractSelfApp(app)
        setContractUniversalLink(getUniversalLink(app))
      } catch (err) {
        console.error('Failed to initialize contract Self app:', err)
        setContractError('Failed to initialize contract verification')
      }
    }

    initContractApp()
  }, [address, contractAddress, contractChain, scope, appName])

  // Handle contract-specific deeplink verification
  const handleContractVerify = () => {
    if (!contractUniversalLink) {
      setContractError('Universal link not available')
      return
    }

    console.log('🔗 Opening contract verification deeplink:', contractUniversalLink)

    // Open the deeplink
    window.open(contractUniversalLink, '_blank')

    // Start processing and event polling
    setIsProcessing(true)
    setContractError(null)
  }

  // Poll for verification events when processing
  useEffect(() => {
    if (!isProcessing || !address || !contractAddress) return

    let pollCount = 0
    const maxPolls = 60 // Poll for up to 5 minutes (60 * 5 seconds)
    const startTime = Math.floor(Date.now() / 1000) // Current Unix timestamp
    console.log(`⏰ Started polling for events at timestamp: ${startTime}`)

    const pollInterval = setInterval(async () => {
      pollCount++
      console.log(`🔍 Polling for VerificationCompleted events (${pollCount}/${maxPolls})...`)

      try {
        // Create a Celo-specific public client using Alchemy RPC
        const celoRpcUrl = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC || 'https://forno.celo.org'
        const celoClient = createPublicClient({
          chain: celo,
          transport: http(celoRpcUrl)
        })

        // Get current block number
        const currentBlock = await celoClient.getBlockNumber()
        const fromBlock = currentBlock - BigInt(9) // Look back 9 blocks for a total range of 10 blocks (inclusive) - Free tier limit

        console.log(`📦 Checking blocks ${fromBlock} to ${currentBlock}`)

        // Query for VerificationCompleted events
        const logs = await celoClient.getLogs({
          address: contractAddress as `0x${string}`,
          event: {
            type: 'event',
            name: 'VerificationCompleted',
            inputs: [
              { indexed: true, name: 'userAddress', type: 'address' },
              { indexed: true, name: 'userIdentifier', type: 'bytes32' },
              { indexed: false, name: 'timestamp', type: 'uint256' },
              { indexed: false, name: 'dateOfBirth', type: 'string' }
            ]
          },
          fromBlock,
          toBlock: currentBlock
        })

        console.log(`📝 Found ${logs.length} VerificationCompleted events`)

        // Check if any event is for the current user
        for (const log of logs) {
          const eventUserAddress = log.args?.userAddress as string

          if (eventUserAddress?.toLowerCase() === address?.toLowerCase()) {
            const eventTimestamp = Number(log.args?.timestamp || 0)
            const isRecent = eventTimestamp >= startTime - 60 // Within 60 seconds before polling started

            console.log('🎯 Found event for current user:', {
              txHash: log.transactionHash,
              timestamp: eventTimestamp,
              isRecent
            })

            if (isRecent) {
              console.log('✅ Recent verification event found!')

              // Read full verification data from contract
              const data = await celoClient.readContract({
                address: contractAddress as `0x${string}`,
                abi: [
                  {
                    inputs: [{ name: '', type: 'address' }],
                    name: 'verifications',
                    outputs: [
                      { name: 'verified', type: 'bool' },
                      { name: 'timestamp', type: 'uint256' },
                      { name: 'dateOfBirth', type: 'string' },
                      { name: 'name', type: 'string' },
                      { name: 'nationality', type: 'string' },
                      { name: 'userIdentifier', type: 'bytes32' }
                    ],
                    stateMutability: 'view',
                    type: 'function'
                  }
                ],
                functionName: 'verifications',
                args: [address as `0x${string}`]
              }) as any

              clearInterval(pollInterval)
              setIsProcessing(false)
              setContractVerified(true)
              setTxHash(log.transactionHash)
              setContractVerificationData({
                date_of_birth: data.dateOfBirth,
                name: data.name,
                nationality: data.nationality,
                timestamp: data.timestamp
              })

              onVerificationSuccess({
                txHash: log.transactionHash,
                date_of_birth: data.dateOfBirth,
                name: data.name,
                nationality: data.nationality,
                timestamp: data.timestamp
              })

              return // Exit polling
            }
          }
        }
      } catch (error) {
        console.error('❌ Error polling events:', error)
      }

      // Stop polling after max attempts
      if (pollCount >= maxPolls) {
        console.log('⏱️ Polling timeout reached')
        clearInterval(pollInterval)
        setIsProcessing(false)
        setContractError('Verification timeout. Please refresh and check again.')
      }
    }, 5000) // Poll every 5 seconds

    return () => {
      clearInterval(pollInterval)
    }
  }, [isProcessing, address, contractAddress, onVerificationSuccess])

  // Note: Event watching disabled due to Celo RPC filter limitations
  // Using polling mechanism above as the primary detection method
  // Event watching with useWatchContractEvent requires persistent filters
  // which are not reliably supported by Celo's public RPC endpoints

  // Show contract deployment info if not configured
  if (!contractAddress) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Contract Not Deployed
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Deploy the verification contract to enable on-chain verification.
          </p>
          <div className="space-y-2 text-xs">
            <p className="font-mono bg-background p-2 rounded border">
              cd Contract && ./script/deploy-verification.sh
            </p>
            <p className="text-muted-foreground">
              Then add the contract address to <code className="bg-background px-1 rounded">.env</code>:
            </p>
            <p className="font-mono bg-background p-2 rounded border">
              NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS=0x...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If contract verification successful, show success state
  if (contractVerified && contractVerificationData) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-sm">Contract Verification Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Your verification has been stored on-chain on {contractChain === 'celo' ? 'Celo Mainnet' : contractChain}.
              </p>
            </div>
          </div>
        </div>

        {/* Show verification data */}
        <div className="space-y-2 text-sm">
          {contractVerificationData.date_of_birth && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth:</span>
              <span className="font-medium">{contractVerificationData.date_of_birth}</span>
            </div>
          )}
          {contractVerificationData.name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{contractVerificationData.name}</span>
            </div>
          )}
          {contractVerificationData.nationality && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nationality:</span>
              <span className="font-medium">{contractVerificationData.nationality}</span>
            </div>
          )}
        </div>

        {/* Transaction link */}
        {txHash && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold mb-1">Transaction Hash:</p>
            <a
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-mono"
            >
              <span className="break-all">{txHash}</span>
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Clear button */}
        <Button
          onClick={() => {
            setContractVerified(false)
            setContractVerificationData(null)
            setTxHash(null)
          }}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Verification
        </Button>

        {/* Contract info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>Contract:</strong></p>
          <p className="font-mono bg-background p-2 rounded border break-all">
            {contractAddress}
          </p>
          <p><strong>Network:</strong> {contractChain === 'celo' ? 'Celo Mainnet' : contractChain}</p>
        </div>
      </div>
    )
  }

  // Not verified - show verification UI with contract-specific selfApp
  return (
    <div className="space-y-4">
      <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          On-Chain Verification
        </h4>
        <p className="text-sm text-muted-foreground">
          Verification stored on {contractChain === 'celo' ? 'Celo' : 'Base'} blockchain for decentralized access.
        </p>
      </div>

      {contractError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {contractError}
        </div>
      )}

      <WidgetContent
        isVerified={isVerified}
        verificationData={verificationData}
        isVerifying={isProcessing || isVerifying}
        error={contractError || error}
        universalLink={contractUniversalLink || universalLink}
        linkCopied={linkCopied}
        selfApp={contractSelfApp || selfApp}
        showQR={showQR}
        onVerify={handleContractVerify}
        onCopy={() => {
          if (!contractUniversalLink) return
          navigator.clipboard.writeText(contractUniversalLink)
            .then(() => {
              console.log('✅ Contract link copied')
            })
            .catch((err) => {
              console.error('Failed to copy:', err)
            })
        }}
        onClear={() => {
          setContractVerified(false)
          setContractVerificationData(null)
          setTxHash(null)
          setIsProcessing(false)
          setContractError(null)
        }}
        onToggleQR={onToggleQR}
        onVerificationSuccess={() => {
          console.log('✅ QR scan completed, transaction being processed...')
          // Set processing state when QR scan completes
          setIsProcessing(true)
          setContractError(null)
          // The event listener will handle setting verification data when blockchain event is received
        }}
        isAuthenticated={isAuthenticated}
      />

      {/* Contract info - only show when not verified */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p><strong>Contract:</strong></p>
        <p className="font-mono bg-background p-2 rounded border break-all">
          {contractAddress}
        </p>
        <p><strong>Network:</strong> {contractChain === 'celo' ? 'Celo Mainnet' : contractChain}</p>
      </div>
    </div>
  )
}
