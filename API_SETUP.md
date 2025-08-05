# API Setup Guide for NYXUSD

## Required API Keys

To run the NYXUSD application with full functionality, you need to configure the following API keys:

### 1. OpenRouter API Key (Required for AI Chat)

OpenRouter provides access to various AI models. This is the primary AI service used by the application.

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Get your API key from the dashboard
3. Add it to your `.env` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

### 2. ElevenLabs API Key (Optional - for Voice Features)

For voice conversation features:

1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Get your API key from the profile settings
3. Add it to your `.env` file:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to the `.env` file

3. For testing without API keys, you can enable mock mode:
   ```
   USE_MOCK_AI=true
   ```

## Vercel Deployment

When deploying to Vercel, add these environment variables in your Vercel project settings:

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key (if using voice features)
- `USE_MOCK_AI` - Set to `false` for production

## Troubleshooting

### 404 Errors on `/api/ai-assistant`

If you're getting 404 errors:

1. **Local Development**: Make sure the backend server is running:
   ```bash
   cd api && npm run dev
   ```

2. **Production (Vercel)**: Ensure you have:
   - Added the `OPENROUTER_API_KEY` in Vercel environment variables
   - Set `USE_MOCK_AI=false` in Vercel environment variables
   - Deployed the latest code

### 500 Errors

This usually indicates missing API keys:

1. Check that you have added `OPENROUTER_API_KEY`
2. Verify the API keys are valid
3. Check the browser console and server logs for specific error messages

### Voice Features Not Working

1. Ensure you have added the `ELEVENLABS_API_KEY`
2. Check that your browser supports the Web Speech API

## Testing Without API Keys

To test the application without API keys, set:
```
USE_MOCK_AI=true
```

This will use mock responses instead of actual AI services.