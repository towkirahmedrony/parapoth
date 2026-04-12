import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); 
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105 ${className}`}
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
        color: 'var(--dyn-text, #0f172a)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
      aria-label="Go back"
      title="Back"
    >
      <ChevronLeft size={24} strokeWidth={2.5} />
    </button>
  );
};
