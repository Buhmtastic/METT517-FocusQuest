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

interface SessionStore {
  status: TimerStatus
  phaseQueue: SessionPhaseInstance[]
  currentIndex: number
  remainingMs: number
  startedAt?: string
  pendingFeedback?: PendingFeedback
  history: SessionLogEntry[]
  settings: SessionSettings
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
        set((state) => ({
          history: [
            ...state.history,
            {
              ...entry,
              id,
            },
          ],
          pendingFeedback: undefined,
        }))
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
    }),
    {
      name: SESSION_STORAGE_KEY,
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
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
  })
}
