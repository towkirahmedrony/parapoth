import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  // @ts-ignore - Assuming standard theme hook returns { theme, setTheme }
  const { theme, toggleTheme, setTheme } = useTheme() as any;

  const handleToggle = () => {
    if (toggleTheme) {
      toggleTheme();
    } else if (setTheme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg transition-colors focus:outline-none hover:scale-105"
      style={{ 
        color: 'var(--dyn-text, #0f172a)', 
        backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)' 
      }}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
