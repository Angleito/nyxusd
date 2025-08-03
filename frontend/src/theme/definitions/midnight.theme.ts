/**
 * Midnight Protocol Theme Definition (Default)
 * Cosmic dark aesthetic with purple and cyan accents
 */

import { BlockchainTheme } from '../core/types';

export const midnightTheme: BlockchainTheme = {
  id: 'midnight',
  chainId: 'midnight',
  name: 'Midnight Protocol',
  description: 'Cosmic dark aesthetic with purple nebulas and starfield effects',
  
  colors: {
    primary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
      950: '#2E1065',
    },
    secondary: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4',
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
      950: '#083344',
    },
    accent: {
      50: '#FDF4FF',
      100: '#FAE8FF',
      200: '#F5D0FE',
      300: '#F0ABFC',
      400: '#E879F9',
      500: '#D946EF',
      600: '#C026D3',
      700: '#A21CAF',
      800: '#86198F',
      900: '#701A75',
      950: '#4A044E',
    },
    background: {
      primary: '#000000',
      secondary: '#0a0a0f',
      tertiary: '#1a1a2e',
      overlay: 'rgba(139, 92, 246, 0.05)',
    },
    surface: {
      base: 'rgba(10, 10, 15, 0.95)',
      elevated: 'rgba(26, 26, 46, 0.98)',
      overlay: 'rgba(139, 92, 246, 0.08)',
      hover: 'rgba(139, 92, 246, 0.12)',
      active: 'rgba(139, 92, 246, 0.16)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.87)',
      tertiary: 'rgba(255, 255, 255, 0.60)',
      disabled: 'rgba(255, 255, 255, 0.38)',
      inverse: '#000000',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      default: 'rgba(255, 255, 255, 0.12)',
      emphasis: 'rgba(255, 255, 255, 0.20)',
      strong: 'rgba(255, 255, 255, 0.30)',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
    secondary: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)',
    background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 40%, #000000 100%)',
    hero: 'linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
    card: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
    button: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  },
  
  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '20px',
      xl: '40px',
    },
    shadow: {
      sm: '0 1px 3px rgba(139, 92, 246, 0.12)',
      md: '0 4px 6px rgba(139, 92, 246, 0.15)',
      lg: '0 10px 15px rgba(139, 92, 246, 0.20)',
      xl: '0 20px 25px rgba(139, 92, 246, 0.25)',
      glow: '0 0 50px rgba(139, 92, 246, 0.5)',
    },
    glow: {
      primary: '0 0 40px rgba(139, 92, 246, 0.6)',
      secondary: '0 0 30px rgba(6, 182, 212, 0.5)',
      accent: '0 0 25px rgba(217, 70, 239, 0.5)',
    },
  },
  
  animations: {
    duration: {
      fast: 200,
      normal: 400,
      slow: 800,
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    particles: {
      enabled: true,
      count: 150,
      speed: 0.3,
      color: '#8B5CF6',
      size: 2,
    },
    waves: {
      enabled: false,
      amplitude: 0,
      frequency: 0,
      color: 'transparent',
    },
  },
  
  typography: {
    fontFamily: {
      heading: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  assets: {
    logo: '/nyx-assets/images/nyx-logo.svg',
    icon: '/nyx-assets/images/nyx-icon.svg',
    background: {
      pattern: '/nyx-assets/starfield.svg',
    },
    illustrations: {
      hero: '/nyx-assets/cosmic-nebula.svg',
      404: '/nyx-assets/lost-in-space.svg',
    },
  },
  
  cssVariables: {
    '--theme-roundness': '12px',
    '--theme-spacing-unit': '8px',
    '--theme-transition-speed': '400ms',
    '--theme-glass-opacity': '0.90',
    '--theme-overlay-opacity': '0.10',
  },
};