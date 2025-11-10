import type { Badge } from '../types/gamification.ts'

export const BADGES: Badge[] = [
  {
    id: 'first-quest',
    icon: '🎯',
    title: 'First Quest',
    description: 'Complete your first focus session',
    condition: (gamification) => gamification.stats.totalSessions >= 1,
    rarity: 'common',
  },
  {
    id: 'week-warrior',
    icon: '🔥',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    condition: (gamification) => gamification.streak.current >= 7,
    rarity: 'rare',
  },
  {
    id: 'century',
    icon: '💯',
    title: 'Century',
    description: 'Complete 100 total focus sessions',
    condition: (gamification) => gamification.stats.totalSessions >= 100,
    rarity: 'epic',
  },
  {
    id: 'high-energy',
    icon: '⚡',
    title: 'High Energy',
    description: 'Complete 3 consecutive sessions with 80%+ energy',
    condition: (gamification) => {
      // This will be checked in sessionStore with actual session data
      return gamification.badges.includes('high-energy')
    },
    rarity: 'rare',
  },
  {
    id: 'consistent',
    icon: '📅',
    title: 'Consistent',
    description: 'Complete sessions 5 days in a row',
    condition: (gamification) => gamification.streak.current >= 5,
    rarity: 'common',
  },
]

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id)
}
