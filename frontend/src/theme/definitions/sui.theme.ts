/**
 * Sui Blockchain Theme Definition
 * Light ocean aesthetic with soft blues and gentle waves
 */

import { BlockchainTheme } from '../core/types';

export const suiTheme: BlockchainTheme = {
  id: 'sui',
  chainId: 'sui',
  name: 'Sui Network',
  description: 'Light ocean breeze aesthetic with soft blues and flowing animations',
  
  colors: {
    primary: {
      50: '#F0F8FF',
      100: '#E6F3FF',
      200: '#CCE7FF',
      300: '#A3D5FF',
      400: '#7BB8FF',
      500: '#4DA2FF', // Main Sui blue
      600: '#2E8FFF',
      700: '#1A7CE6',
      800: '#0D69CC',
      900: '#0055AA',
      950: '#003D7A',
    },
    secondary: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF',
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
      950: '#001A4D',
    },
    accent: {
      50: '#F0FCFF',
      100: '#E6FAFE',
      200: '#B7F1FC',
      300: '#7EE5F9',
      400: '#3DD4F2',
      500: '#11BCE1',
      600: '#0B9EBF',
      700: '#0E829B',
      800: '#14677D',
      900: '#155468',
      950: '#083A46',
    },
    background: {
      primary: '#F8FBFF',
      secondary: '#F0F8FF',
      tertiary: '#E6F3FF',
      overlay: 'rgba(77, 162, 255, 0.05)',
    },
    surface: {
      base: 'rgba(255, 255, 255, 0.95)',
      elevated: 'rgba(255, 255, 255, 0.98)',
      overlay: 'rgba(77, 162, 255, 0.08)',
      hover: 'rgba(77, 162, 255, 0.12)',
      active: 'rgba(77, 162, 255, 0.16)',
    },
    text: {
      primary: '#0B2545',
      secondary: '#2E5F8F',
      tertiary: '#5A89B8',
      disabled: 'rgba(11, 37, 69, 0.38)',
      inverse: '#FFFFFF',
    },
    border: {
      subtle: 'rgba(77, 162, 255, 0.12)',
      default: 'rgba(77, 162, 255, 0.20)',
      emphasis: 'rgba(77, 162, 255, 0.30)',
      strong: 'rgba(77, 162, 255, 0.40)',
    },
    status: {
      success: '#52C41A',
      warning: '#FAAD14',
      error: '#FF4D4F',
      info: '#1890FF',
    },
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #4DA2FF 0%, #7BB8FF 50%, #A3D5FF 100%)',
    secondary: 'linear-gradient(135deg, #1890FF 0%, #40A9FF 50%, #69C0FF 100%)',
    background: 'radial-gradient(ellipse at top, #F8FBFF 0%, #E6F3FF 50%, #CCE7FF 100%)',
    hero: 'linear-gradient(180deg, rgba(77, 162, 255, 0.1) 0%, rgba(77, 162, 255, 0.05) 50%, transparent 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.95) 100%)',
    button: 'linear-gradient(135deg, #4DA2FF 0%, #2E8FFF 100%)',
  },
  
  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px',
    },
    shadow: {
      sm: '0 1px 3px rgba(77, 162, 255, 0.12)',
      md: '0 4px 6px rgba(77, 162, 255, 0.15)',
      lg: '0 10px 15px rgba(77, 162, 255, 0.20)',
      xl: '0 20px 25px rgba(77, 162, 255, 0.25)',
      glow: '0 0 30px rgba(77, 162, 255, 0.4)',
    },
    glow: {
      primary: '0 0 20px rgba(77, 162, 255, 0.5)',
      secondary: '0 0 20px rgba(24, 144, 255, 0.4)',
      accent: '0 0 20px rgba(17, 188, 225, 0.4)',
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
      count: 80,
      speed: 0.5,
      color: '#7BB8FF',
      size: 2,
    },
    waves: {
      enabled: true,
      amplitude: 20,
      frequency: 0.02,
      color: 'rgba(77, 162, 255, 0.15)',
    },
  },
  
  typography: {
    fontFamily: {
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
    logo: '/sui-assets/logo.svg',
    icon: '/sui-assets/icon.svg',
    background: {
      pattern: '/sui-assets/wave-pattern.svg',
    },
    illustrations: {
      hero: '/sui-assets/ocean-waves.svg',
      404: '/sui-assets/lost-at-sea.svg',
    },
  },
  
  cssVariables: {
    '--theme-roundness': '12px',
    '--theme-spacing-unit': '8px',
    '--theme-transition-speed': '400ms',
    '--theme-glass-opacity': '0.95',
    '--theme-overlay-opacity': '0.08',
  },
};