/**
 * Theme Definitions Export
 * Central export for all blockchain theme definitions
 */

export { midnightTheme } from './midnight.theme';
export { suiTheme } from './sui.theme';
export { baseTheme } from './base.theme';

import { midnightTheme } from './midnight.theme';
import { suiTheme } from './sui.theme';
import { baseTheme } from './base.theme';
import { BlockchainTheme } from '../core/types';

export const themes: Record<string, BlockchainTheme> = {
  midnight: midnightTheme,
  sui: suiTheme,
  base: baseTheme,
};

export const defaultTheme = baseTheme; // Default to Base theme