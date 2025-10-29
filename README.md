# Connect Hub
## Self Protocol Farcaster Mini App with WalletConnect

A Farcaster Mini App template featuring Self Protocol identity verification with both backend API and on-chain smart contract verification modes.

## 🎉 Features

- ✅ **Dual Verification Modes**
  - Backend API verification via HTTPS endpoint
  - Smart contract verification on Celo Mainnet
- ✅ **Self Protocol Integration** - Privacy-preserving identity verification
- ✅ **WalletConnect Support** - Multi-wallet connection support
- ✅ **Farcaster Mini App** - Fully integrated with Farcaster ecosystem
- ✅ **On-Chain Verification Storage** - Decentralized verification data

## 📦 Deployed Contract

**Celo Mainnet Verification Contract:**
- **Address**: `0x5c36cfc25dce95976ce947daaea260b131776d2c`
- **Network**: Celo Mainnet (Chain ID: 42220)
- **Verified**: [Sourcify](https://repo.sourcify.dev/contracts/partial_match/42220/0x5c36cfc25dce95976ce947daaea260b131776d2c/)
- **Explorer**: [CeloScan](https://celoscan.io/address/0x5c36cfc25dce95976ce947daaea260b131776d2c)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Foundry (for smart contracts)
- Self Protocol mobile app

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/self-farcaster-walletconnect-kit.git
cd self-farcaster-walletconnect-kit

# Install dependencies
cd MiniApp
npm install

# Set up environment variables
cp .env.example .env
```

### Configuration

Edit `MiniApp/.env`:

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Self Protocol Configuration
NEXT_PUBLIC_SELF_SCOPE=farcaster-miniapp-template
NEXT_PUBLIC_SELF_APP_NAME=Your App Name

# Smart Contract Verification (Celo Mainnet)
NEXT_PUBLIC_SELF_ENDPOINT=0x5c36cfc25dce95976ce947daaea260b131776d2c
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=celo
NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS=0x5c36cfc25dce95976ce947daaea260b131776d2c

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Run Development Server

```bash
cd MiniApp
npm run dev
```

Visit `http://localhost:3000` to see your Mini App.

## 📁 Project Structure

```
.
├── MiniApp/                 # Next.js frontend application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Self, Farcaster, Wagmi)
│   └── public/            # Static assets
├── Contract/              # Foundry smart contracts
│   ├── src/              # Solidity contracts
│   ├── script/           # Deployment scripts
│   └── test/             # Contract tests
└── SelfExample-backend/  # Reference implementation
```

## 🔐 Verification Modes

### 1. Backend API Verification

- Verification handled by Next.js API route
- Data stored in backend database
- Fast and flexible

### 2. Smart Contract Verification

- Verification stored on Celo blockchain
- Decentralized and immutable
- Uses Self Protocol's on-chain verification

Users can choose between modes in the app's verification UI.

## 🛠 Smart Contract Development

See [Contract/README.md](Contract/README.md) for detailed smart contract documentation including:
- Deployment instructions
- Network configurations
- Contract verification
- Frontend integration

## 📖 Documentation

- [Self Protocol Docs](https://docs.self.xyz/)
- [Farcaster Mini Apps](https://miniapps.farcaster.xyz/)
- [WalletConnect Docs](https://docs.walletconnect.com/)

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📄 License

MIT
