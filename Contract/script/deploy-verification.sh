#!/bin/bash

# Farcaster Mini App Verification Contract Deployment Script
# Usage: ./script/deploy-verification.sh [network]
# Example: ./script/deploy-verification.sh base-sepolia

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default network
NETWORK="${1:-base-sepolia}"

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Farcaster Mini App Verification${NC}"
echo -e "${GREEN}Contract Deployment Script${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Load environment variables
source .env

# Validate required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

if [ -z "$SCOPE_SEED" ]; then
    echo -e "${YELLOW}Warning: SCOPE_SEED not set, using default 'farcaster-miniapp-template'${NC}"
    export SCOPE_SEED="farcaster-miniapp-template"
fi

echo -e "${GREEN}Network:${NC} $NETWORK"
echo -e "${GREEN}Scope:${NC} $SCOPE_SEED"
echo ""

# Build contracts
echo -e "${YELLOW}Building contracts...${NC}"
forge build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful${NC}"
echo ""

# Deploy contract
echo -e "${YELLOW}Deploying contract to $NETWORK...${NC}"

# Select appropriate API key based on network
if [[ "$NETWORK" == "celo"* ]]; then
    API_KEY="$CELOSCAN_API_KEY"
    echo -e "${GREEN}Using CeloScan API Key${NC}"
else
    API_KEY="$BASESCAN_API_KEY"
    echo -e "${GREEN}Using BaseScan API Key${NC}"
fi

DEPLOY_OUTPUT=$(forge script script/DeployVerification.s.sol:DeployVerification \
    --rpc-url "$NETWORK" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$API_KEY" \
    -vvvv 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "$DEPLOY_OUTPUT"

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "Contract Address: 0x[a-fA-F0-9]\{40\}" | grep -o "0x[a-fA-F0-9]\{40\}" | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${YELLOW}Warning: Could not extract contract address from output${NC}"
else
    echo ""
    echo -e "${GREEN}====================================${NC}"
    echo -e "${GREEN}Deployment Summary${NC}"
    echo -e "${GREEN}====================================${NC}"
    echo -e "${GREEN}Network:${NC} $NETWORK"
    echo -e "${GREEN}Contract Address:${NC} $CONTRACT_ADDRESS"
    echo -e "${GREEN}Scope:${NC} $SCOPE_SEED"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update ../MiniApp/.env.local with:"
    echo "   NEXT_PUBLIC_SELF_ENDPOINT=$CONTRACT_ADDRESS"
    echo "   NEXT_PUBLIC_SELF_SCOPE=$SCOPE_SEED"
    echo ""
    echo "2. Restart your Next.js dev server"
    echo ""
    echo "3. Test verification flow in your app"
    echo ""
fi

echo -e "${GREEN}Deployment complete!${NC}"
