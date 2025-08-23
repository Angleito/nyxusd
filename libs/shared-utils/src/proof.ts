/**
 * Zero-Knowledge Proof Utilities for Midnight Protocol
 *
 * Midnight uses zero-knowledge proofs to enable privacy-preserving transactions
 * and computations. This module provides utilities for:
 * - Generating privacy proofs
 * - Verifying zero-knowledge proofs
 * - Creating shielded transactions
 * - Managing proof parameters and circuits
 * - Nullifier and commitment handling
 */

import { Result } from "./result";

/**
 * Zero-knowledge proof systems supported by Midnight
 */
export enum ProofSystem {
  GROTH16 = "groth16",
  PLONK = "plonk",
  STARK = "stark",
  BULLETPROOFS = "bulletproofs",
}

/**
 * Circuit types for different privacy operations
 */
export enum CircuitType {
  TRANSFER = "transfer",
  SHIELDED_POOL_ENTRY = "shielded_pool_entry",
  SHIELDED_POOL_EXIT = "shielded_pool_exit",
  PRIVATE_COMPUTATION = "private_computation",
  IDENTITY_PROOF = "identity_proof",
  RANGE_PROOF = "range_proof",
  MEMBERSHIP_PROOF = "membership_proof",
}

/**
 * Error types for proof operations
 */
export type ProofError =
  | { type: "INVALID_INPUTS"; message: string }
  | { type: "INVALID_PROOF"; message: string }
  | { type: "VERIFICATION_FAILED"; message: string }
  | { type: "CIRCUIT_NOT_FOUND"; message: string }
  | { type: "PARAMETER_GENERATION_FAILED"; message: string }
  | { type: "NULLIFIER_ALREADY_SPENT"; message: string }
  | { type: "COMMITMENT_INVALID"; message: string }
  | { type: "WITNESS_GENERATION_FAILED"; message: string }
  | { type: "TRUSTED_SETUP_INVALID"; message: string };

/**
 * Private inputs for proof generation (kept secret)
 */
export interface PrivateInputs {
  readonly values: Record<string, bigint | string | boolean>;
  readonly randomness: Record<string, bigint>;
  readonly secrets: Record<string, Uint8Array>;
}

/**
 * Public inputs for proof generation (publicly verifiable)
 */
export interface PublicInputs {
  readonly values: Record<string, bigint | string | boolean>;
  readonly commitments: readonly string[];
  readonly nullifiers: readonly string[];
  readonly merkleRoot: string;
}

/**
 * Zero-knowledge proof structure
 */
export interface ZKProof {
  readonly system: ProofSystem;
  readonly circuit: CircuitType;
  readonly proof: string; // Hex-encoded proof
  readonly publicSignals: readonly string[];
  readonly verificationKey: string;
  readonly timestamp: number;
}

/**
 * Verification key for a specific circuit
 */
export interface VerificationKey {
  readonly circuit: CircuitType;
  readonly system: ProofSystem;
  readonly alpha: string;
  readonly beta: string;
  readonly gamma: string;
  readonly delta: string;
  readonly ic: readonly string[];
  readonly vkHash: string;
}

/**
 * Proving key for proof generation
 */
export interface ProvingKey {
  readonly circuit: CircuitType;
  readonly system: ProofSystem;
  readonly alpha: string;
  readonly beta: string;
  readonly delta: string;
  readonly a: readonly string[];
  readonly b1: readonly string[];
  readonly b2: readonly string[];
  readonly c: readonly string[];
  readonly h: readonly string[];
  readonly pkHash: string;
}

/**
 * Shielded transaction structure
 */
export interface ShieldedTransaction {
  readonly proof: ZKProof;
  readonly nullifiers: readonly string[];
  readonly commitments: readonly string[];
  readonly ciphertext: string;
  readonly ephemeralKey: string;
  readonly memo: string;
}

/**
 * Circuit parameters and constraints
 */
export interface CircuitParameters {
  readonly circuitType: CircuitType;
  readonly constraints: number;
  readonly publicInputs: number;
  readonly privateInputs: number;
  readonly provingKey: ProvingKey;
  readonly verificationKey: VerificationKey;
}

/**
 * Witness data for proof generation
 */
export interface Witness {
  readonly assignment: Record<string, bigint>;
  readonly auxiliary: Record<string, bigint>;
  readonly publicInputs: readonly bigint[];
}

/**
 * Commitment scheme for hiding values
 */
export interface Commitment {
  readonly value: bigint;
  readonly randomness: bigint;
  readonly commitment: string;
  readonly openingProof?: string;
}

/**
 * Nullifier for preventing double-spending
 */
export interface Nullifier {
  readonly secretKey: Uint8Array;
  readonly commitment: string;
  readonly nullifier: string;
  readonly merkleProof: readonly string[];
}

/**
 * Generates a privacy proof from private and public inputs
 * @param privateInputs - Secret inputs for the proof
 * @param publicInputs - Public inputs and commitments
 * @param circuit - Circuit type to use for proof generation
 * @param system - Proof system to use
 * @returns Result containing generated proof or error
 */
export const generatePrivacyProof = (
  privateInputs: PrivateInputs,
  publicInputs: PublicInputs,
  circuit: CircuitType = CircuitType.TRANSFER,
  system: ProofSystem = ProofSystem.GROTH16,
): Result<ZKProof, ProofError> => {
  return Result.tryCatch(
    () => {
      // Validate inputs
      if (
        !privateInputs.values ||
        Object.keys(privateInputs.values).length === 0
      ) {
        throw new Error("Private inputs cannot be empty");
      }

      if (
        !publicInputs.values ||
        Object.keys(publicInputs.values).length === 0
      ) {
        throw new Error("Public inputs cannot be empty");
      }

      // Generate witness from inputs
      const witnessResult = generateWitness(
        privateInputs,
        publicInputs,
        circuit,
      );
      if (witnessResult.isErr()) {
        throw new Error(
          `Witness generation failed: ${witnessResult.value.message}`,
        );
      }
      const witness = witnessResult.unwrap();

      // Mock proof generation - in real implementation, would use actual proving system
      const proofData = mockProofGeneration(witness, circuit, system);

      // Extract public signals from public inputs
      const publicSignals = Object.values(publicInputs.values)
        .concat(publicInputs.commitments)
        .concat(publicInputs.nullifiers)
        .concat([publicInputs.merkleRoot])
        .map((val) => String(val));

      // Generate verification key hash
      const vkHash = mockVerificationKeyGeneration(circuit, system);

      return {
        system,
        circuit,
        proof: proofData,
        publicSignals,
        verificationKey: vkHash,
        timestamp: Date.now(),
      };
    },
    (error): ProofError => ({
      type: "PARAMETER_GENERATION_FAILED",
      message: `Proof generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Verifies a zero-knowledge proof
 * @param proof - Proof to verify
 * @param publicSignals - Public signals/inputs
 * @param verificationKey - Verification key for the circuit
 * @returns Result containing boolean verification result or error
 */
export const verifyZKProof = (
  proof: ZKProof,
  publicSignals: readonly string[],
  verificationKey: VerificationKey,
): Result<boolean, ProofError> => {
  return Result.tryCatch(
    () => {
      // Validate proof structure
      if (!proof.proof || proof.proof.length === 0) {
        throw new Error("Proof data cannot be empty");
      }

      if (!proof.publicSignals || proof.publicSignals.length === 0) {
        throw new Error("Public signals cannot be empty");
      }

      // Validate verification key
      if (!verificationKey.vkHash || verificationKey.vkHash.length === 0) {
        throw new Error("Verification key hash cannot be empty");
      }

      // Check circuit and system compatibility
      if (proof.circuit !== verificationKey.circuit) {
        throw new Error(
          `Circuit mismatch: proof uses ${proof.circuit}, VK is for ${verificationKey.circuit}`,
        );
      }

      if (proof.system !== verificationKey.system) {
        throw new Error(
          `Proof system mismatch: proof uses ${proof.system}, VK is for ${verificationKey.system}`,
        );
      }

      // Verify public signals match
      if (proof.publicSignals.length !== publicSignals.length) {
        throw new Error("Public signals length mismatch");
      }

      for (let i = 0; i < proof.publicSignals.length; i++) {
        if (proof.publicSignals[i] !== publicSignals[i]) {
          throw new Error(`Public signal mismatch at index ${i}`);
        }
      }

      // Mock verification - in real implementation, would use actual verification
      const isValid = mockProofVerification(proof, verificationKey);

      return isValid;
    },
    (error): ProofError => ({
      type: "VERIFICATION_FAILED",
      message: `Proof verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Creates a shielded transaction with privacy proof
 * @param amount - Amount to transfer (in smallest units)
 * @param recipient - Recipient address (can be shielded)
 * @param proof - Zero-knowledge proof for the transaction
 * @param memo - Optional encrypted memo
 * @returns Result containing shielded transaction or error
 */
export const createShieldedTransaction = (
  amount: bigint,
  recipient: string,
  proof: ZKProof,
  memo: string = "",
): Result<ShieldedTransaction, ProofError> => {
  return Result.tryCatch(
    () => {
      if (amount <= 0n) {
        throw new Error("Amount must be positive");
      }

      if (!recipient || recipient.length === 0) {
        throw new Error("Recipient address cannot be empty");
      }

      if (
        proof.circuit !== CircuitType.TRANSFER &&
        proof.circuit !== CircuitType.SHIELDED_POOL_ENTRY
      ) {
        throw new Error(
          `Invalid circuit type for shielded transaction: ${proof.circuit}`,
        );
      }

      // Generate nullifiers from proof (mock implementation)
      const nullifiers = generateNullifiersFromProof(proof);

      // Generate new commitments (mock implementation)
      const commitments = generateCommitmentsForTransaction(amount, recipient);

      // Generate ephemeral key for encryption
      const ephemeralKey = generateEphemeralKey();

      // Encrypt transaction data
      const ciphertext = encryptTransactionData(
        {
          amount,
          recipient,
          memo,
        },
        ephemeralKey,
      );

      return {
        proof,
        nullifiers,
        commitments,
        ciphertext,
        ephemeralKey,
        memo: memo || "",
      };
    },
    (error): ProofError => ({
      type: "INVALID_INPUTS",
      message: `Shielded transaction creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Validates proof parameters for a specific circuit
 * @param circuit - Circuit type
 * @param inputs - Input parameters to validate
 * @returns Result containing validation result or error
 */
export const validateProofParameters = (
  circuit: CircuitType,
  inputs: { private: PrivateInputs; public: PublicInputs },
): Result<boolean, ProofError> => {
  return Result.tryCatch(
    () => {
      // Get expected parameters for circuit
      const expectedParamsResult = getCircuitParameters(circuit);
      if (expectedParamsResult.isErr()) {
        throw new Error(expectedParamsResult.value.message);
      }

      const params = expectedParamsResult.unwrap();

      // Validate input counts
      const privateCount = Object.keys(inputs.private.values).length;
      const publicCount = Object.keys(inputs.public.values).length;

      if (privateCount > params.privateInputs) {
        throw new Error(
          `Too many private inputs: expected max ${params.privateInputs}, got ${privateCount}`,
        );
      }

      if (publicCount > params.publicInputs) {
        throw new Error(
          `Too many public inputs: expected max ${params.publicInputs}, got ${publicCount}`,
        );
      }

      // Validate specific circuit requirements
      switch (circuit) {
        case CircuitType.TRANSFER:
          return validateTransferCircuitInputs(inputs.private, inputs.public);

        case CircuitType.SHIELDED_POOL_ENTRY:
          return validateShieldedPoolEntryInputs(inputs.private, inputs.public);

        case CircuitType.RANGE_PROOF:
          return validateRangeProofInputs(inputs.private, inputs.public);

        default:
          return true; // Generic validation passed
      }
    },
    (error): ProofError => ({
      type: "INVALID_INPUTS",
      message: `Parameter validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Generates witness data from inputs
 * @param privateInputs - Private inputs
 * @param publicInputs - Public inputs
 * @param circuit - Circuit type
 * @returns Result containing witness or error
 */
const generateWitness = (
  privateInputs: PrivateInputs,
  publicInputs: PublicInputs,
  circuit: CircuitType,
): Result<Witness, ProofError> => {
  return Result.tryCatch(
    () => {
      const assignment: Record<string, bigint> = {};
      const auxiliary: Record<string, bigint> = {};
      const publicSignals: bigint[] = [];

      // Process private inputs
      Object.entries(privateInputs.values).forEach(
        ([privateKey, value], index) => {
          const bigintValue =
            typeof value === "bigint" ? value : BigInt(String(value));
          assignment[`private_${index}`] = bigintValue;
          auxiliary[privateKey] = bigintValue;
        },
      );

      // Process public inputs
      Object.entries(publicInputs.values).forEach(([, value], index) => {
        const bigintValue =
          typeof value === "bigint" ? value : BigInt(String(value));
        assignment[`public_${index}`] = bigintValue;
        publicSignals.push(bigintValue);
      });

      // Add circuit-specific constraints
      switch (circuit) {
        case CircuitType.TRANSFER:
          // Balance constraint: input_sum = output_sum
          let inputSum = 0n;
          for (const val of Object.values(privateInputs.values)) {
            if (typeof val === "bigint") {
              inputSum += val;
            } else if (typeof val === "number") {
              inputSum += BigInt(val);
            } else if (typeof val === "string" && !isNaN(Number(val))) {
              inputSum += BigInt(val);
            }
          }
          assignment["balance_constraint"] = inputSum;
          break;

        case CircuitType.RANGE_PROOF:
          // Range constraint: 0 <= value < 2^n
          Object.values(privateInputs.values).forEach((value, idx) => {
            const val = BigInt(String(value));
            assignment[`range_check_${idx}`] = val >= 0n ? 1n : 0n;
          });
          break;
      }

      return {
        assignment,
        auxiliary,
        publicInputs: publicSignals,
      };
    },
    (error): ProofError => ({
      type: "WITNESS_GENERATION_FAILED",
      message: `Witness generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }),
  );
};

/**
 * Mock proof generation (placeholder for actual proving system)
 */
const mockProofGeneration = (
  witness: Witness,
  circuit: CircuitType,
  system: ProofSystem,
): string => {
  // Generate deterministic but unique proof based on inputs
  const witnessHash = Object.entries(witness.assignment)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  const proofSeed = `${circuit}:${system}:${witnessHash}`;

  // Simple hash function for mock proof
  let hash = 0;
  for (let i = 0; i < proofSeed.length; i++) {
    const char = proofSeed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate mock proof components based on system
  switch (system) {
    case ProofSystem.GROTH16:
      return `groth16_${Math.abs(hash).toString(16).padStart(64, "0")}`;
    case ProofSystem.PLONK:
      return `plonk_${Math.abs(hash).toString(16).padStart(128, "0")}`;
    default:
      return `proof_${Math.abs(hash).toString(16).padStart(64, "0")}`;
  }
};

/**
 * Mock verification key generation
 */
const mockVerificationKeyGeneration = (
  circuit: CircuitType,
  system: ProofSystem,
): string => {
  const vkSeed = `vk_${circuit}_${system}`;

  let hash = 0;
  for (let i = 0; i < vkSeed.length; i++) {
    const char = vkSeed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return `vk_${Math.abs(hash).toString(16).padStart(64, "0")}`;
};

/**
 * Mock proof verification
 */
const mockProofVerification = (
  proof: ZKProof,
  vk: VerificationKey,
): boolean => {
  // Simple verification: check if proof and VK are compatible
  const proofPrefix = proof.proof.split("_")[0];
  const expectedPrefix = vk.system.toLowerCase();

  return proofPrefix === expectedPrefix && proof.verificationKey === vk.vkHash;
};

/**
 * Generate nullifiers from proof (mock)
 */
const generateNullifiersFromProof = (proof: ZKProof): string[] => {
  const nullifiers: string[] = [];

  // Extract nullifier hints from public signals
  proof.publicSignals.forEach((signal, index) => {
    if (signal.includes("nullifier") || index % 3 === 0) {
      const nullifier = `null_${signal.slice(-8)}`;
      nullifiers.push(nullifier);
    }
  });

  return nullifiers.length > 0
    ? nullifiers
    : [`null_${Date.now().toString(16)}`];
};

/**
 * Generate commitments for transaction (mock)
 */
const generateCommitmentsForTransaction = (
  amount: bigint,
  recipient: string,
): string[] => {
  const commitments: string[] = [];

  // Value commitment
  const valueCommit = `comm_${amount.toString(16).padStart(16, "0")}`;
  commitments.push(valueCommit);

  // Recipient commitment (if shielded)
  if (recipient.startsWith("shield_")) {
    const recipientCommit = `comm_${recipient.slice(-8)}`;
    commitments.push(recipientCommit);
  }

  return commitments;
};

/**
 * Generate ephemeral key for encryption (mock)
 */
const generateEphemeralKey = (): string => {
  const randomValue = Math.random().toString(36).substring(2, 15);
  return `eph_${randomValue}`;
};

/**
 * Encrypt transaction data (mock)
 */
const encryptTransactionData = (
  data: { amount: bigint; recipient: string; memo: string },
  ephemeralKey: string,
): string => {
  const plaintext = JSON.stringify({
    amount: data.amount.toString(),
    recipient: data.recipient,
    memo: data.memo,
  });

  // Mock encryption - just base64 encode with key
  return Buffer.from(`${ephemeralKey}:${plaintext}`).toString("base64");
};

/**
 * Get circuit parameters for a specific circuit type
 */
const getCircuitParameters = (
  circuit: CircuitType,
): Result<CircuitParameters, ProofError> => {
  const mockParameters: Record<CircuitType, CircuitParameters> = {
    [CircuitType.TRANSFER]: {
      circuitType: CircuitType.TRANSFER,
      constraints: 1000,
      publicInputs: 4,
      privateInputs: 8,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
    [CircuitType.SHIELDED_POOL_ENTRY]: {
      circuitType: CircuitType.SHIELDED_POOL_ENTRY,
      constraints: 2000,
      publicInputs: 2,
      privateInputs: 6,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
    [CircuitType.RANGE_PROOF]: {
      circuitType: CircuitType.RANGE_PROOF,
      constraints: 500,
      publicInputs: 1,
      privateInputs: 3,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
    [CircuitType.SHIELDED_POOL_EXIT]: {
      circuitType: CircuitType.SHIELDED_POOL_EXIT,
      constraints: 1500,
      publicInputs: 3,
      privateInputs: 5,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
    [CircuitType.PRIVATE_COMPUTATION]: {
      circuitType: CircuitType.PRIVATE_COMPUTATION,
      constraints: 5000,
      publicInputs: 6,
      privateInputs: 12,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
    [CircuitType.IDENTITY_PROOF]: {
      circuitType: CircuitType.IDENTITY_PROOF,
      constraints: 800,
      publicInputs: 2,
      privateInputs: 4,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
    [CircuitType.MEMBERSHIP_PROOF]: {
      circuitType: CircuitType.MEMBERSHIP_PROOF,
      constraints: 1200,
      publicInputs: 3,
      privateInputs: 6,
      provingKey: {} as ProvingKey,
      verificationKey: {} as VerificationKey,
    },
  };

  const params = mockParameters[circuit];
  if (!params) {
    return Result.err({
      type: "CIRCUIT_NOT_FOUND",
      message: `Circuit parameters not found for ${circuit}`,
    });
  }

  return Result.ok(params);
};

/**
 * Validate transfer circuit inputs
 */
const validateTransferCircuitInputs = (
  privateInputs: PrivateInputs,
  publicInputs: PublicInputs,
): boolean => {
  // Check required fields for transfer
  const requiredPrivate = ["amount", "sender_secret", "randomness"];
  const requiredPublic = ["recipient", "merkle_root"];

  for (const field of requiredPrivate) {
    if (!(field in privateInputs.values)) {
      throw new Error(`Missing required private input: ${field}`);
    }
  }

  for (const field of requiredPublic) {
    if (!(field in publicInputs.values)) {
      throw new Error(`Missing required public input: ${field}`);
    }
  }

  return true;
};

/**
 * Validate shielded pool entry inputs
 */
const validateShieldedPoolEntryInputs = (
  privateInputs: PrivateInputs,
  publicInputs: PublicInputs,
): boolean => {
  const amount = privateInputs.values["amount"];
  if (!amount || BigInt(String(amount)) <= 0n) {
    throw new Error("Amount must be positive for shielded pool entry");
  }

  if (!publicInputs.commitments || publicInputs.commitments.length === 0) {
    throw new Error("Commitments required for shielded pool entry");
  }

  return true;
};

/**
 * Validate range proof inputs
 */
const validateRangeProofInputs = (
  privateInputs: PrivateInputs,
  _publicInputs: PublicInputs,
): boolean => {
  const value = privateInputs.values["value"];
  if (value === undefined) {
    throw new Error("Value required for range proof");
  }

  const val = BigInt(String(value));
  if (val < 0n) {
    throw new Error("Value must be non-negative for range proof");
  }

  return true;
};

/**
 * Utility functions for working with proofs
 */
export const ProofUtils = {
  /**
   * Creates a commitment to a value with randomness
   */
  createCommitment: (
    value: bigint,
    randomness: bigint,
  ): Result<Commitment, ProofError> => {
    return Result.tryCatch(
      () => {
        // Mock commitment scheme: comm = hash(value || randomness)
        const commitmentValue = value + randomness; // Simplified
        const commitment = `comm_${commitmentValue.toString(16)}`;

        return {
          value,
          randomness,
          commitment,
          openingProof: `proof_${commitment}`,
        };
      },
      (error): ProofError => ({
        type: "COMMITMENT_INVALID",
        message: `Commitment creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }),
    );
  },

  /**
   * Creates a nullifier from secret key and commitment
   */
  createNullifier: (
    secretKey: Uint8Array,
    commitment: string,
    merkleProof: readonly string[],
  ): Result<Nullifier, ProofError> => {
    return Result.tryCatch(
      () => {
        // Mock nullifier generation
        const skHash = Array.from(secretKey).reduce(
          (acc, byte) => acc + byte,
          0,
        );
        const nullifier = `null_${skHash.toString(16)}_${commitment.slice(-8)}`;

        return {
          secretKey,
          commitment,
          nullifier,
          merkleProof,
        };
      },
      (error): ProofError => ({
        type: "NULLIFIER_ALREADY_SPENT",
        message: `Nullifier creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }),
    );
  },

  /**
   * Validates that a nullifier hasn't been spent
   */
  isNullifierSpent: (
    nullifier: string,
    spentNullifiers: readonly string[],
  ): boolean => {
    return spentNullifiers.includes(nullifier);
  },

  /**
   * Extracts public inputs from a proof
   */
  extractPublicInputs: (proof: ZKProof): readonly string[] => {
    return proof.publicSignals;
  },

  /**
   * Estimates proof generation time
   */
  estimateProvingTime: (circuit: CircuitType): number => {
    const timingEstimates: Record<CircuitType, number> = {
      [CircuitType.TRANSFER]: 2000, // 2 seconds
      [CircuitType.SHIELDED_POOL_ENTRY]: 3000, // 3 seconds
      [CircuitType.SHIELDED_POOL_EXIT]: 2500,
      [CircuitType.PRIVATE_COMPUTATION]: 10000, // 10 seconds
      [CircuitType.IDENTITY_PROOF]: 1500,
      [CircuitType.RANGE_PROOF]: 1000,
      [CircuitType.MEMBERSHIP_PROOF]: 2000,
    };

    return timingEstimates[circuit] || 5000;
  },

  /**
   * Checks if two proofs are equivalent
   */
  areProofsEqual: (proof1: ZKProof, proof2: ZKProof): boolean => {
    return (
      proof1.proof === proof2.proof &&
      proof1.circuit === proof2.circuit &&
      proof1.system === proof2.system &&
      JSON.stringify(proof1.publicSignals) ===
        JSON.stringify(proof2.publicSignals)
    );
  },
} as const;
