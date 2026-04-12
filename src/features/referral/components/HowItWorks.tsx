import React from 'react';
import { Send, UserPlus, Gift } from 'lucide-react';

interface HowItWorksProps {
  referrerBonus: number;
  refereeBonus: number;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ referrerBonus, refereeBonus }) => {
  const steps = [
    {
      icon: <Send className="w-5 h-5" />,
      title: 'লিংক শেয়ার করুন',
      description: 'বন্ধুদের আপনার ইউনিক লিংক বা কোড পাঠান।',
    },
    {
      icon: <UserPlus className="w-5 h-5" />,
      title: 'বন্ধুর জয়েনিং',
      description: 'তারা অ্যাকাউন্ট তৈরি করে ইমেইল ভেরিফাই করবে।',
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: 'রিওয়ার্ড অর্জন',
      description: `আপনি পাবেন ${referrerBonus} কয়েন এবং তারা পাবে ${refereeBonus} কয়েন।`,
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 px-1 text-[var(--dyn-text)]">কীভাবে কাজ করে?</h3>
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="min-w-[140px] flex-1 snap-start flex flex-col items-start p-4 rounded-xl bg-[var(--dyn-card)] border border-[color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[color-mix(in_srgb,var(--dyn-primary)_10%,transparent)] text-[var(--dyn-primary)] mb-2">
              {step.icon}
            </div>
            <h4 className="text-sm font-semibold text-[var(--dyn-text)] mb-0.5">{step.title}</h4>
            <p className="text-xs text-[color-mix(in_srgb,var(--dyn-text)_60%,transparent)] leading-tight">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
