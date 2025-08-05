# Environment Variables Configuration

This document provides a comprehensive guide to all environment variables required for the NYXUSD application deployment.

## AI Service Configuration

### OPENROUTER_API_KEY (Required)
- **Purpose**: Authentication key for accessing AI models through OpenRouter
- **Where to get it**: Sign up at [OpenRouter.ai](https://openrouter.ai) and obtain your API key from the dashboard
- **Backend usage**: Used in `/api/ai/chat.ts` and related AI endpoints
- **Frontend usage**: Used in `frontend/src/services/ai/langchainService.ts` for client-side API calls
- **Security**: Should never be committed to version control
- **Example**: `OPENROUTER_API_KEY=sk-or-1234567890abcdefghijklmnopqrstuvwxyz`

### USE_MOCK_AI (Optional)
- **Purpose**: Enables mock AI responses for development/testing without API keys
- **Values**: `true` or `false`
- **Default**: `false`
- **Backend usage**: Controls whether to use real AI services or mock responses in `/api/ai/chat.ts`
- **Frontend usage**: Used in `frontend/src/services/ai/fallbackService.ts` to determine mock mode
- **Example**: `USE_MOCK_AI=true`

## Voice Service Configuration

### ELEVENLABS_API_KEY (Optional)
- **Purpose**: Authentication key for ElevenLabs voice services
- **Where to get it**: Sign up at [ElevenLabs](https://elevenlabs.io) and obtain your API key from profile settings
- **Backend usage**: Used in voice service endpoints for text-to-speech and speech-to-text functionality
- **Security**: Should never be committed to version control
- **Example**: `ELEVENLABS_API_KEY=1234567890abcdefghijklmnopqrstuvwxyz`

### ELEVENLABS_DEFAULT_VOICE_ID (Optional)
- **Purpose**: Specifies the default voice to use for ElevenLabs text-to-speech
- **Values**: Any valid ElevenLabs voice ID
- **Default**: `EXAVITQu4vr4xnSDxMaL` (Sarah voice)
- **Backend usage**: Used in `/api/voice/tts.ts` to configure default voice
- **Example**: `ELEVENLABS_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM`

### ELEVENLABS_MODEL_ID (Optional)
- **Purpose**: Specifies the ElevenLabs model to use for voice generation
- **Values**: 
  - `eleven_turbo_v2_5` - High quality with low latency
  - `eleven_flash_v2_5` - Lowest latency option
- **Default**: `eleven_turbo_v2_5`
- **Backend usage**: Used in `/api/voice/tts.ts` to configure model
- **Example**: `ELEVENLABS_MODEL_ID=eleven_flash_v2_5`

### JWT_SECRET (Optional but recommended if using voice services)
- **Purpose**: Secret key for generating and validating JWT tokens for secure voice sessions
- **Generation**: Should be a random, secure string
- **Backend usage**: Used in `/api/voice-token.ts` and voice session management
- **Security**: Should never be committed to version control and must be kept secret
- **Example**: `JWT_SECRET=supersecretkey1234567890abcdefghijklmnopqrstuvwxyz`

## Frontend Configuration

### REACT_APP_API_URL (Optional)
- **Purpose**: Specifies the backend API URL for frontend requests
- **Default**: Automatically determined based on environment
- **Frontend usage**: Used in `frontend/src/services/api.ts` to configure API base URL
- **Example**: `REACT_APP_API_URL=http://localhost:8080`

### REACT_APP_USE_MOCK_AI (Optional)
- **Purpose**: Controls mock AI mode specifically for frontend
- **Values**: `true` or `false`
- **Default**: Follows `USE_MOCK_AI` setting
- **Frontend usage**: Used in frontend AI services to determine if mock responses should be used
- **Example**: `REACT_APP_USE_MOCK_AI=true`

## CDP (Collateralized Debt Position) Service Configuration

### CDP_RPC_URLS (Optional)
- **Purpose**: RPC URLs for blockchain networks used in CDP operations
- **Format**: JSON object with chain IDs as keys and RPC URLs as values
- **Example**: `CDP_RPC_URLS={"1":"https://mainnet.infura.io/v3/YOUR_PROJECT_ID","137":"https://polygon-rpc.com"}`

### CDP_CONTRACT_ADDRESSES (Optional)
- **Purpose**: Contract addresses for CDP protocols on different chains
- **Format**: JSON object with protocol names as keys and contract addresses as values
- **Example**: `CDP_CONTRACT_ADDRESSES={"MakerDAO":{"1":"0x123..."},"Compound":{"1":"0x456..."}}`

## Oracle Service Configuration

### ORACLE_API_KEY (Optional)
- **Purpose**: API key for oracle price feed services
- **Where to get it**: Depends on the specific oracle service being used
- **Backend usage**: Used in oracle price fetching services

## Development and Deployment Notes

### Local Development
- Create `.env` file from `.env.example` in both root and frontend directories
- Set `USE_MOCK_AI=true` to test without real API keys
- Run backend with `cd api && npm run dev`
- Run frontend with `cd frontend && npm run dev`

### Vercel Deployment
- Set environment variables in Vercel project settings
- `OPENROUTER_API_KEY` is required for AI functionality
- `ELEVENLABS_API_KEY` and `JWT_SECRET` are needed only if voice features are used
- Keep `USE_MOCK_AI=false` for production deployment

### Security Best Practices
- Never commit API keys to version control
- Use strong, randomly generated JWT secrets
- Regularly rotate API keys
- Monitor usage of your API keys through provider dashboards
- Implement proper rate limiting in production