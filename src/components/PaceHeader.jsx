import { usePace } from '../hooks/usePace'

const PACE_CONFIG = {
  AHEAD:   { label: '🟢 AHEAD',   bar: 'bg-green-500',  bg: 'bg-green-950',  text: 'text-green-400' },
  ON_PACE: { label: '🟡 ON PACE', bar: 'bg-yellow-400', bg: 'bg-yellow-950', text: 'text-yellow-400' },
  BEHIND:  { label: '🔴 BEHIND',  bar: 'bg-red-500',    bg: 'bg-red-950',    text: 'text-red-400' },
}

export default function PaceHeader({ session, checkIns, pendingSync, totalStops, onToggleDark }) {
  const { pace, elapsed, remaining } = usePace(session, checkIns)

  const config = pace ? PACE_CONFIG[pace.status] : PACE_CONFIG.ON_PACE
  const done = pace?.actualCount ?? 0
  const progressPct = Math.min(100, (done / totalStops) * 100)
  const recordBroken = done >= 151

  return (
    <div className={`sticky top-0 z-50 ${config.bg} border-b border-gray-800 px-4 pt-3 pb-2`}>
      {recordBroken && (
        <div className="text-center text-yellow-300 font-bold text-sm mb-2 animate-pulse">
          🏆 Record Broken!
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        {/* Stops */}
        <div className="text-center">
          <p className="text-2xl font-bold text-white leading-none">{done}</p>
          <p className="text-xs text-gray-400">of {totalStops}</p>
        </div>

        {/* Pace status */}
        <div className={`text-sm font-bold ${config.text}`}>{config.label}</div>

        {/* Timers */}
        <div className="text-right">
          <p className="text-sm font-mono text-white">{elapsed}</p>
          <p className="text-xs text-gray-400 font-mono">{remaining} left</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${config.bar} rounded-full transition-all duration-300`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Projection + sync */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          Projected: <span className="text-white font-semibold">{pace?.projected ?? '—'}</span> stops
        </span>
        <div className="flex items-center gap-3">
          {pendingSync > 0 ? (
            <span className="text-yellow-400">⏳ {pendingSync} pending</span>
          ) : (
            <span className="text-green-400">✓ Synced</span>
          )}
          <button onClick={onToggleDark} className="text-gray-500 text-base leading-none">
            ☀️
          </button>
        </div>
      </div>
    </div>
  )
}
