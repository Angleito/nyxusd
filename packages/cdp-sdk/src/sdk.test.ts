import { NyxUSD_CDP_SDK } from './index';

describe('NyxUSD_CDP_SDK', () => {
  it('should initialize with Ethereum adapter', () => {
    const sdk = new NyxUSD_CDP_SDK({
      chain: 'ethereum',
      config: {
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/demo',
        contracts: {
          cdpManager: '0x0000000000000000000000000000000000000001',
          nyxUSD: '0x0000000000000000000000000000000000000002',
          oracle: '0x0000000000000000000000000000000000000003',
        }
      }
    });
    
    expect(sdk).toBeDefined();
  });
  
  it('should initialize with Polygon adapter', () => {
    const sdk = new NyxUSD_CDP_SDK({
      chain: 'polygon',
      config: {
        chainId: 137,
        rpcUrl: 'https://polygon.infura.io/v3/demo',
        contracts: {
          cdpManager: '0x0000000000000000000000000000000000000001',
          nyxUSD: '0x0000000000000000000000000000000000000002',
          oracle: '0x0000000000000000000000000000000000000003',
        }
      }
    });
    
    expect(sdk).toBeDefined();
  });
  
  it('should initialize with Arbitrum adapter', () => {
    const sdk = new NyxUSD_CDP_SDK({
      chain: 'arbitrum',
      config: {
        chainId: 42161,
        rpcUrl: 'https://arbitrum.infura.io/v3/demo',
        contracts: {
          cdpManager: '0x0000000000000000000000000000000000000001',
          nyxUSD: '0x0000000000000000000000000000000000000002',
          oracle: '0x0000000000000000000000000000000000000003',
        }
      }
    });
    
    expect(sdk).toBeDefined();
  });
  
  it('should initialize with Midnight adapter', () => {
    const sdk = new NyxUSD_CDP_SDK({
      chain: 'midnight',
      config: {
        chainId: 99999,
        rpcUrl: 'https://midnight.example.com',
        contracts: {
          cdpManager: '0x0000000000000000000000000000000000000001',
          nyxUSD: '0x0000000000000000000000000000000000000002',
          oracle: '0x0000000000000000000000000000000000000003',
        }
      }
    });
    
    expect(sdk).toBeDefined();
  });
});