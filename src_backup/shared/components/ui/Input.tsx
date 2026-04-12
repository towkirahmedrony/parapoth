import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full px-4 py-2 rounded-lg transition-all focus:outline-none ${className}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 20%, transparent)',
        color: 'var(--dyn-text, #0f172a)'
      }}
      {...props} 
    />
  );
};
