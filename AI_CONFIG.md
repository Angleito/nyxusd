# AI Configuration Status

## Current Settings
- **Mock AI**: DISABLED (USE_MOCK_AI=false)
- **Real AI**: Will be used when OpenAI API key is provided
- **Market Data**: Real-time prices from CoinGecko API

## API Configuration

### 1. OpenAI API (Required for AI Chat)
**Get an OpenAI API Key**:
- Sign up at [platform.openai.com](https://platform.openai.com)
- Create an API key in your dashboard
- Add credits to your account

### 2. CoinGecko API (Optional for Enhanced Market Data)
**For better rate limits and premium features**:
- Sign up at [www.coingecko.com/en/api](https://www.coingecko.com/en/api)
- Free tier: 10-30 calls/minute (no API key needed)
- Pro tier: 500+ calls/minute with API key

### 3. Add Your API Keys
Edit the `.env` file and add your keys:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
COINGECKO_API_KEY=CG-your-api-key-here  # Optional
```

### 4. Restart the Backend
```bash
cd api
npm run dev
```

## Current Configuration
- Mock AI is now **DISABLED** in `.env`
- The app will attempt to use real OpenAI API
- If no API key is provided, you'll see error messages
- To temporarily use mock responses, set `USE_MOCK_AI=true`
- CoinGecko API will work without a key (free tier) or with enhanced limits (pro tier)

## Feature Comparison

### Mock AI (USE_MOCK_AI=true)
- Returns simple placeholder responses
- No API key required
- Good for testing UI/UX
- No actual AI intelligence
- Static price data

### Real AI (USE_MOCK_AI=false) 
- Uses OpenAI GPT models
- Requires valid API key
- Provides intelligent responses
- Understands context and crypto knowledge
- Costs money per request
- **Real-time market data from CoinGecko**
- **Live token prices and trends**
- **Market cap rankings**
- **24h price changes**

## Troubleshooting

If you see errors after disabling mock AI:
1. Ensure you have a valid OpenAI API key in `.env`
2. Check that the API key has credits
3. Verify the backend server is running
4. Check console for specific error messages

## Note
The voice features (ElevenLabs) are separate and require their own API key.