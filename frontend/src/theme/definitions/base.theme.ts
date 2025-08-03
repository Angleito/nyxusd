/**
 * Base Blockchain Theme Definition
 * Deep ocean aesthetic with medium blues and electric effects
 */

import { BlockchainTheme } from '../core/types';

export const baseTheme: BlockchainTheme = {
  id: 'base',
  chainId: 'base',
  name: 'Base Network',
  description: 'Deep ocean aesthetic with electric blues and dynamic currents',
  
  colors: {
    primary: {
      50: '#E6F0FF',
      100: '#B8D4FF',
      200: '#8AB8FF',
      300: '#5C9CFF',
      400: '#2E80FF',
      500: '#0052FF', // Main Base blue
      600: '#0041CC',
      700: '#003199',
      800: '#002166',
      900: '#001133',
      950: '#00081A',
    },
    secondary: {
      50: '#E8F4FF',
      100: '#C2E2FF',
      200: '#99CFFF',
      300: '#70BCFF',
      400: '#47A9FF',
      500: '#1E96FF',
      600: '#0077DB',
      700: '#005BB7',
      800: '#004493',
      900: '#002D6F',
      950: '#001A42',
    },
    accent: {
      50: '#E6F9FF',
      100: '#B3EDFF',
      200: '#80E1FF',
      300: '#4DD5FF',
      400: '#1AC9FF',
      500: '#00B8F0',
      600: '#0099CC',
      700: '#007AA8',
      800: '#005B84',
      900: '#003C60',
      950: '#001D30',
    },
    background: {
      primary: '#000814',
      secondary: '#001122',
      tertiary: '#001933',
      overlay: 'rgba(0, 82, 255, 0.08)',
    },
    surface: {
      base: 'rgba(0, 17, 34, 0.95)',
      elevated: 'rgba(0, 25, 51, 0.98)',
      overlay: 'rgba(0, 82, 255, 0.10)',
      hover: 'rgba(0, 82, 255, 0.15)',
      active: 'rgba(0, 82, 255, 0.20)',
    },
    text: {
      primary: '#E6F3FF',
      secondary: '#B3D9FF',
      tertiary: '#80BFFF',
      disabled: 'rgba(230, 243, 255, 0.38)',
      inverse: '#000814',
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
    primary: 'linear-gradient(135deg, #0052FF 0%, #0077DB 50%, #00B8F0 100%)',
    secondary: 'linear-gradient(135deg, #001133 0%, #002166 50%, #003199 100%)',
    background: 'radial-gradient(ellipse at bottom, #001933 0%, #001122 40%, #000814 100%)',
    hero: 'linear-gradient(180deg, rgba(0, 82, 255, 0.2) 0%, rgba(0, 82, 255, 0.1) 50%, transparent 100%)',
    card: 'linear-gradient(135deg, rgba(0, 25, 51, 0.9) 0%, rgba(0, 17, 34, 0.95) 100%)',
    button: 'linear-gradient(135deg, #0052FF 0%, #0041CC 100%)',
  },
  
  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '32px',
    },
    shadow: {
      sm: '0 2px 4px rgba(0, 82, 255, 0.2)',
      md: '0 4px 8px rgba(0, 82, 255, 0.25)',
      lg: '0 8px 16px rgba(0, 82, 255, 0.3)',
      xl: '0 16px 32px rgba(0, 82, 255, 0.35)',
      glow: '0 0 40px rgba(0, 82, 255, 0.6)',
    },
    glow: {
      primary: '0 0 30px rgba(0, 82, 255, 0.7)',
      secondary: '0 0 25px rgba(30, 150, 255, 0.6)',
      accent: '0 0 20px rgba(0, 184, 240, 0.5)',
    },
  },
  
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 600,
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    particles: {
      enabled: true,
      count: 120,
      speed: 0.8,
      color: '#0052FF',
      size: 3,
    },
    waves: {
      enabled: true,
      amplitude: 30,
      frequency: 0.015,
      color: 'rgba(0, 82, 255, 0.25)',
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
      pattern: '/base-assets/ocean-current.svg',
      video: '/base-assets/deep-ocean.mp4',
    },
    illustrations: {
      hero: '/base-assets/ocean-depths.svg',
      404: '/base-assets/deep-dive.svg',
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