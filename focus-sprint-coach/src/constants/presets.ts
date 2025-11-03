import type {
  SessionPhaseInstance,
  SessionPreset,
} from '../types/session.ts'

export const SESSION_PRESETS: ReadonlyArray<SessionPreset> = [
  {
    id: 'classic-25-5',
    name: 'Classic 25/5',
    description: 'Four deep-work sprints with short resets and a longer recovery.',
    cycles: 4,
    sequence: [
      {
        id: 'focus',
        label: 'Focus Sprint',
        phase: 'focus',
        durationMinutes: 25,
        tone: 'uplift',
      },
      {
        id: 'micro-break',
        label: 'Micro Break',
        phase: 'break',
        durationMinutes: 5,
        tone: 'calm',
      },
    ],
    longBreakMinutes: 15,
  },
  {
    id: 'flow-50-10',
    name: 'Flow 50/10',
    description: 'Longer immersion windows for research or strategy work.',
    cycles: 3,
    sequence: [
      {
        id: 'focus',
        label: 'Long Focus',
        phase: 'focus',
        durationMinutes: 50,
        tone: 'uplift',
      },
      {
        id: 'short-break',
        label: 'Reset',
        phase: 'break',
        durationMinutes: 10,
        tone: 'calm',
      },
    ],
    longBreakMinutes: 20,
  },
  {
    id: 'maker-45-15',
    name: 'Maker 45/15',
    description: 'Balanced rhythm for creative makers needing more recovery.',
    cycles: 3,
    sequence: [
      {
        id: 'focus',
        label: 'Maker Sprint',
        phase: 'focus',
        durationMinutes: 45,
      },
      {
        id: 'break',
        label: 'Cool Down',
        phase: 'break',
        durationMinutes: 15,
        tone: 'calm',
      },
    ],
    longBreakMinutes: 20,
  },
]

export const DEFAULT_PRESET_ID = SESSION_PRESETS[0]?.id ?? 'classic-25-5'

export const findPreset = (id: string): SessionPreset => {
  return (
    SESSION_PRESETS.find((preset) => preset.id === id) ?? SESSION_PRESETS[0]
  )
}

export const buildPhaseQueue = (
  preset: SessionPreset,
): SessionPhaseInstance[] => {
  const queue: SessionPhaseInstance[] = []

  for (let cycle = 1; cycle <= preset.cycles; cycle += 1) {
    preset.sequence.forEach((phase) => {
      queue.push({
        ...phase,
        index: queue.length,
        cycle,
        durationMs: phase.durationMinutes * 60 * 1000,
      })
    })
  }

  if (preset.longBreakMinutes) {
    queue.push({
      id: 'long-break',
      label: 'Long Recovery',
      phase: 'break',
      durationMinutes: preset.longBreakMinutes,
      durationMs: preset.longBreakMinutes * 60 * 1000,
      index: queue.length,
      cycle: preset.cycles + 1,
      tone: 'calm',
    })
  }

  return queue
}
