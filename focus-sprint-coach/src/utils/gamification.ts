/**
 * Calculate level from total XP
 * 120 XP per level (equivalent to 2 hours of focus time)
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 120)
}

/**
 * Calculate XP needed to reach next level
 */
export function xpToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  return (currentLevel + 1) * 120 - currentXP
}

/**
 * Calculate XP progress percentage for current level
 */
export function levelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const levelStartXP = currentLevel * 120
  const xpInCurrentLevel = currentXP - levelStartXP
  return (xpInCurrentLevel / 120) * 100
}

/**
 * Calculate crystals earned based on energy level (0-100)
 * 0-20%: 0 crystals
 * 21-40%: 1 crystal
 * 41-60%: 2 crystals
 * 61-80%: 3 crystals
 * 81-90%: 4 crystals
 * 91-100%: 5 crystals
 */
export function calculateCrystals(energy: number): number {
  if (energy <= 20) return 0
  if (energy <= 40) return 1
  if (energy <= 60) return 2
  if (energy <= 80) return 3
  if (energy <= 90) return 4
  return 5
}

/**
 * Calculate XP earned from a session
 * 1 XP per minute of focus time
 */
export function calculateXP(durationMinutes: number): number {
  return Math.floor(durationMinutes)
}

/**
 * Check if date is same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * Check if date is consecutive day
 */
export function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate)
  const current = new Date(currentDate)
  const diffTime = Math.abs(current.getTime() - last.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

/**
 * Get badge rarity color class
 */
export function getBadgeRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-500'
    case 'rare':
      return 'text-blue-500'
    case 'epic':
      return 'text-purple-500'
    case 'legendary':
      return 'text-yellow-500'
  }
}
