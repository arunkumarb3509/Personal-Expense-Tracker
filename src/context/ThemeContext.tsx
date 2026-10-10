import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, lightColors, darkColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, layout } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { ThemeMode } from '@/types/auth';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  shadows: typeof shadows;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const THEME_STORAGE_KEY = '@pet_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load stored theme preference
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeModeState(stored);
      }
    }).catch(() => {});
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme mode:', e);
    }
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        typography,
        spacing,
        layout,
        radius,
        shadows,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
