# AI Assistant Integration Guide

## Overview

The NyxUSD AI Assistant is powered by OpenAI's GPT-4 model through LangChain, providing natural language interactions for guiding users through the CDP investment process.

## Architecture

### Frontend Components

1. **AI Service Layer** (`frontend/src/services/ai/`)
   - `aiService.ts` - Core AI service interface and types
   - `langchainService.ts` - LangChain/OpenAI implementation
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

2. Add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
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

1. **Without OpenAI API Key**:
   - Set `USE_MOCK_AI=true` in `.env`
   - The system will use the fallback service with pre-defined responses

2. **With OpenAI API Key**:
   - Add your API key to `.env`
   - Set `USE_MOCK_AI=false`
   - The system will use real AI responses

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
   - Check if `OPENAI_API_KEY` is set in `.env`
   - Verify the API key is valid

2. **Rate Limit Errors**
   - Implement exponential backoff
   - Consider using GPT-3.5 for less critical responses

3. **Streaming Not Working**
   - Check if your environment supports SSE
   - Verify CORS settings for streaming endpoints

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem("AI_DEBUG", "true");
```

## Future Enhancements

1. **Multi-Model Support**: Add support for Claude, Gemini, etc.
2. **Fine-Tuning**: Custom model for DeFi-specific responses
3. **Analytics**: Track conversation metrics and user satisfaction
4. **Caching**: Implement response caching for common queries
5. **Multi-Language**: Support for multiple languages
