import { useMemo } from 'react'
import dayjs from 'dayjs'

import { useSessionStore } from '../state/sessionStore.ts'
import { aggregateDailyMetrics, filterTodayEntries } from '../utils/metrics.ts'

/**
 * Emotion score thresholds for providing contextual feedback
 */
const EMOTION_THRESHOLD_FLOW = 4.2
const EMOTION_THRESHOLD_STEADY = 3.5
const EMOTION_THRESHOLD_DIPPING = 2.5

/**
 * Returns contextual feedback based on average emotion score.
 * @param score - Average emotion score (1-5 scale)
 * @returns Actionable feedback message
 */
const emotionStatement = (score: number): string => {
  if (!score) return 'Log a focus block to reveal mood insights.'
  if (score >= EMOTION_THRESHOLD_FLOW) return 'You are in a strong flow state - ride the momentum.'
  if (score >= EMOTION_THRESHOLD_STEADY) return 'Mood is steady. A mindful break could elevate energy.'
  if (score >= EMOTION_THRESHOLD_DIPPING) return 'Energy is dipping. Consider a recovery walk or hydration.'
  return 'You are running low - schedule a longer recharge before the next sprint.'
}

export const SessionInsights = () => {
  const history = useSessionStore((state) => state.history)
  const queue = useSessionStore((state) => state.phaseQueue)
  const currentIndex = useSessionStore((state) => state.currentIndex)

  const todayEntries = useMemo(() => filterTodayEntries(history), [history])
  const metrics = useMemo(
    () => aggregateDailyMetrics(todayEntries),
    [todayEntries],
  )

  const focusCompleted = todayEntries.filter((entry) => entry.phase === 'focus').length
  const upcomingFocus = queue.slice(currentIndex).filter((segment) => segment.phase === 'focus').length
  const lastNote = todayEntries.length ? todayEntries[todayEntries.length - 1] : undefined

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-base-100/60 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
      <div>
        <div className="text-sm font-medium text-base-500">Insights</div>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-base-400">
          Micro reflections &amp; momentum
        </p>

        <div className="mt-6 space-y-4 text-sm text-base-500">
          <div className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80">
            <p className="text-xs uppercase tracking-[0.3em] text-base-400">Mood trend</p>
            <p className="mt-2 text-base-900 dark:text-base-100">
              {emotionStatement(metrics.averageEmotion)}
            </p>
          </div>

          <div className="rounded-2xl border border-base-100/60 bg-white/80 p-4 dark:border-base-700/60 dark:bg-base-800/80">
            <p className="text-xs uppercase tracking-[0.3em] text-base-400">Focus cadence</p>
            <p className="mt-2 text-base-900 dark:text-base-100">
              {focusCompleted} focus blocks logged - {upcomingFocus} remaining in queue
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-base-400">Last note</p>
        {lastNote ? (
          <div className="mt-2 rounded-2xl border border-base-100/60 bg-white/80 p-4 text-sm text-base-500 dark:border-base-700/60 dark:bg-base-800/80">
            <div className="flex items-center justify-between text-xs text-base-400">
              <span>{dayjs(lastNote.startedAt).format('HH:mm')}</span>
              <span>{lastNote.phase === 'focus' ? 'Focus' : 'Recovery'}</span>
            </div>
            <p className="mt-2 text-base-300">{lastNote.note ?? 'No note provided.'}</p>
          </div>
        ) : (
          <p className="mt-2 rounded-2xl border border-dashed border-base-100/60 p-4 text-sm text-base-500 dark:border-base-700/60">
            Capture a reflection to see it here.
          </p>
        )}
      </div>
    </div>
  )
}
