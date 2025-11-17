import type { SessionLogEntry } from '../types/session.ts'
import { isToday, MS_PER_MINUTE } from './time.ts'

/**
 * Filters session history to include only today's entries.
 * @param history - Complete session history
 * @returns Sessions that occurred today
 */
export const filterTodayEntries = (history: SessionLogEntry[]): SessionLogEntry[] =>
  history.filter((entry) => isToday(entry.startedAt))

/**
 * Aggregates daily metrics from session entries.
 * @param entries - Session log entries to aggregate
 * @returns Aggregated metrics including session counts and averages
 */
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
      const minutes = entry.durationMs / MS_PER_MINUTE
      if (entry.phase === 'focus') {
        acc.focusMinutes += minutes
      } else {
        acc.breakMinutes += minutes
      }
      acc.emotionSum += entry.emotion ?? 0
      acc.energySum += entry.energy ?? 0
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
