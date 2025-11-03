export type SessionPhase = 'focus' | 'break'

export interface SessionPhaseDefinition {
  id: string
  label: string
  phase: SessionPhase
  durationMinutes: number
  tone?: 'calm' | 'uplift'
}

export interface SessionPreset {
  id: string
  name: string
  description: string
  cycles: number
  sequence: SessionPhaseDefinition[]
  longBreakMinutes?: number
}

export interface SessionPhaseInstance extends SessionPhaseDefinition {
  index: number
  cycle: number
  durationMs: number
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'awaiting_feedback'

export interface PendingFeedback {
  phase: SessionPhaseInstance
  startedAt: string
  endedAt: string
  durationMs: number
}

export interface SessionLogEntry {
  id: string
  phase: SessionPhase
  startedAt: string
  endedAt: string
  durationMs: number
  emotion: number
  energy: number
  note?: string
}

export interface SessionSettings {
  autoAdvance: boolean
  soundEnabled: boolean
  vibrationsEnabled: boolean
  activePresetId: string
}
