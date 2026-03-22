import { usePace } from '../hooks/usePace'

const PACE_CONFIG = {
  AHEAD:   { label: '🟢 AHEAD',   text: 'text-green-400' },
  ON_PACE: { label: '🟡 ON PACE', text: 'text-yellow-400' },
  BEHIND:  { label: '🔴 BEHIND',  text: 'text-red-400' },
}

export default function CrewSidebar({ session, checkIns, totalStops }) {
  const { pace, elapsed, remaining } = usePace(session, checkIns)

  const config = pace ? PACE_CONFIG[pace.status] : PACE_CONFIG.ON_PACE
  const done = pace?.actualCount ?? 0
  const skipped = checkIns.filter(c => c.type === 'skip').length
  const recordBroken = done >= 151
  const progressPct = Math.min(100, (done / totalStops) * 100)

  const recentCheckIns = [...checkIns]
    .filter(c => c.type === 'checkin' || c.type === 'skip')
    .reverse()

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white px-5 py-5 overflow-hidden">
      {/* Record banner */}
      {recordBroken && (
        <div className="bg-yellow-900 border border-yellow-600 text-yellow-300 text-center font-bold py-2 rounded-xl mb-4 animate-pulse">
          🏆 Record Broken!
        </div>
      )}

      {/* Big stop count */}
      <div className="text-center mb-4">
        <p className="text-6xl font-black text-white">{done}</p>
        <p className="text-gray-400 text-sm">of {totalStops} stops</p>
        {skipped > 0 && (
          <p className="text-red-400 text-xs mt-1">{skipped} skipped</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Pace + timers */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Elapsed</p>
          <p className="text-lg font-mono font-bold">{elapsed}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Remaining</p>
          <p className="text-lg font-mono font-bold">{remaining}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Pace</p>
          <p className={`text-sm font-bold ${config.text}`}>{config.label}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Projected</p>
          <p className="text-lg font-bold">{pace?.projected ?? '—'}</p>
        </div>
      </div>

      {pace && (
        <div className="text-xs text-gray-500 text-center mb-4">
          {pace.stopsPerHour}/hr actual · {pace.plannedCount} planned by now
          {pace.deltaMin !== 0 && (
            <span className={pace.deltaMin < 0 ? ' text-green-400' : ' text-red-400'}>
              {' '}· {Math.abs(Math.round(pace.deltaMin))} min {pace.deltaMin < 0 ? 'ahead' : 'behind'}
            </span>
          )}
        </div>
      )}

      {/* Check-in log */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
          Check-in Log
        </p>
        <div className="space-y-2">
          {recentCheckIns.length === 0 && (
            <p className="text-gray-600 text-sm">No check-ins yet.</p>
          )}
          {recentCheckIns.map(ci => (
            <div key={ci.id} className="bg-gray-900 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className={`text-xs font-bold w-6 shrink-0 ${ci.type === 'skip' ? 'text-red-400' : 'text-green-400'}`}>
                #{ci.stopNumber}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{ci.name}</p>
                <p className="text-gray-500 text-xs">{ci.checkinTimeLocal}</p>
              </div>
              {ci.type === 'skip' && (
                <span className="text-red-500 text-xs font-bold shrink-0">SKIP</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
