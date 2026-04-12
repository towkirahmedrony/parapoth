import React, { useState } from 'react';
import { ArrowRight, Gift } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { referralService } from '../services/referralService';
import { useAuth } from '../../auth/hooks/useAuth';

export const RedeemCode: React.FC = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // TanStack React Query Mutation for redeeming code
  const redeemMutation = useMutation({
    mutationFn: (referralCode: string) => referralService.redeemCode(user!.id, referralCode),
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'Code redeemed successfully!' });
      setCode('');
    },
    onError: (error: Error) => {
      setFeedback({ type: 'error', message: error.message || 'Something went wrong.' });
    }
  });

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    setFeedback(null);
    redeemMutation.mutate(code.trim());
  };

  return (
    <Card 
      className="p-6" 
      style={{ 
        backgroundColor: 'var(--dyn-card)', 
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="p-2 rounded-lg" 
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)', 
            color: 'var(--dyn-primary)' 
          }}
        >
          <Gift size={24} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--dyn-text)' }}>Have a referral code?</h3>
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
            Enter your friend's code to get 50 coins.
          </p>
        </div>
      </div>

      <form onSubmit={handleRedeem} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input 
            placeholder="Enter code (e.g. RAHAT505)" 
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setFeedback(null);
            }}
            className="flex-1 font-mono uppercase"
          />
          <Button disabled={!code.trim() || redeemMutation.isPending} type="submit">
              {redeemMutation.isPending ? '...' : <ArrowRight size={20} />}
          </Button>
        </div>
        
        {feedback && (
          <p 
            className="text-xs mt-1 font-medium" 
            style={{ color: feedback.type === 'success' ? '#16a34a' : '#ef4444' }}
          >
            {feedback.message}
          </p>
        )}
      </form>
    </Card>
  );
};
