# Focus Sprint Coach

Guided focus timer that pairs Pomodoro-style sessions with quick emotional and energy check-ins. Capture how each block felt, watch your daily energy line chart update in real time, and tweak presets or reminders without leaving the dashboard.

## Features
- Pomodoro-style session queue with keyboard shortcuts (`Space` to play/pause, `Enter` to end/skip).
- Feedback modal after every block for emotion (1-5 scale), energy slider, and optional notes.
- Daily log with adherence stats, editable entries, and day reset.
- Energy trajectory chart (Recharts) for today’s focus sessions plus qualitative insights.
- Preset picker and auto-start/sound/vibration toggles persisted in localStorage.

## Getting Started

```bash
npm install --cache .npm-cache
npm run dev
```

Open `http://localhost:5173` and keep the console open for keyboard shortcut hints.

## Scripts
- `npm run dev` – start Vite in development mode.
- `npm run build` – type check (`tsc -b`) and produce a production bundle.
- `npm test` – run Vitest + Testing Library hook specs.
- `npm run preview` – serve the production bundle locally.

## Keyboard Cheatsheet
- `Space` - toggle play / pause (or acknowledge feedback prompt).
- `Enter` - mark the current block complete / skip.
- `Esc` - dismiss feedback modal without logging.

## Tech Stack
- Vite + React 19 + TypeScript
- Tailwind CSS 3.4, Zustand, Day.js
- Recharts for sparkline visualisation
- Vitest + Testing Library for hooks and store behaviour
