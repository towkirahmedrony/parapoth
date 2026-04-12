import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Lock } from 'lucide-react';

// DB 'achievements_master' টেবিলের সাথে সামঞ্জস্যপূর্ণ
interface Badge {
  id: string;
  title: string;
  icon_url: string | null;
  is_earned: boolean;
}

const BadgeShowcase: React.FC<{ badges: Badge[] }> = ({ badges }) => {
  return (
    <div className="py-2 mb-20">
      <div className="px-6 mb-4 flex justify-between items-end">
        <h3 
          className="text-lg font-bold font-['Hind_Siliguri']"
          style={{ color: 'var(--dyn-text)' }}
        >
          অর্জনসমূহ 🎖️
        </h3>
        <span 
          className="text-xs font-['Hind_Siliguri']"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
        >
          {badges.filter(b => b.is_earned).length} / {badges.length} টি আনলক হয়েছে
        </span>
      </div>

      <div className="flex overflow-x-auto pb-4 px-4 gap-4 scrollbar-hide snap-x">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
              "flex-shrink-0 w-24 flex flex-col items-center gap-2 snap-center",
              !badge.is_earned && "opacity-60 grayscale"
            )}
          >
            <div 
              className="relative w-16 h-16 flex items-center justify-center rounded-full border shadow-sm overflow-hidden p-3 transition-colors"
              style={{
                backgroundColor: badge.is_earned ? 'var(--dyn-card)' : 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                borderColor: badge.is_earned ? 'color-mix(in srgb, var(--dyn-primary) 30%, transparent)' : 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                boxShadow: badge.is_earned ? '0 4px 15px -3px color-mix(in srgb, var(--dyn-primary) 15%, transparent)' : 'none'
              }}
            >
              {/* Image render করা হচ্ছে icon_url এর জন্য */}
              {badge.icon_url ? (
                <img src={badge.icon_url} alt={badge.title} className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                <span className="text-3xl">🏆</span>
              )}
              
              {!badge.is_earned && (
                <div 
                  className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-bg) 60%, transparent)' }}
                >
                  <Lock 
                    className="w-5 h-5" 
                    style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }} 
                  />
                </div>
              )}
            </div>
            <span 
              className="text-xs text-center font-medium line-clamp-2 leading-tight font-['Hind_Siliguri']"
              style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
            >
              {badge.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgeShowcase;
