import { useSearchParams } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import RouteMap from '../components/RouteMap'
import CrewSidebar from '../components/CrewSidebar'
import { useCrewSession } from '../hooks/useCrewSession'
import { db, isFirebaseConfigured } from '../lib/firebase'
import route from '../data/route.json'

function HamburgerRain({ burgers }) {
  if (!burgers.length) return null
  return (
    <>
      <style>{`
        @keyframes burger-fall {
          0%   { transform: translateY(-60px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {burgers.map(b => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: 0,
              fontSize: `${b.size}rem`,
              '--rot': `${b.rotation}deg`,
              animation: `burger-fall ${b.duration}s ease-in forwards`,
            }}
          >
            🍔
          </div>
        ))}
      </div>
    </>
  )
}

export default function Crew() {
  const [params] = useSearchParams()
  const sessionId = params.get('session')
  const [burgers, setBurgers] = useState([])
  const idRef = useRef(0)

  const { session, checkIns, loading, error } = useCrewSession(sessionId)

  const giveHamburger = useCallback(async () => {
    const newBurgers = Array.from({ length: 12 }, () => ({
      id: idRef.current++,
      x: Math.random() * 90 + 5,
      duration: 1.5 + Math.random() * 1.5,
      size: 1.5 + Math.random(),
      rotation: Math.random() * 360,
    }))
    setBurgers(prev => [...prev, ...newBurgers])
    setTimeout(() => {
      setBurgers(prev => prev.filter(b => !newBurgers.find(nb => nb.id === b.id)))
    }, 3500)

    if (isFirebaseConfigured && sessionId) {
      try {
        await updateDoc(doc(db, 'sessions', sessionId), {
          hamburgerCount: increment(1),
        })
      } catch {}
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading session…</p>
      </div>
    )
  }

  if (error === 'pending') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <p className="text-2xl mb-2">⏳</p>
        <h2 className="text-xl font-bold mb-1">Waiting for World Record attempt to start</h2>
        <p className="text-gray-400 text-sm">This page will update automatically on 4/11 at 6am.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  const hamburgerCount = session?.hamburgerCount ?? 0

  return (
    <div className="h-screen flex overflow-hidden bg-gray-950">
      <HamburgerRain burgers={burgers} />

      {/* Map — left 2/3 */}
      <div className="flex-1 relative">
        <RouteMap checkIns={checkIns} />
      </div>

      {/* Sidebar — right 1/3 */}
      <div className="w-80 shrink-0 border-l border-gray-800 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <CrewSidebar
            session={session}
            checkIns={checkIns}
            totalStops={route.length}
          />
        </div>

        {/* Hamburger button */}
        <div className="p-4 border-t border-gray-800 flex flex-col items-center gap-2">
          <button
            onClick={giveHamburger}
            className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-bold py-3 rounded-xl text-lg transition-all"
          >
            Give a 🍔
          </button>
          {hamburgerCount > 0 && (
            <p className="text-gray-400 text-sm">
              🍔 × {hamburgerCount.toLocaleString()} given
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
