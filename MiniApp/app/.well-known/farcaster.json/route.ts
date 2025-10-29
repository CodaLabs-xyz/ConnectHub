import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjIxMDY3MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDAxMUM1RjM3N2M2OTY4ZjhDOGNGODZmY0Y3OEYxMUFhOTgyMmJFOEYifQ",
      payload: "eyJkb21haW4iOiJjb25uZWN0aHViLmNvZGFsYWJzLnh5eiJ9",
      signature: "L1W1G6o+WQG83b7dl/a+sPV5BU0w/IDyxFh0E+OzCchr3Lsp24Sq0ScE/focGhyBdX2uvssJ3nt8fM0zQAGzbhw="
    },
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
