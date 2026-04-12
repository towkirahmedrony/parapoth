import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Pentagon } from 'lucide-react';
import { League } from '../types/leaderboard';

interface Props {
  selectedLeagueIndex: number;
  prevLeague?: League;
  selectedLeague: League;
  nextLeague?: League;
  isLocked: boolean;
  direction: number;
  progressPercentage: number;
  pointsNeeded: number;
  isCurrentLeague: boolean;
  onPrev: () => void;
  onNext: () => void;
  // Replaced 'any' with strict DOM event types for Framer Motion
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

// Extracted outside the component to prevent recreation on every render
const getIconUrl = (iconName: string): string => {
  const mappedName = iconName === 'Trophy' ? 'trophy' : iconName === 'Medal' ? '1st-place-medal' : 'shield';
  return `https://api.iconify.design/noto:${mappedName}.svg`;
};

// Extracted gradient logic for cleaner JSX
const getLeagueGradientColors = (index: number) => {
  switch (index) {
    case 0: return { start: '#CD7F32', end: '#8B4513' }; // Bronze
    case 1: return { start: '#C0C0C0', end: '#808080' }; // Silver
    default: return { start: '#FFD700', end: '#B8860B' }; // Gold and above
  }
};

export const LeagueHeader: React.FC<Props> = ({
  selectedLeagueIndex, prevLeague, selectedLeague, nextLeague, 
  isLocked, direction, progressPercentage, pointsNeeded, isCurrentLeague,
  onPrev, onNext, onDragEnd
}) => {
  const borderColor = 'color-mix(in srgb, var(--dyn-text) 10%, transparent)';
  const mutedTextColor = 'color-mix(in srgb, var(--dyn-text) 60%, transparent)';
  const gradientColors = getLeagueGradientColors(selectedLeagueIndex);

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-xl transition-all duration-300"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--dyn-card) 95%, transparent)',
        borderColor: borderColor
      }}
    >
      {/* Carousel Row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 h-[110px]">
          
          {/* Previous League Icon - Changed to semantic <button> */}
          <button 
            onClick={onPrev}
            aria-label="Previous League"
            disabled={!prevLeague}
            className={`
              relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 outline-none
              ${prevLeague ? 'cursor-pointer active:scale-90 hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)] opacity-100' : 'invisible pointer-events-none opacity-0'}
            `}
          >
            {prevLeague && (
                <>
                  <div 
                    className="absolute inset-0 blur-xl rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)' }}
                  ></div>
                  <div className="relative z-10 flex flex-col items-center">
                      <img 
                          src={getIconUrl(prevLeague.icon)} 
                          className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter brightness-110" 
                          alt="prev" 
                      />
                      <ChevronLeft className="w-6 h-6 -mt-1 drop-shadow-md stroke-[3]" style={{ color: 'var(--dyn-text)' }} />
                  </div>
                </>
            )}
          </button>

          {/* Active League Badge (Center) */}
          <div className="flex-1 flex flex-col items-center justify-center relative -mt-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div 
                key={selectedLeagueIndex}
                custom={direction}
                initial={{ x: direction * 40, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction * -40, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={onDragEnd}
                className="flex flex-col items-center cursor-grab active:cursor-grabbing"
              >
                <div className="relative w-16 h-16 flex items-center justify-center drop-shadow-[0_8px_10px_rgba(0,0,0,0.6)]">
                    <Pentagon 
                      className="w-full h-full drop-shadow-lg" 
                      style={{ 
                          color: isLocked ? 'color-mix(in srgb, var(--dyn-text) 20%, transparent)' : 'transparent',
                          fill: isLocked ? 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' : `url(#gradient-${selectedLeague.id})`,
                          stroke: isLocked ? 'currentColor' : 'white',
                          strokeWidth: 2
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isLocked ? (
                          <Lock className="w-6 h-6" style={{ color: mutedTextColor }} />
                      ) : (
                          <img src={getIconUrl(selectedLeague.icon)} className="w-8 h-8 drop-shadow-md" alt="icon" />
                      )}
                    </div>

                    {/* Gradient Definitions */}
                    <svg width="0" height="0" className="absolute">
                      <linearGradient id={`gradient-${selectedLeague.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop stopColor={gradientColors.start} offset="0%" />
                        <stop stopColor={gradientColors.end} offset="100%" />
                      </linearGradient>
                    </svg>
                </div>
                
                <h2 
                  className="text-lg font-bold tracking-wide mt-1 text-shadow-sm"
                  style={{ color: 'var(--dyn-text)' }}
                >
                  {selectedLeague.name}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next League Icon - Changed to semantic <button> */}
          <button 
            onClick={onNext}
            aria-label="Next League"
            disabled={!nextLeague}
            className={`
              relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 outline-none
              ${nextLeague ? 'cursor-pointer active:scale-90 hover:[background-color:color-mix(in_srgb,var(--dyn-text)_10%,transparent)] opacity-100' : 'invisible pointer-events-none opacity-0'}
            `}
          >
            {nextLeague && (
                <>
                  <div 
                    className="absolute inset-0 blur-xl rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)' }}
                  ></div>
                  <div className="relative z-10 flex flex-col items-center">
                      <img 
                          src={getIconUrl(nextLeague.icon)} 
                          className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter brightness-110" 
                          alt="next" 
                      />
                      <ChevronRight className="w-6 h-6 -mt-1 drop-shadow-md stroke-[3]" style={{ color: 'var(--dyn-text)' }} />
                  </div>
                </>
            )}
          </button>
      </div>

      {/* Compact Progress Bar */}
      {nextLeague && (
          <div className="px-8 pb-3 -mt-1">
              <div 
                className="h-2 w-full rounded-full overflow-hidden border relative"
                style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                  borderColor: borderColor
                }}
              >
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: !isLocked 
                          ? 'linear-gradient(to right, var(--dyn-primary), var(--dyn-accent))' 
                          : 'color-mix(in srgb, var(--dyn-text) 30%, transparent)'
                      }}
                  />
              </div>
              {!isLocked && isCurrentLeague && (
                  <p className="text-center text-[10px] mt-1" style={{ color: mutedTextColor }}>
                      পরের ধাপে যেতে <span className="font-bold" style={{ color: 'var(--dyn-primary)' }}>{pointsNeeded} XP</span> প্রয়োজন
                  </p>
              )}
          </div>
      )}
    </div>
  );
};
