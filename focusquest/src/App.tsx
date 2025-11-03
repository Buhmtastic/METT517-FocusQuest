import { TimerPanel } from './components/TimerPanel.tsx'
import { SessionQueue } from './components/SessionQueue.tsx'
import { SessionFeedbackModal } from './components/SessionFeedbackModal.tsx'
import { DailyLog } from './components/DailyLog.tsx'
import { DailyTrendsChart } from './components/DailyTrendsChart.tsx'
import { SessionInsights } from './components/SessionInsights.tsx'
import { SettingsPanel } from './components/SettingsPanel.tsx'

function App() {
  return (
    <>
      <main className="min-h-screen bg-base-50 text-base-900 transition-colors dark:bg-base-900 dark:text-base-100">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 lg:px-12">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-400">
                Focus Sprint Coach
            </p>
            <h1 className="mt-2 text-3xl font-bold text-base-900 dark:text-base-100">
              Guided deep work with emotional check-ins
            </h1>
          </div>
          <div className="hidden items-center gap-3 text-sm font-medium text-base-500 lg:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-accent-400" />
            <span>Daily pulse</span>
          </div>
        </header>
        <section className="mt-12 grid flex-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="grid gap-6 lg:grid-rows-[auto_auto_1fr]">
            <TimerPanel />
            <SessionQueue />
            <DailyLog />
          </div>
          <aside className="grid gap-6 lg:grid-rows-[auto_1fr_auto]">
            <DailyTrendsChart />
            <SessionInsights />
            <SettingsPanel />
          </aside>
        </section>
        <footer className="mt-10 flex flex-col gap-2 text-sm text-base-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for mindful makers staying in flow.</p>
          <div className="flex items-center gap-3">
            <span>[Space] Play / Pause</span>
            <span>[Enter] Next session</span>
          </div>
        </footer>
      </div>
      </main>
      <SessionFeedbackModal />
    </>
  )
}

export default App
