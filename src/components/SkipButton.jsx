import { useState } from 'react'
import { nanoid } from 'nanoid'

export default function SkipButton({ stop, session, onSkip }) {
  const [confirming, setConfirming] = useState(false)

  if (!stop) return null

  function handleConfirm() {
    const now = new Date()
    const checkinMin = now.getHours() * 60 + now.getMinutes()

    const record = {
      id: nanoid(),
      stopNumber: stop.stop_number,
      name: stop.name,
      address: stop.address,
      city: stop.city,
      state: stop.state,
      zip: stop.zip,
      plannedEtaMin: stop.arrival_min,
      checkinTime: now.toISOString(),
      checkinTimeLocal: now.toLocaleTimeString(),
      checkinMin,
      gpsLat: null,
      gpsLon: null,
      deltaMin: checkinMin - stop.arrival_min,
      gwr_flag: stop.gwr_flag,
      synced: false,
      type: 'skip',
      notes: 'Skipped',
    }

    setConfirming(false)
    onSkip(record)
  }

  if (confirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-8">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-full max-w-sm space-y-4">
          <p className="text-white font-semibold text-center">
            Skip {stop.name}?
          </p>
          {stop.gwr_flag && (
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ This is a GWR borderline stop — skipping will be flagged.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 bg-gray-800 text-white font-medium py-3 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl"
            >
              Yes, Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-5 py-4 rounded-xl text-sm whitespace-nowrap min-h-[56px]"
    >
      Skip →
    </button>
  )
}
