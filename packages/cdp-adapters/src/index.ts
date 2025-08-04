export { BaseCDPAdapter } from './baseAdapter';
export {
  CDPAdapter,
  CDPResult,
  BlockchainConfig,
  // Expose operation parameter types and Option used by SDK/consumers
  Option,
  DepositCollateralParams,
  WithdrawCollateralParams,
  MintNYXUSDParams,
  BurnNYXUSDParams,
} from './types';

// Blockchain-specific adapters
export { EthereumCDPAdapter } from './ethereum';
export { PolygonCDPAdapter } from './polygon';
export { ArbitrumCDPAdapter } from './arbitrum';
export { MidnightCDPAdapter } from './midnight';

// Adapter factory
import { EthereumCDPAdapter } from './ethereum';
import { PolygonCDPAdapter } from './polygon';
import { ArbitrumCDPAdapter } from './arbitrum';
import { MidnightCDPAdapter } from './midnight';
import { CDPAdapter, BlockchainConfig } from './types';

export const createCDPAdapter = (chain: string, config: BlockchainConfig): CDPAdapter => {
  switch (chain.toLowerCase()) {
    case 'ethereum':
      return new EthereumCDPAdapter(config);
    case 'polygon':
      return new PolygonCDPAdapter(config);
    case 'arbitrum':
      return new ArbitrumCDPAdapter(config);
    case 'midnight':
      return new MidnightCDPAdapter(config);
    default:
      throw new Error(`Unsupported blockchain: ${chain}`);
  }
};