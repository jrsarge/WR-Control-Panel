import { useCallback, useState, useEffect, useRef } from 'react'
import PaceHeader from '../components/PaceHeader'
import HamburgerRain from '../components/HamburgerRain'
import CurrentStopCard from '../components/CurrentStopCard'
import UpcomingStops from '../components/UpcomingStops'
import CheckInButton from '../components/CheckInButton'
import NavigateButton from '../components/NavigateButton'
import CrewShareCard from '../components/CrewShareCard'
import SkipButton from '../components/SkipButton'
import MiniMap from '../components/MiniMap'
import Summary from './Summary'
import { useRoute } from '../hooks/useRoute'
import { useCheckIns } from '../hooks/useCheckIns'
import { useWakeLock } from '../hooks/useWakeLock'
import { usePace } from '../hooks/usePace'
import { generateCSV } from '../lib/export'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'

export default function Runner({ session }) {
  const { stops, currentStop, nextStops, advance, goBack } = useRoute(session?.sessionId)
  const { checkIns, addCheckIn, removeLastCheckIn, pendingSync } = useCheckIns(session?.sessionId)
  const { elapsedSeconds } = usePace(session, checkIns)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [ended, setEnded] = useState(false)
  const [showEndWarning, setShowEndWarning] = useState(false)
  const [burgers, setBurgers] = useState([])
  const burgerIdRef = useRef(0)
  const lastHamburgerCount = useRef(null)

  useEffect(() => {
    if (!isFirebaseConfigured || !session?.sessionId) return
    return onSnapshot(doc(db, 'sessions', session.sessionId), snap => {
      if (!snap.exists()) return
      const count = snap.data().hamburgerCount ?? 0
      if (lastHamburgerCount.current !== null && count > lastHamburgerCount.current) {
        const newBurgers = Array.from({ length: 100 }, () => ({
          id: burgerIdRef.current++,
          x: Math.random() * 90 + 5,
          duration: 1.5 + Math.random() * 1.5,
          size: 1.5 + Math.random(),
          rotation: Math.random() * 360,
        }))
        setBurgers(prev => [...prev, ...newBurgers])
        setTimeout(() => {
          setBurgers(prev => prev.filter(b => !newBurgers.find(nb => nb.id === b.id)))
        }, 3500)
      }
      lastHamburgerCount.current = count
    })
  }, [session?.sessionId])

  useWakeLock(true)

  // Auto-end when 24 hours have elapsed
  const sessionOver = elapsedSeconds >= 86400
  const showSummary = ended || sessionOver

  const handleCheckIn = useCallback((record) => {
    if (record.type === 'undo') {
      removeLastCheckIn()
      goBack()
      return
    }
    addCheckIn(record)
    advance()
  }, [addCheckIn, removeLastCheckIn, advance, goBack])

  const handleSkip = useCallback((record) => {
    addCheckIn(record)
    advance()
  }, [addCheckIn, advance])

  if (showSummary) {
    return <Summary session={session} checkIns={checkIns} elapsedSeconds={elapsedSeconds} />
  }

  if (!currentStop) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2">Route Complete!</h2>
        <p className="text-gray-400">All {stops.length} stops visited.</p>
        <button
          onClick={() => setEnded(true)}
          className="mt-6 bg-green-600 text-white font-bold px-6 py-3 rounded-xl"
        >
          View Summary
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <HamburgerRain burgers={burgers} />
      <PaceHeader
        session={session}
        checkIns={checkIns}
        pendingSync={pendingSync}
        totalStops={stops.length}
        onMenuOpen={() => setDrawerOpen(true)}
      />

      <div className="relative z-[10] flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-52">
        <CurrentStopCard stop={currentStop} totalStops={stops.length} />
        <MiniMap currentStop={currentStop} nextStop={nextStops[0] ?? null} />
        <UpcomingStops stops={nextStops} />
      </div>

      {/* Fixed bottom action bar — z-[1000] to sit above Leaflet's internal z-indices */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-4 space-y-3 z-[1000]">
        <CheckInButton
          stop={currentStop}
          session={session}
          onCheckIn={handleCheckIn}
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <NavigateButton stop={currentStop} />
          </div>
          <SkipButton stop={currentStop} session={session} onSkip={handleSkip} />
        </div>
      </div>

      {/* End attempt warning modal */}
      {showEndWarning && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowEndWarning(false)} />
          <div className="relative bg-gray-900 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-white text-lg font-bold">Download your CSV first</h2>
            <p className="text-gray-400 text-sm">
              Make sure you've saved the evidence CSV before ending the attempt. Once ended, you won't be prompted again.
            </p>
            <button
              onClick={() => generateCSV(checkIns, session)}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm"
            >
              Download CSV
            </button>
            <button
              onClick={() => { setShowEndWarning(false); setEnded(true) }}
              className="w-full bg-red-900 hover:bg-red-800 text-white font-medium py-3 rounded-xl text-sm"
            >
              End Attempt Anyway
            </button>
            <button
              onClick={() => setShowEndWarning(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[2000] flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-gray-950 h-full overflow-y-auto px-4 py-6 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Settings</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <CrewShareCard session={session} />
            <button
              onClick={() => generateCSV(checkIns, session)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl text-sm"
            >
              Export Evidence CSV
            </button>
            <button
              onClick={() => setShowEndWarning(true)}
              className="w-full bg-red-900 hover:bg-red-800 text-white font-medium py-3 rounded-xl text-sm"
            >
              End Attempt
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all session data? This cannot be undone.')) {
                  localStorage.removeItem('gwr_session')
                  localStorage.removeItem('gwr_checkins')
                  localStorage.removeItem('gwr_route_index')
                  window.location.reload()
                }
              }}
              className="w-full bg-red-900 hover:bg-red-800 text-white text-sm font-medium py-2.5 rounded-lg"
            >
              Reset (Dev)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
