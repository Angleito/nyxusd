# Vercel Deployment Guide with Hive Intelligence

## 🚀 Quick Start

This guide will help you deploy NyxUSD with the AI-powered crypto intelligence assistant to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenRouter API Key**: Get from [openrouter.ai](https://openrouter.ai)
3. **Hive Intelligence API Key**: Get from [hiveintelligence.xyz](https://hiveintelligence.xyz)
4. **WalletConnect Project ID**: Get from [cloud.walletconnect.com](https://cloud.walletconnect.com)

## 🔧 Step-by-Step Deployment

### Step 1: Fork/Clone Repository

```bash
git clone https://github.com/yourusername/nyxusd.git
cd nyxusd
```

### Step 2: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 3: Deploy Frontend

```bash
cd frontend
vercel
```

Follow the prompts and add these environment variables when asked:

```bash
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxx
VITE_HIVE_API_KEY=hive_xxxxx
VITE_HIVE_API_URL=https://hiveintelligence.xyz/mcp
VITE_WALLETCONNECT_PROJECT_ID=xxxxx
VITE_API_URL=https://your-api.vercel.app
VITE_USE_MOCK_AI=false
VITE_DEFAULT_CHAIN=mainnet
VITE_ENABLE_TESTNETS=false
```

### Step 4: Deploy API

```bash
cd ../api
npm run build
vercel
```

Add these environment variables:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
HIVE_API_KEY=hive_xxxxx
HIVE_API_URL=https://hiveintelligence.xyz/mcp
NODE_ENV=production
MCP_SERVER_ENABLED=true
MCP_CACHE_TTL=60
USE_MOCK_AI=false
PORT=3001
```

### Step 5: Update Frontend API URL

After deploying the API, update the frontend environment variable:

1. Go to Vercel Dashboard → Frontend Project → Settings → Environment Variables
2. Update `VITE_API_URL` with your API deployment URL
3. Redeploy the frontend

## 🔐 Environment Variables Reference

### Frontend (VITE_*)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI | ✅ | `sk-or-v1-xxxxx` |
| `VITE_HIVE_API_KEY` | Hive Intelligence API key | ✅ | `hive_xxxxx` |
| `VITE_HIVE_API_URL` | Hive API endpoint | ✅ | `https://hiveintelligence.xyz/mcp` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | ✅ | `xxxxx` |
| `VITE_API_URL` | Backend API URL | ✅ | `https://api.vercel.app` |
| `VITE_USE_MOCK_AI` | Use mock AI responses | ❌ | `false` |
| `VITE_DEFAULT_CHAIN` | Default blockchain | ❌ | `mainnet` |
| `VITE_ENABLE_TESTNETS` | Enable test networks | ❌ | `false` |
| `VITE_ALCHEMY_API_KEY` | Alchemy API key | ❌ | `xxxxx` |
| `VITE_INFURA_API_KEY` | Infura API key | ❌ | `xxxxx` |

### Backend/API

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | ✅ | `sk-or-v1-xxxxx` |
| `HIVE_API_KEY` | Hive Intelligence API key | ✅ | `hive_xxxxx` |
| `HIVE_API_URL` | Hive API endpoint | ✅ | `https://hiveintelligence.xyz/mcp` |
| `NODE_ENV` | Environment | ✅ | `production` |
| `MCP_SERVER_ENABLED` | Enable MCP server | ✅ | `true` |
| `MCP_CACHE_TTL` | Cache TTL in seconds | ❌ | `60` |
| `USE_MOCK_AI` | Use mock responses | ❌ | `false` |

## 🧪 Testing Deployment

### 1. Check Service Health

```bash
# Frontend health
curl https://your-frontend.vercel.app

# API health
curl https://your-api.vercel.app/api/health

# Enhanced AI health
curl https://your-api.vercel.app/api/ai/enhanced/health

# Available tools
curl https://your-api.vercel.app/api/ai/enhanced/tools
```

### 2. Test AI Assistant

1. Open your deployed frontend
2. Click the chat bubble (bottom-right)
3. Try these queries:
   - "What's the price of Bitcoin?"
   - "Show me market trends"
   - "Analyze top DeFi yields"
   - "What are today's top gainers?"

### 3. Verify Crypto Tools

The AI should automatically use crypto tools when you ask about:
- Prices (`get_crypto_price`)
- Market trends (`get_market_trends`)
- Portfolio analysis (`analyze_portfolio`)
- DeFi rates (`get_defi_rates`)

## 🎯 Features Enabled with Hive Intelligence

### Real-Time Data
- Live cryptocurrency prices
- Market cap and volume data
- 24-hour price changes
- Market dominance metrics

### Market Analysis
- Trend detection (bullish/bearish/neutral)
- Sentiment scoring
- Top gainers and losers
- Market overview statistics

### Portfolio Tools
- Risk assessment
- Diversification scoring
- Performance tracking
- Investment recommendations

### DeFi Intelligence
- Yield rates across protocols
- TVL (Total Value Locked) data
- Risk ratings for protocols
- Multi-chain support

## 🚨 Troubleshooting

### AI Not Responding
1. Check OpenRouter API key is set correctly
2. Verify API deployment is running
3. Check browser console for errors

### Crypto Tools Not Working
1. Verify Hive API key is configured
2. Check MCP server is enabled (`MCP_SERVER_ENABLED=true`)
3. Test API health endpoint

### Wallet Connection Issues
1. Verify WalletConnect Project ID
2. Check network configuration
3. Ensure RPC URLs are correct

### Environment Variable Issues
- Frontend vars must start with `VITE_`
- Redeploy after changing environment variables
- Use Vercel dashboard to manage secrets

## 📊 Monitoring

### Vercel Analytics
- Function execution times
- API route performance
- Error rates and logs

### Application Logs
```bash
# View function logs
vercel logs --project your-api

# View build logs
vercel logs --project your-frontend --build
```

### MCP Server Status
Check `/api/ai/enhanced/health` endpoint for:
- OpenRouter connection status
- MCP server status
- Active sessions count
- Tool availability

## 🔄 Updating Deployment

### Update Code
```bash
git pull origin main
vercel --prod
```

### Update Environment Variables
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Update values
4. Redeploy (triggers automatically)

## 🛡️ Security Best Practices

1. **Never commit API keys** to repository
2. **Use Vercel secrets** for sensitive data
3. **Rotate API keys** regularly
4. **Monitor usage** on provider dashboards
5. **Set rate limits** in API configuration
6. **Enable CORS** only for your frontend domain

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Hive Intelligence MCP](https://hiveintelligence.xyz/mcp)
- [MCP Specification](https://modelcontextprotocol.io)

## 💡 Pro Tips

1. **Use Vercel Edge Functions** for API routes that don't need long execution
2. **Enable ISR** (Incremental Static Regeneration) for dashboard pages
3. **Use Vercel KV** for session storage if needed
4. **Monitor costs** on OpenRouter and Hive dashboards
5. **Set up alerts** for API errors or high usage

## 🤝 Support

- GitHub Issues: [github.com/yourusername/nyxusd/issues](https://github.com/yourusername/nyxusd/issues)
- Discord: [Join our community](https://discord.gg/nyxusd)
- Email: support@nyxusd.com