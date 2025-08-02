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

    // Mock AI response
    const mockResponse = {
      message: `I understand you're asking about: "${message}". As your personal AI assistant, I can help you with crypto investments, portfolio analysis, and DeFi strategies. ${enableCryptoTools ? 'I have crypto tools enabled to provide real-time data.' : ''} What specific aspect would you like to explore?`,
      toolsUsed: enableCryptoTools ? ['mock_price_tool'] : undefined,
      recommendations: context?.userProfile ? [
        "Based on your profile, consider diversifying your portfolio",
        "Look into yield farming opportunities on established protocols",
        "Consider dollar-cost averaging for long-term positions"
      ] : undefined,
    };

    res.json(mockResponse);
  } catch (error: any) {
    console.error("Error in enhanced chat endpoint:", error);

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process your request. Please try again.",
    });
  }
}