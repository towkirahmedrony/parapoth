import { League } from '../types/leaderboard';

export const LEAGUES: League[] = [
  { id: '1', name: 'শিক্ষানবিশ', min_xp: 0, icon: 'Shield', color: '#A1A1AA' },
  { id: '2', name: 'আগ্রহী', min_xp: 300, icon: 'Shield', color: '#10B981' },
  { id: '3', name: 'মনোযোগী', min_xp: 1000, icon: 'Medal', color: '#3B82F6' },
  { id: '4', name: 'অধ্যবসায়ী', min_xp: 3000, icon: 'Medal', color: '#8B5CF6' },
  { id: '5', name: 'কুশলী', min_xp: 8000, icon: 'Medal', color: '#D946EF' },
  { id: '6', name: 'মেধাবী', min_xp: 15000, icon: 'Trophy', color: '#F43F5E' },
  { id: '7', name: 'পারদর্শী', min_xp: 30000, icon: 'Trophy', color: '#F97316' },
  { id: '8', name: 'বিশারদ', min_xp: 50000, icon: 'Trophy', color: '#EAB308' },
  { id: '9', name: 'অদম্য', min_xp: 75000, icon: 'Trophy', color: '#14B8A6' },
  { id: '10', name: 'কিংবদন্তি', min_xp: 100000, icon: 'Trophy', color: '#06B6D4' }
];

export const getLeagueInfo = (xp: number): League => {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].min_xp) {
      return LEAGUES[i];
    }
  }

  return LEAGUES[0];
};
