export function calculateLevel(totalXP: number): number {
  // 120 XP per level (2 hours of focus)
  return Math.floor(totalXP / 120);
}

export function xpToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  return (currentLevel + 1) * 120 - currentXP;
}