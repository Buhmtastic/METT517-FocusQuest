export interface GamificationState {
  level: number;
  totalXP: number;
  crystals: number;
  usedCrystals: number;
  badges: string[]; // Badge IDs
  unlockedSkills: string[]; // Skill IDs
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
    shieldUsed: boolean;
  };
  stats: {
    totalSessions: number;
    totalFocusMinutes: number;
    totalRecoveryMinutes: number;
    averageEnergy: number;
    averageEmotion: number;
  };
}

export interface BadgeConditionStore {
  gamification: GamificationState;
  history: Array<{
    id: string;
    phase: string;
    energy?: number;
    emotion?: number;
  }>;
}

export interface Badge {
  id: string;
  icon: string; // Emoji or icon name
  title: string;
  description: string;
  condition: (store: BadgeConditionStore) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number; // Crystal cost
  icon: string;
  effect: () => void; // What happens when unlocked
}

export type AchievementType = 'badge' | 'level' | 'skill';

export interface AchievementNotification {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  timestamp: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}