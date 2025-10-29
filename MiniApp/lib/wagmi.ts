import { http, createConfig } from 'wagmi'
import { base, baseSepolia, mainnet, celo, celoAlfajores } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { walletConnect, injected } from 'wagmi/connectors'

// Get chain configuration from environment variables
const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "8453")

// Select the appropriate chain based on the chain ID
const targetChain = TARGET_CHAIN_ID === 8453 ? base : baseSepolia

// Get Celo RPC URL from environment or use default
const CELO_RPC_URL = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC || 'https://forno.celo.org'

// Create transports object with proper typing for all chains
const transports = {
  [base.id]: http(),
  [baseSepolia.id]: http(),
  [mainnet.id]: http(),
  [celo.id]: http(CELO_RPC_URL),
  [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
} as const

// WalletConnect project ID is required for WalletConnect v2
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined')
}

// Configure connectors array
const connectors = [
  // Farcaster Mini App Connector (auto-activated in Farcaster environment)
  farcasterMiniApp(),

  // Injected Connector (for browser extension wallets like MetaMask)
  injected(),

  // WalletConnect Connector (for mobile wallets and QR code connection)
  walletConnect({
    projectId,
    showQrModal: true,
    metadata: {
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'Farcaster Mini App',
      description: 'Farcaster Mini App with Self and WalletConnect',
      url: process.env.NEXT_PUBLIC_SITE_URL || '',
      icons: [`${process.env.NEXT_PUBLIC_SITE_URL}/icon.png`],
    },
  }),
]

// Create wagmi config with all chains and connectors
export const config = createConfig({
  chains: [targetChain, base, baseSepolia, mainnet, celo, celoAlfajores],
  transports,
  connectors,
})
