import { useEffect, useMemo } from 'react'
import clsx from 'clsx'

import { useTimer } from '../hooks/useTimer.ts'
import { useSessionStore } from '../state/sessionStore.ts'
import type { SessionPhaseInstance } from '../types/session.ts'
import { calculateProgress, formatDuration } from '../utils/time.ts'
import { xpToNextLevel } from '../utils/gamification.ts'

const CIRCLE_RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

const getPhaseBadgeStyle = (phase?: SessionPhaseInstance) => {
  if (!phase) return 'bg-base-100 text-base-500'
  return phase.phase === 'focus'
    ? 'bg-accent-400/15 text-accent-400'
    : 'bg-emerald-500/15 text-emerald-400'
}

const statusLabelMap = {
  idle: 'Ready',
  running: 'In session',
  paused: 'Paused',
  awaiting_feedback: 'Awaiting check-in',
} as const

const actionLabel = (status: string) => {
  switch (status) {
    case 'running':
      return 'Pause'
    case 'paused':
      return 'Resume'
    case 'idle':
      return 'Start focus'
    case 'awaiting_feedback':
      return 'Log session'
    default:
      return 'Start'
  }
}

export const TimerPanel = () => {
  const {
    status,
    remainingMs,
    phase,
    pendingFeedback,
    actions: { start, pause, resume, skip, acknowledgePhase, markPhaseComplete },
  } = useTimer()

  const { gamification } = useSessionStore()
  const { level, totalXP, stats } = gamification

  const totalMs = phase?.durationMs ?? 0
  const displayTime = useMemo(
    () => formatDuration(remainingMs || totalMs),
    [remainingMs, totalMs],
  )
  const progress = useMemo(
    () => calculateProgress(remainingMs, totalMs),
    [remainingMs, totalMs],
  )

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const canStart = status === 'idle'
  const awaitingFeedback = status === 'awaiting_feedback'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code === 'Space') {
        event.preventDefault()
        if (awaitingFeedback) {
          acknowledgePhase()
          return
        }
        if (isRunning) {
          pause()
        } else if (isPaused) {
          resume()
        } else if (canStart) {
          start()
        }
      }

      if (event.code === 'Enter') {
        event.preventDefault()
        if (awaitingFeedback) {
          acknowledgePhase()
          return
        }
        if (isRunning || isPaused) {
          markPhaseComplete(true)
        } else {
          skip()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    acknowledgePhase,
    awaitingFeedback,
    canStart,
    isPaused,
    isRunning,
    markPhaseComplete,
    pause,
    resume,
    skip,
    start,
  ])

  const primaryHandler = () => {
    if (awaitingFeedback) {
      acknowledgePhase()
      return
    }
    if (isRunning) {
      pause()
    } else if (isPaused) {
      resume()
    } else {
      start()
    }
  }

  const secondaryHandler = () => {
    if (isRunning || isPaused) {
      markPhaseComplete(true)
    } else {
      skip()
    }
  }

  const statusLabel = statusLabelMap[status] ?? 'Ready'

  return (
    <div className="rounded-3xl border border-base-100/70 bg-white/70 p-8 shadow-lg backdrop-blur dark:border-base-700/50 dark:bg-base-800/80">
      <header className="flex items-center justify-between">
        <div>
          {phase ? (
            <span
              className={clsx(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                getPhaseBadgeStyle(phase),
              )}
            >
              {phase.phase === 'focus' ? 'Focus' : 'Recovery'} cycle {phase.cycle}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-base-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-base-400 dark:bg-base-700 dark:text-base-300">
              Session queue empty
            </span>
          )}
          <h2 className="mt-4 text-4xl font-semibold text-base-900 dark:text-base-50">
            {phase?.label ?? 'No session'}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-400">
            {statusLabel}
          </p>
          {phase ? (
            <p className="mt-1 text-sm text-base-500 dark:text-base-400">
              Round {phase.index + 1} &middot; {phase.phase === 'focus' ? 'Focus work' : 'Recovery'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-base-500 dark:text-base-400">
              Choose a preset to begin
            </p>
          )}
        </div>
      </header>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-base-100/70 bg-white/80 shadow-inner dark:border-base-700/60 dark:bg-base-800/90">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle
              className="stroke-base-100/80 dark:stroke-base-700/70"
              strokeWidth="10"
              cx="60"
              cy="60"
              r="54"
              fill="none"
            />
            <circle
              className={clsx(
                'transition-all duration-300 ease-out',
                phase?.phase === 'focus'
                  ? 'stroke-accent-400'
                  : 'stroke-emerald-400',
              )}
              strokeLinecap="round"
              strokeWidth="12"
              cx="60"
              cy="60"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - (progress || 0))}
            />
          </svg>
          <div className="relative z-10 text-center">
            <p className="font-mono text-6xl font-semibold tracking-tight">
              {displayTime}
            </p>
            <p className="mt-3 text-sm text-base-500 dark:text-base-300">
              {phase ? `${Math.round(phase.durationMs / 60000)} min session` : ''}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={primaryHandler}
            className={clsx(
              'flex w-full items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition sm:w-auto',
              awaitingFeedback
                ? 'bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500/90 dark:hover:bg-amber-500'
                : isRunning
                  ? 'bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                  : 'bg-accent-400 text-base-900 hover:bg-accent-300',
            )}
          >
            {actionLabel(status)}
            <span className="text-xs font-normal uppercase tracking-[0.2em] text-white/60">
              Space
            </span>
          </button>
          <button
            type="button"
            onClick={secondaryHandler}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-base-100/80 bg-white/70 px-6 py-3 text-base font-medium text-base-600 transition hover:border-accent-300 hover:text-accent-400 sm:w-auto dark:border-base-700/70 dark:bg-base-800/80 dark:text-base-300 dark:hover:border-accent-400/50"
          >
            {awaitingFeedback ? 'Skip logging' : isRunning || isPaused ? 'Complete early' : 'Skip'}
            <span className="text-xs font-normal uppercase tracking-[0.2em] text-base-300">
            Enter
            </span>
          </button>
        </div>

        {pendingFeedback && (
          <p className="mt-2 text-center text-sm text-base-500 dark:text-base-300">
            Session ready for journaling. Press <span className="font-semibold">Space</span> or click{' '}
            <span className="font-semibold">Log session</span> to continue.
          </p>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm text-base-500 dark:text-base-400">
        <p>Level: {level} (XP: {totalXP} / {xpToNextLevel(totalXP) + totalXP})</p>
        <p>Sessions: {stats.totalSessions}</p>
      </div>
    </div>
  )
}
