import type { Badge, BadgeConditionStore } from '../types/gamification';

const MIN_ENERGY_HIGH = 80;
const MIN_SESSIONS_HIGH_ENERGY = 3;
const SESSIONS_FOR_CENTURY = 100;
const DAYS_FOR_WEEK_WARRIOR = 7;
const DAYS_FOR_CONSISTENT = 5;

export const BADGES: Badge[] = [
  {
    id: 'first-quest',
    icon: '🎯',
    title: 'First Quest',
    description: 'Complete your first focus session',
    condition: (store: BadgeConditionStore) => store.gamification.stats.totalSessions >= 1,
    rarity: 'common'
  },
  {
    id: 'week-warrior',
    icon: '🗓️',
    title: 'Week Warrior',
    description: 'Achieve a 7-day streak',
    condition: (store: BadgeConditionStore) => store.gamification.streak.longest >= DAYS_FOR_WEEK_WARRIOR,
    rarity: 'rare'
  },
  {
    id: 'century',
    icon: '💯',
    title: 'Century',
    description: 'Complete 100 total focus sessions',
    condition: (store: BadgeConditionStore) => store.gamification.stats.totalSessions >= SESSIONS_FOR_CENTURY,
    rarity: 'epic'
  },
  {
    id: 'high-energy',
    icon: '⚡',
    title: 'High Energy',
    description: '3 consecutive sessions with 80%+ energy',
    condition: (store: BadgeConditionStore) => {
      const { history } = store;
      if (history.length < MIN_SESSIONS_HIGH_ENERGY) return false;
      const lastThree = history.slice(-MIN_SESSIONS_HIGH_ENERGY);
      return lastThree.every((session) => (session.energy ?? 0) >= MIN_ENERGY_HIGH);
    },
    rarity: 'rare'
  },
  {
    id: 'consistent',
    icon: '✅',
    title: 'Consistent',
    description: 'Complete sessions 5 days in a row',
    condition: (store: BadgeConditionStore) => store.gamification.streak.current >= DAYS_FOR_CONSISTENT,
    rarity: 'common'
  },
];