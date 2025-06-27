/**
 * Chainlink Feed Configurations
 *
 * Comprehensive configuration for Chainlink price feeds across
 * multiple networks with real production addresses
 */

import {
  ChainlinkFeedAddresses,
  ChainlinkNetworkConfig,
} from "../types/chainlink-types";

/**
 * Chainlink feed addresses by network
 * These are real production addresses from Chainlink docs
 */
export const CHAINLINK_FEED_ADDRESSES: ChainlinkFeedAddresses = {
  ethereum: {
    "ETH-USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    "BTC-USD": "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
    "LINK-USD": "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
    "UNI-USD": "0x553303d460EE0afb37EdFF9bE42922D8FF63220e",
    "AAVE-USD": "0x547a514d5e3769680Ce22B2361c10Ea13e3E2885",
    "COMP-USD": "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
    "CRV-USD": "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
    "MKR-USD": "0xec1D1B3b0443256cc3860e24a46F108e699484Aa",
    "SNX-USD": "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
    "YFI-USD": "0xA027702dbb89fbd58938e4324ac03B58d812b0e1",
    "USDC-USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
    "USDT-USD": "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
    "DAI-USD": "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
    "FRAX-USD": "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
  },
  polygon: {
    "ETH-USD": "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    "BTC-USD": "0xc907E116054Ad103354f2D350FD2514433D57F6f",
    "LINK-USD": "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665",
    "MATIC-USD": "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    "AAVE-USD": "0x72484B12719E23115761D5DA1646945632979bB6",
    "USDC-USD": "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
    "USDT-USD": "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
    "DAI-USD": "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D",
  },
  arbitrum: {
    "ETH-USD": "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    "BTC-USD": "0x6ce185860a4963106506C203335A2910413708e9",
    "LINK-USD": "0x86E53CF1B870786351Da77A57575e79CB55812CB",
    "UNI-USD": "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
    "USDC-USD": "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    "USDT-USD": "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
    "DAI-USD": "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
  },
  optimism: {
    "ETH-USD": "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
    "BTC-USD": "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593",
    "LINK-USD": "0xCc232dcFAAE6354cE191Bd574108c1aD03f86450",
    "USDC-USD": "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
    "USDT-USD": "0xECef79E109e997bCA29c1c0897ec9d7b03647F5E",
    "DAI-USD": "0x8dBa75e83DA73cc766A7e5a0ee71F656BAb470d6",
  },
  bsc: {
    "ETH-USD": "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    "BTC-USD": "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
    "LINK-USD": "0xca236E327F629f9Fc2c30A4E95775EbF0B89fac8",
    "BNB-USD": "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
    "USDC-USD": "0x51597f405303C4377E36123cBc172b13269EA163",
    "USDT-USD": "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    "DAI-USD": "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
  },
  avalanche: {
    "ETH-USD": "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
    "BTC-USD": "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
    "LINK-USD": "0x49ccd9ca821EfEab2b98c60dC60F518E765EDe9a",
    "AVAX-USD": "0x0A77230d17318075983913bC2145DB16C7366156",
    "USDC-USD": "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
    "USDT-USD": "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
    "DAI-USD": "0x51D7180edA2260cc4F6e4EebB82FEF5c3c2B8300",
  },
};

/**
 * Network configurations
 */
export const CHAINLINK_NETWORKS: Record<string, ChainlinkNetworkConfig> = {
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://etherscan.io",
    isTestnet: false,
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    isTestnet: false,
  },
  arbitrum: {
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    isTestnet: false,
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    isTestnet: false,
  },
  bsc: {
    name: "Binance Smart Chain",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    isTestnet: false,
  },
  avalanche: {
    name: "Avalanche C-Chain",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    isTestnet: false,
  },
};

/**
 * Testnet configurations for development
 */
export const CHAINLINK_TESTNETS: Record<string, ChainlinkNetworkConfig> = {
  sepolia: {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/demo",
    explorerUrl: "https://sepolia.etherscan.io",
    isTestnet: true,
  },
  mumbai: {
    name: "Polygon Mumbai",
    chainId: 80001,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorerUrl: "https://mumbai.polygonscan.com",
    isTestnet: true,
  },
  arbitrumSepolia: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    isTestnet: true,
  },
};

/**
 * Feed metadata for configuration
 */
export const FEED_METADATA = {
  "ETH-USD": {
    decimals: 8,
    description: "ETH / USD",
    heartbeat: 3600, // 1 hour
    deviation: 0.5, // 0.5%
    priority: 10,
    category: "crypto",
  },
  "BTC-USD": {
    decimals: 8,
    description: "BTC / USD",
    heartbeat: 3600,
    deviation: 0.5,
    priority: 10,
    category: "crypto",
  },
  "LINK-USD": {
    decimals: 8,
    description: "LINK / USD",
    heartbeat: 3600,
    deviation: 1.0,
    priority: 8,
    category: "crypto",
  },
  "UNI-USD": {
    decimals: 8,
    description: "UNI / USD",
    heartbeat: 3600,
    deviation: 1.5,
    priority: 7,
    category: "crypto",
  },
  "USDC-USD": {
    decimals: 8,
    description: "USDC / USD",
    heartbeat: 86400, // 24 hours
    deviation: 0.1,
    priority: 9,
    category: "stablecoin",
  },
  "USDT-USD": {
    decimals: 8,
    description: "USDT / USD",
    heartbeat: 86400,
    deviation: 0.1,
    priority: 9,
    category: "stablecoin",
  },
  "DAI-USD": {
    decimals: 8,
    description: "DAI / USD",
    heartbeat: 86400,
    deviation: 0.1,
    priority: 9,
    category: "stablecoin",
  },
} as const;

/**
 * Default oracle configurations by asset category
 */
export const DEFAULT_ORACLE_CONFIGS = {
  crypto: {
    minConfidence: 95.0,
    maxStaleness: 3600, // 1 hour
    deviationThreshold: 10.0, // 10%
    circuitBreakerThreshold: 50.0, // 50%
  },
  stablecoin: {
    minConfidence: 99.0,
    maxStaleness: 86400, // 24 hours
    deviationThreshold: 2.0, // 2%
    circuitBreakerThreshold: 5.0, // 5%
  },
  commodity: {
    minConfidence: 98.0,
    maxStaleness: 7200, // 2 hours
    deviationThreshold: 15.0, // 15%
    circuitBreakerThreshold: 30.0, // 30%
  },
  forex: {
    minConfidence: 99.5,
    maxStaleness: 3600, // 1 hour
    deviationThreshold: 5.0, // 5%
    circuitBreakerThreshold: 20.0, // 20%
  },
} as const;

/**
 * Chainlink Functions DON IDs for different networks
 */
export const CHAINLINK_FUNCTIONS_DON_IDS = {
  ethereum: "fun-ethereum-mainnet-1",
  polygon: "fun-polygon-mainnet-1",
  arbitrum: "fun-arbitrum-mainnet-1",
  optimism: "fun-optimism-mainnet-1",
  bsc: "fun-bsc-mainnet-1",
  avalanche: "fun-avalanche-mainnet-1",

  // Testnets
  sepolia: "fun-ethereum-sepolia-1",
  mumbai: "fun-polygon-mumbai-1",
  arbitrumSepolia: "fun-arbitrum-sepolia-1",
} as const;

/**
 * Get feed address for a specific network and pair
 */
export const getFeedAddress = (
  network: string,
  feedId: string,
): string | undefined => {
  return CHAINLINK_FEED_ADDRESSES[network as keyof ChainlinkFeedAddresses]?.[
    feedId
  ];
};

/**
 * Get all supported feed IDs for a network
 */
export const getSupportedFeeds = (network: string): string[] => {
  const feeds =
    CHAINLINK_FEED_ADDRESSES[network as keyof ChainlinkFeedAddresses];
  return feeds ? Object.keys(feeds) : [];
};

/**
 * Get feed metadata
 */
export const getFeedMetadata = (feedId: string) => {
  return FEED_METADATA[feedId as keyof typeof FEED_METADATA];
};

/**
 * Get oracle configuration for asset category
 */
export const getOracleConfig = (
  category: keyof typeof DEFAULT_ORACLE_CONFIGS,
) => {
  return DEFAULT_ORACLE_CONFIGS[category];
};
