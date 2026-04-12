import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';

import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan, PaymentMethod } from '../types/subscription';
import PaymentMethodCard from '../components/PaymentMethodCard';
import Button from '../../../shared/components/ui/Button'; 
import { Input } from '../../../shared/components/ui/Input';
import { useAuth } from '../../auth/hooks/useAuth';

interface LocationState {
  plan?: SubscriptionPlan;
}

const Checkout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize with location state if available
  const initialPlan = state?.plan;

  // React Query for Plan Fetching
  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['subscriptionPlan', planId],
    queryFn: () => subscriptionService.fetchPlanById(planId!),
    enabled: !!planId && !initialPlan,
    initialData: initialPlan,
  });

  // React Query for Payment Methods
  const { data: paymentMethods = [], isLoading: isLoadingMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: subscriptionService.getPaymentMethods,
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Auto-select first payment method when loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0]);
    }
  }, [paymentMethods, selectedMethod]);

  // React Query Mutation for Form Submission
  const submitClaimMutation = useMutation({
    mutationFn: subscriptionService.submitPaymentClaim,
    onSuccess: () => {
      toast.success('Payment request submitted successfully!');
      navigate('/dashboard', { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit payment.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !plan || !selectedMethod) return;

    if (!/^\d{11}$/.test(senderNumber)) {
      toast.error('Invalid Phone Number. Must be 11 digits.');
      return;
    }
    if (trxId.length < 8) {
      toast.error('Invalid Transaction ID.');
      return;
    }

    const finalAmount = (plan.discounted_price !== null && plan.discounted_price < plan.price) 
      ? plan.discounted_price 
      : plan.price;
    
    submitClaimMutation.mutate({
      user_id: user.id,
      plan_id: plan.id,
      amount: finalAmount,
      method: selectedMethod.id,
      sender_number: senderNumber,
      trx_id: trxId.toUpperCase()
    });
  };

  const isLoading = isLoadingPlan || isLoadingMethods;

  if (isLoading || !plan) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto" style={{ color: 'var(--dyn-primary)' }} />
      </div>
    );
  }

  const isDiscounted = plan.discounted_price !== null && plan.discounted_price < plan.price;
  const finalAmount = isDiscounted ? plan.discounted_price! : plan.price;

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}>
      <div className="max-w-2xl mx-auto mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full shadow-sm"
          style={{ backgroundColor: 'var(--dyn-card)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <div 
          className="rounded-2xl p-6 shadow-sm mb-6"
          style={{ backgroundColor: 'var(--dyn-card)' }}
        >
          <h2 className="text-sm uppercase font-semibold mb-4" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
            Order Summary
          </h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">{plan.name}</span>
            <span className="text-lg font-bold">৳{plan.price}</span>
          </div>
          {isDiscounted && (
            <div className="flex justify-between items-center text-emerald-500">
              <span>Discount</span>
              <span>- ৳{plan.price - plan.discounted_price!}</span>
            </div>
          )}
          <div 
            className="border-t border-dashed my-4" 
            style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)' }}
          ></div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total Payable</span>
            <span className="text-2xl font-extrabold" style={{ color: 'var(--dyn-primary)' }}>৳{finalAmount}</span>
          </div>
        </div>

        {selectedMethod && (
          <div 
            className="border rounded-xl p-4 flex gap-3 mb-6 bg-yellow-500/10 border-yellow-500/30"
          >
            <AlertTriangle className="shrink-0 mt-0.5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Please <strong>Send Money</strong> to the {selectedMethod.name} number below <i>before</i> filling out the verification form.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {paymentMethods.map(method => (
            <PaymentMethodCard 
              key={method.id} 
              method={method} 
              isSelected={selectedMethod?.id === method.id}
              onSelect={() => setSelectedMethod(method)}
            />
          ))}
        </div>

        <div 
          className="rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: 'var(--dyn-card)' }}
        >
          <h3 className="font-bold text-lg mb-4">Verify Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sender Number (11 Digits)</label>
              <Input 
                type="number" 
                placeholder="01XXXXXXXXX" 
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transaction ID (TrxID)</label>
              <Input 
                type="text" 
                placeholder="Ex: A1B2C3D4" 
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                className="uppercase placeholder:normal-case"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-3 text-lg" 
              disabled={submitClaimMutation.isPending || !selectedMethod}
            >
              {submitClaimMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> Verifying...
                </span>
              ) : "Verify Payment"}
            </Button>
            <p className="text-xs text-center mt-2" style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}>
              You will receive an automated notification once approved.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
