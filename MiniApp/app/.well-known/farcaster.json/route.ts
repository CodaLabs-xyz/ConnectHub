import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    frame: {
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'Connect Hub',
      version: '1',
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/icon.png`,
      homeUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      imageUrl: process.env.NEXT_PUBLIC_APP_IMAGE_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
      buttonTitle: 'Launch App',
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/splash.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_APP_SPLASH_BG_COLOR || '#1e40af',
    },
  }

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
