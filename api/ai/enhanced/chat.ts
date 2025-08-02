import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// CoinGecko API configuration
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Blockchain RPC configuration
const ALCHEMY_API_KEY = process.env.VITE_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY;
const INFURA_API_KEY = process.env.VITE_INFURA_API_KEY || process.env.INFURA_API_KEY;

// Extended mapping of symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'BITCOIN': 'bitcoin',
  'ETH': 'ethereum',
  'ETHEREUM': 'ethereum',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'SOL': 'solana',
  'SOLANA': 'solana',
  'ADA': 'cardano',
  'CARDANO': 'cardano',
  'DOT': 'polkadot',
  'POLKADOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'AVALANCHE': 'avalanche-2',
  'MATIC': 'matic-network',
  'POLYGON': 'matic-network',
  'ATOM': 'cosmos',
  'COSMOS': 'cosmos',
  'XRP': 'ripple',
  'RIPPLE': 'ripple',
  'BNB': 'binancecoin',
  'DOGE': 'dogecoin',
  'DOGECOIN': 'dogecoin',
  'SHIB': 'shiba-inu',
  'SHIBA': 'shiba-inu',
  'LTC': 'litecoin',
  'LITECOIN': 'litecoin',
  'TRX': 'tron',
  'TRON': 'tron',
  'NEAR': 'near',
  'APT': 'aptos',
  'APTOS': 'aptos',
  'ARB': 'arbitrum',
  'ARBITRUM': 'arbitrum',
  'OP': 'optimism',
  'OPTIMISM': 'optimism',
  'SUI': 'sui',
  'SEI': 'sei-network',
  'INJ': 'injective-protocol',
  'INJECTIVE': 'injective-protocol',
  'FTM': 'fantom',
  'FANTOM': 'fantom',
  'ALGO': 'algorand',
  'ALGORAND': 'algorand',
  'HBAR': 'hedera',
  'HEDERA': 'hedera',
  'VET': 'vechain',
  'VECHAIN': 'vechain',
  'FIL': 'filecoin',
  'FILECOIN': 'filecoin',
  'ICP': 'internet-computer',
  'AAVE': 'aave',
  'MKR': 'maker',
  'MAKER': 'maker',
  'COMP': 'compound-governance-token',
  'COMPOUND': 'compound-governance-token',
  'CRV': 'curve-dao-token',
  'CURVE': 'curve-dao-token',
  'SNX': 'synthetix',
  'SYNTHETIX': 'synthetix',
  'SUSHI': 'sushi',
  'YFI': 'yearn-finance',
  'YEARN': 'yearn-finance',
  'BAL': 'balancer',
  'BALANCER': 'balancer',
  '1INCH': '1inch',
  'GRT': 'the-graph',
  'GRAPH': 'the-graph',
  'ENS': 'ethereum-name-service',
  'LDO': 'lido-dao',
  'LIDO': 'lido-dao',
  'RPL': 'rocket-pool',
  'GMX': 'gmx',
  'PENDLE': 'pendle',
  'FRAX': 'frax',
  'FXS': 'frax-share',
  'CVX': 'convex-finance',
  'CONVEX': 'convex-finance',
  'STG': 'stargate-finance',
  'STARGATE': 'stargate-finance',
  'RDNT': 'radiant-capital',
  'RADIANT': 'radiant-capital',
  'VELO': 'velodrome-finance',
  'VELODROME': 'velodrome-finance',
  'PERP': 'perpetual-protocol',
  'DYDX': 'dydx-chain',
  'BLUR': 'blur',
  'IMX': 'immutable-x',
  'IMMUTABLE': 'immutable-x',
  'GALA': 'gala',
  'SAND': 'the-sandbox',
  'SANDBOX': 'the-sandbox',
  'MANA': 'decentraland',
  'DECENTRALAND': 'decentraland',
  'AXS': 'axie-infinity',
  'AXIE': 'axie-infinity',
  'FLOW': 'flow',
  'CHZ': 'chiliz',
  'CHILIZ': 'chiliz',
  'ENJ': 'enjincoin',
  'ENJIN': 'enjincoin',
  'THETA': 'theta-network',
  'ZIL': 'zilliqa',
  'ZILLIQA': 'zilliqa',
  'KAVA': 'kava',
  'ROSE': 'oasis-network',
  'OASIS': 'oasis-network',
  'CELO': 'celo',
  'ONE': 'harmony',
  'HARMONY': 'harmony',
  'LUNA': 'terra-luna-2',
  'LUNA2': 'terra-luna-2',
  'LUNC': 'terra-luna',
  'QNT': 'quant',
  'QUANT': 'quant',
  'CHR': 'chromia',
  'CHROMIA': 'chromia',
  'JASMY': 'jasmycoin',
  'GMT': 'stepn',
  'STEPN': 'stepn',
  'GST': 'green-satoshi-token',
  'APE': 'apecoin',
  'APECOIN': 'apecoin',
  'T': 'threshold',
  'THRESHOLD': 'threshold',
  'OSMO': 'osmosis',
  'OSMOSIS': 'osmosis',
  'JUNO': 'juno-network',
  'SCRT': 'secret',
  'SECRET': 'secret',
  'EVMOS': 'evmos',
  'KLAY': 'klaytn',
  'KLAYTN': 'klaytn',
  'ZK': 'zksync',
  'ZKSYNC': 'zksync',
  'METIS': 'metis',
  'BOBA': 'boba-network',
  'CANTO': 'canto',
  'KCS': 'kucoin-shares',
  'KUCOIN': 'kucoin-shares',
  'OKB': 'okb',
  'LEO': 'leo-token',
  'CRO': 'crypto-com-chain',
  'HT': 'huobi-token',
  'HUOBI': 'huobi-token',
  'KDA': 'kadena',
  'KADENA': 'kadena',
  'EOS': 'eos',
  'XTZ': 'tezos',
  'TEZOS': 'tezos',
  'NEO': 'neo',
  'WAVES': 'waves',
  'ZEC': 'zcash',
  'ZCASH': 'zcash',
  'XMR': 'monero',
  'MONERO': 'monero',
  'DASH': 'dash',
  'ETC': 'ethereum-classic',
  'XLM': 'stellar',
  'STELLAR': 'stellar',
  'BCH': 'bitcoin-cash',
  'BSV': 'bitcoin-sv',
  'MIOTA': 'iota',
  'IOTA': 'iota',
  'ZRX': '0x',
  'BAT': 'basic-attention-token',
  'ICX': 'icon',
  'ICON': 'icon',
  'OMG': 'omisego',
  'QTUM': 'qtum',
  'LSK': 'lisk',
  'LISK': 'lisk',
  'DCR': 'decred',
  'DECRED': 'decred',
  'NANO': 'nano',
  'SC': 'siacoin',
  'SIACOIN': 'siacoin',
  'DGB': 'digibyte',
  'DIGIBYTE': 'digibyte',
  'XVG': 'verge',
  'VERGE': 'verge',
  'BTT': 'bittorrent',
  'BITTORRENT': 'bittorrent',
  'HOT': 'holo',
  'HOLO': 'holo',
  'ONT': 'ontology',
  'ONTOLOGY': 'ontology',
  'ZEN': 'zencash',
  'HORIZEN': 'zencash',
  'RVN': 'ravencoin',
  'RAVENCOIN': 'ravencoin',
  'BTG': 'bitcoin-gold',
  'KMD': 'komodo',
  'KOMODO': 'komodo',
  'ANKR': 'ankr',
  'OCEAN': 'ocean-protocol',
  'REEF': 'reef',
  'DENT': 'dent',
  'CELR': 'celer-network',
  'CELER': 'celer-network',
  'IOTX': 'iotex',
  'IOTEX': 'iotex',
  'RLC': 'iexec-rlc',
  'IEXEC': 'iexec-rlc',
  'CTSI': 'cartesi',
  'CARTESI': 'cartesi',
  'AUDIO': 'audius',
  'AUDIUS': 'audius',
  'NKN': 'nkn',
  'OGN': 'origin-protocol',
  'ORIGIN': 'origin-protocol',
  'STORJ': 'storj',
  'POWR': 'power-ledger',
  'POWER': 'power-ledger',
  'ARPA': 'arpa',
  'UMA': 'uma',
  'BAND': 'band-protocol',
  'SRM': 'serum',
  'SERUM': 'serum',
  'RAY': 'raydium',
  'RAYDIUM': 'raydium',
  'ALPHA': 'alpha-finance',
  'CREAM': 'cream-finance',
  'RUNE': 'thorchain',
  'THORCHAIN': 'thorchain',
  'SKL': 'skale',
  'SKALE': 'skale',
  'BNT': 'bancor',
  'BANCOR': 'bancor',
  'REN': 'ren',
  'NMR': 'numeraire',
  'NUMERAIRE': 'numeraire',
  'KNC': 'kyber-network-crystal',
  'KYBER': 'kyber-network-crystal',
  'LRC': 'loopring',
  'LOOPRING': 'loopring',
  'KEEP': 'keep-network',
  'NU': 'nucypher',
  'NUCYPHER': 'nucypher',
  'DNT': 'district0x',
  'REP': 'augur',
  'AUGUR': 'augur',
  'MLN': 'melon',
  'MELON': 'melon',
  'GNO': 'gnosis',
  'GNOSIS': 'gnosis',
  'PAXG': 'pax-gold',
  'WBTC': 'wrapped-bitcoin',
  'RENBTC': 'renbtc',
  'STETH': 'staked-ether',
  'WSTETH': 'wrapped-steth',
  'RETH': 'rocket-pool-eth',
  'CBETH': 'coinbase-wrapped-staked-eth',
  'FRXETH': 'frax-ether',
  'SFRXETH': 'staked-frax-ether',
  'TUSD': 'true-usd',
  'BUSD': 'binance-usd',
  'GUSD': 'gemini-dollar',
  'GEMINI': 'gemini-dollar',
  'USDP': 'paxos-standard',
  'PAX': 'paxos-standard',
  'HUSD': 'husd',
  'SUSD': 'susd',
  'LUSD': 'liquity-usd',
  'LIQUITY': 'liquity-usd',
  'FRAX': 'frax',
  'FEI': 'fei-protocol',
  'TRIBE': 'tribe',
  'RAI': 'rai',
  'AMPL': 'ampleforth',
  'AMPLEFORTH': 'ampleforth',
  'RSR': 'reserve-rights',
  'RESERVE': 'reserve-rights',
  'XAU': 'tether-gold',
  'XAUT': 'tether-gold',
  'DPI': 'defipulse-index',
  'MVI': 'metaverse-index',
  'BED': 'bed-index',
  'DATA': 'data-economy-index',
  'PEPE': 'pepe',
  'WOJAK': 'wojak',
  'BONK': 'bonk',
  'WIF': 'dogwifhat',
  'DOGWIFHAT': 'dogwifhat',
  'FLOKI': 'floki',
  'BRETT': 'brett',
  'MEW': 'mew',
  'BOME': 'bome',
  'SLERF': 'slerf',
  'SMOLE': 'smole',
  'POPCAT': 'popcat',
  'PONKE': 'ponke',
  'MAGA': 'maga',
  'TRUMP': 'maga',
  'TURBO': 'turbo',
  'MOG': 'mog',
  'TOSHI': 'toshi',
  'COZY': 'cozy',
  'MICHI': 'michi',
  'WEN': 'wen',
  'MYRO': 'myro',
  'TREMP': 'tremp',
  'PORK': 'pork',
  'DUKO': 'duko',
  'BODEN': 'boden',
  'HOBBES': 'hobbes',
  'GIGA': 'giga',
  'KARRAT': 'karrat',
  'SNEK': 'snek',
  'RETARDIO': 'retardio',
  'TOOKER': 'tooker',
  'WOJAK2': 'wojak-2',
  'ANDYETH': 'andy-eth',
  'SKIBIDI': 'skibidi',
  'NEIRO': 'neiro',
  'HAMSTER': 'hamster-kombat',
  'DOGS': 'dogs',
  'NOT': 'notcoin',
  'NOTCOIN': 'notcoin',
  'TON': 'ton',
  'TONCOIN': 'ton',
  'JUP': 'jupiter',
  'JUPITER': 'jupiter',
  'W': 'wormhole',
  'WORMHOLE': 'wormhole',
  'PYTH': 'pyth-network',
  'JITO': 'jito',
  'JTO': 'jito',
  'ONDO': 'ondo',
  'ENA': 'ethena',
  'ETHENA': 'ethena',
  'USUAL': 'usual',
  'MODE': 'mode',
  'BLAST': 'blast',
  'STRK': 'starknet',
  'STARKNET': 'starknet',
  'TIA': 'celestia',
  'CELESTIA': 'celestia',
  'DYM': 'dymension',
  'DYMENSION': 'dymension',
  'ALT': 'altlayer',
  'ALTLAYER': 'altlayer',
  'MANTA': 'manta-network',
  'ZETACHAIN': 'zetachain',
  'ZETA': 'zetachain',
  'PIXEL': 'pixels',
  'PIXELS': 'pixels',
  'PORTAL': 'portal',
  'XAI': 'xai',
  'AI': 'ai',
  'RNDR': 'render',
  'RENDER': 'render',
  'FET': 'fetch-ai',
  'FETCH': 'fetch-ai',
  'AGIX': 'singularitynet',
  'SINGULARITYNET': 'singularitynet',
  'AKT': 'akash-network',
  'AKASH': 'akash-network',
  'TAO': 'bittensor',
  'BITTENSOR': 'bittensor',
  'WLD': 'worldcoin',
  'WORLDCOIN': 'worldcoin',
  'ARKM': 'arkham',
  'ARKHAM': 'arkham',
  'PRIME': 'prime',
  'BIGTIME': 'big-time',
  'NAKA': 'nakamoto-games',
  'NAKAMOTO': 'nakamoto-games',
  'SUPER': 'superfarm',
  'SUPERFARM': 'superfarm',
  'RONIN': 'ronin',
  'RON': 'ronin',
  'MAGIC': 'magic',
  'SPELL': 'spell-token',
  'TIME': 'time',
  'WONDERLAND': 'time',
  'KLIMA': 'klima-dao',
  'OHM': 'olympus',
  'OLYMPUS': 'olympus',
  'GOHM': 'governance-ohm',
  'BTRFLY': 'butterfly-protocol',
  'BUTTERFLY': 'butterfly-protocol',
  'FLY': 'fly',
  'JONES': 'jones-dao',
  'GMD': 'gmd',
  'GLP': 'glp',
  'GNS': 'gains-network',
  'GAINS': 'gains-network',
  'KWENTA': 'kwenta',
  'LYRA': 'lyra',
  'THALES': 'thales',
  'VSTA': 'vesta',
  'VESTA': 'vesta',
  'HND': 'hundred-finance',
  'HUNDRED': 'hundred-finance',
  'TAROT': 'tarot',
  'XCAL': 'xcalibur',
  'XCALIBUR': 'xcalibur',
  'GRAIL': 'grail',
  'PREMIA': 'premia',
  'DOPEX': 'dopex',
  'DPX': 'dpx',
  'RDPX': 'rdpx',
  'PLSDPX': 'plsdpx',
  'MAGIC': 'magic',
  'Y2K': 'y2k',
  'UMAMI': 'umami',
  'BEETS': 'beets',
  'SPIRIT': 'spirit',
  'BOO': 'boo',
  'SPELL': 'spell',
  'ICE': 'ice',
  'TOMB': 'tomb',
  'FTM': 'fantom',
  'GEIST': 'geist',
  'LQDR': 'liquiddriver',
  'LIQUIDDRIVER': 'liquiddriver',
  'DEUS': 'deus',
  'DEI': 'dei',
  'SOLID': 'solid',
  'SOLIDLY': 'solidly',
  'SEX': 'sex',
  'OXSOLID': 'oxsolid',
  'HEC': 'hec',
  'TOR': 'tor',
  'WIGO': 'wigo',
  'WIGOSWAP': 'wigo',
  'FANTY': 'fanty',
  'BRUSH': 'brush',
  'PAINT': 'paint',
  'ZOO': 'zoo',
  'FOTO': 'foto',
  'SCREAM': 'scream',
  'TAROT': 'tarot',
  'CREDITUM': 'creditum',
  'MORPHEUS': 'morpheus',
  'PILLS': 'pills',
  'NEO': 'neo',
  'MORPH': 'morph',
  'PROTO': 'proto',
  'PROTOFI': 'protofi',
  'VEDAO': 'vedao',
  'WEVE': 'weve',
  'OXDAO': 'oxdao',
  'OXD': 'oxd',
  'IB': 'ib',
  'GRAIN': 'grain',
  'EQUAL': 'equal',
  'EQUALIZER': 'equalizer',
  'BSHARE': 'bshare',
  'BASED': 'based',
  'TSHARE': 'tshare',
  'TBOND': 'tbond',
  'MSHARE': 'mshare',
  'MBOND': 'mbond',
  'SCARAB': 'scarab',
  'GSCARAB': 'gscarab',
  'BELUGA': 'beluga',
  'HSHARE': 'hshare',
  'HBOND': 'hbond',
  'SPA': 'spa',
  'SSPELL': 'sspell',
  'XBOO': 'xboo',
  'XSCREAM': 'xscream',
  'XTAROT': 'xtarot',
  'XCREDIT': 'xcredit',
  'XICE': 'xice',
  'SOLACE': 'solace',
  'UNIDEX': 'unidex',
  'MOLTEN': 'molten',
  'MAGIK': 'magik',
  'EXOD': 'exod',
  'FBOMB': 'fbomb',
  'KCAL': 'kcal',
  'FERTILIZER': 'fertilizer',
  'ELK': 'elk',
  'ELKS': 'elks',
  'COW': 'cow',
  'MILK2': 'milk2',
  'BUTTER': 'butter',
  'CREAM2': 'cream2',
  'MULTI': 'multi',
  'BRIDGE': 'bridge',
  'ROUTE': 'route',
  'SYNAPSE': 'synapse',
  'SYN': 'syn',
  'NETH': 'neth',
  'HIGH': 'high',
  'JUMP': 'jump',
  'DOG': 'dog',
  'USDD': 'usdd',
  'SUN': 'sun',
  'JST': 'just',
  'WIN': 'win',
  'BTTOLD': 'bttold',
  'NFT': 'nft',
  'APENFT': 'apenft',
  'TUSD': 'tusd',
  'USDJ': 'usdj',
  'HEX': 'hex',
  'PULSE': 'pulse',
  'PLSX': 'plsx',
  'INC': 'inc',
  'PULSEX': 'pulsex',
  'PLS': 'pls',
  'EHEX': 'ehex',
  'PHEX': 'phex',
  'MAXI': 'maxi',
  'TRIO': 'trio',
  'DECI': 'deci',
  'LUCKY': 'lucky',
  'GENIUS': 'genius',
  'GENI': 'geni',
  'LOAN': 'loan',
  'MINT': 'mint',
  'COPY': 'copy',
  'COMM': 'comm',
  'TEAM': 'team',
  'WISE': 'wise',
  'WISERTOKEN': 'wisertoken',
  'BEAR': 'bear',
  'BULL': 'bull',
  'CHAD': 'chad',
  'VIRGIN': 'virgin',
  'INCEL': 'incel',
  'APU': 'apu',
  'APUSTAJA': 'apustaja',
  'HELPER': 'helper',
  'FREN': 'fren',
  'FRENS': 'frens',
  'GM': 'gm',
  'GN': 'gn',
  'WAGMI': 'wagmi',
  'NGMI': 'ngmi',
  'MOON': 'moon',
  'SAFU': 'safu',
  'REKT': 'rekt',
  'DYOR': 'dyor',
  'NFA': 'nfa',
  'COPE': 'cope',
  'HOPIUM': 'hopium',
  'FUD': 'fud',
  'SHILL': 'shill',
  'BASED2': 'based2',
  'CRINGE': 'cringe',
  'KEKW': 'kekw',
  'LULW': 'lulw',
  'PEPW': 'pepw',
  'SADGE': 'sadge',
  'COPIUM': 'copium',
  'GIGACHAD': 'gigachad',
  'SIGMA': 'sigma',
  'ALPHA2': 'alpha2',
  'BETA': 'beta',
  'GRINDSET': 'grindset',
  'BUSSIN': 'bussin',
  'NOCAP': 'nocap',
  'ONGOD': 'ongod',
  'FRFR': 'frfr',
  'PERIODT': 'periodt',
  'FINNA': 'finna',
  'DEADASS': 'deadass',
  'SLAPS': 'slaps',
  'HITS': 'hits',
  'VIBES': 'vibes',
  'MOOD': 'mood',
  'AESTHETIC': 'aesthetic',
  'DRIP': 'drip',
  'SWAG': 'swag',
  'SAUCE': 'sauce',
  'HEAT': 'heat',
  'FIRE': 'fire',
  'LIT': 'lit',
  'GOAT': 'goat',
  'LEGEND': 'legend',
  'KING': 'king',
  'QUEEN': 'queen',
  'BOSS': 'boss',
  'CEO': 'ceo',
  'CTO': 'cto',
  'CFO': 'cfo',
  'COO': 'coo',
  'CMO': 'cmo',
  'CIO': 'cio',
  'CISO': 'ciso',
  'CDO': 'cdo',
  'CPO': 'cpo',
  'VP': 'vp',
  'SVP': 'svp',
  'EVP': 'evp',
  'MANAGER': 'manager',
  'DIRECTOR': 'director',
  'LEAD': 'lead',
  'HEAD': 'head',
  'SENIOR': 'senior',
  'JUNIOR': 'junior',
  'INTERN': 'intern',
  'ASSOCIATE': 'associate',
  'ANALYST': 'analyst',
  'ENGINEER': 'engineer',
  'DEVELOPER': 'developer',
  'DESIGNER': 'designer',
  'ARCHITECT': 'architect',
  'CONSULTANT': 'consultant',
  'ADVISOR': 'advisor',
  'SPECIALIST': 'specialist',
  'EXPERT': 'expert',
  'GURU': 'guru',
  'NINJA': 'ninja',
  'ROCKSTAR': 'rockstar',
  'WIZARD': 'wizard',
  'HERO': 'hero',
  'CHAMPION': 'champion',
  'MASTER': 'master',
  'SENSEI': 'sensei',
  'SENPAI': 'senpai',
  'KOHAI': 'kohai',
  'SAMA': 'sama',
  'SAN': 'san',
  'KUN': 'kun',
  'CHAN': 'chan',
  'TAN': 'tan',
  'DONO': 'dono',
  'HAKASE': 'hakase',
  'BAKA': 'baka',
  'SUSSY': 'sussy',
  'SUS': 'sus',
  'AMOGUS': 'amogus',
  'AMONGUS': 'amongus',
  'IMPOSTOR': 'impostor',
  'CREWMATE': 'crewmate',
  'VENT': 'vent',
  'SABOTAGE': 'sabotage',
  'EMERGENCY': 'emergency',
  'MEETING': 'meeting',
  'VOTE': 'vote',
  'SKIP': 'skip',
  'EJECT': 'eject'
};

// Function to fetch cryptocurrency prices
async function fetchCryptoPrices(symbols: string[]): Promise<any> {
  try {
    // Convert symbols to CoinGecko IDs
    const uniqueIds = new Set<string>();
    symbols.forEach(symbol => {
      const id = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase().replace(/[^A-Z0-9]/g, '')];
      if (id) uniqueIds.add(id);
    });

    if (uniqueIds.size === 0) {
      // Try to search for the tokens by name
      const searchPromises = symbols.map(async (symbol) => {
        try {
          const searchResponse = await fetch(
            `${COINGECKO_API_URL}/search?query=${encodeURIComponent(symbol)}`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.coins && searchData.coins.length > 0) {
              return {
                symbol,
                id: searchData.coins[0].id,
                name: searchData.coins[0].name,
                searchResult: true
              };
            }
          }
        } catch (error) {
          console.error(`Search error for ${symbol}:`, error);
        }
        return null;
      });

      const searchResults = (await Promise.all(searchPromises)).filter(Boolean);
      searchResults.forEach(result => {
        if (result?.id) uniqueIds.add(result.id);
      });

      if (uniqueIds.size === 0) {
        return null;
      }
    }

    const coinIds = Array.from(uniqueIds).join(',');
    
    // Fetch prices from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the response
    const prices: any = {};
    for (const [symbol, geckoId] of Object.entries(SYMBOL_TO_COINGECKO_ID)) {
      if (data[geckoId]) {
        prices[symbol] = {
          price: data[geckoId].usd,
          change24h: data[geckoId].usd_24h_change,
          marketCap: data[geckoId].usd_market_cap,
          volume24h: data[geckoId].usd_24h_vol
        };
      }
    }

    // Add any searched tokens
    for (const id of uniqueIds) {
      if (data[id] && !Object.values(prices).find((p: any) => p.geckoId === id)) {
        const symbol = symbols.find(s => {
          const mappedId = SYMBOL_TO_COINGECKO_ID[s.toUpperCase().replace(/[^A-Z0-9]/g, '')];
          return mappedId === id;
        }) || id.toUpperCase();
        
        prices[symbol] = {
          price: data[id].usd,
          change24h: data[id].usd_24h_change,
          marketCap: data[id].usd_market_cap,
          volume24h: data[id].usd_24h_vol,
          geckoId: id
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return null;
  }
}

// Simplified blockchain data functions
async function getGasPrice(network: string = 'ethereum'): Promise<any> {
  try {
    let rpcUrl = '';
    if (network === 'ethereum' && ALCHEMY_API_KEY) {
      rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (network === 'polygon' && ALCHEMY_API_KEY) {
      rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (network === 'arbitrum' && ALCHEMY_API_KEY) {
      rpcUrl = `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (network === 'optimism' && ALCHEMY_API_KEY) {
      rpcUrl = `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (network === 'base' && ALCHEMY_API_KEY) {
      rpcUrl = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (INFURA_API_KEY) {
      // Fallback to Infura
      const infuraNetworks: Record<string, string> = {
        'ethereum': 'mainnet',
        'polygon': 'polygon-mainnet',
        'arbitrum': 'arbitrum-mainnet',
        'optimism': 'optimism-mainnet',
        'avalanche': 'avalanche-mainnet',
      };
      const infuraNetwork = infuraNetworks[network] || 'mainnet';
      rpcUrl = `https://${infuraNetwork}.infura.io/v3/${INFURA_API_KEY}`;
    }

    if (!rpcUrl) {
      return null;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const feeData = await provider.getFeeData();
    
    return {
      network,
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
    };
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return null;
  }
}

async function getWalletBalance(address: string, network: string = 'ethereum'): Promise<any> {
  try {
    let rpcUrl = '';
    if (network === 'ethereum' && ALCHEMY_API_KEY) {
      rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (network === 'polygon' && ALCHEMY_API_KEY) {
      rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (network === 'arbitrum' && ALCHEMY_API_KEY) {
      rpcUrl = `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (INFURA_API_KEY) {
      rpcUrl = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
    }

    if (!rpcUrl) {
      return null;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);
    
    // Also get ENS name if it exists
    let ensName = null;
    if (network === 'ethereum') {
      try {
        ensName = await provider.lookupAddress(address);
      } catch (e) {
        // ENS lookup failed, ignore
      }
    }
    
    return {
      address,
      ensName,
      network,
      balance: balanceEth,
      nativeCurrency: network === 'polygon' ? 'MATIC' : network === 'avalanche' ? 'AVAX' : 'ETH',
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
}

async function resolveENS(ensName: string): Promise<string | null> {
  try {
    if (!ALCHEMY_API_KEY && !INFURA_API_KEY) return null;
    
    const rpcUrl = ALCHEMY_API_KEY 
      ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return null;
  }
}

// Function to detect blockchain queries
function detectBlockchainQuery(message: string): {
  type: string | null;
  params: any;
} {
  const lowerMessage = message.toLowerCase();
  
  // Gas price query
  if (lowerMessage.includes('gas') && (lowerMessage.includes('price') || lowerMessage.includes('fee'))) {
    let network = 'ethereum';
    if (lowerMessage.includes('polygon') || lowerMessage.includes('matic')) network = 'polygon';
    if (lowerMessage.includes('arbitrum')) network = 'arbitrum';
    if (lowerMessage.includes('optimism')) network = 'optimism';
    if (lowerMessage.includes('base')) network = 'base';
    
    return { type: 'gas', params: { network } };
  }
  
  // Wallet balance query
  if (lowerMessage.includes('balance') || lowerMessage.includes('wallet')) {
    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
    const ensMatch = message.match(/([a-zA-Z0-9-]+\.eth)/);
    
    if (addressMatch || ensMatch) {
      return {
        type: 'balance',
        params: { address: addressMatch?.[0], ens: ensMatch?.[0] }
      };
    }
  }
  
  return { type: null, params: {} };
}

// Function to detect if message is asking for crypto prices
function detectPriceQuery(message: string): string[] | null {
  const lowerMessage = message.toLowerCase();
  
  // Check for price-related keywords
  const priceKeywords = ['price', 'cost', 'worth', 'value', 'trading at', 'how much', 'current', 'now', 'today'];
  const hasPriceKeyword = priceKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (!hasPriceKeyword) {
    return null;
  }

  // Extract potential cryptocurrency symbols
  const symbols: string[] = [];
  const words = message.split(/\s+/);
  
  for (const word of words) {
    const cleanWord = word.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (SYMBOL_TO_COINGECKO_ID[cleanWord]) {
      symbols.push(cleanWord);
    }
  }

  // Also check for common phrases
  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) symbols.push('BTC');
  if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) symbols.push('ETH');
  if (lowerMessage.includes('solana') || lowerMessage.includes('sol')) symbols.push('SOL');
  if (lowerMessage.includes('cardano') || lowerMessage.includes('ada')) symbols.push('ADA');
  if (lowerMessage.includes('dogecoin') || lowerMessage.includes('doge')) symbols.push('DOGE');
  if (lowerMessage.includes('shiba') || lowerMessage.includes('shib')) symbols.push('SHIB');
  if (lowerMessage.includes('polygon') || lowerMessage.includes('matic')) symbols.push('MATIC');
  if (lowerMessage.includes('avalanche') || lowerMessage.includes('avax')) symbols.push('AVAX');
  if (lowerMessage.includes('chainlink') || lowerMessage.includes('link')) symbols.push('LINK');
  if (lowerMessage.includes('uniswap') || lowerMessage.includes('uni')) symbols.push('UNI');
  if (lowerMessage.includes('binance') || lowerMessage.includes('bnb')) symbols.push('BNB');
  if (lowerMessage.includes('ripple') || lowerMessage.includes('xrp')) symbols.push('XRP');
  if (lowerMessage.includes('polkadot') || lowerMessage.includes('dot')) symbols.push('DOT');
  if (lowerMessage.includes('cosmos') || lowerMessage.includes('atom')) symbols.push('ATOM');
  if (lowerMessage.includes('near')) symbols.push('NEAR');
  if (lowerMessage.includes('aptos') || lowerMessage.includes('apt')) symbols.push('APT');
  if (lowerMessage.includes('arbitrum') || lowerMessage.includes('arb')) symbols.push('ARB');
  if (lowerMessage.includes('optimism') || lowerMessage.includes(' op ')) symbols.push('OP');
  if (lowerMessage.includes('sui')) symbols.push('SUI');
  if (lowerMessage.includes('sei')) symbols.push('SEI');

  // Remove duplicates
  const uniqueSymbols = [...new Set(symbols)];
  
  return uniqueSymbols.length > 0 ? uniqueSymbols : null;
}

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

    // Check if the message is asking for crypto prices
    const cryptoSymbols = detectPriceQuery(message);
    let priceData = null;
    let priceContext = "";

    if (cryptoSymbols) {
      console.log('Detected price query for symbols:', cryptoSymbols);
      priceData = await fetchCryptoPrices(cryptoSymbols);
      
      if (priceData) {
        // Build price context for the AI
        const priceStrings = Object.entries(priceData).map(([symbol, data]: [string, any]) => {
          const change = data.change24h ? ` (${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}% 24h)` : '';
          return `${symbol}: $${data.price.toLocaleString()}${change}`;
        });
        
        priceContext = `\n\nCurrent cryptocurrency prices (real-time data from CoinGecko):\n${priceStrings.join('\n')}\n\nUse this real-time price data in your response. Provide the exact prices and include the 24h percentage change if available.`;
      }
    }

    // Check for blockchain data queries
    const blockchainQuery = detectBlockchainQuery(message);
    let blockchainData = null;
    let blockchainContext = "";

    if (blockchainQuery.type) {
      console.log('Detected blockchain query:', blockchainQuery);
      
      if (blockchainQuery.type === 'gas') {
        blockchainData = await getGasPrice(blockchainQuery.params.network);
        if (blockchainData) {
          blockchainContext = `\n\nCurrent gas prices on ${blockchainQuery.params.network}:\n`;
          blockchainContext += `Standard: ${blockchainData.gasPrice} gwei\n`;
          if (blockchainData.maxFeePerGas) {
            blockchainContext += `Max Fee (EIP-1559): ${blockchainData.maxFeePerGas} gwei\n`;
            blockchainContext += `Priority Fee: ${blockchainData.maxPriorityFeePerGas} gwei\n`;
          }
          blockchainContext += '\nProvide these exact gas prices from Alchemy/Infura APIs.';
        }
      } else if (blockchainQuery.type === 'balance') {
        let address = blockchainQuery.params.address;
        
        // Resolve ENS if provided
        if (blockchainQuery.params.ens) {
          const resolved = await resolveENS(blockchainQuery.params.ens);
          if (resolved) {
            address = resolved;
          }
        }
        
        if (address) {
          // Get balances from multiple networks
          const networks = ['ethereum', 'polygon', 'arbitrum'];
          const balances = await Promise.all(
            networks.map(network => getWalletBalance(address, network))
          );
          
          blockchainData = balances.filter(b => b !== null);
          if (blockchainData.length > 0) {
            blockchainContext = `\n\nWallet balances for ${blockchainQuery.params.ens || address}:\n`;
            blockchainData.forEach((balance: any) => {
              blockchainContext += `${balance.network}: ${balance.balance} ${balance.nativeCurrency}\n`;
            });
            blockchainContext += '\nProvide these exact balances from Alchemy/Infura APIs.';
          }
        }
      }
    }

    // Build context-aware prompt
    let systemPrompt = "You are NYX, an AI assistant specialized in cryptocurrency, DeFi, and blockchain technology. ";
    systemPrompt += "You have access to real-time blockchain data via Alchemy and Infura APIs. ";
    systemPrompt += "You help users with investment strategies, portfolio analysis, and understanding DeFi protocols.";
    
    if (priceContext) {
      systemPrompt += priceContext;
    }
    
    if (blockchainContext) {
      systemPrompt += blockchainContext;
    }
    
    if (context?.userProfile) {
      systemPrompt += ` The user has ${context.userProfile.experience || 'some'} experience in crypto, ${context.userProfile.riskTolerance || 'moderate'} risk tolerance.`;
      if (context.userProfile.investmentGoals?.length) {
        systemPrompt += ` Their goals include: ${context.userProfile.investmentGoals.join(', ')}.`;
      }
    }

    if (context?.walletData?.holdings) {
      systemPrompt += ` User's portfolio includes: ${context.walletData.holdings.map((h: any) => `${h.amount} ${h.symbol}`).join(', ')}.`;
    }

    console.log('Calling OpenRouter API with message:', message);
    if (priceData) {
      console.log('Including real-time price data for:', Object.keys(priceData));
    }
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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      // Parse error if possible
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
    if (priceData) toolsUsed.push('coingecko-price-api');
    if (blockchainData) {
      if (blockchainQuery.type === 'gas') toolsUsed.push('alchemy-gas-api');
      if (blockchainQuery.type === 'balance') toolsUsed.push('alchemy-balance-api', 'infura-balance-api');
    }
    if (enableCryptoTools && toolsUsed.length === 0) toolsUsed.push('analysis');
    
    const result = {
      message: aiResponse,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      priceData: priceData || undefined,
      blockchainData: blockchainData || undefined,
      recommendations: context?.userProfile ? [
        "Monitor gas prices across different networks for optimal transaction timing",
        "Consider diversifying your portfolio across different sectors",
        "Research DeFi yield opportunities matching your risk profile",
        "Use Layer 2 solutions like Arbitrum or Optimism for lower transaction costs",
        "Stay updated with market trends and protocol updates"
      ].filter(() => Math.random() > 0.5) : undefined,
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error in enhanced chat endpoint:", error.message, error.stack);

    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to process your request. Please try again.",
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}