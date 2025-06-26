const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;

// Mock data
const mockCDPs = [
  {
    id: 'cdp_001',
    owner: '0x742d35Cc6634C0532925a3b8D',
    collateralType: 'WETH',
    collateralAmount: '2500000000000000000', // 2.5 ETH
    debtAmount: '3000000000000000000000', // 3000 DAI
    collateralizationRatio: 150,
    healthFactor: 1.5,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'cdp_002',
    owner: '0x8ba1f109551bD432803012645Hac136c',
    collateralType: 'WBTC',
    collateralAmount: '50000000', // 0.5 BTC
    debtAmount: '15000000000000000000000', // 15000 DAI
    collateralizationRatio: 200,
    healthFactor: 2.0,
    status: 'active',
    createdAt: '2024-01-14T15:45:00Z',
    lastUpdated: '2024-01-15T08:20:00Z'
  }
];

const mockSystemStats = {
  totalCollateral: '250000000000000000000000', // $250,000
  totalDebt: '180000000000000000000000', // $180,000
  systemCollateralizationRatio: 139, // 139%
  stabilityFeeRate: 500, // 5% APR in basis points
  liquidationRatio: 150, // 150%
  emergencyShutdown: false,
  supportedCollaterals: [
    {
      type: 'WETH',
      name: 'Wrapped Ethereum',
      decimals: 18,
      liquidationRatio: 150,
      stabilityFee: 500,
      debtCeiling: '50000000000000000000000000' // $50M
    },
    {
      type: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      liquidationRatio: 150,
      stabilityFee: 300,
      debtCeiling: '25000000000000000000000000' // $25M
    }
  ]
};

const mockPrices = {
  timestamp: new Date().toISOString(),
  prices: {
    'ETH/USD': '2450.50',
    'BTC/USD': '42150.75',
    'MATIC/USD': '0.85',
    'USDC/USD': '1.00',
    'DAI/USD': '0.999'
  }
};

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, statusCode, data) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${method} ${path}`);

  // Health check
  if (path === '/api/health') {
    sendJSON(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        api: 'running'
      }
    });
    return;
  }

  // CDP operations
  if (path === '/api/cdp' && method === 'GET') {
    sendJSON(res, 200, {
      cdps: mockCDPs,
      totalCDPs: mockCDPs.length,
      totalCollateralValue: '95000000000000000000000', // $95,000
      totalDebtIssued: '18000000000000000000000' // $18,000
    });
    return;
  }

  if (path === '/api/cdp/create' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { collateralType, collateralAmount, debtAmount, owner } = JSON.parse(body);
        
        const newCDP = {
          id: `cdp_${Date.now()}`,
          owner,
          collateralType,
          collateralAmount,
          debtAmount,
          collateralizationRatio: Math.floor((parseInt(collateralAmount) * 2000) / parseInt(debtAmount) * 100),
          healthFactor: 1.8,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };

        mockCDPs.push(newCDP);

        sendJSON(res, 201, {
          success: true,
          cdp: newCDP,
          message: 'CDP created successfully'
        });
      } catch (error) {
        sendJSON(res, 400, { success: false, message: 'Invalid request body' });
      }
    });
    return;
  }

  // CDP actions
  if (path.startsWith('/api/cdp/') && (path.includes('/deposit') || path.includes('/withdraw') || path.includes('/mint') || path.includes('/burn'))) {
    const cdpId = path.split('/')[3];
    const action = path.split('/')[4];
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { amount } = JSON.parse(body);
        
        sendJSON(res, 200, {
          success: true,
          cdpId,
          [`${action}Amount`]: amount,
          newHealthFactor: Math.random() * 0.5 + 1.5, // Random between 1.5-2.0
          message: `${action.charAt(0).toUpperCase() + action.slice(1)} operation successful`
        });
      } catch (error) {
        sendJSON(res, 400, { success: false, message: 'Invalid request body' });
      }
    });
    return;
  }

  // System stats
  if (path === '/api/system' && method === 'GET') {
    sendJSON(res, 200, mockSystemStats);
    return;
  }

  // Oracle prices
  if (path === '/api/oracle/prices' && method === 'GET') {
    // Update timestamp for real-time feel
    mockPrices.timestamp = new Date().toISOString();
    sendJSON(res, 200, mockPrices);
    return;
  }

  // 404 for other routes
  sendJSON(res, 404, {
    success: false,
    message: 'API endpoint not found'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mock NyxUSD API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 CDP API: http://localhost:${PORT}/api/cdp`);
});

module.exports = server;