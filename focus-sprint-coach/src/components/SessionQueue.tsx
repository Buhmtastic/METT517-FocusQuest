import { useMemo } from 'react'
import clsx from 'clsx'

import { useSessionStore } from '../state/sessionStore.ts'
import { formatDuration } from '../utils/time.ts'

const MAX_QUEUE_RENDER = 6

export const SessionQueue = () => {
  const queue = useSessionStore((state) => state.phaseQueue)
  const currentIndex = useSessionStore((state) => state.currentIndex)
  const status = useSessionStore((state) => state.status)

  const snapshot = useMemo(() => {
    if (queue.length === 0) return []
    return Array.from({ length: Math.min(queue.length, MAX_QUEUE_RENDER) }, (_, idx) => {
      const position = (currentIndex + idx) % queue.length
      return {
        ...queue[position],
        isCurrent: idx === 0,
        position,
      }
    })
  }, [queue, currentIndex])

  if (queue.length === 0) {
    return (
      <div className="rounded-3xl border border-base-100/60 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
        <div className="text-sm font-medium text-base-500">Session Queue</div>
        <p className="mt-3 text-base text-base-500">
          Add a preset to populate your focus and recovery rhythm.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-base-100/60 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-base-500">Session Queue</div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-base-400">
            Next {snapshot.length} rounds
          </p>
        </div>
        <span
          className={clsx(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
            status === 'running'
              ? 'bg-accent-400/20 text-accent-400'
              : 'bg-base-100 text-base-500',
          )}
        >
          {status === 'running' ? 'Live' : 'Ready'}
        </span>
      </div>

      <ul className="mt-6 space-y-3">
        {snapshot.map((item) => (
          <li
            key={`${item.index}-${item.cycle}-${item.position}`}
            className={clsx(
              'flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm transition',
              item.isCurrent
                ? 'border-accent-300 bg-accent-400/10 backdrop-blur'
                : 'border-base-100/60 bg-white/80 dark:border-base-700/60 dark:bg-base-800/70',
            )}
          >
            <div>
              <p
                className={clsx(
                  'text-sm font-semibold',
                  item.isCurrent ? 'text-base-900 dark:text-base-50' : 'text-base-600 dark:text-base-300',
                )}
              >
                {item.label}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-base-400">
                {item.phase === 'focus' ? 'Focus' : 'Recovery'} - Cycle {item.cycle}
              </p>
            </div>
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-semibold',
                item.phase === 'focus'
                  ? 'bg-accent-400/30 text-accent-500'
                  : 'bg-emerald-400/20 text-emerald-500',
              )}
            >
              {formatDuration(item.durationMs)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
