import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const cdpRequestSchema = z.object({
  action: z.enum(['create', 'deposit', 'withdraw', 'borrow', 'repay', 'liquidate', 'status']),
  collateral: z.number().optional(),
  debt: z.number().optional(),
  cdpId: z.string().optional(),
  walletAddress: z.string().optional(),
});

// Mock CDP service for now - replace with actual CDP service integration
const mockCDPService = {
  create: async (collateral: number) => ({
    cdpId: `cdp_${Date.now()}`,
    collateral,
    debt: 0,
    collateralizationRatio: Infinity,
    status: 'active',
  }),
  deposit: async (cdpId: string, amount: number) => ({
    cdpId,
    newCollateral: amount,
    success: true,
  }),
  withdraw: async (cdpId: string, amount: number) => ({
    cdpId,
    withdrawnAmount: amount,
    success: true,
  }),
  borrow: async (cdpId: string, amount: number) => ({
    cdpId,
    borrowedAmount: amount,
    success: true,
  }),
  repay: async (cdpId: string, amount: number) => ({
    cdpId,
    repaidAmount: amount,
    success: true,
  }),
  status: async (cdpId: string) => ({
    cdpId,
    collateral: 1000,
    debt: 500,
    collateralizationRatio: 200,
    status: 'active',
    liquidationPrice: 0.5,
  }),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Handle status checks
    const cdpId = req.query.cdpId as string;
    if (!cdpId) {
      return res.status(400).json({ error: 'CDP ID required' });
    }
    
    try {
      const status = await mockCDPService.status(cdpId);
      return res.status(200).json(status);
    } catch (error: any) {
      console.error('CDP status error:', error);
      return res.status(500).json({ error: 'Failed to get CDP status' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = cdpRequestSchema.parse(req.body);
    const { action, collateral, debt, cdpId, walletAddress } = validatedData;

    console.log('CDP request', {
      action,
      collateral,
      debt,
      cdpId,
      walletAddress,
    });

    let response;

    switch (action) {
      case 'create':
        if (!collateral) {
          return res.status(400).json({ error: 'Collateral amount required' });
        }
        response = await mockCDPService.create(collateral);
        break;

      case 'deposit':
        if (!cdpId || !collateral) {
          return res.status(400).json({ error: 'CDP ID and collateral amount required' });
        }
        response = await mockCDPService.deposit(cdpId, collateral);
        break;

      case 'withdraw':
        if (!cdpId || !collateral) {
          return res.status(400).json({ error: 'CDP ID and withdrawal amount required' });
        }
        response = await mockCDPService.withdraw(cdpId, collateral);
        break;

      case 'borrow':
        if (!cdpId || !debt) {
          return res.status(400).json({ error: 'CDP ID and borrow amount required' });
        }
        response = await mockCDPService.borrow(cdpId, debt);
        break;

      case 'repay':
        if (!cdpId || !debt) {
          return res.status(400).json({ error: 'CDP ID and repayment amount required' });
        }
        response = await mockCDPService.repay(cdpId, debt);
        break;

      case 'status':
        if (!cdpId) {
          return res.status(400).json({ error: 'CDP ID required' });
        }
        response = await mockCDPService.status(cdpId);
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    console.log('CDP response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('CDP error:', {
      error: error.message,
      stack: error.stack,
    });

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process CDP request',
    });
  }
}