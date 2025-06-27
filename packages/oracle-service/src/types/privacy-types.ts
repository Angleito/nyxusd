/**
 * Privacy-Preserving Oracle Types
 *
 * Type definitions for zero-knowledge oracle proofs and privacy-preserving
 * price data consumption using Midnight Protocol integration
 */

import { Either } from "fp-ts/Either";
import { z } from "zod";

/**
 * Zero-Knowledge Proof Schema for Oracle Data
 */
export const ZKProofSchema = z.object({
  proof: z.string().min(1, "Proof cannot be empty"),
  publicInputs: z.array(z.string()),
  verificationKey: z.string().min(1, "Verification key required"),
  circuit: z.string().min(1, "Circuit identifier required"),
  timestamp: z.number().int().positive(),
});

export type ZKProof = z.infer<typeof ZKProofSchema>;

/**
 * Privacy-Preserving Price Data
 */
export const PrivatePriceDataSchema = z.object({
  feedId: z.string().min(1),
  encryptedPrice: z.string().min(1, "Encrypted price required"),
  zkProof: ZKProofSchema,
  priceRange: z.object({
    min: z.bigint(),
    max: z.bigint(),
  }),
  confidence: z.number().min(0).max(100),
  timestamp: z.number().int().positive(),
  nonce: z.string().min(1, "Nonce required for encryption"),
  commitment: z.string().min(1, "Price commitment required"),
});

export type PrivatePriceData = z.infer<typeof PrivatePriceDataSchema>;

/**
 * Privacy Configuration
 */
export const PrivacyConfigSchema = z.object({
  enableZKProofs: z.boolean().default(true),
  encryptionAlgorithm: z
    .enum(["aes-256-gcm", "chacha20-poly1305"])
    .default("aes-256-gcm"),
  zkCircuit: z.enum(["groth16", "plonk", "stark"]).default("groth16"),
  commitmentScheme: z
    .enum(["pedersen", "blake2s", "poseidon"])
    .default("pedersen"),
  privacyLevel: z.enum(["standard", "high", "maximum"]).default("standard"),
  keyDerivation: z.object({
    algorithm: z.enum(["pbkdf2", "scrypt", "argon2"]).default("pbkdf2"),
    iterations: z.number().int().positive().default(100000),
    keyLength: z.number().int().positive().default(32),
  }),
});

export type PrivacyConfig = z.infer<typeof PrivacyConfigSchema>;

/**
 * Privacy-Preserving Oracle Query
 */
export const PrivateOracleQuerySchema = z.object({
  feedId: z.string().min(1),
  requesterPublicKey: z.string().min(1, "Requester public key required"),
  priceConstraints: z.object({
    minPrice: z.bigint().optional(),
    maxPrice: z.bigint().optional(),
    maxStaleness: z.number().int().positive().default(3600),
  }),
  privacyParams: z.object({
    requireZKProof: z.boolean().default(true),
    encryptResponse: z.boolean().default(true),
    anonymizeSource: z.boolean().default(false),
  }),
  nonce: z.string().min(1, "Query nonce required"),
});

export type PrivateOracleQuery = z.infer<typeof PrivateOracleQuerySchema>;

/**
 * Privacy-Preserving Oracle Response
 */
export interface PrivateOracleResponse {
  readonly data: PrivatePriceData;
  readonly metadata: {
    readonly source: "midnight" | "chainlink-private" | "aggregated-private";
    readonly responseTime: number;
    readonly privacyLevel: "standard" | "high" | "maximum";
    readonly proofVerified: boolean;
    readonly encryptionStatus: "encrypted" | "plaintext";
  };
}

/**
 * ZK Circuit Parameters
 */
export interface ZKCircuitParams {
  readonly circuit: string;
  readonly provingKey: string;
  readonly verifyingKey: string;
  readonly publicInputs: readonly string[];
  readonly constraints: number;
}

/**
 * Privacy-Preserving Oracle Service Interface
 */
export interface IPrivacyOracleService {
  /**
   * Fetch price data with privacy preservation
   */
  readonly fetchPrivatePrice: (
    query: PrivateOracleQuery,
  ) => Promise<Either<PrivacyOracleError, PrivateOracleResponse>>;

  /**
   * Verify zero-knowledge proof for price data
   */
  readonly verifyZKProof: (
    proof: ZKProof,
    publicInputs: readonly string[],
  ) => Promise<Either<PrivacyOracleError, boolean>>;

  /**
   * Generate price commitment for privacy preservation
   */
  readonly generatePriceCommitment: (
    price: bigint,
    nonce: string,
  ) => Promise<Either<PrivacyOracleError, string>>;

  /**
   * Decrypt price data using private key
   */
  readonly decryptPriceData: (
    encryptedData: string,
    privateKey: string,
    nonce: string,
  ) => Promise<Either<PrivacyOracleError, bigint>>;

  /**
   * Get supported privacy features
   */
  readonly getSupportedPrivacyFeatures: () => readonly string[];
}

/**
 * Privacy Oracle Error Types
 */
export const PrivacyOracleErrorSchema = z.object({
  code: z.enum([
    "ZK_PROOF_GENERATION_FAILED",
    "ZK_PROOF_VERIFICATION_FAILED",
    "ENCRYPTION_FAILED",
    "DECRYPTION_FAILED",
    "COMMITMENT_GENERATION_FAILED",
    "INVALID_PRIVACY_CONFIG",
    "CIRCUIT_NOT_FOUND",
    "KEY_DERIVATION_FAILED",
    "PRIVACY_VIOLATION",
    "INSUFFICIENT_ANONYMITY",
  ]),
  message: z.string().min(1),
  details: z.record(z.unknown()).optional(),
  timestamp: z.number().int().positive(),
});

export type PrivacyOracleError = z.infer<typeof PrivacyOracleErrorSchema>;

/**
 * Midnight Protocol Integration Types
 */
export interface MidnightProtocolConfig {
  readonly networkId: string;
  readonly contractAddress: string;
  readonly privateKey: string;
  readonly publicKey: string;
  readonly zkParams: ZKCircuitParams;
}

export const MidnightProtocolConfigSchema = z.object({
  networkId: z.string().min(1),
  contractAddress: z.string().min(1),
  privateKey: z.string().min(1),
  publicKey: z.string().min(1),
  zkParams: z.object({
    circuit: z.string().min(1),
    provingKey: z.string().min(1),
    verifyingKey: z.string().min(1),
    publicInputs: z.array(z.string()),
    constraints: z.number().int().positive(),
  }),
});

/**
 * Privacy Metrics for Monitoring
 */
export interface PrivacyMetrics {
  readonly totalPrivateQueries: number;
  readonly successfulZKProofs: number;
  readonly failedZKProofs: number;
  readonly encryptionSuccess: number;
  readonly encryptionFailures: number;
  readonly averageProofTime: number;
  readonly privacyLevelDistribution: Record<string, number>;
}

/**
 * Privacy Audit Log Entry
 */
export const PrivacyAuditLogSchema = z.object({
  timestamp: z.number().int().positive(),
  operation: z.enum([
    "PRIVATE_QUERY",
    "ZK_PROOF_GENERATION",
    "ZK_PROOF_VERIFICATION",
    "ENCRYPTION",
    "DECRYPTION",
    "COMMITMENT_GENERATION",
  ]),
  feedId: z.string(),
  requesterHash: z.string().min(1), // Hashed requester identity
  privacyLevel: z.enum(["standard", "high", "maximum"]),
  success: z.boolean(),
  errorCode: z.string().optional(),
  proofVerificationTime: z.number().optional(),
  encryptionTime: z.number().optional(),
});

export type PrivacyAuditLog = z.infer<typeof PrivacyAuditLogSchema>;
