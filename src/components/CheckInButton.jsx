import { useState, useRef, useCallback } from 'react'
import { nanoid } from 'nanoid'

export default function CheckInButton({ stop, session, onCheckIn }) {
  const [flashing, setFlashing] = useState(false)
  const [showUndo, setShowUndo] = useState(false)
  const lastTapRef = useRef(0)
  const undoTimerRef = useRef(null)

  const handleCheckIn = useCallback(() => {
    const now = Date.now()
    // Double-tap protection: ignore if within 2 seconds
    if (now - lastTapRef.current < 2000) return
    lastTapRef.current = now

    const checkinDate = new Date()
    const checkinMin = checkinDate.getHours() * 60 + checkinDate.getMinutes()
    const deltaMin = checkinMin - stop.arrival_min

    // GPS — non-blocking
    let gpsLat = null
    let gpsLon = null
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          // GPS captured async — record is already saved; this is best-effort
          gpsLat = pos.coords.latitude
          gpsLon = pos.coords.longitude
        },
        () => {},
        { timeout: 3000 }
      )
    }

    const record = {
      id: nanoid(),
      stopNumber: stop.stop_number,
      name: stop.name,
      address: stop.address,
      city: stop.city,
      state: stop.state,
      zip: stop.zip,
      plannedEtaMin: stop.arrival_min,
      checkinTime: checkinDate.toISOString(),
      checkinTimeLocal: checkinDate.toLocaleTimeString(),
      checkinMin,
      gpsLat,
      gpsLon,
      deltaMin,
      gwr_flag: stop.gwr_flag,
      synced: false,
      type: 'checkin',
    }

    onCheckIn(record)

    // Flash animation
    setFlashing(true)
    setTimeout(() => setFlashing(false), 300)

    // Undo toast
    setShowUndo(true)
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 10000)
  }, [stop, onCheckIn])

  return (
    <div className="relative">
      <button
        onClick={handleCheckIn}
        className={`w-full font-bold rounded-2xl text-xl flex items-center justify-center gap-2 transition-all min-h-[80px] select-none
          ${flashing
            ? 'bg-green-300 text-green-900 scale-95'
            : 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white'
          }`}
      >
        ✓ Checked In
      </button>

      {showUndo && (
        <div className="absolute -top-14 left-0 right-0 flex justify-center">
          <button
            onClick={() => {
              setShowUndo(false)
              clearTimeout(undoTimerRef.current)
              // parent handles undo via callback
              onCheckIn({ type: 'undo' })
            }}
            className="bg-gray-800 border border-gray-600 text-white text-sm font-medium px-5 py-2 rounded-full shadow-lg"
          >
            Undo check-in
          </button>
        </div>
      )}
    </div>
  )
}
