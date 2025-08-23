/**
 * NyxUSD Frontend Package
 * 
 * Simplified exports for build deployment
 */

// Main App component
export { default as App } from './App';

// Essential modules only
export * from './components';
export { ChainProvider } from './contexts/ChainContext';
export { ThemeProvider } from './contexts/ThemeContext';
export { AIAssistantProvider } from './providers/AIAssistantProvider';
export { EnhancedAIProvider } from './providers/EnhancedAIProvider';
export { WalletProvider } from './providers/WalletProvider';