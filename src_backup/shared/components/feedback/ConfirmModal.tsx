import React from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'হ্যাঁ',
  cancelText = 'না',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div 
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200" 
        style={{ backgroundColor: 'var(--dyn-card)', color: 'var(--dyn-text)' }}
      >
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="mb-6" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}>
          {message}
        </p>
        
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onCancel} 
            disabled={isLoading}
            className="flex-1 py-3 font-bold rounded-xl transition-colors disabled:opacity-50" 
            style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)', color: 'var(--dyn-text)' }}
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 py-3 font-bold rounded-xl transition-colors disabled:opacity-50" 
            style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
          >
            {isLoading ? 'অপেক্ষা করুন...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
