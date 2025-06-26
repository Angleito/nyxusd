/**
 * System and application state type definitions
 * 
 * This module defines the core state types for the NyxUSD system, including
 * global system state, application state, and their management. All types
 * follow functional programming principles with immutable data structures.
 * 
 * @packageDocumentation
 */

// Temporary basic type definitions - will be replaced with fp-ts when dependencies are available
type Either<E, A> = { readonly _tag: 'Left'; readonly left: E } | { readonly _tag: 'Right'; readonly right: A }
type Option<A> = { readonly _tag: 'None' } | { readonly _tag: 'Some'; readonly value: A }
// Using built-in Map for now - will be replaced with immutable Map when dependencies are available
type Map<K, V> = globalThis.Map<K, V>
import { CDP, CDPId, Amount, Timestamp } from './cdp'
import { CollateralType, CollateralTypeId, Collateral, Price } from './collateral'

/**
 * System operational mode
 */
export type SystemMode = 
  | { readonly type: 'normal' }
  | { readonly type: 'emergency_shutdown'; readonly triggeredAt: Timestamp; readonly reason: string }
  | { readonly type: 'maintenance'; readonly scheduledUntil: Timestamp }
  | { readonly type: 'recovery'; readonly recoveryStartedAt: Timestamp }

/**
 * Network information for Midnight protocol
 */
export interface NetworkInfo {
  /** Network identifier */
  readonly networkId: string
  
  /** Network name (e.g., "mainnet", "testnet") */
  readonly networkName: string
  
  /** Current block number */
  readonly currentBlock: bigint
  
  /** Block timestamp */
  readonly blockTimestamp: Timestamp
  
  /** Gas price information */
  readonly gasPrice: bigint
  
  /** Network congestion level (0-100) */
  readonly congestionLevel: number
}

/**
 * Global system parameters
 */
export interface SystemParameters {
  /** Global debt ceiling */
  readonly globalDebtCeiling: Amount
  
  /** Current total debt issued */
  readonly totalDebt: Amount
  
  /** System surplus buffer */
  readonly surplusBuffer: Amount
  
  /** Emergency shutdown threshold */
  readonly emergencyShutdownThreshold: number
  
  /** Base stability fee rate */
  readonly baseStabilityFeeRate: number
  
  /** Liquidation penalty rate */
  readonly baseLiquidationPenalty: number
  
  /** Minimum auction duration */
  readonly minAuctionDuration: number
  
  /** Maximum auction duration */
  readonly maxAuctionDuration: number
}

/**
 * System health metrics
 */
export interface SystemHealth {
  /** Overall system health score (0-100) */
  readonly healthScore: number
  
  /** Total collateralization ratio */
  readonly totalCollateralizationRatio: number
  
  /** Number of CDPs at risk */
  readonly cdpsAtRisk: number
  
  /** Total value at risk */
  readonly totalValueAtRisk: Amount
  
  /** System utilization ratio */
  readonly utilizationRatio: number
  
  /** Oracle health status */
  readonly oracleHealthy: boolean
  
  /** Last health check timestamp */
  readonly lastHealthCheck: Timestamp
}

/**
 * Core system state containing all global information
 */
export interface SystemState {
  /** Current operational mode */
  readonly mode: SystemMode
  
  /** Network information */
  readonly network: NetworkInfo
  
  /** Global system parameters */
  readonly parameters: SystemParameters
  
  /** System health metrics */
  readonly health: SystemHealth
  
  /** All registered collateral types */
  readonly collateralTypes: Map<CollateralTypeId, CollateralType>
  
  /** Current prices for all collateral types */
  readonly prices: Map<CollateralTypeId, Price>
  
  /** All active CDPs */
  readonly cdps: Map<CDPId, CDP>
  
  /** All collateral positions */
  readonly collateralPositions: Map<string, Map<CollateralTypeId, Collateral>>
  
  /** System initialization timestamp */
  readonly initializedAt: Timestamp
  
  /** Last state update timestamp */
  readonly lastUpdatedAt: Timestamp
}

/**
 * User-specific application state
 */
export interface UserState {
  /** User's wallet address */
  readonly address: string
  
  /** User's CDPs */
  readonly cdps: Map<CDPId, CDP>
  
  /** User's collateral positions */
  readonly collateralPositions: Map<CollateralTypeId, Collateral>
  
  /** User's transaction history */
  readonly transactionHistory: readonly TransactionRecord[]
  
  /** User preferences */
  readonly preferences: UserPreferences
  
  /** Last login timestamp */
  readonly lastLoginAt: Timestamp
}

/**
 * Transaction record for user history
 */
export interface TransactionRecord {
  /** Transaction hash */
  readonly txHash: string
  
  /** Transaction type */
  readonly type: TransactionType
  
  /** Block number */
  readonly blockNumber: bigint
  
  /** Transaction timestamp */
  readonly timestamp: Timestamp
  
  /** Gas used */
  readonly gasUsed: bigint
  
  /** Transaction status */
  readonly status: TransactionStatus
  
  /** Related CDP ID (if applicable) */
  readonly cdpId: Option<CDPId>
  
  /** Transaction amount */
  readonly amount: Option<Amount>
  
  /** Error message (if failed) */
  readonly errorMessage: Option<string>
}

/**
 * Transaction types
 */
export type TransactionType = 
  | 'cdp_open'
  | 'cdp_close'
  | 'collateral_deposit'
  | 'collateral_withdraw'
  | 'debt_increase'
  | 'debt_decrease'
  | 'liquidation'
  | 'auction_bid'

/**
 * Transaction status
 */
export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'cancelled'

/**
 * User preferences
 */
export interface UserPreferences {
  /** Preferred language */
  readonly language: string
  
  /** Currency display preference */
  readonly currency: string
  
  /** Notification preferences */
  readonly notifications: NotificationPreferences
  
  /** UI theme preference */
  readonly theme: 'light' | 'dark' | 'auto'
  
  /** Advanced mode enabled */
  readonly advancedMode: boolean
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  /** Email notifications enabled */
  readonly email: boolean
  
  /** Push notifications enabled */
  readonly push: boolean
  
  /** Liquidation alerts enabled */
  readonly liquidationAlerts: boolean
  
  /** Price alerts enabled */
  readonly priceAlerts: boolean
  
  /** System announcements */
  readonly systemAnnouncements: boolean
}

/**
 * Complete application state combining system and user state
 */
export interface AppState {
  /** Global system state */
  readonly system: SystemState
  
  /** Current user state (if authenticated) */
  readonly user: Option<UserState>
  
  /** Application metadata */
  readonly metadata: AppMetadata
  
  /** Loading states for async operations */
  readonly loading: LoadingState
  
  /** Error states */
  readonly errors: ErrorState
}

/**
 * Application metadata
 */
export interface AppMetadata {
  /** Application version */
  readonly version: string
  
  /** Build timestamp */
  readonly buildTime: Timestamp
  
  /** Environment (development, staging, production) */
  readonly environment: string
  
  /** Feature flags */
  readonly features: Map<string, boolean>
}

/**
 * Loading states for different operations
 */
export interface LoadingState {
  /** System initialization */
  readonly systemInit: boolean
  
  /** User data loading */
  readonly userLoad: boolean
  
  /** CDP operations */
  readonly cdpOperations: Map<CDPId, boolean>
  
  /** Price updates */
  readonly priceUpdates: boolean
  
  /** Transaction submissions */
  readonly transactions: Map<string, boolean>
}

/**
 * Error states for different operations
 */
export interface ErrorState {
  /** System-level errors */
  readonly systemErrors: readonly SystemError[]
  
  /** User-specific errors */
  readonly userErrors: readonly UserError[]
  
  /** Network connectivity errors */
  readonly networkErrors: readonly NetworkError[]
  
  /** Validation errors */
  readonly validationErrors: readonly ValidationError[]
}

/**
 * System error types
 */
export type SystemError = 
  | { readonly type: 'initialization_failed'; readonly reason: string; readonly timestamp: Timestamp }
  | { readonly type: 'oracle_failure'; readonly collateralType: CollateralTypeId; readonly timestamp: Timestamp }
  | { readonly type: 'emergency_shutdown'; readonly reason: string; readonly timestamp: Timestamp }
  | { readonly type: 'parameter_update_failed'; readonly parameter: string; readonly timestamp: Timestamp }

/**
 * User error types
 */
export type UserError = 
  | { readonly type: 'authentication_failed'; readonly reason: string; readonly timestamp: Timestamp }
  | { readonly type: 'insufficient_balance'; readonly required: Amount; readonly available: Amount; readonly timestamp: Timestamp }
  | { readonly type: 'operation_failed'; readonly operation: string; readonly reason: string; readonly timestamp: Timestamp }
  | { readonly type: 'cdp_operation_failed'; readonly cdpId: CDPId; readonly operation: string; readonly reason: string; readonly timestamp: Timestamp }

/**
 * Network error types
 */
export type NetworkError = 
  | { readonly type: 'connection_lost'; readonly timestamp: Timestamp }
  | { readonly type: 'rpc_error'; readonly method: string; readonly error: string; readonly timestamp: Timestamp }
  | { readonly type: 'transaction_failed'; readonly txHash: string; readonly error: string; readonly timestamp: Timestamp }
  | { readonly type: 'block_sync_error'; readonly expectedBlock: bigint; readonly actualBlock: bigint; readonly timestamp: Timestamp }

/**
 * Validation error types
 */
export type ValidationError = 
  | { readonly type: 'invalid_amount'; readonly field: string; readonly value: string; readonly timestamp: Timestamp }
  | { readonly type: 'invalid_address'; readonly field: string; readonly value: string; readonly timestamp: Timestamp }
  | { readonly type: 'invalid_ratio'; readonly field: string; readonly value: number; readonly timestamp: Timestamp }
  | { readonly type: 'required_field_missing'; readonly field: string; readonly timestamp: Timestamp }

/**
 * State update operations
 */
export type StateUpdate = 
  | { readonly type: 'system_parameter_update'; readonly parameters: Partial<SystemParameters> }
  | { readonly type: 'collateral_type_update'; readonly collateralTypeId: CollateralTypeId; readonly update: Partial<CollateralType> }
  | { readonly type: 'price_update'; readonly prices: Map<CollateralTypeId, Price> }
  | { readonly type: 'cdp_update'; readonly cdpId: CDPId; readonly update: Partial<CDP> }
  | { readonly type: 'user_preference_update'; readonly preferences: Partial<UserPreferences> }
  | { readonly type: 'mode_change'; readonly mode: SystemMode }

/**
 * Result type for state operations
 */
export type StateOperationResult<T> = Either<StateError, T>

/**
 * State operation error types
 */
export type StateError = 
  | { readonly type: 'invalid_state_transition'; readonly from: string; readonly to: string }
  | { readonly type: 'concurrent_modification'; readonly resource: string }
  | { readonly type: 'state_corruption'; readonly details: string }
  | { readonly type: 'operation_not_allowed'; readonly operation: string; readonly mode: SystemMode['type'] }

/**
 * State query parameters
 */
export interface StateQueryParams {
  readonly includeHistory?: boolean
  readonly timeRange?: { readonly from: Timestamp; readonly to: Timestamp }
  readonly userAddress?: Option<string>
  readonly collateralTypes?: readonly CollateralTypeId[]
  readonly cdpIds?: readonly CDPId[]
}