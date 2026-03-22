import { useCallback } from 'react'
import { nanoid } from 'nanoid'
import PaceHeader from '../components/PaceHeader'
import CurrentStopCard from '../components/CurrentStopCard'
import UpcomingStops from '../components/UpcomingStops'
import CheckInButton from '../components/CheckInButton'
import NavigateButton from '../components/NavigateButton'
import { useRoute } from '../hooks/useRoute'
import { useCheckIns } from '../hooks/useCheckIns'
import { useWakeLock } from '../hooks/useWakeLock'

export default function Runner({ session, onToggleDark }) {
  const { stops, currentStop, currentStopIndex, nextStops, advance, goBack } = useRoute()
  const { checkIns, addCheckIn, removeLastCheckIn, pendingSync, completedCount } = useCheckIns()

  useWakeLock(true)

  const handleCheckIn = useCallback((record) => {
    if (record.type === 'undo') {
      // Undo: remove last check-in and go back a stop
      removeLastCheckIn()
      goBack()
      return
    }
    addCheckIn(record)
    advance()
  }, [addCheckIn, removeLastCheckIn, advance, goBack])

  if (!currentStop) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2">Route Complete!</h2>
        <p className="text-gray-400">All {stops.length} stops visited.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <PaceHeader
        session={session}
        checkIns={checkIns}
        pendingSync={pendingSync}
        totalStops={stops.length}
        onToggleDark={onToggleDark}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        <CurrentStopCard stop={currentStop} totalStops={stops.length} />
        <UpcomingStops stops={nextStops} />
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-4 space-y-3">
        <CheckInButton
          stop={currentStop}
          session={session}
          onCheckIn={handleCheckIn}
        />
        <NavigateButton stop={currentStop} />
      </div>
    </div>
  )
}
