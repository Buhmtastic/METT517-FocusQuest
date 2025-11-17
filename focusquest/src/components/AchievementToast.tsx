import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

import { useSessionStore } from '../state/sessionStore.ts'
import type { AchievementNotification } from '../types/gamification'

/**
 * Auto-dismiss duration in milliseconds
 */
const AUTO_DISMISS_DURATION = 5000

/**
 * Rarity color mapping for toast backgrounds
 */
const RARITY_COLORS = {
  common: 'from-base-600/90 to-base-700/90',
  rare: 'from-blue-600/90 to-blue-700/90',
  epic: 'from-purple-600/90 to-purple-700/90',
  legendary: 'from-amber-600/90 to-amber-700/90',
} as const

/**
 * Type icon mapping
 */
const TYPE_ICONS = {
  badge: '🏆',
  level: '⬆️',
  skill: '🎁',
} as const

interface ToastItemProps {
  achievement: AchievementNotification
  onDismiss: (timestamp: number) => void
}

const ToastItem = ({ achievement, onDismiss }: ToastItemProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(achievement.timestamp)
    }, 300) // Match animation duration
  }, [achievement.timestamp, onDismiss])

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_DURATION)

    return () => clearTimeout(dismissTimer)
  }, [handleDismiss])

  const gradientClass = achievement.rarity
    ? RARITY_COLORS[achievement.rarity]
    : 'from-base-700/90 to-base-800/90'

  return (
    <div
      className={clsx(
        'mb-3 w-full max-w-sm transform rounded-2xl shadow-2xl transition-all duration-300',
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div
        className={clsx(
          'flex items-start gap-4 rounded-2xl border border-white/20 bg-gradient-to-br p-4',
          gradientClass
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur">
            {achievement.icon || TYPE_ICONS[achievement.type]}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white">
                {achievement.type === 'badge' ? 'Badge Unlocked' : achievement.type === 'level' ? 'Level Up' : 'Skill Unlocked'}
              </h3>
              <p className="mt-1 font-semibold text-white">
                {achievement.title}
              </p>
              {achievement.description && (
                <p className="mt-1 text-xs text-white/80">
                  {achievement.description}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-shrink-0 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Rarity badge */}
          {achievement.rarity && (
            <div className="mt-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
              {achievement.rarity}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="h-1 overflow-hidden rounded-b-2xl bg-black/20">
        <div
          className="h-full bg-white/40"
          style={{
            animation: `shrink ${AUTO_DISMISS_DURATION}ms linear`,
          }}
        />
      </div>

      <style>
        {`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}
      </style>
    </div>
  )
}

/**
 * Global achievement toast container.
 * Displays notifications for badges, level ups, and skill unlocks.
 */
export const AchievementToast = () => {
  const achievements = useSessionStore((state) => state.achievements)
  const dismissAchievement = useSessionStore((state) => state.dismissAchievement)

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-start justify-end p-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto flex flex-col items-end">
        {achievements.map((achievement) => (
          <ToastItem
            key={achievement.timestamp}
            achievement={achievement}
            onDismiss={dismissAchievement}
          />
        ))}
      </div>
    </div>,
    document.body
  )
}
