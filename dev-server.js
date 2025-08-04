/**
 * Simple development server for API endpoints during local development
 * This serves the /api/* endpoints that are normally handled by Vercel serverless functions
 * Uses Node.js built-in modules only - no external dependencies
 */

const http = require('http');
const url = require('url');

// Node 18+ has global fetch/AbortSignal/Buffer, but ESLint may complain.
// Explicitly import to satisfy linter and ensure compatibility with older Node.
const { Buffer } = require('buffer');

let fetchFn = global.fetch;
let AbortSignalCtor = global.AbortSignal;

// Lazy-load node-fetch if fetch is not available
if (typeof fetchFn !== 'function') {
  try {
    // eslint-disable-next-line no-undef
    fetchFn = require('node-fetch');
  } catch {
    throw new Error('fetch is not available. Install node-fetch or use Node.js v18+.');
  }
}

// Provide a timeout helper compatible across environments
function withTimeout(ms) {
  if (AbortSignalCtor && typeof AbortSignalCtor.timeout === 'function') {
    return AbortSignalCtor.timeout(ms);
  }
  // Fallback using AbortController if available in global
  // eslint-disable-next-line no-undef
  const AC = global.AbortController || (typeof AbortController !== 'undefined' ? AbortController : null);
  if (!AC) {
    // As a last resort, return undefined (no timeout)
    return undefined;
  }
  const controller = new AC();
  // setTimeout is standard in Node; eslint rule likely misconfigured in this environment
  // eslint-disable-next-line no-undef
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

const PORT = process.env.PORT || 8081;

// CoinGecko API for real price data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Token IDs for CoinGecko API mapping
const TOKEN_MAPPINGS = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'WBTC': 'wrapped-bitcoin',
  'WETH': 'weth',
  'MATIC': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'AERO': 'aerodrome-finance',
  'MORPHO': 'morpho',
  'BRETT': 'brett',
  'DEGEN': 'degen-base',
  'HIGHER': 'higher'
};

// Fallback prices for when API is unavailable
const FALLBACK_PRICES = {
  ETH: 2245.67,
  BTC: 43567.89,
  USDC: 1.00,
  USDT: 1.00,
  DAI: 0.9998,
  WBTC: 43567.89,
  WETH: 2245.67,
  AERO: 0.85,
  MORPHO: 1.25,
  BRETT: 0.089,
  DEGEN: 0.012,
  HIGHER: 0.045,
  NYX: 1.25 // Custom protocol token
};

async function fetchRealPrices() {
  try {
    const ids = Object.values(TOKEN_MAPPINGS).join(',');
    const response = await fetchFn(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NyxUSD/1.0'
        },
        signal: withTimeout(10000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the data to our format with type safety
    const prices = {};
    for (const [symbol, geckoId] of Object.entries(TOKEN_MAPPINGS)) {
      const priceData = data[geckoId];
      if (priceData?.usd && typeof priceData.usd === 'number') {
        prices[symbol] = priceData.usd;
      } else {
        // Use fallback price if API data is missing
        const fallbackPrice = FALLBACK_PRICES[symbol];
        if (fallbackPrice !== undefined) {
          prices[symbol] = fallbackPrice;
        }
      }
    }
    
    // Add NYX token (custom protocol token)
    prices['NYX'] = FALLBACK_PRICES.NYX;
    
    return prices;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown CoinGecko error';
    console.error('Failed to fetch prices from CoinGecko:', errorMessage);
    
    // Return fallback prices when API fails
    return { ...FALLBACK_PRICES };
  }
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Send JSON response
function sendJSON(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Handle Oracle prices endpoint
async function handleOraclePrices(req, res) {
  try {
    const prices = await fetchRealPrices();
    
    const priceData = {
      ...prices,
      timestamp: new Date().toISOString()
    };
    
    const successResponse = {
      success: true,
      data: priceData,
      timestamp: new Date().toISOString()
    };
    
    sendJSON(res, 200, successResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Oracle prices error:', errorMessage);
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch oracle prices',
      timestamp: new Date().toISOString()
    };
    sendJSON(res, 500, errorResponse);
  }
}

// Handle System stats endpoint (mock)
function handleSystemStats(req, res) {
  const successResponse = {
    success: true,
    data: {
      totalCollateral: '1,234,567.89',
      totalDebt: '987,654.32',
      systemHealth: 'Healthy',
      lastUpdate: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
  sendJSON(res, 200, successResponse);
}

// Handle AI chat endpoint (mock)
function handleAIChat(req, res) {
  const successResponse = {
    success: true,
    data: {
      response: "I'm a development mock response. The AI service is not configured for local development.",
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
  sendJSON(res, 200, successResponse);
}

// Handle Voice config endpoint by proxying to the real serverless function
async function handleVoiceConfig(req, res) {
  try {
    // Proxy to the local Vercel-style function at /api/voice-config
    const targetUrl = 'http://localhost:3000/api/voice-config';
    const response = await fetchFn(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: withTimeout(10000)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: 'Invalid JSON from voice-config', raw: text };
    }

    // Forward status and body
    sendJSON(res, response.status, data);
  } catch (error) {
    console.error('Voice config proxy error:', error instanceof Error ? error.message : String(error));
    const errorResponse = {
      success: false,
      error: 'Failed to proxy voice configuration',
      timestamp: new Date().toISOString()
    };
    sendJSON(res, 502, errorResponse);
  }
}

// Handle Health check
function handleHealth(req, res) {
  const successResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  };
  sendJSON(res, 200, successResponse);
}

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handling
  try {
    if (pathname === '/api/oracle/prices' && method === 'GET') {
      await handleOraclePrices(req, res);
    } else if (pathname === '/api/system' && method === 'GET') {
      handleSystemStats(req, res);
    } else if (pathname === '/api/ai/chat' && method === 'POST') {
      handleAIChat(req, res);
    } else if (pathname === '/api/voice-config' && method === 'GET') {
      await handleVoiceConfig(req, res);
    } else if ((pathname === '/api/voice-token' && method === 'GET') ||
               (pathname === '/api/voice-tts' && method === 'POST') ||
               (pathname === '/api/voice-health' && method === 'GET')) {
      // Generic proxy for other voice endpoints to frontend dev server (which runs serverless on /api)
      try {
        const targetUrl = `http://localhost:3000${pathname}`;
        const headers = { 'Accept': 'application/json' };
        // Read body if needed
        let body = undefined;
        if (method === 'POST') {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          body = Buffer.concat(chunks);
        }
        const response = await fetchFn(targetUrl, {
          method,
          headers: method === 'POST' ? { ...headers, 'Content-Type': req.headers['content-type'] || 'application/json' } : headers,
          body,
          signal: withTimeout(15000)
        });
        // For TTS we may have binary audio; pass-through content-type
        const contentType = response.headers.get('content-type') || 'application/json';
        setCorsHeaders(res);
        res.statusCode = response.status;
        res.setHeader('Content-Type', contentType);
        const arrayBuf = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        res.end(buf);
      } catch (e) {
        console.error('Voice endpoint proxy error:', e instanceof Error ? e.message : String(e));
        sendJSON(res, 502, { success: false, error: 'Failed to proxy voice endpoint', timestamp: new Date().toISOString() });
      }
    } else if (pathname === '/api/health' && method === 'GET') {
      handleHealth(req, res);
    } else {
      // 404 Not Found
      const notFoundResponse = {
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
      };
      sendJSON(res, 404, notFoundResponse);
    }
  } catch (error) {
    console.error('Server error:', error);
    const errorResponse = {
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    };
    sendJSON(res, 500, errorResponse);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Development API server running on http://localhost:${PORT}`);
  console.log('API endpoints available:');
  console.log('- GET /api/oracle/prices');
  console.log('- GET /api/system');
  console.log('- POST /api/ai/chat');
  console.log('- GET /api/voice-config (proxied to real serverless)');
  console.log('- GET /api/voice-token (proxied to real serverless via frontend /api)');
  console.log('- POST /api/voice-tts (proxied to real serverless via frontend /api)');
  console.log('- GET /api/voice-health (proxied to real serverless via frontend /api)');
  console.log('- GET /api/health');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  server.close(() => {
    process.exit(0);
  });
});