import { useEffect, useState } from 'react'
import { generateCSV } from '../lib/export'
import { formatElapsed } from '../lib/pace'
import route from '../data/route.json'

function totalDistanceMiles(checkIns) {
  const visited = new Set(checkIns.filter(c => c.type === 'checkin').map(c => c.stopNumber))
  return route
    .filter(s => visited.has(s.stop_number))
    .reduce((sum, s) => sum + (s.leg_distance_miles ?? 0), 0)
    .toFixed(1)
}

export default function Summary({ session, checkIns, elapsedSeconds }) {
  const [confetti, setConfetti] = useState(false)

  const completed = checkIns.filter(c => c.type === 'checkin').length
  const skipped = checkIns.filter(c => c.type === 'skip').length
  const recordBroken = completed >= 151
  const stopsPerHour = elapsedSeconds > 0
    ? ((completed / elapsedSeconds) * 3600).toFixed(1)
    : '—'
  const distance = totalDistanceMiles(checkIns)

  const recentCheckIns = [...checkIns]
    .filter(c => c.type === 'checkin' || c.type === 'skip')
    .reverse()

  useEffect(() => {
    if (recordBroken) {
      setConfetti(true)
      const t = setTimeout(() => setConfetti(false), 4000)
      return () => clearTimeout(t)
    }
  }, [recordBroken])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Confetti overlay */}
      {confetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-3 opacity-80 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -20}%`,
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-8 max-w-md mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">{recordBroken ? '🏆' : '🏁'}</div>
          <h1 className="text-2xl font-bold">
            {recordBroken ? 'Record Broken!' : 'Attempt Complete'}
          </h1>
          <p className={`text-lg font-medium mt-1 ${recordBroken ? 'text-green-400' : 'text-red-400'}`}>
            {recordBroken
              ? `${completed} stops — GWR Record Broken`
              : `${completed} stops — Record not broken (need 151)`}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-white">{completed}</p>
            <p className="text-xs text-gray-400 mt-1">Stops Visited</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-white">{skipped}</p>
            <p className="text-xs text-gray-400 mt-1">Skipped</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white font-mono">
              {formatElapsed(elapsedSeconds)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Time</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-white">{distance}</p>
            <p className="text-xs text-gray-400 mt-1">Miles Covered</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center col-span-2">
            <p className="text-3xl font-black text-white">{stopsPerHour}</p>
            <p className="text-xs text-gray-400 mt-1">Avg Stops / Hour</p>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={() => generateCSV(checkIns, session)}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg"
        >
          Download Evidence CSV
        </button>

        {/* Start again */}
        <button
          onClick={() => {
            if (confirm('Clear all data and start a new attempt?')) {
              localStorage.removeItem('gwr_session')
              localStorage.removeItem('gwr_checkins')
              localStorage.removeItem('gwr_route_index')
              window.location.reload()
            }
          }}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl text-sm"
        >
          Start Again
        </button>

        {/* Full check-in log */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
            Full Check-in Log ({recentCheckIns.length} events)
          </p>
          <div className="space-y-2">
            {recentCheckIns.map(ci => (
              <div key={ci.id} className="bg-gray-900 rounded-lg px-4 py-3 flex items-center gap-3">
                <span className={`text-xs font-bold w-6 shrink-0 ${ci.type === 'skip' ? 'text-red-400' : 'text-green-400'}`}>
                  #{ci.stopNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ci.name}</p>
                  <p className="text-gray-500 text-xs">{ci.checkinTimeLocal}</p>
                </div>
                {ci.type === 'skip' && (
                  <span className="text-red-500 text-xs font-bold shrink-0">SKIP</span>
                )}
                {ci.deltaMin != null && ci.type === 'checkin' && (
                  <span className={`text-xs shrink-0 ${ci.deltaMin <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ci.deltaMin <= 0 ? `+${Math.abs(Math.round(ci.deltaMin))}m` : `-${Math.round(ci.deltaMin)}m`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
