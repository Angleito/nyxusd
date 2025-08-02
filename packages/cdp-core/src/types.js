"use strict";
/**
 * Core CDP (Collateralized Debt Position) type definitions
 *
 * This module defines the fundamental types for CDP operations in the NyxUSD system.
 * All types follow functional programming principles with immutable data structures
 * and discriminated unions for type safety.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkTimestamp = exports.mkCollateralizationRatio = exports.mkAmount = exports.mkCDPId = void 0;
/**
 * Creates a CDP identifier from a string
 * @param id - The string identifier
 * @returns A branded CDP identifier
 */
const mkCDPId = (id) => id;
exports.mkCDPId = mkCDPId;
/**
 * Creates an Amount from a BigInt
 * @param value - The BigInt value
 * @returns A branded Amount
 */
const mkAmount = (value) => value;
exports.mkAmount = mkAmount;
/**
 * Creates a CollateralizationRatio from a number
 * @param ratio - The ratio in basis points
 * @returns A branded CollateralizationRatio
 */
const mkCollateralizationRatio = (ratio) => ratio;
exports.mkCollateralizationRatio = mkCollateralizationRatio;
/**
 * Creates a Timestamp from a number
 * @param ms - Milliseconds since Unix epoch
 * @returns A branded Timestamp
 */
const mkTimestamp = (ms) => ms;
exports.mkTimestamp = mkTimestamp;
//# sourceMappingURL=types.js.map