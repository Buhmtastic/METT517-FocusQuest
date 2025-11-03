export const formatDuration = (totalMs: number) => {
  const safeMs = Math.max(0, totalMs)
  const totalSeconds = Math.floor(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
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
