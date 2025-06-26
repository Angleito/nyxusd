/**
 * Compact Language Helpers for Midnight Protocol
 * 
 * Compact is Midnight's domain-specific language for writing smart contracts
 * that support zero-knowledge proofs and privacy-preserving computations.
 * 
 * This module provides utilities for:
 * - Encoding function calls and parameters
 * - Decoding contract results
 * - Address validation
 * - Error formatting and handling
 * - ABI interaction helpers
 */

import { Result } from '@nyxusd/fp-utils';

/**
 * Compact data types supported in smart contracts
 */
export enum CompactType {
  UINT8 = 'uint8',
  UINT16 = 'uint16',
  UINT32 = 'uint32',
  UINT64 = 'uint64',
  UINT128 = 'uint128',
  UINT256 = 'uint256',
  INT8 = 'int8',
  INT16 = 'int16',
  INT32 = 'int32',
  INT64 = 'int64',
  INT128 = 'int128',
  INT256 = 'int256',
  BOOL = 'bool',
  STRING = 'string',
  BYTES = 'bytes',
  ADDRESS = 'address',
  ARRAY = 'array',
  STRUCT = 'struct',
  OPTION = 'option',
  PRIVATE = 'private',
}

/**
 * Error types for Compact operations
 */
export type CompactError = 
  | { type: 'INVALID_ADDRESS'; message: string }
  | { type: 'INVALID_FUNCTION'; message: string }
  | { type: 'INVALID_PARAMETERS'; message: string }
  | { type: 'ENCODING_FAILED'; message: string }
  | { type: 'DECODING_FAILED'; message: string }
  | { type: 'TYPE_MISMATCH'; message: string }
  | { type: 'INVALID_ABI'; message: string }
  | { type: 'CONTRACT_ERROR'; message: string; code: number };

/**
 * Compact function parameter definition
 */
export interface CompactParameter {
  readonly name: string;
  readonly type: CompactType;
  readonly value: unknown;
  readonly isPrivate?: boolean;
}

/**
 * Compact function signature
 */
export interface CompactFunction {
  readonly name: string;
  readonly parameters: readonly CompactParameter[];
  readonly returnType: CompactType;
  readonly visibility: 'public' | 'private' | 'internal';
}

/**
 * Compact contract ABI definition
 */
export interface CompactABI {
  readonly contractName: string;
  readonly version: string;
  readonly functions: readonly CompactFunction[];
  readonly events: readonly CompactEvent[];
  readonly structs: readonly CompactStruct[];
}

/**
 * Compact event definition
 */
export interface CompactEvent {
  readonly name: string;
  readonly parameters: readonly CompactParameter[];
  readonly anonymous?: boolean;
}

/**
 * Compact struct definition
 */
export interface CompactStruct {
  readonly name: string;
  readonly fields: readonly CompactParameter[];
}

/**
 * Encoded calldata result
 */
export interface EncodedCalldata {
  readonly functionSelector: string;
  readonly encodedParameters: string;
  readonly fullCalldata: string;
  readonly gasEstimate: bigint;
}

/**
 * Decoded result from contract call
 */
export interface DecodedResult {
  readonly success: boolean;
  readonly returnValue: unknown;
  readonly gasUsed: bigint;
  readonly logs: readonly string[];
}

/**
 * Compact address format validation
 */
export const COMPACT_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Function selector calculation (first 4 bytes of keccak256 hash)
 */
const calculateFunctionSelector = (signature: string): string => {
  // Mock implementation - in real implementation, would use actual keccak256
  const mockHash = signature.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  return `0x${(mockHash >>> 0).toString(16).padStart(8, '0').slice(0, 8)}`;
};

/**
 * Validates a Compact contract address
 * @param address - Address string to validate
 * @returns Result containing boolean validation result or error
 */
export const validateCompactAddress = (address: string): Result<boolean, CompactError> => {
  return Result.tryCatch(
    () => {
      if (!address || typeof address !== 'string') {
        throw new Error('Address must be a non-empty string');
      }
      
      const trimmed = address.trim();
      
      if (!COMPACT_ADDRESS_REGEX.test(trimmed)) {
        throw new Error('Address must be a valid hex string starting with 0x and 40 characters long');
      }
      
      // Additional checksum validation could be added here
      return true;
    },
    (error): CompactError => ({
      type: 'INVALID_ADDRESS',
      message: `Address validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );
};

/**
 * Encodes function call parameters into calldata
 * @param functionName - Name of the function to call
 * @param parameters - Array of parameters with types and values
 * @returns Result containing encoded calldata or error
 */
export const encodeCompactCalldata = (
  functionName: string,
  parameters: readonly CompactParameter[]
): Result<EncodedCalldata, CompactError> => {
  return Result.tryCatch(
    () => {
      if (!functionName || typeof functionName !== 'string') {
        throw new Error('Function name must be a non-empty string');
      }
      
      if (!Array.isArray(parameters)) {
        throw new Error('Parameters must be an array');
      }
      
      // Build function signature
      const paramTypes = parameters.map(param => {
        if (!param.type || !Object.values(CompactType).includes(param.type)) {
          throw new Error(`Invalid parameter type: ${param.type}`);
        }
        return param.isPrivate ? `private(${param.type})` : param.type;
      });
      
      const functionSignature = `${functionName}(${paramTypes.join(',')})`;
      const functionSelector = calculateFunctionSelector(functionSignature);
      
      // Encode parameters (mock implementation)
      const encodedParams = parameters.map((param) => {
        return encodeParameter(param.type, param.value, param.isPrivate || false);
      });
      
      const encodedParameters = encodedParams.join('');
      const fullCalldata = functionSelector + encodedParameters;
      
      // Estimate gas based on calldata size and complexity
      const gasEstimate = BigInt(21000 + fullCalldata.length * 16 + parameters.length * 1000);
      
      return {
        functionSelector,
        encodedParameters,
        fullCalldata,
        gasEstimate
      };
    },
    (error): CompactError => ({
      type: 'ENCODING_FAILED',
      message: `Calldata encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );
};

/**
 * Encodes a single parameter based on its type
 * @param type - Parameter type
 * @param value - Parameter value
 * @param isPrivate - Whether the parameter is private
 * @returns Encoded parameter string
 */
const encodeParameter = (type: CompactType, value: unknown, isPrivate: boolean): string => {
  // Mock encoding implementation - real implementation would use proper ABI encoding
  
  if (isPrivate) {
    // Private parameters are handled differently in Compact
    return `PRIVATE(${JSON.stringify(value)})`.padEnd(64, '0');
  }
  
  switch (type) {
    case CompactType.UINT8:
    case CompactType.UINT16:
    case CompactType.UINT32:
    case CompactType.UINT64:
    case CompactType.UINT128:
    case CompactType.UINT256:
      const num = typeof value === 'bigint' ? value : BigInt(value as string | number);
      return num.toString(16).padStart(64, '0');
      
    case CompactType.INT8:
    case CompactType.INT16:
    case CompactType.INT32:
    case CompactType.INT64:
    case CompactType.INT128:
    case CompactType.INT256:
      const signedNum = typeof value === 'bigint' ? value : BigInt(value as string | number);
      // Two's complement for negative numbers
      const hex = signedNum >= 0n ? 
        signedNum.toString(16).padStart(64, '0') :
        (BigInt('0x' + 'f'.repeat(64)) + signedNum + 1n).toString(16).slice(-64);
      return hex;
      
    case CompactType.BOOL:
      return (value ? '1' : '0').padStart(64, '0');
      
    case CompactType.STRING:
      const str = String(value);
      const bytes = Buffer.from(str, 'utf8');
      return bytes.toString('hex').padEnd(64, '0');
      
    case CompactType.BYTES:
      const bytesValue = value as Uint8Array | string;
      if (typeof bytesValue === 'string') {
        return bytesValue.replace('0x', '').padEnd(64, '0');
      }
      return Buffer.from(bytesValue).toString('hex').padEnd(64, '0');
      
    case CompactType.ADDRESS:
      const addr = String(value).replace('0x', '');
      return addr.padStart(64, '0');
      
    case CompactType.ARRAY:
      // Arrays need special handling
      const arr = value as unknown[];
      return arr.length.toString(16).padStart(64, '0');
      
    case CompactType.OPTION:
      // Option types in Compact (Some/None)
      const option = value as { isSome: boolean; value?: unknown };
      return option.isSome ? '01' + encodeParameter(CompactType.UINT256, option.value || 0, false).slice(2) : '00'.padEnd(64, '0');
      
    default:
      throw new Error(`Unsupported parameter type: ${type}`);
  }
};

/**
 * Decodes contract call result based on expected types
 * @param rawResult - Raw result from contract call
 * @param expectedTypes - Expected return types
 * @returns Result containing decoded values or error
 */
export const decodeCompactResult = (
  rawResult: string,
  expectedTypes: readonly CompactType[]
): Result<DecodedResult, CompactError> => {
  return Result.tryCatch(
    () => {
      if (!rawResult || typeof rawResult !== 'string') {
        throw new Error('Raw result must be a non-empty string');
      }
      
      if (!Array.isArray(expectedTypes)) {
        throw new Error('Expected types must be an array');
      }
      
      // Mock decoding - remove 0x prefix if present
      const cleanResult = rawResult.replace(/^0x/, '');
      
      if (cleanResult.length === 0) {
        throw new Error('Empty result data');
      }
      
      // Check for error prefix (mock implementation)
      if (cleanResult.startsWith('08c379a0')) {
        // Standard error signature
        throw new Error('Contract execution reverted');
      }
      
      const decodedValues: unknown[] = [];
      let offset = 0;
      
      for (const type of expectedTypes) {
        if (offset >= cleanResult.length) {
          throw new Error('Insufficient data for decoding');
        }
        
        const chunk = cleanResult.slice(offset, offset + 64);
        const decoded = decodeParameter(type, chunk);
        decodedValues.push(decoded);
        offset += 64;
      }
      
      return {
        success: true,
        returnValue: decodedValues.length === 1 ? decodedValues[0] : decodedValues,
        gasUsed: BigInt(21000), // Mock gas usage
        logs: [] // Mock logs
      };
    },
    (error): CompactError => ({
      type: 'DECODING_FAILED',
      message: `Result decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );
};

/**
 * Decodes a single parameter based on its type
 * @param type - Parameter type
 * @param data - Hex data string (64 characters)
 * @returns Decoded value
 */
const decodeParameter = (type: CompactType, data: string): unknown => {
  if (data.length !== 64) {
    throw new Error('Invalid data length for parameter decoding');
  }
  
  switch (type) {
    case CompactType.UINT8:
    case CompactType.UINT16:
    case CompactType.UINT32:
    case CompactType.UINT64:
    case CompactType.UINT128:
    case CompactType.UINT256:
      return BigInt('0x' + data);
      
    case CompactType.INT8:
    case CompactType.INT16:
    case CompactType.INT32:
    case CompactType.INT64:
    case CompactType.INT128:
    case CompactType.INT256:
      const value = BigInt('0x' + data);
      // Check if negative (MSB set)
      const maxPositive = BigInt('0x' + '7'.padEnd(64, 'f'));
      return value > maxPositive ? value - BigInt('0x1' + '0'.repeat(64)) : value;
      
    case CompactType.BOOL:
      return data !== '0'.repeat(64);
      
    case CompactType.STRING:
      return Buffer.from(data.replace(/0+$/, ''), 'hex').toString('utf8');
      
    case CompactType.BYTES:
      return '0x' + data.replace(/0+$/, '');
      
    case CompactType.ADDRESS:
      return '0x' + data.slice(-40);
      
    case CompactType.ARRAY:
      return Number(BigInt('0x' + data));
      
    case CompactType.OPTION:
      const isNone = data.startsWith('00');
      if (isNone) {
        return { isSome: false, value: undefined };
      }
      const innerValue = decodeParameter(CompactType.UINT256, data.slice(2));
      return { isSome: true, value: innerValue };
      
    default:
      throw new Error(`Unsupported parameter type for decoding: ${type}`);
  }
};

/**
 * Formats Compact contract errors into readable messages
 * @param errorCode - Error code from contract
 * @param message - Error message
 * @returns Result containing formatted error or parsing error
 */
export const formatCompactError = (
  errorCode: number,
  message: string
): Result<CompactError, CompactError> => {
  return Result.tryCatch(
    () => {
      const knownErrors: Record<number, string> = {
        0x01: 'Assertion failed',
        0x02: 'Arithmetic overflow',
        0x03: 'Division by zero',
        0x04: 'Index out of bounds',
        0x05: 'Invalid state transition',
        0x06: 'Insufficient balance',
        0x07: 'Access denied',
        0x08: 'Invalid signature',
        0x09: 'Deadline exceeded',
        0x0A: 'Invalid proof',
      };
      
      const standardMessage = knownErrors[errorCode] || 'Unknown contract error';
      const fullMessage = message ? `${standardMessage}: ${message}` : standardMessage;
      
      return {
        type: 'CONTRACT_ERROR' as const,
        message: fullMessage,
        code: errorCode
      };
    },
    (error): CompactError => ({
      type: 'INVALID_PARAMETERS',
      message: `Error formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );
};

/**
 * Validates function signature against ABI
 * @param functionName - Function name
 * @param parameters - Function parameters
 * @param abi - Contract ABI
 * @returns Result containing validation result or error
 */
export const validateFunctionCall = (
  functionName: string,
  parameters: readonly CompactParameter[],
  abi: CompactABI
): Result<boolean, CompactError> => {
  return Result.tryCatch(
    () => {
      const functionDef = abi.functions.find(f => f.name === functionName);
      
      if (!functionDef) {
        throw new Error(`Function '${functionName}' not found in ABI`);
      }
      
      if (parameters.length !== functionDef.parameters.length) {
        throw new Error(`Parameter count mismatch: expected ${functionDef.parameters.length}, got ${parameters.length}`);
      }
      
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        const expectedParam = functionDef.parameters[i];
        
        if (!param || !expectedParam) {
          throw new Error(`Parameter at index ${i} is missing`);
        }
        
        if (param.type !== expectedParam.type) {
          throw new Error(`Parameter ${i} type mismatch: expected ${expectedParam.type}, got ${param.type}`);
        }
        
        if (param.name !== expectedParam.name) {
          throw new Error(`Parameter ${i} name mismatch: expected ${expectedParam.name}, got ${param.name}`);
        }
      }
      
      return true;
    },
    (error): CompactError => ({
      type: 'INVALID_FUNCTION',
      message: `Function validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  );
};

/**
 * Creates a mock Compact ABI for testing
 * @param contractName - Name of the contract
 * @returns Mock ABI structure
 */
export const createMockCompactABI = (contractName: string): CompactABI => {
  return {
    contractName,
    version: '1.0.0',
    functions: [
      {
        name: 'transfer',
        parameters: [
          { name: 'to', type: CompactType.ADDRESS, value: undefined },
          { name: 'amount', type: CompactType.UINT256, value: undefined }
        ],
        returnType: CompactType.BOOL,
        visibility: 'public'
      },
      {
        name: 'shieldedTransfer',
        parameters: [
          { name: 'proof', type: CompactType.BYTES, value: undefined, isPrivate: true },
          { name: 'nullifiers', type: CompactType.ARRAY, value: undefined, isPrivate: true },
          { name: 'commitments', type: CompactType.ARRAY, value: undefined }
        ],
        returnType: CompactType.BOOL,
        visibility: 'public'
      },
      {
        name: 'getBalance',
        parameters: [
          { name: 'account', type: CompactType.ADDRESS, value: undefined }
        ],
        returnType: CompactType.UINT256,
        visibility: 'public'
      }
    ],
    events: [
      {
        name: 'Transfer',
        parameters: [
          { name: 'from', type: CompactType.ADDRESS, value: undefined },
          { name: 'to', type: CompactType.ADDRESS, value: undefined },
          { name: 'amount', type: CompactType.UINT256, value: undefined }
        ]
      }
    ],
    structs: [
      {
        name: 'TransferData',
        fields: [
          { name: 'recipient', type: CompactType.ADDRESS, value: undefined },
          { name: 'amount', type: CompactType.UINT256, value: undefined },
          { name: 'timestamp', type: CompactType.UINT64, value: undefined }
        ]
      }
    ]
  };
};

/**
 * Utility functions for working with Compact contracts
 */
export const CompactUtils = {
  /**
   * Generates function signature string
   */
  getFunctionSignature: (func: CompactFunction): string => {
    const paramTypes = func.parameters.map(p => 
      p.isPrivate ? `private(${p.type})` : p.type
    );
    return `${func.name}(${paramTypes.join(',')})`;
  },

  /**
   * Estimates gas cost for a function call
   */
  estimateGasCost: (func: CompactFunction, isPrivate: boolean = false): bigint => {
    const baseGas = 21000n;
    const paramGas = BigInt(func.parameters.length * 1000);
    const privacyGas = isPrivate ? 50000n : 0n;
    
    return baseGas + paramGas + privacyGas;
  },

  /**
   * Checks if a function is privacy-preserving
   */
  isPrivacyFunction: (func: CompactFunction): boolean => {
    return func.parameters.some(p => p.isPrivate) || func.visibility === 'private';
  },

  /**
   * Extracts all private parameters from a function
   */
  getPrivateParameters: (func: CompactFunction): readonly CompactParameter[] => {
    return func.parameters.filter(p => p.isPrivate);
  },

  /**
   * Validates parameter value against its type
   */
  validateParameterValue: (param: CompactParameter): Result<boolean, CompactError> => {
    return Result.tryCatch(
      () => {
        if (param.value === undefined || param.value === null) {
          throw new Error(`Parameter ${param.name} cannot be null or undefined`);
        }

        switch (param.type) {
          case CompactType.ADDRESS:
            const isValid = validateCompactAddress(String(param.value));
            if (isValid.isErr()) {
              throw new Error(isValid.value.message);
            }
            return true;

          case CompactType.BOOL:
            if (typeof param.value !== 'boolean') {
              throw new Error(`Parameter ${param.name} must be a boolean`);
            }
            return true;

          case CompactType.STRING:
            if (typeof param.value !== 'string') {
              throw new Error(`Parameter ${param.name} must be a string`);
            }
            return true;

          default:
            return true; // Skip validation for other types in mock
        }
      },
      (error): CompactError => ({
        type: 'TYPE_MISMATCH',
        message: `Parameter validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    );
  }
} as const;