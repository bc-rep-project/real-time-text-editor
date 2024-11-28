'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Load theme from localStorage on mount
      const savedTheme = localStorage.getItem('theme') as Theme || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      
      setTheme(savedTheme);
      
      // Safely access document after checking for browser environment
      const root = document.documentElement;
      if (root) {
        root.classList.toggle('dark', savedTheme === 'dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      
      // Safely access document after checking for browser environment
      const root = document.documentElement;
      if (root) {
        root.classList.toggle('dark');
      }
      
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};