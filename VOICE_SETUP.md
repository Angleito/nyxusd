# ElevenLabs Voice Chat Integration Setup

This document explains how to set up and use the ElevenLabs voice chat integration in the NYXUSD bot.

## Features

- **Real-time voice conversations** with your crypto assistant
- **Text-to-speech** responses using natural-sounding AI voices
- **Speech-to-text** transcription for voice commands
- **Low latency** (~75ms) for natural conversations
- **Multiple voice options** to personalize your experience
- **Session management** for secure voice interactions

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Get your API key from the ElevenLabs dashboard
3. **Microphone**: Ensure your device has a working microphone
4. **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Frontend
REACT_APP_ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# Backend
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
ELEVENLABS_DEFAULT_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
JWT_SECRET=your-jwt-secret-key-here
```

### 2. Install Dependencies

The required packages are already installed:
- `@elevenlabs/react` - React SDK for ElevenLabs
- `jsonwebtoken` - For secure session tokens

### 3. Start the Application

```bash
# Start the backend
cd api
npm run dev

# Start the frontend (in another terminal)
cd frontend
npm run dev
```

## Usage

### Voice Controls in Chat Interface

1. **Microphone Button**: Click to start/stop voice recording
2. **Status Indicator**: Shows current voice status (listening, processing, speaking)
3. **Volume Control**: Adjust audio output volume
4. **Settings**: Configure voice preferences

### Voice Interaction Flow

1. **Click the microphone button** to start listening
2. **Speak your question** clearly
3. **Wait for transcription** to appear in the input field
4. **The bot will respond** both in text and voice
5. **Click microphone again** to ask another question

### Available Voice Commands

- "What's the price of Bitcoin?"
- "Show me DeFi opportunities"
- "Analyze my portfolio"
- "What are the market trends?"
- "I want to swap ETH for USDC"

## API Endpoints

### Voice Session Management

- `POST /api/voice/session/start` - Start a new voice session
- `POST /api/voice/session/end` - End the current session
- `GET /api/voice/token` - Get authentication token

### Voice Configuration

- `GET /api/voice/config` - Get available voices and settings
- `GET /api/voice/voices` - List all available voices
- `POST /api/voice/tts` - Text-to-speech conversion

### Health Check

- `GET /api/voice/health` - Check ElevenLabs connection status

## Voice Options

### Default Voices

- **Sarah** (Default): Young female voice
- **Antoni**: Young male voice
- **Elli**: Young female voice
- **Josh**: Young male voice
- **Arnold**: Middle-aged male voice
- **Adam**: Middle-aged male voice
- **Sam**: Young male voice

### Voice Settings

- **Stability**: 0.5 (Controls consistency)
- **Similarity Boost**: 0.75 (Voice matching accuracy)
- **Style**: 0 (Speaking style variation)
- **Speaker Boost**: Enabled (Audio enhancement)

## Pricing & Limits

### ElevenLabs Pricing Tiers

- **Free**: 15 minutes/month conversational AI
- **Starter**: $5/month (12.5 hours TTS)
- **Business**: $1,320/month (11M credits)

### Rate Limits

- Maximum 5000 characters per request
- 20 requests per minute per session
- 30-minute session timeout

## Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure microphone is not in use by another app
   - Try refreshing the page

2. **No voice response**
   - Verify ElevenLabs API key is correct
   - Check your account has remaining credits
   - Ensure backend is running

3. **High latency**
   - Check internet connection
   - Try using a different voice model
   - Reduce chunk size in settings

4. **Session expired**
   - Sessions expire after 30 minutes of inactivity
   - Click microphone to start a new session

### Debug Mode

Enable debug logging in the browser console:

```javascript
localStorage.setItem('voiceDebug', 'true');
```

## Security Considerations

- API keys are never exposed to the client
- Voice sessions use JWT tokens with 5-minute expiry
- All voice data is transmitted over HTTPS
- Sessions automatically expire after inactivity
- No voice recordings are stored

## Advanced Configuration

### Custom Voice Models

To use custom voices or voice cloning:

1. Upload voice samples to ElevenLabs
2. Get the custom voice ID
3. Update `ELEVENLABS_DEFAULT_VOICE_ID` in `.env`

### Optimize for Latency

For lowest latency:

```env
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
```

### Language Support

Currently supports English. For other languages, update:

```typescript
recognition.lang = 'en-US'; // Change to desired language code
```

## Development

### Architecture

```
Frontend:
├── services/voice/
│   ├── voiceService.ts       # Core voice service
│   └── elevenLabsClient.ts   # ElevenLabs API wrapper
├── components/voice/
│   └── VoiceControls.tsx     # Voice UI components
└── hooks/
    └── useVoiceChat.ts       # React hook for voice chat

Backend:
└── routes/
    └── voice.ts              # Voice API endpoints
```

### Testing Voice Features

```bash
# Test ElevenLabs connection
curl http://localhost:8080/api/voice/health

# Start a voice session
curl -X POST http://localhost:8080/api/voice/session/start \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'

# Get available voices
curl http://localhost:8080/api/voice/voices
```

## Future Enhancements

- [ ] Real-time speech-to-text streaming
- [ ] Multi-language support
- [ ] Voice activity detection
- [ ] Conversation history playback
- [ ] Voice commands for trading
- [ ] Custom wake words
- [ ] Offline mode with local TTS

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify API key and credits
4. Contact support with session ID

## License

This integration follows the ElevenLabs Terms of Service and API usage guidelines.