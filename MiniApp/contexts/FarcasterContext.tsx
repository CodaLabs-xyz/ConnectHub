'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  custodyAddress: string
  connectedAddress?: string
  bio?: string
  followerCount?: number
  followingCount?: number
}

interface FarcasterContextType {
  user: FarcasterUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isFarcasterEnvironment: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined)

export function useFarcaster() {
  const context = useContext(FarcasterContext)
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider')
  }
  return context
}

interface FarcasterProviderProps {
  children: ReactNode
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false)

  const signIn = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 Attempting to get Farcaster context...')

      // Get the context which contains user information
      const context = await sdk.context
      console.log('📱 SDK context:', context)

      // Check if we're in a Farcaster environment
      const isInMiniAppResult = await sdk.isInMiniApp()
      const isInFarcaster = !!(
        context?.user ||
        context?.client?.clientFid ||
        isInMiniAppResult
      )

      setIsFarcasterEnvironment(isInFarcaster)

      if (!isInFarcaster || !context) {
        console.log('📍 Not in Farcaster environment')
        setUser(null)
        return
      }

      // Extract real user data from context
      const contextUser = context?.user
      const farcasterUser: FarcasterUser = {
        fid: contextUser?.fid || context.client?.clientFid || 0,
        username: contextUser?.username || 'user',
        displayName: contextUser?.displayName || contextUser?.username || 'User',
        pfpUrl: contextUser?.pfpUrl || '/placeholder.svg',
        custodyAddress: '',
        connectedAddress: undefined,
        bio: undefined,
        followerCount: undefined,
        followingCount: undefined,
      }

      console.log('✅ Farcaster user created:', farcasterUser)
      setUser(farcasterUser)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      console.error('❌ Farcaster authentication error:', err)
      setUser(null)
      setIsFarcasterEnvironment(false)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setError(null)
  }

  useEffect(() => {
    // Auto-authenticate when component mounts
    signIn()
  }, [])

  const isAuthenticated = !!user

  const value: FarcasterContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    isFarcasterEnvironment,
    signIn,
    signOut,
  }

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  )
}
