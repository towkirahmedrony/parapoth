import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import PlanCard from '../components/PlanCard';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan } from '../types/subscription';
import { Skeleton } from '@/shared/components/ui/Skeleton';

const Plans: React.FC = () => {
  const navigate = useNavigate();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['activePlans'],
    queryFn: subscriptionService.fetchActivePlans,
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    navigate(`/premium/checkout/${plan.id}`, { state: { plan } });
  };

  const features = [
    { icon: <Zap className="text-yellow-500" />, title: "Unlimited Exams", desc: "Practice without limits" },
    { icon: <TrendingUp className="text-blue-500" />, title: "Smart Analytics", desc: "Track your growth" },
    { icon: <ShieldCheck className="text-green-500" />, title: "Ad-Free", desc: "Focus on learning" },
  ];

  return (
    <div className="min-h-screen pb-20 bg-app text-text-primary">
      {/* Hero Section */}
      <div className="pt-12 pb-24 px-4 rounded-b-[3rem] relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <div className="backdrop-blur-md p-3 rounded-full bg-surface-elevated">
              <Crown size={40} className="text-yellow-500 fill-yellow-500" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Unlock Your Potential</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Get access to premium model tests, detailed analytics, and exclusive study materials to ace your exams.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {/* Features Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-xl shadow-sm border flex items-center gap-4 bg-card-bg border-card-border"
            >
              <div className="p-2 rounded-lg bg-surface">
                {feat.icon}
              </div>
              <div>
                <h4 className="font-bold">{feat.title}</h4>
                <p className="text-xs text-text-secondary">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={`skeleton-${i}`} 
                className="h-96 rounded-2xl p-6 border bg-card-bg border-card-border"
              >
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-16 w-1/2 mb-8" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
            ))
          ) : (
            plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;
