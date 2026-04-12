import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Snowflake } from 'lucide-react';
import { DailyActivity } from '../../dashboard/services/streakService';

interface ExtendedDailyActivity extends DailyActivity {
  used_freeze?: boolean;
}

interface StreakCalendarProps {
  activities: ExtendedDailyActivity[];
}

const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ activities }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const fireColor = '#FF6B00';

  const activityMap = useMemo(() => {
    const map: Record<string, ExtendedDailyActivity> = {};

    activities.forEach((act) => {
      const datePart = act.activity_date.split('T')[0];
      map[datePart] = act;
    });

    return map;
  }, [activities]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

  const toBn = (num: number | string) =>
    (num || 0).toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

  const getCellState = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = activityMap[dateStr];

    const hasTakenExam = (data?.exams_taken || 0) > 0;
    const hasUsedFreeze = data?.used_freeze === true;

    const isFuture =
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day > today.getDate();

    return { hasTakenExam, hasUsedFreeze, isFuture, dateStr };
  };

  const getNumberColor = (hasTakenExam: boolean, hasUsedFreeze: boolean) => {
    if (hasTakenExam) return fireColor;
    if (hasUsedFreeze) return 'var(--dyn-accent)';
    return 'color-mix(in srgb, var(--dyn-text) 70%, transparent)';
  };

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 shadow-sm"
      style={{
        backgroundColor: 'var(--dyn-card)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-xl font-bold flex items-center gap-2 py-1 leading-normal"
          style={{ color: 'var(--dyn-text)' }}
        >
          {MONTHS[month]}{' '}
          <span
            className="font-medium"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
          >
            {toBn(year)}
          </span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className={`p-2 rounded-full transition-colors ${
              isCurrentMonth
                ? 'cursor-not-allowed'
                : 'hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]'
            }`}
            style={{
              color: isCurrentMonth
                ? 'color-mix(in srgb, var(--dyn-text) 30%, transparent)'
                : 'color-mix(in srgb, var(--dyn-text) 70%, transparent)',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-semibold py-2 leading-normal whitespace-nowrap"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const { hasTakenExam, hasUsedFreeze, isFuture, dateStr } = getCellState(day);
          const isToday = isCurrentMonth && day === today.getDate();
          const numberColor = getNumberColor(hasTakenExam, hasUsedFreeze);

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
                flex items-center justify-center
                ${isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[color-mix(in_srgb,var(--dyn-text)_10%,transparent)]'}
              `}
              style={{
                backgroundColor: isFuture
                  ? 'transparent'
                  : hasUsedFreeze
                    ? 'color-mix(in srgb, var(--dyn-accent) 15%, transparent)'
                    : 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                outline: isToday ? `2px solid ${fireColor}` : 'none',
                outlineOffset: isToday ? '2px' : '0px',
                boxShadow: hasTakenExam
                  ? `0 0 15px color-mix(in srgb, ${fireColor} 30%, transparent)`
                  : hasUsedFreeze
                    ? '0 0 15px color-mix(in srgb, var(--dyn-accent) 30%, transparent)'
                    : 'none',
                overflow: 'hidden',
              }}
            >
              <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
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
                    fill={numberColor}
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

              {!isFuture && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  {hasTakenExam ? (
                    <Flame
                      size={28}
                      className="scale-110"
                      style={{
                        color: fireColor,
                        fill: fireColor,
                        filter: `drop-shadow(0 0 8px ${fireColor})`,
                      }}
                    />
                  ) : hasUsedFreeze ? (
                    <Snowflake
                      size={26}
                      className="scale-110"
                      style={{
                        color: 'var(--dyn-accent)',
                        fill: 'var(--dyn-accent)',
                        filter: 'drop-shadow(0 0 8px var(--dyn-accent))',
                      }}
                    />
                  ) : (
                    <Flame
                      size={28}
                      className="grayscale"
                      style={{ color: 'color-mix(in srgb, var(--dyn-text) 30%, transparent)' }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-4 border-t text-sm leading-normal"
        style={{
          borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
          color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)',
        }}
      >
        <div className="flex items-center gap-2 py-1">
          <Flame
            size={16}
            className="grayscale opacity-50"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 40%, transparent)' }}
          />
          <span>মিস করেছেন</span>
        </div>

        <div className="flex items-center gap-2 py-1">
          <Snowflake
            size={16}
            style={{
              color: 'var(--dyn-accent)',
              fill: 'var(--dyn-accent)',
              filter:
                'drop-shadow(0 0 4px color-mix(in srgb, var(--dyn-accent) 50%, transparent))',
            }}
          />
          <span>ফ্রিজ ব্যবহার</span>
        </div>

        <div className="flex items-center gap-2 py-1">
          <Flame
            size={16}
            style={{
              color: fireColor,
              fill: fireColor,
              filter: `drop-shadow(0 0 4px color-mix(in srgb, ${fireColor} 50%, transparent))`,
            }}
          />
          <span>পরীক্ষা দিয়েছেন</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
