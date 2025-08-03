import { ethers } from 'ethers';

// Environment variables
const ALCHEMY_API_KEY = process.env.VITE_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY;
const INFURA_API_KEY = process.env.VITE_INFURA_API_KEY || process.env.INFURA_API_KEY;

// Network configurations
export const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    alchemy: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    infura: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: 'https://etherscan.io',
    nativeCurrency: 'ETH',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    alchemy: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    infura: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    alchemy: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    infura: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: 'https://arbiscan.io',
    nativeCurrency: 'ETH',
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    alchemy: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    infura: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: 'https://optimistic.etherscan.io',
    nativeCurrency: 'ETH',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    alchemy: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    infura: null, // Infura doesn't support Base yet
    explorer: 'https://basescan.org',
    nativeCurrency: 'ETH',
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    alchemy: null, // Alchemy doesn't support Avalanche
    infura: `https://avalanche-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: 'https://snowtrace.io',
    nativeCurrency: 'AVAX',
  },
  bnb: {
    chainId: 56,
    name: 'BNB Smart Chain',
    alchemy: null,
    infura: `https://bsc-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: 'https://bscscan.com',
    nativeCurrency: 'BNB',
  },
};

// Token contract addresses for common tokens
export const TOKEN_ADDRESSES = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    SUSHI: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    BAL: '0xba100000625a3754423978a60c9317c58a424e3D',
    GRT: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
    ENS: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    LDO: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    RPL: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
    FXS: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
    FRAX: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    rETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    cbETH: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    WBTC: '0x1bfd67037b42cf73acF2047067bd4F2C47D9BfD6',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
    UNI: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
    AAVE: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
    CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    SUSHI: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
    BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
    GRT: '0x5fe2B58c013d7601147DcdD68C143A77499f5531',
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    LINK: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    UNI: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    GMX: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    ARB: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    MAGIC: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
    RDNT: '0x3082CC23568eA640225c2467653dB90e9250AaA0',
    DPX: '0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55',
    JONES: '0x10393c20975cF177a3513071bC110f7962CD67da',
    VSTA: '0xa684cd057951541187f288294a1e1C2646aA2d24',
    PLS: '0x51318B7D00db7ACc4026C88c3952B66278B6A67F',
    GNS: '0x18c11FD286C5EC11c3b683Caa813B77f5163A122',
  },
  optimism: {
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WETH: '0x4200000000000000000000000000000000000006',
    WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    LINK: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
    UNI: '0x6fd9d7AD17242c41f7131d257212c54A0e816691',
    SNX: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
    OP: '0x4200000000000000000000000000000000000042',
    VELO: '0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db',
    PERP: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
    KWENTA: '0x920Cf626a271321C151D027030D5d08aF699456b',
    LYRA: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    THALES: '0x217D47011b23BB961eB6D93cA9945B7501a5BB11',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    WETH: '0x4200000000000000000000000000000000000006',
    cbETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    BRETT: '0x532f27101965dd16442E59d40670FaF3eBB142eD',
    DEGEN: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    TOSHI: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4',
  },
};

// DeFi Protocol addresses
export const DEFI_PROTOCOLS = {
  ethereum: {
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    sushiswapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    aaveV3Pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    aaveV2Pool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    compoundComptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    makerDssDaiJoin: '0x9759A6Ac90977b93B58547b4A71c78317f391A28',
    curveRegistry: '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    yearnRegistry: '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804',
    convexBooster: '0xF403C135812408BFbE8713b5A23a04b3D48AAE31',
    lidoStETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    rocketPoolStorage: '0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46',
    fraxMinter: '0xbAFA44EFE7901E04E39Dad13167D089C559c1138',
  },
  polygon: {
    quickswapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    aaveV3Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    aaveV2Pool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    curveRegistry: '0x094d12e5b541784701FD8d65F11fc0598FBC6332',
    beefyVaultRegistry: '0x820246a13b2d43c8EA1afC7FdD1e7334e4Cb14E5',
  },
  arbitrum: {
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    gmxRouter: '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064',
    gmxVault: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
    aaveV3Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    curveRegistry: '0x445FE580eF8d70FF569aB36e80c647af338db351',
    dopexSsovV3: '0x2C9C1E9b4BDf6Bf9CB59C77e0e8C0892cE3A9d5f',
    radiantLending: '0xF4B1486DD74D07706052A33d31d7c0AAFD0659E1',
    caipirinhaSwap: '0x24E6b27a7d3D86cCc0a6Bd8e3daE0DF96a86aEB3',
    velodromeRouter: '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858',
  },
  optimism: {
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    velodromeRouter: '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858',
    aaveV3Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    synthetixCore: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
    perpV2ClearingHouse: '0x82ac2CE43e33683c58BE4cDc40975E73aA50f459',
    kwentaFactory: '0x8234F990b149Ae59416dc260305E565e5DAfEb54',
    lyraRegistry: '0xC8fE2440744dcd733246A4dB14093664DEFD5A53',
    thalesAMM: '0x5ae7454827D83526261F3871C1029792644Ef1B1',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    curveRegistry: '0x2db0E83599a91b508Ac268a6197b8B14F5e72840',
  },
  base: {
    uniswapV3Router: '0x2626664c2603336E57B271c5C0b26F421741e481',
    aerodrome: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
    baseswapRouter: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
    moonwell: '0xfBb21d0380beA3312B33c4353c8936a0F13EF26C',
    seamlessProtocol: '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7',
  },
};

// Provider management
class ProviderManager {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  getProvider(network: string, preferAlchemy: boolean = true): ethers.JsonRpcProvider | null {
    const key = `${network}-${preferAlchemy ? 'alchemy' : 'infura'}`;
    
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
    if (!networkConfig) return null;

    let rpcUrl: string | null = null;
    
    if (preferAlchemy && networkConfig.alchemy && ALCHEMY_API_KEY) {
      rpcUrl = networkConfig.alchemy;
    } else if (!preferAlchemy && networkConfig.infura && INFURA_API_KEY) {
      rpcUrl = networkConfig.infura;
    } else if (networkConfig.alchemy && ALCHEMY_API_KEY) {
      rpcUrl = networkConfig.alchemy;
    } else if (networkConfig.infura && INFURA_API_KEY) {
      rpcUrl = networkConfig.infura;
    }

    if (!rpcUrl) return null;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.providers.set(key, provider);
    return provider;
  }

  getBestProvider(network: string): ethers.JsonRpcProvider | null {
    // Try Alchemy first, then Infura
    return this.getProvider(network, true) || this.getProvider(network, false);
  }
}

const providerManager = new ProviderManager();

// ERC20 ABI for token operations
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// Blockchain data fetching functions
export async function getWalletBalance(
  address: string,
  network: string = 'ethereum'
): Promise<{ native: string; tokens: any[] } | null> {
  try {
    const provider = providerManager.getBestProvider(network);
    if (!provider) {
      console.error(`No provider available for ${network}`);
      return null;
    }

    // Get native balance
    const nativeBalance = await provider.getBalance(address);
    const nativeBalanceEth = ethers.formatEther(nativeBalance);

    // Get token balances
    const tokenAddresses = TOKEN_ADDRESSES[network as keyof typeof TOKEN_ADDRESSES] || {};
    const tokenBalances = [];

    for (const [symbol, tokenAddress] of Object.entries(tokenAddresses)) {
      try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        const formattedBalance = ethers.formatUnits(balance, decimals);
        
        if (parseFloat(formattedBalance) > 0) {
          tokenBalances.push({
            symbol,
            address: tokenAddress,
            balance: formattedBalance,
            decimals: Number(decimals),
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol} balance:`, error);
      }
    }

    return {
      native: nativeBalanceEth,
      tokens: tokenBalances,
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
}

export async function getGasPrice(network: string = 'ethereum'): Promise<any> {
  try {
    const provider = providerManager.getBestProvider(network);
    if (!provider) {
      console.error(`No provider available for ${network}`);
      return null;
    }

    const feeData = await provider.getFeeData();
    
    return {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
    };
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return null;
  }
}

export async function getBlockNumber(network: string = 'ethereum'): Promise<number | null> {
  try {
    const provider = providerManager.getBestProvider(network);
    if (!provider) {
      console.error(`No provider available for ${network}`);
      return null;
    }

    return await provider.getBlockNumber();
  } catch (error) {
    console.error('Error fetching block number:', error);
    return null;
  }
}

export async function getTransaction(
  txHash: string,
  network: string = 'ethereum'
): Promise<any> {
  try {
    const provider = providerManager.getBestProvider(network);
    if (!provider) {
      console.error(`No provider available for ${network}`);
      return null;
    }

    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
      transaction: tx,
      receipt: receipt,
      status: receipt?.status === 1 ? 'success' : 'failed',
      gasUsed: receipt ? ethers.formatUnits(receipt.gasUsed * receipt.gasPrice, 'ether') : null,
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

export async function getTokenInfo(
  tokenAddress: string,
  network: string = 'ethereum'
): Promise<any> {
  try {
    const provider = providerManager.getBestProvider(network);
    if (!provider) {
      console.error(`No provider available for ${network}`);
      return null;
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      address: tokenAddress,
      network,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

export async function getNetworkStats(network: string = 'ethereum'): Promise<any> {
  try {
    const provider = providerManager.getBestProvider(network);
    if (!provider) {
      console.error(`No provider available for ${network}`);
      return null;
    }

    const [blockNumber, gasPrice, block] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData(),
      provider.getBlock('latest'),
    ]);
    
    return {
      network: NETWORKS[network as keyof typeof NETWORKS]?.name || network,
      chainId: NETWORKS[network as keyof typeof NETWORKS]?.chainId,
      blockNumber,
      blockTime: block?.timestamp,
      gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
      baseFee: block?.baseFeePerGas ? ethers.formatUnits(block.baseFeePerGas, 'gwei') : null,
      nativeCurrency: NETWORKS[network as keyof typeof NETWORKS]?.nativeCurrency,
    };
  } catch (error) {
    console.error('Error fetching network stats:', error);
    return null;
  }
}

// ENS Resolution
export async function resolveENS(
  ensName: string
): Promise<{ address: string | null; avatar: string | null } | null> {
  try {
    const provider = providerManager.getBestProvider('ethereum');
    if (!provider) {
      console.error('No Ethereum provider available');
      return null;
    }

    const resolver = await provider.getResolver(ensName);
    if (!resolver) return null;

    const [address, avatar] = await Promise.all([
      resolver.getAddress(),
      resolver.getText('avatar').catch(() => null),
    ]);

    return { address, avatar };
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return null;
  }
}

// Get multiple network balances
export async function getMultiChainBalance(address: string): Promise<any> {
  const networks = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'];
  const balances: any = {};

  await Promise.all(
    networks.map(async (network) => {
      const balance = await getWalletBalance(address, network);
      if (balance) {
        balances[network] = balance;
      }
    })
  );

  return balances;
}

// Get DeFi positions (simplified - would need protocol-specific integrations)
export async function getDefiPositions(
  address: string,
  network: string = 'ethereum'
): Promise<any> {
  // This is a simplified version. In production, you'd integrate with specific protocols
  const positions = [];
  
  // Example: Check AAVE positions
  if (DEFI_PROTOCOLS[network as keyof typeof DEFI_PROTOCOLS]?.aaveV3Pool) {
    // Would need AAVE-specific ABI and logic here
    positions.push({
      protocol: 'AAVE V3',
      type: 'lending',
      // ... position details
    });
  }

  // Example: Check Uniswap positions
  if (DEFI_PROTOCOLS[network as keyof typeof DEFI_PROTOCOLS]?.uniswapV3Router) {
    // Would need Uniswap-specific ABI and logic here
    positions.push({
      protocol: 'Uniswap V3',
      type: 'liquidity',
      // ... position details
    });
  }

  return positions;
}

// Export all functions
export default {
  getWalletBalance,
  getGasPrice,
  getBlockNumber,
  getTransaction,
  getTokenInfo,
  getNetworkStats,
  resolveENS,
  getMultiChainBalance,
  getDefiPositions,
  NETWORKS,
  TOKEN_ADDRESSES,
  DEFI_PROTOCOLS,
};