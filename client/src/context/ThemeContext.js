import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Get user's saved preference, or system preference
const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('theme');
    if (typeof storedPrefs === 'string') {
      return storedPrefs;
    }

    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'light';
};

// 2. Create the Context
const ThemeContext = createContext();

// 3. Create the Provider
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // 4. Update localStorage and <html> class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 5. Create the custom hook
export const useTheme = () => {
  return useContext(ThemeContext);
};