# Architecture Documentation

## Overview

This Farcaster Mini App template implements a sophisticated multi-platform wallet connection system with automatic platform detection and appropriate connector selection.

## Core Architecture

### 1. Platform Detection Layer

**Location:** `hooks/usePlatformDetection.ts`

The platform detection system identifies three distinct environments:

- **Browser**: Standard web browser (Chrome, Safari, etc.)
- **Farcaster Browser**: Desktop Farcaster client
- **Farcaster Mobile**: iOS/Android Farcaster app

**Detection Logic:**
```typescript
if (isFarcasterEnvironment) {
  if (isFarcasterMobile || isMobile) {
    return 'farcaster-mobile'
  } else {
    return 'farcaster-browser'
  }
} else {
  return 'browser'
}
```

### 2. Wallet Connector Layer

**Location:** `lib/wagmi.ts`

Three wallet connectors are configured in priority order:

1. **Farcaster Mini App Connector** (`farcasterMiniApp`)
   - Auto-activated in Farcaster environments
   - Uses Farcaster SDK for authentication
   - Provides seamless user experience

2. **Injected Connector** (`injected`)
   - Detects browser extension wallets
   - Supports MetaMask, Coinbase Wallet, etc.
   - Primary connector for browser environment

3. **WalletConnect Connector** (`walletConnect`)
   - QR code scanning for mobile wallets
   - Deep linking support
   - Fallback when no injected wallet detected
   - Requires `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

**Self Protocol Integration**
- Self.xyz is used for **verification only**, not as a wallet connector
- Implemented via deeplink flow with polling mechanism
- See `SelfVerifyButton` component for implementation details

### 3. Context Layer

#### Farcaster Context
**Location:** `contexts/FarcasterContext.tsx`

Manages Farcaster user authentication and profile data:

```typescript
interface FarcasterContextType {
  user: FarcasterUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isFarcasterEnvironment: boolean
  signIn: () => Promise<void>
  signOut: () => void
}
```

**Features:**
- Auto-authentication on mount
- User profile data extraction
- Environment detection
- Error handling

#### Wagmi Context
**Location:** `providers/wagmi-provider.tsx`

Provides Web3 functionality via Wagmi v2:

- Wallet connection state
- Account information
- Chain switching
- Transaction handling
- Balance queries

### 4. Component Layer

#### ConnectButton Component
**Location:** `components/ConnectButton.tsx`

Smart wallet connection component with platform-aware UI:

**Browser Mode:**
- Shows "Connect Wallet" button
- Priority: Self → Injected → WalletConnect
- Full dropdown menu with disconnect option

**Farcaster Browser Mode:**
- Auto-connects via Farcaster SDK
- Shows username in button
- Full dropdown with platform info

**Farcaster Mobile Mode:**
- Auto-connects via Farcaster SDK
- Shows username in button
- Simplified UI (no dropdown)

#### SDK Initializer
**Location:** `components/sdk-initializer.tsx`

Handles Farcaster SDK initialization:

1. Environment detection
2. Context retrieval (2s timeout)
3. Ready state signaling
4. Fallback handling

**Initialization Flow:**
```
Start → Check Environment → Get Context → Validate → Call ready() → Complete
```

## Data Flow

### Wallet Connection Flow

```
User Action
    ↓
ConnectButton
    ↓
Platform Detection
    ↓
Connector Selection
    ↓
Wagmi Connection
    ↓
State Update
    ↓
UI Update
```

### Farcaster Authentication Flow

```
App Mount
    ↓
FarcasterProvider Init
    ↓
SDK Context Request
    ↓
User Data Extraction
    ↓
Context State Update
    ↓
Auto-Connect Trigger (if Farcaster env)
    ↓
Wallet Connection
```

## State Management

### React Query
- Caches Web3 queries
- Manages stale time (1 minute)
- Handles refetching logic
- Optimizes performance

### React Context
- Farcaster user state
- Platform detection state
- Wallet connection state

### Local Component State
- UI interaction state
- Error messages
- Loading indicators

## Error Handling

### Network Errors
- Automatic retry (1 attempt)
- User-friendly error messages
- Console logging for debugging

### SDK Errors
- Timeout fallbacks (3 seconds)
- Graceful degradation
- Non-blocking initialization

### Connection Errors
- Clear error messaging
- Automatic cleanup
- Retry mechanisms

## Performance Optimizations

### Lazy Loading
- Components load on demand
- Reduces initial bundle size

### Code Splitting
- Next.js automatic splitting
- Route-based chunks

### Query Optimization
- React Query caching
- Minimal refetching
- Background updates

### Error Suppression
- WalletConnect subscription errors
- Non-critical console noise

## Security Considerations

### Environment Variables
- Sensitive data in `.env.local`
- Never committed to repository
- Validated on initialization

### Wallet Security
- No private key handling
- Connector-based security
- User-controlled actions

### SDK Security
- Official Farcaster SDK
- Verified connectors
- HTTPS requirements

## Extensibility

### Adding New Connectors

1. Install connector package
2. Import in `lib/wagmi.ts`
3. Add to connectors array
4. Update ConnectButton logic

### Adding New Chains

1. Import chain from `wagmi/chains`
2. Add to transports object
3. Add to config chains array
4. Update chain switching logic

### Custom Platform Detection

1. Extend `PlatformType` in `usePlatformDetection.ts`
2. Add detection logic
3. Update ConnectButton cases
4. Add platform-specific UI

## Testing Recommendations

### Unit Tests
- Platform detection logic
- Connector selection logic
- Context providers
- Utility functions

### Integration Tests
- Wallet connection flow
- Platform switching
- Error scenarios
- Auto-connect behavior

### E2E Tests
- Full user journey
- Multi-platform scenarios
- Edge cases
- Error recovery

## Deployment Architecture

### Vercel (Recommended)

```
GitHub Repository
    ↓
Automatic Deployment
    ↓
Edge Functions
    ↓
Global CDN
    ↓
User Access
```

### Environment Setup
- Production environment variables
- Domain configuration
- SSL certificates
- Analytics integration

## Monitoring

### Recommended Monitoring

- Wallet connection success rate
- Platform detection accuracy
- SDK initialization time
- Error frequency and types
- User session analytics

### Logging Strategy

- Console logs for development
- Structured logs for production
- Error tracking (Sentry, etc.)
- Performance monitoring

## Future Enhancements

### Potential Improvements

1. **Account Abstraction**
   - Smart contract wallets
   - Gasless transactions
   - Social recovery

2. **Multi-Chain Support**
   - Cross-chain operations
   - Bridge integrations
   - Chain-agnostic UI

3. **Enhanced UX**
   - Transaction history
   - Notification system
   - Wallet portfolio view

4. **Analytics**
   - User behavior tracking
   - Conversion funnels
   - A/B testing

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Monitor security advisories
- Review and merge PRs
- Update documentation

### Breaking Changes

- Test with new SDK versions
- Verify connector compatibility
- Update migration guides
- Communicate changes
