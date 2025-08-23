/**
 * NyxUSD Design System
 * 
 * A comprehensive design system for the NyxUSD CDP platform.
 * Provides design tokens, component styles, and utilities for consistent UI/UX.
 * 
 * @version 1.0.0
 * @author NyxUSD Team
 * @license MIT
 */

// Design tokens
export * from './styles/tokens';

// Component styles
export * from './styles/components';

// Utility styles
export * from './styles/utilities';

// Package metadata
export const DESIGN_SYSTEM_VERSION = "1.0.0";

export const DESIGN_SYSTEM_INFO = {
  name: "@nyxusd/design-system",
  version: DESIGN_SYSTEM_VERSION,
  description: "NyxUSD Design System - Comprehensive design tokens and component styles",
  features: {
    DESIGN_TOKENS: true,
    COMPONENT_STYLES: true,
    UTILITY_CLASSES: true,
    THEME_SUPPORT: true,
    RESPONSIVE_DESIGN: true,
  },
  tokens: {
    COLORS: true,
    TYPOGRAPHY: true,
    SPACING: true,
    SHADOWS: true,
    BORDERS: true,
    ANIMATIONS: true,
  },
} as const;

// Default export
export default DESIGN_SYSTEM_INFO;