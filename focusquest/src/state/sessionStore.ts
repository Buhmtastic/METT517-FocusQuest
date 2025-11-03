import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { buildPhaseQueue, findPreset, DEFAULT_PRESET_ID } from '../constants/presets.ts'
import type {
  PendingFeedback,
  SessionLogEntry,
  SessionPhaseInstance,
  SessionSettings,
  TimerStatus,
} from '../types/session.ts'

import type { GamificationState } from '../types/gamification'
import { BADGES } from '../constants/badges.ts'
import { calculateLevel } from '../utils/gamification.ts'

interface SessionStore {
  status: TimerStatus
  phaseQueue: SessionPhaseInstance[]
  currentIndex: number
  remainingMs: number
  startedAt?: string
  pendingFeedback?: PendingFeedback
  history: SessionLogEntry[]
  settings: SessionSettings
  gamification: GamificationState // New gamification field
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
  // New gamification actions
  earnXP: (amount: number) => void
  awardBadge: (badgeId: string) => void
  earnCrystals: (amount: number) => void
  spendCrystals: (skillId: string, cost: number) => void
  updateStreak: () => void
  checkAchievements: () => void
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
        set((state) => {
          const newHistory = [
            ...state.history,
            {
              ...entry,
              id,
            },
          ]

          // Gamification logic
          const durationMinutes = entry.durationMs / (1000 * 60)
          const xpEarned = Math.floor(durationMinutes)
          const crystalsEarned = entry.energy ? Math.floor(entry.energy / 20) : 0

          const totalSessions = state.gamification.stats.totalSessions + 1
          const totalFocusMinutes = state.gamification.stats.totalFocusMinutes + (entry.phase === 'focus' ? durationMinutes : 0)
          const totalRecoveryMinutes = state.gamification.stats.totalRecoveryMinutes + (entry.phase === 'break' ? durationMinutes : 0)
          const averageEnergy = (state.gamification.stats.averageEnergy * state.gamification.stats.totalSessions + (entry.energy || 0)) / totalSessions
          const averageEmotion = (state.gamification.stats.averageEmotion * state.gamification.stats.totalSessions + (entry.emotion || 0)) / totalSessions

          const newGamification = {
            ...state.gamification,
            totalXP: state.gamification.totalXP + xpEarned,
            crystals: state.gamification.crystals + crystalsEarned,
            stats: {
              totalSessions,
              totalFocusMinutes,
              totalRecoveryMinutes,
              averageEnergy,
              averageEmotion,
            },
          }
          newGamification.level = calculateLevel(newGamification.totalXP)

          return {
            history: newHistory,
            pendingFeedback: undefined,
            gamification: newGamification,
          }
        })
        get().updateStreak()
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
          const newLevel = calculateLevel(newTotalXP)
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
          if (!state.gamification.badges.includes(badgeId)) {
            return {
              gamification: {
                ...state.gamification,
                badges: [...state.gamification.badges, badgeId],
              },
            }
          }
          return state
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
        set((state) => {
          if (state.gamification.crystals >= cost && !state.gamification.unlockedSkills.includes(skillId)) {
            return {
              gamification: {
                ...state.gamification,
                crystals: state.gamification.crystals - cost,
                usedCrystals: state.gamification.usedCrystals + cost,
                unlockedSkills: [...state.gamification.unlockedSkills, skillId],
              },
            }
          }
          return state
        })
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
          const lastActiveDate = state.gamification.streak.lastActiveDate
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

          let newCurrentStreak = state.gamification.streak.current
          let newLongestStreak = state.gamification.streak.longest
          let newShieldUsed = state.gamification.streak.shieldUsed

          if (lastActiveDate === today) {
            // Already updated today, do nothing
          } else if (lastActiveDate === yesterday) {
            // Continue streak
            newCurrentStreak += 1
            newShieldUsed = false
          } else if (state.gamification.streak.shieldUsed) {
            // Shield used, reset shield and continue streak
            newCurrentStreak += 1
            newShieldUsed = false
          } else {
            // Streak broken, reset
            newCurrentStreak = 1
          }

          if (newCurrentStreak > newLongestStreak) {
            newLongestStreak = newCurrentStreak
          }

          return {
            gamification: {
              ...state.gamification,
              streak: {
                current: newCurrentStreak,
                longest: newLongestStreak,
                lastActiveDate: today,
                shieldUsed: newShieldUsed,
              },
            },
          }
        })
      },

      checkAchievements: () => {
        BADGES.forEach(badge => {
          if (!get().gamification.badges.includes(badge.id)) {
            if (badge.condition(get())) {
              get().awardBadge(badge.id)
            }
          }
        })
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
        gamification: state.gamification, // Persist gamification state
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
  })
}
