import type { SessionLogEntry } from '../types/session.ts'
import { isToday } from './time.ts'

export const filterTodayEntries = (history: SessionLogEntry[]) =>
  history.filter((entry) => isToday(entry.startedAt))

export const aggregateDailyMetrics = (entries: SessionLogEntry[]) => {
  if (!entries.length) {
    return {
      totalSessions: 0,
      focusMinutes: 0,
      breakMinutes: 0,
      averageEmotion: 0,
      averageEnergy: 0,
    }
  }

  const totals = entries.reduce(
    (acc, entry) => {
      const minutes = entry.durationMs / 60000
      if (entry.phase === 'focus') {
        acc.focusMinutes += minutes
      } else {
        acc.breakMinutes += minutes
      }
      acc.emotionSum += entry.emotion
      acc.energySum += entry.energy
      return acc
    },
    {
      focusMinutes: 0,
      breakMinutes: 0,
      emotionSum: 0,
      energySum: 0,
    },
  )

  const totalSessions = entries.length
  return {
    totalSessions,
    focusMinutes: Math.round(totals.focusMinutes),
    breakMinutes: Math.round(totals.breakMinutes),
    averageEmotion: +(totals.emotionSum / totalSessions).toFixed(1),
    averageEnergy: Math.round(totals.energySum / totalSessions),
  }
}
