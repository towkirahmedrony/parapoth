import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StreakCalendar } from '../components/StreakCalendar';
import { Flame, Trophy, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';

const toBn = (num: number | string) =>
  (num || 0).toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

// Extract magic strings into constants
const FIRE_COLOR = '#FF6B00';
const FIRE_GRADIENT = 'linear-gradient(to bottom right, #FF8C00, #FF3D00)';

// Moved outside to prevent unnecessary re-renders
const StreakSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <div
        className="w-12 h-12 rounded-2xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
      <div className="space-y-2">
        <div
          className="w-32 h-6 rounded-lg"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        />
        <div
          className="w-48 h-3 rounded-md"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <div
        className="h-[100px] rounded-2xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
      <div
        className="h-[100px] rounded-2xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
      <div
        className="h-[100px] rounded-2xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
    </div>
    <div
      className="h-[450px] rounded-2xl mt-6"
      style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
    />
  </div>
);

const Streak: React.FC = () => {
  const navigate = useNavigate();
  
  // No type casting needed anymore. The hook inherently provides strict types.
  const {
    currentStreak,
    longestStreak,
    activities,
    loading,
    error,
    freezesLeft,
  } = useStreak();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="group inline-flex items-center gap-2 px-4 py-2 mb-2 rounded-full text-xs font-semibold leading-relaxed transition-all duration-300 shadow-sm hover:shadow hover:bg-[color-mix(in_srgb,var(--dyn-primary)_10%,transparent)] hover:border-[var(--dyn-primary)] hover:text-[var(--dyn-primary)]"
        style={{
          backgroundColor: 'var(--dyn-card)',
          color: 'var(--dyn-text)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
        }}
      >
        <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
        <span>ফিরে যান</span>
      </button>

      {loading ? (
        <StreakSkeleton />
      ) : error ? (
        <div
          className="text-center p-6 rounded-xl border max-w-lg mx-auto mt-10 leading-relaxed"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 10%, transparent)',
            color: 'var(--dyn-accent)',
            borderColor: 'color-mix(in srgb, var(--dyn-accent) 30%, transparent)',
          }}
        >
          {typeof error === 'string' ? error : (error as Error)?.message || 'কোথাও কোনো সমস্যা হয়েছে!'}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2.5 rounded-xl shadow-sm"
              style={{ backgroundColor: `color-mix(in srgb, ${FIRE_COLOR} 15%, transparent)` }}
            >
              <Flame className="w-6 h-6" style={{ color: FIRE_COLOR }} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-relaxed" style={{ color: 'var(--dyn-text)' }}>
                আপনার স্ট্রিক
              </h1>
              <p
                className="flex items-center gap-1 mt-0.5 text-xs sm:text-sm leading-relaxed"
                style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
              >
                <Sparkles size={12} style={{ color: 'var(--dyn-accent)' }} /> প্রতিদিন পরীক্ষা দিন!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Card 1: Current Streak */}
            <div
              className="rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col items-center justify-center text-center"
              style={{ background: FIRE_GRADIENT }}
            >
              <Flame className="w-5 h-5 mb-1 animate-pulse" style={{ color: '#ffffff' }} />
              <h2 className="text-xl sm:text-2xl font-bold mb-0.5 leading-relaxed" style={{ color: '#ffffff' }}>
                {toBn(currentStreak)} <span className="text-xs font-medium">দিন</span>
              </h2>
              <p
                className="text-[10px] sm:text-xs font-medium opacity-90 mt-1 leading-relaxed"
                style={{ color: '#ffffff' }}
              >
                বর্তমান স্ট্রিক
              </p>
            </div>

            {/* Card 2: Highest Record */}
            <div
              className="rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: 'var(--dyn-card)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
              }}
            >
              <Trophy className="w-5 h-5 mb-1" style={{ color: 'var(--dyn-accent)' }} />
              <h3 className="text-xl sm:text-2xl font-bold mb-0.5 leading-relaxed" style={{ color: 'var(--dyn-text)' }}>
                {toBn(longestStreak?.longest_streak_days || 0)}{' '}
                <span className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
                  দিন
                </span>
              </h3>
              <p
                className="text-[10px] sm:text-xs font-medium mt-1 leading-relaxed"
                style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
              >
                সর্বোচ্চ রেকর্ড
              </p>
            </div>

            {/* Card 3: Streak Freeze / Safe Days */}
            <div
              className="rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: 'var(--dyn-card)',
                border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
              }}
            >
              <ShieldCheck className="w-5 h-5 mb-1" style={{ color: FIRE_COLOR }} />
              <h3 className="text-xl sm:text-2xl font-bold mb-0.5 leading-relaxed" style={{ color: 'var(--dyn-text)' }}>
                {toBn(freezesLeft)}{' '}
                <span className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>
                  / ২
                </span>
              </h3>
              <p
                className="text-[10px] sm:text-xs font-medium mt-1 leading-relaxed"
                style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
              >
                ফ্রিজ কোটা
              </p>
            </div>
          </div>

          <StreakCalendar activities={activities} />
        </>
      )}
    </div>
  );
};

export default Streak;
