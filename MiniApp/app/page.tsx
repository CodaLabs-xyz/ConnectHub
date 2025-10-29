"use client"

import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { SelfWidget } from '@/components/SelfWidget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlatformDetection } from '@/hooks/usePlatformDetection'
import { useFarcaster } from '@/contexts/FarcasterContext'
import { Wallet, Smartphone, Globe, User } from 'lucide-react'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { platform, isBrowser, isFarcasterBrowser, isFarcasterMobile } = usePlatformDetection()
  const { user, isAuthenticated } = useFarcaster()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Farcaster Mini App Template
          </h1>
          <p className="text-muted-foreground">
            Multi-platform wallet connection with Self, WalletConnect & Farcaster SDK
          </p>
        </div>

        {/* Connect Button */}
        <div className="flex justify-center">
          <ConnectButton />
        </div>

        {/* Platform Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" suppressHydrationWarning>
              {isBrowser && <Globe className="h-5 w-5" />}
              {isFarcasterBrowser && <Globe className="h-5 w-5 text-purple-500" />}
              {isFarcasterMobile && <Smartphone className="h-5 w-5 text-purple-500" />}
              Platform Detection
            </CardTitle>
            <CardDescription>
              Current platform: <span className="font-semibold">{platform}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Environment</p>
                <p className="text-sm text-muted-foreground">
                  {isBrowser && "Standard Browser"}
                  {isFarcasterBrowser && "Farcaster Browser"}
                  {isFarcasterMobile && "Farcaster Mobile"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Farcaster Auth</p>
                <p className="text-sm text-muted-foreground">
                  {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farcaster User Card */}
        {isAuthenticated && user && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" suppressHydrationWarning>
                <User className="h-5 w-5 text-purple-500" />
                Farcaster User
              </CardTitle>
              <CardDescription>Connected via Farcaster SDK</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {user.pfpUrl && (
                  <img
                    src={user.pfpUrl}
                    alt={user.username}
                    className="h-16 w-16 rounded-full"
                  />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  <p className="text-xs text-muted-foreground">FID: {user.fid}</p>
                </div>
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground border-t pt-4">
                  {user.bio}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Wallet Info Card */}
        {isConnected && address && (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" suppressHydrationWarning>
                <Wallet className="h-5 w-5 text-green-500" />
                Wallet Connected
              </CardTitle>
              <CardDescription>Your wallet details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {address}
                  </p>
                </div>
                {balance && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Balance</p>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Self Protocol Verification Widget */}
        {isConnected && address && (
          <SelfWidget variant="card" />
        )}

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Features</CardTitle>
            <CardDescription>
              This template supports multiple wallet connection methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Farcaster SDK (auto-connects in Farcaster environment)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Self.xyz Protocol verification with deeplink support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>WalletConnect v2 (QR code & mobile wallets)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>Injected wallets (MetaMask, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                <span>Platform detection (browser/farcaster browser/mobile)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
