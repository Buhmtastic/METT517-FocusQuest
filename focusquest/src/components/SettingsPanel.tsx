import clsx from 'clsx'

import { SESSION_PRESETS } from '../constants/presets.ts'
import { useSessionStore } from '../state/sessionStore.ts'

export const SettingsPanel = () => {
  const settings = useSessionStore((state) => state.settings)
  const setPreset = useSessionStore((state) => state.setPreset)
  const updateSettings = useSessionStore((state) => state.updateSettings)

  const handleToggle = (key: 'autoAdvance' | 'soundEnabled' | 'vibrationsEnabled') => {
    updateSettings({ [key]: !settings[key] })
  }

  return (
    <div className="rounded-3xl border border-base-100/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
      <div className="text-sm font-medium text-base-500">Session Settings</div>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-base-400">Presets &amp; notifications</p>

      <div className="mt-5 space-y-3">
        {SESSION_PRESETS.map((preset) => {
          const isActive = preset.id === settings.activePresetId
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPreset(preset.id)}
              className={clsx(
                'w-full rounded-2xl border px-4 py-3 text-left transition',
                isActive
                  ? 'border-accent-400 bg-accent-400/15 text-base-900 dark:text-base-100'
                  : 'border-base-100/60 bg-white/70 text-base-500 hover:border-accent-300 dark:border-base-700/60 dark:bg-base-800/70',
              )}
            >
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{preset.name}</span>
                {isActive && <span className="text-xs uppercase tracking-[0.2em] text-accent-400">Active</span>}
              </div>
              <p className="mt-1 text-xs text-base-400">{preset.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-2">
        <ToggleRow
          label="Auto-start next session"
          description="Jump in without manual start after logging feedback."
          active={settings.autoAdvance}
          onToggle={() => handleToggle('autoAdvance')}
        />
        <ToggleRow
          label="Sound cue"
          description="Play a soft chime when a block completes."
          active={settings.soundEnabled}
          onToggle={() => handleToggle('soundEnabled')}
        />
        <ToggleRow
          label="Vibration"
          description="Trigger device vibration (mobile supported)."
          active={settings.vibrationsEnabled}
          onToggle={() => handleToggle('vibrationsEnabled')}
        />
      </div>
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  active: boolean
  onToggle: () => void
}

const ToggleRow = ({ label, description, active, onToggle }: ToggleRowProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-2xl border border-base-100/60 bg-white/70 px-4 py-3 text-left transition hover:border-accent-300 dark:border-base-700/60 dark:bg-base-800/70"
    >
      <div>
        <p className="text-sm font-semibold text-base-600 dark:text-base-200">{label}</p>
        <p className="mt-1 text-xs text-base-400">{description}</p>
      </div>
      <span
        className={clsx(
          'inline-flex h-6 w-12 items-center rounded-full border px-1 transition',
          active
            ? 'border-accent-400 bg-accent-400/30'
            : 'border-base-200 bg-base-100/60 dark:border-base-700',
        )}
      >
        <span
          className={clsx(
            'h-4 w-4 rounded-full bg-white shadow transition',
            active ? 'translate-x-6' : 'translate-x-0',
          )}
        />
      </span>
    </button>
  )
}
