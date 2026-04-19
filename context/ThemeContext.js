import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@findamatch_theme';

const lightColors = {
  background: '#fff',
  card: '#f8f9fa',
  card2: '#f8f9fa',
  card3: '#f8f9fa',
  cardBorder: '#dee2e6',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  textMuted: '#95a5a6',
  border: '#dee2e6',
  inputBg: '#f8f9fa',
  primary: '#6FD08B',
  primaryDark: '#5bb87a',
  headerBg: '#6FD08B',
  headerText: '#fff',
  headingBlue: '#6FD08B',
  danger: '#e53935',
  warning: '#ff9800',
};

const darkColors = {
  background: '#1e1e2a',
  card: '#2a2a36',
  card2: '#333340',
  card3: '#3d3d4a',
  cardBorder: '#3d3d4a',
  text: '#ffffff',
  textSecondary: '#c0c0c0',
  textMuted: '#888',
  border: '#3d3d4a',
  inputBg: '#363642',
  primary: '#6FD08B',
  primaryDark: '#5bb87a',
  headerBg: '#2d5a3d',
  headerText: '#fff',
  headingBlue: '#6FD08B',
  danger: '#ef5350',
  warning: '#ffb74d',
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'dark') {
        setIsDarkMode(true);
      }
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
