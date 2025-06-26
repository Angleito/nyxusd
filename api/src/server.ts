import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';

// Import CDP operations (mock for now since we need to resolve import paths)
// import * as CDPOperations from '@nyxusd/core';

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Redis client for caching
let redisClient: any;
if (process.env.NODE_ENV === 'production') {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: {
      api: 'running',
      redis: redisClient?.isReady ? 'connected' : 'disconnected'
    }
  });
});

// CDP operations endpoints
app.get('/api/cdp', (req, res) => {
  // Mock CDP data for demonstration
  res.json({
    cdps: [
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
    ],
    totalCDPs: 2,
    totalCollateralValue: '95000000000000000000000', // $95,000
    totalDebtIssued: '18000000000000000000000' // $18,000
  });
});

app.post('/api/cdp/create', (req, res) => {
  const { collateralType, collateralAmount, debtAmount, owner } = req.body;
  
  // Mock CDP creation
  const newCDP = {
    id: `cdp_${Date.now()}`,
    owner,
    collateralType,
    collateralAmount,
    debtAmount,
    collateralizationRatio: Math.floor((parseInt(collateralAmount) * 2000) / parseInt(debtAmount) * 100), // Mock ratio
    healthFactor: 1.8,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    cdp: newCDP,
    message: 'CDP created successfully'
  });
});

app.post('/api/cdp/:id/deposit', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  res.json({
    success: true,
    cdpId: id,
    depositAmount: amount,
    newCollateralAmount: '3000000000000000000', // Mock new amount
    newHealthFactor: 2.1,
    message: 'Collateral deposited successfully'
  });
});

app.post('/api/cdp/:id/withdraw', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  res.json({
    success: true,
    cdpId: id,
    withdrawAmount: amount,
    newCollateralAmount: '2000000000000000000', // Mock new amount
    newHealthFactor: 1.3,
    message: 'Collateral withdrawn successfully'
  });
});

app.post('/api/cdp/:id/mint', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  res.json({
    success: true,
    cdpId: id,
    mintAmount: amount,
    newDebtAmount: '4000000000000000000000', // Mock new debt
    newHealthFactor: 1.25,
    message: 'nyxUSD minted successfully'
  });
});

app.post('/api/cdp/:id/burn', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  res.json({
    success: true,
    cdpId: id,
    burnAmount: amount,
    newDebtAmount: '2000000000000000000000', // Mock new debt
    newHealthFactor: 1.75,
    message: 'nyxUSD burned successfully'
  });
});

// System information endpoints
app.get('/api/system', (req, res) => {
  res.json({
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
  });
});

// Oracle price feeds (mock)
app.get('/api/oracle/prices', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    prices: {
      'ETH/USD': '2450.50',
      'BTC/USD': '42150.75',
      'MATIC/USD': '0.85',
      'USDC/USD': '1.00',
      'DAI/USD': '0.999'
    }
  });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    if (redisClient) {
      await redisClient.connect();
      console.log('Connected to Redis');
    }

    app.listen(PORT, () => {
      console.log(`🚀 NyxUSD API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📈 CDP API: http://localhost:${PORT}/api/cdp`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;