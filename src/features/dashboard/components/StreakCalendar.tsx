// src/features/dashboard/components/StreakCalendar.tsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Snowflake } from 'lucide-react';

export interface DailyActivity {
  activity_date: string;
  exams_taken?: number;
  used_freeze?: boolean;
}

interface StreakCalendarProps {
  activities: DailyActivity[];
}

const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

// Utility to convert numbers to Bengali numerals safely
const toBn = (num: number | string | undefined | null) => {
  if (num === undefined || num === null) return '০';
  return num.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)] || d);
};

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ activities }) => {
  // Use current local time for accurate comparisons
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Memoize activity map for O(1) lookups. Handles timezone safely.
  const activityMap = useMemo(() => {
    const map: Record<string, DailyActivity> = {};

    if (!Array.isArray(activities)) return map;

    activities.forEach((act) => {
      if (act && act.activity_date) {
        // Only take the 'YYYY-MM-DD' part regardless of time
        const datePart = act.activity_date.split('T')[0];
        map[datePart] = act;
      }
    });

    return map;
  }, [activities]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);

  const emptyCells = Array.from({ length: startDay }).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getCellState = (day: number) => {
    // Pad month and day with leading zero to match ISO format (YYYY-MM-DD)
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    
    const data = activityMap[dateStr];

    const hasTakenExam = (data?.exams_taken || 0) > 0;
    const hasUsedFreeze = data?.used_freeze === true;

    // Check if the cell represents a future date
    const isFuture =
      (year > today.getFullYear()) ||
      (year === today.getFullYear() && month > today.getMonth()) ||
      (year === today.getFullYear() && month === today.getMonth() && day > today.getDate());

    return { hasTakenExam, hasUsedFreeze, isFuture, dateStr };
  };

  return (
    <div className="rounded-2xl p-5 sm:p-6 shadow-sm bg-card-bg border border-card-border">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 py-1 leading-normal text-text-primary">
          {MONTHS[month]}{' '}
          <span className="font-medium text-text-secondary">
            {toBn(year)}
          </span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full transition-colors text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className={`p-2 rounded-full transition-colors ${
              isCurrentMonth
                ? 'cursor-not-allowed opacity-50 text-text-secondary'
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
            }`}
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-semibold py-2 leading-normal whitespace-nowrap text-text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const { hasTakenExam, hasUsedFreeze, isFuture, dateStr } = getCellState(day);
          const isToday = isCurrentMonth && day === today.getDate();

          // Determine semantic classes based on cell state
          let cellBgClass = 'bg-surface hover:bg-surface-elevated';
          let cellShadowClass = '';
          let numberTextColor = 'text-text-secondary';

          if (isFuture) {
            cellBgClass = 'bg-transparent';
          } else if (hasTakenExam) {
            cellShadowClass = 'shadow-[0_0_15px_rgba(255,107,0,0.3)]';
            numberTextColor = 'text-[#FF6B00]';
          } else if (hasUsedFreeze) {
            cellBgClass = 'bg-secondary';
            numberTextColor = 'text-primary';
          }

          return (
            <div
              key={day}
              title={
                isFuture
                  ? undefined
                  : `${dateStr}: ${
                      hasTakenExam
                        ? 'পরীক্ষা দিয়েছেন'
                        : hasUsedFreeze
                          ? 'ফ্রিজ ব্যবহার করেছেন'
                          : 'পরীক্ষা দেননি'
                    }`
              }
              className={`
                aspect-square rounded-xl relative transition-all duration-300
                flex items-center justify-center overflow-hidden
                ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}
                ${cellBgClass}
                ${cellShadowClass}
                ${isToday ? 'ring-2 ring-[#FF6B00] ring-offset-2 ring-offset-card-bg' : ''}
              `}
            >
              {/* Day Number */}
              <div className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center ${numberTextColor}`}>
                <svg
                  viewBox="0 0 32 32"
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  aria-hidden="true"
                >
                  <text
                    x="16"
                    y="19"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="currentColor"
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                    }}
                  >
                    {toBn(day)}
                  </text>
                </svg>
              </div>

              {/* Background Icon (Flame/Snowflake) */}
              {!isFuture && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  {hasTakenExam ? (
                    <Flame
                      size={28}
                      className="scale-110 text-[#FF6B00] fill-[#FF6B00] drop-shadow-[0_0_8px_rgba(255,107,0,1)]"
                    />
                  ) : hasUsedFreeze ? (
                    <Snowflake
                      size={26}
                      className="scale-110 text-primary fill-primary drop-shadow-md"
                    />
                  ) : (
                    <Flame
                      size={28}
                      className="grayscale text-text-secondary"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-4 border-t border-border-color text-sm leading-normal text-text-secondary">
        <div className="flex items-center gap-2 py-1">
          <Flame size={16} className="grayscale opacity-50 text-text-secondary" />
          <span>মিস করেছেন</span>
        </div>

        <div className="flex items-center gap-2 py-1">
          <Snowflake size={16} className="text-primary fill-primary drop-shadow-sm" />
          <span>ফ্রিজ ব্যবহার</span>
        </div>

        <div className="flex items-center gap-2 py-1">
          <Flame size={16} className="text-[#FF6B00] fill-[#FF6B00] drop-shadow-sm" />
          <span>পরীক্ষা দিয়েছেন</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
