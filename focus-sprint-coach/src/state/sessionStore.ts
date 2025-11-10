import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { buildPhaseQueue, findPreset, DEFAULT_PRESET_ID } from '../constants/presets.ts'
import { BADGES } from '../constants/badges.ts'
import type {
  PendingFeedback,
  SessionLogEntry,
  SessionPhaseInstance,
  SessionSettings,
  TimerStatus,
} from '../types/session.ts'
import type { GamificationState, AchievementNotification } from '../types/gamification.ts'
import {
  calculateLevel,
  calculateXP,
  calculateCrystals,
  isSameDay,
  isConsecutiveDay,
} from '../utils/gamification.ts'

interface SessionStore {
  status: TimerStatus
  phaseQueue: SessionPhaseInstance[]
  currentIndex: number
  remainingMs: number
  startedAt?: string
  pendingFeedback?: PendingFeedback
  history: SessionLogEntry[]
  settings: SessionSettings
  gamification: GamificationState
  achievements: AchievementNotification[]
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  tick: (deltaMs: number) => void
  markPhaseComplete: (manual?: boolean) => void
  acknowledgePhase: () => void
  recordFeedback: (entry: Omit<SessionLogEntry, 'id'> & { id?: string }) => void
  updateSettings: (changes: Partial<SessionSettings>) => void
  resetDay: () => void
  setPreset: (presetId: string) => void
  advancePhase: () => void
  removeLogEntry: (id: string) => void
  earnXP: (amount: number) => void
  awardBadge: (badgeId: string) => void
  earnCrystals: (amount: number) => void
  spendCrystals: (skillId: string, cost: number) => boolean
  updateStreak: () => void
  checkAchievements: () => void
  dismissAchievement: (timestamp: number) => void
}

const SESSION_STORAGE_KEY = 'focus-sprint-coach::session'

const createInitialState = () => {
  const preset = findPreset(DEFAULT_PRESET_ID)
  const queue = buildPhaseQueue(preset)
  const first = queue[0]

  return {
    status: 'idle' as TimerStatus,
    phaseQueue: queue,
    currentIndex: 0,
    remainingMs: first?.durationMs ?? 0,
    startedAt: undefined,
    pendingFeedback: undefined,
    history: [] as SessionLogEntry[],
    settings: {
      activePresetId: preset.id,
      autoAdvance: false,
      soundEnabled: true,
      vibrationsEnabled: false,
    } as SessionSettings,
    gamification: {
      level: 0,
      totalXP: 0,
      crystals: 0,
      usedCrystals: 0,
      badges: [],
      unlockedSkills: [],
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: '',
        shieldUsed: false,
      },
      stats: {
        totalSessions: 0,
        totalFocusMinutes: 0,
        totalRecoveryMinutes: 0,
        averageEnergy: 0,
        averageEmotion: 0,
      },
    } as GamificationState,
    achievements: [] as AchievementNotification[],
  }
}

const computeStartedAt = (existing?: string) => {
  if (existing) return existing
  return new Date().toISOString()
}


export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      start: () => {
        const state = get()
        if (state.status === 'awaiting_feedback') {
          return
        }
        const phase = state.phaseQueue[state.currentIndex]
        if (!phase) {
          return
        }

        set({
          status: 'running',
          remainingMs: phase.durationMs,
          startedAt: computeStartedAt(),
          pendingFeedback: undefined,
        })
      },

      resume: () => {
        const state = get()
        if (state.status !== 'paused') {
          return
        }

        set({
          status: 'running',
          startedAt: computeStartedAt(state.startedAt),
        })
      },

      pause: () => {
        const state = get()
        if (state.status !== 'running') return
        set({ status: 'paused' })
      },

      skip: () => {
        const state = get()
        const phase = state.phaseQueue[state.currentIndex]
        if (!phase) return
        set({
          status: 'idle',
          pendingFeedback: undefined,
          startedAt: undefined,
        })
        get().advancePhase()
      },

      tick: (deltaMs: number) => {
        const state = get()

        if (state.status !== 'running') {
          return
        }

        const nextRemaining = Math.max(0, state.remainingMs - deltaMs)
        const phase = state.phaseQueue[state.currentIndex]
        if (!phase) {
          set({ remainingMs: 0, status: 'idle' })
          return
        }

        if (nextRemaining === 0) {
          const nowIso = new Date().toISOString()
          set({
            status: 'awaiting_feedback',
            remainingMs: 0,
            pendingFeedback: {
              phase,
              startedAt:
                state.startedAt ??
                new Date(Date.now() - phase.durationMs).toISOString(),
              endedAt: nowIso,
              durationMs: phase.durationMs,
            },
            startedAt: undefined,
          })

          if (get().settings.autoAdvance && phase.phase === 'break') {
            get().acknowledgePhase()
          }

          return
        }

        set({ remainingMs: nextRemaining })
      },

      markPhaseComplete: (manual?: boolean) => {
        const state = get()
        const phase = state.phaseQueue[state.currentIndex]
        if (!phase) return

        if (manual) {
          const nowIso = new Date().toISOString()
          set({
            status: 'awaiting_feedback',
            remainingMs: 0,
            pendingFeedback: {
              phase,
              startedAt:
                state.startedAt ??
                new Date(Date.now() - phase.durationMs).toISOString(),
              endedAt: nowIso,
              durationMs: phase.durationMs,
            },
            startedAt: undefined,
          })
        } else {
          get().tick(state.remainingMs)
        }
      },

      acknowledgePhase: () => {
        set({ status: 'idle', pendingFeedback: undefined })
        get().advancePhase()
      },

      recordFeedback: (entry) => {
        const id = entry.id ?? crypto.randomUUID()
        const newEntry = { ...entry, id }

        set((state) => ({
          history: [...state.history, newEntry],
          pendingFeedback: undefined,
        }))

        // Update streak
        get().updateStreak()

        // Award XP and crystals for focus sessions
        if (entry.phase === 'focus') {
          const xp = calculateXP(entry.durationMs / 60000)
          const crystals = calculateCrystals(entry.energy)

          get().earnXP(xp)
          get().earnCrystals(crystals)

          // Update stats
          const state = get()
          const totalSessions = state.gamification.stats.totalSessions + 1
          const totalFocusMinutes = state.gamification.stats.totalFocusMinutes + entry.durationMs / 60000
          const avgEnergy =
            (state.gamification.stats.averageEnergy * state.gamification.stats.totalSessions + entry.energy) /
            totalSessions
          const avgEmotion =
            (state.gamification.stats.averageEmotion * state.gamification.stats.totalSessions + entry.emotion) /
            totalSessions

          set((state) => ({
            gamification: {
              ...state.gamification,
              stats: {
                ...state.gamification.stats,
                totalSessions,
                totalFocusMinutes,
                averageEnergy: avgEnergy,
                averageEmotion: avgEmotion,
              },
            },
          }))
        } else if (entry.phase === 'break') {
          // Update recovery minutes
          set((state) => ({
            gamification: {
              ...state.gamification,
              stats: {
                ...state.gamification.stats,
                totalRecoveryMinutes: state.gamification.stats.totalRecoveryMinutes + entry.durationMs / 60000,
              },
            },
          }))
        }

        // Check achievements
        get().checkAchievements()
      },

      removeLogEntry: (id) => {
        set((state) => ({
          history: state.history.filter((session) => session.id !== id),
        }))
      },

      updateSettings: (changes) => {
        set((state) => ({
          settings: { ...state.settings, ...changes },
        }))
      },

      resetDay: () => {
        set({ history: [] })
      },

      setPreset: (presetId: string) => {
        const preset = findPreset(presetId)
        const queue = buildPhaseQueue(preset)
        const first = queue[0]

        set((state) => ({
          phaseQueue: queue,
          currentIndex: 0,
          remainingMs: first?.durationMs ?? 0,
          status: 'idle',
          startedAt: undefined,
          pendingFeedback: undefined,
          settings: {
            ...state.settings,
            activePresetId: preset.id,
          },
        }))
      },

      advancePhase: () => {
        const state = get()
        const nextIndex =
          state.currentIndex + 1 < state.phaseQueue.length
            ? state.currentIndex + 1
            : 0
        const nextPhase = state.phaseQueue[nextIndex]

        set({
          currentIndex: nextIndex,
          remainingMs: nextPhase?.durationMs ?? 0,
          status: 'idle',
          startedAt: undefined,
          pendingFeedback: undefined,
        })
      },

      earnXP: (amount: number) => {
        set((state) => {
          const newTotalXP = state.gamification.totalXP + amount
          const oldLevel = calculateLevel(state.gamification.totalXP)
          const newLevel = calculateLevel(newTotalXP)

          // Check if level up
          if (newLevel > oldLevel) {
            // Add level-up achievement notification
            const notification: AchievementNotification = {
              type: 'level',
              title: `Level ${newLevel}!`,
              description: `You've reached level ${newLevel}`,
              icon: '🎉',
              timestamp: Date.now(),
            }

            return {
              gamification: {
                ...state.gamification,
                totalXP: newTotalXP,
                level: newLevel,
              },
              achievements: [...state.achievements, notification],
            }
          }

          return {
            gamification: {
              ...state.gamification,
              totalXP: newTotalXP,
              level: newLevel,
            },
          }
        })
      },

      awardBadge: (badgeId: string) => {
        set((state) => {
          if (state.gamification.badges.includes(badgeId)) {
            return state
          }

          const badge = BADGES.find((b) => b.id === badgeId)
          if (!badge) return state

          const notification: AchievementNotification = {
            type: 'badge',
            title: badge.title,
            description: badge.description,
            icon: badge.icon,
            timestamp: Date.now(),
          }

          return {
            gamification: {
              ...state.gamification,
              badges: [...state.gamification.badges, badgeId],
            },
            achievements: [...state.achievements, notification],
          }
        })
      },

      earnCrystals: (amount: number) => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            crystals: state.gamification.crystals + amount,
          },
        }))
      },

      spendCrystals: (skillId: string, cost: number) => {
        const state = get()
        if (state.gamification.crystals < cost) {
          return false
        }

        set((state) => ({
          gamification: {
            ...state.gamification,
            crystals: state.gamification.crystals - cost,
            usedCrystals: state.gamification.usedCrystals + cost,
            unlockedSkills: [...state.gamification.unlockedSkills, skillId],
          },
        }))

        return true
      },

      updateStreak: () => {
        const today = new Date().toISOString()
        set((state) => {
          const lastDate = state.gamification.streak.lastActiveDate

          // First session ever
          if (!lastDate) {
            return {
              gamification: {
                ...state.gamification,
                streak: {
                  current: 1,
                  longest: 1,
                  lastActiveDate: today,
                  shieldUsed: false,
                },
              },
            }
          }

          // Same day - no change
          if (isSameDay(lastDate, today)) {
            return state
          }

          // Consecutive day
          if (isConsecutiveDay(lastDate, today)) {
            const newCurrent = state.gamification.streak.current + 1
            return {
              gamification: {
                ...state.gamification,
                streak: {
                  current: newCurrent,
                  longest: Math.max(newCurrent, state.gamification.streak.longest),
                  lastActiveDate: today,
                  shieldUsed: false,
                },
              },
            }
          }

          // Streak broken - check if shield can be used (1 day grace)
          const lastDateObj = new Date(lastDate)
          const todayObj = new Date(today)
          const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 2 && !state.gamification.streak.shieldUsed) {
            // Use shield to preserve streak
            return {
              gamification: {
                ...state.gamification,
                streak: {
                  ...state.gamification.streak,
                  lastActiveDate: today,
                  shieldUsed: true,
                },
              },
            }
          }

          // Streak broken - reset
          return {
            gamification: {
              ...state.gamification,
              streak: {
                current: 1,
                longest: state.gamification.streak.longest,
                lastActiveDate: today,
                shieldUsed: false,
              },
            },
          }
        })
      },

      checkAchievements: () => {
        const state = get()
        BADGES.forEach((badge) => {
          if (state.gamification.badges.includes(badge.id)) {
            return
          }

          // Check if condition is met
          if (badge.condition(state.gamification, state.history.length)) {
            get().awardBadge(badge.id)
          }
        })

        // Check "High Energy" badge separately (3 consecutive sessions with 80%+ energy)
        if (!state.gamification.badges.includes('high-energy')) {
          const recentSessions = state.history.slice(-3)
          if (
            recentSessions.length === 3 &&
            recentSessions.every((s) => s.phase === 'focus' && s.energy >= 80)
          ) {
            get().awardBadge('high-energy')
          }
        }
      },

      dismissAchievement: (timestamp: number) => {
        set((state) => ({
          achievements: state.achievements.filter((a) => a.timestamp !== timestamp),
        }))
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
        gamification: state.gamification,
      }),
    },
  ),
)

// Provide a typed selector helper for components.
export const useCurrentPhase = () =>
  useSessionStore((state) => state.phaseQueue[state.currentIndex])

export const resetSessionStore = () => {
  const preset = findPreset(DEFAULT_PRESET_ID)
  const queue = buildPhaseQueue(preset)
  const first = queue[0]

  useSessionStore.setState({
    status: 'idle',
    phaseQueue: queue,
    currentIndex: 0,
    remainingMs: first?.durationMs ?? 0,
    startedAt: undefined,
    pendingFeedback: undefined,
    history: [],
    settings: {
      activePresetId: preset.id,
      autoAdvance: false,
      soundEnabled: true,
      vibrationsEnabled: false,
    },
    gamification: {
      level: 0,
      totalXP: 0,
      crystals: 0,
      usedCrystals: 0,
      badges: [],
      unlockedSkills: [],
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: '',
        shieldUsed: false,
      },
      stats: {
        totalSessions: 0,
        totalFocusMinutes: 0,
        totalRecoveryMinutes: 0,
        averageEnergy: 0,
        averageEmotion: 0,
      },
    },
    achievements: [],
  })
}
