/**
 * Enhanced Theme Context with Blockchain-Specific Theming
 * Manages theme state, transitions, and persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  BlockchainTheme, 
  ThemeTransitionState, 
  ThemePreferences,
  ThemeContextValue 
} from '../theme/core/types';
import { themes, defaultTheme } from '../theme/definitions';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialThemeId?: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const loadPreferences = (): ThemePreferences => {
  try {
    const stored = localStorage.getItem('nyxusd-theme-preferences');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load theme preferences:', error);
  }
  
  return {
    selectedThemeId: 'midnight',
    reducedMotion: false,
    highContrast: false,
    particlesEnabled: true,
    soundEnabled: false,
  };
};

const savePreferences = (preferences: ThemePreferences): void => {
  try {
    localStorage.setItem('nyxusd-theme-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save theme preferences:', error);
  }
};

const injectCSSVariables = (theme: BlockchainTheme): void => {
  const root = document.documentElement;
  
  // Inject color variables
  Object.entries(theme.colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${category}-${key}`, value as string);
      });
    }
  });
  
  // Inject gradient variables
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--theme-gradient-${key}`, value);
  });
  
  // Inject effect variables
  Object.entries(theme.effects).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${category}-${key}`, value as string);
      });
    }
  });
  
  // Inject typography variables
  Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
  });
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--theme-size-${key}`, value);
  });
  
  // Inject custom CSS variables if provided
  if (theme.cssVariables) {
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
  
  // Set theme data attribute for CSS targeting
  root.setAttribute('data-theme', theme.id);
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialThemeId 
}) => {
  const [preferences, setPreferencesState] = useState<ThemePreferences>(loadPreferences);
  const [currentTheme, setCurrentTheme] = useState<BlockchainTheme>(
    themes[initialThemeId || preferences.selectedThemeId] || defaultTheme
  );
  const [transitionState, setTransitionState] = useState<ThemeTransitionState>({
    from: null,
    to: currentTheme,
    progress: 1,
    isTransitioning: false,
  });
  
  const themeMap = useMemo(() => new Map(Object.entries(themes)), []);
  
  const setTheme = useCallback((themeId: string) => {
    const newTheme = themes[themeId];
    if (!newTheme || newTheme.id === currentTheme.id) {
      return;
    }
    
    // Start transition
    setTransitionState({
      from: currentTheme,
      to: newTheme,
      progress: 0,
      isTransitioning: true,
    });
    
    // Perform theme switch with animation delay
    setTimeout(() => {
      setCurrentTheme(newTheme);
      injectCSSVariables(newTheme);
      
      // Update preferences
      const newPreferences = {
        ...preferences,
        selectedThemeId: themeId,
      };
      setPreferencesState(newPreferences);
      savePreferences(newPreferences);
      
      // Complete transition
      setTimeout(() => {
        setTransitionState({
          from: null,
          to: newTheme,
          progress: 1,
          isTransitioning: false,
        });
      }, 100);
    }, 300);
  }, [currentTheme, preferences]);
  
  const updatePreferences = useCallback((updates: Partial<ThemePreferences>) => {
    const newPreferences = {
      ...preferences,
      ...updates,
    };
    setPreferencesState(newPreferences);
    savePreferences(newPreferences);
  }, [preferences]);
  
  // Apply theme on mount and when it changes
  useEffect(() => {
    injectCSSVariables(currentTheme);
    
    // Apply preferences
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', preferences.reducedMotion);
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('particles-enabled', preferences.particlesEnabled);
  }, [currentTheme, preferences]);
  
  // Handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches });
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [updatePreferences]);
  
  const value: ThemeContextValue = {
    currentTheme,
    themes: themeMap,
    setTheme,
    transitionState,
    preferences,
    updatePreferences,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
};