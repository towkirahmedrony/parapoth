import { League } from '../types/leaderboard';

export const LEAGUES: League[] = [
  { id: 'bronze', name: 'ব্রোঞ্জ লীগ', min_xp: 0, icon: 'Medal', color: '#CD7F32' },
  { id: 'silver', name: 'সিলভার লীগ', min_xp: 1000, icon: 'Medal', color: '#C0C0C0' },
  { id: 'gold', name: 'গোল্ড লীগ', min_xp: 2500, icon: 'Medal', color: '#FFD700' },
  { id: 'platinum', name: 'প্লাটিনাম লীগ', min_xp: 5000, icon: 'Trophy', color: '#E5E4E2' },
  { id: 'diamond', name: 'ডায়মন্ড লীগ', min_xp: 10000, icon: 'Trophy', color: '#B9F2FF' },
  { id: 'master', name: 'মাস্টার লীগ', min_xp: 20000, icon: 'Crown', color: '#FF4500' },
];

export const getLeagueInfo = (xp: number): League => {
  // Reverse loop to find the highest matching league
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].min_xp) {
      return LEAGUES[i];
    }
  }
  return LEAGUES[0];
};
