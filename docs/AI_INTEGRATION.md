# AI Assistant Integration Guide

## Overview

The NyxUSD AI Assistant is powered by various AI models through OpenRouter, providing natural language interactions for guiding users through the CDP investment process.

## Architecture

### Frontend Components

1. **AI Service Layer** (`frontend/src/services/ai/`)
   - `aiService.ts` - Core AI service interface and types
   - `langchainService.ts` - LangChain/OpenRouter implementation
   - `fallbackService.ts` - Fallback service when AI is unavailable
   - `conversationChain.ts` - Conversation flow management
   - `promptTemplates.ts` - Step-specific prompt templates

2. **React Integration**
   - `useAIService` hook - React hook for AI interactions
   - Updated `AIAssistantProvider` - Integrates AI responses with UI state

### Backend API

- **Endpoint**: `/api/ai/chat` - Main chat endpoint
- **Streaming**: `/api/ai/chat/stream` - Server-sent events for streaming
- **Session Management**: Maintains conversation memory per session
- **Rate Limiting**: Built-in rate limiting and error handling

## Configuration

### Environment Variables

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Add your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-your-api-key-here
```

3. Optional configurations:

```env
# Use mock AI (no API key required)
USE_MOCK_AI=true

# Frontend API endpoint
REACT_APP_API_URL=http://localhost:8080
```

## Features

### 1. Natural Language Processing

- Detects user intent (connect wallet, select options, input values)
- Contextual responses based on conversation step
- Occupation-based analogies for better understanding

### 2. Conversation Memory

- Maintains context throughout the session
- Summarizes long conversations to optimize token usage
- Session-based isolation for multiple users

### 3. Streaming Responses

- Real-time typing effect for better UX
- Chunk-based streaming to reduce latency
- Graceful fallback to non-streaming mode

### 4. Error Handling

- Automatic fallback to mock responses
- Rate limit handling with retry logic
- Network error recovery

## Usage

### Starting the Services

1. Start the backend API:

```bash
cd api
npm run dev
```

2. Start the frontend:

```bash
cd frontend
npm run dev
```

### Testing the Integration

1. **Without OpenRouter API Key**:
   - Set `USE_MOCK_AI=true` in `.env`
   - The system will use the fallback service with pre-defined responses

2. **With OpenRouter API Key**:
   - Add your API key to `.env`
   - Set `USE_MOCK_AI=false`
   - The system will use real AI responses through OpenRouter

### API Examples

#### Send a Chat Message

```javascript
POST /api/ai/chat
{
  "message": "I want to invest in growth assets",
  "sessionId": "user-123",
  "context": {
    "conversationStep": "investment_goals",
    "userProfile": {},
    "walletData": {}
  }
}
```

#### Response Format

```javascript
{
  "message": "Great choice! Growth investing focuses on...",
  "intent": {
    "action": "select_option",
    "confidence": 0.95,
    "extractedValue": "growth"
  },
  "shouldContinue": true,
  "nextStep": "occupation"
}
```

## Customization

### Adding New Conversation Steps

1. Add the step to `ConversationStep` type
2. Update `CONVERSATION_FLOW` in `conversationChain.ts`
3. Add prompt template in `promptTemplates.ts`
4. Update UI components to handle the new step

### Modifying AI Behavior

1. Edit system prompts in `promptTemplates.ts`
2. Adjust temperature and max tokens in `aiService.ts`
3. Customize occupation analogies for better personalization

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Rate Limiting**: Implement proper rate limiting for production
3. **Input Validation**: All user inputs are validated with Zod schemas
4. **Session Isolation**: Each user session is isolated

## Troubleshooting

### Common Issues

1. **"AI service not configured"**
   - Check if `OPENROUTER_API_KEY` is set in `.env`
   - Verify the API key is valid

2. **Rate Limit Errors**
   - Implement exponential backoff
   - Consider using different models for less critical responses

3. **Streaming Not Working**
   - Check if your environment supports SSE
   - Verify CORS settings for streaming endpoints

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem("AI_DEBUG", "true");
`` Tangential response: Using multi-step reasoning through the sequentialthinking MCP server to understand this project.
<thinking>
<thought_1>
First, I need to understand what this project is about. From the available files and directory structure, I can see this is a DeFi (Decentralized Finance) project called NYXUSD.
</thought_1>
<thought_2>
Looking at the directory structure, I see there's a clear separation between frontend and backend (api). The frontend appears to be a React/Vite application.
</thought_2>
<thought_3>
The backend appears to be Node.js with TypeScript, with several API endpoints for different services:
- AI services (/api/ai/)
- Voice services (/api/voice/)
- Oracle services (/api/oracle/)
- Subscription services (/api/subscriptions/)
- Swap services (/api/swap/)
- Pool services (/api/pools/)
</thought_3>
<thought_4>
The project seems to be integrating with various DeFi protocols and has components for:
- CDP (Collateralized Debt Position) management
- Wallet connection and management
- Oracle price feeds
- Token swaps
- Strategy building
</thought_4>
<thought_5>
There's extensive documentation in the repository:
- AI_CONFIG.md
- API_SETUP.md
- VOICE_SETUP.md
- docs/AI_INTEGRATION.md
- Various other markdown files in the docs and hackathon directories
</thought_5>
<thought_6>
From the .env.example file, I can see the project uses several external services:
- OpenRouter for AI services (instead of directly using OpenAI)
- ElevenLabs for voice services
- CDP-related configurations for various chains
- Oracle configurations
</thought_6>
<thought_7>
The documentation shows the project is focused on providing a user-friendly interface for DeFi investing, using AI to guide users through:
- Investment goal selection
- Occupation-based analogies for better understanding
- Strategy building for CDP positions
- Portfolio analysis
</thought_7>
<thought_8>
The voice integration appears to be an optional feature that enhances the user experience by allowing voice conversations with the AI assistant.
</thought_8>
<thought_9>
The project seems to have both a mock mode for development/testing and real integration mode with external services, which is a good development practice.
</thought_9>
<thought_10>
Based on the error logs and environment files, I now understand that the authentication issues were:
1. Inconsistent variable naming: OPENROUTER_API_KEY vs OPENAI_API_KEY
2. Missing voice service credentials
3. Missing JWT secret for voice session security
</thought_10>

These issues have been resolved by:
1. Standardizing on OPENROUTER_API_KEY throughout the application
2. Properly adding ELEVENLABS_API_KEY to both backend and frontend configurations
3. Adding a JWT_SECRET for secure voice session management

The solution was implemented by updating:
1. Environment configuration files (.env.example, frontend/.env.example)
2. Documentation files (AI_CONFIG.md, API_SETUP.md, VOICE_SETUP.md, docs/AI_INTEGRATION.md)
3. The actual .env file to match the corrected structure

Now that these authentication issues are resolved, the application should properly connect to both the AI service (OpenRouter) and voice service (ElevenLabs) in production.
</thinking>
