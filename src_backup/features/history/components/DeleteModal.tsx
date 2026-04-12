import React from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in"
      style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 60%, transparent)' }}
    >
      <div 
        className="p-6 rounded-2xl w-full max-w-sm shadow-xl"
        style={{ 
          backgroundColor: 'var(--dyn-card)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 15%, transparent)',
              color: 'var(--dyn-accent)'
            }}
          >
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--dyn-text)' }}>আপনি কি নিশ্চিত?</h3>
          <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
            এটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।
          </p>
          <div className="flex w-full gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium transition-colors"
              style={{ 
                color: 'var(--dyn-text)',
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
              }}
            >
              না
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl font-medium transition-colors shadow-lg"
              style={{ 
                backgroundColor: 'var(--dyn-accent)', 
                color: 'var(--dyn-bg)',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--dyn-accent) 30%, transparent)'
              }}
            >
              হ্যাঁ, মুছুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
