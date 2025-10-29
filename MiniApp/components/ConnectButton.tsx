"use client"

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ChevronDown, SwitchCamera } from "lucide-react"
import { cn, truncateEthAddress } from "@/lib/utils"
import { useFarcaster } from "@/contexts/FarcasterContext"
import { usePlatformDetection } from "@/hooks/usePlatformDetection"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ConnectButton() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { platform, isFarcaster, isFarcasterMobile } = usePlatformDetection()
  const { isConnected, address, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isAuthenticated, user } = useFarcaster()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-connect in Farcaster environment
  useEffect(() => {
    const autoConnect = async () => {
      if (mounted && isAuthenticated && !isConnected && isFarcaster) {
        console.log('🔗 Auto-connecting Farcaster wallet...')
        try {
          const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp')
          if (farcasterConnector) {
            await connect({ connector: farcasterConnector })
            console.log('✅ Auto-connected successfully')
          }
        } catch (error) {
          console.error('❌ Auto-connect failed:', error)
          setError(null)
        }
      }
    }
    autoConnect()
  }, [mounted, isAuthenticated, isConnected, isFarcaster, connectors, connect])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="bg-primary/10 text-primary hover:bg-primary/20"
        disabled
      >
        <Wallet className="h-4 w-4" />
      </Button>
    )
  }

  const handleConnect = async () => {
    try {
      setError(null)

      // Determine which connector to use based on platform
      let selectedConnector

      if (isFarcaster && isAuthenticated) {
        // In Farcaster environment, use farcasterMiniApp connector
        selectedConnector = connectors.find(c => c.id === 'farcasterMiniApp')
        if (!selectedConnector) throw new Error('Farcaster connector not found')
      } else {
        // In browser environment, prioritize connectors
        const injectedConnector = connectors.find(c => c.id === 'injected')
        const walletConnectConnector = connectors.find(c => c.id === 'walletConnect')

        // Try injected first, then WalletConnect
        if (injectedConnector && window.ethereum) {
          selectedConnector = injectedConnector
        } else if (walletConnectConnector) {
          selectedConnector = walletConnectConnector
        } else {
          throw new Error('No suitable wallet connector found')
        }
      }

      await connect({ connector: selectedConnector })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setError('Failed to connect wallet. Please try again.')
    }
  }

  if (isConnected) {
    // In Farcaster mobile, show simple button without dropdown
    if (isFarcasterMobile && isAuthenticated) {
      return (
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="outline"
            className="bg-primary/10 text-primary min-w-[160px]"
            disabled
          >
            <Wallet className="mr-2 h-4 w-4" />
            {user?.username ? `@${user.username}` : 'Connected'}
          </Button>
        </div>
      )
    }

    // In web or Farcaster browser, show dropdown
    return (
      <div className="flex flex-col items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-primary/10 text-primary hover:bg-primary/20",
                "min-w-[160px] justify-between"
              )}
            >
              <div className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                {isFarcaster && user?.username ? (
                  `@${user.username}`
                ) : (
                  address ? truncateEthAddress(address) : 'Connected'
                )}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-muted-foreground">
              Platform: {platform}
            </DropdownMenuItem>
            {connector && (
              <DropdownMenuItem className="text-xs text-muted-foreground">
                Connector: {connector.name}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer"
              onClick={() => disconnect()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {error && (
          <p className="text-sm text-red-500 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleConnect}
        className={cn(
          "bg-primary hover:bg-primary/90",
          "text-primary-foreground",
          "flex items-center gap-2"
        )}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      {error && (
        <p className="text-sm text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
