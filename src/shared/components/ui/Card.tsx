import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  ...props
}) => (
  <div
    className={`rounded-xl shadow-sm p-4 transition-colors duration-500 ${className}`}
    style={{
      backgroundColor: 'var(--dyn-card, #ffffff)',
      border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
      color: 'var(--dyn-text, #0f172a)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
