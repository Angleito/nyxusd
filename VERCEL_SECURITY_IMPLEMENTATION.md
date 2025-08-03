# Vercel API Security Implementation

## Overview

The NYXUSD application now implements Vercel's security best practices for serverless functions, following their 2025 guidelines for secure API routes.

## Security Features Implemented

### 1. Rate Limiting
- **20 requests per minute per IP** with automatic blocking for abuse
- **10-minute IP blocking** for repeated violations
- Memory cleanup to prevent memory leaks in serverless environment
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

### 2. CORS Security
- **Production-only origins**: `https://nyxusd.com`, `https://www.nyxusd.com`
- **Development support**: localhost ports for testing
- **Preflight caching**: 24-hour cache for OPTIONS requests
- **Origin validation**: Only allows requests from permitted domains

### 3. Security Headers
Following Vercel's recommendations:
```typescript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'none'
```

### 4. Input Validation & Sanitization
- **Message length limits**: 4000 characters max
- **Model validation**: Only allowed models accepted
- **Type checking**: Strict TypeScript validation
- **XSS prevention**: Script tag removal from responses
- **Field sanitization**: Context and summary length limits

### 5. API Key Security
- **Backend-only storage**: `OPENROUTER_API_KEY` never exposed to frontend
- **Environment validation**: Proper error handling for missing keys
- **Secure headers**: OpenRouter-specific headers for authentication

### 6. Error Handling
- **Specific error codes**: 400, 401, 408, 429, 500, 502
- **No information leakage**: Generic error messages to users
- **Comprehensive logging**: Detailed server-side error tracking
- **Timeout handling**: 30-second request timeout with abort controller

### 7. Request/Response Security
- **IP extraction**: Proper Vercel header handling (`x-forwarded-for`)
- **Request timeout**: 30-second limit to prevent hanging requests
- **Response sanitization**: Remove potentially dangerous content
- **Usage tracking**: Optional OpenRouter usage statistics

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment | Description |
|----------|-------|-------------|-------------|
| `OPENROUTER_API_KEY` | Your API key | Production, Preview | Required for AI functionality |
| `APP_NAME` | `NyxUSD` | All | Application identification |
| `APP_URL` | `https://nyxusd.com` | Production | Referrer header value |
| `NODE_ENV` | `production` | Production | Environment detection |

## Rate Limiting Details

### Per-IP Limits
- **Window**: 60 seconds
- **Max requests**: 20 per window
- **Block duration**: 10 minutes for abuse
- **Memory cleanup**: Every 5 minutes

### Headers Provided
```http
X-RateLimit-Limit: 20
X-RateLimit-Window: 60
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 2025-01-15T10:30:00.000Z
```

### Abuse Protection
IPs exceeding limits are automatically blocked for 10 minutes, preventing both accidental and malicious abuse.

## CORS Configuration

### Production Origins
```typescript
const allowedOrigins = [
  'https://nyxusd.com',
  'https://www.nyxusd.com'
];
```

### Development Origins
```typescript
const devOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Next.js dev server
  'http://localhost:8080'  // Custom dev server
];
```

## Model Security

### Allowed Models
Only pre-approved models are accepted:
- `google/gemini-2.5-flash` (default)
- `qwen/qwen3-30b-a3b-instruct-2507`
- `deepseek/deepseek-chat-v3-0324`
- `qwen/qwen3-235b-a22b-thinking-2507`

Invalid models default to the safe `google/gemini-2.5-flash`.

## Monitoring & Logging

### Server-Side Logging
```typescript
console.error('Chat API error:', {
  message: error.message,
  stack: error.stack,
  ip: clientIP
});
```

### Rate Limit Monitoring
Track rate limit violations with IP addresses for security analysis.

### API Response Monitoring
Log OpenRouter API errors with status codes for debugging.

## Testing the Security

### Rate Limit Testing
```bash
# Test rate limiting (should fail after 20 requests)
for i in {1..25}; do
  curl -X POST https://nyxusd.com/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}' && echo " - Request $i"
done
```

### CORS Testing
```bash
# Test CORS from unauthorized origin (should fail)
curl -X POST https://nyxusd.com/api/ai/chat \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### Input Validation Testing
```bash
# Test message length limit (should fail)
curl -X POST https://nyxusd.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "'$(printf 'A%.0s' {1..5000})'"}'
```

## Performance Considerations

### Serverless Optimization
- Memory cleanup every 5 minutes prevents memory leaks
- Timeout handling prevents hanging functions
- Minimal dependencies for faster cold starts

### Vercel-Specific Features
- Proper IP extraction from Vercel headers
- Environment detection for production vs development
- Compatible with Vercel's edge network

## Security Compliance

This implementation follows:
- **OWASP API Security Top 10** guidelines
- **Vercel Security Best Practices** 2025
- **OpenRouter API Security** recommendations
- **Rate Limiting Best Practices** for serverless

## Future Enhancements

Consider implementing:
1. **Vercel KV Store** for distributed rate limiting
2. **JWT Authentication** for user-specific limits
3. **Vercel WAF** for advanced DDoS protection
4. **Request signing** for additional API security
5. **Monitoring integration** with Vercel Analytics

This secure implementation ensures NYXUSD's API routes are protected against common attacks while maintaining optimal performance on Vercel's serverless platform.