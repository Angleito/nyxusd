/**
 * Midnight Protocol Utilities Library
 *
 * A comprehensive utility library for interacting with the Midnight blockchain protocol.
 * Provides utilities for DUST token operations, Compact smart contract interactions,
 * and zero-knowledge proof generation and verification.
 *
 * @version 1.0.0
 * @author Midnight Protocol Team
 * @license MIT
 */

// Import modules for the combined utility object
import * as DustModule from "./dust";
import * as CompactModule from "./compact";
import * as ProofModule from "./proof";

// DUST Token Utilities
export {
  // Constants and types
  DUST_CONSTANTS,
  TransactionType,
  TRANSACTION_COMPLEXITY,
  type DustError,
  type DustAmount,
  type TransactionCost,
  type AddressBalance,

  // Core DUST functions
  createDustAmount,
  formatDustAmount,
  parseDustAmount,
  calculateDustGeneration,
  convertDustToTransactionFee,
  validateDustBalance,
  estimateTransactionCost,
  getAddressBalance,
  convertDustDenomination,

  // DUST utilities
  DustUtils,
} from "./dust";

// Compact Language Helpers
export {
  // Types and enums
  CompactType,
  type CompactError,
  type CompactParameter,
  type CompactFunction,
  type CompactABI,
  type CompactEvent,
  type CompactStruct,
  type EncodedCalldata,
  type DecodedResult,

  // Constants
  COMPACT_ADDRESS_REGEX,

  // Core Compact functions
  validateCompactAddress,
  encodeCompactCalldata,
  decodeCompactResult,
  formatCompactError,
  validateFunctionCall,
  createMockCompactABI,

  // Compact utilities
  CompactUtils,
} from "./compact";

// Zero-Knowledge Proof Utilities
export {
  // Types and enums
  ProofSystem,
  CircuitType,
  type ProofError,
  type PrivateInputs,
  type PublicInputs,
  type ZKProof,
  type VerificationKey,
  type ProvingKey,
  type ShieldedTransaction,
  type CircuitParameters,
  type Witness,
  type Commitment,
  type Nullifier,

  // Core proof functions
  generatePrivacyProof,
  verifyZKProof,
  createShieldedTransaction,
  validateProofParameters,

  // Proof utilities
  ProofUtils,
} from "./proof";

// Re-export Result type from fp-utils for convenience
export { Result } from "@nyxusd/fp-utils";

/**
 * Library version and metadata
 */
export const MIDNIGHT_UTILS_VERSION = "1.0.0";

/**
 * Supported Midnight protocol features
 */
export const SUPPORTED_FEATURES = {
  DUST_OPERATIONS: true,
  COMPACT_CONTRACTS: true,
  ZERO_KNOWLEDGE_PROOFS: true,
  SHIELDED_TRANSACTIONS: true,
  PRIVACY_COMPUTATIONS: true,
} as const;

/**
 * Main utility object that combines all Midnight utilities
 */

export const MidnightUtils = {
  dust: {
    constants: DustModule.DUST_CONSTANTS,
    create: DustModule.createDustAmount,
    format: DustModule.formatDustAmount,
    parse: DustModule.parseDustAmount,
    calculateGeneration: DustModule.calculateDustGeneration,
    convertToFee: DustModule.convertDustToTransactionFee,
    validateBalance: DustModule.validateDustBalance,
    estimateCost: DustModule.estimateTransactionCost,
    getBalance: DustModule.getAddressBalance,
    convert: DustModule.convertDustDenomination,
    utils: DustModule.DustUtils,
  },

  compact: {
    types: CompactModule.CompactType,
    validateAddress: CompactModule.validateCompactAddress,
    encodeCalldata: CompactModule.encodeCompactCalldata,
    decodeResult: CompactModule.decodeCompactResult,
    formatError: CompactModule.formatCompactError,
    validateFunction: CompactModule.validateFunctionCall,
    createMockABI: CompactModule.createMockCompactABI,
    utils: CompactModule.CompactUtils,
  },

  proof: {
    systems: ProofModule.ProofSystem,
    circuits: ProofModule.CircuitType,
    generate: ProofModule.generatePrivacyProof,
    verify: ProofModule.verifyZKProof,
    createShielded: ProofModule.createShieldedTransaction,
    validateParameters: ProofModule.validateProofParameters,
    utils: ProofModule.ProofUtils,
  },

  version: MIDNIGHT_UTILS_VERSION,
  features: SUPPORTED_FEATURES,
} as const;

/**
 * Default export for convenience
 */
export default MidnightUtils;
