/**
 * Base Blockchain Theme Definition
 * Modern Ethereum L2 aesthetic with clean blues and blockchain elements
 */

import { BlockchainTheme } from '../core/types';

export const baseTheme: BlockchainTheme = {
  id: 'base',
  chainId: 'base',
  name: 'Base Network',
  description: 'Modern Ethereum L2 with clean blues and blockchain-inspired design',
  
  colors: {
    primary: {
      50: '#EBF2FF',
      100: '#D6E4FF',
      200: '#ADC9FF',
      300: '#85ADFF',
      400: '#5C92FF',
      500: '#0052FF', // Main Base blue
      600: '#0047E0',
      700: '#003BB8',
      800: '#002F90',
      900: '#002368',
      950: '#001640',
    },
    secondary: {
      50: '#F0F2F5',
      100: '#E1E5EB',
      200: '#C3CBD7',
      300: '#A5B1C3',
      400: '#8797AF',
      500: '#697D9B',
      600: '#546382',
      700: '#3F4968',
      800: '#2A2F4F',
      900: '#1B1F36',
      950: '#0C0E1D',
    },
    accent: {
      50: '#E5F6FF',
      100: '#B8E7FF',
      200: '#70CFFF',
      300: '#29B7FF',
      400: '#0099E0',
      500: '#007CC2',
      600: '#0066A3',
      700: '#005085',
      800: '#003A66',
      900: '#002447',
      950: '#001229',
    },
    background: {
      primary: '#0A0B0F',
      secondary: '#12141A',
      tertiary: '#1A1C24',
      overlay: 'rgba(0, 82, 255, 0.05)',
    },
    surface: {
      base: 'rgba(18, 20, 26, 0.95)',
      elevated: 'rgba(26, 28, 36, 0.98)',
      overlay: 'rgba(0, 82, 255, 0.08)',
      hover: 'rgba(0, 82, 255, 0.12)',
      active: 'rgba(0, 82, 255, 0.16)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C1C7D0',
      tertiary: '#8B95A6',
      disabled: 'rgba(255, 255, 255, 0.38)',
      inverse: '#0A0B0F',
    },
    border: {
      subtle: 'rgba(0, 82, 255, 0.15)',
      default: 'rgba(0, 82, 255, 0.25)',
      emphasis: 'rgba(0, 82, 255, 0.35)',
      strong: 'rgba(0, 82, 255, 0.50)',
    },
    status: {
      success: '#00D97E',
      warning: '#FFB94A',
      error: '#FF6B6B',
      info: '#4DD5FF',
    },
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #0052FF 0%, #0047E0 100%)',
    secondary: 'linear-gradient(135deg, #1A1C24 0%, #12141A 100%)',
    background: 'linear-gradient(135deg, #0A0B0F 0%, #12141A 50%, #1A1C24 100%)',
    hero: 'linear-gradient(180deg, rgba(0, 82, 255, 0.15) 0%, rgba(0, 82, 255, 0.05) 50%, transparent 100%)',
    card: 'linear-gradient(135deg, rgba(26, 28, 36, 0.6) 0%, rgba(18, 20, 26, 0.8) 100%)',
    button: 'linear-gradient(90deg, #0052FF 0%, #0047E0 100%)',
  },
  
  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '20px',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.2)',
      md: '0 4px 6px rgba(0, 0, 0, 0.25)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.35)',
      glow: '0 0 20px rgba(0, 82, 255, 0.4)',
    },
    glow: {
      primary: '0 0 20px rgba(0, 82, 255, 0.5)',
      secondary: '0 0 15px rgba(0, 82, 255, 0.3)',
      accent: '0 0 10px rgba(0, 124, 194, 0.4)',
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
      count: 60,
      speed: 0.3,
      color: '#0052FF',
      size: 2,
    },
    waves: {
      enabled: false, // No ocean waves - use blockchain grid instead
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
    logo: '/base-assets/logo.svg',
    icon: '/base-assets/icon.svg',
    background: {
      pattern: '/base-assets/blockchain-grid.svg',
    },
    illustrations: {
      hero: '/base-assets/ethereum-network.svg',
      404: '/base-assets/blockchain-404.svg',
    },
  },
  
  cssVariables: {
    '--theme-roundness': '8px',
    '--theme-spacing-unit': '8px',
    '--theme-transition-speed': '300ms',
    '--theme-glass-opacity': '0.85',
    '--theme-overlay-opacity': '0.12',
  },
};