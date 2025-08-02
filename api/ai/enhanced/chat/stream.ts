import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    // Set SSE headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Mock streaming response
    const mockMessage = `I understand you're asking about: "${message}". As your AI assistant, I can help with crypto investments and DeFi strategies. ${enableCryptoTools ? 'I have crypto tools enabled.' : ''} How can I assist you today?`;
    
    // Simulate streaming by sending characters gradually
    for (const char of mockMessage) {
      res.write(`data: ${JSON.stringify({ chunk: char })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Streaming error:", error);
    
    res.status(500).json({ 
      error: "Streaming failed",
      message: error.message || "Failed to process your request"
    });
  }
}