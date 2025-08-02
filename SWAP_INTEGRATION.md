# Odos Swap Integration Documentation

## Overview
This document describes the Odos Protocol swap integration in the NyxUSD chat interface, allowing users to perform token swaps directly through conversational commands.

## Features

### 1. Natural Language Swap Detection
The chat interface automatically detects swap intents from user messages:
- "Swap 1 ETH for USDC"
- "Convert 100 USDC to DAI"
- "Buy WETH with 0.5 ETH"
- "Trade my USDC for ETH"
- "Exchange 50% of my ETH for stablecoins"

### 2. Supported Tokens (Base Chain)
- **ETH** - Native Ethereum
- **WETH** - Wrapped Ethereum
- **USDC** - USD Coin
- **USDT** - Tether
- **DAI** - Dai Stablecoin
- **USDbC** - Bridged USDC
- **AERO** - Aerodrome
- **BRETT** - Brett token
- **DEGEN** - Degen token
- **HIGHER** - Higher token

### 3. Swap Interface Components
- **SwapInterface.tsx** - Main swap UI component with quote fetching and execution
- **SwapDetectionService** - Detects and parses swap intents from chat messages
- **OdosSwapService** - Backend service for Odos API integration
- **useOdosSwap** - React hook for swap functionality

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Odos Router Address (Base Chain)
ODOS_ROUTER_ADDRESS=0x19ceBd57CACe0a54a88614a9dDa6f05bFADB5084

# Optional: Custom API endpoints
ODOS_API_URL=https://api.odos.xyz
```

### API Endpoints

The swap API is available at:
- Development: `http://localhost:3000/api/swap`
- Production: `https://yourdomain.vercel.app/api/swap`

Supported actions:
- `?action=quote` - Get swap quote
- `?action=tokens` - Get supported tokens
- `?action=validate` - Validate token pair
- `?action=status` - Check service status

## Usage Examples

### 1. Simple Swap
```
User: "Swap 1 ETH for USDC"
Bot: Shows swap interface with pre-filled values
```

### 2. Percentage-based Swap
```
User: "Convert 50% of my ETH to stablecoins"
Bot: Calculates 50% of user's ETH balance and shows swap interface
```

### 3. Incomplete Request
```
User: "I want to swap tokens"
Bot: "Which tokens would you like to swap? For example: 'swap ETH for USDC'"
```

### 4. Quick Action Button
Click the "Swap" button in the chat interface to open the swap dialog.

## Architecture

### Frontend Flow
1. User enters message in chat
2. SwapDetectionService analyzes message for swap intent
3. If swap detected with high confidence (>0.6):
   - Missing params → Ask clarifying questions
   - Complete params → Show inline swap interface
4. User reviews quote and confirms swap
5. Transaction sent to wallet for signature
6. Swap executed through Odos router

### Backend Flow
1. Frontend requests quote from `/api/swap?action=quote`
2. Backend calls Odos API `/sor/quote/v2` for best route
3. Backend calls Odos API `/sor/assemble` for transaction data
4. Quote returned to frontend with gas estimates
5. Frontend submits transaction to blockchain

## Safety Features

### Slippage Protection
- Default: 0.5%
- Configurable: 0.5%, 1%, 2%, or custom
- Maximum: 50% (enforced by UI)

### Price Impact Warning
- Green: < 3% impact
- Red: > 3% impact
- Displayed prominently before swap

### Gas Estimation
- Shows estimated gas cost in ETH
- Updates with each quote

## Testing the Integration

### 1. Test Swap Detection
```javascript
// In browser console
import { swapDetectionService } from './services/swapDetectionService';

// Test various phrases
swapDetectionService.detectSwapIntent("swap 1 ETH for USDC");
swapDetectionService.detectSwapIntent("buy WETH with 0.5 ETH");
swapDetectionService.detectSwapIntent("convert all my USDC to DAI");
```

### 2. Test API Endpoints
```bash
# Get supported tokens
curl http://localhost:3000/api/swap?action=tokens

# Validate token pair
curl -X POST http://localhost:3000/api/swap?action=validate \
  -H "Content-Type: application/json" \
  -d '{"inputToken":"0x0000000000000000000000000000000000000000","outputToken":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"}'

# Get swap quote
curl -X POST http://localhost:3000/api/swap?action=quote \
  -H "Content-Type: application/json" \
  -d '{
    "inputToken":"0x0000000000000000000000000000000000000000",
    "outputToken":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "inputAmount":"1000000000000000000",
    "userAddress":"0xYourAddress",
    "slippageTolerance":0.005
  }'
```

### 3. Test Chat Integration
1. Connect wallet to Base chain
2. Type "swap 0.1 ETH for USDC" in chat
3. Review quote in embedded interface
4. Adjust slippage if needed
5. Click "Swap" to execute

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch quote"
- Check network connection
- Verify Odos API is available
- Ensure valid token addresses
- Check if amount is too small

#### 2. "Token pair not supported"
- Verify both tokens are on Base chain
- Check token addresses are correct
- Try swapping through ETH as intermediate

#### 3. "Wallet not connected"
- Connect wallet using RainbowKit button
- Ensure on Base chain (chainId: 8453)
- Check wallet has sufficient balance

#### 4. Transaction fails
- Increase slippage tolerance
- Check gas balance
- Verify token approvals
- Try smaller amount

### Debug Mode
Enable debug logs in browser console:
```javascript
localStorage.setItem('DEBUG_SWAP', 'true');
```

## Future Enhancements

### Planned Features
1. **Multi-hop swaps** - Automatic routing through multiple pools
2. **Cross-chain swaps** - Bridge and swap in one transaction
3. **Limit orders** - Set target prices for swaps
4. **Batch swaps** - Execute multiple swaps in one transaction
5. **Price alerts** - Notify when swap rates are favorable
6. **Historical tracking** - View past swap history
7. **Gas optimization** - Choose between speed and cost
8. **MEV protection** - Private mempool submission

### Integration Points
- Portfolio tracker integration
- DeFi yield optimizer connection
- Tax reporting export
- Analytics dashboard

## Security Considerations

### Best Practices
1. Always verify transaction details before signing
2. Use hardware wallets for large swaps
3. Check price impact warnings
4. Verify contract addresses
5. Start with small test amounts
6. Monitor slippage settings
7. Be aware of MEV risks

### Audit Status
- Odos Protocol: Audited by [Audit Firm]
- Integration Code: Internal review completed
- Smart Contracts: No custom contracts (direct Odos router interaction)

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in console
3. Test with small amounts first
4. Contact support with transaction hash if swap fails

## License
This integration is part of the NyxUSD project and follows the same license terms.