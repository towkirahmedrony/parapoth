import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  // ডাইনামিক স্টাইল জেনারেটর
  const getDynamicStyle = () => {
    switch(variant) {
      case 'primary':
        return { backgroundColor: 'var(--dyn-primary, #3b82f6)', color: '#ffffff' };
      case 'secondary':
        return { 
          backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)', 
          color: 'var(--dyn-text)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          color: 'var(--dyn-primary, #3b82f6)',
          border: '2px solid var(--dyn-primary, #3b82f6)'
        };
      case 'danger':
        return { backgroundColor: '#dc2626', color: '#ffffff' };
      case 'ghost':
        return { backgroundColor: 'transparent', color: 'inherit' };
      default:
        return {};
    }
  };

  return (
    <button 
      className={`${baseStyle} ${sizes[size]} ${className}`} 
      disabled={isLoading || disabled}
      style={getDynamicStyle()}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
