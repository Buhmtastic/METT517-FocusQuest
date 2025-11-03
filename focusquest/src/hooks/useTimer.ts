import { useEffect } from 'react'

import { useCurrentPhase, useSessionStore } from '../state/sessionStore.ts'

const TICK_INTERVAL_MS = 1000

export const useTimer = () => {
  const status = useSessionStore((state) => state.status)
  const remainingMs = useSessionStore((state) => state.remainingMs)
  const currentPhase = useCurrentPhase()

  const start = useSessionStore((state) => state.start)
  const pause = useSessionStore((state) => state.pause)
  const resume = useSessionStore((state) => state.resume)
  const skip = useSessionStore((state) => state.skip)
  const tick = useSessionStore((state) => state.tick)
  const pendingFeedback = useSessionStore((state) => state.pendingFeedback)
  const acknowledgePhase = useSessionStore((state) => state.acknowledgePhase)
  const markPhaseComplete = useSessionStore((state) => state.markPhaseComplete)

  useEffect(() => {
    if (status !== 'running') {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      tick(TICK_INTERVAL_MS)
    }, TICK_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [status, tick])

  return {
    status,
    remainingMs,
    phase: currentPhase,
    pendingFeedback,
    actions: {
      start,
      pause,
      resume,
      skip,
      acknowledgePhase,
      markPhaseComplete,
    },
  }
}
