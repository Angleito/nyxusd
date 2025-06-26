/**
 * Mathematical Operations Module
 * 
 * This module contains financial mathematics functions for CDP operations
 * including interest calculations, collateralization ratio computations,
 * fee calculations, and precision-safe BigInt arithmetic operations.
 * 
 * All functions are pure, side-effect free, and use BigInt arithmetic
 * for precision in financial calculations. Error handling is done through
 * Result types for explicit error propagation.
 * 
 * @packageDocumentation
 */

// Re-export all mathematical operations
export * from './types'
export * from './ratio'
export * from './interest'
export * from './fees'

export const MATH_MODULE_VERSION = '1.0.0'