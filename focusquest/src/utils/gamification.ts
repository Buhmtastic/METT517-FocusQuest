/**
 * XP required per level.
 * Represents approximately 2 hours of focused work (120 minutes).
 */
export const XP_PER_LEVEL = 120;

/**
 * Calculates the current level based on total XP.
 * @param totalXP - Total experience points accumulated
 * @returns Current level (0-indexed)
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 0;
  return Math.floor(totalXP / XP_PER_LEVEL);
}

/**
 * Calculates XP needed to reach the next level.
 * @param currentXP - Current experience points
 * @returns XP remaining until next level
 */
export function xpToNextLevel(currentXP: number): number {
  if (currentXP < 0) return XP_PER_LEVEL;
  const currentLevel = calculateLevel(currentXP);
  return (currentLevel + 1) * XP_PER_LEVEL - currentXP;
}