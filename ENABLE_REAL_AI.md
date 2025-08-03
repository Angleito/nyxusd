# Enable Real AI in NYXUSD Chat

## Overview
The chat interface has been updated to use real AI instead of mock responses. Follow these steps to enable it:

## Step 1: Get an OpenRouter API Key

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Go to your dashboard and copy your API key
3. OpenRouter provides access to multiple AI models including Google Gemini, Claude, GPT-4, etc.

## Step 2: Configure Frontend Environment

Edit the file `frontend/.env` and add your OpenRouter API key:

```bash
# OpenRouter Configuration (Required for AI)
VITE_OPENROUTER_API_KEY=your_actual_api_key_here
VITE_OPENROUTER_API_URL=https://openrouter.ai/api/v1

# Disable mock AI - set to false to use real AI
VITE_USE_MOCK_AI=false
```

## Step 3: Configure Backend Environment (Optional)

If running the backend server locally, create `backend-old/.env`:

```bash
OPENROUTER_API_KEY=your_actual_api_key_here
USE_MOCK_AI=false
```

## Step 4: Start the Services

### Frontend Only (Uses direct API calls):
```bash
cd frontend
npm install
npm run dev
```

### With Backend Server (Full features):
```bash
# Terminal 1 - Backend
cd backend-old
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Step 5: Test the Integration

1. Open http://localhost:5173 (or the port shown by Vite)
2. Click on the chat icon in the bottom right
3. Type a message like "What is the current price of Bitcoin?"
4. You should receive a real AI response instead of mock data

## What Was Changed

1. **frontend/src/services/ai/index.ts**: 
   - Removed the hardcoded `false &&` that forced mock mode
   - Added proper API key detection from environment variables

2. **frontend/.env**: 
   - Created with proper configuration template
   - Set `VITE_USE_MOCK_AI=false` to enable real AI

## Troubleshooting

### If you see mock responses:
1. Check that your API key is correctly set in `frontend/.env`
2. Restart the development server after changing .env files
3. Check browser console for any API errors
4. Verify `VITE_USE_MOCK_AI=false` in the .env file

### If you get API errors:
1. Verify your OpenRouter API key is valid
2. Check your OpenRouter account has credits
3. Ensure you're not hitting rate limits

## Features Available with Real AI

- Natural language crypto price queries
- Market analysis and trends
- Portfolio recommendations
- DeFi yield opportunities
- Smart contract interactions via natural language
- Swap intent detection and execution
- Voice-controlled operations (with ElevenLabs API)

## Security Note

Never commit your API keys to git. The `.env` file is already in `.gitignore` to prevent this.