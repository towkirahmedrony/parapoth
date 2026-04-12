import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface ExamTimerProps {
  seconds: number;
}

// Moved outside to prevent recreation on every tick
const formatTime = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ExamTimer: React.FC<ExamTimerProps> = memo(({ seconds }) => {
  const isUrgent = seconds < 300; // Less than 5 minutes

  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold transition-colors duration-300 border",
        isUrgent && "animate-pulse-subtle" // Optional standard tailwind class integration if needed
      )}
      style={{
        backgroundColor: isUrgent
          ? 'color-mix(in srgb, var(--dyn-accent) 15%, transparent)'
          : 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
        color: isUrgent ? 'var(--dyn-accent)' : 'var(--dyn-text)',
        borderColor: isUrgent
          ? 'color-mix(in srgb, var(--dyn-accent) 30%, transparent)'
          : 'color-mix(in srgb, var(--dyn-text) 15%, transparent)'
      }}
    >
      <Clock className={clsx("w-5 h-5", isUrgent && "animate-pulse")} />
      <span className="text-lg tracking-wider">{formatTime(seconds)}</span>
    </div>
  );
});

ExamTimer.displayName = 'ExamTimer';

export default ExamTimer;
