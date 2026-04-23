import React, { useMemo } from 'react';
import { Check, Star } from 'lucide-react';
import { Tables } from '@/shared/types/supabase';
import Button from '@/shared/components/ui/Button';

type SubscriptionPlan = Tables<'subscription_plans'>;

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => {
  const isDiscounted = plan.discounted_price !== null && plan.discounted_price < plan.price;
  const currentPrice = isDiscounted ? plan.discounted_price : plan.price;
  
  // Safe calculation to prevent NaN or Infinity if plan.price is 0 or invalid
  const discountPercent = useMemo(() => {
    if (!isDiscounted || !plan.discounted_price || !plan.price) return 0;
    return Math.round(((plan.price - plan.discounted_price) / plan.price) * 100);
  }, [isDiscounted, plan.price, plan.discounted_price]);

  // Safe parsing for features
  const featuresList = useMemo(() => {
    return Array.isArray(plan.features) ? plan.features : [];
  }, [plan.features]);

  if (!plan) return null;

  return (
    <div 
      className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card-bg ${
        isDiscounted ? 'shadow-md border-primary' : 'border-card-border'
      }`}
    >
      
      {/* Badge for Discount */}
      {isDiscounted && discountPercent > 0 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          SAVE {discountPercent}%
        </div>
      )}

      <div className="text-center mb-6 pt-2">
        <h3 className="text-xl font-bold mb-2 text-text-primary">{plan.name}</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-extrabold text-primary">
            ৳{currentPrice}
          </span>
          {isDiscounted && (
            <span className="text-lg line-through text-text-secondary">
              ৳{plan.price}
            </span>
          )}
        </div>
        <p className="text-sm mt-1 text-text-secondary">
          For {plan.duration_days} Days
        </p>
      </div>

      <div className="flex-1 mb-8">
        <ul className="space-y-3">
          {featuresList.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="mt-1 min-w-[18px]">
                <Check size={18} className="text-primary" />
              </div>
              <span className="text-sm leading-tight text-text-primary">
                {String(feature)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button 
        onClick={() => onSelect(plan)}
        className="w-full py-3 font-semibold text-lg shadow-lg"
        variant={isDiscounted ? 'primary' : 'outline'}
      >
        Choose Plan
      </Button>
    </div>
  );
};

export default React.memo(PlanCard);
