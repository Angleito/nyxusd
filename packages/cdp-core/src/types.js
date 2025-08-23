/**
 * Core CDP (Collateralized Debt Position) type definitions
 *
 * This module defines the fundamental types for CDP operations in the NyxUSD system.
 * All types follow functional programming principles with immutable data structures
 * and discriminated unions for type safety.
 *
 * @packageDocumentation
 */
/**
 * Creates a CDP identifier from a string
 * @param id - The string identifier
 * @returns A branded CDP identifier
 */
export const mkCDPId = (id) => id;
/**
 * Creates an Amount from a BigInt
 * @param value - The BigInt value
 * @returns A branded Amount
 */
export const mkAmount = (value) => value;
/**
 * Creates a CollateralizationRatio from a number
 * @param ratio - The ratio in basis points
 * @returns A branded CollateralizationRatio
 */
export const mkCollateralizationRatio = (ratio) => ratio;
/**
 * Creates a Timestamp from a number
 * @param ms - Milliseconds since Unix epoch
 * @returns A branded Timestamp
 */
export const mkTimestamp = (ms) => ms;
//# sourceMappingURL=types.js.map