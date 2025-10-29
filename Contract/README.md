# Farcaster Mini App - Self Protocol Verification Contracts

Smart contract-based verification for Self Protocol integration in your Farcaster Mini App.

## 🎉 Deployed Contract

**Production Deployment (Celo Mainnet):**
- **Contract Address**: `0x5c36cfc25dce95976ce947daaea260b131776d2c`
- **Network**: Celo Mainnet (Chain ID: 42220)
- **Scope Seed**: `farcaster-miniapp-template`
- **Scope Value**: `8343762921614680028815890675509033058898488585381458023126866201429042484184`
- **Verified**: ✅ [Sourcify](https://repo.sourcify.dev/contracts/partial_match/42220/0x5c36cfc25dce95976ce947daaea260b131776d2c/)
- **Transaction**: [View on CeloScan](https://celoscan.io/tx/0x2fb1dc2a93e8cfd2c82377e4cfb1b04bba44452f2a325b1806ee5ea3ef5446dd)
- **Explorer**: [View Contract](https://celoscan.io/address/0x5c36cfc25dce95976ce947daaea260b131776d2c)

## Overview

This directory contains Foundry-based smart contracts for on-chain Self Protocol verification. The contracts store verification data on-chain, providing an alternative to backend verification endpoints.

## Features

- ✅ **Multi-Chain Support** - Deployed on Celo Mainnet, supports Base networks
- ✅ **On-Chain Verification Storage** - Verification data stored immutably on blockchain
- ✅ **Self Protocol Integration** - Extends SelfVerificationRoot for seamless integration
- ✅ **Disclosed Information** - Stores date of birth, name, and nationality
- ✅ **Age Verification** - Built-in age calculation from date of birth
- ✅ **Access Control** - Owner and user can revoke verifications
- ✅ **Automatic Deployment** - Bash script automates deployment and verification

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Network native tokens for gas:
  - Base Sepolia ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
  - Celo (for Celo Mainnet/Testnet)
- Private key with funds
- API keys for contract verification (CeloScan or BaseScan)

## Installation

```bash
# Install dependencies
npm install

# Install Foundry dependencies
forge install

# Copy environment variables
cp .env.example .env
```

## Configuration

Edit `.env` with your values:

```bash
# Your private key (KEEP THIS SECRET!)
PRIVATE_KEY=0xyour_private_key_here

# Network (base, base-sepolia, celo, celo-sepolia)
NETWORK=celo

# Must match frontend NEXT_PUBLIC_SELF_SCOPE
SCOPE_SEED=farcaster-miniapp-template

# Minimum age requirement
MINIMUM_AGE=18

# API keys for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here

# Optional: Excluded countries (comma-separated ISO codes)
EXCLUDED_COUNTRIES=

# Optional: OFAC compliance
OFAC_ENABLED=false
```

## Deployment

### Quick Deploy

```bash
# Deploy to Base Sepolia testnet
npm run deploy:base-sepolia

# Deploy to Base mainnet (production)
npm run deploy:base

# Deploy to Celo Mainnet (production)
npm run deploy:celo

# Deploy to Celo Testnet (Alfajores)
npm run deploy:celo-sepolia
```

### Manual Deploy

```bash
# Build contracts
forge build

# Deploy to specific network
./script/deploy-verification.sh base-sepolia
./script/deploy-verification.sh celo
```

The deployment script will:
1. Build the contracts
2. Deploy FarcasterMiniAppVerification contract
3. Verify contract on block explorer (BaseScan/CeloScan/Sourcify)
4. Display deployment summary with next steps

## Frontend Integration

After deployment, update your `MiniApp/.env.local`:

### For Celo Mainnet Deployment

```bash
# IMPORTANT: Use lowercase address to match contract's scope calculation
NEXT_PUBLIC_SELF_ENDPOINT=0x5c36cfc25dce95976ce947daaea260b131776d2c
NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS=0x5c36cfc25dce95976ce947daaea260b131776d2c

# Must match SCOPE_SEED from contract deployment
NEXT_PUBLIC_SELF_SCOPE=farcaster-miniapp-template

# Set endpoint type to contract (celo or celo-sepolia)
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=celo
```

### For Base Networks

```bash
# Use contract address for on-chain verification
NEXT_PUBLIC_SELF_ENDPOINT=0xYourContractAddress

# Must match SCOPE_SEED from contract deployment
NEXT_PUBLIC_SELF_SCOPE=farcaster-miniapp-template

# Set endpoint type to contract
NEXT_PUBLIC_SELF_ENDPOINT_TYPE=base-sepolia  # or 'base' for mainnet
```

The SelfWidget will automatically detect contract-based verification and update the UI accordingly.

## Contract Architecture

### FarcasterMiniAppVerification.sol

Main verification contract that extends `SelfVerificationRoot`.

**Key Features:**
- Stores verification data on-chain
- Maps wallet addresses to verification status
- Tracks date of birth, name, and nationality
- Provides age calculation function
- Supports verification revocation

**Main Functions:**

```solidity
// Check if address is verified
function isVerified(address userAddress) external view returns (bool)

// Get verification data
function getVerificationData(address userAddress) external view returns (VerificationData memory)

// Get age from date of birth
function getAge(address userAddress) external view returns (uint256)

// Revoke verification (user or owner only)
function revokeVerification(address userAddress) external
```

## Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## Contract Verification

The deployment script automatically verifies contracts. To manually verify:

### BaseScan Verification (Base Networks)

```bash
forge verify-contract \
  --chain-id 84532 \
  --constructor-args $(cast abi-encode "constructor(address,string,(uint256,string[],bool))" $HUB_ADDRESS "$SCOPE" "($MIN_AGE,[],$OFAC)") \
  --compiler-version v0.8.28 \
  $CONTRACT_ADDRESS \
  src/FarcasterMiniAppVerification.sol:FarcasterMiniAppVerification \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Sourcify Verification (Decentralized - All Networks)

If CeloScan/BaseScan verification fails, use Sourcify:

```bash
forge verify-contract \
  --chain-id 42220 \
  --constructor-args $(cast abi-encode "constructor(address,string,(uint256,string[],bool))" $HUB_ADDRESS "$SCOPE" "($MIN_AGE,[],$OFAC)") \
  --compiler-version v0.8.28 \
  $CONTRACT_ADDRESS \
  src/FarcasterMiniAppVerification.sol:FarcasterMiniAppVerification \
  --verifier sourcify \
  --verifier-url https://sourcify.dev/server/
```

Sourcify provides decentralized contract verification and is useful when:
- CeloScan API is experiencing issues
- Cloudflare blocks automated verification
- You prefer decentralized verification infrastructure

## Network Configuration

### Celo Mainnet (Production)
- **Chain ID**: 42220
- **RPC**: https://forno.celo.org
- **Explorer**: https://celoscan.io
- **Hub Address**: 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
- **Faucet**: Not needed (buy CELO on exchanges)

### Celo Testnet - Alfajores
- **Chain ID**: 44787
- **RPC**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io
- **Hub Address**: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
- **Faucet**: https://faucet.celo.org/alfajores

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Hub Address**: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Hub Address**: TBD (update when available)

## Backend vs Smart Contract Verification

### Backend Verification
- ✅ Faster deployment (no blockchain transaction)
- ✅ Lower cost (no gas fees)
- ✅ Easier to update
- ❌ Centralized storage
- ❌ Requires server infrastructure

### Smart Contract Verification
- ✅ Decentralized and transparent
- ✅ Permanent on-chain record
- ✅ No server required
- ✅ Trustless verification
- ❌ Gas costs for deployment
- ❌ Harder to update

## Troubleshooting

### Deployment Failed

Check that:
- Private key has sufficient network native tokens:
  - Base Sepolia: ETH from faucet
  - Celo Mainnet: CELO (≥0.1 for gas)
  - Celo Testnet: CELO from faucet
- `.env` is properly configured with correct hub address
- `ETH_FROM` environment variable matches your wallet address
- Foundry is installed: `forge --version`

### Verification Failed

**For CeloScan/BaseScan:**
- Ensure API key is valid and added to `.env`
- Wait a few minutes after deployment
- Try manual verification with the command above

**If Cloudflare blocks verification:**
- Use Sourcify decentralized verifier instead
- See "Sourcify Verification" section above
- Sourcify verification is permanent and trustless

### Wrong Network

Check your `.env` file:
- `NETWORK` should be `base`, `base-sepolia`, `celo`, or `celo-sepolia`
- Correct hub address for the network
- RPC endpoints are correct in `foundry.toml`

## Project Structure

```
Contract/
├── src/
│   └── FarcasterMiniAppVerification.sol  # Main contract
├── script/
│   ├── Base.s.sol                        # Base deployment script
│   ├── DeployVerification.s.sol          # Deployment logic
│   └── deploy-verification.sh            # Automated deployment
├── test/                                  # Test files
├── lib/                                   # Foundry dependencies
├── foundry.toml                          # Foundry configuration
├── package.json                          # npm scripts
├── .env.example                          # Environment template
└── README.md                             # This file
```

## Security Considerations

1. **Never commit `.env`** - Contains your private key
2. **Test on testnet first** - Use Celo Alfajores or Base Sepolia before mainnet
3. **Verify contracts** - Always verify on block explorer (CeloScan/BaseScan/Sourcify)
4. **Access control** - Only owner and user can revoke verifications
5. **Scope matching** - Frontend scope must match contract scope
6. **Hub address validation** - Ensure correct Self Protocol hub address for each network

## Support

- [Self Protocol Docs](https://docs.self.xyz)
- [Foundry Book](https://book.getfoundry.sh)
- [Celo Docs](https://docs.celo.org)
- [Base Docs](https://docs.base.org)
- [Sourcify Verification](https://sourcify.dev)
- [Self Protocol Telegram](https://t.me/selfprotocol)

## License

MIT
