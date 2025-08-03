# AI Configuration Status

## Current Settings
- **Mock AI**: DISABLED (USE_MOCK_AI=false)
- **Real AI**: Will be used when OpenAI API key is provided

## To Enable Real AI Responses

1. **Get an OpenAI API Key**:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create an API key in your dashboard
   - Add credits to your account

2. **Add Your API Key**:
   Edit the `.env` file and add your key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart the Backend**:
   ```bash
   cd api
   npm run dev
   ```

## Current Configuration
- Mock AI is now **DISABLED** in `.env`
- The app will attempt to use real OpenAI API
- If no API key is provided, you'll see error messages
- To temporarily use mock responses, set `USE_MOCK_AI=true`

## Mock AI vs Real AI

### Mock AI (USE_MOCK_AI=true)
- Returns simple placeholder responses
- No API key required
- Good for testing UI/UX
- No actual AI intelligence

### Real AI (USE_MOCK_AI=false) 
- Uses OpenAI GPT models
- Requires valid API key
- Provides intelligent responses
- Understands context and crypto knowledge
- Costs money per request

## Troubleshooting

If you see errors after disabling mock AI:
1. Ensure you have a valid OpenAI API key in `.env`
2. Check that the API key has credits
3. Verify the backend server is running
4. Check console for specific error messages

## Note
The voice features (ElevenLabs) are separate and require their own API key.