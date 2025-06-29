# 🌙 Wallet Integration Setup Guide

This guide helps you set up wallet connections for the NyxUSD frontend.

## 🔧 Required Environment Variables

### WalletConnect Project ID (REQUIRED)

The app requires a WalletConnect Project ID to enable wallet connections via WalletConnect v2.

1. **Get Project ID:**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a free account
   - Create a new project
   - Copy the Project ID

2. **Add to Environment:**
   ```bash
   # In your .env file
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

3. **For Vercel Deployment:**
   - Go to your Vercel project settings
   - Add environment variable: `VITE_WALLETCONNECT_PROJECT_ID`
   - Set the value to your WalletConnect Project ID
   - Redeploy the project

## 🔗 Supported Wallets

### Ethereum & Multi-Chain
- MetaMask (Extension & Mobile)
- Coinbase Wallet 
- Rainbow Wallet
- Trust Wallet
- Frame Wallet
- Safe (Gnosis Safe)
- Hardware wallets (Ledger, Trezor)

### WalletConnect Compatible (300+ wallets)
- All major mobile wallets
- 1inch, Argent, Zerion
- Phantom, imToken, Math Wallet

### 🌙 Midnight Protocol
- Lace Wallet (Midnight Edition)
- Zero-knowledge proof support
- Privacy-preserving transactions

## 🚨 Common Issues

### WalletConnect Error
```
Error: No projectId found. Every dApp must now provide a WalletConnect Cloud projectId
```
**Solution:** Set the `VITE_WALLETCONNECT_PROJECT_ID` environment variable.

### Manifest 401 Error
```
Manifest fetch failed, code 401
```
**Solution:** This is usually a deployment configuration issue. The app will still work, but PWA features may be limited.

## 📱 PWA Features

The app includes Progressive Web App features:
- Add to home screen
- Offline capability
- App shortcuts for CDP and AI Assistant

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🌐 Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect Project ID (required)

Optional variables:
- `VITE_ALCHEMY_API_KEY` - For better RPC performance
- `VITE_ENABLE_TESTNETS` - Enable testnet chains
- `VITE_MIDNIGHT_RPC_URL` - Custom Midnight RPC endpoint