'use client'

import { useState, useEffect } from 'react'
import { useFarcaster } from '@/contexts/FarcasterContext'

export type PlatformType = 'browser' | 'farcaster-browser' | 'farcaster-mobile'

export function usePlatformDetection() {
  const [platform, setPlatform] = useState<PlatformType>('browser')
  const [isLoading, setIsLoading] = useState(true)
  const { isFarcasterEnvironment } = useFarcaster()

  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent)
      const isFarcasterMobile = userAgent.includes('farcastermobile')

      if (isFarcasterEnvironment) {
        if (isFarcasterMobile || isMobile) {
          setPlatform('farcaster-mobile')
        } else {
          setPlatform('farcaster-browser')
        }
      } else {
        setPlatform('browser')
      }

      setIsLoading(false)
    }

    // Small delay to ensure context is loaded
    const timer = setTimeout(detectPlatform, 100)
    return () => clearTimeout(timer)
  }, [isFarcasterEnvironment])

  return {
    platform,
    isLoading,
    isBrowser: platform === 'browser',
    isFarcasterBrowser: platform === 'farcaster-browser',
    isFarcasterMobile: platform === 'farcaster-mobile',
    isFarcaster: platform === 'farcaster-browser' || platform === 'farcaster-mobile',
  }
}
