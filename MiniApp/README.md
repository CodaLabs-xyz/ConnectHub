# Farcaster Mini App Template

A production-ready template for building Farcaster Mini Apps with multi-platform wallet support including Self.xyz verification, WalletConnect, and Farcaster SDK integration.

## Features

- 🔗 **Multi-Connector Support**
  - Farcaster SDK (auto-connects in Farcaster environment)
  - WalletConnect v2 (QR code & mobile wallets)
  - Injected wallets (MetaMask, Coinbase Wallet, etc.)

- 🔐 **Self Protocol Verification**
  - Privacy-preserving identity verification via deeplink/QR code
  - Age verification and KYC compliance
  - Polling-based verification result retrieval

- 📱 **Platform Detection**
  - Browser (standard web)
  - Farcaster Browser (desktop)
  - Farcaster Mobile (iOS/Android)
  - Automatic connector selection based on platform

- 🎨 **Modern Stack**
  - Next.js 14 with App Router
  - TypeScript
  - Tailwind CSS
  - Radix UI components
  - Wagmi v2 for Web3 interactions
  - React Query for state management

## Getting Started

### 1. Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following environment variables:

```env
# Required: WalletConnect Project ID
# Get yours at: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Self Protocol Configuration (for verification)
NEXT_PUBLIC_SELF_SCOPE=farcaster-miniapp-template
NEXT_PUBLIC_SELF_APP_NAME=Farcaster Mini App Template
NEXT_PUBLIC_SELF_LOGO_URL=
NEXT_PUBLIC_SELF_USE_MOCK=false

# IMPORTANT: Deeplink callback URL for Self Protocol
# For Farcaster Mini Apps, this should be your frame URL
# Example: https://warpcast.com/~/composer?embeds[]=https://your-app.com
# If not set, defaults to current page URL
NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK=https://your-frame-url.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Farcaster Mini App Template

# Optional: Chain Configuration (defaults to Base mainnet)
# Base Mainnet: 8453
# Base Sepolia: 84532
NEXT_PUBLIC_CHAIN_ID=8453
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
MiniApp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page with wallet demo
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ConnectButton.tsx # Multi-platform wallet connection
│   └── sdk-initializer.tsx # Farcaster SDK initialization
├── contexts/             # React contexts
│   └── FarcasterContext.tsx # Farcaster user authentication
├── hooks/                # Custom React hooks
│   └── usePlatformDetection.ts # Platform detection hook
├── lib/                  # Utilities
│   ├── wagmi.ts         # Wagmi configuration
│   └── utils.ts         # Helper functions
├── providers/           # Provider components
│   └── wagmi-provider.tsx # Wagmi & React Query setup
└── types/               # TypeScript types
```

## Platform Detection

The template automatically detects the platform and selects the appropriate wallet connector:

### Browser (Standard Web)
- Priority: Self.xyz → Injected → WalletConnect
- Shows full dropdown menu with options

### Farcaster Browser (Desktop)
- Auto-connects using Farcaster SDK
- Shows Farcaster username in button
- Full dropdown functionality

### Farcaster Mobile (iOS/Android)
- Auto-connects using Farcaster SDK
- Simplified UI (no dropdown)
- Shows Farcaster username

## Key Components

### ConnectButton

The main wallet connection component that adapts to the platform:

```tsx
import { ConnectButton } from '@/components/ConnectButton'

<ConnectButton />
```

### Platform Detection Hook

```tsx
import { usePlatformDetection } from '@/hooks/usePlatformDetection'

const {
  platform,
  isBrowser,
  isFarcasterBrowser,
  isFarcasterMobile,
  isFarcaster
} = usePlatformDetection()
```

### Farcaster Context

```tsx
import { useFarcaster } from '@/contexts/FarcasterContext'

const {
  user,              // Farcaster user data
  isAuthenticated,   // Auth status
  isFarcasterEnvironment // Environment check
} = useFarcaster()
```

## Wallet Integration

### Adding Custom Connectors

Edit `lib/wagmi.ts` to add more connectors:

```typescript
import { customConnector } from 'custom-package'

const connectors = [
  farcasterMiniApp(),
  selfConnector({ appId: selfAppId }),
  customConnector({ /* config */ }),
  // ... other connectors
]
```

### Chain Configuration

The template uses Base network by default. To add more chains:

```typescript
import { arbitrum, optimism } from 'wagmi/chains'

const transports = {
  [base.id]: http(),
  [arbitrum.id]: http(),
  [optimism.id]: http(),
}

export const config = createConfig({
  chains: [base, arbitrum, optimism],
  transports,
  connectors,
})
```

## Farcaster Mini App Configuration

### Frame Metadata

The template includes Farcaster Frame metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
      aspectRatio: "3:2",
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          name: "Mini App Template",
          url: process.env.NEXT_PUBLIC_SITE_URL || '',
          splashImageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/splash.png`,
          splashBackgroundColor: "#1e40af"
        }
      }
    })
  }
}
```

### SDK Initialization

The Farcaster SDK is automatically initialized in `components/sdk-initializer.tsx`. It handles:

- Environment detection
- Context retrieval
- Ready state signaling
- Timeout handling

## Self Protocol Verification

### Deeplink Callback Configuration

When using Self Protocol verification in Farcaster Mini Apps, you need to configure the deeplink callback URL properly:

**For Farcaster Mini Apps:**
```env
# Your frame's public URL (users return here after verification)
NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK=https://your-app.com
```

**How it works:**
1. User clicks "Verify with Self Protocol"
2. App opens Self app with deeplink containing callback URL
3. User completes verification in Self app
4. Self app redirects back to your `NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK` URL
5. Polling mechanism detects verification completion from backend
6. UI updates automatically

**Important Notes:**
- For Farcaster frames, use your frame's embed URL
- If not set, defaults to current page URL (`window.location.href`)
- Backend polling checks verification status every 5 seconds
- Polling times out after 5 minutes (60 attempts)

### Verification Flow

```typescript
import { useSelf } from '@/contexts/SelfContext'

const {
  isVerified,           // Verification status
  verificationData,     // User verification data
  isVerifying,          // Loading state
  error,                // Error message
  initiateSelfVerification, // Start verification
  clearVerification     // Reset state
} = useSelf()
```

**Polling Mechanism:**
- Automatically starts when verification is initiated
- Checks backend every 5 seconds
- Stops when verification succeeds or times out
- Works in both browser and Farcaster mobile

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_SELF_APP_ID`
- `NEXT_PUBLIC_SITE_URL` (your production URL)
- `NEXT_PUBLIC_SITE_NAME`

### Hosting Recommendations

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Render**

## Troubleshooting

### WalletConnect Connection Issues

If you see WalletConnect subscription errors:
- Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- Clear localStorage and try again
- Check WalletConnect project settings

### Farcaster SDK Not Initializing

- Verify you're testing in a Farcaster environment
- Check browser console for SDK logs
- Ensure `sdk-initializer` is included in layout

### Self.xyz Connection Issues

- Verify `NEXT_PUBLIC_SELF_APP_ID` is correct
- Ensure Self.xyz app is properly configured
- Check Self.xyz documentation for setup

## Resources

- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/developers/mini-apps)
- [Farcaster SDK](https://github.com/farcasterxyz/miniapp-sdk)
- [Self.xyz Documentation](https://docs.self.xyz)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
