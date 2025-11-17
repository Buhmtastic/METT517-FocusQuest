import { useMemo, useState } from 'react'
import clsx from 'clsx'

import { useSessionStore } from '../state/sessionStore.ts'
import { xpToNextLevel, XP_PER_LEVEL } from '../utils/gamification.ts'
import { BADGES } from '../constants/badges.ts'
import { SKILLS, canAffordSkill } from '../constants/skills.ts'

/**
 * Badge rarity color mapping
 */
const RARITY_COLORS = {
  common: 'bg-base-400/20 border-base-400/40',
  rare: 'bg-blue-500/20 border-blue-500/40',
  epic: 'bg-purple-500/20 border-purple-500/40',
  legendary: 'bg-amber-500/20 border-amber-500/40',
} as const

/**
 * Panel sections for tab navigation
 */
type PanelSection = 'overview' | 'badges' | 'skills'

export const GamificationPanel = () => {
  const gamification = useSessionStore((state) => state.gamification)
  const spendCrystals = useSessionStore((state) => state.spendCrystals)

  const [activeSection, setActiveSection] = useState<PanelSection>('overview')

  const { level, totalXP, crystals, usedCrystals, badges, unlockedSkills, streak, stats } = gamification

  // Calculate XP progress for current level
  const xpNeeded = useMemo(() => xpToNextLevel(totalXP), [totalXP])
  const xpInCurrentLevel = useMemo(() => totalXP % XP_PER_LEVEL, [totalXP])
  const levelProgress = useMemo(
    () => (xpInCurrentLevel / XP_PER_LEVEL) * 100,
    [xpInCurrentLevel]
  )

  // Get unlocked and locked badges
  const unlockedBadges = useMemo(
    () => BADGES.filter((badge) => badges.includes(badge.id)),
    [badges]
  )
  const lockedBadges = useMemo(
    () => BADGES.filter((badge) => !badges.includes(badge.id)),
    [badges]
  )

  // Get available and unlocked skills
  const availableSkills = useMemo(
    () => SKILLS.filter((skill) => !unlockedSkills.includes(skill.id)),
    [unlockedSkills]
  )
  const ownedSkills = useMemo(
    () => SKILLS.filter((skill) => unlockedSkills.includes(skill.id)),
    [unlockedSkills]
  )

  const handleUnlockSkill = (skillId: string, cost: number) => {
    if (canAffordSkill(skillId, crystals)) {
      spendCrystals(skillId, cost)
    }
  }

  return (
    <div className="rounded-3xl border border-base-100/60 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
      <header className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
          Quest Progress
        </h2>
        <p className="mt-1 text-xs text-base-400">
          Level up through focus and unlock rewards
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2">
        {(['overview', 'badges', 'skills'] as PanelSection[]).map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={clsx(
              'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
              activeSection === section
                ? 'bg-accent-400 text-base-900'
                : 'bg-base-100/60 text-base-500 hover:bg-base-100 dark:bg-base-700/60 dark:text-base-300 dark:hover:bg-base-700'
            )}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Level & XP */}
          <div className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-base-400">Level</p>
                <p className="mt-1 text-3xl font-bold text-base-900 dark:text-base-100">
                  {level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-base-400">
                  {xpInCurrentLevel} / {XP_PER_LEVEL} XP
                </p>
                <p className="text-xs text-base-500">{xpNeeded} to next level</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-100 dark:bg-base-700">
              <div
                className="h-full bg-gradient-to-r from-accent-400 to-accent-300 transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Crystals & Streak */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80">
              <p className="text-xs uppercase tracking-[0.3em] text-base-400">Crystals</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl">💎</span>
                <span className="text-2xl font-bold text-base-900 dark:text-base-100">
                  {crystals}
                </span>
              </div>
              <p className="mt-1 text-xs text-base-500">
                {usedCrystals} spent
              </p>
            </div>

            <div className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80">
              <p className="text-xs uppercase tracking-[0.3em] text-base-400">Streak</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-2xl font-bold text-base-900 dark:text-base-100">
                  {streak.current}
                </span>
              </div>
              <p className="mt-1 text-xs text-base-500">
                Best: {streak.longest} days
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80">
            <p className="text-xs uppercase tracking-[0.3em] text-base-400">Statistics</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-base-500">Total Sessions</p>
                <p className="font-semibold text-base-900 dark:text-base-100">
                  {stats.totalSessions}
                </p>
              </div>
              <div>
                <p className="text-base-500">Focus Time</p>
                <p className="font-semibold text-base-900 dark:text-base-100">
                  {Math.round(stats.totalFocusMinutes)} min
                </p>
              </div>
              <div>
                <p className="text-base-500">Avg Energy</p>
                <p className="font-semibold text-base-900 dark:text-base-100">
                  {Math.round(stats.averageEnergy)}%
                </p>
              </div>
              <div>
                <p className="text-base-500">Avg Emotion</p>
                <p className="font-semibold text-base-900 dark:text-base-100">
                  {stats.averageEmotion.toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges Section */}
      {activeSection === 'badges' && (
        <div className="space-y-4">
          {/* Unlocked Badges */}
          {unlockedBadges.length > 0 && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-base-400">
                Unlocked ({unlockedBadges.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={clsx(
                      'rounded-2xl border p-4 transition',
                      RARITY_COLORS[badge.rarity]
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-base-900 dark:text-base-100">
                          {badge.title}
                        </h3>
                        <p className="mt-1 text-xs text-base-500">{badge.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-base-400">
                          {badge.rarity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-base-400">
                Locked ({lockedBadges.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-2xl border border-dashed border-base-300/60 bg-base-50/50 p-4 opacity-60 dark:border-base-600/60 dark:bg-base-800/50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl grayscale">🔒</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-base-600 dark:text-base-400">
                          {badge.title}
                        </h3>
                        <p className="mt-1 text-xs text-base-400">{badge.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="rounded-2xl border border-dashed border-base-300/60 p-8 text-center dark:border-base-600/60">
              <p className="text-2xl">🎯</p>
              <p className="mt-2 text-sm text-base-500">
                Complete sessions to unlock badges
              </p>
            </div>
          )}
        </div>
      )}

      {/* Skills Section */}
      {activeSection === 'skills' && (
        <div className="space-y-4">
          {/* Available Skills */}
          {availableSkills.length > 0 && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-base-400">
                Available ({availableSkills.length})
              </p>
              <div className="space-y-3">
                {availableSkills.map((skill) => {
                  const canAfford = canAffordSkill(skill.id, crystals)
                  return (
                    <div
                      key={skill.id}
                      className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{skill.icon}</span>
                          <div>
                            <h3 className="text-sm font-semibold text-base-900 dark:text-base-100">
                              {skill.name}
                            </h3>
                            <p className="mt-1 text-xs text-base-500">{skill.description}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-accent-400">
                              <span>💎</span>
                              <span>{skill.cost}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnlockSkill(skill.id, skill.cost)}
                          disabled={!canAfford}
                          className={clsx(
                            'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                            canAfford
                              ? 'bg-accent-400 text-base-900 hover:bg-accent-300'
                              : 'cursor-not-allowed bg-base-100 text-base-400 dark:bg-base-700'
                          )}
                        >
                          {canAfford ? 'Unlock' : 'Locked'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Unlocked Skills */}
          {ownedSkills.length > 0 && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-base-400">
                Unlocked ({ownedSkills.length})
              </p>
              <div className="space-y-3">
                {ownedSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{skill.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-base-900 dark:text-base-100">
                          {skill.name}
                        </h3>
                        <p className="mt-1 text-xs text-base-500">{skill.description}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                          ✓ Active
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableSkills.length === 0 && ownedSkills.length === 0 && (
            <div className="rounded-2xl border border-dashed border-base-300/60 p-8 text-center dark:border-base-600/60">
              <p className="text-2xl">🎁</p>
              <p className="mt-2 text-sm text-base-500">
                No skills available yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
