import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WagmiConfig } from "@/providers/wagmi-provider"
import { SdkInitializer } from "@/components/sdk-initializer"
import { FarcasterProvider } from "@/contexts/FarcasterContext"
import { SelfProvider } from "@/contexts/SelfContext"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "ConnectHub - Multi-Wallet Connection Platform",
  description: "Seamlessly connect wallets with Self, WalletConnect, and Farcaster integration. Your unified hub for blockchain interactions.",
  generator: 'ConnectHub',
  keywords: ['wallet', 'farcaster', 'self', 'walletconnect', 'blockchain', 'web3', 'dapp'],
  authors: [{ name: 'CodaLabs' }],
  openGraph: {
    title: "ConnectHub - Multi-Wallet Connection Platform",
    description: "Seamlessly connect wallets with Self, WalletConnect, and Farcaster integration",
    url: "https://connecthub.codalabs.xyz",
    siteName: "ConnectHub",
    images: [
      {
        url: "https://connecthub.codalabs.xyz/banner.png",
        width: 1200,
        height: 630,
        alt: "ConnectHub - Multi-Wallet Connection Platform"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectHub - Multi-Wallet Connection Platform",
    description: "Seamlessly connect wallets with Self, WalletConnect, and Farcaster integration",
    images: ["https://connecthub.codalabs.xyz/banner.png"]
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png"
  },
  manifest: "/.well-known/farcaster.json",
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: "https://connecthub.codalabs.xyz/banner.png",
      aspectRatio: "3:2",
      button: {
        title: "Connect Your Wallet",
        action: {
          type: "launch_frame",
          name: "ConnectHub",
          url: "https://connecthub.codalabs.xyz",
          splashImageUrl: "https://connecthub.codalabs.xyz/splash.png",
          splashBackgroundColor: "#1a1a2e"
        }
      }
    })
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <WagmiConfig>
          <FarcasterProvider>
            <SelfProvider>
              <SdkInitializer />
              {children}
            </SelfProvider>
          </FarcasterProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
