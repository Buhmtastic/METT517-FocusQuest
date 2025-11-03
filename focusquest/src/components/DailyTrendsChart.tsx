import { useMemo } from 'react'
import dayjs from 'dayjs'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useSessionStore } from '../state/sessionStore.ts'
import { filterTodayEntries } from '../utils/metrics.ts'

type TrendPoint = {
  time: string
  energy: number
  emotion: number
}

interface TrendTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TrendPoint }>
}

const TooltipContent = ({
  active,
  payload,
}: TrendTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0].payload as TrendPoint
  return (
    <div className="rounded-2xl border border-base-100/70 bg-white/95 px-4 py-3 text-sm shadow-lg dark:border-base-700/70 dark:bg-base-800/90">
      <p className="font-semibold text-base-700 dark:text-base-100">{item.time}</p>
      <p className="text-sm text-base-500">Energy {item.energy}% - Mood {item.emotion}</p>
    </div>
  )
}

export const DailyTrendsChart = () => {
  const history = useSessionStore((state) => state.history)

  const data = useMemo<TrendPoint[]>(() => {
    return filterTodayEntries(history)
      .filter((entry) => entry.phase === 'focus')
      .sort((a, b) => dayjs(a.startedAt).valueOf() - dayjs(b.startedAt).valueOf())
      .map((entry) => ({
        time: dayjs(entry.startedAt).format('HH:mm'),
        energy: entry.energy,
        emotion: entry.emotion,
      }))
  }, [history])

  return (
    <div className="flex h-full flex-col rounded-3xl border border-base-100/60 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-base-700/60 dark:bg-base-800/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-base-500">Energy Trajectory</div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-base-400">
            Focus sessions today
          </p>
        </div>
      </div>
      <div className="mt-6 flex-1">
        {data.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-base-100/60 bg-transparent p-6 text-sm text-base-500 dark:border-base-700/60">
            Log at least one focus sprint to unlock the trendline.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.35} />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <Tooltip content={<TooltipContent />} cursor={{ stroke: '#38bdf8', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="#38bdf8"
                strokeWidth={3}
                fill="url(#energyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
