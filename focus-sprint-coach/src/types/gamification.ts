export interface GamificationState {
  level: number
  totalXP: number
  crystals: number
  usedCrystals: number
  badges: string[]
  unlockedSkills: string[]
  streak: StreakInfo
  stats: UserStats
}

export interface StreakInfo {
  current: number
  longest: number
  lastActiveDate: string
  shieldUsed: boolean
}

export interface UserStats {
  totalSessions: number
  totalFocusMinutes: number
  totalRecoveryMinutes: number
  averageEnergy: number
  averageEmotion: number
}

export interface Badge {
  id: string
  icon: string
  title: string
  description: string
  condition: (gamification: GamificationState, historyLength: number) => boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface Skill {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  unlocked?: boolean
}

export interface AchievementNotification {
  type: 'badge' | 'level' | 'skill'
  title: string
  description: string
  icon: string
  timestamp: number
}
