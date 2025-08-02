# Vercel Functions Setup Guide

## Overview
Your NyxUSD application is now configured to run on Vercel with serverless functions handling all API endpoints.

## Project Structure
```
/api/                     # Vercel Functions (API routes)
├── health.ts            # Health check endpoint
├── system.ts            # System information
├── oracle/
│   └── prices.ts        # Oracle price feeds
└── ai/
    └── enhanced/
        ├── chat.ts      # AI chat endpoint
        └── chat/
            └── stream.ts # Streaming AI responses

/frontend/               # React application
└── (your existing frontend code)
```

## Environment Variables

### Required for Vercel Deployment

Add these environment variables in your Vercel project settings:

```bash
# OpenRouter API (for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Mock Mode (set to false in production)
USE_MOCK_AI=false

# Oracle Configuration (optional)
ORACLE_RPC_URL=https://sepolia.infura.io/v3/your_key
ORACLE_TIMEOUT=5000
ORACLE_MAX_STALENESS=3600
ORACLE_MIN_CONFIDENCE=95
ORACLE_CACHE_TTL=60
ORACLE_ENABLE_FALLBACK=true
ORACLE_CACHE_ENABLED=true

# Node Environment
NODE_ENV=production
```

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy to Vercel
```bash
# From project root
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Select the root directory
# - Override build command: npm run build:frontend
# - Override output directory: frontend/dist
```

### 3. Set Environment Variables
```bash
# Using CLI
vercel env add OPENROUTER_API_KEY
vercel env add USE_MOCK_AI

# Or via Dashboard
# Go to: https://vercel.com/[your-username]/[project-name]/settings/environment-variables
```

### 4. Redeploy with Environment Variables
```bash
vercel --prod
```

## Local Development

### Testing Vercel Functions Locally
```bash
# Install dependencies
npm install

# Run Vercel dev server
vercel dev

# This will start:
# - Frontend on http://localhost:3000
# - API Functions on http://localhost:3000/api/*
```

### Testing Individual Functions
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test system endpoint
curl http://localhost:3000/api/system

# Test oracle prices
curl http://localhost:3000/api/oracle/prices

# Test AI chat (POST request)
curl -X POST http://localhost:3000/api/ai/enhanced/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "sessionId": "test-session",
    "context": {},
    "enableCryptoTools": true
  }'
```

## API Endpoints

All endpoints are now available at your Vercel deployment URL:

- `GET /api/health` - Health check
- `GET /api/system` - System information
- `GET /api/oracle/prices` - Oracle price feeds
- `POST /api/ai/enhanced/chat` - AI chat endpoint
- `POST /api/ai/enhanced/chat/stream` - Streaming AI responses

## Troubleshooting

### 404 Errors
- Ensure all functions are in the `/api` directory
- Check that file names match the expected routes
- Verify environment variables are set in Vercel

### CORS Issues
- CORS headers are already configured in each function
- If issues persist, check browser console for specific origin errors

### Function Timeouts
- Free tier: 10 second timeout
- Pro tier: 60 second timeout
- Functions are configured for 30 seconds (requires Pro)

### Mock Mode
- If `OPENROUTER_API_KEY` is not set, the AI endpoints will use mock responses
- Set `USE_MOCK_AI=true` to force mock mode even with API key

## Monitoring

View function logs in Vercel Dashboard:
1. Go to your project
2. Click "Functions" tab
3. Select a function to view logs
4. Use "View Function Logs" for real-time monitoring

## Updating Functions

To update API functions:
1. Make changes to files in `/api` directory
2. Commit and push to GitHub
3. Vercel will automatically redeploy

Or manually deploy:
```bash
vercel --prod
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)