import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      // Récupérer la préférence sauvegardée ou utiliser la préférence système
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      
      // Vérifier si window.matchMedia est disponible (pour les tests)
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      // Valeur par défaut si rien n'est disponible
      return false;
    } catch (error) {
      console.warn('Error reading theme preference:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      // Sauvegarder la préférence
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      // Appliquer la classe au body
      document.body.classList.toggle('dark-mode', isDarkMode);
    } catch (error) {
      console.warn('Error saving theme preference:', error);
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 