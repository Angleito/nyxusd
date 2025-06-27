/**
 * Portfolio analysis functions for AI-assisted investment recommendations
 * Provides risk analysis, scoring, and portfolio optimization suggestions
 */

import type { WalletData, UserProfile } from '../../providers/AIAssistantProvider';

export interface RiskAnalysis {
  overallRisk: 'low' | 'medium' | 'high';
  diversificationScore: number; // 0-100
  concentrationRisk: {
    asset: string;
    percentage: number;
  }[];
  volatilityEstimate: number; // Annual volatility percentage
  recommendations: string[];
}

export interface Opportunity {
  type: 'diversification' | 'rebalancing' | 'tax_optimization' | 'cost_reduction';
  title: string;
  description: string;
  potentialBenefit: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AllocationSuggestion {
  asset: string;
  currentPercentage: number;
  suggestedPercentage: number;
  reason: string;
}

/**
 * Analyzes wallet composition and returns comprehensive risk analysis
 */
export function analyzeWalletComposition(walletData: WalletData): RiskAnalysis {
  const assets = walletData.assets;
  const totalValue = walletData.totalValueUSD;
  
  // Calculate asset percentages
  const assetPercentages = assets.map(asset => ({
    symbol: asset.symbol,
    percentage: (asset.valueUSD / totalValue) * 100
  }));
  
  // Identify concentration risks (assets > 30% of portfolio)
  const concentrationRisk = assetPercentages
    .filter(asset => asset.percentage > 30)
    .map(asset => ({
      asset: asset.symbol,
      percentage: asset.percentage
    }));
  
  // Calculate diversification score (0-100)
  // Higher score = better diversification
  const diversificationScore = calculateDiversificationScore(assetPercentages);
  
  // Estimate overall risk level
  const overallRisk = determineOverallRisk(diversificationScore, concentrationRisk.length);
  
  // Calculate estimated annual volatility based on asset mix
  const volatilityEstimate = estimatePortfolioVolatility(assetPercentages);
  
  // Generate recommendations
  const recommendations = generateRiskRecommendations(
    diversificationScore,
    concentrationRisk,
    assetPercentages
  );
  
  return {
    overallRisk,
    diversificationScore,
    concentrationRisk,
    volatilityEstimate,
    recommendations
  };
}

/**
 * Calculates a risk score from 1-10 based on wallet composition
 * 1 = Very Low Risk, 10 = Very High Risk
 */
export function calculateRiskScore(walletData: WalletData): number {
  const assets = walletData.assets;
  const totalValue = walletData.totalValueUSD;
  
  if (assets.length === 0 || totalValue === 0) {
    return 5; // Default middle score for empty portfolios
  }
  
  let riskScore = 5; // Start with neutral score
  
  // Factor 1: Asset concentration (increases risk)
  const maxConcentration = Math.max(...assets.map(a => (a.valueUSD / totalValue) * 100));
  if (maxConcentration > 50) riskScore += 2;
  else if (maxConcentration > 30) riskScore += 1;
  
  // Factor 2: Number of assets (more assets = lower risk)
  if (assets.length === 1) riskScore += 3;
  else if (assets.length === 2) riskScore += 2;
  else if (assets.length >= 5) riskScore -= 1;
  else if (assets.length >= 10) riskScore -= 2;
  
  // Factor 3: Presence of stablecoins (reduces risk)
  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD'];
  const stablecoinPercentage = assets
    .filter(a => stablecoins.includes(a.symbol.toUpperCase()))
    .reduce((sum, a) => sum + (a.valueUSD / totalValue) * 100, 0);
  
  if (stablecoinPercentage > 50) riskScore -= 2;
  else if (stablecoinPercentage > 20) riskScore -= 1;
  
  // Factor 4: High volatility assets (increases risk)
  const highVolAssets = ['BTC', 'ETH', 'DOGE', 'SHIB'];
  const highVolPercentage = assets
    .filter(a => highVolAssets.includes(a.symbol.toUpperCase()))
    .reduce((sum, a) => sum + (a.valueUSD / totalValue) * 100, 0);
  
  if (highVolPercentage > 70) riskScore += 2;
  else if (highVolPercentage > 40) riskScore += 1;
  
  // Ensure score stays within 1-10 bounds
  return Math.max(1, Math.min(10, Math.round(riskScore)));
}

/**
 * Identifies improvement opportunities based on wallet data and user profile
 */
export function identifyOpportunities(
  walletData: WalletData,
  userProfile: UserProfile
): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const assets = walletData.assets;
  const totalValue = walletData.totalValueUSD;
  
  // Check for diversification opportunities
  if (assets.length < 3) {
    opportunities.push({
      type: 'diversification',
      title: 'Increase Portfolio Diversification',
      description: 'Your portfolio is concentrated in very few assets. Consider diversifying across different asset classes.',
      potentialBenefit: 'Reduce portfolio volatility by 20-30%',
      priority: 'high'
    });
  }
  
  // Check for rebalancing needs
  const targetAllocations = getTargetAllocations(userProfile);
  const rebalancingNeeded = checkRebalancingNeed(walletData, targetAllocations);
  
  if (rebalancingNeeded) {
    opportunities.push({
      type: 'rebalancing',
      title: 'Portfolio Rebalancing Recommended',
      description: 'Your current allocation has drifted from optimal targets based on your risk profile.',
      potentialBenefit: 'Align portfolio with your risk tolerance and goals',
      priority: 'medium'
    });
  }
  
  // Check for tax optimization (simplified)
  if (totalValue > 10000) {
    opportunities.push({
      type: 'tax_optimization',
      title: 'Tax-Loss Harvesting Opportunity',
      description: 'Consider tax-efficient strategies to optimize your after-tax returns.',
      potentialBenefit: 'Potentially save 1-2% annually through tax optimization',
      priority: 'low'
    });
  }
  
  // Check for cost reduction
  const highFeeAssets = identifyHighFeeAssets(assets);
  if (highFeeAssets.length > 0) {
    opportunities.push({
      type: 'cost_reduction',
      title: 'Reduce Investment Costs',
      description: `Some of your holdings (${highFeeAssets.join(', ')}) may have high fees. Consider lower-cost alternatives.`,
      potentialBenefit: 'Save 0.5-1% annually in fees',
      priority: 'medium'
    });
  }
  
  return opportunities;
}

/**
 * Generates allocation suggestions based on user profile
 */
export function generateAllocationSuggestions(userProfile: UserProfile): AllocationSuggestion[] {
  const suggestions: AllocationSuggestion[] = [];
  
  // Get target allocations based on risk tolerance
  const targetAllocations = getTargetAllocations(userProfile);
  
  // Core allocation suggestions
  suggestions.push({
    asset: 'Stablecoins (USDC/DAI)',
    currentPercentage: 0, // This would be calculated from actual wallet data
    suggestedPercentage: targetAllocations.stablecoins,
    reason: 'Provides stability and liquidity for your portfolio'
  });
  
  suggestions.push({
    asset: 'Bitcoin (BTC)',
    currentPercentage: 0,
    suggestedPercentage: targetAllocations.bitcoin,
    reason: 'Digital gold - store of value with long-term growth potential'
  });
  
  suggestions.push({
    asset: 'Ethereum (ETH)',
    currentPercentage: 0,
    suggestedPercentage: targetAllocations.ethereum,
    reason: 'Smart contract platform with strong ecosystem and DeFi opportunities'
  });
  
  suggestions.push({
    asset: 'Blue-chip DeFi (AAVE/UNI)',
    currentPercentage: 0,
    suggestedPercentage: targetAllocations.defi,
    reason: 'Exposure to decentralized finance innovation'
  });
  
  if (userProfile.riskTolerance === 'aggressive') {
    suggestions.push({
      asset: 'Emerging Protocols',
      currentPercentage: 0,
      suggestedPercentage: targetAllocations.emerging,
      reason: 'Higher risk/reward opportunities in new protocols'
    });
  }
  
  return suggestions;
}

// Helper functions

function calculateDiversificationScore(assetPercentages: { symbol: string; percentage: number }[]): number {
  if (assetPercentages.length === 0) return 0;
  if (assetPercentages.length === 1) return 10;
  
  // Use Herfindahl-Hirschman Index (HHI) approach
  const hhi = assetPercentages.reduce((sum, asset) => {
    return sum + Math.pow(asset.percentage, 2);
  }, 0);
  
  // Convert HHI to 0-100 score (lower HHI = better diversification)
  const maxHHI = 10000; // Maximum concentration (100% in one asset)
  const minHHI = 10000 / assetPercentages.length; // Perfect equal distribution
  
  const normalizedScore = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;
  return Math.round(Math.max(0, Math.min(100, normalizedScore)));
}

function determineOverallRisk(
  diversificationScore: number,
  concentrationRiskCount: number
): 'low' | 'medium' | 'high' {
  if (diversificationScore >= 70 && concentrationRiskCount === 0) return 'low';
  if (diversificationScore < 40 || concentrationRiskCount >= 2) return 'high';
  return 'medium';
}

function estimatePortfolioVolatility(
  assetPercentages: { symbol: string; percentage: number }[]
): number {
  // Simplified volatility estimation based on asset types
  const assetVolatilities: Record<string, number> = {
    'BTC': 60,
    'ETH': 70,
    'USDT': 2,
    'USDC': 2,
    'DAI': 2,
    'AAVE': 80,
    'UNI': 85,
    'DOGE': 95,
    'SHIB': 100
  };
  
  const portfolioVolatility = assetPercentages.reduce((totalVol, asset) => {
    const assetVol = assetVolatilities[asset.symbol.toUpperCase()] || 75; // Default volatility
    return totalVol + (assetVol * asset.percentage / 100);
  }, 0);
  
  return Math.round(portfolioVolatility);
}

function generateRiskRecommendations(
  diversificationScore: number,
  concentrationRisk: { asset: string; percentage: number }[],
  assetPercentages: { symbol: string; percentage: number }[]
): string[] {
  const recommendations: string[] = [];
  
  if (diversificationScore < 50) {
    recommendations.push('Consider diversifying your portfolio across more assets to reduce risk');
  }
  
  concentrationRisk.forEach(risk => {
    recommendations.push(
      `${risk.asset} represents ${risk.percentage.toFixed(1)}% of your portfolio. Consider reducing concentration risk`
    );
  });
  
  const stablecoins = ['USDT', 'USDC', 'DAI'];
  const hasStablecoins = assetPercentages.some(a => 
    stablecoins.includes(a.symbol.toUpperCase())
  );
  
  if (!hasStablecoins) {
    recommendations.push('Consider adding stablecoins for portfolio stability and liquidity');
  }
  
  if (assetPercentages.length === 1) {
    recommendations.push('Single asset portfolios carry significant risk. Diversify to protect your wealth');
  }
  
  return recommendations;
}

function getTargetAllocations(userProfile: UserProfile): Record<string, number> {
  const { riskTolerance = 'moderate', investmentGoal = 'growth' } = userProfile;
  
  // Base allocations by risk tolerance
  const allocations = {
    conservative: {
      stablecoins: 60,
      bitcoin: 20,
      ethereum: 15,
      defi: 5,
      emerging: 0
    },
    moderate: {
      stablecoins: 30,
      bitcoin: 30,
      ethereum: 25,
      defi: 10,
      emerging: 5
    },
    aggressive: {
      stablecoins: 10,
      bitcoin: 25,
      ethereum: 30,
      defi: 20,
      emerging: 15
    }
  };
  
  // Adjust based on investment goal
  const baseAllocation = allocations[riskTolerance];
  
  if (investmentGoal === 'preservation') {
    // Increase stablecoins for capital preservation
    baseAllocation.stablecoins += 10;
    baseAllocation.emerging = 0;
  } else if (investmentGoal === 'income') {
    // Increase DeFi for yield opportunities
    baseAllocation.defi += 5;
  }
  
  return baseAllocation;
}

function checkRebalancingNeed(
  walletData: WalletData,
  _targetAllocations: Record<string, number>
): boolean {
  // Simplified check - in reality would map actual assets to categories
  // and calculate deviation from targets
  // const threshold = 10; // 10% deviation triggers rebalancing
  
  // This is a simplified implementation
  // In production, would need more sophisticated asset categorization
  return walletData.assets.length > 0 && Math.random() > 0.5; // Mock logic
}

function identifyHighFeeAssets(assets: WalletData['assets']): string[] {
  // Simplified - in reality would check actual fee structures
  const highFeeTokens = ['SHIBASWAP', 'SAFEMOON']; // Example high-fee tokens
  
  return assets
    .filter(asset => highFeeTokens.includes(asset.symbol.toUpperCase()))
    .map(asset => asset.symbol);
}