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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in bg-black/50">
      <div className="bg-surface-elevated border border-border-color p-6 rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="bg-surface border border-border-color text-accent w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-text-primary text-lg font-bold mb-2">আপনি কি নিশ্চিত?</h3>
          <p className="text-text-secondary text-sm mb-6">
            এটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।
          </p>
          <div className="flex w-full gap-3">
            <button 
              onClick={onClose}
              className="text-text-primary bg-surface border border-border-color hover:bg-surface-elevated flex-1 py-2.5 rounded-xl font-medium transition-colors"
            >
              না
            </button>
            <button 
              onClick={onConfirm}
              className="bg-primary text-primary-foreground hover:opacity-90 flex-1 py-2.5 rounded-xl font-medium transition-colors shadow-lg"
            >
              হ্যাঁ, মুছুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
