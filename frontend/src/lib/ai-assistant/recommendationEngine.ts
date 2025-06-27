import { Either } from '@nyxusd/fp-utils';
import { v4 as uuidv4 } from 'uuid';

export interface WalletData {
  holdings: Array<{
    symbol: string;
    amount: number;
    valueUSD: number;
  }>;
  totalValueUSD: number;
  cdpPositions?: Array<{
    collateral: number;
    debt: number;
    ratio: number;
  }>;
}

export interface UserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  allocationPercentage: number;
  expectedReturnRange: {
    min: number;
    max: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  actions: Array<{
    type: 'allocate' | 'stake' | 'provide-liquidity' | 'open-cdp';
    asset: string;
    amount: number;
    details?: string;
  }>;
}

interface RecommendationTemplate {
  title: string;
  description: string;
  baseAllocation: number;
  expectedReturnMin: number;
  expectedReturnMax: number;
  riskLevel: 'low' | 'medium' | 'high';
  explanationTemplate: string;
  actionType: 'allocate' | 'stake' | 'provide-liquidity' | 'open-cdp';
  asset: string;
}

const RECOMMENDATION_TEMPLATES: Record<UserProfile['riskTolerance'], RecommendationTemplate[]> = {
  conservative: [
    {
      title: 'Stablecoin Yield Farming',
      description: 'Earn steady yields on USDC/USDT liquidity pools',
      baseAllocation: 40,
      expectedReturnMin: 4,
      expectedReturnMax: 8,
      riskLevel: 'low',
      explanationTemplate: 'This strategy focuses on providing liquidity to stable pairs, minimizing impermanent loss while generating consistent yields.',
      actionType: 'provide-liquidity',
      asset: 'USDC/USDT'
    },
    {
      title: 'nyxUSD Staking',
      description: 'Stake nyxUSD for passive income',
      baseAllocation: 35,
      expectedReturnMin: 6,
      expectedReturnMax: 10,
      riskLevel: 'low',
      explanationTemplate: 'Staking nyxUSD provides a reliable income stream with minimal risk, backed by overcollateralized positions.',
      actionType: 'stake',
      asset: 'nyxUSD'
    },
    {
      title: 'Conservative CLMM Allocation',
      description: 'Small exposure to CLMM governance token',
      baseAllocation: 15,
      expectedReturnMin: 8,
      expectedReturnMax: 15,
      riskLevel: 'medium',
      explanationTemplate: 'A modest allocation to CLMM provides upside potential while maintaining overall portfolio stability.',
      actionType: 'allocate',
      asset: 'CLMM'
    },
    {
      title: 'Cash Reserve',
      description: 'Maintain liquidity for opportunities',
      baseAllocation: 10,
      expectedReturnMin: 0,
      expectedReturnMax: 2,
      riskLevel: 'low',
      explanationTemplate: 'Keeping some funds liquid allows you to take advantage of market opportunities without disrupting your core positions.',
      actionType: 'allocate',
      asset: 'USDC'
    }
  ],
  moderate: [
    {
      title: 'Balanced Liquidity Provision',
      description: 'Provide liquidity to nyxUSD/USDC pools',
      baseAllocation: 30,
      expectedReturnMin: 8,
      expectedReturnMax: 15,
      riskLevel: 'medium',
      explanationTemplate: 'This balanced approach to liquidity provision offers good yields with moderate impermanent loss risk.',
      actionType: 'provide-liquidity',
      asset: 'nyxUSD/USDC'
    },
    {
      title: 'CLMM Staking',
      description: 'Stake CLMM tokens for governance rewards',
      baseAllocation: 25,
      expectedReturnMin: 12,
      expectedReturnMax: 25,
      riskLevel: 'medium',
      explanationTemplate: 'Staking CLMM not only provides yield but also governance rights in the protocol.',
      actionType: 'stake',
      asset: 'CLMM'
    },
    {
      title: 'CDP Strategy',
      description: 'Open moderate CDP positions for capital efficiency',
      baseAllocation: 25,
      expectedReturnMin: 10,
      expectedReturnMax: 20,
      riskLevel: 'medium',
      explanationTemplate: 'Using CDPs with safe collateral ratios allows you to maintain exposure while accessing liquidity.',
      actionType: 'open-cdp',
      asset: 'ETH'
    },
    {
      title: 'Diversified Holdings',
      description: 'Hold a mix of stable and volatile assets',
      baseAllocation: 20,
      expectedReturnMin: 5,
      expectedReturnMax: 18,
      riskLevel: 'medium',
      explanationTemplate: 'Diversification across multiple assets helps balance risk and return in your portfolio.',
      actionType: 'allocate',
      asset: 'Mixed'
    }
  ],
  aggressive: [
    {
      title: 'High-Yield CLMM Strategies',
      description: 'Maximize CLMM exposure for high returns',
      baseAllocation: 40,
      expectedReturnMin: 15,
      expectedReturnMax: 40,
      riskLevel: 'high',
      explanationTemplate: 'Aggressive CLMM strategies can generate significant returns but come with higher volatility.',
      actionType: 'allocate',
      asset: 'CLMM'
    },
    {
      title: 'Leveraged CDP Positions',
      description: 'Use CDPs for leveraged yield farming',
      baseAllocation: 30,
      expectedReturnMin: 20,
      expectedReturnMax: 50,
      riskLevel: 'high',
      explanationTemplate: 'Leveraging through CDPs can amplify returns but requires active management to avoid liquidation.',
      actionType: 'open-cdp',
      asset: 'ETH'
    },
    {
      title: 'Volatile Pair Liquidity',
      description: 'Provide liquidity to high-volume volatile pairs',
      baseAllocation: 20,
      expectedReturnMin: 25,
      expectedReturnMax: 60,
      riskLevel: 'high',
      explanationTemplate: 'High-volume volatile pairs offer exceptional fees but significant impermanent loss risk.',
      actionType: 'provide-liquidity',
      asset: 'CLMM/ETH'
    },
    {
      title: 'Opportunistic Trading',
      description: 'Reserve for high-conviction trades',
      baseAllocation: 10,
      expectedReturnMin: -20,
      expectedReturnMax: 100,
      riskLevel: 'high',
      explanationTemplate: 'Keeping funds available for opportunistic trades allows you to capitalize on market inefficiencies.',
      actionType: 'allocate',
      asset: 'USDC'
    }
  ]
};

const adjustAllocationForProfile = (
  template: RecommendationTemplate,
  profile: UserProfile,
  walletData: WalletData
): number => {
  let allocation = template.baseAllocation;

  // Adjust based on investment horizon
  if (profile.investmentHorizon === 'short' && template.riskLevel === 'high') {
    allocation *= 0.7; // Reduce high-risk allocations for short-term investors
  } else if (profile.investmentHorizon === 'long' && template.riskLevel === 'low') {
    allocation *= 0.8; // Reduce low-risk allocations for long-term investors
  }

  // Adjust based on experience level
  if (profile.experienceLevel === 'beginner' && template.riskLevel === 'high') {
    allocation *= 0.5; // Significantly reduce high-risk for beginners
  } else if (profile.experienceLevel === 'advanced' && template.riskLevel === 'low') {
    allocation *= 0.9; // Slightly reduce low-risk for advanced users
  }

  // Adjust based on current holdings
  const currentAssetPercentage = walletData.holdings
    .filter(h => h.symbol === template.asset || template.asset === 'Mixed')
    .reduce((sum, h) => sum + (h.valueUSD / walletData.totalValueUSD) * 100, 0);

  if (currentAssetPercentage > allocation) {
    allocation *= 0.5; // Reduce if already overallocated
  }

  return Math.round(allocation);
};

const normalizeAllocations = (recommendations: Recommendation[]): Recommendation[] => {
  const totalAllocation = recommendations.reduce((sum, rec) => sum + rec.allocationPercentage, 0);
  
  if (totalAllocation === 0) {
    // Fallback to equal distribution
    const equalAllocation = Math.floor(100 / recommendations.length);
    const remainder = 100 - (equalAllocation * recommendations.length);
    
    return recommendations.map((rec, index) => ({
      ...rec,
      allocationPercentage: equalAllocation + (index === 0 ? remainder : 0)
    }));
  }

  // Normalize to 100%
  const normalizationFactor = 100 / totalAllocation;
  let normalizedRecommendations = recommendations.map(rec => ({
    ...rec,
    allocationPercentage: Math.round(rec.allocationPercentage * normalizationFactor)
  }));

  // Handle rounding errors
  const normalizedTotal = normalizedRecommendations.reduce((sum, rec) => sum + rec.allocationPercentage, 0);
  if (normalizedTotal !== 100) {
    const diff = 100 - normalizedTotal;
    const largestAllocation = normalizedRecommendations.reduce((prev, current) => 
      current.allocationPercentage > prev.allocationPercentage ? current : prev
    );
    largestAllocation.allocationPercentage += diff;
  }

  return normalizedRecommendations;
};

export const generateRecommendations = (
  walletData: WalletData,
  userProfile: UserProfile
): Either<Error, Recommendation[]> => {
  try {
    const templates = RECOMMENDATION_TEMPLATES[userProfile.riskTolerance];
    
    if (!templates || templates.length === 0) {
      return Either.left(new Error('No recommendation templates found for risk profile'));
    }

    const recommendations: Recommendation[] = templates.map(template => {
      const adjustedAllocation = adjustAllocationForProfile(template, userProfile, walletData);
      const allocationValue = (walletData.totalValueUSD * adjustedAllocation) / 100;

      return {
        id: uuidv4(),
        title: template.title,
        description: template.description,
        allocationPercentage: adjustedAllocation,
        expectedReturnRange: {
          min: template.expectedReturnMin,
          max: template.expectedReturnMax
        },
        riskLevel: template.riskLevel,
        explanation: `${template.explanationTemplate} Based on your ${userProfile.riskTolerance} risk profile and ${userProfile.investmentHorizon}-term investment horizon, we recommend allocating ${adjustedAllocation}% of your portfolio to this strategy.`,
        actions: [{
          type: template.actionType,
          asset: template.asset,
          amount: allocationValue,
          details: `Allocate $${allocationValue.toFixed(2)} to ${template.asset}`
        }]
      };
    });

    // Filter out zero allocations
    const nonZeroRecommendations = recommendations.filter(rec => rec.allocationPercentage > 0);

    // Normalize allocations to ensure they sum to 100%
    const normalizedRecommendations = normalizeAllocations(nonZeroRecommendations);

    // Sort by allocation percentage (descending)
    normalizedRecommendations.sort((a, b) => b.allocationPercentage - a.allocationPercentage);

    return Either.right(normalizedRecommendations);
  } catch (error) {
    return Either.left(error instanceof Error ? error : new Error('Failed to generate recommendations'));
  }
};

// Helper function to get risk score
export const calculatePortfolioRiskScore = (recommendations: Recommendation[]): number => {
  const riskWeights = { low: 1, medium: 2, high: 3 };
  
  const weightedRiskScore = recommendations.reduce((score, rec) => {
    const weight = rec.allocationPercentage / 100;
    const riskValue = riskWeights[rec.riskLevel];
    return score + (weight * riskValue);
  }, 0);

  // Normalize to 0-100 scale
  return Math.round((weightedRiskScore - 1) * 50);
};

// Helper function to calculate expected portfolio return
export const calculateExpectedPortfolioReturn = (recommendations: Recommendation[]): {
  min: number;
  max: number;
} => {
  const weightedReturns = recommendations.reduce(
    (totals, rec) => {
      const weight = rec.allocationPercentage / 100;
      return {
        min: totals.min + (weight * rec.expectedReturnRange.min),
        max: totals.max + (weight * rec.expectedReturnRange.max)
      };
    },
    { min: 0, max: 0 }
  );

  return {
    min: Math.round(weightedReturns.min * 10) / 10,
    max: Math.round(weightedReturns.max * 10) / 10
  };
};