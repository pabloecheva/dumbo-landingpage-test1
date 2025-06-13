import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('light');

  // Function to apply theme to DOM
  const applyThemeToDOM = useCallback((themeToApply: Theme) => {
    try {
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      // Add new theme class
      root.classList.add(themeToApply);
      
      // Set data attribute for additional styling hooks
      root.setAttribute('data-theme', themeToApply);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeToApply === 'dark' ? '#1f2937' : '#ffffff');
      } else {
        // Create meta theme-color if it doesn't exist
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = themeToApply === 'dark' ? '#1f2937' : '#ffffff';
        document.head.appendChild(meta);
      }
    } catch (error) {
      console.error('Failed to apply theme to DOM:', error);
    }
  }, []);

  // Function to save theme preference
  const saveThemePreference = useCallback((themeToSave: Theme) => {
    try {
      localStorage.setItem('theme', themeToSave);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Function to load theme preference
  const loadThemePreference = useCallback((): Theme => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      return 'light'; // Default to light theme
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return 'light';
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = loadThemePreference();
    setThemeState(initialTheme);
    applyThemeToDOM(initialTheme);
  }, [loadThemePreference, applyThemeToDOM]);

  // Apply theme when it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  // Public function to set theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  }, [saveThemePreference]);

  return {
    theme,
    setTheme,
  };
};