import type { VercelRequest, VercelResponse } from '@vercel/node';
import blockchainService from '../../src/services/blockchainDataService';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Import the existing price detection and fetching functions from chat.ts
// For this enhanced version, we'll include blockchain data detection

// Function to detect blockchain data queries
function detectBlockchainQuery(message: string): {
  type: string | null;
  params: any;
} {
  const lowerMessage = message.toLowerCase();
  
  // Wallet balance query
  if (lowerMessage.includes('balance') || lowerMessage.includes('wallet') || lowerMessage.includes('holdings')) {
    // Extract Ethereum address if present (0x...)
    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
    // Extract ENS name if present
    const ensMatch = message.match(/([a-zA-Z0-9-]+\.eth)/);
    
    if (addressMatch || ensMatch) {
      return {
        type: 'balance',
        params: {
          address: addressMatch?.[0],
          ens: ensMatch?.[0],
        }
      };
    }
  }
  
  // Gas price query
  if (lowerMessage.includes('gas') && (lowerMessage.includes('price') || lowerMessage.includes('fee') || lowerMessage.includes('cost'))) {
    // Check for specific network mentions
    let network = 'ethereum';
    if (lowerMessage.includes('polygon') || lowerMessage.includes('matic')) network = 'polygon';
    if (lowerMessage.includes('arbitrum') || lowerMessage.includes('arb')) network = 'arbitrum';
    if (lowerMessage.includes('optimism') || lowerMessage.includes('op')) network = 'optimism';
    if (lowerMessage.includes('base')) network = 'base';
    if (lowerMessage.includes('avalanche') || lowerMessage.includes('avax')) network = 'avalanche';
    if (lowerMessage.includes('bnb') || lowerMessage.includes('bsc')) network = 'bnb';
    
    return {
      type: 'gas',
      params: { network }
    };
  }
  
  // Transaction query
  if (lowerMessage.includes('transaction') || lowerMessage.includes('tx')) {
    const txMatch = message.match(/0x[a-fA-F0-9]{64}/);
    if (txMatch) {
      return {
        type: 'transaction',
        params: { txHash: txMatch[0] }
      };
    }
  }
  
  // Network stats query
  if (lowerMessage.includes('network') && (lowerMessage.includes('stats') || lowerMessage.includes('status') || lowerMessage.includes('info'))) {
    let network = 'ethereum';
    if (lowerMessage.includes('polygon') || lowerMessage.includes('matic')) network = 'polygon';
    if (lowerMessage.includes('arbitrum') || lowerMessage.includes('arb')) network = 'arbitrum';
    if (lowerMessage.includes('optimism') || lowerMessage.includes('op')) network = 'optimism';
    if (lowerMessage.includes('base')) network = 'base';
    
    return {
      type: 'network',
      params: { network }
    };
  }
  
  // Token info query
  if (lowerMessage.includes('token') && (lowerMessage.includes('info') || lowerMessage.includes('details') || lowerMessage.includes('contract'))) {
    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      return {
        type: 'token',
        params: { address: addressMatch[0] }
      };
    }
  }
  
  // DeFi positions query
  if ((lowerMessage.includes('defi') || lowerMessage.includes('position') || lowerMessage.includes('lending') || lowerMessage.includes('liquidity')) && 
      (lowerMessage.includes('position') || lowerMessage.includes('balance') || lowerMessage.includes('portfolio'))) {
    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
    const ensMatch = message.match(/([a-zA-Z0-9-]+\.eth)/);
    
    if (addressMatch || ensMatch) {
      return {
        type: 'defi',
        params: {
          address: addressMatch?.[0],
          ens: ensMatch?.[0],
        }
      };
    }
  }
  
  return { type: null, params: {} };
}

// Fetch blockchain data based on query type
async function fetchBlockchainData(queryType: string, params: any): Promise<any> {
  try {
    switch (queryType) {
      case 'balance':
        if (params.ens) {
          // Resolve ENS first
          const ensData = await blockchainService.resolveENS(params.ens);
          if (ensData?.address) {
            params.address = ensData.address;
          }
        }
        if (params.address) {
          // Get multi-chain balance
          const balances = await blockchainService.getMultiChainBalance(params.address);
          return {
            type: 'balance',
            address: params.address,
            ens: params.ens,
            balances
          };
        }
        break;
        
      case 'gas':
        const gasData = await blockchainService.getGasPrice(params.network);
        return {
          type: 'gas',
          network: params.network,
          ...gasData
        };
        
      case 'transaction':
        const txData = await blockchainService.getTransaction(params.txHash, params.network || 'ethereum');
        return {
          type: 'transaction',
          ...txData
        };
        
      case 'network':
        const networkStats = await blockchainService.getNetworkStats(params.network);
        return {
          type: 'network',
          ...networkStats
        };
        
      case 'token':
        const tokenInfo = await blockchainService.getTokenInfo(params.address, params.network || 'ethereum');
        return {
          type: 'token',
          ...tokenInfo
        };
        
      case 'defi':
        if (params.ens) {
          // Resolve ENS first
          const ensData = await blockchainService.resolveENS(params.ens);
          if (ensData?.address) {
            params.address = ensData.address;
          }
        }
        if (params.address) {
          const positions = await blockchainService.getDefiPositions(params.address, params.network || 'ethereum');
          return {
            type: 'defi',
            address: params.address,
            positions
          };
        }
        break;
    }
  } catch (error) {
    console.error('Error fetching blockchain data:', error);
  }
  
  return null;
}

// Format blockchain data for AI context
function formatBlockchainContext(data: any): string {
  if (!data) return '';
  
  let context = '\n\nReal-time blockchain data:\n';
  
  switch (data.type) {
    case 'balance':
      context += `Wallet ${data.ens ? `(${data.ens})` : ''} ${data.address}:\n`;
      for (const [network, balance] of Object.entries(data.balances)) {
        const b = balance as any;
        context += `${network}: ${b.native} ${blockchainService.NETWORKS[network as keyof typeof blockchainService.NETWORKS]?.nativeCurrency || 'ETH'}`;
        if (b.tokens?.length > 0) {
          context += ` + ${b.tokens.length} tokens (${b.tokens.map((t: any) => `${t.balance} ${t.symbol}`).join(', ')})`;
        }
        context += '\n';
      }
      break;
      
    case 'gas':
      context += `Gas prices on ${data.network}:\n`;
      context += `Standard: ${data.gasPrice} gwei\n`;
      if (data.maxFeePerGas) {
        context += `Max Fee: ${data.maxFeePerGas} gwei\n`;
        context += `Priority Fee: ${data.maxPriorityFeePerGas} gwei\n`;
      }
      break;
      
    case 'transaction':
      context += `Transaction ${data.transaction?.hash}:\n`;
      context += `Status: ${data.status}\n`;
      context += `From: ${data.transaction?.from}\n`;
      context += `To: ${data.transaction?.to}\n`;
      context += `Value: ${data.transaction?.value ? ethers.formatEther(data.transaction.value) : '0'} ETH\n`;
      if (data.gasUsed) {
        context += `Gas Used: ${data.gasUsed} ETH\n`;
      }
      break;
      
    case 'network':
      context += `${data.network} Network Stats:\n`;
      context += `Chain ID: ${data.chainId}\n`;
      context += `Block Number: ${data.blockNumber}\n`;
      context += `Gas Price: ${data.gasPrice} gwei\n`;
      if (data.baseFee) {
        context += `Base Fee: ${data.baseFee} gwei\n`;
      }
      break;
      
    case 'token':
      context += `Token Information:\n`;
      context += `Name: ${data.name}\n`;
      context += `Symbol: ${data.symbol}\n`;
      context += `Decimals: ${data.decimals}\n`;
      context += `Total Supply: ${data.totalSupply}\n`;
      context += `Contract: ${data.address}\n`;
      break;
      
    case 'defi':
      context += `DeFi Positions for ${data.address}:\n`;
      if (data.positions?.length > 0) {
        data.positions.forEach((p: any) => {
          context += `${p.protocol} (${p.type}): ${JSON.stringify(p)}\n`;
        });
      } else {
        context += 'No active DeFi positions found\n';
      }
      break;
  }
  
  context += '\nUse this blockchain data to provide accurate, real-time information in your response.';
  return context;
}

// Import ethers for formatting
import { ethers } from 'ethers';

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
      console.error('OpenRouter API key not found in environment variables');
      return res.status(500).json({
        error: "Configuration error",
        message: "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
        debug: process.env.NODE_ENV === 'development' ? 'Key not found' : undefined
      });
    }

    // Check for blockchain data queries
    const blockchainQuery = detectBlockchainQuery(message);
    let blockchainData = null;
    let blockchainContext = "";

    if (blockchainQuery.type) {
      console.log('Detected blockchain query:', blockchainQuery);
      blockchainData = await fetchBlockchainData(blockchainQuery.type, blockchainQuery.params);
      
      if (blockchainData) {
        blockchainContext = formatBlockchainContext(blockchainData);
      }
    }

    // Also check for crypto price queries (import from original chat.ts logic)
    // This would include the detectPriceQuery and fetchCryptoPrices functions
    // For brevity, assuming they're imported or duplicated here
    
    // Build context-aware prompt
    let systemPrompt = "You are NYX, an AI assistant specialized in cryptocurrency, DeFi, and blockchain technology. ";
    systemPrompt += "You have access to real-time blockchain data via Alchemy and Infura APIs. ";
    systemPrompt += "You can check wallet balances, gas prices, transaction status, network stats, token information, and DeFi positions. ";
    systemPrompt += "Always provide accurate, real-time data when available.";
    
    if (blockchainContext) {
      systemPrompt += blockchainContext;
    }
    
    if (context?.userProfile) {
      systemPrompt += `\n\nThe user has ${context.userProfile.experience || 'some'} experience in crypto, ${context.userProfile.riskTolerance || 'moderate'} risk tolerance.`;
      if (context.userProfile.investmentGoals?.length) {
        systemPrompt += ` Their goals include: ${context.userProfile.investmentGoals.join(', ')}.`;
      }
    }

    if (context?.walletData?.holdings) {
      systemPrompt += `\n\nUser's portfolio includes: ${context.walletData.holdings.map((h: any) => `${h.amount} ${h.symbol}`).join(', ')}.`;
    }

    console.log('Calling OpenRouter API with message:', message);
    if (blockchainData) {
      console.log('Including blockchain data:', blockchainQuery.type);
    }

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nyxusd-git-main-angleitos-projects.vercel.app',
        'X-Title': 'NYX USD Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      let errorMessage = 'Failed to get AI response';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // Use text as-is if not JSON
      }
      
      return res.status(500).json({
        error: "AI service error",
        message: errorMessage,
        status: response.status,
        debug: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
    }

    const data = await response.json();
    console.log('OpenRouter response received');
    
    const aiResponse = data.choices?.[0]?.message?.content || data.message || "I couldn't generate a response. Please try again.";

    // Structure response
    const toolsUsed = [];
    if (blockchainData) {
      switch (blockchainData.type) {
        case 'balance':
          toolsUsed.push('alchemy-balance-api', 'infura-balance-api');
          break;
        case 'gas':
          toolsUsed.push('alchemy-gas-api');
          break;
        case 'transaction':
          toolsUsed.push('alchemy-tx-api');
          break;
        case 'network':
          toolsUsed.push('alchemy-network-api', 'infura-network-api');
          break;
        case 'token':
          toolsUsed.push('alchemy-token-api');
          break;
        case 'defi':
          toolsUsed.push('alchemy-defi-api');
          break;
      }
    }

    const result = {
      message: aiResponse,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : enableCryptoTools ? ['analysis'] : undefined,
      blockchainData: blockchainData || undefined,
      recommendations: context?.userProfile ? [
        "Monitor gas prices across different networks for optimal transaction timing",
        "Track your DeFi positions regularly for liquidation risks",
        "Consider using Layer 2 solutions for lower transaction costs",
        "Diversify across multiple chains to reduce network-specific risks"
      ].filter(() => Math.random() > 0.5) : undefined,
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error in enhanced blockchain chat endpoint:", error.message, error.stack);

    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to process your request. Please try again.",
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}