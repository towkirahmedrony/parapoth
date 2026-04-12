import React from 'react';
import { Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
          theme === 'light' 
            ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title="Light Mode"
        aria-label="Set light theme"
      >
        <Sun size={18} />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
          theme === 'dark' 
            ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title="Dark Mode"
        aria-label="Set dark theme"
      >
        <Moon size={18} />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
          theme === 'system' 
            ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title="System (Auto Follow Admin/Device Theme)"
        aria-label="Follow system theme"
      >
        <MonitorSmartphone size={18} />
      </button>
    </div>
  );
};

export default ThemeToggle;
