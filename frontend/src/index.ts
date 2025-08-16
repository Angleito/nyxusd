/**
 * NyxUSD Frontend Package
 * 
 * This package provides the main React frontend for the NyxUSD CDP system.
 * Includes components, hooks, services, and utilities for the web interface.
 */

// Main App component
export { default as App } from './App';

// Core modules
export * from './components';
export * from './config';
export * from './connectors';
export * from './contexts';
export * from './hooks';
export * from './lib';
export * from './pages';
export * from './providers';
export * from './services';
export * from './theme';
export * from './types';
export * from './utils';

// Data and test utilities
export * from './data';
export * from './test';

// Note: nyx-design-system is handled separately to avoid conflicts
// with the standalone nyx-design-system package