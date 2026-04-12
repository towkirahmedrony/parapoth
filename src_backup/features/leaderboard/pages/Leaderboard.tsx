import React, { useState, useEffect, useMemo } from 'react';
import { PanInfo } from 'framer-motion';
import { LEAGUES, getLeagueInfo } from '../utils/leagueConstants';
import { UserRow } from '../components/UserRow';
import { LeagueHeader } from '../components/LeagueHeader';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Loader } from '../../../shared/components/feedback/Loader';
import { useAuth } from '../../auth/hooks/useAuth';

// Type definition for safe casting instead of 'any'
interface UserWithXP {
  total_score?: number;
  total_xp?: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  
  // Memoize total XP to prevent unnecessary recalculations
  const myTotalXP = useMemo(() => {
    const authUser = user as UserWithXP | null;
    return authUser?.total_score ?? authUser?.total_xp ?? 0;
  }, [user]);
  
  const myLeague = useMemo(() => getLeagueInfo(myTotalXP), [myTotalXP]);
  const myLeagueIndex = useMemo(() => LEAGUES.findIndex(l => l.id === myLeague.id), [myLeague]);
  
  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState<number>(
    myLeagueIndex >= 0 ? myLeagueIndex : 0
  );
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    if (myLeagueIndex >= 0) {
      setSelectedLeagueIndex(myLeagueIndex);
    }
  }, [myLeagueIndex]);

  const selectedLeague = LEAGUES[selectedLeagueIndex] || LEAGUES[0];
  const nextLeague = LEAGUES[selectedLeagueIndex + 1];
  const prevLeague = LEAGUES[selectedLeagueIndex - 1];

  const { data: leaderboardData = [], isLoading } = useLeaderboard(
    selectedLeague.min_xp,
    selectedLeagueIndex === LEAGUES.length - 1 ? 999999 : (nextLeague?.min_xp ?? 999999)
  );

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, []);

  const isLocked = selectedLeague.min_xp > myTotalXP;
  let progressPercentage = 100;
  let pointsNeeded = 0;

  if (nextLeague) {
    const range = nextLeague.min_xp - selectedLeague.min_xp;
    const currentInLeague = Math.max(0, myTotalXP - selectedLeague.min_xp);
    
    if (selectedLeagueIndex === myLeagueIndex) {
        progressPercentage = Math.min(100, (currentInLeague / range) * 100);
        pointsNeeded = nextLeague.min_xp - myTotalXP;
    } else if (selectedLeagueIndex > myLeagueIndex) {
        progressPercentage = 0;
        pointsNeeded = selectedLeague.min_xp - myTotalXP;
    }
  }

  // Proper event typing instead of 'any'
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50 && selectedLeagueIndex > 0) handlePrev();
    else if (info.offset.x < -50 && selectedLeagueIndex < LEAGUES.length - 1) handleNext();
  };

  const handlePrev = () => { 
    if (prevLeague) { 
      setDirection(-1); 
      setSelectedLeagueIndex(prev => prev - 1); 
    } 
  };
  
  const handleNext = () => { 
    if (nextLeague) { 
      setDirection(1); 
      setSelectedLeagueIndex(prev => prev + 1); 
    } 
  };

  // Memoize current user search
  const currentUser = useMemo(
    () => leaderboardData.find(u => u.is_current_user), 
    [leaderboardData]
  );

  return (
    <div 
      className="w-full min-h-screen font-['Hind_Siliguri'] pb-24 pt-[135px]"
      style={{ backgroundColor: 'var(--dyn-bg)', color: 'var(--dyn-text)' }}
    >
      <LeagueHeader 
        selectedLeagueIndex={selectedLeagueIndex}
        selectedLeague={selectedLeague}
        prevLeague={prevLeague}
        nextLeague={nextLeague}
        isLocked={isLocked}
        direction={direction}
        progressPercentage={progressPercentage}
        pointsNeeded={pointsNeeded}
        isCurrentLeague={selectedLeagueIndex === myLeagueIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        onDragEnd={handleDragEnd}
      />

      <div className="px-3 mt-3">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="space-y-2.5">
              {leaderboardData.map((leaderboardUser, index) => (
                  <UserRow key={leaderboardUser.id} user={leaderboardUser} index={index} />
              ))}
          </div>
        )}
      </div>

      {!isLocked && (currentUser || leaderboardData[0]) && (
        <div className="fixed bottom-[80px] md:bottom-4 left-0 right-0 z-40 px-3 pointer-events-none">
            <div 
              className="max-w-md mx-auto backdrop-blur-md rounded-xl border-t p-1 pointer-events-auto"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--dyn-card) 95%, transparent)',
                borderColor: 'color-mix(in srgb, var(--dyn-primary) 50%, transparent)',
                boxShadow: '0 -5px 15px color-mix(in srgb, var(--dyn-text) 15%, transparent)'
              }}
            >
                 <UserRow 
                    user={currentUser || leaderboardData[0]} 
                    index={999} 
                    isFooter={true} 
                 />
            </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
