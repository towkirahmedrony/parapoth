import React, { useState, useEffect, useCallback } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentMethod } from '../types/subscription';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, isSelected, onSelect }) => {
  const [copied, setCopied] = useState(false);

  // Handle cleanup for setTimeout to prevent memory leaks on unmount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (copied) {
      timeoutId = setTimeout(() => setCopied(false), 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [copied]);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!method?.number) return;

    try {
      await navigator.clipboard.writeText(method.number);
      setCopied(true);
      toast.success('Number copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy number');
    }
  }, [method?.number]);

  if (!method) return null;

  const isBkash = method.id.toLowerCase() === 'bkash';
  // Using brand colors explicitly for bKash/Nagad recognition, but adapting to theme
  const brandColor = isBkash ? '#e11471' : '#f97316'; // bKash Pink : Nagad Orange
  
  // Safe initial character extraction
  const brandInitial = method.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div 
      onClick={onSelect}
      className="cursor-pointer rounded-xl border-2 p-4 transition-all duration-200"
      style={{
        backgroundColor: isSelected ? `color-mix(in srgb, ${brandColor} 10%, var(--dyn-card))` : 'var(--dyn-card)',
        borderColor: isSelected ? brandColor : 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: brandColor }}
          >
            {brandInitial}
          </div>
          <div>
            <h4 className="font-bold" style={{ color: 'var(--dyn-text)' }}>{method.name}</h4>
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)'
              }}
            >
              {method.type}
            </span>
          </div>
        </div>
        {isSelected && (
          <CheckCircle style={{ color: brandColor }} size={24} />
        )}
      </div>

      {isSelected && (
        <div 
          className="mt-2 rounded-lg p-3 flex items-center justify-between border"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
          }}
        >
          <span className="font-mono text-lg font-semibold tracking-wider" style={{ color: 'var(--dyn-text)' }}>
            {method.number}
          </span>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-full transition-colors hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
            title="Copy Number"
          >
            {copied ? (
               <CheckCircle size={18} style={{ color: '#10b981' }} />
            ) : (
               <Copy size={18} style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(PaymentMethodCard);
