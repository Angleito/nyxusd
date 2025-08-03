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
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
function setSecurityHeaders(res: VercelResponse): void {
  // Only allow requests from your domain in production
  const allowedOrigins = [
    'https://nyxusd.com',
    'https://www.nyxusd.com',
    'http://localhost:5173', // Development
    'http://localhost:3000'  // Development
  ];
  
  const origin = process.env['NODE_ENV'] === 'production' 
    ? 'https://nyxusd.com' 
    : '*';
    
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// Simple rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // Max 20 requests per minute per IP
  
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Input validation
function validateInput(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }
  
  const { message } = body;
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { isValid: false, error: 'Message is required and must be a non-empty string' };
  }
  
  if (message.length > 4000) {
    return { isValid: false, error: 'Message too long (max 4000 characters)' };
  }
  
  return { isValid: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set security headers
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] as string || 
                   req.headers['x-real-ip'] as string || 
                   req.connection?.remoteAddress || 
                   'unknown';
  
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.'
    });
  }

  try {
    // Input validation
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const { message, context, memoryContext, conversationSummary, model } = req.body as ChatRequest;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    const apiKey = process.env['OPENROUTER_API_KEY'];
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenRouter API key not configured' 
      });
    }

    // Select model based on query type
    const selectedModel = model || 'google/gemini-2.5-flash';
    
    // Build system prompt
    let systemPrompt = `You are NyxUSD, an AI-powered DeFi assistant. Help users with blockchain operations, trading, and portfolio management.`;
    
    if (memoryContext) {
      systemPrompt += `\n\nUser Context: ${memoryContext}`;
    }
    
    if (conversationSummary) {
      systemPrompt += `\n\nConversation Summary: ${conversationSummary}`;
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env['APP_URL'] || 'https://nyxusd.com',
        'X-Title': process.env['APP_NAME'] || 'NyxUSD',
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
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        provider: {
          order: ["Google", "DeepSeek", "Qwen", "OpenAI"],
          allow_fallbacks: true,
        },
        transforms: ["middle-out"],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'AI service temporarily unavailable' 
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid response from AI service' 
      });
    }

    return res.status(200).json({
      success: true,
      message: aiMessage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}