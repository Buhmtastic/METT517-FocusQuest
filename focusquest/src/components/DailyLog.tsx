import dayjs from 'dayjs'
import clsx from 'clsx'

import { useSessionStore } from '../state/sessionStore.ts'
import { aggregateDailyMetrics, filterTodayEntries } from '../utils/metrics.ts'
import { formatDuration } from '../utils/time.ts'

const emotionLabel = (value: number) => {
  switch (value) {
    case 1:
      return 'Drained'
    case 2:
      return 'Tired'
    case 3:
      return 'Neutral'
    case 4:
      return 'Engaged'
    case 5:
      return 'Flow'
    default:
      return 'n/a'
  }
}

export const DailyLog = () => {
  const history = useSessionStore((state) => state.history)
  const removeEntry = useSessionStore((state) => state.removeLogEntry)
  const resetDay = useSessionStore((state) => state.resetDay)

  const todayEntries = filterTodayEntries(history)
  const metrics = aggregateDailyMetrics(todayEntries)

  return (
    <div className="flex h-full flex-col rounded-3xl border border-base-100/60 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-base-500">Today&apos;s Check-ins</div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-base-400">
            {metrics.totalSessions} sessions logged
          </p>
        </div>
        <button
          type="button"
          onClick={resetDay}
          className="rounded-full border border-base-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-base-400 transition hover:border-accent-300 hover:text-accent-400 dark:border-base-700/70"
        >
          Clear day
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-base-500 sm:grid-cols-4">
        <div className="rounded-2xl border border-base-100/60 bg-white/70 p-4 shadow-sm dark:border-base-700/60 dark:bg-base-800/70">
          <p className="text-[11px] uppercase tracking-[0.3em] text-base-400">Focus</p>
          <p className="mt-1 text-xl font-semibold text-base-900 dark:text-base-100">
            {metrics.focusMinutes}m
          </p>
        </div>
        <div className="rounded-2xl border border-base-100/60 bg-white/70 p-4 shadow-sm dark:border-base-700/60 dark:bg-base-800/70">
          <p className="text-[11px] uppercase tracking-[0.3em] text-base-400">Recovery</p>
          <p className="mt-1 text-xl font-semibold text-base-900 dark:text-base-100">
            {metrics.breakMinutes}m
          </p>
        </div>
        <div className="rounded-2xl border border-base-100/60 bg-white/70 p-4 shadow-sm dark:border-base-700/60 dark:bg-base-800/70">
          <p className="text-[11px] uppercase tracking-[0.3em] text-base-400">Mood</p>
          <p className="mt-1 text-xl font-semibold text-base-900 dark:text-base-100">
            {metrics.averageEmotion || 'n/a'}
          </p>
        </div>
        <div className="rounded-2xl border border-base-100/60 bg-white/70 p-4 shadow-sm dark:border-base-700/60 dark:bg-base-800/70">
          <p className="text-[11px] uppercase tracking-[0.3em] text-base-400">Energy</p>
          <p className="mt-1 text-xl font-semibold text-base-900 dark:text-base-100">
            {metrics.averageEnergy ? `${metrics.averageEnergy}%` : 'n/a'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-auto pr-2">
        {todayEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-base-100/60 bg-transparent p-6 text-sm text-base-500 dark:border-base-700/60">
            No entries yet. Complete a focus sprint to capture how you&apos;re feeling.
          </p>
        ) : (
          <ul className="space-y-3">
            {todayEntries
              .slice()
              .reverse()
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between rounded-2xl border border-base-100/60 bg-white/90 p-4 shadow-sm dark:border-base-700/60 dark:bg-base-800/80"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-base-900 dark:text-base-50">
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                          entry.phase === 'focus'
                            ? 'bg-accent-400/20 text-accent-400'
                            : 'bg-emerald-400/15 text-emerald-400',
                        )}
                      >
                        {entry.phase === 'focus' ? 'Focus' : 'Recovery'}
                      </span>
                      <span>{formatDuration(entry.durationMs)}</span>
                      <span className="text-base-400">-</span>
                      <span>{dayjs(entry.startedAt).format('HH:mm')}</span>
                    </div>
                    <p className="mt-2 text-sm text-base-400">
                      {emotionLabel(entry.emotion)} - Energy {entry.energy}%
                    </p>
                    {entry.note && (
                      <p className="mt-2 rounded-2xl bg-base-100/50 px-3 py-2 text-sm text-base-300 dark:bg-base-700/50">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="rounded-full border border-transparent px-3 py-2 text-xs uppercase tracking-[0.25em] text-base-400 transition hover:border-base-200 hover:text-base-200"
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}
