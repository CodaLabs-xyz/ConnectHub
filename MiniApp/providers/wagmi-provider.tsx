"use client"

import React, { useEffect } from "react"
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'

// Create QueryClient at module level (official Farcaster Mini App pattern)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Error suppressor for WalletConnect subscription errors
function ErrorSuppressor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Connection interrupted') ||
         args[0].includes('while trying to subscribe'))
      ) {
        // Suppress WalletConnect subscription errors on reload
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return <>{children}</>
}

// Wagmi provider with QueryClient (Farcaster official template pattern)
// IMPORTANT: WagmiProvider must wrap QueryClientProvider for Wagmi v2
export function WagmiConfig({ children }: { children: React.ReactNode }) {
  return (
    <ErrorSuppressor>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorSuppressor>
  )
}
