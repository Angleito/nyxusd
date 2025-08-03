import { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse, ErrorResponse, ValidationError } from '../types/shared';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

/**
 * Chat context interface for type safety
 */
interface ChatContext {
  readonly userAgent?: string;
  readonly sessionId?: string;
  readonly previousQueries?: ReadonlyArray<string>;
  readonly userPreferences?: {
    readonly riskTolerance?: 'low' | 'moderate' | 'high';
    readonly experience?: 'beginner' | 'intermediate' | 'advanced';
  };
  readonly [key: string]: unknown;
}

/**
 * Strongly typed chat request interface
 */
interface ChatRequest {
  readonly message: string;
  readonly context?: ChatContext;
  readonly memoryContext?: string;
  readonly conversationSummary?: string;
  readonly model?: string;
}

/**
 * Extended chat response interface
 */
interface ChatResponse extends ApiResponse<string> {
  readonly model?: string;
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
    readonly total_tokens?: number;
  };
}

/**
 * OpenRouter API response structure
 */
interface OpenRouterResponse {
  readonly choices?: ReadonlyArray<{
    readonly message?: {
      readonly content?: string;
    };
  }>;
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
    readonly total_tokens?: number;
  };
}

/**
 * Rate limit record structure
 */
interface RateLimitRecord {
  readonly count: number;
  readonly resetTime: number;
  readonly blocked?: boolean;
}

/**
 * Chat error types for better error handling
 */
type ChatError = 
  | { readonly type: 'VALIDATION_ERROR'; readonly errors: ReadonlyArray<ValidationError> }
  | { readonly type: 'RATE_LIMIT_ERROR'; readonly retryAfter: number }
  | { readonly type: 'API_CONFIG_ERROR'; readonly message: string }
  | { readonly type: 'OPENROUTER_ERROR'; readonly message: string; readonly status: number }
  | { readonly type: 'TIMEOUT_ERROR' }
  | { readonly type: 'INTERNAL_ERROR'; readonly message: string };

// Rate limiting store (simple in-memory for serverless)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up old entries periodically to prevent memory leaks
 * Using proper typing for the cleanup function
 */
setInterval((): void => {
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

/**
 * Validate and sanitize chat context using functional validation
 */
const validateChatContext = (context: unknown): O.Option<ChatContext> => {
  if (!context || typeof context !== 'object') {
    return O.none;
  }
  
  const ctx = context as Record<string, unknown>;
  const sanitized: ChatContext = {};
  
  if (typeof ctx.userAgent === 'string') {
    sanitized.userAgent = ctx.userAgent;
  }
  
  if (typeof ctx.sessionId === 'string') {
    sanitized.sessionId = ctx.sessionId;
  }
  
  if (Array.isArray(ctx.previousQueries) && ctx.previousQueries.every(q => typeof q === 'string')) {
    sanitized.previousQueries = ctx.previousQueries as ReadonlyArray<string>;
  }
  
  if (ctx.userPreferences && typeof ctx.userPreferences === 'object') {
    const prefs = ctx.userPreferences as Record<string, unknown>;
    const riskTolerance = prefs.riskTolerance;
    const experience = prefs.experience;
    
    if (riskTolerance === 'low' || riskTolerance === 'moderate' || riskTolerance === 'high') {
      if (!sanitized.userPreferences) sanitized.userPreferences = {};
      sanitized.userPreferences = { ...sanitized.userPreferences, riskTolerance };
    }
    
    if (experience === 'beginner' || experience === 'intermediate' || experience === 'advanced') {
      if (!sanitized.userPreferences) sanitized.userPreferences = {};
      sanitized.userPreferences = { ...sanitized.userPreferences, experience };
    }
  }
  
  return O.some(sanitized);
};

/**
 * Comprehensive input validation using functional patterns
 */
const validateChatRequest = (body: unknown): E.Either<ChatError, ChatRequest> => {
  if (!body || typeof body !== 'object') {
    return E.left({ 
      type: 'VALIDATION_ERROR', 
      errors: [{ field: 'body', message: 'Invalid request body' }] 
    });
  }
  
  const request = body as Record<string, unknown>;
  const errors: ValidationError[] = [];
  
  // Validate message
  if (!request.message || typeof request.message !== 'string' || request.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required and must be a non-empty string' });
  }
  
  if (typeof request.message === 'string' && request.message.length > 4000) {
    errors.push({ field: 'message', message: 'Message too long (max 4000 characters)' });
  }
  
  // Validate optional string fields with length limits
  if (request.memoryContext && (typeof request.memoryContext !== 'string' || request.memoryContext.length > 2000)) {
    errors.push({ field: 'memoryContext', message: 'Memory context must be a string with max 2000 characters' });
  }
  
  if (request.conversationSummary && (typeof request.conversationSummary !== 'string' || request.conversationSummary.length > 1000)) {
    errors.push({ field: 'conversationSummary', message: 'Conversation summary must be a string with max 1000 characters' });
  }
  
  if (request.model && (typeof request.model !== 'string' || !/^[a-zA-Z0-9\-\/\.]+$/.test(request.model))) {
    errors.push({ field: 'model', message: 'Model must be a valid model identifier' });
  }
  
  if (errors.length > 0) {
    return E.left({ type: 'VALIDATION_ERROR', errors });
  }
  
  // Build sanitized request
  const sanitized: ChatRequest = {
    message: (request.message as string).trim(),
    context: pipe(validateChatContext(request.context), O.toUndefined),
    memoryContext: typeof request.memoryContext === 'string' ? request.memoryContext : undefined,
    conversationSummary: typeof request.conversationSummary === 'string' ? request.conversationSummary : undefined,
    model: typeof request.model === 'string' ? request.model : undefined
  };
  
  return E.right(sanitized);
};

/**
 * Allowed models for security
 */
const ALLOWED_MODELS = [
  'google/gemini-2.5-flash',
  'qwen/qwen3-30b-a3b-instruct-2507',
  'deepseek/deepseek-chat-v3-0324',
  'qwen/qwen3-235b-a22b-thinking-2507'
] as const;

type AllowedModel = typeof ALLOWED_MODELS[number];

/**
 * Validate and select model using functional patterns
 */
const validateModel = (model?: string): AllowedModel => {
  if (!model || !ALLOWED_MODELS.includes(model as AllowedModel)) {
    return 'google/gemini-2.5-flash'; // Default safe model
  }
  return model as AllowedModel;
};

/**
 * Build system prompt with memory context using functional composition
 */
const buildSystemPrompt = (memoryContext?: string, conversationSummary?: string): string => {
  const basePrompt = `You are NyxUSD, an advanced AI assistant specializing in decentralized finance (DeFi), blockchain technology, and digital asset management. You're designed to be helpful, knowledgeable, and conversational.

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

  const contextAdditions = [
    memoryContext ? `\n\nUser Context: ${memoryContext}` : '',
    conversationSummary ? `\n\nConversation Summary: ${conversationSummary}` : ''
  ].filter(Boolean).join('');

  return basePrompt + contextAdditions;
};

/**
 * Call OpenRouter API using TaskEither for proper error handling
 */
const callOpenRouter = (request: ChatRequest, model: AllowedModel): TE.TaskEither<ChatError, OpenRouterResponse> => {
  const apiKey = process.env['OPENROUTER_API_KEY'];
  
  if (!apiKey) {
    return TE.left({ type: 'API_CONFIG_ERROR', message: 'OpenRouter API key not configured' });
  }

  const systemPrompt = buildSystemPrompt(request.memoryContext, request.conversationSummary);

  return TE.tryCatch(
    async () => {
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
            model,
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: request.message
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
          return Promise.reject({ 
            type: 'OPENROUTER_ERROR', 
            message: errorText, 
            status: response.status 
          });
        }

        const data = await response.json() as OpenRouterResponse;
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    },
    (error): ChatError => {
      if (typeof error === 'object' && error !== null && 'type' in error) {
        return error as ChatError;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        return { type: 'TIMEOUT_ERROR' };
      }
      
      return { type: 'INTERNAL_ERROR', message: 'Failed to call OpenRouter API' };
    }
  );
};

/**
 * Extract and sanitize AI message from OpenRouter response
 */
const extractAIMessage = (response: OpenRouterResponse): E.Either<ChatError, string> => {
  const aiMessage = response.choices?.[0]?.message?.content;
  
  if (!aiMessage || typeof aiMessage !== 'string') {
    return E.left({ type: 'INTERNAL_ERROR', message: 'Invalid response from AI service' });
  }
  
  // Sanitize AI response (basic XSS prevention)
  const sanitizedMessage = aiMessage.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return E.right(sanitizedMessage);
};

/**
 * Get client IP from Vercel headers
 */
const getClientIP = (req: VercelRequest): string => {
  const forwardedFor = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const socketIP = req.socket?.remoteAddress;
  
  return forwardedFor?.split(',')[0]?.trim() || realIP || socketIP || 'unknown';
};

/**
 * Check rate limiting using functional patterns
 */
const checkRateLimitTE = (clientIP: string): TE.TaskEither<ChatError, { remaining: number; resetTime: number }> => {
  return TE.tryCatch(
    async () => {
      const rateLimitResult = checkRateLimit(clientIP);
      
      if (!rateLimitResult.allowed) {
        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        return Promise.reject({ type: 'RATE_LIMIT_ERROR', retryAfter });
      }
      
      return {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      };
    },
    (error): ChatError => {
      if (typeof error === 'object' && error !== null && 'type' in error) {
        return error as ChatError;
      }
      return { type: 'INTERNAL_ERROR', message: 'Rate limit check failed' };
    }
  );
};

/**
 * Process chat request using functional composition
 */
const processChatRequest = (request: ChatRequest): TE.TaskEither<ChatError, { message: string; model: AllowedModel; usage?: OpenRouterResponse['usage'] }> => {
  const selectedModel = validateModel(request.model);
  
  return pipe(
    callOpenRouter(request, selectedModel),
    TE.chain((response) =>
      pipe(
        extractAIMessage(response),
        TE.fromEither,
        TE.map((message) => ({
          message,
          model: selectedModel,
          usage: response.usage
        }))
      )
    )
  );
};

/**
 * Handle chat errors and send appropriate responses
 */
const handleChatError = (res: VercelResponse, error: ChatError): void => {
  console.error('Chat API error:', {
    type: error.type,
    error,
    timestamp: new Date().toISOString()
  });

  switch (error.type) {
    case 'VALIDATION_ERROR':
      const validationResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        validationErrors: error.errors
      };
      res.status(400).json(validationResponse);
      break;

    case 'RATE_LIMIT_ERROR':
      const rateLimitResponse: ErrorResponse = {
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      };
      res.setHeader('Retry-After', error.retryAfter.toString());
      res.status(429).json(rateLimitResponse);
      break;

    case 'API_CONFIG_ERROR':
      const configResponse: ErrorResponse = {
        success: false,
        error: 'AI service configuration error'
      };
      res.status(500).json(configResponse);
      break;

    case 'OPENROUTER_ERROR':
      const openrouterResponse: ErrorResponse = {
        success: false,
        error: error.message
      };
      
      let statusCode = 502;
      if (error.status === 429) statusCode = 429;
      else if (error.status === 401) statusCode = 500;
      else if (error.status >= 500) statusCode = 502;
      else if (error.status >= 400) statusCode = 400;
      
      res.status(statusCode).json(openrouterResponse);
      break;

    case 'TIMEOUT_ERROR':
      const timeoutResponse: ErrorResponse = {
        success: false,
        error: 'Request timeout'
      };
      res.status(408).json(timeoutResponse);
      break;

    case 'INTERNAL_ERROR':
    default:
      const internalResponse: ErrorResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(internalResponse);
      break;
  }
};

/**
 * AI Chat endpoint handler with functional error handling
 * 
 * Handles chat requests with OpenRouter API integration, implementing
 * comprehensive validation, rate limiting, and error handling using fp-ts.
 * 
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @returns Promise<void> - Resolves when response is sent
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set security headers
  setSecurityHeaders(req, res);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    const methodResponse: ErrorResponse = {
      success: false,
      error: 'Method not allowed'
    };
    return res.status(405).json(methodResponse);
  }

  // Get client IP for rate limiting
  const clientIP = getClientIP(req);

  // Process request using functional composition
  await pipe(
    // Validate input
    validateChatRequest(req.body),
    TE.fromEither,
    // Check rate limiting
    TE.chain((request) =>
      pipe(
        checkRateLimitTE(clientIP),
        TE.map((rateLimitInfo) => {
          // Set rate limit headers
          res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
          res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());
          return request;
        })
      )
    ),
    // Process chat request
    TE.chain(processChatRequest),
    // Handle result
    TE.fold(
      // Error case - handle with appropriate error response
      (error: ChatError) => async (): Promise<void> => {
        handleChatError(res, error);
      },
      // Success case - return chat response
      (result) => async (): Promise<void> => {
        const response: ChatResponse = {
          success: true,
          data: result.message,
          timestamp: new Date().toISOString(),
          model: result.model,
          usage: result.usage
        };
        
        res.status(200).json(response);
      }
    )
  )();
}