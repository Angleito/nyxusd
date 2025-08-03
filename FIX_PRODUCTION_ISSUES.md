# Fix Production Issues on nyxusd.com

## Issues Identified

1. **Missing OpenRouter API Key**: The application is trying to use OpenAI but should use OpenRouter
2. **Missing API Endpoints**: Token fetching endpoints were missing
3. **CORS Issues**: API calls were failing due to CORS

## Fixes Applied

### 1. Frontend Configuration Fixed
- Updated `langchainService.ts` to properly handle OpenRouter API configuration
- Added better error handling for missing API keys

### 2. Created Missing API Endpoints
- `/api/tokens/base.ts` - Fetch Base chain tokens
- `/api/odos/tokens/[chainId].ts` - Fetch Odos protocol tokens

### 3. Environment Variables Setup

## Required Actions

### Step 1: Set Vercel Environment Variables

Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

Add these **REQUIRED** variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_OPENROUTER_API_KEY` | Your API key from [OpenRouter](https://openrouter.ai) | Required for AI features |
| `VITE_OPENROUTER_API_URL` | `https://openrouter.ai/api/v1` | OpenRouter endpoint |
| `VITE_APP_NAME` | `NyxUSD` | Application name |
| `VITE_APP_URL` | `https://nyxusd.com` | Production URL |
| `VITE_USE_MOCK_AI` | `false` | Disable mock mode |

**Optional but recommended:**

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_WALLETCONNECT_PROJECT_ID` | Get from [WalletConnect Cloud](https://cloud.walletconnect.com) | For wallet connections |

### Step 2: Redeploy

After setting environment variables:
1. Vercel will prompt you to redeploy
2. Click "Redeploy" 
3. Wait for deployment to complete (~2-3 minutes)

### Step 3: Verify

Test the following on production:
1. AI chat functionality works
2. Token search/selection works
3. No console errors about missing API keys

## Local Testing

To test fixes locally before deploying:

```bash
# 1. Set up environment
cd frontend
cp .env.example .env

# 2. Edit .env and add your VITE_OPENROUTER_API_KEY

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev

# 5. Open http://localhost:5173
```

## Troubleshooting

### If AI still doesn't work:
1. Check browser console for errors
2. Verify API key is correct in Vercel
3. Check that environment variables are set for "Production" environment
4. Try clearing browser cache

### If token fetching fails:
1. Check that API functions deployed correctly
2. Verify in Vercel Functions tab
3. Check function logs in Vercel

## Getting API Keys

### OpenRouter API Key (Required)
1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up/Login
3. Go to API Keys section
4. Create new API key
5. Copy and save securely

### WalletConnect Project ID (Recommended)
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create new project
3. Copy Project ID from dashboard

## Support

If issues persist after following these steps:
1. Check Vercel deployment logs
2. Review browser console errors
3. Contact support with error details