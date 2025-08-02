# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel project settings:

### Frontend Variables (Vite)

```bash
# OpenRouter Configuration (Required)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_OPENROUTER_API_URL=https://openrouter.ai/api/v1

# App Configuration
VITE_APP_NAME=NyxUSD
VITE_APP_URL=https://your-vercel-app.vercel.app

# API Configuration
VITE_API_URL=https://your-api-endpoint.vercel.app
VITE_USE_MOCK_AI=false

# Wallet Configuration (Required)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Network Configuration
VITE_DEFAULT_CHAIN=mainnet
VITE_ENABLE_TESTNETS=false

# Optional: Ethereum RPC URLs
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_INFURA_API_KEY=your_infura_api_key
```

### Backend/API Variables

```bash
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# App Configuration
APP_NAME=NyxUSD
APP_URL=https://your-vercel-app.vercel.app

# Other Services
USE_MOCK_AI=false
PORT=3001
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Select the environment(s) where the variable should be available:
   - Production
   - Preview
   - Development

## Important Notes

- **VITE_ prefix**: All frontend environment variables must start with `VITE_` to be accessible in the Vite build
- **Security**: Never commit API keys to your repository
- **OpenRouter API Key**: Get your key from [OpenRouter](https://openrouter.ai)
- **WalletConnect Project ID**: Get your free ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

## Verifying Configuration

After deployment, you can verify the configuration by:

1. Checking the browser console for any missing environment variable errors
2. Testing the AI chat functionality
3. Verifying wallet connection works properly

## Model Configuration

The service is configured to use these models from OpenRouter:

- **Simple queries**: `google/gemini-2.5-flash` (fast, efficient)
- **Complex queries**: `qwen/qwen3-30b-a3b-instruct-2507` (balanced)
- **Crypto/DeFi queries**: `deepseek/deepseek-chat-v3-0324` (specialized)
- **Deep reasoning**: `qwen/qwen3-235b-a22b-thinking-2507` (advanced thinking)

Provider priority: Google → DeepSeek → Qwen → OpenAI