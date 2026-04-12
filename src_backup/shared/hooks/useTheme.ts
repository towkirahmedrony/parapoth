import { useContext } from 'react';
// নতুন স্ট্রাকচার অনুযায়ী ThemeProvider এর সঠিক রিলেটিভ পাথ
import { ThemeContext } from '../../app/providers/ThemeProvider';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
