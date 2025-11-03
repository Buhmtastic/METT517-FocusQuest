import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTimer } from '../useTimer.ts'
import { resetSessionStore } from '../../state/sessionStore.ts'

describe('useTimer hook', () => {
  beforeEach(() => {
    act(() => {
      resetSessionStore()
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
  })

  it('counts down remaining time when running', () => {
    const { result } = renderHook(() => useTimer())

    const startingMs = result.current.remainingMs

    act(() => {
      result.current.actions.start()
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.status).toBe('running')
    expect(result.current.remainingMs).toBe(startingMs - 3000)
  })

  it('pauses and resumes without losing remaining time', () => {
    const { result } = renderHook(() => useTimer())

    act(() => {
      result.current.actions.start()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    const remainingAfter2s = result.current.remainingMs

    act(() => {
      result.current.actions.pause()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.remainingMs).toBe(remainingAfter2s)

    act(() => {
      result.current.actions.resume()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.remainingMs).toBe(remainingAfter2s - 1000)
  })

  it('moves to feedback state when a block completes', () => {
    const { result } = renderHook(() => useTimer())

    const duration = result.current.phase?.durationMs ?? 0

    act(() => {
      result.current.actions.start()
    })

    act(() => {
      vi.advanceTimersByTime(duration)
    })

    expect(result.current.status).toBe('awaiting_feedback')
    expect(result.current.pendingFeedback).toBeTruthy()
  })
})
