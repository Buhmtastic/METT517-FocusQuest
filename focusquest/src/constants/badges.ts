import type { Badge } from '../types/gamification';
import type { SessionLogEntry } from '../types/session';

export const BADGES: Badge[] = [
  {
    id: 'first-quest',
    icon: '🎯',
    title: 'First Quest',
    description: 'Complete your first focus session',
    condition: (store: any) => store.gamification.stats.totalSessions >= 1,
    rarity: 'common'
  },
  {
    id: 'week-warrior',
    icon: '🗓️',
    title: 'Week Warrior',
    description: 'Achieve a 7-day streak',
    condition: (store: any) => store.gamification.streak.longest >= 7,
    rarity: 'rare'
  },
  {
    id: 'century',
    icon: '💯',
    title: 'Century',
    description: 'Complete 100 total focus sessions',
    condition: (store: any) => store.gamification.stats.totalSessions >= 100,
    rarity: 'epic'
  },
  {
    id: 'high-energy',
    icon: '⚡',
    title: 'High Energy',
    description: '3 consecutive sessions with 80%+ energy',
    condition: (store: any) => {
      const history = store.history;
      if (history.length < 3) return false;
      const lastThree = history.slice(-3);
      return lastThree.every((session: SessionLogEntry) => (session.energy || 0) >= 80);
    },
    rarity: 'rare'
  },
  {
    id: 'consistent',
    icon: '✅',
    title: 'Consistent',
    description: 'Complete sessions 5 days in a row',
    condition: (store: any) => store.gamification.streak.current >= 5,
    rarity: 'common'
  },
];