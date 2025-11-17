/**
 * Time conversion constants
 */
export const MS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
export const MS_PER_DAY = MS_PER_MINUTE * 60 * 24;

/**
 * Formats duration in milliseconds to MM:SS format.
 * @param totalMs - Total milliseconds
 * @returns Formatted string in MM:SS format
 */
export const formatDuration = (totalMs: number) => {
  const safeMs = Math.max(0, totalMs)
  const totalSeconds = Math.floor(safeMs / MS_PER_SECOND)
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const calculateProgress = (remainingMs: number, totalMs: number) => {
  if (totalMs === 0) return 0
  return Math.min(1, Math.max(0, 1 - remainingMs / totalMs))
}

export const normalizeToDayKey = (isoDate: string) => {
  const target = new Date(isoDate)
  const year = target.getFullYear()
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const day = String(target.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const isToday = (isoDate: string) => {
  const todayKey = normalizeToDayKey(new Date().toISOString())
  return normalizeToDayKey(isoDate) === todayKey
}
