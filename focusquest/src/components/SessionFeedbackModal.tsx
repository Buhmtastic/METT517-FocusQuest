import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import dayjs from 'dayjs'

import { useSessionStore } from '../state/sessionStore.ts'
import type { PendingFeedback } from '../types/session.ts'

/**
 * Emotion scale with emojis for visual feedback
 */
const EMOTION_SCALE = [
  { value: 1, label: 'Drained', emoji: '😵' },
  { value: 2, label: 'Tired', emoji: '😓' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Engaged', emoji: '🙂' },
  { value: 5, label: 'Flow', emoji: '🤩' },
] as const

/**
 * Default values for feedback form
 */
const DEFAULT_EMOTION = 3
const DEFAULT_ENERGY = 50
const DEFAULT_NOTE = ''

const defaultState = {
  emotion: DEFAULT_EMOTION,
  energy: DEFAULT_ENERGY,
  note: DEFAULT_NOTE,
}

const describePhase = (pending?: PendingFeedback) => {
  if (!pending) return ''
  const start = dayjs(pending.startedAt).format('HH:mm')
  const end = dayjs(pending.endedAt).format('HH:mm')
  return `${pending.phase.label} - ${start} -> ${end}`
}

export const SessionFeedbackModal = () => {
  const pendingFeedback = useSessionStore((state) => state.pendingFeedback)
  const recordFeedback = useSessionStore((state) => state.recordFeedback)
  const acknowledgePhase = useSessionStore((state) => state.acknowledgePhase)
  const autoAdvance = useSessionStore((state) => state.settings.autoAdvance)
  const startNext = useSessionStore((state) => state.start)

  const [open, setOpen] = useState(false)
  const [emotion, setEmotion] = useState(defaultState.emotion)
  const [energy, setEnergy] = useState(defaultState.energy)
  const [note, setNote] = useState(defaultState.note)

  useEffect(() => {
    if (pendingFeedback) {
      setOpen(true)
      setEmotion(defaultState.emotion)
      setEnergy(defaultState.energy)
      setNote(defaultState.note)
    } else {
      setOpen(false)
    }
  }, [pendingFeedback])

  const skipLogging = useCallback(() => {
    acknowledgePhase()
    if (autoAdvance) {
      window.setTimeout(() => startNext(), 0)
    }
  }, [acknowledgePhase, autoAdvance, startNext])

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        skipLogging()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, skipLogging])

  const onSubmit = useCallback(() => {
    if (!pendingFeedback) return
    recordFeedback({
      phase: pendingFeedback.phase.phase,
      startedAt: pendingFeedback.startedAt,
      endedAt: pendingFeedback.endedAt,
      durationMs: pendingFeedback.durationMs,
      emotion,
      energy,
      note: note.trim() ? note.trim() : undefined,
    })
    acknowledgePhase()
    if (autoAdvance) {
      window.setTimeout(() => startNext(), 0)
    }
  }, [
    acknowledgePhase,
    autoAdvance,
    emotion,
    energy,
    note,
    pendingFeedback,
    recordFeedback,
    startNext,
  ])

  const description = useMemo(
    () => describePhase(pendingFeedback ?? undefined),
    [pendingFeedback],
  )

  if (!open || !pendingFeedback) {
    return null
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-900/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-base-700/70 bg-base-900/95 p-8 text-base-100 shadow-2xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
            Session check-in
          </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
            How did that feel?
          </h3>
          <p className="mt-1 text-sm text-base-300">{description}</p>
        </header>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-400">
              Emotion
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {EMOTION_SCALE.map((item) => {
                const isActive = item.value === emotion
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setEmotion(item.value)}
                    className={clsx(
                      'flex flex-col items-center rounded-2xl border px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'border-accent-400 bg-accent-400/20 text-white'
                        : 'border-base-700 bg-base-800 text-base-300 hover:border-base-500 hover:text-base-100',
                    )}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="mt-2 text-xs uppercase tracking-[0.2em]">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-400">
                Energy level
              </p>
              <span className="text-sm font-semibold text-base-200">{energy}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={energy}
              onChange={(event) => setEnergy(Number(event.target.value))}
              className="mt-3 w-full accent-accent-400"
            />
            <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.3em] text-base-500">
              <span>Empty</span>
              <span>Full</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-base-400">
              Quick note
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional reflections, blockers, or wins..."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-base-700 bg-base-800/70 px-4 py-3 text-sm text-base-100 outline-none focus:border-accent-400"
            />
          </div>
        </div>

        <footer className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={skipLogging}
            className="w-full rounded-full border border-base-700/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-base-300 transition hover:border-base-500 hover:text-base-100 sm:w-auto"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="w-full rounded-full bg-accent-400 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-base-900 transition hover:bg-accent-300 sm:w-auto"
          >
            Save check-in
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
