import { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatRequest {
  message: string;
  context?: any;
  memoryContext?: string;
  conversationSummary?: string;
  model?: string;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Rate limiting store (simple in-memory for serverless)
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked?: boolean }>();

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Security headers following Vercel best practices
function setSecurityHeaders(req: VercelRequest, res: VercelResponse): void {
  const isDevelopment = process.env['NODE_ENV'] === 'development' || 
                       process.env['VERCEL_ENV'] === 'development';
  
  // CORS configuration - be restrictive in production
  const allowedOrigins = [
    'https://nyxusd.com',
    'https://www.nyxusd.com',
    ...(isDevelopment ? [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080'
    ] : [])
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (isDevelopment) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Security headers following Vercel recommendations
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours preflight cache
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  
  // Rate limiting headers
  res.setHeader('X-RateLimit-Limit', '20');
  res.setHeader('X-RateLimit-Window', '60');
}

// Enhanced rate limiting with IP blocking for abuse
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // Max 20 requests per minute per IP
  const blockDuration = 10 * 60 * 1000; // Block for 10 minutes after abuse
  
  const record = rateLimitStore.get(ip);
  
  // Check if IP is currently blocked
  if (record?.blocked && now < record.resetTime) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  // Reset or create new record
  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(ip, newRecord);
    return { allowed: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    // Block IP for repeated abuse
    record.blocked = true;
    record.resetTime = now + blockDuration;
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Comprehensive input validation and sanitization
function validateInput(body: any): { isValid: boolean; error?: string; sanitized?: ChatRequest } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }
  
  const { message, context, memoryContext, conversationSummary, model } = body;
  
  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { isValid: false, error: 'Message is required and must be a non-empty string' };
  }
  
  if (message.length > 4000) {
    return { isValid: false, error: 'Message too long (max 4000 characters)' };
  }
  
  // Sanitize and validate optional fields
  const sanitized: ChatRequest = {
    message: message.trim(),
    context: context && typeof context === 'object' ? context : undefined,
    memoryContext: typeof memoryContext === 'string' && memoryContext.length <= 2000 ? memoryContext : undefined,
    conversationSummary: typeof conversationSummary === 'string' && conversationSummary.length <= 1000 ? conversationSummary : undefined,
    model: typeof model === 'string' && /^[a-zA-Z0-9\-\/\.]+$/.test(model) ? model : undefined
  };
  
  return { isValid: true, sanitized };
}

// Allowed models for security
const ALLOWED_MODELS = [
  'google/gemini-2.5-flash',
  'qwen/qwen3-30b-a3b-instruct-2507',
  'deepseek/deepseek-chat-v3-0324',
  'qwen/qwen3-235b-a22b-thinking-2507'
];

function validateModel(model?: string): string {
  if (!model || !ALLOWED_MODELS.includes(model)) {
    return 'google/gemini-2.5-flash'; // Default safe model
  }
  return model;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set security headers
  setSecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Extract client IP (Vercel provides these headers)
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                   req.headers['x-real-ip'] as string || 
                   req.socket?.remoteAddress || 
                   'unknown';
  
  // Rate limiting with enhanced feedback
  const rateLimitResult = checkRateLimit(clientIP);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  try {
    // Input validation and sanitization
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const sanitizedInput = validation.sanitized!;

    // Environment validation
    const apiKey = process.env['OPENROUTER_API_KEY'];
    if (!apiKey) {
      console.error('OpenRouter API key not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'AI service configuration error' 
      });
    }

    // Validate and select model
    const selectedModel = validateModel(sanitizedInput.model);
    
    // Build secure system prompt
    let systemPrompt = `You are NyxUSD, an advanced AI assistant specializing in decentralized finance (DeFi), blockchain technology, and digital asset management. You're designed to be helpful, knowledgeable, and conversational.

## Your Core Capabilities:
- **DeFi Operations**: Help with swaps, lending, yield farming, liquidity provision
- **Cross-chain Trading**: Support for Ethereum, Base, Arbitrum, and other chains  
- **Portfolio Management**: Analysis, recommendations, risk assessment
- **Market Insights**: Real-time data interpretation and trend analysis
- **Security Guidance**: Best practices for wallet and asset protection

## Communication Style:
- Be conversational and approachable, not overly formal
- Provide clear, actionable advice
- Ask clarifying questions when needed
- Explain complex concepts in simple terms
- Offer specific examples and use cases

## Key Principles:
- Always prioritize user security and safety
- Provide educational context with recommendations
- Be transparent about risks and limitations
- Never provide financial advice as investment recommendations
- Focus on helping users understand their options

## Context Awareness:
- Remember user preferences and past interactions
- Adapt explanations to user experience level
- Consider current market conditions in responses
- Provide relevant, timely information

When users ask questions, provide helpful, detailed responses that guide them toward their goals while keeping them informed about risks and best practices.`;
    
    if (sanitizedInput.memoryContext) {
      systemPrompt += `\n\nUser Context: ${sanitizedInput.memoryContext}`;
    }
    
    if (sanitizedInput.conversationSummary) {
      systemPrompt += `\n\nConversation Summary: ${sanitizedInput.conversationSummary}`;
    }

    // Call OpenRouter API with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env['APP_URL'] || 'https://nyxusd.com',
          'X-Title': process.env['APP_NAME'] || 'NyxUSD',
          'User-Agent': 'NyxUSD/1.0'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: sanitizedInput.message
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          provider: {
            order: ["Google", "DeepSeek", "Qwen", "OpenAI"],
            allow_fallbacks: true,
          },
          transforms: ["middle-out"],
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`OpenRouter API error (${response.status}):`, errorText);
        
        // Handle specific error cases
        if (response.status === 429) {
          return res.status(429).json({ 
            success: false, 
            error: 'AI service rate limited. Please try again in a moment.' 
          });
        } else if (response.status === 401) {
          console.error('OpenRouter API key invalid');
          return res.status(500).json({ 
            success: false, 
            error: 'AI service authentication error' 
          });
        } else if (response.status >= 500) {
          return res.status(502).json({ 
            success: false, 
            error: 'AI service temporarily unavailable' 
          });
        } else {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid request to AI service' 
          });
        }
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content;
      
      if (!aiMessage || typeof aiMessage !== 'string') {
        console.error('Invalid AI response format:', data);
        return res.status(502).json({ 
          success: false, 
          error: 'Invalid response from AI service' 
        });
      }

      // Sanitize AI response (basic XSS prevention)
      const sanitizedMessage = aiMessage.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      return res.status(200).json({
        success: true,
        message: sanitizedMessage,
        model: selectedModel,
        usage: data.usage || undefined
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return res.status(408).json({
          success: false,
          error: 'Request timeout'
        });
      }
      
      throw fetchError; // Re-throw to be caught by outer catch
    }

  } catch (error: any) {
    console.error('Chat API error:', {
      message: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}