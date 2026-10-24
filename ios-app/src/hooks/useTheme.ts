import { useState, useEffect, useCallback } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { ThemeType, theme } from '../theme';
import { storageService } from '../services/storage';
import { UserSettings } from '../types';

export const useTheme = () => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  const loadTheme = useCallback(async () => {
    const settings = await storageService.getUserSettings();
    const savedTheme = settings?.theme || 'system';
    
    if (savedTheme === 'system') {
      setThemeType(systemTheme === 'dark' ? 'dark' : 'light');
    } else {
      setThemeType(savedTheme as ThemeType);
    }
  }, [systemTheme]);

  useEffect(() => {
    loadTheme();
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
      loadTheme();
    });

    return () => subscription.remove();
  }, [loadTheme]);

  const toggleTheme = useCallback(async () => {
    const newTheme: ThemeType = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    
    const settings = await storageService.getUserSettings();
    await storageService.saveUserSettings({
      ...settings,
      theme: newTheme,
    } as UserSettings);
  }, [themeType]);

  const setTheme = useCallback(async (newTheme: ThemeType | 'system') => {
    if (newTheme === 'system') {
      setThemeType(systemTheme === 'dark' ? 'dark' : 'light');
    } else {
      setThemeType(newTheme);
    }
    
    const settings = await storageService.getUserSettings();
    await storageService.saveUserSettings({
      ...settings,
      theme: newTheme,
    } as UserSettings);
  }, [systemTheme]);

  const currentTheme = theme[themeType];
  const isDark = themeType === 'dark';

  return {
    theme: currentTheme,
    themeType,
    isDark,
    toggleTheme,
    setTheme,
  };
};
