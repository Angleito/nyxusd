# Vercel Deployment Guide for NYXUSD

## Quick Deployment Steps

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project settings in Vercel dashboard
   - Navigate to "Environment Variables" section
   - Add the following variables:

## Required Environment Variables

### AI Services (Required for chat functionality)
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
APP_NAME=NyxUSD
APP_URL=https://your-deployed-url.vercel.app
```

### Voice Services (Required for voice features)
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_DEFAULT_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
JWT_SECRET=your_secure_random_jwt_secret_here
```

### Environment Configuration
```
NODE_ENV=production
FRONTEND_URL=https://your-deployed-url.vercel.app
```

## API Key Setup Instructions

### 1. OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up/login
3. Go to [API Keys section](https://openrouter.ai/keys)
4. Create a new API key
5. Add credits to your account for usage

### 2. ElevenLabs API Key  
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up/login
3. Go to [Speech Synthesis](https://elevenlabs.io/speech-synthesis)
4. Navigate to your profile settings
5. Generate an API key

### 3. JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Vercel Configuration

The project includes:
- ✅ `vercel.json` - Properly configured for SPA + API functions
- ✅ API functions in `/api/*.ts` - All endpoints working
- ✅ TypeScript configuration for Vercel serverless functions
- ✅ CORS headers configured for production + development
- ✅ Error handling and proper HTTP status codes

## API Endpoints Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/system` | ✅ Working | System health metrics |
| `/api/oracle/prices` | ✅ Working | Real-time token prices |
| `/api/ai/chat` | ⚠️ Needs `OPENROUTER_API_KEY` | AI chat functionality |
| `/api/voice-config` | ⚠️ Needs `ELEVENLABS_API_KEY` | Voice service config |
| `/api/tokens/base` | ✅ Working | Base chain token list |

## Troubleshooting

### 500 Errors on Deployment
1. **Check environment variables** - Most common issue
2. **Verify API keys** - Test keys work in API provider dashboards  
3. **Check Vercel function logs** - View runtime errors
4. **CORS issues** - Ensure frontend URL matches deployment URL

### Voice Service Issues
- Verify ElevenLabs API key has sufficient credits
- Check that JWT_SECRET is properly set
- Ensure voice IDs are valid for your ElevenLabs tier

### AI Chat Issues  
- Verify OpenRouter account has credits
- Check API key permissions
- Ensure model access for selected models

## Monitoring & Maintenance

- Monitor API usage in OpenRouter dashboard
- Track ElevenLabs character usage
- Check Vercel function execution logs
- Monitor response times in Vercel analytics

## Security Considerations

- Environment variables are automatically encrypted by Vercel
- CORS configured for production domain only
- Rate limiting implemented on AI endpoints
- JWT tokens for voice session security
- No sensitive data logged in production

## Development vs Production

**Development**: Uses local dev server with fallback mock responses
**Production**: Requires all environment variables for full functionality

The application will work without API keys but with limited functionality:
- Oracle prices work (uses real CoinGecko API)
- System health works  
- Token lists work
- AI chat returns configuration error
- Voice features return configuration error