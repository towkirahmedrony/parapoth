import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Share2, Check } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

interface ReferralHeroProps {
  code: string;
  totalEarned: number;
}

export const ReferralHero: React.FC<ReferralHeroProps> = ({ code, totalEarned }) => {
  const [copied, setCopied] = useState(false);

  // Prevent memory leaks on unmount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (copied) {
      timeoutId = setTimeout(() => setCopied(false), 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [copied]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  }, [code]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ParaPoth!',
          text: `Use my code ${code} to get 50 bonus coins!`,
          url: window.location.origin,
        });
      } catch (err) {
        // AbortError is common when users close the share sheet, no need to log as error usually
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  }, [code]);

  return (
    <Card 
      className="overflow-hidden relative"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, var(--dyn-card))', 
        border: '1px solid color-mix(in srgb, var(--dyn-primary) 20%, transparent)',
        color: 'var(--dyn-text)' 
      } as React.CSSProperties}
    >
      <div 
        className="absolute top-0 right-0 p-4 pointer-events-none" 
        style={{ color: 'var(--dyn-primary)', opacity: 0.1 }}
      >
        <Share2 size={120} />
      </div>
      
      <div className="relative z-10 p-6">
        <h2 className="text-2xl font-bold mb-2">Invite Friends, Earn Coins! 💰</h2>
        <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}>
          Get <span className="font-bold" style={{ color: 'var(--dyn-primary)' }}>100 Coins</span> for every friend who joins. They get 50!
        </p>

        <div 
          className="backdrop-blur-md rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
          }}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
              Your Referral Code
            </p>
            <p className="text-3xl font-mono font-bold tracking-widest" style={{ color: 'var(--dyn-primary)' }}>
              {code}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={handleCopy}
              style={{ backgroundColor: 'var(--dyn-primary)', color: 'var(--dyn-bg)' }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleShare} 
              style={{ 
                borderColor: 'color-mix(in srgb, var(--dyn-primary) 50%, transparent)', 
                color: 'var(--dyn-primary)' 
              }}
            >
              <Share2 size={18} />
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div 
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
              color: 'var(--dyn-text)' 
            }}
          >
            Total Earned: 🪙 {totalEarned}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ReferralHero);
