import { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse, ErrorResponse, ValidationError } from '../types/shared.js';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as O from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';

/**
 * Chat context interface for type safety
 */
interface ChatContext {
  userAgent?: string;
  sessionId?: string;
  previousQueries?: ReadonlyArray<string>;
  userPreferences?: {
    riskTolerance?: 'low' | 'moderate' | 'high';
    experience?: 'beginner' | 'intermediate' | 'advanced';
  };
  [key: string]: unknown;
}

/**
 * Strongly typed streaming chat request interface
 */
interface StreamChatRequest {
  readonly message: string;
  readonly context?: ChatContext;
  readonly memoryContext?: string;
  readonly conversationSummary?: string;
  readonly model?: string;
}

/**
 * OpenRouter streaming response structure
 */
interface OpenRouterStreamChunk {
  readonly choices?: ReadonlyArray<{
    readonly delta?: {
      readonly content?: string;
    };
    readonly finish_reason?: string;
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
  count: number;
  resetTime: number;
  blocked?: boolean;
}

/**
 * Stream error types for better error handling
 */
type StreamError = 
  | { readonly type: 'VALIDATION_ERROR'; readonly errors: ReadonlyArray<ValidationError> }
  | { readonly type: 'RATE_LIMIT_ERROR'; readonly retryAfter: number }
  | { readonly type: 'API_CONFIG_ERROR'; readonly message: string }
  | { readonly type: 'OPENROUTER_ERROR'; readonly message: string; readonly status: number }
  | { readonly type: 'TIMEOUT_ERROR' }
  | { readonly type: 'STREAM_ERROR'; readonly message: string }
  | { readonly type: 'INTERNAL_ERROR'; readonly message: string };

// Rate limiting store (simple in-memory for serverless)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up old entries periodically to prevent memory leaks
 */
setInterval((): void => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Security headers for streaming responses
function setStreamingHeaders(req: VercelRequest, res: VercelResponse): void {
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
  
  // SSE specific headers
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
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
  
  if (typeof ctx['userAgent'] === 'string') {
    sanitized.userAgent = ctx['userAgent'];
  }
  
  if (typeof ctx['sessionId'] === 'string') {
    sanitized.sessionId = ctx['sessionId'];
  }
  
  if (Array.isArray(ctx['previousQueries']) && ctx['previousQueries'].every(q => typeof q === 'string')) {
    sanitized.previousQueries = ctx['previousQueries'] as ReadonlyArray<string>;
  }
  
  if (ctx['userPreferences'] && typeof ctx['userPreferences'] === 'object') {
    const prefs = ctx['userPreferences'] as Record<string, unknown>;
    const riskTolerance = prefs['riskTolerance'];
    const experience = prefs['experience'];
    
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
const validateStreamChatRequest = (body: unknown): E.Either<StreamError, StreamChatRequest> => {
  if (!body || typeof body !== 'object') {
    return E.left({ 
      type: 'VALIDATION_ERROR', 
      errors: [{ field: 'body', message: 'Invalid request body' }] 
    });
  }
  
  const request = body as Record<string, unknown>;
  const errors: ValidationError[] = [];
  
  // Validate message
  if (!request['message'] || typeof request['message'] !== 'string' || request['message'].trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required and must be a non-empty string' });
  }
  
  if (typeof request['message'] === 'string' && request['message'].length > 4000) {
    errors.push({ field: 'message', message: 'Message too long (max 4000 characters)' });
  }
  
  // Validate optional string fields with length limits
  if (request['memoryContext'] && (typeof request['memoryContext'] !== 'string' || request['memoryContext'].length > 2000)) {
    errors.push({ field: 'memoryContext', message: 'Memory context must be a string with max 2000 characters' });
  }
  
  if (request['conversationSummary'] && (typeof request['conversationSummary'] !== 'string' || request['conversationSummary'].length > 1000)) {
    errors.push({ field: 'conversationSummary', message: 'Conversation summary must be a string with max 1000 characters' });
  }
  
  if (request['model'] && (typeof request['model'] !== 'string' || !/^[a-zA-Z0-9-/.]+$/.test(request['model']))) {
    errors.push({ field: 'model', message: 'Model must be a valid model identifier' });
  }
  
  if (errors.length > 0) {
    return E.left({ type: 'VALIDATION_ERROR', errors });
  }
  
  // Build sanitized request
  const sanitized: StreamChatRequest = {
    message: (request['message'] as string).trim(),
    context: pipe(validateChatContext(request['context']), O.toUndefined),
    memoryContext: typeof request['memoryContext'] === 'string' ? request['memoryContext'] : undefined,
    conversationSummary: typeof request['conversationSummary'] === 'string' ? request['conversationSummary'] : undefined,
    model: typeof request['model'] === 'string' ? request['model'] : undefined
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
  const nyxIdentity = `You are Nyx, the NYX AI operating exclusively for NYX (nyxusd.com).
Identity: NYX is a CDP and DeFi hub — an AI-driven DeFi source for custom contracts.
Scope: Only represent NYX and do not offer, endorse, or refer services outside NYX.
Compliance: Responses are informational, not financial advice. Prefer actions routed to nyxusd.com or in-app flows.`;

  const basePrompt = `${nyxIdentity}

## Core Capabilities (NYX-scoped):
- DeFi Operations via NYX-managed flows (CDPs, yield pools, swaps)
- Cross-chain Strategy within NYX integrations (e.g., Base, Sui, others when available)
- Portfolio insights and risk awareness
- Market context summaries
- Security guidance and best practices

## Communication:
- Conversational, clear, and actionable
- Ask clarifying questions when needed
- Explain complex topics simply with concrete examples

## Principles:
- Prioritize user safety and privacy
- Be transparent about risks and limitations
- Do not recommend non-NYX platforms or services; if requested, reframe to NYX-managed options

Provide helpful responses that guide users to NYX-native actions and learning.`;

  const contextAdditions = [
    memoryContext ? `\n\nUser Context: ${memoryContext}` : '',
    conversationSummary ? `\n\nConversation Summary: ${conversationSummary}` : ''
  ].filter(Boolean).join('');

  return basePrompt + contextAdditions;
};

/**
 * Stream OpenRouter API response using Server-Sent Events
 */
const streamOpenRouter = async (
  request: StreamChatRequest,
  model: AllowedModel,
  res: VercelResponse
): Promise<E.Either<StreamError, void>> => {
  // Support Authorization bearer passthrough in addition to env
  const headerAuth = (request as any).__authToken as string | undefined;
  // Accept both OpenRouter and OpenAI keys; prefer header, then OPENROUTER_API_KEY, then OPENAI_API_KEY
  // Normalize environment variable loading across Vercel setups:
  // Prefer OPENROUTER_API_KEY, then OPENAI_API_KEY, plus common aliases to avoid misconfig.
  const envKeyOpenRouter =
    process.env['OPENROUTER_API_KEY'] ||
    process.env['OPENROUTER_KEY'] ||
    process.env['NEXT_PUBLIC_OPENROUTER_API_KEY'];
  const envKeyOpenAI =
    process.env['OPENAI_API_KEY'] ||
    process.env['OPENAI_SECRET_KEY'] ||
    process.env['NEXT_PUBLIC_OPENAI_API_KEY'];
  const envKey = envKeyOpenRouter || envKeyOpenAI;
  const apiKey = headerAuth || envKey;
  
  if (!apiKey) {
    return E.left({ type: 'API_CONFIG_ERROR', message: 'No auth credentials found' });
  }

  const systemPrompt = buildSystemPrompt(request.memoryContext, request.conversationSummary);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for streaming
    
    // Prefer global fetch (Node 18+ / Vercel). Fallback to undici.fetch for lint compatibility.
    const doFetch: (input: any, init?: any) => Promise<Response> =
      typeof (globalThis as any).fetch === 'function'
        ? (globalThis as any).fetch.bind(globalThis)
        : ((await import('undici')) as any).fetch;

    const response = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env['APP_URL'] || process.env['FRONTEND_URL'] || 'https://nyxusd.com',
        'X-Title': process.env['APP_NAME'] || process.env['VITE_APP_NAME'] || 'NyxUSD',
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
        stream: true, // Enable streaming
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
      
      // Try to parse error as JSON
      let errorMessage = errorText;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Keep original error text if not JSON
      }
      
      return E.left({
        type: 'OPENROUTER_ERROR',
        message: errorMessage,
        status: response.status
      });
    }

    if (!response.body) {
      return E.left({ type: 'STREAM_ERROR', message: 'No response body for streaming' });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      // Stream consumption loop; reader.read() resolves with done=true to exit
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') continue;
          if (trimmedLine === 'data: [DONE]') break;
          if (!trimmedLine.startsWith('data: ')) continue;

          try {
            const jsonData = trimmedLine.slice(6); // Remove 'data: ' prefix
            const chunk: OpenRouterStreamChunk = JSON.parse(jsonData);
            
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              // Send content as plain text chunk (not SSE format for simplicity)
              res.write(content);
            }

            // Check for completion
            if (chunk.choices?.[0]?.finish_reason) {
              break;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming chunk:', parseError);
            continue;
          }
        }
      }

      res.end();
      return E.right(undefined);

    } catch (streamError) {
      console.error('Streaming error:', streamError);
      return E.left({ type: 'STREAM_ERROR', message: 'Failed to process stream' });
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return E.left({ type: 'TIMEOUT_ERROR' });
    }
    
    console.error('OpenRouter streaming error:', error);
    return E.left({ type: 'INTERNAL_ERROR', message: 'Failed to call OpenRouter API' });
  }
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
const checkRateLimitTE = (clientIP: string): TE.TaskEither<StreamError, { remaining: number; resetTime: number }> => {
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
    (error): StreamError => {
      if (typeof error === 'object' && error !== null && 'type' in error) {
        return error as StreamError;
      }
      return { type: 'INTERNAL_ERROR', message: 'Rate limit check failed' };
    }
  );
};

/**
 * Handle streaming errors and send appropriate responses
 */
const handleStreamError = (res: VercelResponse, error: StreamError): void => {
  console.error('Stream API error:', {
    type: error.type,
    error,
    timestamp: new Date().toISOString()
  });

  // Send error as plain text since we're already in streaming mode
  let errorMessage = 'An error occurred while processing your request.';
  let statusCode = 500;

  switch (error.type) {
    case 'VALIDATION_ERROR':
      errorMessage = 'Invalid request: ' + error.errors.map(e => e.message).join(', ');
      statusCode = 400;
      break;
    case 'RATE_LIMIT_ERROR':
      errorMessage = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
      break;
    case 'API_CONFIG_ERROR':
      // Missing server-side credentials is misconfiguration => 500
      errorMessage = error.message || 'AI service configuration error';
      statusCode = 500;
      break;
    case 'OPENROUTER_ERROR':
      errorMessage = 'AI service error: ' + error.message;
      // Preserve upstream 401/403 to avoid generic 502 masking auth failures
      statusCode = error.status === 429 ? 429 : (error.status === 401 || error.status === 403 ? error.status : 502);
      break;
    case 'TIMEOUT_ERROR':
      errorMessage = 'Request timeout';
      statusCode = 408;
      break;
    case 'STREAM_ERROR':
      errorMessage = 'Streaming error: ' + error.message;
      statusCode = 500;
      break;
    default:
      errorMessage = 'Internal server error';
      statusCode = 500;
      break;
  }

  if (!res.headersSent) {
    res.status(statusCode);
  }
  
  res.write(`Error: ${errorMessage}`);
  res.end();
};

/**
 * AI Chat Streaming endpoint handler with functional error handling
 *
 * Handles streaming chat requests with OpenRouter API integration, implementing
 * comprehensive validation, rate limiting, and error handling using fp-ts.
 *
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @returns Promise<void> - Resolves when streaming is complete
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {

  // Validate HTTP method
  if (req.method !== 'POST') {
    res.status(405);
    res.write('Method not allowed');
    res.end();
    return;
  }

  // Extract Authorization bearer, pass through to OpenRouter if present
  const authHeader = (req.headers['authorization'] as string | undefined) || '';
  const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Get client IP for rate limiting
  const clientIP = getClientIP(req);

  // Process request using functional composition
  await pipe(
    // Validate input
    validateStreamChatRequest(req.body),
    TE.fromEither,
    // Attach auth to request for downstream streamOpenRouter
    TE.map((validated) => Object.assign({}, validated, { __authToken: bearer || undefined })),
    // Check rate limiting
    TE.chain((requestWithAuth) =>
      pipe(
        checkRateLimitTE(clientIP),
        TE.map((rateLimitInfo) => {
          // Set rate limit headers
          res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
          res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());
          return requestWithAuth;
        })
      )
    ),
    // Process streaming request
    TE.chain((request) => {
      const selectedModel = validateModel(request.model);
      return TE.fromEither(E.right({ request, selectedModel }));
    }),
    // Handle streaming
    TE.chain(({ request, selectedModel }) =>
      TE.tryCatch(
        async () => {
          const streamResult = await streamOpenRouter(request as any, selectedModel, res);
          if (E.isLeft(streamResult)) {
            throw streamResult.left;
          }
          return streamResult.right;
        },
        (error): StreamError => {
          if (typeof error === 'object' && error !== null && 'type' in error) {
            return error as StreamError;
          }
          return { type: 'INTERNAL_ERROR', message: 'Streaming failed' };
        }
      )
    ),
    // Handle result
    TE.fold(
      // Error case - handle with streaming error response
      (error: StreamError) => async (): Promise<void> => {
        handleStreamError(res, error);
      },
      // Success case - streaming already completed
      () => async (): Promise<void> => {
        // Response already sent through streaming
      }
    )
  )();
}