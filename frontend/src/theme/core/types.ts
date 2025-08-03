/**
 * Theme System Type Definitions
 * Strict TypeScript interfaces for blockchain-specific theming
 */

export interface ColorScale {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
  readonly 950: string;
}

export interface ThemeColors {
  readonly primary: ColorScale;
  readonly secondary: ColorScale;
  readonly accent: ColorScale;
  readonly background: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
    readonly overlay: string;
  };
  readonly surface: {
    readonly base: string;
    readonly elevated: string;
    readonly overlay: string;
    readonly hover: string;
    readonly active: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
    readonly disabled: string;
    readonly inverse: string;
  };
  readonly border: {
    readonly subtle: string;
    readonly default: string;
    readonly emphasis: string;
    readonly strong: string;
  };
  readonly status: {
    readonly success: string;
    readonly warning: string;
    readonly error: string;
    readonly info: string;
  };
}

export interface ThemeGradients {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly hero: string;
  readonly card: string;
  readonly button: string;
}

export interface ThemeEffects {
  readonly blur: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
  };
  readonly shadow: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
    readonly glow: string;
  };
  readonly glow: {
    readonly primary: string;
    readonly secondary: string;
    readonly accent: string;
  };
}

export interface ThemeAnimations {
  readonly duration: {
    readonly fast: number;
    readonly normal: number;
    readonly slow: number;
  };
  readonly easing: {
    readonly smooth: string;
    readonly bounce: string;
    readonly elastic: string;
  };
  readonly particles: {
    readonly enabled: boolean;
    readonly count: number;
    readonly speed: number;
    readonly color: string;
    readonly size: number;
  };
  readonly waves: {
    readonly enabled: boolean;
    readonly amplitude: number;
    readonly frequency: number;
    readonly color: string;
  };
}

export interface ThemeAssets {
  readonly logo: string;
  readonly icon: string;
  readonly background: {
    readonly pattern?: string;
    readonly image?: string;
    readonly video?: string;
  };
  readonly illustrations: Record<string, string>;
}

export interface ThemeTypography {
  readonly fontFamily: {
    readonly heading: string;
    readonly body: string;
    readonly mono: string;
  };
  readonly fontSize: {
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
    readonly '2xl': string;
    readonly '3xl': string;
    readonly '4xl': string;
  };
  readonly fontWeight: {
    readonly light: number;
    readonly normal: number;
    readonly medium: number;
    readonly semibold: number;
    readonly bold: number;
  };
  readonly lineHeight: {
    readonly tight: string;
    readonly normal: string;
    readonly relaxed: string;
  };
}

export interface BlockchainTheme {
  readonly id: string;
  readonly chainId: string;
  readonly name: string;
  readonly description: string;
  readonly colors: ThemeColors;
  readonly gradients: ThemeGradients;
  readonly effects: ThemeEffects;
  readonly animations: ThemeAnimations;
  readonly typography: ThemeTypography;
  readonly assets: ThemeAssets;
  readonly cssVariables?: Record<string, string>;
}

export interface ThemeTransitionState {
  readonly from: BlockchainTheme | null;
  readonly to: BlockchainTheme;
  readonly progress: number;
  readonly isTransitioning: boolean;
}

export interface ThemePreferences {
  readonly selectedThemeId: string;
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
  readonly particlesEnabled: boolean;
  readonly soundEnabled: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeContextValue {
  readonly currentTheme: BlockchainTheme;
  readonly themes: Map<string, BlockchainTheme>;
  readonly setTheme: (themeId: string) => void;
  readonly transitionState: ThemeTransitionState;
  readonly preferences: ThemePreferences;
  readonly updatePreferences: (preferences: Partial<ThemePreferences>) => void;
}