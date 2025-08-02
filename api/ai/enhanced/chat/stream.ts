import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, context, enableCryptoTools } = req.body;

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "Configuration error",
        message: "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
      });
    }

    // Set SSE headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Build context-aware prompt
    let systemPrompt = "You are NYX, an AI assistant specialized in cryptocurrency, DeFi, and blockchain technology. You help users with investment strategies, portfolio analysis, and understanding DeFi protocols.";
    
    if (context?.userProfile) {
      systemPrompt += ` The user has ${context.userProfile.experience || 'some'} experience in crypto, ${context.userProfile.riskTolerance || 'moderate'} risk tolerance.`;
      if (context.userProfile.investmentGoals?.length) {
        systemPrompt += ` Their goals include: ${context.userProfile.investmentGoals.join(', ')}.`;
      }
    }

    if (context?.walletData?.holdings) {
      systemPrompt += ` User's portfolio includes: ${context.walletData.holdings.map((h: any) => `${h.amount} ${h.symbol}`).join(', ')}.`;
    }

    // Call OpenRouter API with streaming
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nyxusd-git-main-angleitos-projects.vercel.app',
        'X-Title': 'NYX USD Assistant',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-coder:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      res.write(`data: ${JSON.stringify({ error: "Failed to get AI response" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // Stream the response
    const reader = response.body?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: "No response body" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write("data: [DONE]\n\n");
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
            }
          } catch (e) {
            // Skip unparseable lines
          }
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Streaming error:", error);
    
    // If headers haven't been sent yet, send error as JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Streaming failed",
        message: error.message || "Failed to process your request"
      });
    } else {
      // If streaming has started, send error in stream
      res.write(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}