/**
 * NyxUSD Core Package
 *
 * This package contains the core business logic types and interfaces for the
 * NyxUSD CDP system on the Midnight protocol. It follows functional programming
 * principles with immutable data structures and comprehensive type safety.
 *
 * @packageDocumentation
 */

// Export all CDP-related types
export * from "@nyxusd/cdp-core";

// Export all collateral-related types
export * from "./types/collateral";

// Export all state-related types
export * from "./types/state";

// Note: fp-ts re-exports will be added once dependencies are properly installed
