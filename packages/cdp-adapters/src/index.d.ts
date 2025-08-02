export { BaseCDPAdapter } from './baseAdapter';
export { CDPAdapter, CDPResult, BlockchainConfig } from './types';
export { EthereumCDPAdapter } from './ethereum';
export { PolygonCDPAdapter } from './polygon';
export { ArbitrumCDPAdapter } from './arbitrum';
export { MidnightCDPAdapter } from './midnight';
import { CDPAdapter, BlockchainConfig } from './types';
export declare const createCDPAdapter: (chain: string, config: BlockchainConfig) => CDPAdapter;
//# sourceMappingURL=index.d.ts.map