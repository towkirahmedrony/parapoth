import React from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface ExamHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string; // Optional: Could be replaced by dynamic vars in parent
  onBack: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({ title, icon: Icon, iconColor, onBack }) => {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-md px-4 py-3 flex items-center gap-3 transition-colors"
         style={{ 
           backgroundColor: 'color-mix(in srgb, var(--dyn-card) 95%, transparent)', 
           borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
         }}>
      <button 
        onClick={onBack}
        className="p-2 -ml-2 rounded-full transition-colors"
        style={{ color: 'var(--dyn-text)' }}
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className={iconColor} />}
        <span className="font-['Hind_Siliguri'] font-medium text-lg" style={{ color: 'var(--dyn-text)' }}>
          {title}
        </span>
      </div>
    </div>
  );
};

export default ExamHeader;
